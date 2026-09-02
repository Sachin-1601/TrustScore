import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // 1. Unauthenticated users trying to access dashboard/admin routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Canonical /dashboard redirect
    if (pathname === "/dashboard") {
      if (session.role === "CREATOR") {
        return NextResponse.redirect(new URL("/dashboard/creator", request.url));
      } else if (session.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard/businesses", request.url));
      }
    }

    // 3. Creator trying to access Business dashboard
    if (session.role === "CREATOR" && pathname.startsWith("/dashboard/businesses")) {
      return NextResponse.redirect(new URL("/dashboard/creator", request.url));
    }

    // 4. Business trying to access Creator dashboard
    if (
      (session.role === "BUSINESS" || session.role === "AGENCY") &&
      pathname.startsWith("/dashboard/creator")
    ) {
      return NextResponse.redirect(new URL("/dashboard/businesses", request.url));
    }

    // 5. Non-admin trying to access Admin console
    if (
      session.role !== "ADMIN" &&
      (pathname.startsWith("/admin") || pathname === "/dashboard/model-insights")
    ) {
      const dest = session.role === "CREATOR" ? "/dashboard/creator" : "/dashboard/businesses";
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
