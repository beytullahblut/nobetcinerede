import { PrismaClient, CategoryType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import fs from "fs";
import path from "path";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 81 İl ve İlçeler İçin Mekan Verileri Yükleniyor...");

  // 1. Önce bağımlı tabloları temizleyelim
  await prisma.placeRequest.deleteMany({});
  await prisma.place.deleteMany({});
  await prisma.category.deleteMany({});

  // 2. Kategorileri oluşturalım
  const categories = [
    { id: "acil-veteriner", name: "7/24 Acil Veteriner", slug: "acil-veteriner", type: CategoryType.VETERINER },
    { id: "cilingir", name: "7/24 Nöbetçi Çilingir", slug: "cilingir", type: CategoryType.CILINGIR },
    { id: "oto-lastik", name: "7/24 Oto Lastikçi", slug: "oto-lastik", type: CategoryType.OTO_LASTIK },
    { id: "oto-cekici", name: "7/24 Oto Çekici", slug: "oto-cekici", type: CategoryType.OTO_CEKICI },
    { id: "dis-klinigi", name: "Acil Diş Kliniği", slug: "dis-klinigi", type: CategoryType.DIS_KLINIGI },
  ];

  for (const cat of categories) {
    await prisma.category.create({
      data: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        type: cat.type,
      },
    });
  }

  // 3. JSON dosyalarını okuyalım (Yol: src/data/)
  const ilPath = path.join(__dirname, "../src/data/il.json");
  const ilcePath = path.join(__dirname, "../src/data/ilce.json");

  const rawIlFile = JSON.parse(fs.readFileSync(ilPath, "utf-8"));
  const rawIlceFile = JSON.parse(fs.readFileSync(ilcePath, "utf-8"));

  const extractData = (fileContent: any) => {
    if (Array.isArray(fileContent)) {
      const tableObj = fileContent.find((item: any) => item && item.data && Array.isArray(item.data));
      if (tableObj) return tableObj.data;
      return fileContent;
    }
    if (fileContent && Array.isArray(fileContent.data)) {
      return fileContent.data;
    }
    return [];
  };

  const iller = extractData(rawIlFile);
  const ilceler = extractData(rawIlceFile);

  const ilMap = new Map<string | number, string>();
  iller.forEach((il: any) => {
    const ilId = il.id ?? il.sehir_id ?? il.plakaKodu ?? il.key;
    const ilName = il.name ?? il.ilAdi ?? il.sehirAdi;
    if (ilId !== undefined && ilName) {
      ilMap.set(ilId, ilName);
      ilMap.set(String(ilId), ilName);
      ilMap.set(Number(ilId), ilName);
    }
  });

  console.log(`📍 ${iller.length} il ve ${ilceler.length} ilçe işleniyor...`);

  const placesData: any[] = [];
  let skippedCount = 0;

  // 4. Tüm mekan verilerini bellekte hazırlayalım
  for (const ilce of ilceler) {
    const targetIlId = ilce.il_id ?? ilce.ilId ?? ilce.sehir_id ?? ilce.cityId ?? ilce.ilID;
    const cityName = targetIlId !== undefined ? ilMap.get(targetIlId) : undefined;
    
    const districtName = ilce.name ?? ilce.ilceAdi ?? ilce.districtName ?? ilce.title;

    if (!cityName || !districtName) {
      skippedCount++;
      continue;
    }

    for (const cat of categories) {
      const placeName = `${districtName} ${cat.name}`;
      const slugBase = `${cityName}-${districtName}-${cat.slug}`
        .toLowerCase()
        .replace(/[^a-z0-9-çğıöşü]/g, "-")
        .replace(/-+/g, "-");
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      const slug = `${slugBase}-${randomSuffix}`;

      const phonePrefix = Math.floor(Math.random() * 800 + 200);

      placesData.push({
        name: placeName,
        slug: slug,
        city: cityName,
        district: districtName,
        address: `${districtName} Merkez Mah. Ana Cad. No:${Math.floor(Math.random() * 100 + 1)}`,
        phone: `0${phonePrefix} 555 ${Math.floor(Math.random() * 9000 + 1000)}`,
        categoryId: cat.id,
        is24Seven: true,
        isVerified: false,
        note: "Sistem tarafından otomatik eklenen örnek işletme kaydı.",
      });
    }
  }

  if (skippedCount > 0) {
    console.warn(`⚠️ Toplam ${skippedCount} adet ilçe veri yapısı uyuşmazlığı nedeniyle atlandı.`);
  }

  console.log(`🚀 ${placesData.length} adet mekan veritabanına toplu olarak gönderiliyor...`);

  // 5. Bağlantıyı koparmamak için verileri 500'erli gruplar halinde toplu kaydedelim (Batch insert)
  const batchSize = 500;
  for (let i = 0; i < placesData.length; i += batchSize) {
    const batch = placesData.slice(i, i + batchSize);
    await prisma.place.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }

  console.log(`✅ Başarıyla ${placesData.length} adet mekan veritabanına eklendi!`);
}

main()
  .catch((e) => {
    console.error("Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });