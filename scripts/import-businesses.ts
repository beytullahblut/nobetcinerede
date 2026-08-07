import 'dotenv/config'; // .env dosyasını okuması için en başta olmalı
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';

const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Hata: DATABASE_URL ortam değişkeni bulunamadı! Lütfen .env dosyanızı kontrol edin.");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });
const dataDir = path.join(process.cwd(), 'data', 'cities');

function generateSlug(text: string): string {
  const trMap: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u'
  };
  return text
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, match => trMap[match])
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function main() {
  try {
    if (!fs.existsSync(dataDir)) {
      console.error(`Hata: '${dataDir}' klasörü bulunamadı!`);
      return;
    }

    const categories = await prisma.category.findMany();
    const getCategoryIdByNameOrContent = (text: string): string | null => {
      const lower = text.toLowerCase();
      if (lower.includes('veteriner') || lower.includes('vet') || (lower.includes('klinik') && !lower.includes('diş'))) {
        return categories.find(c => c.type === 'VETERINER')?.id || null;
      }
      if (lower.includes('diş') || lower.includes('dental') || lower.includes('poliklinik') || lower.includes('hastanesi')) {
        return categories.find(c => c.type === 'DIS_KLINIGI')?.id || null;
      }
      if (lower.includes('çilingir') || lower.includes('anahtar') || lower.includes('kilit')) {
        return categories.find(c => c.type === 'CILINGIR')?.id || null;
      }
      if (lower.includes('lastik') || lower.includes('lastikçi')) {
        return categories.find(c => c.type === 'OTO_LASTIK')?.id || null;
      }
      if (lower.includes('çekici') || lower.includes('kurtarma') || lower.includes('yol yardım')) {
        return categories.find(c => c.type === 'OTO_CEKICI')?.id || null;
      }
      return categories[0]?.id || null;
    };

    const files = fs.readdirSync(dataDir);
    const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');

    console.log(`Toplam ${jsonFiles.length} adet JSON dosyası bulundu.`);

    for (const file of jsonFiles) {
      const filePath = path.join(dataDir, file);
      console.log(`İşleniyor: ${file}`);

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      let records: any[];
      try {
        records = JSON.parse(fileContent);
      } catch (parseError) {
        console.error(`Hata: '${file}' dosyası geçerli bir JSON formatında değil!`);
        continue;
      }

      if (!Array.isArray(records)) {
        console.warn(`Uyarı: '${file}' dosyası bir dizi içermiyor, atlanıyor.`);
        continue;
      }

      for (const item of records) {
        if (!item.name) continue;

        const slug = item.slug ? item.slug : generateSlug(item.name) + '-' + Math.random().toString(36).substring(2, 6);
        const categoryId = item.categoryId ? item.categoryId : getCategoryIdByNameOrContent(item.name + ' ' + (item.note || ''));

        if (!categoryId) {
          console.warn(`Kategori bulunamadı, atlanıyor: ${item.name}`);
          continue;
        }

        await prisma.place.upsert({
          where: { slug: slug },
          update: {
            name: item.name,
            phone: item.phone || '',
            address: item.address || '',
            city: item.city || 'Bilinmiyor',
            district: item.district || 'Bilinmiyor',
            note: item.note || null,
            categoryId: categoryId,
          },
          create: {
            name: item.name,
            slug: slug,
            phone: item.phone || '',
            address: item.address || '',
            city: item.city || 'Bilinmiyor',
            district: item.district || 'Bilinmiyor',
            note: item.note || null,
            categoryId: categoryId,
          },
        });
      }
      console.log(`${file} başarıyla aktarıldı.`);
    }

    console.log('Tüm veriler veritabanına başarıyla aktarıldı!');
  } catch (error) {
    console.error('Aktarım sırasında beklenmeyen bir hata oluştu:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();