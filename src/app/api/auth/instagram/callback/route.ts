import { NextResponse } from "next/server";
import {
  verifyInstagramOAuthState,
  getInstagramOAuthCallbackUrl,
  getAppBaseUrl,
  exchangeCodeForInstagramToken,
  exchangeForLongLivedInstagramToken,
} from "@/lib/instagramOAuth";
import { encryptSecret } from "@/lib/encryption";
import { prisma } from "@/lib/prisma";
import { InstagramService } from "@/services/instagramService";

export async function GET(req: Request) {
  const baseUrl = getAppBaseUrl(req);

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");
    const errorReason = searchParams.get("error_reason");
    const errorDescription = searchParams.get("error_description");

    if (errorParam || errorReason) {
      console.warn("[Instagram OAuth Callback] OAuth error from Meta:", errorParam, errorDescription);
      const destUrl = new URL(
        `/dashboard/creator/verification?error=${encodeURIComponent(errorDescription || errorReason || "Instagram authorization was declined")}`,
        baseUrl
      );
      return NextResponse.redirect(destUrl);
    }

    if (!code || !state) {
      const destUrl = new URL(
        "/dashboard/creator/verification?error=Missing+authorization+code+or+state+parameter",
        baseUrl
      );
      return NextResponse.redirect(destUrl);
    }

    // 1. Verify Signed OAuth State
    const stateData = await verifyInstagramOAuthState(state);
    if (!stateData || !stateData.userId) {
      const destUrl = new URL(
        "/dashboard/creator/verification?error=Invalid+or+expired+Instagram+OAuth+session.+Please+try+again.",
        baseUrl
      );
      return NextResponse.redirect(destUrl);
    }

    const userId = stateData.userId;
    const redirectUri = getInstagramOAuthCallbackUrl(req);

    // 2. Exchange Code for Short-Lived User Access Token
    const shortLived = await exchangeCodeForInstagramToken(code, redirectUri);

    // 3. Exchange for 60-Day Long-Lived Token
    const longLived = await exchangeForLongLivedInstagramToken(shortLived.accessToken);
    const tokenToPersist = longLived.accessToken || shortLived.accessToken;
    const tokenExpiresAt = new Date(Date.now() + (longLived.expiresIn || 5184000) * 1000);

    // 4. Encrypt Access Token Before Storage (Never store or log plaintext tokens)
    const encryptedToken = encryptSecret(tokenToPersist);

    // 5. Ensure CreatorProfile exists for the user
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { creatorProfile: true },
    });

    if (!user) {
      const destUrl = new URL("/login?error=User+not+found", baseUrl);
      return NextResponse.redirect(destUrl);
    }

    let creatorProfile = user.creatorProfile;
    if (!creatorProfile) {
      const defaultUsername = `@${user.name.replace(/\s+/g, "").toLowerCase() || "creator"}`;
      creatorProfile = await prisma.creatorProfile.create({
        data: {
          userId: user.id,
          username: defaultUsername,
          name: user.name,
          avatar: user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          bio: "Verified Instagram Content Creator",
          category: "Lifestyle",
          location: "Global",
          country: "Australia",
          platform: "INSTAGRAM",
          startingRate: 350,
          availabilityStatus: "OPEN_TO_WORK",
          verifiedBadge: true,
          verifiedAt: new Date(),
        },
      });
    }

    // 6. Save Encrypted Token to SocialAccount
    await prisma.socialAccount.upsert({
      where: {
        platform_externalId: {
          platform: "INSTAGRAM",
          externalId: shortLived.userId,
        },
      },
      create: {
        creatorId: creatorProfile.id,
        platform: "INSTAGRAM",
        externalId: shortLived.userId,
        username: "instagram_user",
        oauthTokenEnc: encryptedToken,
        tokenExpiresAt,
        isVerified: true,
        lastSyncedAt: new Date(),
      },
      update: {
        creatorId: creatorProfile.id,
        oauthTokenEnc: encryptedToken,
        tokenExpiresAt,
        isVerified: true,
        lastSyncedAt: new Date(),
      },
    });

    // 7. Synchronize Live Profile, Media, and Bayesian Score
    try {
      await InstagramService.syncInstagramDataForCreator(userId, tokenToPersist);
    } catch (syncErr: any) {
      console.warn("[Instagram OAuth Callback] Initial profile telemetry sync had warnings:", syncErr.message);
    }

    const successUrl = new URL(
      "/dashboard/creator/verification?instagram=connected",
      baseUrl
    );
    return NextResponse.redirect(successUrl);
  } catch (err: any) {
    console.error("[Instagram OAuth Callback] Critical error:", err);
    const destUrl = new URL(
      `/dashboard/creator/verification?error=${encodeURIComponent(err.message || "Instagram authentication failed")}`,
      baseUrl
    );
    return NextResponse.redirect(destUrl);
  }
}
