import Link from "next/link";
import { Search } from "lucide-react";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import PlaceCardClient from "@/components/PlaceCardClient";

async function SearchResults({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const initialQuery = resolvedParams.q || "";

  const places = await prisma.place.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const results = places.filter((place) => {
    const q = initialQuery.toLowerCase().trim();
    if (!q) return true;

    const keywords = q.split(/\s+/).filter(Boolean);
    if (keywords.length === 0) return true;

    return keywords.every((keyword) => {
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
      <form action="/arama" method="GET" style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        <input
          type="text"
          name="q"
          defaultValue={initialQuery}
          placeholder="İl, ilçe veya hizmet ara..."
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            fontSize: "1rem",
            backgroundColor: "#ffffff",
          }}
        />
        <button
          type="submit"
          style={{
            display: "flex",
            alignItems: "center",
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
          <Search size={18} /> Ara
        </button>
      </form>

      <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "1rem", color: "#0f172a" }}>
        "{initialQuery}" için Arama Sonuçları ({results.length})
      </h2>

      {results.length === 0 ? (
        <p style={{ color: "#64748b" }}>
          Aradığınız kriterlere uygun açık nöbetçi işletme bulunamadı.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {results.map((place) => {
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

export default function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", color: "#0f172a" }}>
      <Suspense fallback={<div className="container" style={{ padding: "2rem", textAlign: "center" }}>Yükleniyor...</div>}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}