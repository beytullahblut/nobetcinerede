"use client";

import Link from "next/link";
import { Send, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import ilData from "@/data/il.json";
import ilceData from "@/data/ilce.json";

function FormContent() {
  const searchParams = useSearchParams();
  const isClaim = searchParams.get("action") === "claim";

  const [requestType, setRequestType] = useState<"UPDATE" | "DELETE">("UPDATE");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCityId, setSelectedCityId] = useState("");

  const [formData, setFormData] = useState({
    placeId: "",
    name: "",
    categoryId: "",
    categorySlug: "acil-veteriner",
    phone: "",
    city: "",
    district: "",
    address: "",
    note: "",
  });

  // Öne çıkan kategoriler (Eczane çıkarıldı, Çekici eklendi)
  const categories = [
    { id: "acil-veteriner", name: "Acil Veteriner" },
    { id: "nobetci-cilingir", name: "Nöbetçi Çilingir" },
    { id: "7-24-oto-lastikci", name: "7/24 Oto Lastikçi" },
    { id: "acil-dis-klinigi", name: "Acil Diş Kliniği" },
    { id: "7-24-yol-yardim-cekici", name: "7/24 Yol Yardım / Çekici" },
  ];

  // il.json yapısını çözer ve Türkçe alfabeye göre A-Z sıralar
  const ilList = useMemo(() => {
    let raw = ilData as any;
    if (Array.isArray(raw)) {
      const tableObj = raw.find((item: any) => item.type === "table" && Array.isArray(item.data));
      if (tableObj) raw = tableObj.data;
    }

    if (Array.isArray(raw)) {
      const parsed = raw.map((item: any, idx: number) => ({
        id: String(item.id || idx + 1).trim(),
        name: String(item.name || item.il_adi || item.title || "Bilinmeyen İl").trim(),
      }));

      return parsed.sort((a, b) => a.name.localeCompare(b.name, "tr"));
    }
    return [];
  }, []);

  // ilce.json yapısını çözer ve Türkçe alfabeye göre A-Z sıralar
  const ilceList = useMemo(() => {
    let raw = ilceData as any;
    if (Array.isArray(raw)) {
      const tableObj = raw.find((item: any) => item.type === "table" && Array.isArray(item.data));
      if (tableObj) raw = tableObj.data;
    }

    if (Array.isArray(raw)) {
      const parsed = raw.map((item: any, idx: number) => ({
        id: String(item.id || idx + 1).trim(),
        il_id: String(item.il_id || "").trim(),
        name: String(item.name || item.ilce_adi || item.title || "Bilinmeyen İlçe").trim(),
      }));

      return parsed.sort((a, b) => a.name.localeCompare(b.name, "tr"));
    }
    return [];
  }, []);

  // Seçilen ile bağlı ilçeler
  const availableDistricts = useMemo(() => {
    if (!selectedCityId) return [];
    return ilceList.filter((d) => String(d.il_id) === String(selectedCityId));
  }, [selectedCityId, ilceList]);

  // URL'den gelen parametrelerle formu otomatik doldur ve İl ID'sini eşleştir
  useEffect(() => {
    if (isClaim) {
      const cityFromUrl = searchParams.get("city") || "";
      const districtFromUrl = searchParams.get("district") || "";

      setFormData((prev) => ({
        ...prev,
        placeId: searchParams.get("id") || "",
        name: searchParams.get("name") || "",
        phone: searchParams.get("phone") || "",
        city: cityFromUrl,
        district: districtFromUrl,
        address: searchParams.get("address") || "",
        categoryId: searchParams.get("categoryId") || "",
      }));

      // URL'deki şehir ismiyle eşleşen İl ID'sini bularak ilçeleri aktif eder
      if (cityFromUrl && ilList.length > 0) {
        const foundCity = ilList.find(
          (c) => c.name.toLocaleLowerCase("tr") === cityFromUrl.toLocaleLowerCase("tr")
        );
        if (foundCity) {
          setSelectedCityId(foundCity.id);
        }
      }
    }
  }, [isClaim, searchParams, ilList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const finalType = !isClaim ? "CREATE" : requestType;

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: finalType,
          placeId: formData.placeId || null,
          name: formData.name,
          phone: formData.phone,
          city: formData.city,
          district: formData.district,
          address: formData.address,
          categoryId: formData.categoryId,
          note: formData.note,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "İşlem gerçekleştirilirken bir hata oluştu.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Bir şeyler ters gitti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ padding: "2rem 1rem", maxWidth: "600px", margin: "0 auto" }}>
      {submitted ? (
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "2rem",
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <CheckCircle2 size={48} color="#16a34a" style={{ margin: "0 auto 1rem auto" }} />
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            {!isClaim ? "İşletmeniz Eklendi!" : "Talebiniz Alındı!"}
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
            {!isClaim
              ? "İşletme kaydınız başarıyla oluşturuldu ve rehberde yayına alındı."
              : "Güncelleme / kaldırma talebiniz editör onayına gönderilmiştir. İnceleme sonrası işleme alınacaktır."}
          </p>
          <Link href="/" className="search-button" style={{ display: "inline-block", textDecoration: "none" }}>
            Ana Sayfaya Dön
          </Link>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            {isClaim ? "İşletme Bilgisi Güncelle / Kaldır" : "Nöbetçi / Acil İşletme Ekle"}
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            {isClaim
              ? "Bilgileri güncellemek veya kaydı kaldırmak için talebinizi iletebilirsiniz."
              : "Yeni eklenen işletmeler anında yayına alınır. Lütfen doğru bilgileri giriniz."}
          </p>

          {!isClaim && (
            <div
              style={{
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                padding: "0.75rem",
                fontSize: "0.85rem",
                color: "#166534",
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
                marginBottom: "1.25rem",
              }}
            >
              <Zap size={20} style={{ flexShrink: 0 }} />
              Bu form ile eklenen yeni işletmeler onay beklemeksizin anında haritada ve rehberde görünür.
            </div>
          )}

          {isClaim && (
            <div
              style={{
                backgroundColor: "#fff7ed",
                border: "1px solid #fed7aa",
                borderRadius: "8px",
                padding: "0.75rem",
                fontSize: "0.85rem",
                color: "#9a3412",
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
                marginBottom: "1.25rem",
              }}
            >
              <ShieldCheck size={20} style={{ flexShrink: 0 }} />
              Kayıt kaldırma ve güncelleme işlemleri güvenlik amacıyla moderatör onayına tabidir.
            </div>
          )}

          {isClaim && (
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <button
                type="button"
                onClick={() => setRequestType("UPDATE")}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  backgroundColor: requestType === "UPDATE" ? "#0f172a" : "#ffffff",
                  color: requestType === "UPDATE" ? "#ffffff" : "#475569",
                  cursor: "pointer",
                }}
              >
                Bilgileri Güncelle
              </button>
              <button
                type="button"
                onClick={() => setRequestType("DELETE")}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  backgroundColor: requestType === "DELETE" ? "#dc2626" : "#ffffff",
                  color: requestType === "DELETE" ? "#ffffff" : "#475569",
                  cursor: "pointer",
                }}
              >
                Kaydı Kaldır / Sil
              </button>
            </div>
          )}

          {error && (
            <div style={{ color: "#dc2626", fontSize: "0.85rem", marginBottom: "1rem", fontWeight: 600 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {requestType === "DELETE" && isClaim ? (
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  Kaldırma Gerekçesi / Not
                </label>
                <textarea
                  required
                  placeholder="İşletme kapandı, devredildi veya artık nöbetçi hizmeti vermiyor..."
                  className="search-input"
                  style={{ width: "100%", height: "90px" }}
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>
            ) : (
              <>
                {/* KATEGORİ SEÇİMİ (Zorunlu) */}
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                    Hizmet Kategorisi
                  </label>
                  <select
                    required
                    className="search-input"
                    style={{ width: "100%", height: "42px", padding: "0 0.5rem" }}
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="">Kategori Seçin...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                    İşletme / Klinik Adı
                  </label>
                  <input
                    type="text"
                    required
                    className="search-input"
                    style={{ width: "100%" }}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {/* İL SEÇİMİ */}
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                      İl
                    </label>
                    <select
                      required
                      className="search-input"
                      style={{ width: "100%", height: "42px", padding: "0 0.5rem" }}
                      value={selectedCityId}
                      onChange={(e) => {
                        const cityId = e.target.value;
                        setSelectedCityId(cityId);
                        const cityObj = ilList.find((c) => c.id === cityId);
                        setFormData({
                          ...formData,
                          city: cityObj ? cityObj.name : "",
                          district: "",
                        });
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
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                      İlçe
                    </label>
                    <select
                      required
                      disabled={!selectedCityId}
                      className="search-input"
                      style={{
                        width: "100%",
                        height: "42px",
                        padding: "0 0.5rem",
                        opacity: selectedCityId ? 1 : 0.6,
                      }}
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    >
                      <option value="">İlçe Seçin...</option>
                      {availableDistricts.map((dist) => (
                        <option key={dist.id} value={dist.name}>
                          {dist.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    required
                    className="search-input"
                    style={{ width: "100%" }}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                    Açık Adres
                  </label>
                  <textarea
                    required
                    className="search-input"
                    style={{ width: "100%", height: "80px", resize: "vertical" }}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                    Açıklama / Çalışma Notu (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Gece 02:00'ye kadar nöbetçi hekimimiz bulunmaktadır."
                    className="search-input"
                    style={{ width: "100%" }}
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="search-button"
              style={{
                marginTop: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                backgroundColor: requestType === "DELETE" && isClaim ? "#dc2626" : "#0f172a",
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Send size={16} />{" "}
              {loading
                ? "İşlem Yapılıyor..."
                : !isClaim
                ? "İşletmeyi Anında Ekle"
                : requestType === "DELETE"
                ? "Silme Talebi Gönder"
                : "Güncelleme Talebi Gönder"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

export default function PlaceAddPage() {
  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", color: "#0f172a" }}>
      <Suspense fallback={<div className="container" style={{ padding: "2rem", textAlign: "center" }}>Yükleniyor...</div>}>
        <FormContent />
      </Suspense>
    </div>
  );
}