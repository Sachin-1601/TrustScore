import assert from "node:assert";
import { prisma } from "../lib/prisma";
import { encryptSecret, decryptSecret } from "../lib/encryption";
import {
  createInstagramOAuthState,
  verifyInstagramOAuthState,
  buildInstagramAuthorizeUrl,
  getInstagramOAuthCallbackUrl,
} from "../lib/instagramOAuth";
import { InstagramService } from "../services/instagramService";
import { TrustScoreEngine } from "../services/trustScoreEngine";

async function runInstagramIntegrationTests() {
  console.log("==================================================");
  console.log("🧪 Running TrustScore Meta Instagram API Integration Tests");
  console.log("==================================================");

  // 1. AES-256-GCM Token Encryption Security Tests
  console.log("\n[TEST 1] Token Encryption & Decryption Security");
  const sampleToken = "IGQWRNZAE1ZAUnNZA25sZAWx6dFR1eG15ZA...";
  const encrypted = encryptSecret(sampleToken);
  assert.notStrictEqual(encrypted, sampleToken, "Token is encrypted");
  assert.strictEqual(encrypted.includes(sampleToken), false, "Plaintext token is not visible in ciphertext");
  assert.strictEqual(encrypted.split(":").length, 3, "Payload follows iv:authTag:ciphertext structure");

  const decrypted = decryptSecret(encrypted);
  assert.strictEqual(decrypted, sampleToken, "Decrypted token exactly matches original plaintext");
  console.log("  ✅ PASS: AES-256-GCM token encryption and decryption validated");

  // Tamper detection
  console.log("\n[TEST 2] Tamper Detection on Encrypted Payload");
  const corruptedPayload = encrypted.slice(0, -4) + "ffff";
  assert.throws(
    () => decryptSecret(corruptedPayload),
    /Unsupported state or unable to authenticate data|Invalid encrypted payload format/,
    "Tampered ciphertext fails auth tag validation"
  );
  console.log("  ✅ PASS: GCM auth tag verification detects tampered payloads");

  // 2. OAuth Authorization URL & Scopes
  console.log("\n[TEST 3] Instagram Login Authorization URL Construction");
  const clientId = "123456789012345";
  const redirectUri = "http://localhost:3000/api/auth/instagram/callback";
  const dummyState = "test_state_token";
  const authUrl = buildInstagramAuthorizeUrl(clientId, redirectUri, dummyState);

  const parsedUrl = new URL(authUrl);
  assert.strictEqual(parsedUrl.origin, "https://www.instagram.com", "Correct Instagram OAuth origin");
  assert.strictEqual(parsedUrl.pathname, "/oauth/authorize", "Correct OAuth authorization path");
  assert.strictEqual(parsedUrl.searchParams.get("client_id"), clientId, "Client ID matched");
  assert.strictEqual(parsedUrl.searchParams.get("redirect_uri"), redirectUri, "Redirect URI matched");
  assert.strictEqual(parsedUrl.searchParams.get("response_type"), "code", "Response type is code");
  assert.strictEqual(
    parsedUrl.searchParams.get("scope"),
    "instagram_business_basic,instagram_business_manage_insights",
    "Uses correct Instagram Login permissions"
  );
  console.log("  ✅ PASS: Instagram Login for Business authorization URL correctly formed");

  // 3. OAuth Signed State Token
  console.log("\n[TEST 4] OAuth State Token Signing & Verification");
  const stateToken = await createInstagramOAuthState({
    userId: "user_test_123",
    creatorProfileId: "creator_test_456",
  });
  assert.ok(stateToken && stateToken.length > 20, "Signed JWT state token generated");

  const verifiedState = await verifyInstagramOAuthState(stateToken);
  assert.ok(verifiedState, "State token verified");
  assert.strictEqual(verifiedState.userId, "user_test_123", "User ID retained in state");
  assert.strictEqual(verifiedState.creatorProfileId, "creator_test_456", "Creator Profile ID retained in state");

  const invalidState = await verifyInstagramOAuthState("invalid.jwt.token");
  assert.strictEqual(invalidState, null, "Invalid state token returns null");
  console.log("  ✅ PASS: Cryptographic OAuth state token verified");

  // 4. Environment Variables Resolution
  console.log("\n[TEST 5] Environment Variable Name Resolution (INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, INSTAGRAM_REDIRECT_URI)");
  const originalAppId = process.env.INSTAGRAM_APP_ID;
  const originalAppSecret = process.env.INSTAGRAM_APP_SECRET;
  const originalRedirectUri = process.env.INSTAGRAM_REDIRECT_URI;

  process.env.INSTAGRAM_APP_ID = "987654321098765";
  process.env.INSTAGRAM_APP_SECRET = "mock_secret_for_test";
  process.env.INSTAGRAM_REDIRECT_URI = "http://localhost:3000/api/auth/instagram/callback";

  const { getInstagramClientId, getInstagramClientSecret, getInstagramOAuthCallbackUrl } = await import("../lib/instagramOAuth");
  assert.strictEqual(getInstagramClientId(), "987654321098765", "INSTAGRAM_APP_ID is resolved");
  assert.strictEqual(getInstagramClientSecret(), "mock_secret_for_test", "INSTAGRAM_APP_SECRET is resolved");
  assert.strictEqual(getInstagramOAuthCallbackUrl(), "http://localhost:3000/api/auth/instagram/callback", "INSTAGRAM_REDIRECT_URI takes exact precedence");

  // Test custom production redirect URI precedence
  process.env.INSTAGRAM_REDIRECT_URI = "https://app.trustscore.io/api/auth/instagram/callback";
  assert.strictEqual(getInstagramOAuthCallbackUrl(), "https://app.trustscore.io/api/auth/instagram/callback", "Custom production redirect URI resolved exactly");

  // Restore
  if (originalAppId) process.env.INSTAGRAM_APP_ID = originalAppId; else delete process.env.INSTAGRAM_APP_ID;
  if (originalAppSecret) process.env.INSTAGRAM_APP_SECRET = originalAppSecret; else delete process.env.INSTAGRAM_APP_SECRET;
  if (originalRedirectUri) process.env.INSTAGRAM_REDIRECT_URI = originalRedirectUri; else delete process.env.INSTAGRAM_REDIRECT_URI;
  console.log("  ✅ PASS: Dedicated INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET & INSTAGRAM_REDIRECT_URI verified");

  // 5. End-to-End Creator Telemetry Sync & Model Ingestion
  console.log("\n[TEST 6] End-to-End Database Mapping & Synchronization Pipeline");
  const testEmail = `ig_creator_${Date.now()}@gmail.com`;

  const user = await prisma.user.create({
    data: {
      email: testEmail,
      name: "Marcus Vance",
      passwordHash: "hash_placeholder",
      role: "CREATOR",
      onboardingCompleted: true,
      emailVerifiedAt: new Date(),
    },
  });

  const creatorProfile = await prisma.creatorProfile.create({
    data: {
      userId: user.id,
      username: "@marcusvance",
      name: "Marcus Vance",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      bio: "Fitness and athletic lifestyle creator",
      category: "Fitness",
      location: "Sydney, NSW",
      country: "Australia",
      platform: "INSTAGRAM",
      followers: 42000,
      following: 380,
      totalPosts: 35,
      avgLikes: 1250,
      avgComments: 85,
      avgViews: 2400,
      engagementRate: 3.18,
      verifiedBadge: false,
    },
  });

  const dummyAccessToken = "EAA_test_mock_token_for_creator_sync";
  const encryptedToken = encryptSecret(dummyAccessToken);

  await prisma.socialAccount.create({
    data: {
      creatorId: creatorProfile.id,
      platform: "INSTAGRAM",
      externalId: "1784140000000001",
      username: "marcusvance",
      oauthTokenEnc: encryptedToken,
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isVerified: true,
      lastSyncedAt: new Date(),
    },
  });

  // Verify social account linking
  const savedAccount = await prisma.socialAccount.findUnique({
    where: {
      platform_externalId: {
        platform: "INSTAGRAM",
        externalId: "1784140000000001",
      },
    },
  });

  assert.ok(savedAccount, "SocialAccount saved");
  assert.strictEqual(savedAccount.platform, "INSTAGRAM", "Platform is INSTAGRAM");
  assert.strictEqual(savedAccount.isVerified, true, "Account is marked verified");
  assert.notStrictEqual(savedAccount.oauthTokenEnc, dummyAccessToken, "Token is not stored in plaintext");

  // Verify Bayesian TrustScore calculation on creator telemetry
  const evaluation = TrustScoreEngine.evaluate({
    followers: 42000,
    following: 380,
    totalPosts: 35,
    avgLikes: 1250,
    avgComments: 85,
    engagementRate: 3.18,
    engagementHistory: [
      { postIndex: 1, date: "01/09/2026", likes: 1300, comments: 90, views: 2500, engagementRate: 3.3, isAnomaly: false },
      { postIndex: 2, date: "02/09/2026", likes: 1200, comments: 80, views: 2300, engagementRate: 3.0, isAnomaly: false },
    ],
    category: "Fitness",
    isVerified: true,
  });

  assert.ok(evaluation.score >= 10 && evaluation.score <= 99, "TrustScore within valid bounds (10-99)");
  assert.ok(evaluation.factors.length > 0, "Factor breakdown generated");
  assert.strictEqual(evaluation.modelVersion, "v1.2", "Model version v1.2 preserved");

  const trustRecord = await prisma.trustScoreRecord.create({
    data: {
      creatorId: creatorProfile.id,
      score: evaluation.score,
      scoreBand: evaluation.scoreBand.toUpperCase().replace(/\s+/g, "_") as any,
      riskLevel: evaluation.riskLevel.toUpperCase() as any,
      inflatedProbability: evaluation.inflatedProbability,
      uncertaintyMargin: evaluation.uncertaintyMargin,
      authenticityProbability: evaluation.authenticityProbability,
      commentDiversityPercent: evaluation.commentDiversityPercent,
      growthStabilityScore: evaluation.growthStabilityScore,
      consistencyScore: evaluation.consistencyScore,
      volatilityIndex: evaluation.volatilityIndex,
      dataCoverage: evaluation.dataCoverage.toUpperCase() as any,
      modelVersion: evaluation.modelVersion,
      factors: {
        create: evaluation.factors.map((f) => ({
          name: f.name,
          score: f.score,
          signalType: f.signalType,
          description: f.description,
        })),
      },
    },
    include: { factors: true },
  });

  assert.ok(trustRecord.id, "TrustScoreRecord persisted");
  assert.strictEqual(trustRecord.factors.length, evaluation.factors.length, "All TrustScoreFactors persisted");

  // Clean up test records
  await prisma.user.delete({ where: { id: user.id } });
  console.log("  ✅ PASS: Creator database models, snapshots, and Bayesian trust score successfully saved");

  console.log("\n==================================================");
  console.log("ALL META INSTAGRAM API INTEGRATION TESTS PASSED!");
  console.log("==================================================");
}

runInstagramIntegrationTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
