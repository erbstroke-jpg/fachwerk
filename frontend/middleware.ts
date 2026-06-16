import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "fachwerk_admin_token";
const LOGIN_PATH = "/admin/login";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith("/admin") && pathname !== LOGIN_PATH) {
    const token = request.cookies.get(COOKIE_NAME);
    if (!token) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = LOGIN_PATH;
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in and visiting login page, redirect to admin
  if (pathname === LOGIN_PATH) {
    const token = request.cookies.get(COOKIE_NAME);
    if (token) {
      const adminUrl = request.nextUrl.clone();
      adminUrl.pathname = "/admin";
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
