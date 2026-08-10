import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import PlaceCardClient from "@/components/PlaceCardClient";

async function SearchResults({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string; city?: string; district?: string; sort?: string }> 
}) {
  const resolvedParams = await searchParams;
  const initialQuery = resolvedParams.q || "";
  const selectedCity = resolvedParams.city || "";
  const selectedDistrict = resolvedParams.district || "";
  const sortBy = resolvedParams.sort || "rating_desc"; // Varsayılan sıralama

  // Veritabanı Seviyesinde Esnek Filtreleme (İl, İlçe ve Kategori)
  const whereCondition: any = {};

  if (selectedCity) {
    whereCondition.city = {
      equals: selectedCity,
      mode: "insensitive",
    };
  }

  if (selectedDistrict && selectedDistrict !== "Tüm İlçeler") {
    whereCondition.district = {
      contains: selectedDistrict,
      mode: "insensitive",
    };
  }

  // Kategori seçimi (q parametresi) veritabanı seviyesinde ilişki üzerinden filtreleniyor
  if (initialQuery) {
    whereCondition.OR = [
      {
        name: {
          contains: initialQuery,
          mode: "insensitive",
        },
      },
      {
        address: {
          contains: initialQuery,
          mode: "insensitive",
        },
      },
      {
        category: {
          name: {
            contains: initialQuery,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  // Dinamik Sıralama Kriteri Belirleme
  let orderByCondition: any = [{ rating: "desc" }, { userRatingCount: "desc" }];

  if (sortBy === "rating_desc") {
    orderByCondition = [{ rating: "desc" }, { userRatingCount: "desc" }];
  } else if (sortBy === "reviews_desc") {
    orderByCondition = [{ userRatingCount: "desc" }, { rating: "desc" }];
  } else if (sortBy === "newest") {
    orderByCondition = [{ createdAt: "desc" }];
  }

  // Verileri doğrudan filtrelenmiş ve sıralanmış şekilde çekiyoruz
  const results = await prisma.place.findMany({
    where: whereCondition,
    include: {
      category: true,
    },
    orderBy: orderByCondition,
  });

  // URL parametrelerini koruyarak sıralama linki oluşturan yardımcı fonksiyon
  const createSortUrl = (sortType: string) => {
    const params = new URLSearchParams();
    if (initialQuery) params.set("q", initialQuery);
    if (selectedCity) params.set("city", selectedCity);
    if (selectedDistrict) params.set("district", selectedDistrict);
    params.set("sort", sortType);
    return `/arama?${params.toString()}`;
  };

  return (
    <main className="container" style={{ padding: "2rem 1rem", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>
          {selectedCity ? `${selectedCity} / ${selectedDistrict && selectedDistrict !== "Tüm İlçeler" ? selectedDistrict : "Tüm İlçeler"}` : "Arama Sonuçları"} {initialQuery ? `- "${initialQuery}"` : ""} ({results.length})
        </h2>
        <Link 
          href="/" 
          style={{ fontSize: "0.9rem", color: "#dc2626", fontWeight: 600, textDecoration: "none" }}
        >
          ← Ana Sayfaya Dön
        </Link>
      </div>

      {/* Sıralama Butonları */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>Sırala:</span>
        <Link 
          href={createSortUrl("rating_desc")}
          style={{
            padding: "0.4rem 0.8rem",
            borderRadius: "6px",
            fontSize: "0.85rem",
            fontWeight: 600,
            textDecoration: "none",
            backgroundColor: sortBy === "rating_desc" ? "#2563eb" : "#ffffff",
            color: sortBy === "rating_desc" ? "#ffffff" : "#475569",
            border: "1px solid #cbd5e1"
          }}
        >
          ⭐ En Yüksek Puan
        </Link>
        <Link 
          href={createSortUrl("reviews_desc")}
          style={{
            padding: "0.4rem 0.8rem",
            borderRadius: "6px",
            fontSize: "0.85rem",
            fontWeight: 600,
            textDecoration: "none",
            backgroundColor: sortBy === "reviews_desc" ? "#2563eb" : "#ffffff",
            color: sortBy === "reviews_desc" ? "#ffffff" : "#475569",
            border: "1px solid #cbd5e1"
          }}
        >
          💬 En Çok Yorum
        </Link>
        <Link 
          href={createSortUrl("newest")}
          style={{
            padding: "0.4rem 0.8rem",
            borderRadius: "6px",
            fontSize: "0.85rem",
            fontWeight: 600,
            textDecoration: "none",
            backgroundColor: sortBy === "newest" ? "#2563eb" : "#ffffff",
            color: sortBy === "newest" ? "#ffffff" : "#475569",
            border: "1px solid #cbd5e1"
          }}
        >
          🕒 En Yeni Eklenen
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
  searchParams: Promise<{ q?: string; city?: string; district?: string; sort?: string }> 
}) {
  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", color: "#0f172a" }}>
      <Suspense fallback={<div className="container" style={{ padding: "2rem", textAlign: "center" }}>Yükleniyor...</div>}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}