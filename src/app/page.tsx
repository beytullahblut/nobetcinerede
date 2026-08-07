"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ShieldCheck,
  Clock,
  MapPin,
  Building2,
  HeartPulse,
  KeyRound,
  Wrench,
  UserCheck,
  Info,
  Zap,
  Truck,
  Pill,
} from "lucide-react";

import ilData from "@/data/il.json";
import ilceData from "@/data/ilce.json";

export default function HomePage() {
  const router = useRouter();
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedCityName, setSelectedCityName] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // il.json yapısını çözer ve Türkçe karakterlere uygun olarak A'dan Z'ye sıralar
  const ilList = useMemo(() => {
    let raw = ilData as any;

    if (Array.isArray(raw)) {
      const tableObj = raw.find((item: any) => item.type === "table" && Array.isArray(item.data));
      if (tableObj) {
        raw = tableObj.data;
      }
    }

    if (Array.isArray(raw)) {
      const parsed = raw.map((item: any, idx: number) => ({
        id: String(item.id || idx + 1).trim(),
        name: String(item.name || item.il_adi || item.title || "Bilinmeyen İl").trim(),
      }));

      // Türkçe alfabeye göre A-Z sıralama
      return parsed.sort((a, b) => a.name.localeCompare(b.name, "tr"));
    }

    return [];
  }, []);

  // ilce.json yapısını çözer ve Türkçe karakterlere uygun olarak A'dan Z'ye sıralar
  const ilceList = useMemo(() => {
    let raw = ilceData as any;

    if (Array.isArray(raw)) {
      const tableObj = raw.find((item: any) => item.type === "table" && Array.isArray(item.data));
      if (tableObj) {
        raw = tableObj.data;
      }
    }

    if (Array.isArray(raw)) {
      const parsed = raw.map((item: any, idx: number) => ({
        id: String(item.id || idx + 1).trim(),
        il_id: String(item.il_id || "").trim(),
        name: String(item.name || item.ilce_adi || item.title || "Bilinmeyen İlçe").trim(),
      }));

      // Türkçe alfabeye göre A-Z sıralama
      return parsed.sort((a, b) => a.name.localeCompare(b.name, "tr"));
    }

    return [];
  }, []);

  // Seçilen ile bağlı ilçeler (Sıralanmış listeden filtreler)
  const availableDistricts = useMemo(() => {
    if (!selectedCityId) return [];
    return ilceList.filter((d) => String(d.il_id) === String(selectedCityId));
  }, [selectedCityId, ilceList]);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value;
    setSelectedCityId(cityId);

    const foundCity = ilList.find((c) => String(c.id) === String(cityId));
    setSelectedCityName(foundCity ? foundCity.name : "");

    // İl değiştiğinde ilçeyi sıfırla
    setSelectedDistrict("");
  };

const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    // İl ve ilçeyi doğrudan kendi parametreleri olarak ekliyoruz
    if (selectedCityName) params.append("city", selectedCityName);
    if (selectedDistrict) params.append("district", selectedDistrict);
    
    // Kategoriyi veya arama metnini q parametresi olarak ekliyoruz
    if (selectedCategory) params.append("q", selectedCategory);

    router.push(`/arama?${params.toString()}`);
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", color: "#0f172a" }}>
      {/* HERO BÖLÜMÜ */}
      <section
        style={{
          backgroundColor: "#0f172a",
          color: "#ffffff",
          padding: "3.5rem 1rem",
          textAlign: "center",
          backgroundImage: "radial-gradient(circle at top, #1e293b 0%, #0f172a 100%)",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <span
            style={{
              backgroundColor: "#1e293b",
              color: "#f8f8f8",
              border: "1px solid #334155",
              padding: "0.3rem 0.8rem",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: 700,
              display: "inline-block",
            }}
          >
            ACİL & NÖBETÇİ HİZMET ARAMA MOTORU
          </span>
          <h1
            style={{
              fontSize: "2.2rem",
              fontWeight: 900,
              marginTop: "1rem",
              marginBottom: "0.75rem",
              lineHeight: 1.2,
            }}
          >
            İhtiyacınız Olduğu An En Yakın Nöbetçi Hizmeti Bulun
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem", marginBottom: "2rem" }}>
            Gece veteriner, çilingir, lastikçi, oto çekici, diş kliniği ve nöbetçi eczane arayışlarınızda harita destekli doğruluk.
          </p>

          {/* DİNAMİK ARAMA FORMU */}
          <form
            onSubmit={handleSearch}
            style={{
              backgroundColor: "#ffffff",
              padding: "1rem",
              borderRadius: "16px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: "0.75rem",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* İL SEÇİMİ */}
            <div style={{ flex: "1 1 160px" }}>
              <select
                value={selectedCityId}
                onChange={handleCityChange}
                style={{
                  width: "100%",
                  height: "48px",
                  boxSizing: "border-box",
                  color: selectedCityId ? "#0f172a" : "#64748b",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  padding: "0 0.75rem",
                }}
              >
                <option value="">İl Seçin...</option>
                {ilList.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* İLÇE SEÇİMİ */}
            <div style={{ flex: "1 1 160px" }}>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={!selectedCityId}
                style={{
                  width: "100%",
                  height: "48px",
                  boxSizing: "border-box",
                  color: selectedDistrict ? "#0f172a" : "#64748b",
                  opacity: selectedCityId ? 1 : 0.6,
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  padding: "0 0.75rem",
                }}
              >
                <option value="">İlçe Seçin...</option>
                {availableDistricts.map((dist) => (
                  <option key={dist.id} value={dist.name}>
                    {dist.name}
                  </option>
                ))}
              </select>
            </div>

            {/* KATEGORİ SEÇİMİ */}
            <div style={{ flex: "1 1 180px" }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: "100%",
                  height: "48px",
                  boxSizing: "border-box",
                  color: selectedCategory ? "#0f172a" : "#64748b",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  padding: "0 0.75rem",
                }}
              >
                <option value="">Hizmet / Kategori...</option>
                <option value="Acil Veteriner">Acil Veteriner</option>
                <option value="Nöbetçi Çilingir">Nöbetçi Çilingir</option>
                <option value="7/24 Oto Lastikçi">7/24 Oto Lastikçi</option>
                <option value="7/24 Oto Çekici">7/24 Oto Çekici</option>
                <option value="Acil Diş Kliniği">Acil Diş Kliniği</option>
              </select>
            </div>

            {/* BUTON */}
            <div style={{ flex: "1 1 130px" }}>
              <button
                type="submit"
                style={{
                  width: "100%",
                  height: "48px",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  fontWeight: 800,
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <Search size={18} /> Nöbetçi Bul
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* İSTATİSTİK BANNER'I */}
      <div style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "1rem 0" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#475569",
            padding: "0 1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Zap size={18} color="#dc2626" /> Anında İlan Yayınlama
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MapPin size={18} color="#2563eb" /> Harita Destekli Yol Tarifi
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck size={18} color="#16a34a" /> Moderasyonlu Güncelleme / Silme
          </div>
        </div>
      </div>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1rem" }}>
        {/* HIZLI KATEGORİ KARTLARI */}
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "1.2rem", color: "#0f172a" }}>
          Öne Çıkan Acil Hizmet Kategorileri
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {[
            { name: "Acil Veteriner", icon: HeartPulse, color: "#ef4444" },
            { name: "Nöbetçi Çilingir", icon: KeyRound, color: "#f59e0b" },
            { name: "7/24 Oto Lastikçi", icon: Wrench, color: "#3b82f6" },
            { name: "7/24 Oto Çekici", icon: Truck, color: "#8b5cf6" },
            { name: "Acil Diş Kliniği", icon: Building2, color: "#10b981" },
          ].map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={idx}
                href={`/arama?q=${encodeURIComponent(cat.name)}`}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  textDecoration: "none",
                  color: "#0f172a",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    backgroundColor: `${cat.color}15`,
                    padding: "0.75rem",
                    borderRadius: "10px",
                    display: "flex",
                  }}
                >
                  <IconComponent size={24} color={cat.color} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>{cat.name}</h3>
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Nöbetçileri Gör &rarr;</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ÖZEL NÖBETÇİ ECZANE KART KISMI */}
        <div style={{ marginBottom: "3.5rem" }}>
          <Link
            href="/eczaneler"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "12px",
              padding: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              textDecoration: "none",
              color: "#0f172a",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ backgroundColor: "#fee2e2", padding: "1rem", borderRadius: "12px", display: "flex" }}>
                <Pill size={28} color="#dc2626" />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#991b1b" }}>Türkiye Geneli Nöbetçi Eczaneler Listesi</h3>
                <p style={{ fontSize: "0.88rem", color: "#64748b", marginTop: "0.2rem" }}>
                  Tüm il ve ilçelerdeki güncel nöbetçi eczanelere tek tıkla anında ulaşın.
                </p>
              </div>
            </div>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#dc2626", whiteSpace: "nowrap" }}>
              Eczaneleri Listele &rarr;
            </span>
          </Link>
        </div>

        {/* MİSYON & NEDEN VARIZ BÖLÜMÜ */}
        <section
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            padding: "2.5rem 1.5rem",
            marginBottom: "3.5rem",
          }}
        >
          <div style={{ maxWidth: "750px", margin: "0 auto", textAlign: "center" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#dc2626", textTransform: "uppercase" }}>
              Açık ve Ulaşılabilir Bilgi
            </span>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: "0.4rem", marginBottom: "1rem" }}>
              nobetcinerede.com Ne İçin Var? Amaçlarımız Neler?
            </h2>
            <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "2rem" }}>
              Gece yarısı veteriner, kapıda kaldığınızda çilingir, yolda kaldığınızda çekici ya da lastikçi ararken zamanla yarışırsınız.
              Amacımız, en acil anlarınızda konumunuza en yakın ve aktif olarak hizmet veren işletmelerin adres, telefon ve harita konumlarına tek tıkla ulaşmanızı sağlamaktır.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.5rem",
              marginTop: "1.5rem",
            }}
          >
            <div style={{ backgroundColor: "#f8fafc", padding: "1.25rem", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
              <Clock size={24} color="#dc2626" style={{ marginBottom: "0.5rem" }} />
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.25rem" }}>Zaman Kaybını Önlemek</h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                Kapanmış dükkanların numaralarıyla vakit kaybetmeden doğrudan açık mekanlara ulaşmanızı sağlıyoruz.
              </p>
            </div>

            <div style={{ backgroundColor: "#f8fafc", padding: "1.25rem", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
              <MapPin size={24} color="#2563eb" style={{ marginBottom: "0.5rem" }} />
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.25rem" }}>Doğrudan Harita Navigasyonu</h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                Adres aramak yerine Google Maps entegrasyonuyla canlı rota oluşturarak hızlıca ulaşın.
              </p>
            </div>

            <div style={{ backgroundColor: "#f8fafc", padding: "1.25rem", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
              <UserCheck size={24} color="#16a34a" style={{ marginBottom: "0.5rem" }} />
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.25rem" }}>Anında İlan & Güvenli Süreç</h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                Yeni nöbetçi kaydı anında yayına girer. Var olan ilan düzenlemeleri ve kaldırma talepleri editör incelemesinden geçer.
              </p>
            </div>
          </div>
        </section>

        {/* HUKUKİ SORUMLULUK & KVKK BİLGİLENDİRME BLOĞU */}
        <section
          style={{
            backgroundColor: "#fff8f8",
            border: "1px solid #fecaca",
            borderRadius: "16px",
            padding: "2rem 1.5rem",
          }}
        >
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <Info size={28} color="#dc2626" style={{ flexShrink: 0, marginTop: "0.2rem" }} />
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#991b1b", marginBottom: "0.5rem" }}>
                Hukuki Sorumluluk Reddi ve Veri Şeffaflığı
              </h3>
              <p style={{ fontSize: "0.88rem", color: "#7f1d1d", lineHeight: 1.6, marginBottom: "0.75rem" }}>
                <strong>nobetcinerede.com</strong>, kamuya açık aleni verileri ve kullanıcılar/işletmeler tarafından girilen nöbetçi bilgilerini indeksleyen bir bilgi rehberidir.
              </p>

              <ul style={{ fontSize: "0.85rem", color: "#991b1b", paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <li>
                  <strong>Hızlı Yayın Sistemi:</strong> Eklenen yeni işletmeler anında yayına alınır; sağlanan bilgilerin doğruluğundan doğrudan beyanda bulunan işletme/kullanıcı sorumludur.
                </li>
                <li>
                  <strong>Moderasyonlu Güncelleme / Silme:</strong> Mevcut bir kaydı güncelleme veya yayından kaldırma talepleri (sahiplenme istekleri) editör ekibimizce doğrulanarak işleme alınır.
                </li>
                <li>
                  <strong>KVKK Uyumluluğu:</strong> Platform üzerinde yalnızca kamuya açık ticari işletme unvanları, adresleri ve kurumsal telefonlar işlenir; şahsi veriler saklanmaz.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}