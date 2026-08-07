import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Sadece yönetim paneli sayfalarını korumaya al (Örn: /admin ile başlayanlar)
  if (req.nextUrl.pathname.startsWith("/yonetim")) {
    const basicAuth = req.headers.get("authorization");

    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1];
      const [user, pwd] = atob(authValue).split(":");

      if (user === process.env.ADMIN_USER && pwd === process.env.ADMIN_PASS) {
        return NextResponse.next();
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