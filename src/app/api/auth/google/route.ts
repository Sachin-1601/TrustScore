import { NextResponse } from "next/server";
import { getGoogleOAuthClientId, getOAuthCallbackUrl, buildGoogleAuthUrl } from "@/lib/googleOAuth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "business";
    const action = (searchParams.get("action") as "login" | "signup") || "login";
    const role = type.toLowerCase() === "creator" ? "CREATOR" : "BUSINESS";

    const clientId = getGoogleOAuthClientId();
    const redirectUri = getOAuthCallbackUrl(req);

    console.log(`[Google OAuth] Initiating ${action} flow for role: ${role}`);
    console.log(`[Google OAuth] Redirect URI: ${redirectUri}`);

    // Build the official Google OAuth 2.0 authorization URL
    const googleAuthUrl = buildGoogleAuthUrl(clientId, redirectUri, {
      role,
      action,
      timestamp: Date.now(),
    });

    console.log(`[Google OAuth] Redirecting to Google: ${googleAuthUrl}`);
    // Always execute a 302 Found redirect directly to Google authorization page
    return NextResponse.redirect(googleAuthUrl, 302);
  } catch (err: any) {
    console.error("[Google OAuth] Initialization error:", err);
    return NextResponse.redirect(
      new URL("/login?error=Google sign-in could not be opened. Please try again.", req.url),
      302
    );
  }
}
