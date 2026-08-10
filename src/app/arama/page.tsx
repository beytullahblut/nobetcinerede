import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import PlaceCardClient from "@/components/PlaceCardClient";

async function SearchResults({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string; city?: string; district?: string }> 
}) {
  const resolvedParams = await searchParams;
  const initialQuery = resolvedParams.q || "";
  const selectedCity = resolvedParams.city || "";
  const selectedDistrict = resolvedParams.district || "";

  // Veritabanı Seviyesinde Kesin Filtreleme
  const whereCondition: any = {};

  if (selectedCity) {
    whereCondition.city = {
      equals: selectedCity,
      mode: "insensitive",
    };
  }

  if (selectedDistrict && selectedDistrict !== "Tüm İlçeler") {
    whereCondition.district = {
      equals: selectedDistrict,
      mode: "insensitive",
    };
  }

  // Verileri ve kategorileri filtrelenmiş şekilde çekiyoruz
  // İsterseniz orderBy kısmını rating'e göre de ayarlayabilirsiniz
  const places = await prisma.place.findMany({
    where: whereCondition,
    include: {
      category: true,
    },
    orderBy: [
      { rating: "desc" },         // Önce yüksek puanlılar
      { userRatingCount: "desc" } // Sonra yorum sayısı fazla olanlar
    ],
  });

  // Arama kutusuna (q) kelime yazıldıysa filtreleme yapıyoruz
  const results = places.filter((place: any) => {
    const q = initialQuery.toLowerCase().trim();
    if (!q) return true;

    const keywords = q.split(/\s+/).filter(Boolean);
    if (keywords.length === 0) return true;

    return keywords.every((keyword: string) => {
      return (
        place.name.toLowerCase().includes(keyword) ||
        place.address.toLowerCase().includes(keyword) ||
        (place.category && place.category.name.toLowerCase().includes(keyword))
      );
    });
  });

  return (
    <main className="container" style={{ padding: "2rem 1rem", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>
          {selectedCity ? `${selectedCity} / ${selectedDistrict && selectedDistrict !== "Tüm İlçeler" ? selectedDistrict : "Tüm İlçeler"}` : "Arama Sonuçları"} ({results.length})
        </h2>
        <Link 
          href="/" 
          style={{ fontSize: "0.9rem", color: "#dc2626", fontWeight: 600, textDecoration: "none" }}
        >
          ← Ana Sayfaya Dön
        </Link>
      </div>

      {results.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", padding: "2rem", borderRadius: "12px", textAlign: "center", border: "1px solid #e2e8f0" }}>
          <p style={{ color: "#64748b", fontSize: "1rem" }}>
            Seçtiğiniz kriterlere uygun açık nöbetçi işletme bulunamadı.
          </p>
          <Link 
            href="/" 
            style={{ display: "inline-block", marginTop: "1rem", padding: "0.5rem 1rem", backgroundColor: "#dc2626", color: "#fff", borderRadius: "6px", textDecoration: "none", fontWeight: 600 }}
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {results.map((place: any) => {
            const destinationQuery = `${place.name}, ${place.address}, ${place.district}/${place.city}`;
            const categoryName = place.category?.name || "Nöbetçi İşletme";

            return (
              <PlaceCardClient 
                key={place.id} 
                place={place} 
                destinationQuery={destinationQuery} 
                categoryName={categoryName} 
              />
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function SearchPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string; city?: string; district?: string }> 
}) {
  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", color: "#0f172a" }}>
      <Suspense fallback={<div className="container" style={{ padding: "2rem", textAlign: "center" }}>Yükleniyor...</div>}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}