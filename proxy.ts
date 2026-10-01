import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "./app/lib/adminAuth";

const ADMIN_PAGES = ["/admin/dashboard"];
const ADMIN_API = [
  "/api/products",
  "/api/categories",
  "/api/orders",
  "/api/stats",
  "/api/upload",
];

function matches(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Endpoints a logged-out visitor is allowed to reach, all POST only so that
 * reading orders stays admin-only. Everything else under the admin API prefixes
 * still needs the signed session cookie.
 */
const PUBLIC_API_POST_PATHS = [
  "/api/orders", // checkout
  "/api/orders/track", // customer order tracking
];

function isPublicApiPost(pathname: string, method: string): boolean {
  if (method !== "POST") return false;
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return PUBLIC_API_POST_PATHS.some((path) => normalized === path);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (matches(pathname, ADMIN_PAGES) && !request.cookies.get(SESSION_COOKIE)) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (matches(pathname, ADMIN_API)) {
    const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE));

    if (!hasSessionCookie && !isPublicApiPost(pathname, request.method)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/api/products/:path*",
    "/api/categories/:path*",
    "/api/orders/:path*",
    "/api/stats/:path*",
    "/api/upload/:path*",
  ],
};
