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

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(dataDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const placesData = JSON.parse(fileContent);

        for (const item of placesData) {
          // 1. Önce categoryName'e ait kategori veritabanında var mı diye bulalım / oluşturalım
          let categoryId = item.categoryId;

          if (!categoryId && item.categoryName) {
            // Slug üretmek için basit bir yardımcı
            const categorySlug = item.categoryName
              .toLowerCase()
              .replace(/ğ/g, 'g')
              .replace(/ü/g, 'u')
              .replace(/ş/g, 's')
              .replace(/ı/g, 'i')
              .replace(/ö/g, 'o')
              .replace(/ç/g, 'c')
              .replace(/[^a-z0-9]/g, '-');

            let category = await prisma.category.findUnique({
              where: { slug: categorySlug },
            });

            if (!category) {
              // Eğer kategori yoksa otomatik oluşturalım
              category = await prisma.category.create({
                data: {
                  name: item.categoryName,
                  slug: categorySlug,
                  type: 'OTO_CEKICI', // Şemanızdaki CategoryType enum'ına göre varsayılan bir tür
                },
              });
            }
            categoryId = category.id;
          }

          if (!categoryId) {
            continue; // Kategori bulunamadıysa bu kaydı atla
          }

          // 2. Upsert İşlemi
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