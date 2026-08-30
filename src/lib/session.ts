import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";

export const SESSION_COOKIE_NAME = "trustscore_session";
const SESSION_EXPIRY = "30d";
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

const getSecretKey = () => {
  const secret = process.env.AUTH_SECRET || "trustscore-super-secure-jwt-signing-secret-key-32-chars";
  return new TextEncoder().encode(secret);
};

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  creatorId?: string;
  businessId?: string;
  creatorProfileId?: string;
  businessProfileId?: string;
}

/**
 * Sign a new JWT session token
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const secretKey = getSecretKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRY)
    .sign(secretKey);
}

/**
 * Verify and decode an existing JWT session token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Retrieve the current authenticated server session from cookies (Server Components, Route Handlers, Server Actions)
 */
export async function getServerSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Set the HTTP-only secure session cookie on a response or cookie store
 */
export async function setSessionCookie(payload: SessionPayload): Promise<string> {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return token;
}

/**
 * Clear session cookie on logout
 */
export async function clearSessionCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch {
    // Ignore error if cookie store is immutable in current context
  }
}
