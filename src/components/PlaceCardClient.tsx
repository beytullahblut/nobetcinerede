"use client";

import Link from "next/link";
import { Phone, MapPin, CheckCircle, Search } from "lucide-react";

export default function PlaceCardClient({ place, destinationQuery, categoryName }: { place: any; destinationQuery: string; categoryName: string }) {
  const handleDirectionsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const url = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${encodeURIComponent(destinationQuery)}`;
          window.open(url, "_blank");
        },
        () => {
          const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destinationQuery)}`;
          window.open(url, "_blank");
        },
        { timeout: 10000 }
      );
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destinationQuery)}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          {/* Sabit metin kaldırıldı, dışarıdan gelen gerçek kategori adı basılıyor */}
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#dc2626",
              backgroundColor: "#fee2e2",
              padding: "0.2rem 0.5rem",
              borderRadius: "4px",
            }}
          >
            {categoryName}
          </span>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", marginTop: "0.4rem" }}>
            {place.name}
          </h3>
          <p style={{ color: "#64748b", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.25rem" }}>
            <MapPin size={16} /> {place.district} / {place.city}
          </p>
        </div>
        <span style={{ color: "#16a34a", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.85rem", fontWeight: 600 }}>
          <CheckCircle size={16} /> Aktif
        </span>
      </div>

      <p style={{ fontSize: "0.9rem", color: "#334155" }}>{place.address}</p>

      {/* HARİTA ALANI */}
      <div style={{ width: "100%", height: "180px", borderRadius: "8px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
        <iframe
          title={place.name}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={`https://maps.google.com/maps?q=${encodeURIComponent(destinationQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
        ></iframe>
      </div>

      {place.note && (
        <div style={{ backgroundColor: "#f1f5f9", padding: "0.5rem 0.75rem", borderRadius: "6px", fontSize: "0.85rem", color: "#475569", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Search size={14} /> {place.note}
        </div>
      )}

      {/* AKSİYON VE GÜNCELLEME BUTONLARI */}
      <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <a
          href={`tel:${place.phone.replace(/\s+/g, "")}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "#dc2626",
            color: "#ffffff",
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.9rem",
            textDecoration: "none",
          }}
        >
          <Phone size={16} /> Hemen Ara: {place.phone}
        </a>

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationQuery)}`}
          onClick={handleDirectionsClick}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.9rem",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          <MapPin size={16} /> Yol Tarifi Al (Mesafe Gör)
        </a>

        <Link
          href={`/ekle?action=claim&id=${place.id}&name=${encodeURIComponent(place.name)}&phone=${encodeURIComponent(place.phone)}&city=${encodeURIComponent(place.city)}&district=${encodeURIComponent(place.district)}&address=${encodeURIComponent(place.address)}&categoryId=${encodeURIComponent(place.categoryId)}`}
          style={{
            fontSize: "0.8rem",
            color: "#64748b",
            textDecoration: "underline",
            marginLeft: "auto",
          }}
        >
          Bu işletme sizin mi? Bilgileri Güncelleyin / Kaldırın
        </Link>
      </div>
    </div>
  );
}