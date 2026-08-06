import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.nobetcinerede.com';

  // İleride veritabanından eczaneleri çekip dinamik olarak da ekleyebilirsiniz. 
  // Şimdilik statik sayfalarımız:
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl, // Ana sayfa
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/arama`, // Arama sayfası
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/eczaneler`, // Eczaneler sayfası
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/iletisim`, // İletişim sayfası
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  return staticPages;
}