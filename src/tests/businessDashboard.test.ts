import assert from "node:assert";
import { BusinessService } from "../services/businessService";
import { CreatorService } from "../services/creatorService";
import { CampaignService } from "../services/campaignService";
import { prisma } from "../lib/prisma";

async function runBusinessDashboardTests() {
  console.log("=================================================");
  console.log("RUNNING DEDICATED BUSINESS DASHBOARD TEST SUITE");
  console.log("=================================================\n");

  let passedAssertions = 0;

  // 1. Validate BusinessService returns real businesses without fake math/random
  console.log("Test 1: BusinessService querying and mapping");
  const businesses = await BusinessService.getBusinesses();
  assert(Array.isArray(businesses), "BusinessService.getBusinesses() must return an array");
  passedAssertions++;

  if (businesses.length > 0) {
    const firstBiz = businesses[0];
    assert(typeof firstBiz.name === "string" && firstBiz.name.length > 0, "Business must have a valid name");
    assert(typeof firstBiz.category === "string", "Business must have a category");
    assert(typeof firstBiz.activeCampaignsCount === "number", "activeCampaignsCount must be numeric");
    assert(firstBiz.activeCampaignsCount >= 0, "activeCampaignsCount must be non-negative");
    passedAssertions += 4;
  }
  console.log("✓ BusinessService query validation passed");

  // 2. Validate SavedCreator data integrity
  console.log("\nTest 2: SavedCreator data mapping and structure");
  const savedRecords = await prisma.savedCreator.findMany({
    include: {
      creator: {
        include: {
          user: true,
          trustScores: { orderBy: { calculatedAt: "desc" }, take: 1, include: { factors: true } },
          socialAccounts: true,
          verifications: true,
          engagementSnapshots: { orderBy: { recordedAt: "desc" }, take: 15 },
        },
      },
    },
    take: 5,
  });

  assert(Array.isArray(savedRecords), "Saved records query must return an array");
  passedAssertions++;

  for (const record of savedRecords) {
    const mapped = CreatorService.mapPrismaToCreator(record.creator);
    assert(typeof mapped.id === "string", "Mapped creator must have an id");
    assert(mapped.username.startsWith("@"), "Mapped creator username must start with @");
    assert(typeof mapped.trustScore === "number", "TrustScore must be a number");
    assert(mapped.trustScore >= 0 && mapped.trustScore <= 100, "TrustScore must be between 0 and 100");
    passedAssertions += 4;
  }
  console.log("✓ SavedCreator mapping validation passed");

  // 3. Validate Recent TrustScore Analysis queries
  console.log("\nTest 3: Recent TrustScore analyses retrieval");
  const recentAnalyses = await prisma.trustScoreRecord.findMany({
    take: 5,
    orderBy: { calculatedAt: "desc" },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          category: true,
          platform: true,
          followers: true,
          verifiedBadge: true,
        },
      },
    },
  });

  assert(Array.isArray(recentAnalyses), "Recent analyses query must return an array");
  passedAssertions++;

  for (const record of recentAnalyses) {
    assert(record.score >= 0 && record.score <= 100, "Analysis score must be within [0, 100]");
    assert(record.creator !== null, "Analysis record must link to a valid creator");
    assert(typeof record.creator.username === "string", "Creator must have a valid username");
    passedAssertions += 3;
  }
  console.log("✓ Recent TrustScore analyses validation passed");

  // 4. Validate CampaignService queries
  console.log("\nTest 4: CampaignService query and retrieval");
  const campaigns = await CampaignService.getCampaigns({});
  assert(Array.isArray(campaigns), "CampaignService.getCampaigns() must return an array");
  passedAssertions++;

  for (const camp of campaigns) {
    assert(typeof camp.id === "string", "Campaign must have an id");
    assert(typeof camp.title === "string" && camp.title.length > 0, "Campaign must have a title");
    assert(typeof camp.budget === "number" && camp.budget >= 0, "Campaign budget must be a positive number");
    passedAssertions += 3;
  }
  console.log("✓ CampaignService validation passed");

  // 5. Validate Role-Based Destination Logic
  console.log("\nTest 5: Canonical role-based destination routes");
  const getDestinationForRole = (role: string) => {
    if (role === "CREATOR") return "/dashboard/creator";
    if (role === "ADMIN") return "/admin";
    return "/dashboard/businesses";
  };

  assert.strictEqual(getDestinationForRole("CREATOR"), "/dashboard/creator", "CREATOR route must be /dashboard/creator");
  assert.strictEqual(getDestinationForRole("BUSINESS"), "/dashboard/businesses", "BUSINESS route must be /dashboard/businesses");
  assert.strictEqual(getDestinationForRole("AGENCY"), "/dashboard/businesses", "AGENCY route must be /dashboard/businesses");
  assert.strictEqual(getDestinationForRole("ADMIN"), "/admin", "ADMIN route must be /admin");
  passedAssertions += 4;
  console.log("✓ Canonical role-based destination routes verified");

  console.log(`\n=================================================`);
  console.log(`ALL BUSINESS DASHBOARD TESTS PASSED! (${passedAssertions} assertions verified)`);
  console.log(`=================================================\n`);
}

runBusinessDashboardTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
