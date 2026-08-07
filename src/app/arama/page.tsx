import Link from "next/link";
import { Search } from "lucide-react";
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

  // Tüm yerleri ve benzersiz il/ilçe listesini çekmek için sorgular
  const [places, rawCities, rawDistricts] = await Promise.all([
    prisma.place.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.place.findMany({ select: { city: true }, distinct: ['city'] }),
    selectedCity 
      ? prisma.place.findMany({ where: { city: selectedCity }, select: { district: true }, distinct: ['district'] })
      : prisma.place.findMany({ select: { district: true }, distinct: ['district'] })
  ]);

  const cities = rawCities.map(c => c.city).filter(Boolean).sort();
  const districts = rawDistricts.map(d => d.district).filter(Boolean).sort();

  // Filtreleme Mantığı (İl, İlçe ve Metin/Kelime Bazlı)
  const results = places.filter((place: any) => {
    // 1. İl Filtresi
    if (selectedCity && place.city.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }

    // 2. İlçe Filtresi
    if (selectedDistrict && place.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
      return false;
    }

    // 3. Metin / Anahtar Kelime Filtresi
    const q = initialQuery.toLowerCase().trim();
    if (!q) return true;

    const keywords = q.split(/\s+/).filter(Boolean);
    if (keywords.length === 0) return true;

    return keywords.every((keyword: string) => {
      return (
        place.city.toLowerCase().includes(keyword) ||
        place.district.toLowerCase().includes(keyword) ||
        place.name.toLowerCase().includes(keyword) ||
        place.address.toLowerCase().includes(keyword) ||
        (place.category && place.category.name.toLowerCase().includes(keyword))
      );
    });
  });

  return (
    <main className="container" style={{ padding: "2rem 1rem", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Filtreleme Formu */}
      <form 
        action="/arama" 
        method="GET" 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "0.75rem", 
          marginBottom: "2rem",
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
        }}
      >
        {/* İl Seçimi */}
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.3rem", color: "#475569" }}>
            İl Seçin
          </label>
          <select
            name="city"
            defaultValue={selectedCity}
            onChange={(e) => {
              e.target.form?.submit();
            }}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.95rem",
              backgroundColor: "#ffffff",
            }}
          >
            <option value="">Tüm İller</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* İlçe Seçimi */}
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.3rem", color: "#475569" }}>
            İlçe Seçin
          </label>
          <select
            name="district"
            defaultValue={selectedDistrict}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.95rem",
              backgroundColor: "#ffffff",
            }}
          >
            <option value="">Tüm İlçeler</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Anahtar Kelime / Hizmet */}
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.3rem", color: "#475569" }}>
            Hizmet / İşletme Adı
          </label>
          <input
            type="text"
            name="q"
            defaultValue={initialQuery}
            placeholder="Örn: Veteriner, Diş..."
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.95rem",
              backgroundColor: "#ffffff",
            }}
          />
        </div>

        {/* Buton Alanı */}
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button
            type="submit"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#dc2626",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Search size={18} /> Filtrele / Ara
          </button>
        </div>
      </form>

      <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "1rem", color: "#0f172a" }}>
        Arama Sonuçları ({results.length})
      </h2>

      {results.length === 0 ? (
        <p style={{ color: "#64748b" }}>
          Aradığınız kriterlere uygun açık nöbetçi işletme bulunamadı.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {results.map((place: any) => {
            const destinationQuery = `${place.name}, ${place.address}, ${place.district}/${place.city}`;
            const categoryName = place.category?.name || "Acil Hizmet";

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