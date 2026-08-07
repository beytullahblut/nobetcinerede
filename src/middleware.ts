import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Sadece yönetim paneli sayfalarını korumaya al
  if (req.nextUrl.pathname.startsWith("/yonetim")) {
    const basicAuth = req.headers.get("authorization");

    if (basicAuth) {
      try {
        const authValue = basicAuth.split(" ")[1];
        // atob yerine Buffer kullanarak base64 çözme (Daha güvenli ve uyumlu)
        const [user, pwd] = Buffer.from(authValue, "base64").toString("ascii").split(":");

        // process.env değerlerinin tanımlı olduğundan emin oluyoruz
        if (
          user === process.env.ADMIN_USER && 
          pwd === process.env.ADMIN_PASS &&
          process.env.ADMIN_USER !== undefined &&
          process.env.ADMIN_PASS !== undefined
        ) {
          return NextResponse.next();
        }
      } catch (error) {
        console.error("Auth hatası:", error);
      }
    }

    // Giriş başarısızsa veya hiç bilgi girilmediyse
    return new NextResponse("Yetkisiz Erişim!", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic" },
    });
  }

  return NextResponse.next();
}