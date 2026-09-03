import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import {
  getInstagramClientId,
  getInstagramOAuthCallbackUrl,
  getAppBaseUrl,
  createInstagramOAuthState,
  buildInstagramAuthorizeUrl,
} from "@/lib/instagramOAuth";

export async function GET(req: Request) {
  const baseUrl = getAppBaseUrl(req);

  try {
    const session = await getServerSession();
    if (!session) {
      const loginUrl = new URL("/login", baseUrl);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== "CREATOR" && session.role !== "ADMIN") {
      const fallbackUrl = new URL("/dashboard/businesses", baseUrl);
      return NextResponse.redirect(fallbackUrl);
    }

    const clientId = getInstagramClientId();
    if (!clientId) {
      const errorUrl = new URL(
        "/dashboard/creator/verification?error=Instagram+App+ID+is+not+configured+in+environment",
        baseUrl
      );
      return NextResponse.redirect(errorUrl);
    }

    const redirectUri = getInstagramOAuthCallbackUrl(req);
    const state = await createInstagramOAuthState({
      userId: session.userId,
      creatorProfileId: session.creatorProfileId,
    });

    const authorizeUrl = buildInstagramAuthorizeUrl(clientId, redirectUri, state);
    return NextResponse.redirect(authorizeUrl);
  } catch (err: any) {
    console.error("[Instagram OAuth] Failed to initialize authorization:", err);
    const errorUrl = new URL(
      `/dashboard/creator/verification?error=${encodeURIComponent(err.message || "Failed to initialize Instagram authorization")}`,
      baseUrl
    );
    return NextResponse.redirect(errorUrl);
  }
}
