import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const dataDir = path.join(process.cwd(), 'data', 'cities');
    const files = fs.readdirSync(dataDir);

    let updatedCount = 0;

    // 1. Tüm kategorileri tek sorguda hafızaya (map) çekelim ki döngüde DB'yi boğmayalım
    const existingCategories = await prisma.category.findMany();
    const categoryMap = new Map(existingCategories.map(c => [c.slug, c.id]));

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const filePath = path.join(dataDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const placesData = JSON.parse(fileContent);

      for (const item of placesData) {
        let categoryId = item.categoryId;

        if (!categoryId && item.categoryName) {
          const categorySlug = item.categoryName
            .toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'o') // uyarlandı
            .replace(/[^a-z0-9]/g, '-');

          if (categoryMap.has(categorySlug)) {
            categoryId = categoryMap.get(categorySlug);
          } else {
            // Kategori yoksa oluşturalım ve havuza ekleyelim
            const newCat = await prisma.category.create({
              data: {
                name: item.categoryName,
                slug: categorySlug,
                type: 'OTO_CEKICI',
              },
            });
            categoryId = newCat.id;
            categoryMap.set(categorySlug, categoryId);
          }
        }

        if (!categoryId) continue;

        // 2. Upsert İşlemini hızlandırılmış şekilde yapıyoruz
        await prisma.place.upsert({
          where: { slug: item.slug },
          update: {
            name: item.name,
            phone: item.phone,
            address: item.address,
            city: item.city,
            district: item.district,
            rating: item.rating,
            userRatingCount: item.userRatingCount,
            googleMapsUri: item.googleMapsUri,
            note: item.note,
            categoryId: categoryId,
          },
          create: {
            name: item.name,
            slug: item.slug,
            phone: item.phone,
            address: item.address,
            city: item.city,
            district: item.district,
            rating: item.rating,
            userRatingCount: item.userRatingCount,
            googleMapsUri: item.googleMapsUri,
            note: item.note,
            categoryId: categoryId,
            isVerified: false,
          },
        });
        updatedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Veriler ve kategoriler başarıyla senkronize edildi.',
      totalProcessed: updatedCount 
    });

  } catch (error: any) {
    console.error('Cron Hata:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}