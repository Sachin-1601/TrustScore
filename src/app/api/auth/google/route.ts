import { NextResponse } from "next/server";
import { getGoogleOAuthClientId, getOAuthCallbackUrl, buildGoogleAuthUrl } from "@/lib/googleOAuth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "business";
    const action = (searchParams.get("action") as "login" | "signup") || "login";
    const role = type.toLowerCase() === "creator" ? "CREATOR" : "BUSINESS";

    const clientId = getGoogleOAuthClientId();
    const returnPath = action === "signup" ? "/signup" : "/login";
    const redirectUri = getOAuthCallbackUrl(req);

    console.log(`[Google OAuth] Initiating ${action} flow:`);
    console.log(`  - Account Type: ${role}`);
    console.log(`  - Client ID Configured: ${Boolean(clientId)}`);
    console.log(`  - Callback URI: ${redirectUri}`);

    // If Google OAuth is not configured with real credentials, provide a professional user-facing error message
    if (!clientId) {
      console.warn("[Google OAuth] GOOGLE_CLIENT_ID is missing or not a valid Google Client ID ending with .apps.googleusercontent.com in environment.");
      const redirectUrl = new URL(returnPath, req.url);
      redirectUrl.searchParams.set("type", type);
      redirectUrl.searchParams.set(
        "error",
        "Google sign-in is temporarily unavailable. Please try again or use email and password."
      );
      return NextResponse.redirect(redirectUrl, 302);
    }

    const googleAuthUrl = buildGoogleAuthUrl(clientId, redirectUri, {
      role,
      action,
      timestamp: Date.now(),
    });

    return NextResponse.redirect(googleAuthUrl, 302);
  } catch (err: any) {
    console.error("[Google OAuth] Initialization error:", err);
    return NextResponse.redirect(
      new URL("/login?error=Google sign-in is temporarily unavailable. Please try again or use email and password.", req.url),
      302
    );
  }
}
