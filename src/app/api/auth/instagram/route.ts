import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import {
  getInstagramClientId,
  getInstagramOAuthCallbackUrl,
  createInstagramOAuthState,
  buildInstagramAuthorizeUrl,
} from "@/lib/instagramOAuth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== "CREATOR" && session.role !== "ADMIN") {
      const fallbackUrl = new URL("/dashboard/businesses", req.url);
      return NextResponse.redirect(fallbackUrl);
    }

    const clientId = getInstagramClientId();
    if (!clientId) {
      const errorUrl = new URL(
        "/dashboard/creator/verification?error=Instagram+App+ID+is+not+configured+in+environment",
        req.url
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
      req.url
    );
    return NextResponse.redirect(errorUrl);
  }
}
