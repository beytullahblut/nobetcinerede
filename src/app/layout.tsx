// src/app/layout.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata = {
  title: "Nöbetçi Nerede | 7/24 Acil Nöbetçi Hizmetleri Rehberi",
  description: "En yakın nöbetçi veteriner, nöbetçi çilingir ve acil hizmet işletmelerine anında ulaşın.",
  openGraph: {
    title: "Nöbetçi Nerede | 7/24 Acil Nöbetçi Hizmetleri Rehberi",
    description: "En yakın nöbetçi veteriner, nöbetçi çilingir ve acil hizmet işletmelerine anında ulaşın.",
    url: "https://nobetcinerede.com",
    siteName: "Nöbetçi Nerede",
    images: [
      {
        url: "https://nobetcinerede.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nöbetçi Nerede Önizleme Görseli",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nöbetçi Nerede | 7/24 Acil Nöbetçi Hizmetleri Rehberi",
    description: "En yakın nöbetçi veteriner, nöbetçi çilingir ve acil hizmet işletmelerine anında ulaşın.",
    images: ["https://nobetcinerede.com/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#f8fafc", margin: 0 }}>
        <Header />
        <div style={{ flex: 1 }}>{children}</div>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}