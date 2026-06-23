import { NextResponse } from "next/server";

export function proxy(request) {

  console.log("🔥 PROXY WORKING:", request.nextUrl.pathname);

  const { pathname } = request.nextUrl;

  const adminCookie = request.cookies.get("admin");

  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    !adminCookie
  ) {
    console.log("REDIRECT TO LOGIN");

    return NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
  }

  return NextResponse.next();
}


export const config = {
  matcher: ["/admin/:path*"],
};