import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function NobetciEczanelerPage() {
  return (
    <main style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Üst Geri Dönüş Linki */}
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#64748b", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}>
            <ArrowLeft size={16} /> Ana Sayfaya Dön
          </Link>
        </div>

        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem", textAlign: "center" }}>
            Türkiye Nöbetçi Eczaneler Listesi
          </h1>
          <p style={{ color: "#64748b", textAlign: "center", marginBottom: "2rem", fontSize: "0.95rem" }}>
            Bulunduğunuz il ve ilçedeki nöbetçi eczaneleri aşağıdan güncel olarak listeleyebilirsiniz.
          </p>

          {/* Paylaştığınız Widget Kodunun Uyarlanmış Hali */}
          <div style={{ margin: "auto", textAlign: "center", width: "100%", maxWidth: "600px" }}>
            <a href="https://www.eczaneler.gen.tr/" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://www.eczaneler.gen.tr/resimler/turkiye-nobetci-eczaneleri.jpg" 
                alt="Nöbetçi Eczaneler" 
                style={{ borderRadius: "8px", width: "100%", marginBottom: "1rem", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} 
              />
            </a>
            <iframe 
              src="https://www.eczaneler.gen.tr/turkiye.php" 
              title="Nöbetçi Eczaneler" 
              style={{ width: "100%", height: "600px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
            ></iframe>
          </div>

          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <a 
              href="https://www.eczaneler.gen.tr/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "#2563eb", textDecoration: "none", fontWeight: 600 }}
            >
              <ExternalLink size={14} /> Kaynağa Git (eczaneler.gen.tr)
            </a>
          </div>
        </div>

      </div>
    </main>
  );
}