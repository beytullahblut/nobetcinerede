import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

const connectionString = "postgresql://neondb_owner:npg_EACsmoV59jHK@ep-square-base-a2zeqq2g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface BusinessItem {
  name: string;
  slug: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  note: string;
  rating?: number;          // Yeni eklendi
  userRatingCount?: number; // Yeni eklendi
  googleMapsUri?: string;   // Yeni eklendi
  categoryName: string;
}

function getCategoryType(categoryName: string) {
  if (categoryName.includes('Çilingir')) return 'CILINGIR';
  if (categoryName.includes('Veteriner')) return 'VETERINER';
  if (categoryName.includes('Lastikçi')) return 'OTO_LASTIK';
  if (categoryName.includes('Çekici')) return 'OTO_CEKICI';
  return 'DIS_KLINIGI';
}

async function main() {
  console.log('🔄 Tüm grupların veritabanı aktarımı başlatılıyor...');

  // İşlenecek grup dosyaları
  const groups = ['grup1_firmalar', 'grup2_firmalar', 'grup3_firmalar', 'grup4_firmalar'];
  
  // 1. En başta veritabanındaki tüm eski kayıtları bir kez temizleyelim
  console.log('🧹 Eski tüm Place kayıtları veritabanından temizleniyor...');
  await prisma.place.deleteMany({});

  let totalSuccessCount = 0;
  const categoriesMap = new Map<string, string>();

  for (const groupName of groups) {
    const jsonPath = path.join(__dirname, `../data/cities/${groupName}.json`);
    
    if (!fs.existsSync(jsonPath)) {
      console.log(`⚠️ Dosya bulunamadı, atlanıyor: ${groupName}.json`);
      continue;
    }

    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const businesses: BusinessItem[] = JSON.parse(rawData);
    console.log(`📦 ${groupName}.json dosyasından ${businesses.length} adet kayıt okundu.`);

    for (const b of businesses) {
      // Kategoriyi kontrol et / oluştur
      let categoryId = categoriesMap.get(b.categoryName);
      if (!categoryId) {
        const typeEnum: any = getCategoryType(b.categoryName);
        const slug = b.categoryName.toLowerCase()
          .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
          .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

        let category = await prisma.category.findUnique({ where: { slug } });
        if (!category) {
          category = await prisma.category.create({
            data: { name: b.categoryName, slug, type: typeEnum }
          });
        }
        categoryId = category.id;
        categoriesMap.set(b.categoryName, categoryId);
      }

      try {
        await prisma.place.create({
          data: {
            name: b.name,
            slug: b.slug,
            phone: b.phone,
            address: b.address,
            city: b.city,
            district: b.district,
            note: b.note,
            rating: b.rating || 0,                 // Google Puanı aktarılıyor
            userRatingCount: b.userRatingCount || 0, // Toplam değerlendirme sayısı aktarılıyor
            googleMapsUri: b.googleMapsUri || '',   // Google Maps harita / yorum linki aktarılıyor
            is24Seven: true,
            isVerified: false,
            categoryId: categoryId
          }
        });
        totalSuccessCount++;
      } catch (err: any) {
        // Slug çakışması olmasın diye benzersizlik hatası basarsa geçebilir veya loglayabilir
      }
    }
    console.log(`✅ ${groupName} başarıyla işlendi.`);
  }

  console.log(`\n🎉 İşlem Tamam! Toplam ${totalSuccessCount} adet işletme veritabanına aktarıldı.`);
}

main()
  .catch((e) => {
    console.error('❌ Aktarım sırasında hata oluştu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });