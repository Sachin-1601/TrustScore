import { AuthService } from "../services/authService";
import { POST as signupApiHandler } from "../app/api/auth/signup/route";
import { prisma } from "../lib/prisma";

async function runSignupValidationTests() {
  console.log("==================================================");
  console.log("🧪 Running TrustScore Creator Signup Validation Tests");
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

  // =========================================================================
  // 1. AuthService Unit Validation - Creator Domain Rejections
  // =========================================================================
  console.log("\n[1] Testing AuthService Creator Signup Rejections");

  const invalidCreatorEmails = [
    { email: "creator-test@example.com", domain: "@example.com" },
    { email: `new-creator-${timestamp}@example.com`, domain: "@example.com" },
    { email: `new-creator-${timestamp}@outlook.com`, domain: "@outlook.com" },
    { email: `new-creator-${timestamp}@yahoo.com`, domain: "@yahoo.com" },
    { email: `new-creator-${timestamp}@company.com`, domain: "@company.com" },
    { email: `new-creator-${timestamp}@notgmail.com`, domain: "@notgmail.com" },
    { email: `new-creator-${timestamp}@gmail.co`, domain: "@gmail.co" },
    { email: `new-creator-${timestamp}@gmail.com.br`, domain: "@gmail.com.br" },
  ];

  for (const { email, domain } of invalidCreatorEmails) {
    const res = await AuthService.signup({
      email,
      passwordPlain: "ValidPassword123!",
      name: "Test Creator",
      role: "CREATOR",
    });

    assert(
      res.error === "Creator accounts require a Gmail address ending in @gmail.com." && !res.requiresVerification,
      `AuthService rejects Creator email with domain ${domain} (${email})`
    );

    // For newly generated test emails, verify no DB records were created
    if (email.includes(`${timestamp}`)) {
      const cleanEmail = email.trim().toLowerCase();
      const createdUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
        include: { creatorProfile: true, subscriptions: true },
      });
      assert(createdUser === null, `No User record created for rejected email ${email}`);
    }
  }

  // =========================================================================
  // 2. API Route HTTP 400 Validation - Creator Signup Rejection
  // =========================================================================
  console.log("\n[2] Testing POST /api/auth/signup HTTP Handler for Creator");

  for (const { email, domain } of invalidCreatorEmails) {
    const req = new Request("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: "ValidPassword123!",
        name: "Test Creator",
        role: "CREATOR",
      }),
    });

    const response = await signupApiHandler(req);
    assert(response.status === 400, `POST /api/auth/signup returns HTTP 400 for Creator domain ${domain}`);

    const body = await response.json();
    assert(
      body.error === "Creator accounts require a Gmail address ending in @gmail.com.",
      `HTTP response body contains exact error message for ${email}`
    );
  }

  // =========================================================================
  // 3. AuthService & API Route Acceptance - Creator Valid Gmail Variants
  // =========================================================================
  console.log("\n[3] Testing Creator Signup Acceptance (Valid Gmail Formats)");

  const validCreatorCases = [
    {
      rawEmail: `valid.creator.${timestamp}@gmail.com`,
      expectedClean: `valid.creator.${timestamp}@gmail.com`,
      label: "Standard lowercase @gmail.com",
    },
    {
      rawEmail: `UPPERCASE.CREATOR.${timestamp}@GMAIL.COM`,
      expectedClean: `uppercase.creator.${timestamp}@gmail.com`,
      label: "Uppercase @GMAIL.COM",
    },
    {
      rawEmail: `   whitespace.creator.${timestamp}@gmail.com   `,
      expectedClean: `whitespace.creator.${timestamp}@gmail.com`,
      label: "Surrounding whitespace with @gmail.com",
    },
  ];

  const createdUserIds: string[] = [];

  for (const { rawEmail, expectedClean, label } of validCreatorCases) {
    const req = new Request("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: rawEmail,
        password: "ValidPassword123!",
        name: "Verified Creator Test",
        role: "CREATOR",
        handleOrCompany: `creator_${timestamp}_${Math.floor(Math.random() * 1000)}`,
      }),
    });

    const response = await signupApiHandler(req);
    assert(response.status === 201, `Creator signup accepts ${label} (HTTP 201)`);

    const body = await response.json();
    assert(body.success === true, `Signup returns success=true for ${label}`);
    assert(body.requiresVerification === true, `Signup indicates email verification is required for ${label}`);
    assert(body.email === expectedClean, `Email normalized to lowercase & trimmed: ${expectedClean}`);
    assert(body.session === undefined, `No authenticated session returned on signup for ${label}`);

    // Verify Database records exist and emailVerifiedAt is null
    const userInDb = await prisma.user.findUnique({
      where: { email: expectedClean },
      include: { creatorProfile: true, subscriptions: true, emailVerificationTokens: true },
    });
    assert(userInDb !== null, `User record exists in DB for ${label}`);
    assert(userInDb?.emailVerifiedAt === null, `User emailVerifiedAt is null upon signup for ${label}`);
    assert(userInDb?.role === "CREATOR", `Role assigned is CREATOR for ${label}`);
    assert(userInDb?.creatorProfile !== null, `CreatorProfile record exists in DB for ${label}`);
    assert(userInDb?.subscriptions.length === 1, `Subscription record exists in DB for ${label}`);
    assert(userInDb?.emailVerificationTokens.length === 1, `EmailVerificationToken generated for ${label}`);

    if (userInDb?.id) {
      createdUserIds.push(userInDb.id);
    }
  }

  // =========================================================================
  // 4. Business Signup Validation - Preserves Existing Multi-Domain Support
  // =========================================================================
  console.log("\n[4] Testing Business Signup (Existing Multi-Domain Behavior Unchanged)");

  const businessCases = [
    {
      email: `contact.${timestamp}@acme-corp.com`,
      label: "Corporate domain (@acme-corp.com)",
    },
    {
      email: `marketing.${timestamp}@startup.io`,
      label: "Tech domain (@startup.io)",
    },
    {
      email: `business.${timestamp}@outlook.com`,
      label: "Outlook domain (@outlook.com)",
    },
  ];

  for (const { email, label } of businessCases) {
    const req = new Request("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: "ValidPassword123!",
        name: "Test Business User",
        role: "BUSINESS",
        handleOrCompany: `Acme Corp ${timestamp}`,
      }),
    });

    const response = await signupApiHandler(req);
    assert(response.status === 201, `Business signup accepts non-Gmail domain: ${label} (HTTP 201)`);

    const body = await response.json();
    assert(body.success === true, `Signup returns success=true for business ${label}`);
    assert(body.requiresVerification === true, `Signup requires verification for business ${label}`);

    const userInDb = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { businessProfile: true, emailVerificationTokens: true },
    });
    assert(userInDb !== null, `User record exists in DB for business ${label}`);
    assert(userInDb?.emailVerifiedAt === null, `User emailVerifiedAt is null for business ${label}`);
    assert(userInDb?.role === "BUSINESS", `Role assigned is BUSINESS for ${label}`);
    assert(userInDb?.emailVerificationTokens.length === 1, `EmailVerificationToken generated for business ${label}`);

    if (userInDb?.id) {
      createdUserIds.push(userInDb.id);
    }
  }

  // =========================================================================
  // 5. Cleanup Test Fixtures
  // =========================================================================
  console.log("\n[5] Cleaning up test users created during test execution");
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

runSignupValidationTests()
  .catch((err) => {
    console.error("Signup validation test runner encountered an error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
