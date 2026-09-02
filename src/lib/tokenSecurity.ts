import crypto from "crypto";

export const EMAIL_VERIFICATION_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

export interface VerificationTokenPair {
  rawToken: string;
  tokenHash: string;
  expiresAt: Date;
}

/**
 * Generate a cryptographically secure, time-limited email verification token.
 * Raw token is sent to user via email; only SHA-256 hash is stored in PostgreSQL.
 */
export function generateVerificationToken(expiryMs: number = EMAIL_VERIFICATION_EXPIRY_MS): VerificationTokenPair {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashVerificationToken(rawToken);
  const expiresAt = new Date(Date.now() + expiryMs);

  return {
    rawToken,
    tokenHash,
    expiresAt,
  };
}

/**
 * Compute SHA-256 hex digest of a raw verification token.
 */
export function hashVerificationToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}
