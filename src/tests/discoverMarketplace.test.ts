import { CreatorService } from "../services/creatorService";
import { db } from "../db/client";

async function runDiscoverTests() {
  console.log("==================================================");
  console.log("🧪 Running TrustScore Discover Marketplace Unit Tests");
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

  // 1. Test Creator Data Mapping & Insufficient Data Handling
  console.log("\n[1] Testing Creator Mapping & Data Quality");
  const mockPrisma = {
    id: "cuid-tech-review",
    userId: "user-tech-1",
    username: "organictech",
    name: "Tech Reviewer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    bio: "In-depth consumer technology and developer tool reviews.",
    category: "Technology",
    location: "Sydney, Australia",
    country: "Australia",
    platform: "YOUTUBE",
    followers: 18500,
    following: 240,
    totalPosts: 110,
    avgLikes: 750,
    avgComments: 60,
    avgViews: 3500,
    engagementRate: 4.8,
    startingRate: 450,
    isAvailable: true,
    availabilityStatus: "OPEN_TO_WORK",
    profileTags: ["Technology Reviews", "Developer Tools", "Open to Work"],
    verifiedBadge: true,
    verifiedAt: new Date(),
    dataCoverage: "GOOD",
    createdAt: new Date(),
    updatedAt: new Date(),
    trustScores: [
      {
        score: 93,
        scoreBand: "VERY_HIGH_TRUST",
        riskLevel: "LOW",
        inflatedProbability: 3.8,
        uncertaintyMargin: 1.1,
        authenticityProbability: 96.2,
        commentDiversityPercent: 89,
        growthStabilityScore: 94,
        consistencyScore: 92,
        volatilityIndex: 10.2,
        calculatedAt: new Date(),
        factors: [
          { signalType: "positive", name: "Strong engagement consistency across 15+ video uploads" },
        ],
      },
    ],
  };

  const mapped = CreatorService.mapPrismaToCreator(mockPrisma);
  assert(mapped.id === "organictech", "Mapped ID is clean lowercase handle");
  assert(mapped.username === "@organictech", "Mapped username has @ prefix");
  assert(mapped.trustScore === 93, "TrustScore is 93");
  assert(mapped.followers === 18500, "Followers is 18,500");
  assert(mapped.verifiedBadge === true, "Verified badge mapped correctly");
  assert(mapped.positiveFactors[0] === "Strong engagement consistency across 15+ video uploads", "Positive analytical factor mapped");

  // 2. Test Insufficient Data Handling
  console.log("\n[2] Testing Insufficient Data Handling");
  const unScoredPrisma = {
    id: "cuid-newbie",
    userId: "user-newbie",
    username: "newcreator",
    name: "New Creator",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    bio: "Just joined TrustScore.",
    category: "Fitness",
    location: "Melbourne, Australia",
    country: "Australia",
    platform: "INSTAGRAM",
    followers: 0,
    following: 0,
    totalPosts: 0,
    avgLikes: 0,
    avgComments: 0,
    avgViews: 0,
    engagementRate: 0,
    startingRate: 250,
    isAvailable: true,
    availabilityStatus: "OPEN_TO_WORK",
    profileTags: ["Open to Work"],
    verifiedBadge: false,
    dataCoverage: "INSUFFICIENT",
    createdAt: new Date(),
    updatedAt: new Date(),
    trustScores: [],
  };

  const unScoredMapped = CreatorService.mapPrismaToCreator(unScoredPrisma);
  assert(unScoredMapped.trustScore === 0, "Unscored creator has trustScore 0 (insufficient data)");
  assert(unScoredMapped.followers === 0, "Followers is 0");
  assert(unScoredMapped.verifiedBadge === false, "Unverified creator has verifiedBadge false");

  // 3. Test In-Memory Repository & Onboarding
  console.log("\n[3] Testing Dynamic Onboarding & Listing");
  const onboarded = await db.createCreatorProfile(mapped);
  assert(onboarded.id === "organictech", "Creator successfully created in repository");

  const found = await db.findCreatorById("organictech");
  assert(found !== null && found.name === "Tech Reviewer", "Creator retrieved by handle");

  const list = await db.listCreators();
  assert(list.length >= 1, "List creators returns created creator");

  console.log("\n==================================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runDiscoverTests();
