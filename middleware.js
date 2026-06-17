import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin");

  const isLoggedIn = req.cookies.get("admin")?.value === "true";

  // ✅ لو داخل login سيبه عادي
  if (isLoginPage) {
    return NextResponse.next();
  }

  // ❌ لو داخل admin ومش عامل login → روح login
  if (isAdminRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};