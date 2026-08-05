"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, ArrowLeft, Plus } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        padding: "0.85rem 1rem",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        {/* Sol: Logo */}
        <Link
          href="/"
          style={{
            fontSize: "1.35rem",
            fontWeight: 900,
            color: "#0f172a",
            textDecoration: "none",
            letterSpacing: "-0.5px",
            whiteSpace: "nowrap",
          }}
        >
          nobetcinerede<span style={{ color: "#dc2626" }}>.com</span>
        </Link>

        {/* Sağ: Butonlar */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          {isHome ? (
            <Link
              href="/ekle"
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#ffffff",
                backgroundColor: "#dc2626",
                padding: "0.5rem 0.85rem",
                borderRadius: "8px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                boxShadow: "0 2px 4px rgba(220, 38, 38, 0.2)",
                whiteSpace: "nowrap",
              }}
            >
              <Plus size={16} /> İşletme Ekle
            </Link>
          ) : (
            <Link
              href="/"
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#0f172a",
                backgroundColor: "#f1f5f9",
                border: "1px solid #cbd5e1",
                padding: "0.5rem 0.85rem",
                borderRadius: "8px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                whiteSpace: "nowrap",
              }}
            >
              <ArrowLeft size={16} /> Ana Sayfaya Dön
            </Link>
          )}

          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#1e293b",
              backgroundColor: "#f1f5f9",
              border: "1px solid #e2e8f0",
              padding: "0.5rem 0.75rem",
              borderRadius: "8px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              whiteSpace: "nowrap",
            }}
          >
            <Clock size={14} color="#dc2626" />
            7/24 Nöbetçi Rehberi
          </span>
        </div>
      </div>
    </header>
  );
}