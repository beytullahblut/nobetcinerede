const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Doğrudan çalıştırmak istediğiniz grubu buradan seçebilirsiniz ('grup1', 'grup2', 'grup3', 'grup4')
const activeGroup = 'grup1';

const cityGroups = {
  grup1: [
    "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın",
    "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale",
    "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce"
  ],
  grup2: [
    "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay",
    "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri",
    "Kilis", "Kırıkkale", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya"
  ],
  grup3: [
    "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye",
    "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Şanlıurfa"
  ],
  grup4: [
    "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
  ]
};

const targetCities = cityGroups[activeGroup];

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 7);
}

// Geliştirilmiş Akıllı İlçe Ayıklama Fonksiyonu
function extractDistrict(address, city) {
  if (!address) return 'Merkez';
  
  // 1. Yol: "İlçe/Şehir" veya "İlçe / Şehir" formatını arar
  const regexSlash = new RegExp(`([\\wÇĞİÖŞÜçğıöşü\\s]+)\\/\\s?${city}`, 'i');
  const matchSlash = address.match(regexSlash);
  
  if (matchSlash && matchSlash[1]) {
    const parts = matchSlash[1].trim().split(/[\s,]+/);
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart.toLowerCase() !== city.toLowerCase()) {
      return lastPart;
    }
  }
  
  // 2. Yol: Eğer slash yoksa, adres metninde şehir adını arayıp hemen öncesindeki kelimeyi alır
  const cleanAddress = address.replace(/[^\wÇĞİÖŞÜçğıöşü\s]/g, ' ');
  const words = cleanAddress.split(/\s+/).filter(Boolean);
  const cityIndex = words.findIndex(w => w.toLowerCase() === city.toLowerCase());
  
  if (cityIndex > 0) {
    const potentialDistrict = words[cityIndex - 1];
    // Eğer önceki kelime posta kodu (sayı) değilse ve şehir adının kendisi değilse ilçe kabul et
    if (potentialDistrict && !/^\d+$/.test(potentialDistrict) && potentialDistrict.toLowerCase() !== city.toLowerCase()) {
      return potentialDistrict;
    }
  }
  
  return 'Merkez';
}

async function scrapeGroup() {
  console.log(`🚀 ${activeGroup.toUpperCase()} için Google Maps Scraper başlatılıyor (${targetCities.length} il)...`);
  
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=tr-TR'] 
  });
  
  const page = await browser.newPage();
  const groupResults = [];

  for (const city of targetCities) {
    const categoryTemplates = [
      `${city} Nöbetçi Çilingir`,
      `${city} Acil Veteriner`,
      `${city} 7/24 Oto Lastikçi`,
      `${city} 7/24 Oto Çekici`,
      `${city} Acil Diş Kliniği`
    ];

    for (const query of categoryTemplates) {
      console.log(`🔎 Aratılıyor: ${query}`);
      const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
      
      try {
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 3000));

        const items = await page.evaluate(() => {
          const list = [];
          const elements = document.querySelectorAll('div[role="article"]');
          
          elements.forEach((el) => {
            const title = el.querySelector('div.fontHeadlineSmall')?.innerText || '';
            
            const categoryEl = el.querySelector('div.fontBodyMedium > div > span:first-child') || 
                               el.querySelector('div.fontBodyMedium span');
            const category = categoryEl?.innerText || '';

            const phone = el.innerText.match(/0\d{3}\s?\d{3}\s?\d{2}\s?\d{2}/)?.[0] || '';
            
            const textLines = el.innerText.split('\n').map(line => line.trim()).filter(Boolean);
            let address = '';
            let note = '';
            
            for (const line of textLines) {
              if (line !== title && line !== category && !line.includes('05') && !line.includes('⭐') && line.length > 10) {
                if (!address) {
                  address = line;
                } else if (!note) {
                  note = line;
                }
              }
            }
            
            if (title) {
              list.push({ title, category, phone, address, note });
            }
          });
          return list;
        });

        items.forEach(item => {
          let finalCategory = item.category;
          
          if (!finalCategory || finalCategory.trim() === '') {
            const q = query.toLowerCase();
            if (q.includes('çilingir')) finalCategory = 'Nöbetçi Çilingir';
            else if (q.includes('veteriner')) finalCategory = 'Acil Veteriner';
            else if (q.includes('lastikçi')) finalCategory = '7/24 Oto Lastikçi';
            else if (q.includes('çekici')) finalCategory = '7/24 Oto Çekici';
            else if (q.includes('diş')) finalCategory = 'Acil Diş Kliniği';
            else finalCategory = 'Genel';
          }

          groupResults.push({
            name: item.title,
            slug: generateSlug(item.title),
            phone: item.phone || '05000000000',
            address: item.address || `${city} Merkez`,
            city: city,
            district: extractDistrict(item.address, city),
            note: item.note || '7/24 Acil Hizmet',
            categoryName: finalCategory
          });
        });

        console.log(`✅ ${query} için ${items.length} işletme bulundu.`);
      } catch (err) {
        console.error(`❌ Hata (${query}):`, err.message);
      }
    }
  }

  await browser.close();

  const dataDir = path.join(__dirname, '../data/cities');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const outputPath = path.join(dataDir, `${activeGroup}_firmalar.json`);
  fs.writeFileSync(outputPath, JSON.stringify(groupResults, null, 2), 'utf-8');
  
  console.log(`\n🎉 ${activeGroup.toUpperCase()} tamamlandı! Toplam ${groupResults.length} kayıt kaydedildi: ${outputPath}`);
}

scrapeGroup().catch(console.error);