// src/app/layout.tsx
import Header from "@/components/Header"; // Projendeki Header bileşeni
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata = {
  title: "Nöbetçi Nerede | 7/24 Acil Nöbetçi Hizmetleri Rehberi",
  description: "En yakın nöbetçi veteriner, nöbetçi çilingir ve acil hizmet işletmelerine anında ulaşın.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#f8fafc", margin: 0 }}>
        <Header />
        <div style={{ flex: 1 }}>{children}</div>
        <Footer />
      </body>
    </html>
  );
}