import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import { getGoogleOAuthClientId, getGoogleOAuthClientSecret, getOAuthCallbackUrl, GoogleOAuthState } from "@/lib/googleOAuth";
import { UserRole } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    console.log(`[Google OAuth Callback] Processing callback: code=${Boolean(code)}, state=${Boolean(state)}, error=${error || "none"}`);

    // Handle user cancellation or denial at Google authorization screen
    if (error) {
      console.warn("[Google OAuth Callback] Provider error or user cancellation:", error);
      const msg =
        error === "access_denied"
          ? "Google authentication was cancelled."
          : "Google sign-in encountered an error. Please try again or use email and password.";
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(msg)}`, req.url), 302);
    }

    if (!code) {
      console.warn("[Google OAuth Callback] Missing authorization code in query parameters.");
      return NextResponse.redirect(
        new URL("/login?error=Google authentication did not return a valid code. Please try again.", req.url),
        302
      );
    }

    let parsedState: GoogleOAuthState = {
      role: "BUSINESS",
      action: "login",
      timestamp: Date.now(),
    };

    if (state) {
      try {
        parsedState = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
      } catch {
        console.warn("[Google OAuth Callback] Could not parse OAuth state token; using default role.");
      }
    }

    const requestedRole: UserRole = parsedState.role === "CREATOR" ? "CREATOR" : "BUSINESS";
    const clientId = getGoogleOAuthClientId();
    const clientSecret = getGoogleOAuthClientSecret();
    const redirectUri = getOAuthCallbackUrl(req);

    if (!clientId || !clientSecret) {
      console.error("[Google OAuth Callback] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing from server environment.");
      return NextResponse.redirect(
        new URL(
          "/login?error=Google sign-in is temporarily unavailable. Please try again or use email and password.",
          req.url
        ),
        302
      );
    }

    // Exchange authorization code for Google access token
    console.log("[Google OAuth Callback] Exchanging authorization code with Google token endpoint...");
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const tokenErrText = await tokenRes.text();
      console.error("[Google OAuth Callback] Google token exchange failed:", tokenErrText);
      return NextResponse.redirect(
        new URL(
          "/login?error=Unable to complete Google authentication. Please try again or use email and password.",
          req.url
        ),
        302
      );
    }

    const tokenData = await tokenRes.json();
    console.log("[Google OAuth Callback] Token exchange successful. Fetching userinfo...");

    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userinfoRes.ok) {
      console.error("[Google OAuth Callback] Google userinfo fetch failed with status:", userinfoRes.status);
      return NextResponse.redirect(
        new URL(
          "/login?error=Failed to retrieve profile information from Google. Please try again.",
          req.url
        ),
        302
      );
    }

    const googleUser = await userinfoRes.json();

    if (!googleUser?.email) {
      console.error("[Google OAuth Callback] Google profile did not include email address.");
      return NextResponse.redirect(
        new URL(
          "/login?error=Your Google account did not provide a verified email address.",
          req.url
        ),
        302
      );
    }

    const cleanEmail = googleUser.email.toLowerCase().trim();

    // Look up existing user in database
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { creatorProfile: true, businessProfile: true },
    });

    if (!user) {
      console.log(`[Google OAuth Callback] Registering new user (${cleanEmail}) with requested role: ${requestedRole}`);
      // Create new user with selected account type and emailVerifiedAt from Google identity
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          passwordHash: `google_oauth_${Date.now()}`,
          name: googleUser.name || "Google User",
          role: requestedRole,
          avatar: googleUser.picture || undefined,
          emailVerifiedAt: new Date(),
        },
        include: { creatorProfile: true, businessProfile: true },
      });

      if (requestedRole === "CREATOR") {
        const rawUsername = cleanEmail.split("@")[0].replace(/[^a-z0-9_]/gi, "").toLowerCase();
        const username = rawUsername || `creator_${Date.now().toString().slice(-4)}`;
        await prisma.creatorProfile.create({
          data: {
            userId: user.id,
            username: `@${username}`,
            name: googleUser.name || "Creator",
            avatar:
              googleUser.picture ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
            bio: "",
            category: "Lifestyle",
            location: "Global",
            country: "Australia",
            platform: "INSTAGRAM",
            followers: 0,
            startingRate: 250,
            verifiedBadge: false, // Google auth verifies email identity ONLY, not TrustScore social verification
            verifiedAt: null,
            dataCoverage: "INSUFFICIENT",
          },
        });
      } else {
        const companySlug = cleanEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");
        await prisma.businessProfile.create({
          data: {
            userId: user.id,
            slug: `${companySlug}-${Date.now().toString().slice(-4)}`,
            name: googleUser.name ? `${googleUser.name}'s Brand` : "Brand Workspace",
            logo:
              googleUser.picture ||
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
            category: "Brand",
            location: "Global",
            tagline: "",
            description: "",
            website: "",
          },
        });
      }

      // Re-fetch user with relations
      user = await prisma.user.findUnique({
        where: { id: user.id },
        include: { creatorProfile: true, businessProfile: true },
      });
    } else {
      console.log(`[Google OAuth Callback] Existing user found (${cleanEmail}). Preserving assigned role: ${user.role}`);
      if (!user.emailVerifiedAt) {
        // Google auth confirms ownership of this email address
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerifiedAt: new Date() },
        });
      }
    }

    // Set secure session cookie
    if (user) {
      await setSessionCookie({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar || undefined,
        creatorProfileId: user.creatorProfile?.id,
        businessProfileId: user.businessProfile?.id,
      });

      // Preserve existing account type: redirect to user's assigned dashboard
      const targetDashboard =
        user.role === "CREATOR"
          ? "/dashboard/creator"
          : user.role === "ADMIN"
          ? "/admin"
          : "/dashboard";

      console.log(`[Google OAuth Callback] Authentication successful. Redirecting to ${targetDashboard}`);
      return NextResponse.redirect(new URL(targetDashboard, req.url), 302);
    }

    return NextResponse.redirect(
      new URL("/login?error=Failed to establish session. Please try again.", req.url),
      302
    );
  } catch (err: any) {
    console.error("[Google OAuth Callback] Critical error in handler:", err);
    return NextResponse.redirect(
      new URL(
        "/login?error=Google authentication process encountered an error. Please use email and password.",
        req.url
      ),
      302
    );
  }
}
