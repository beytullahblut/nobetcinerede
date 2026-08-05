// src/app/gizlilik/page.tsx
export default function GizlilikPage() {
  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 1rem", color: "#334155", lineHeight: "1.7" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem" }}>
        Gizlilik Politikası ve Sorumluluk Reddi
      </h1>

      <section style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "1.5rem" }}>
        <h2 id="sorumluluk-reddi" style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem" }}>
          1. Sorumluluk Reddi Beyanı (Disclaimer)
        </h2>
        <p style={{ fontSize: "0.9rem" }}>
          <strong>nobetcinerede.com</strong>, kullanıcıların acil durumlarda 7/24 hizmet veren nöbetçi işletmelere (veteriner, çilingir, lastikçi vb.) ulaşmasını kolaylaştırmak amacıyla kamuya açık kaynaklardan ve kullanıcı bildirimlerinden derlenmiş verileri sunar.
        </p>
        <p style={{ fontSize: "0.9rem" }}>
          Sitemizde yer alan bilgilerin doğruluğu ve güncelliği için azami çaba gösterilmekle birlikte, işletmelerin anlık çalışma saatlerindeki, adres veya telefonlarındaki değişikliklerden sitemiz doğrudan <strong>sorumlu tutulamaz</strong>. Hizmet almadan önce işletmeler ile iletişime geçilmesi tavsiye edilir.
        </p>
      </section>

      <section style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem" }}>
          2. Gizlilik Politikası ve Çerezler
        </h2>
        <p style={{ fontSize: "0.9rem" }}>
          Platformumuz, ziyaretçilerin kişisel verilerini (ad, soyad, T.C. kimlik numarası vb.) izinsiz olarak toplamaz. Kullanıcı deneyimini iyileştirmek ve harita servislerinin (Google Maps) düzgün çalışabilmesi adına teknik çerezler (cookies) kullanılabilir.
        </p>
      </section>

      <section style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem" }}>
          3. İçerik Kaldırma ve Hak Sahipliği
        </h2>
        <p style={{ fontSize: "0.9rem" }}>
          İşletme sahibi olarak sitemizde yer alan bilgilerinizi güncellemek veya sitemizden tamamen kaldırılmasını talep etmek için <a href="/iletisim" style={{ color: "#dc2626", fontWeight: 600 }}>İletişim</a> sayfamız üzerinden bizimle iletişime geçebilirsiniz. Talepleriniz en geç 48 saat içerisinde işleme alınacaktır.
        </p>
      </section>
    </main>
  );
}