// test-import.ts
import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Hata: DATABASE_URL tanımlı değil veya .env dosyası okunamadı!");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function generateSlug(text: string): string {
  const trMap: { [key: string]: string } = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return text
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (match) => trMap[match])
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const CITIES = ["Bursa"];
const CATEGORIES = [
  { keyword: "oto çekici", categoryName: "7/24 Oto Çekici", categorySlug: "oto-cekici", type: "OTO_CEKICI" as any },
  { keyword: "çilingir", categoryName: "Nöbetçi Çilingir", categorySlug: "cilingir", type: "CILINGIR" as any }
];

async function testImport() {
  console.log("🧪 Yerel test veri aktarımı başlatıldı...");

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error("❌ Hata: GOOGLE_PLACES_API_KEY tanımlı değil!");
    return;
  }

  for (const city of CITIES) {
    for (const cat of CATEGORIES) {
      let categoryRecord = await prisma.category.findUnique({
        where: { slug: cat.categorySlug },
      });

      if (!categoryRecord) {
        console.log(`✨ Kategori oluşturuluyor: ${cat.categoryName}`);
        categoryRecord = await prisma.category.create({
          data: {
            name: cat.categoryName,
            slug: cat.categorySlug,
            type: cat.type,
          },
        });
      }

      const query = `${city} 7/24 ${cat.keyword}`;
      console.log(`🔍 Google Places Sorgulanıyor: ${query}`);

      try {
        // 1. Aşama: Text Search ile mekanların Place ID'lerini bulma
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}&language=tr`;

        const response = await fetch(searchUrl);
        const data = await response.json();

        console.log(`📦 Google'dan gelen sonuç status: ${data.status}`);
        console.log(`📦 Bulunan sonuç sayısı: ${data.results?.length || 0}`);

        if (data.status === "OK" && data.results && Array.isArray(data.results)) {
          for (const place of data.results) {
            const name = place.name;
            const address = place.formatted_address || "Adres belirtilmemiş";
            const lat = place.geometry?.location?.lat || null;
            const lng = place.geometry?.location?.lng || null;
            const placeId = place.place_id; // Detay için gerekli

            let phone = "Belirtilmemiş";

            // 2. Aşama: Her mekanın Place ID'si ile telefon numarasını çekme (Place Details API)
            if (placeId) {
              const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,international_phone_number&key=${apiKey}&language=tr`;
              const detailsResponse = await fetch(detailsUrl);
              const detailsData = await detailsResponse.json();

              if (detailsData.status === "OK" && detailsData.result) {
                phone = detailsData.result.formatted_phone_number || detailsData.result.international_phone_number || "Belirtilmemiş";
              }
            }

            if (name) {
              const baseSlug = generateSlug(`${city}-${name}`);
              const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

              const existing = await prisma.place.findFirst({ where: { name, city } });

              if (!existing) {
                await prisma.place.create({
                  data: {
                    name,
                    slug,
                    phone,
                    address,
                    city,
                    district: city,
                    latitude: lat,
                    longitude: lng,
                    is24Seven: true,
                    isVerified: false,
                    categoryId: categoryRecord.id,
                  },
                });
                console.log(`✅ Eklendi: ${name} (${phone})`);
              } else {
                console.log(`ℹ️ Zaten mevcut: ${name}`);
              }
            }
          }
        } else {
          console.log(`⚠️ Sonuç bulunamadı veya API Hatası. Durum:`, data.status, data.error_message || "");
        }
      } catch (error) {
        console.error(`❌ Hata oluştu (${query}):`, error);
      }
    }
  }

  console.log("🏁 Test aktarım süreci tamamlandı!");
}

testImport()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });