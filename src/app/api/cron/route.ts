import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  // 1. Güvenlik Kontrolü
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 2. Proje içindeki data klasöründen verileri okuma
    // Vercel'de process.cwd() proje kök dizinini verir
    const dataDir = path.join(process.cwd(), 'data', 'cities');
    const files = fs.readdirSync(dataDir);

    let updatedCount = 0;
    let createdCount = 0;

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(dataDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const placesData = JSON.parse(fileContent);

        // 3. Upsert İşlemi
        for (const item of placesData) {
          await prisma.place.upsert({
            where: { slug: item.slug },
            update: {
              name: item.name,
              phone: item.phone,
              address: item.address,
              city: item.city,
              district: item.district,
              rating: item.rating,
              googleMapsUri: item.googleMapsUri,
              categoryId: item.categoryId,
            },
            create: {
              name: item.name,
              slug: item.slug,
              phone: item.phone,
              address: item.address,
              city: item.city,
              district: item.district,
              categoryId: item.categoryId,
              isVerified: false,
            },
          });
          updatedCount++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Veriler yerel dosyadan başarıyla güncellendi.',
      totalProcessed: updatedCount 
    });

  } catch (error: any) {
    console.error('Cron Hata:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}