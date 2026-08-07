import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      type,       // "CREATE", "UPDATE", "DELETE"
      name,
      phone,
      address,
      city,
      district,
      categoryId,
      note,
      placeId,    // UPDATE veya DELETE işleminde güncellenecek işletmenin ID'si
    } = body;

    // 1. İşlem tipine göre dinamik zorunlu alan kontrolü
    if (!type) {
      return NextResponse.json(
        { error: "İşlem tipi (type) eksik." },
        { status: 400 }
      );
    }

    // Eğer işlem DELETE ise sadece placeId zorunludur
    if (type === "DELETE") {
      if (!placeId) {
        return NextResponse.json(
          { error: "Silinecek işletme ID'si (placeId) eksik." },
          { status: 400 }
        );
      }
    } else {
      // CREATE veya UPDATE için genel alanlar zorunludur
      if (!name || !phone || !address || !city || !district) {
        return NextResponse.json(
          { error: "Zorunlu alanlar eksik." },
          { status: 400 }
        );
      }
    }

    // 1. Arka Planda Adresi Koordinata Çevirme (Geocoding - OpenStreetMap Nominatim)
    let latitude: number | null = null;
    let longitude: number | null = null;

    // DELETE işleminde adrese gerek olmadığı için geocoding'i atlayabiliriz
    if (type !== "DELETE") {
      try {
        const fullAddressQuery = `${address}, ${district}, ${city}, Türkiye`;
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            fullAddressQuery
          )}`,
          {
            headers: {
              "User-Agent": "DurustevApp/1.0",
            },
          }
        );
        const geoData = await geoRes.json();

        if (geoData && geoData.length > 0) {
          latitude = parseFloat(geoData[0].lat);
          longitude = parseFloat(geoData[0].lon);
        }
      } catch (geoError) {
        console.error("Geocoding dönüştürme hatası:", geoError);
      }
    }

    // 2. Doğrudan Yeni İşletme Ekleme (CREATE)
    if (type === "CREATE") {
      const targetCategoryId = categoryId || "acil-veteriner";
      
      let category = await prisma.category.findUnique({
        where: { id: targetCategoryId },
      });

      if (!category) {
        const categoryConfig: Record<string, { name: string; type: any }> = {
          "acil-veteriner": { name: "Acil Veteriner", type: "VETERINER" },
          "nobetci-cilingir": { name: "Nöbetçi Çilingir", type: "CILINGIR" },
          "7-24-oto-lastikci": { name: "7/24 Oto Lastikçi", type: "OTO_LASTIK" },
          "acil-dis-klinigi": { name: "Acil Diş Kliniği", type: "DIS_KLINIGI" },
        };

        const config = categoryConfig[targetCategoryId] || { name: targetCategoryId, type: "VETERINER" };

        category = await prisma.category.create({
          data: {
            id: targetCategoryId,
            name: config.name,
            slug: targetCategoryId,
            type: config.type,
          },
        });
      }

      // Slug üretimi
      const slugBase = name
        .toLowerCase()
        .replace(/[^a-z0-9-çğıöşü]/g, "-")
        .replace(/-+/g, "-");
      const slug = `${slugBase}-${Date.now()}`;

      const newPlace = await prisma.place.create({
        data: {
          name,
          slug,
          phone,
          address,
          city,
          district,
          latitude,
          longitude,
          note: note || null,
          categoryId: category.id,
        },
      });

      return NextResponse.json(
        { message: "İşletme başarıyla oluşturuldu.", data: newPlace },
        { status: 201 }
      );
    }

    // 3. Güncelleme / Silme veya Onay Bekleyen Talep Oluşturma (PlaceRequest)
    // DELETE işleminde name, phone vb. alanlar boş geleceği için undefined yerine null gitmesini sağlıyoruz.
    const newRequest = await prisma.placeRequest.create({
      data: {
        type,
        status: "PENDING",
        placeId: placeId || null,
        name: name || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        district: district || null,
        categoryId: categoryId || null,
        note: note || null,
      },
    });

    return NextResponse.json(
      { message: "Talebiniz başarıyla alındı.", data: newRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası meydana geldi." },
      { status: 500 }
    );
  }
}