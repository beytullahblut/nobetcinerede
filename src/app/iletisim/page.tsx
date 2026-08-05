// src/app/iletisim/page.tsx
"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function IletisimPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 1rem" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
        İletişim & Telif Bildirimi
      </h1>
      <p style={{ color: "#64748b", marginBottom: "2rem", lineHeight: "1.6" }}>
        Sitemizde yer alan işletmenizle ilgili bilgi güncellemesi, kaydın silinmesi veya görüş/önerileriniz için aşağıdaki formu doldurabilir ya da doğrudan e-posta gönderebilirsiniz.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
        {/* Sol: İletişim Bilgileri */}
        <div style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: "1rem" }}>
            Doğrudan Ulaşın
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "0.9rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#334155" }}>
              <Mail color="#dc2626" size={20} />
              <div>
                <strong style={{ display: "block", fontSize: "0.8rem", color: "#64748b" }}>E-Posta</strong>
                iletisim@nobetcinerede.com
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#334155" }}>
              <MapPin color="#dc2626" size={20} />
              <div>
                <strong style={{ display: "block", fontSize: "0.8rem", color: "#64748b" }}>Konum</strong>
                Türkiye
              </div>
            </div>
          </div>

          <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "#f1f5f9", borderRadius: "8px", fontSize: "0.8rem", color: "#475569" }}>
            💡 <strong>İşletme Kaldırma Talepleri:</strong> Lütfen e-postanızda veya mesajınızda kaldırmak istediğiniz işletme adını ve yetkili iletişim numaranızı açıkça belirtiniz.
          </div>
        </div>

        {/* Sağ: İletişim Formu */}
        <div style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "2rem 1rem", color: "#16a34a" }}>
              <CheckCircle2 size={48} style={{ margin: "0 auto 1rem auto" }} />
              <h3 style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: "0.5rem" }}>Mesajınız Alındı!</h3>
              <p style={{ fontSize: "0.9rem", color: "#64748b" }}>İncelendikten sonra en kısa sürede dönüş yapılacaktır.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "0.3rem" }}>Adınız Soyadınız</label>
                <input required type="text" placeholder="Orh..." className="search-input" style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "0.3rem" }}>E-Posta Adresiniz</label>
                <input required type="email" placeholder="ornek@email.com" className="search-input" style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "0.3rem" }}>Konu</label>
                <select className="search-input" style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }}>
                  <option value="güncelleme">İşletme Bilgisi Güncelleme</option>
                  <option value="kaldırma">İşletme Kaydı Kaldırma Talebi</option>
                  <option value="hata">Hatalı Nöbetçi Bildirimi</option>
                  <option value="diğer">Diğer / Genel İletişim</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "0.3rem" }}>Mesajınız</label>
                <textarea required rows={4} placeholder="Talebinizi detaylandırın..." className="search-input" style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }}></textarea>
              </div>
              <button type="submit" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", backgroundColor: "#dc2626", color: "#ffffff", padding: "0.75rem", borderRadius: "8px", border: "none", fontWeight: 700, cursor: "pointer" }}>
                <Send size={16} /> Gönder
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}