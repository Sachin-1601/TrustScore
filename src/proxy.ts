import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // 1. Unauthenticated users trying to access protected dashboard/admin/onboarding routes
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/onboarding")
  ) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    const isOnboardingComplete = session.onboardingCompleted === true;

    // 2. ADMIN Role Routing
    if (session.role === "ADMIN") {
      if (pathname.startsWith("/onboarding") || pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // 3. CREATOR Role Routing
    if (session.role === "CREATOR") {
      if (!isOnboardingComplete) {
        // Creator must finish onboarding before accessing dashboard or cross-role onboarding
        if (pathname !== "/onboarding/creator") {
          return NextResponse.redirect(new URL("/onboarding/creator", request.url));
        }
        return NextResponse.next();
      }

      // Onboarding complete - blocked from re-entering onboarding or business dashboard
      if (pathname.startsWith("/onboarding")) {
        return NextResponse.redirect(new URL("/dashboard/creator", request.url));
      }
      if (pathname === "/dashboard" || pathname.startsWith("/dashboard/businesses") || pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/dashboard/creator", request.url));
      }
      return NextResponse.next();
    }

    // 4. BUSINESS & AGENCY Role Routing
    if (session.role === "BUSINESS" || session.role === "AGENCY") {
      if (!isOnboardingComplete) {
        // Business must finish onboarding before accessing dashboard or cross-role onboarding
        if (pathname !== "/onboarding/business") {
          return NextResponse.redirect(new URL("/onboarding/business", request.url));
        }
        return NextResponse.next();
      }

      // Onboarding complete - blocked from re-entering onboarding or creator dashboard
      if (pathname.startsWith("/onboarding")) {
        return NextResponse.redirect(new URL("/dashboard/businesses", request.url));
      }
      if (pathname === "/dashboard" || pathname.startsWith("/dashboard/creator") || pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/dashboard/businesses", request.url));
      }
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/onboarding/:path*"],
};
