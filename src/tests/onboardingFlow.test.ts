import assert from "assert";
import { proxy } from "../proxy";
import { createSessionToken } from "../lib/session";
import { AuthService } from "../services/authService";
import { prisma } from "../lib/prisma";
import type { NextRequest } from "next/server";

// Mock helper to build NextRequest for testing proxy
function makeRequest(pathname: string, token?: string): NextRequest {
  const url = `http://localhost:3000${pathname}`;
  const req = new Request(url, {
    headers: token ? { cookie: `trustscore_session=${token}` } : {},
  }) as any;

  req.nextUrl = new URL(url);
  req.cookies = {
    get: (name: string) => (name === "trustscore_session" && token ? { value: token } : undefined),
  };

  return req as NextRequest;
}

async function runOnboardingTests() {
  console.log("==================================================");
  console.log("🧪 Running TrustScore Onboarding System Unit & Integration Tests");
  console.log("==================================================");

  // Clean test fixtures if needed
  const testTimestamp = Date.now();
  const testCreatorEmail = `onboard.creator.${testTimestamp}@gmail.com`;
  const testBusinessEmail = `onboard.business.${testTimestamp}@tangentfour.com`;

  try {
    // ----------------------------------------------------
    // TEST 1 & 2: Signup Onboarding State Initialization
    // ----------------------------------------------------
    console.log("\n[TEST 1] Creator Signup Initial State");
    const creatorSignup = await AuthService.signup({
      name: "Alex Rivera",
      email: testCreatorEmail,
      passwordPlain: "Password123!",
      role: "CREATOR",
      handleOrCompany: "@alexrivera",
      category: "Fitness",
      platform: "instagram",
    });
    assert.strictEqual(!creatorSignup.error, true, "Creator signup had no error");
    assert.strictEqual(creatorSignup.requiresVerification, true, "Email verification required");

    const dbCreatorUser = await prisma.user.findUnique({
      where: { email: testCreatorEmail },
      include: { creatorProfile: true },
    });
    assert.ok(dbCreatorUser, "Creator record created in DB");
    assert.strictEqual(dbCreatorUser.role, "CREATOR", "Role is CREATOR");
    assert.strictEqual(dbCreatorUser.onboardingCompleted, false, "onboardingCompleted starts false");
    assert.strictEqual(dbCreatorUser.onboardingStep, 1, "onboardingStep starts at 1");
    console.log("  ✅ PASS: New Creator account initialized with onboardingCompleted=false");

    console.log("\n[TEST 2] Business Signup Initial State");
    const businessSignup = await AuthService.signup({
      name: "Acme Wellness",
      email: testBusinessEmail,
      passwordPlain: "Password123!",
      role: "BUSINESS",
      handleOrCompany: "Acme Wellness",
      category: "Health & Wellness",
    });
    assert.strictEqual(!businessSignup.error, true, "Business signup had no error");
    assert.strictEqual(businessSignup.requiresVerification, true, "Email verification required");

    const dbBusinessUser = await prisma.user.findUnique({
      where: { email: testBusinessEmail },
      include: { businessProfile: true },
    });
    assert.ok(dbBusinessUser, "Business record created in DB");
    assert.strictEqual(dbBusinessUser.role, "BUSINESS", "Role is BUSINESS");
    assert.strictEqual(dbBusinessUser.onboardingCompleted, false, "onboardingCompleted starts false");
    assert.strictEqual(dbBusinessUser.onboardingStep, 1, "onboardingStep starts at 1");
    console.log("  ✅ PASS: New Business account initialized with onboardingCompleted=false");

    // ----------------------------------------------------
    // TEST 3 & 4: Incomplete Onboarding Server Protection (Proxy)
    // ----------------------------------------------------
    console.log("\n[TEST 7] Incomplete Creator visiting /dashboard/creator");
    const incompleteCreatorToken = await createSessionToken({
      userId: dbCreatorUser.id,
      email: dbCreatorUser.email,
      name: dbCreatorUser.name,
      role: "CREATOR",
      onboardingCompleted: false,
      onboardingStep: 1,
    });

    const res7 = await proxy(makeRequest("/dashboard/creator", incompleteCreatorToken));
    assert.strictEqual(res7.status, 307, "Redirects with 307");
    assert.strictEqual(
      res7.headers.get("location"),
      "http://localhost:3000/onboarding/creator",
      "Incomplete creator is redirected to /onboarding/creator"
    );
    console.log("  ✅ PASS: Incomplete Creator blocked from /dashboard/creator -> /onboarding/creator");

    console.log("\n[TEST 8] Incomplete Business visiting /dashboard/businesses");
    const incompleteBusinessToken = await createSessionToken({
      userId: dbBusinessUser.id,
      email: dbBusinessUser.email,
      name: dbBusinessUser.name,
      role: "BUSINESS",
      onboardingCompleted: false,
      onboardingStep: 1,
    });

    const res8 = await proxy(makeRequest("/dashboard/businesses", incompleteBusinessToken));
    assert.strictEqual(res8.status, 307, "Redirects with 307");
    assert.strictEqual(
      res8.headers.get("location"),
      "http://localhost:3000/onboarding/business",
      "Incomplete business is redirected to /onboarding/business"
    );
    console.log("  ✅ PASS: Incomplete Business blocked from /dashboard/businesses -> /onboarding/business");

    // ----------------------------------------------------
    // TEST 9 & 10: Cross-Role Onboarding Access Protection
    // ----------------------------------------------------
    console.log("\n[TEST 9] Incomplete Creator attempts to access Business onboarding");
    const res9 = await proxy(makeRequest("/onboarding/business", incompleteCreatorToken));
    assert.strictEqual(res9.status, 307, "Redirects with 307");
    assert.strictEqual(
      res9.headers.get("location"),
      "http://localhost:3000/onboarding/creator",
      "Creator attempting business onboarding is sent to creator onboarding"
    );
    console.log("  ✅ PASS: Creator attempting /onboarding/business -> /onboarding/creator");

    console.log("\n[TEST 10] Incomplete Business attempts to access Creator onboarding");
    const res10 = await proxy(makeRequest("/onboarding/creator", incompleteBusinessToken));
    assert.strictEqual(res10.status, 307, "Redirects with 307");
    assert.strictEqual(
      res10.headers.get("location"),
      "http://localhost:3000/onboarding/business",
      "Business attempting creator onboarding is sent to business onboarding"
    );
    console.log("  ✅ PASS: Business attempting /onboarding/creator -> /onboarding/business");

    // ----------------------------------------------------
    // TEST 11: Unauthenticated User Protection
    // ----------------------------------------------------
    console.log("\n[TEST 11] Unauthenticated user visits onboarding");
    const res11a = await proxy(makeRequest("/onboarding/creator"));
    assert.strictEqual(res11a.status, 307, "Redirects with 307");
    assert.strictEqual(res11a.headers.get("location"), "http://localhost:3000/login");

    const res11b = await proxy(makeRequest("/onboarding/business"));
    assert.strictEqual(res11b.status, 307, "Redirects with 307");
    assert.strictEqual(res11b.headers.get("location"), "http://localhost:3000/login");
    console.log("  ✅ PASS: Unauthenticated access to onboarding blocked -> /login");

    // ----------------------------------------------------
    // TEST 5 & 6: Completed Onboarding Routing
    // ----------------------------------------------------
    console.log("\n[TEST 5] Completed Creator Login & Access");
    const completeCreatorToken = await createSessionToken({
      userId: dbCreatorUser.id,
      email: dbCreatorUser.email,
      name: dbCreatorUser.name,
      role: "CREATOR",
      onboardingCompleted: true,
      onboardingStep: 5,
    });

    const res5a = await proxy(makeRequest("/dashboard/creator", completeCreatorToken));
    assert.strictEqual(res5a.status, 200, "Completed creator can access /dashboard/creator");

    const res5b = await proxy(makeRequest("/onboarding/creator", completeCreatorToken));
    assert.strictEqual(res5b.status, 307, "Completed creator visiting onboarding redirected to dashboard");
    assert.strictEqual(res5b.headers.get("location"), "http://localhost:3000/dashboard/creator");
    console.log("  ✅ PASS: Completed Creator accesses /dashboard/creator, and /onboarding -> /dashboard/creator");

    console.log("\n[TEST 6] Completed Business Login & Access");
    const completeBusinessToken = await createSessionToken({
      userId: dbBusinessUser.id,
      email: dbBusinessUser.email,
      name: dbBusinessUser.name,
      role: "BUSINESS",
      onboardingCompleted: true,
      onboardingStep: 5,
    });

    const res6a = await proxy(makeRequest("/dashboard/businesses", completeBusinessToken));
    assert.strictEqual(res6a.status, 200, "Completed business can access /dashboard/businesses");

    const res6b = await proxy(makeRequest("/onboarding/business", completeBusinessToken));
    assert.strictEqual(res6b.status, 307, "Completed business visiting onboarding redirected to dashboard");
    assert.strictEqual(res6b.headers.get("location"), "http://localhost:3000/dashboard/businesses");
    console.log("  ✅ PASS: Completed Business accesses /dashboard/businesses, and /onboarding -> /dashboard/businesses");

    // ----------------------------------------------------
    // TEST 12: Admin Role Access
    // ----------------------------------------------------
    console.log("\n[TEST 12] Admin Login & Route Access");
    const adminToken = await createSessionToken({
      userId: "admin-id",
      email: "admin@trustscore.io",
      name: "Admin User",
      role: "ADMIN",
      onboardingCompleted: true,
      onboardingStep: 5,
    });

    const res12a = await proxy(makeRequest("/admin", adminToken));
    assert.strictEqual(res12a.status, 200, "Admin can access /admin");

    const res12b = await proxy(makeRequest("/onboarding/creator", adminToken));
    assert.strictEqual(res12b.status, 307, "Admin on onboarding redirects to /admin");
    assert.strictEqual(res12b.headers.get("location"), "http://localhost:3000/admin");
    console.log("  ✅ PASS: Admin role routes directly to /admin");

    console.log("\n==================================================");
    console.log("ALL 12 ONBOARDING & ROUTING SCENARIOS PASSED!");
    console.log("==================================================");
  } finally {
    // Cleanup fixture accounts
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testCreatorEmail, testBusinessEmail],
        },
      },
    });
  }
}

runOnboardingTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Onboarding test failed:", err);
    process.exit(1);
  });
