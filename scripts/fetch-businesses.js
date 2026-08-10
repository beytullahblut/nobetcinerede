const fs = require('fs');
const path = require('path');

// Yeni oluşturduğunuz Google Places API anahtarınız
const API_KEY = 'AIzaSyC6t6Yf34ou-GBTrWyMhX9kix5XzgGbBj4';

const activeGroup = 'grup4';

const cityGroups = {
  grup1: ["Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce"],
  grup2: ["Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kilis", "Kırıkkale", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya"],
  grup3: ["Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Şanlıurfa"],
  grup4: ["Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"]
};

const targetCities = cityGroups[activeGroup];

function generateSlug(text) {
  return (text || 'isimsiz').toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 7);
}

// Google Places API (New) Text Search ile arama yapma fonksiyonu
async function searchPlacesWithAPI(query) {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      // Google Puan, Değerlendirme Sayısı ve Harita Linki alanları FieldMask'e eklendi
      'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.shortFormattedAddress,places.nationalPhoneNumber,places.addressComponents,places.location,places.rating,places.userRatingCount,places.googleMapsUri'
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: 'tr'
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data.places || [];
}

// Adres bileşenlerinden il ve ilçeyi güvenli bir şekilde ayıklama
function extractCityAndDistrict(addressComponents, fallbackCity) {
  let city = fallbackCity;
  let district = 'Merkez';

  if (Array.isArray(addressComponents)) {
    for (const comp of addressComponents) {
      if (comp && Array.isArray(comp.types)) {
        if (comp.types.includes('administrative_area_level_1')) {
          city = comp.longText || city;
        }
        if (comp.types.includes('administrative_area_level_2')) {
          district = comp.longText || district;
        }
      }
    }
  }
  return { city, district };
}

async function runApiScraper() {
  console.log(`🚀 Google Places API ile ${activeGroup.toUpperCase()} taraması başlatılıyor...`);
  const groupResults = [];

  for (const city of targetCities) {
    const queries = [
      `${city} Nöbetçi Çilingir`, 
      `${city} Acil Veteriner`, 
      `${city} 7/24 Oto Lastikçi`, 
      `${city} 7/24 Oto Çekici`, 
      `${city} Acil Diş Kliniği`
    ];

    for (const query of queries) {
      console.log(`🔎 API Sorgulanıyor: ${query}`);
      try {
        const places = await searchPlacesWithAPI(query);

        for (const p of places) {
          const name = p.displayName?.text || 'İsimsiz İşletme';
          const address = p.formattedAddress || `${city} / Merkez`;
          const phone = p.nationalPhoneNumber || '05000000000';
          
          // İl ve ilçeyi güvenli etiket kontrolüyle alıyoruz
          const parsedLocation = extractCityAndDistrict(p.addressComponents, city);

          groupResults.push({
            name: name,
            slug: generateSlug(name),
            phone: phone,
            address: address,
            city: parsedLocation.city,
            district: parsedLocation.district,
            note: '7/24 Acil Hizmet',
            rating: p.rating || 0,                 // Google Puanı (Örn: 4.5)
            userRatingCount: p.userRatingCount || 0, // Toplam Yorum Sayısı (Örn: 50)
            googleMapsUri: p.googleMapsUri || '',   // Google Haritalar / Yorum Linki
            categoryName: query.includes('Çilingir') ? 'Nöbetçi Çilingir' :
                        query.includes('Veteriner') ? 'Acil Veteriner' :
                        query.includes('Lastikçi') ? '7/24 Oto Lastikçi' :
                        query.includes('Çekici') ? '7/24 Oto Çekici' : 'Acil Diş Kliniği'
          });
        }

        console.log(`   └─ Bulunan Kayıt: ${places.length}`);
        // İstekler arası bekleme
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (err) {
        console.error(`❌ Google API Hatası (${query}):`, err.message);
      }
    }
  }

  // Sonuçları JSON dosyasına kaydet
  const outputDir = path.join(__dirname, '../data/cities');
  if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${activeGroup}_firmalar.json`);
  fs.writeFileSync(outputPath, JSON.stringify(groupResults, null, 2), 'utf-8');
  console.log(`\n🎉 İşlem Tamam! Toplam Kayıt: ${groupResults.length}`);
}

runApiScraper().catch(console.error);