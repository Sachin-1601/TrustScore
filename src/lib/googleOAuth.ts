/**
 * Google OAuth 2.0 Utilities for TrustScore
 */

export interface GoogleOAuthState {
  role: "CREATOR" | "BUSINESS";
  action: "login" | "signup";
  timestamp: number;
}

/**
 * Checks if a given string is a validly formatted Google OAuth Web Client ID
 */
export function isValidGoogleClientId(id: string | undefined | null): boolean {
  if (!id || typeof id !== "string") return false;
  const trimmed = id.trim();
  if (
    trimmed === "" ||
    trimmed.includes("your-google-client-id") ||
    trimmed.includes("placeholder") ||
    trimmed.includes("trustscore-app.apps.googleusercontent.com")
  ) {
    return false;
  }
  // Google Web OAuth client IDs end with .apps.googleusercontent.com
  return trimmed.endsWith(".apps.googleusercontent.com");
}

/**
 * Checks if a given string is a validly formatted Google OAuth Client Secret
 */
export function isValidGoogleClientSecret(secret: string | undefined | null): boolean {
  if (!secret || typeof secret !== "string") return false;
  const trimmed = secret.trim();
  if (
    trimmed === "" ||
    trimmed.includes("your-google-client-secret") ||
    trimmed.includes("placeholder")
  ) {
    return false;
  }
  return trimmed.length >= 10;
}

/**
 * Safely reads the Google OAuth Client ID from server environment
 */
export function getGoogleOAuthClientId(): string | null {
  const id = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!isValidGoogleClientId(id)) {
    return null;
  }
  return id!.trim();
}

/**
 * Safely reads the Google OAuth Client Secret from server environment
 * NEVER exposed to client-side code
 */
export function getGoogleOAuthClientSecret(): string | null {
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!isValidGoogleClientSecret(secret)) {
    return null;
  }
  return secret!.trim();
}

/**
 * Determines the exact OAuth callback URL based on request context or environment
 */
export function getOAuthCallbackUrl(req: Request): string {
  // If NEXT_PUBLIC_APP_URL is explicitly set and is not localhost (e.g. in production), use it
  if (
    process.env.NEXT_PUBLIC_APP_URL &&
    process.env.NODE_ENV === "production" &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
  ) {
    const base = process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
    return `${base}/api/auth/google/callback`;
  }

  // Otherwise dynamically determine from incoming HTTP request headers
  const url = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || url.host;
  const proto = req.headers.get("x-forwarded-proto") || (url.protocol.replace(":", "") || "http");
  return `${proto}://${host}/api/auth/google/callback`;
}

/**
 * Builds the official Google OAuth 2.0 authorization URL
 */
export function buildGoogleAuthUrl(clientId: string, redirectUri: string, state: GoogleOAuthState): string {
  const stateEncoded = Buffer.from(JSON.stringify(state)).toString("base64url");
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "select_account");
  authUrl.searchParams.set("state", stateEncoded);
  return authUrl.toString();
}
