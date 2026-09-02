import { AuthService } from "../services/authService";
import { POST as signupApiHandler } from "../app/api/auth/signup/route";
import { POST as loginApiHandler } from "../app/api/auth/login/route";
import { POST as resendApiHandler } from "../app/api/auth/resend-verification/route";
import { GET as verifyEmailApiHandler } from "../app/api/auth/verify-email/route";
import { prisma } from "../lib/prisma";
import { hashVerificationToken, generateVerificationToken } from "../lib/tokenSecurity";
import { EmailService } from "../lib/email";
import nodemailer from "nodemailer";

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
  // 1. EmailService Truthful Reporting (Missing / Failing SMTP)
  // =========================================================================
  console.log("\n[1] Testing EmailService Truthful Reporting");
  
  // When SMTP is not configured (current test environment):
  const deliveryResultWithoutSmtp = await EmailService.sendVerificationEmail({
    to: "test@example.com",
    name: "Test User",
    verificationUrl: "http://localhost:3000/api/auth/verify-email?token=123",
  });
  assert(deliveryResultWithoutSmtp.success === false, "EmailService returns success=false when SMTP is unconfigured");
  assert(deliveryResultWithoutSmtp.errorCode === "SMTP_NOT_CONFIGURED", "EmailService returns errorCode='SMTP_NOT_CONFIGURED'");
  assert(Array.isArray(deliveryResultWithoutSmtp.missingConfig), "EmailService lists missingConfig array");

  // =========================================================================
  // 2. Creator Signup Creates Unverified User & Returns emailSent=false when SMTP missing
  // =========================================================================
  console.log("\n[2] Testing Creator Signup (Unverified Initial State & emailSent Truthfulness)");
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
  assert(creatorSignupBody.accountCreated === true, "Signup response has accountCreated=true");
  assert(creatorSignupBody.requiresVerification === true, "Signup response indicates requiresVerification=true");
  assert(creatorSignupBody.emailSent === false, "Signup response truthfully reports emailSent=false when SMTP is unconfigured");
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
  // 3. Business Signup Creates Unverified User & Token
  // =========================================================================
  console.log("\n[3] Testing Business Signup (Unverified Initial State & Multi-Domain)");
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
  assert(businessSignupBody.emailSent === false, "Business signup truthfully reports emailSent=false");
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
  // 4. Login Gating: Unverified Account Blocked from Login
  // =========================================================================
  console.log("\n[4] Testing Login Gating for Unverified Accounts");
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
  // 5. Token Security: Secure Hashing & Single-Use
  // =========================================================================
  console.log("\n[5] Testing Token Security & Single-Use Enforcement");
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
  // 6. Verified User Login Success
  // =========================================================================
  console.log("\n[6] Testing Verified User Login");
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
  // 7. Token Expiry Enforcement
  // =========================================================================
  console.log("\n[7] Testing Token Expiration Enforcement");
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
  // 8. Resend Verification: Rate Limiting & Truthful Delivery Reporting
  // =========================================================================
  console.log("\n[8] Testing Resend Verification & Rate Limiting");
  // Business account is unverified.
  // Rapid-fire resend should be rate-limited
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

  // When SMTP is unconfigured, resend returns HTTP 503 (service failure) without claiming delivery
  const unconfiguredResendReq = new Request("http://localhost:3000/api/auth/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: businessEmail }),
  });

  const unconfiguredResendRes = await resendApiHandler(unconfiguredResendReq);
  assert(
    unconfiguredResendRes.status === 503,
    "Resend when SMTP is unconfigured returns HTTP 503 Service Unavailable"
  );
  const unconfiguredResendBody = await unconfiguredResendRes.json();
  assert(unconfiguredResendBody.isServiceError === true, "Resend body indicates isServiceError=true");

  // Verify email enumeration protection: non-existent email returns generic message
  const nonExistentResendReq = new Request("http://localhost:3000/api/auth/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "does-not-exist@example.com" }),
  });
  const nonExistentResendRes = await resendApiHandler(nonExistentResendReq);
  assert(nonExistentResendRes.status === 200, "Non-existent email resend returns HTTP 200 for privacy");

  // =========================================================================
  // 9. Mocked SMTP Success Boundary Test
  // =========================================================================
  console.log("\n[9] Testing Email Delivery with Configured SMTP Transport");
  const origCreateTransport = nodemailer.createTransport;
  try {
    // Temporarily configure dummy SMTP in env
    process.env.SMTP_HOST = "smtp.test-provider.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "test-user";
    process.env.SMTP_PASS = "test-pass";

    // Mock nodemailer transport sendMail to succeed
    (nodemailer as any).createTransport = () => ({
      sendMail: async () => ({
        messageId: "mock_msg_12345",
      }),
    });

    const mockSendResult = await EmailService.sendVerificationEmail({
      to: "creator.mock@gmail.com",
      name: "Mock Creator",
      verificationUrl: "http://localhost:3000/api/auth/verify-email?token=mock_token",
    });
    assert(mockSendResult.success === true, "EmailService returns success=true when SMTP sendMail succeeds");
    assert(mockSendResult.messageId === "mock_msg_12345", "EmailService returns messageId on success");

    // Reset token timestamp for resend test
    await prisma.emailVerificationToken.updateMany({
      where: { userId: businessDbUser!.id },
      data: { createdAt: new Date(Date.now() - 70 * 1000) },
    });

    const mockResendReq = new Request("http://localhost:3000/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: businessEmail }),
    });
    const mockResendRes = await resendApiHandler(mockResendReq);
    assert(mockResendRes.status === 200, "Resend returns HTTP 200 when SMTP delivery succeeds");
    const mockResendBody = await mockResendRes.json();
    assert(mockResendBody.success === true, "Resend body has success=true");
    assert(mockResendBody.emailSent === true, "Resend body has emailSent=true");

    // Mock sendMail failure
    (nodemailer as any).createTransport = () => ({
      sendMail: async () => {
        const err: any = new Error("Authentication failed");
        err.code = "EAUTH";
        err.responseCode = 535;
        throw err;
      },
    });

    const failSendResult = await EmailService.sendVerificationEmail({
      to: "creator.mock@gmail.com",
      name: "Mock Creator",
      verificationUrl: "http://localhost:3000/api/auth/verify-email?token=mock_token",
    });
    assert(failSendResult.success === false, "EmailService returns success=false when SMTP throws EAUTH");
    assert(failSendResult.errorCode === "EAUTH", "EmailService captures exact SMTP error code");
  } finally {
    // Restore environment and nodemailer transport
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    nodemailer.createTransport = origCreateTransport;
  }

  // =========================================================================
  // 10. GET /api/auth/verify-email Route Handler & Redirect
  // =========================================================================
  console.log("\n[10] Testing GET /api/auth/verify-email Endpoint Flow");
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
    redirectLocation?.includes("/dashboard/businesses") === true,
    `Business user redirected to /dashboard/businesses (got: ${redirectLocation})`
  );

  // Verify Business DB state
  const businessUserVerified = await prisma.user.findUnique({ where: { id: businessDbUser!.id } });
  assert(businessUserVerified?.emailVerifiedAt !== null, "Business user emailVerifiedAt is now set");

  // =========================================================================
  // 11. Cleanup Test Fixtures
  // =========================================================================
  console.log("\n[11] Cleaning up test users created during test execution");
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
