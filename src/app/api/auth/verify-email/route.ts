import { NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { setSessionCookie } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/login?error=Invalid or missing verification link. Please request a new one.", req.url),
        302
      );
    }

    const result = await AuthService.verifyEmailToken(token);

    if (!result.success || !result.user) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(result.error || "Email verification failed.")}`, req.url),
        302
      );
    }

    // Email is verified! Establish session
    await setSessionCookie({
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role as any,
      avatar: result.user.avatar,
      creatorProfileId: result.user.creatorProfileId,
      businessProfileId: result.user.businessProfileId,
    });

    const targetDashboard =
      result.user.role === "CREATOR"
        ? "/dashboard/creator"
        : result.user.role === "ADMIN"
        ? "/admin"
        : "/dashboard";

    return NextResponse.redirect(new URL(targetDashboard, req.url), 302);
  } catch (err: any) {
    console.error("Email verification route error:", err);
    return NextResponse.redirect(
      new URL("/login?error=Verification encountered an unexpected error. Please try again.", req.url),
      302
    );
  }
}
