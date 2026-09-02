/**
 * Google OAuth 2.0 Utilities for TrustScore
 */

export interface GoogleOAuthState {
  role: "CREATOR" | "BUSINESS";
  action: "login" | "signup";
  timestamp: number;
}

// Default Google OAuth 2.0 Web Client ID
export const DEFAULT_GOOGLE_CLIENT_ID = "839201948271-9u3hf8r93hf983hfl3j4b5n6m7k8.apps.googleusercontent.com";

/**
 * Safely reads the Google OAuth Client ID from environment or returns default client ID
 */
export function getGoogleOAuthClientId(): string {
  const envId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (envId && envId.trim().length > 0 && !envId.includes("your-google-client-id")) {
    return envId.trim();
  }
  return DEFAULT_GOOGLE_CLIENT_ID;
}

/**
 * Safely reads the Google OAuth Client Secret from server environment
 * NEVER exposed to client-side code
 */
export function getGoogleOAuthClientSecret(): string | null {
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!secret || secret.trim().length === 0 || secret.includes("your-google-client-secret")) {
    return null;
  }
  return secret.trim();
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
