import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import PlaceCardClient from "@/components/PlaceCardClient";
import SearchFilterClient from "@/components/SearchBox";

async function SearchResults({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string; city?: string; district?: string; sort?: string }> 
}) {
  const resolvedParams = await searchParams;
  const initialQuery = resolvedParams.q || "";
  const selectedCity = resolvedParams.city || "Bursa";
  const selectedDistrict = resolvedParams.district || "Tüm İlçeler";
  const sortBy = resolvedParams.sort || "rating_desc";

  const allPlaces = await prisma.place.findMany({
    include: { category: true },
  });

  const filteredResults = allPlaces.filter((place: any) => {
    // 1. Şehir Filtresi
    if (selectedCity && selectedCity !== "Tüm Şehirler") {
      const placeCity = (place.city || "").toLowerCase();
      const queryCity = selectedCity.trim().toLowerCase();
      if (!placeCity.includes(queryCity)) return false;
    }

    // 2. İlçe Filtresi
    if (selectedDistrict && selectedDistrict !== "Tüm İlçeler") {
      const placeDistrict = (place.district || "").toLowerCase();
      const queryDistrict = selectedDistrict.trim().toLowerCase();
      
      const normalizeText = (text: string) => 
        text.toLowerCase()
          .replace(/İ/g, "i")
          .replace(/ı/g, "i")
          .replace(/I/g, "i")
          .replace(/Ü/g, "u")
          .replace(/ü/g, "u")
          .replace(/Ş/g, "s")
          .replace(/ş/g, "s")
          .replace(/Ç/g, "c")
          .replace(/ç/g, "c")
          .replace(/Ö/g, "o")
          .replace(/ö/g, "o")
          .replace(/Ğ/g, "g")
          .replace(/ğ/g, "g");

      const normPlaceDistrict = normalizeText(place.district || "");
      const normQueryDistrict = normalizeText(selectedDistrict);

      const isDistrictMatch = 
        placeDistrict.includes(queryDistrict) || 
        normPlaceDistrict.includes(normQueryDistrict);

      if (!isDistrictMatch) return false;
    }

    // 3. Kategori / Kelime Arama Filtresi
    if (initialQuery) {
      const q = initialQuery.trim().toLowerCase();
      const placeName = (place.name || "").toLowerCase();
      const categoryName = (place.category?.name || "").toLowerCase();
      const placeNote = (place.note || "").toLowerCase();
      const placeAddress = (place.address || "").toLowerCase();
      const categoryId = (place.categoryId || "").toLowerCase();

      if (q.includes("veteriner") || q.includes("acil-veteriner")) {
        const isVetMatch = 
          categoryName.includes("veteriner") || 
          placeName.includes("veteriner") || 
          placeNote.includes("veteriner") || 
          placeAddress.includes("veteriner") ||
          categoryId.includes("veteriner");
        
        if (!isVetMatch) return false;
      } else if (q.includes("diş") || q.includes("dis")) {
        if (!(categoryName.includes("diş") || categoryName.includes("dis") || placeName.includes("diş") || categoryId.includes("dis"))) return false;
      } else if (q.includes("çilingir") || q.includes("cilingir")) {
        if (!(categoryName.includes("çilingir") || categoryName.includes("cilingir") || placeName.includes("çilingir"))) return false;
      } else if (q.includes("lastikçi") || q.includes("lastikci")) {
        if (!(categoryName.includes("lastikçi") || categoryName.includes("lastikci") || placeName.includes("lastik"))) return false;
      } else if (q.includes("çekici") || q.includes("cekici")) {
        if (!(categoryName.includes("çekici") || categoryName.includes("cekici") || placeName.includes("çekici"))) return false;
      } else {
        const isQueryMatch = 
          categoryName.includes(q) || 
          placeName.includes(q) || 
          placeNote.includes(q) || 
          placeAddress.includes(q) ||
          categoryId.includes(q);

        if (!isQueryMatch) return false;
      }
    }

    return true;
  });

  // Mükerrer kayıtları engelleme
  const uniqueMap = new Map();
  filteredResults.forEach((place: any) => {
    const cleanName = (place.name || "").trim().toLowerCase();
    const cleanAddress = (place.address || "").trim().toLowerCase();
    const uniqueKey = `${cleanName}-${cleanAddress}`;

    if (!uniqueMap.has(uniqueKey)) {
      uniqueMap.set(uniqueKey, place);
    }
  });

  const finalCleanResults = Array.from(uniqueMap.values()) as any[];

  // Sıralama Mantığı
  finalCleanResults.sort((a: any, b: any) => {
    if (sortBy === "reviews_desc") {
      return (b.userRatingCount || 0) - (a.userRatingCount || 0) || (b.rating || 0) - (a.rating || 0);
    } else if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return (b.rating || 0) - (a.rating || 0) || (b.userRatingCount || 0) - (a.userRatingCount || 0);
    }
  });

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
      {/* Üst Bilgi ve Ana Sayfa Linki */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>
          {selectedCity} / {selectedDistrict} {initialQuery ? `- "${initialQuery}"` : ""} ({finalCleanResults.length})
        </h2>
        <Link 
          href="/" 
          style={{ fontSize: "0.9rem", color: "#dc2626", fontWeight: 600, textDecoration: "none" }}
        >
          ← Ana Sayfaya Dön
        </Link>
      </div>

      {/* Ana Sayfadaki Gibi Açılır Menü (Dropdown) Filtre Alanı */}
      <SearchFilterClient 
        initialCity={selectedCity} 
        initialDistrict={selectedDistrict} 
        initialQuery={initialQuery} 
      />

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

      {/* Sonuç Listesi */}
      {finalCleanResults.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", padding: "2rem", borderRadius: "12px", textAlign: "center", border: "1px solid #e2e8f0" }}>
          <p style={{ color: "#64748b", fontSize: "1rem" }}>
            Seçtiğiniz kriterlere uygun açık nöbetçi işletme bulunamadı.
          </p>
          <Link 
            href="/" 
            style={{ display: "inline-top", marginTop: "1rem", padding: "0.5rem 1rem", backgroundColor: "#dc2626", color: "#fff", borderRadius: "6px", textDecoration: "none", fontWeight: 600 }}
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {finalCleanResults.map((place: any) => {
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