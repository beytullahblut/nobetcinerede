"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import illerData from "@/data/il.json";     
import ilcelerData from "@/data/ilce.json"; 

interface SearchFilterProps {
  initialCity?: string;
  initialDistrict?: string;
  initialQuery?: string;
}

interface IlceItem {
  id?: string;
  il_id?: string | number;
  name?: string;
  [key: string]: any;
}

export default function SearchFilterClient({ initialCity, initialDistrict, initialQuery }: SearchFilterProps) {
  const router = useRouter();

  const [selectedIl, setSelectedIl] = useState<string>(initialCity || "");
  const [selectedIlce, setSelectedIlce] = useState<string>("");
  const [selectedKategori, setSelectedKategori] = useState<string>(initialQuery || "");
  const [ilceler, setIlceler] = useState<IlceItem[]>([]);

  // phpMyAdmin export yapısındaki "data" dizilerini güvenli bir şekilde çekelim
  const getRawIller = () => {
    const tableObj = (illerData as any[]).find((item) => item.type === "table" && item.name === "il");
    return tableObj && Array.isArray(tableObj.data) ? tableObj.data : [];
  };

  const getRawIlceler = () => {
    const tableObj = (ilcelerData as any[]).find((item) => item.type === "table" && item.name === "ilce");
    return tableObj && Array.isArray(tableObj.data) ? tableObj.data : [];
  };

  const rawIller = getRawIller();
  const rawIlceler = getRawIlceler();

  // İl veya Sayfa Yüklendiğinde İlçeleri ve Seçili İlçeyi Ayarla
  useEffect(() => {
    if (selectedIl) {
      const ilObj = rawIller.find((i: any) => i.name?.toLocaleUpperCase('tr-TR') === selectedIl?.toLocaleUpperCase('tr-TR'));
      const targetIlId = ilObj ? String(ilObj.id) : String(selectedIl);

      const filtered = rawIlceler.filter(
        (item: any) => String(item.il_id) === targetIlId
      );
      setIlceler(filtered);

      // Eğer initialDistrict geldiyse ve listede varsa, büyük/küçük harf duyarsız eşleştirip seçili yapalım
      if (initialDistrict && initialDistrict !== "Tüm İlçeler") {
        const matchedIlce = filtered.find(
          (item: any) => item.name?.toLocaleUpperCase('tr-TR') === initialDistrict.toLocaleUpperCase('tr-TR')
        );
        if (matchedIlce) {
          setSelectedIlce(matchedIlce.name);
        } else {
          setSelectedIlce(initialDistrict);
        }
      } else {
        setSelectedIlce("");
      }
    } else {
      setIlceler([]);
      setSelectedIlce("");
    }
  }, [selectedIl, initialDistrict]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (selectedIl) params.set("city", selectedIl);
    params.set("district", selectedIlce ? selectedIlce : "Tüm İlçeler");
    if (selectedKategori) params.set("q", selectedKategori);

    router.push(`/arama?${params.toString()}`);
  };

  return (
    <form 
      onSubmit={handleSearch} 
      style={{
        backgroundColor: "#ffffff",
        padding: "1rem",
        borderRadius: "16px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "0.75rem",
        alignItems: "center",
        marginBottom: "1.5rem",
        border: "1px solid #e2e8f0"
      }}
    >
      {/* İl Seçimi */}
      <div style={{ flex: 1, minWidth: "180px", position: "relative" }}>
        <select 
          value={selectedIl} 
          onChange={(e) => { 
            setSelectedIl(e.target.value); 
            setSelectedIlce(""); 
          }}
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            backgroundColor: "#f8fafc",
            color: "#334155",
            fontSize: "0.95rem",
            outline: "none",
            cursor: "pointer"
          }}
        >
          <option value="">İl Seçin...</option>
          {rawIller.map((il: any, index: number) => (
            <option key={index} value={il.name}>
              {il.name}
            </option>
          ))}
        </select>
      </div>

      {/* İlçe Seçimi */}
      <div style={{ flex: 1, minWidth: "180px", position: "relative" }}>
        <select 
          value={selectedIlce} 
          onChange={(e) => setSelectedIlce(e.target.value)}
          disabled={!selectedIl}
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            backgroundColor: !selectedIl ? "#f1f5f9" : "#f8fafc",
            color: "#334155",
            fontSize: "0.95rem",
            outline: "none",
            cursor: selectedIl ? "pointer" : "not-allowed",
            opacity: !selectedIl ? 0.6 : 1
          }}
        >
          <option value="">Tüm İlçeler / İlçe Seçin...</option>
          {ilceler.map((ilce: any, index: number) => (
            <option key={index} value={ilce.name}>
              {ilce.name}
            </option>
          ))}
        </select>
      </div>

      {/* Hizmet / Kategori Seçimi */}
      <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
        <select 
          value={selectedKategori} 
          onChange={(e) => setSelectedKategori(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            backgroundColor: "#f8fafc",
            color: "#334155",
            fontSize: "0.95rem",
            outline: "none",
            cursor: "pointer"
          }}
        >
          <option value="">Hizmet / Kategori...</option>
          <option value="Acil Veteriner">Acil Veteriner</option>
          <option value="Çilingir">Çilingir</option>
          <option value="Nöbetçi Eczane">Nöbetçi Eczane</option>
          <option value="Oto Çekici">Oto Çekici</option>
          <option value="Diş Kliniği">Diş Kliniği</option>
          <option value="Lastikçi">Lastikçi</option>
        </select>
      </div>

      {/* Nöbetçi Bul Butonu */}
      <button 
        type="submit"
        style={{
          backgroundColor: "#dc2626",
          color: "#ffffff",
          padding: "0.75rem 1.75rem",
          borderRadius: "10px",
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          transition: "background-color 0.2s",
          boxShadow: "0 4px 6px -1px rgba(220, 38, 38, 0.2)"
        }}
      >
        <span>🔍</span> Nöbetçi Bul
      </button>
    </form>
  );
}