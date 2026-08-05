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

      const query = `${city} ${cat.keyword}`;
      console.log(`🔍 Google Places Sorgulanıyor: ${query}`);

      try {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
          console.error("❌ Hata: GOOGLE_PLACES_API_KEY tanımlı değil!");
          return;
        }

        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}&language=tr`;

        const response = await fetch(url);
        const data = await response.json();

        // 🔍 Google'ın döndürdüğü ham yanıtı detaylı görmek için eklendi:
        console.log("🌐 Google API Ham Yanıtı:", JSON.stringify(data, null, 2));

        console.log(`📦 Google'dan gelen sonuç sayısı: ${data.results?.length || 0}`);

        if (data.results && Array.isArray(data.results)) {
          for (const place of data.results) {
            const name = place.name;
            const address = place.formatted_address || "Adres belirtilmemiş";
            const phone = "Belirtilmemiş"; 
            const lat = place.geometry?.location?.lat || null;
            const lng = place.geometry?.location?.lng || null;

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
                console.log(`✅ Eklendi: ${name}`);
              } else {
                console.log(`ℹ️ Zaten mevcut: ${name}`);
              }
            }
          }
        } else {
          console.log(`⚠️ Sonuç bulunamadı. API Yanıtı status:`, data.status);
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