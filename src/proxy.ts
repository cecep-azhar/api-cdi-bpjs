import { NextRequest, NextResponse } from "next/server";

/**
 * ============================================
 * CDI BPJS - Medical Data Synchronization API
 * ============================================
 * Author    : Cecep Saeful Azhar Hidayat, ST
 * WhatsApp  : 0852-2069-6117
 * Email     : cecepazhar126@gmail.com
 * ============================================
 */

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /admin routes
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("admin_token")?.value;
    if (!token || token !== process.env.ADMIN_SECRET) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
