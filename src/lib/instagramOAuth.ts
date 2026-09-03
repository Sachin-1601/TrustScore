import { SignJWT, jwtVerify } from "jose";

const STATE_TOKEN_EXPIRY = "15m";

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "trustscore-production-secret-jwt-key-fallback-32-chars-minimum";
  return new TextEncoder().encode(secret);
}

export interface InstagramOAuthStatePayload {
  userId: string;
  creatorProfileId?: string;
  timestamp: number;
}

/**
 * Safely reads the Instagram App ID from environment variables
 */
export function getInstagramClientId(): string {
  const envId =
    process.env.INSTAGRAM_APP_ID ||
    process.env.INSTAGRAM_CLIENT_ID ||
    process.env.META_GRAPH_API_CLIENT_ID ||
    process.env.META_APP_ID ||
    process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID ||
    process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;

  if (
    envId &&
    envId.trim().length > 0 &&
    !envId.includes("your-meta-app-id") &&
    !envId.includes("your-instagram-app-id")
  ) {
    return envId.trim();
  }
  return "";
}

/**
 * Safely reads the Instagram App Secret from server environment variables.
 * NEVER exposed to client-side code.
 */
export function getInstagramClientSecret(): string {
  const secret =
    process.env.INSTAGRAM_APP_SECRET ||
    process.env.INSTAGRAM_CLIENT_SECRET ||
    process.env.META_GRAPH_API_CLIENT_SECRET ||
    process.env.META_APP_SECRET;

  if (
    secret &&
    secret.trim().length > 0 &&
    !secret.includes("your-meta-app-secret") &&
    !secret.includes("your-instagram-app-secret")
  ) {
    return secret.trim();
  }
  return "";
}

/**
 * Resolves the configured Meta Graph API version (default v22.0)
 */
export function getInstagramApiVersion(): string {
  return process.env.INSTAGRAM_API_VERSION || "v22.0";
}

/**
 * Resolves the canonical public base URL of the application.
 * Preserves public domain origins (such as ngrok tunnels, reverse proxies, and production domains)
 * instead of falling back to internal localhost bindings.
 */
export function getAppBaseUrl(req?: Request): string {
  // 1. If explicit INSTAGRAM_REDIRECT_URI is set, derive the origin from it (Highest Priority)
  if (process.env.INSTAGRAM_REDIRECT_URI && process.env.INSTAGRAM_REDIRECT_URI.trim().length > 0) {
    try {
      return new URL(process.env.INSTAGRAM_REDIRECT_URI.trim()).origin;
    } catch {
      // safe fallback
    }
  }

  // 2. Extract from incoming HTTP request headers (e.g. ngrok tunnel / reverse proxy)
  if (req) {
    const forwardedHost = req.headers.get("x-forwarded-host");
    const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
    if (forwardedHost) {
      return `${forwardedProto}://${forwardedHost}`;
    }

    const host = req.headers.get("host");
    if (host) {
      const url = new URL(req.url);
      const proto = url.protocol.replace(":", "") || "http";
      return `${proto}://${host}`;
    }
  }

  // 3. If NEXT_PUBLIC_APP_URL is configured
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim().length > 0) {
    return process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/+$/, "");
  }

  // 4. Default localhost development fallback
  return "http://localhost:3000";
}

/**
 * Determines the exact OAuth callback URL based on environment configuration and request context
 */
export function getInstagramOAuthCallbackUrl(req?: Request): string {
  // 1. Explicit canonical environment variable (Highest Priority)
  const explicitUri = process.env.INSTAGRAM_REDIRECT_URI;
  if (explicitUri && explicitUri.trim().length > 0) {
    return explicitUri.trim();
  }

  // 2. Derive callback URL using canonical application base URL
  const baseUrl = getAppBaseUrl(req);
  return `${baseUrl}/api/auth/instagram/callback`;
}

/**
 * Generates a cryptographically signed OAuth state JWT
 */
export async function createInstagramOAuthState(payload: {
  userId: string;
  creatorProfileId?: string;
}): Promise<string> {
  const secretKey = getJwtSecretKey();
  return new SignJWT({
    userId: payload.userId,
    creatorProfileId: payload.creatorProfileId,
    timestamp: Date.now(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(STATE_TOKEN_EXPIRY)
    .sign(secretKey);
}

/**
 * Verifies and decodes the OAuth state JWT
 */
export async function verifyInstagramOAuthState(
  stateToken: string
): Promise<InstagramOAuthStatePayload | null> {
  try {
    const secretKey = getJwtSecretKey();
    const { payload } = await jwtVerify(stateToken, secretKey);
    return {
      userId: payload.userId as string,
      creatorProfileId: payload.creatorProfileId as string | undefined,
      timestamp: (payload.timestamp as number) || Date.now(),
    };
  } catch (err: any) {
    // Return null on expired or invalid token
    return null;
  }
}

/**
 * Builds the official Instagram Login Authorization URL with the configured permissions
 */
export function buildInstagramAuthorizeUrl(
  clientId: string,
  redirectUri: string,
  state: string
): string {
  const authUrl = new URL("https://www.instagram.com/oauth/authorize");
  authUrl.searchParams.set("enable_fb_login", "0");
  authUrl.searchParams.set("force_authentication", "1");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  // Official Instagram Login for Business permissions:
  authUrl.searchParams.set(
    "scope",
    "instagram_business_basic,instagram_business_manage_insights"
  );
  authUrl.searchParams.set("state", state);
  return authUrl.toString();
}

/**
 * Exchanges authorization code for short-lived User Access Token via POST https://api.instagram.com/oauth/access_token
 */
export async function exchangeCodeForInstagramToken(
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; userId: string; permissions?: string[] }> {
  const clientId = getInstagramClientId();
  const clientSecret = getInstagramClientSecret();

  if (!clientId || !clientSecret) {
    throw new Error("Instagram OAuth credentials (App ID / App Secret) are not configured.");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code: code.trim(),
  });

  const response = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const data = await response.json();

  if (!response.ok || data.error_type || data.error_message || !data.access_token) {
    const errorMsg = data.error_message || data.error_type || JSON.stringify(data);
    throw new Error(`Failed to exchange Instagram code: ${errorMsg}`);
  }

  return {
    accessToken: data.access_token,
    userId: String(data.user_id),
    permissions: data.permissions,
  };
}

/**
 * Exchanges a short-lived Instagram User Access Token for a 60-day Long-Lived Token
 * GET https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret={secret}&access_token={token}
 */
export async function exchangeForLongLivedInstagramToken(
  shortLivedToken: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const clientSecret = getInstagramClientSecret();
  if (!clientSecret) {
    throw new Error("Instagram App Secret is required for long-lived token exchange.");
  }

  const url = new URL("https://graph.instagram.com/access_token");
  url.searchParams.set("grant_type", "ig_exchange_token");
  url.searchParams.set("client_secret", clientSecret);
  url.searchParams.set("access_token", shortLivedToken.trim());

  const response = await fetch(url.toString(), { method: "GET" });
  const data = await response.json();

  if (!response.ok || data.error || !data.access_token) {
    // If exchange fails, fallback gracefully to short-lived token (1 hour expiry)
    console.warn("[Instagram OAuth] Long-lived exchange returned error, using short-lived token:", data.error);
    return {
      accessToken: shortLivedToken,
      expiresIn: 3600,
    };
  }

  return {
    accessToken: data.access_token,
    expiresIn: Number(data.expires_in) || 5184000, // 60 days in seconds
  };
}

/**
 * Refreshes an unexpired long-lived Instagram User Access Token (extends for another 60 days)
 * GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token={token}
 */
export async function refreshLongLivedInstagramToken(
  longLivedToken: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", longLivedToken.trim());

  const response = await fetch(url.toString(), { method: "GET" });
  const data = await response.json();

  if (!response.ok || data.error || !data.access_token) {
    throw new Error(`Failed to refresh Instagram long-lived token: ${data.error?.message || "Unknown error"}`);
  }

  return {
    accessToken: data.access_token,
    expiresIn: Number(data.expires_in) || 5184000,
  };
}
