import { AuthService } from "../services/authService";
import { POST as signupApiHandler } from "../app/api/auth/signup/route";
import { POST as loginApiHandler } from "../app/api/auth/login/route";
import { POST as resendApiHandler } from "../app/api/auth/resend-verification/route";
import { GET as verifyEmailApiHandler } from "../app/api/auth/verify-email/route";
import { GET as googleCallbackApiHandler } from "../app/api/auth/google/callback/route";
import { prisma } from "../lib/prisma";
import { hashVerificationToken, generateVerificationToken } from "../lib/tokenSecurity";

async function runEmailVerificationTestSuite() {
  console.log("==================================================");
  console.log("🧪 Running TrustScore Email Ownership Verification Tests");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  const timestamp = Date.now();
  const createdUserIds: string[] = [];

  // =========================================================================
  // 1. Creator Signup Creates Unverified User & Token
  // =========================================================================
  console.log("\n[1] Testing Creator Signup & Unverified Initial State");
  const creatorEmail = `creator.verify.${timestamp}@gmail.com`;
  const creatorSignupReq = new Request("http://localhost:3000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: creatorEmail,
      password: "SecurePassword123!",
      name: "Creator Verification Test",
      role: "CREATOR",
      handleOrCompany: `creator_verify_${timestamp}`,
    }),
  });

  const creatorSignupRes = await signupApiHandler(creatorSignupReq);
  assert(creatorSignupRes.status === 201, "Creator signup returns HTTP 201 Created");

  const creatorSignupBody = await creatorSignupRes.json();
  assert(creatorSignupBody.success === true, "Signup response has success=true");
  assert(creatorSignupBody.requiresVerification === true, "Signup response indicates requiresVerification=true");
  assert(creatorSignupBody.session === undefined, "Signup response does NOT contain an authenticated session");

  const creatorDbUser = await prisma.user.findUnique({
    where: { email: creatorEmail },
    include: { creatorProfile: true, emailVerificationTokens: true },
  });
  assert(creatorDbUser !== null, "Creator User record exists in database");
  assert(creatorDbUser?.emailVerifiedAt === null, "Creator emailVerifiedAt is NULL upon signup");
  assert(creatorDbUser?.role === "CREATOR", "Creator role is preserved as CREATOR");
  assert(creatorDbUser?.creatorProfile !== null, "CreatorProfile created for user");
  assert(creatorDbUser?.emailVerificationTokens.length === 1, "Exactly one EmailVerificationToken created");

  if (creatorDbUser) createdUserIds.push(creatorDbUser.id);

  // =========================================================================
  // 2. Business Signup Creates Unverified User & Token
  // =========================================================================
  console.log("\n[2] Testing Business Signup & Unverified Initial State");
  const businessEmail = `business.verify.${timestamp}@enterprise-corp.com`;
  const businessSignupReq = new Request("http://localhost:3000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: businessEmail,
      password: "SecurePassword123!",
      name: "Business Verification Test",
      role: "BUSINESS",
      handleOrCompany: `Enterprise Corp ${timestamp}`,
    }),
  });

  const businessSignupRes = await signupApiHandler(businessSignupReq);
  assert(businessSignupRes.status === 201, "Business signup returns HTTP 201 Created");

  const businessSignupBody = await businessSignupRes.json();
  assert(businessSignupBody.success === true, "Business signup response has success=true");
  assert(businessSignupBody.requiresVerification === true, "Business signup response has requiresVerification=true");
  assert(businessSignupBody.session === undefined, "Business signup does NOT return session");

  const businessDbUser = await prisma.user.findUnique({
    where: { email: businessEmail },
    include: { businessProfile: true, emailVerificationTokens: true },
  });
  assert(businessDbUser !== null, "Business User record exists in database");
  assert(businessDbUser?.emailVerifiedAt === null, "Business emailVerifiedAt is NULL upon signup");
  assert(businessDbUser?.role === "BUSINESS", "Business role is preserved as BUSINESS");
  assert(businessDbUser?.businessProfile !== null, "BusinessProfile created for user");
  assert(businessDbUser?.emailVerificationTokens.length === 1, "Exactly one EmailVerificationToken created");

  if (businessDbUser) createdUserIds.push(businessDbUser.id);

  // =========================================================================
  // 3. Login Gating: Unverified Account Blocked from Login
  // =========================================================================
  console.log("\n[3] Testing Login Gating for Unverified Accounts");
  const unverifiedLoginReq = new Request("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: creatorEmail,
      password: "SecurePassword123!",
      accountType: "creator",
    }),
  });

  const unverifiedLoginRes = await loginApiHandler(unverifiedLoginReq);
  assert(unverifiedLoginRes.status === 403, "Unverified user login returns HTTP 403 Forbidden");

  const unverifiedLoginBody = await unverifiedLoginRes.json();
  assert(unverifiedLoginBody.emailUnverified === true, "Login response body has emailUnverified=true");
  assert(unverifiedLoginBody.session === undefined, "Login response body has NO session");
  assert(
    unverifiedLoginBody.error === "Please verify your email address before signing in.",
    "Login returns clear verification requirement message"
  );

  // =========================================================================
  // 4. Token Security: Secure Hashing & Single-Use
  // =========================================================================
  console.log("\n[4] Testing Token Security & Single-Use Enforcement");
  const tokenRecord = creatorDbUser?.emailVerificationTokens[0];
  assert(Boolean(tokenRecord?.tokenHash), "Token hash stored in DB is non-empty");
  assert(tokenRecord?.usedAt === null, "Token usedAt is initially NULL");

  // Create a known raw token and hash for testing the verification flow
  const testTokenPair = generateVerificationToken(30 * 60 * 1000);
  await prisma.emailVerificationToken.create({
    data: {
      userId: creatorDbUser!.id,
      tokenHash: testTokenPair.tokenHash,
      expiresAt: testTokenPair.expiresAt,
    },
  });

  // Test invalid token rejection
  const invalidTokenRes = await AuthService.verifyEmailToken("completely_fake_invalid_token_12345");
  assert(invalidTokenRes.success === false, "AuthService rejects invalid verification token");

  // Verify email with valid token
  const validTokenRes = await AuthService.verifyEmailToken(testTokenPair.rawToken);
  assert(validTokenRes.success === true, "AuthService accepts valid verification token");
  assert(validTokenRes.user?.email === creatorEmail, "Verification returns matching user session info");

  // Verify DB state after verification
  const verifiedUserDb = await prisma.user.findUnique({
    where: { id: creatorDbUser!.id },
  });
  assert(verifiedUserDb?.emailVerifiedAt !== null, "User emailVerifiedAt is now populated with timestamp");

  // Single-use check: attempt to use the same token again
  const reuseTokenRes = await AuthService.verifyEmailToken(testTokenPair.rawToken);
  assert(reuseTokenRes.success === false, "Re-using an already consumed token is REJECTED");
  assert(
    Boolean(reuseTokenRes.error?.includes("already been used")),
    "Re-used token returns clear 'already been used' error"
  );

  // =========================================================================
  // 5. Verified User Login Success
  // =========================================================================
  console.log("\n[5] Testing Verified User Login");
  const verifiedLoginReq = new Request("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: creatorEmail,
      password: "SecurePassword123!",
      accountType: "creator",
    }),
  });

  const verifiedLoginRes = await loginApiHandler(verifiedLoginReq);
  assert(verifiedLoginRes.status === 200, "Verified user login returns HTTP 200 OK");

  const verifiedLoginBody = await verifiedLoginRes.json();
  assert(verifiedLoginBody.success === true, "Verified login returns success=true");
  assert(verifiedLoginBody.session?.email === creatorEmail, "Verified login returns valid authenticated session");

  // =========================================================================
  // 6. Token Expiry Enforcement
  // =========================================================================
  console.log("\n[6] Testing Token Expiration Enforcement");
  // Create an expired token (expiresAt 10 minutes ago)
  const expiredRawToken = "expired_raw_token_" + timestamp;
  const expiredHash = hashVerificationToken(expiredRawToken);
  await prisma.emailVerificationToken.create({
    data: {
      userId: businessDbUser!.id,
      tokenHash: expiredHash,
      expiresAt: new Date(Date.now() - 10 * 60 * 1000), // Expired
    },
  });

  const expiredVerifyRes = await AuthService.verifyEmailToken(expiredRawToken);
  assert(expiredVerifyRes.success === false, "Expired token is REJECTED");
  assert(
    Boolean(expiredVerifyRes.error?.includes("expired")),
    "Expired token returns clear 'expired' error message"
  );

  // =========================================================================
  // 7. Resend Verification & Rate Limiting
  // =========================================================================
  console.log("\n[7] Testing Resend Verification & Rate Limiting");
  // Business account is still unverified.
  // Test rate limiting when requesting immediately after token creation
  const rateLimitReq1 = new Request("http://localhost:3000/api/auth/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: businessEmail }),
  });

  const rateLimitRes1 = await resendApiHandler(rateLimitReq1);
  assert(
    rateLimitRes1.status === 429,
    "Rapid-fire resend request within 60s is rate-limited (HTTP 429)"
  );

  const rateLimitBody1 = await rateLimitRes1.json();
  assert(rateLimitBody1.rateLimited === true, "Rate limit response has rateLimited=true");

  // Simulate cooldown expiry by updating existing token timestamps
  await prisma.emailVerificationToken.updateMany({
    where: { userId: businessDbUser!.id },
    data: { createdAt: new Date(Date.now() - 70 * 1000) },
  });

  // Now resend should succeed
  const allowedResendReq = new Request("http://localhost:3000/api/auth/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: businessEmail }),
  });

  const allowedResendRes = await resendApiHandler(allowedResendReq);
  assert(allowedResendRes.status === 200, "Resend after cooldown returns HTTP 200 OK");

  const allowedResendBody = await allowedResendRes.json();
  assert(allowedResendBody.success === true, "Resend returns success=true");

  // Verify that a new active token was generated in DB
  const businessTokens = await prisma.emailVerificationToken.findMany({
    where: { userId: businessDbUser!.id, usedAt: null },
  });
  assert(businessTokens.length === 1, "Old unused tokens were invalidated, exactly 1 active token exists");

  // Verify email enumeration protection: non-existent email returns generic message
  const nonExistentResendReq = new Request("http://localhost:3000/api/auth/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "does-not-exist@example.com" }),
  });
  const nonExistentResendRes = await resendApiHandler(nonExistentResendReq);
  assert(nonExistentResendRes.status === 200, "Non-existent email resend returns HTTP 200 for privacy");

  // =========================================================================
  // 8. GET /api/auth/verify-email Route Handler & Redirect
  // =========================================================================
  console.log("\n[8] Testing GET /api/auth/verify-email Endpoint Flow");
  const businessTokenPair = generateVerificationToken(30 * 60 * 1000);
  await prisma.emailVerificationToken.create({
    data: {
      userId: businessDbUser!.id,
      tokenHash: businessTokenPair.tokenHash,
      expiresAt: businessTokenPair.expiresAt,
    },
  });

  const verifyEndpointReq = new Request(
    `http://localhost:3000/api/auth/verify-email?token=${businessTokenPair.rawToken}`,
    { method: "GET" }
  );

  const verifyEndpointRes = await verifyEmailApiHandler(verifyEndpointReq);
  assert(
    verifyEndpointRes.status === 302,
    "GET /api/auth/verify-email returns HTTP 302 redirect on success"
  );
  const redirectLocation = verifyEndpointRes.headers.get("location");
  assert(
    redirectLocation?.includes("/dashboard") === true,
    `Business user redirected to /dashboard (got: ${redirectLocation})`
  );

  // Verify Business DB state
  const businessUserVerified = await prisma.user.findUnique({ where: { id: businessDbUser!.id } });
  assert(businessUserVerified?.emailVerifiedAt !== null, "Business user emailVerifiedAt is now set");

  // =========================================================================
  // 9. Cleanup Test Fixtures
  // =========================================================================
  console.log("\n[9] Cleaning up test users created during test execution");
  if (createdUserIds.length > 0) {
    await prisma.user.deleteMany({
      where: { id: { in: createdUserIds } },
    });
    console.log(`  🧹 Cleaned up ${createdUserIds.length} automated test fixture accounts.`);
  }

  console.log("\n==================================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runEmailVerificationTestSuite()
  .catch((err) => {
    console.error("Email verification test suite encountered an error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
