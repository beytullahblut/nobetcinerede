// src/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#0f172a", color: "#94a3b8", padding: "3rem 1rem 1.5rem 1rem", marginTop: "auto" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem" }}>
        {/* Proje Detayı */}
        <div>
          <h4 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.75rem" }}>
            nobetcinerede<span style={{ color: "#dc2626" }}>.com</span>
          </h4>
          <p style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>
            Türkiye genelinde acil ve 7/24 nöbetçi hizmet veren veteriner, çilingir, oto çekici ve sağlık kuruluşlarını tek noktada buluşturan bağımsız rehber platformu.
          </p>
        </div>

        {/* Hızlı Linkler */}
        <div>
          <h5 style={{ color: "#ffffff", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.75rem" }}>Hızlı Bağlantılar</h5>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li><Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Ana Sayfa</Link></li>
            <li><Link href="/ekle" style={{ color: "inherit", textDecoration: "none" }}>İşletme Ekle / Güncelle</Link></li>
            <li><Link href="/iletisim" style={{ color: "inherit", textDecoration: "none" }}>İletişim & Telif Kaldırma</Link></li>
          </ul>
        </div>

        {/* Yasal */}
        <div>
          <h5 style={{ color: "#ffffff", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.75rem" }}>Yasal</h5>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li><Link href="/gizlilik" style={{ color: "inherit", textDecoration: "none" }}>Gizlilik Politikası</Link></li>
            <li><Link href="/gizlilik#sorumluluk-reddi" style={{ color: "inherit", textDecoration: "none" }}>Sorumluluk Reddi Beyanı</Link></li>
          </ul>
        </div>

        {/* İletişim */}
        <div>
          <h5 style={{ color: "#ffffff", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.75rem" }}>Bize Ulaşın</h5>
          <p style={{ fontSize: "0.85rem", margin: "0 0 0.5rem 0" }}>Hatalı işletme bildirimi veya telif/kaldırma talepleri için:</p>
          <a href="mailto:iletisim@nobetcinerede.com" style={{ color: "#38bdf8", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
            iletisim@nobetcinerede.com
          </a>
        </div>
      </div>

      {/* Alt Copyright Çizgisi */}
      <div style={{ borderTop: "1px solid #1e293b", maxWidth: "1000px", margin: "2rem auto 0 auto", paddingTop: "1.25rem", textAlign: "center", fontSize: "0.75rem" }}>
        © {new Date().getFullYear()} nobetcinerede.com - Tüm hakları saklıdır. Sitede yer alan veriler bilgilendirme amaçlıdır.
      </div>
    </footer>
  );
}