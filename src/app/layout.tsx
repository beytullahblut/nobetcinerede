// src/app/layout.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script"; // 1. Script bileşenini içeri aktarıyoruz
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
      <head>
        {/* 2. AdSense kodunu <head> etiketleri arasına ekliyoruz */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5403653799496940"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#f8fafc", margin: 0 }}>
        <Header />
        <div style={{ flex: 1 }}>{children}</div>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}