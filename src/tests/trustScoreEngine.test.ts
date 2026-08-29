import { TrustScoreEngine } from "../services/trustScoreEngine";

export function runTrustScoreEngineTests() {
  console.log("--- RUNNING TRUSTSCORE ENGINE TESTS ---");
  let passed = 0;
  let total = 0;

  // Test 1: High-Authenticity Organic Creator
  total++;
  const highEval = TrustScoreEngine.evaluate({
    followers: 24200,
    following: 420,
    totalPosts: 124,
    avgLikes: 1120,
    avgComments: 88,
    engagementRate: 5.0,
    category: "Fitness",
    isVerified: true,
    followerGrowthHistory: [
      { month: "Jan", followers: 20000, expectedOrganic: 20000 },
      { month: "Feb", followers: 20400, expectedOrganic: 20400 },
      { month: "Mar", followers: 20800, expectedOrganic: 20800 },
      { month: "Apr", followers: 21200, expectedOrganic: 21200 },
      { month: "May", followers: 21600, expectedOrganic: 21600 },
      { month: "Jun", followers: 22000, expectedOrganic: 22000 },
      { month: "Jul", followers: 22400, expectedOrganic: 22400 },
      { month: "Aug", followers: 22800, expectedOrganic: 22800 },
      { month: "Sep", followers: 23200, expectedOrganic: 23200 },
      { month: "Oct", followers: 23600, expectedOrganic: 23600 },
      { month: "Nov", followers: 23900, expectedOrganic: 23900 },
      { month: "Dec", followers: 24200, expectedOrganic: 24200 },
    ],
    engagementHistory: Array.from({ length: 25 }).map((_, i) => ({
      postIndex: i + 1,
      date: `Day ${i + 1}`,
      likes: 1100 + (i % 3) * 10,
      comments: 88 + (i % 2) * 2,
      engagementRate: 5.0,
      isAnomaly: false,
    })),
    commentQuality: {
      uniqueCommentsPercent: 92,
      podClusterDetected: false,
    },
  });

  if (highEval.score >= 90 && highEval.riskLevel === "Low" && highEval.confidence === "High") {
    console.log("✓ Test 1 Passed: High-Authenticity Creator received score >= 90 with Low Risk and High Confidence.");
    passed++;
  } else {
    console.error("✗ Test 1 Failed:", highEval);
  }

  // Test 2: Suspected Pod / Volatile Creator
  total++;
  const podEval = TrustScoreEngine.evaluate({
    followers: 35000,
    following: 1200,
    totalPosts: 40,
    avgLikes: 2500,
    avgComments: 200,
    engagementRate: 7.7,
    category: "Fashion",
    isVerified: false,
    engagementHistory: [
      { postIndex: 1, date: "D1", likes: 100, comments: 5, engagementRate: 0.3, isAnomaly: false },
      { postIndex: 2, date: "D2", likes: 5000, comments: 400, engagementRate: 15.4, isAnomaly: true },
      { postIndex: 3, date: "D3", likes: 200, comments: 10, engagementRate: 0.6, isAnomaly: false },
      { postIndex: 4, date: "D4", likes: 6000, comments: 500, engagementRate: 18.5, isAnomaly: true },
    ],
    commentQuality: {
      uniqueCommentsPercent: 45,
      podClusterDetected: true,
    },
  });

  if (podEval.score < 75 && podEval.inflatedProbability > 15) {
    console.log("✓ Test 2 Passed: Erratic / Pod Creator penalized correctly with high inflation probability.");
    passed++;
  } else {
    console.error("✗ Test 2 Failed:", podEval);
  }

  // Test 3: Sparse Data Uncertainty
  total++;
  const sparseEval = TrustScoreEngine.evaluate({
    followers: 3500,
    following: 200,
    totalPosts: 3,
    avgLikes: 120,
    avgComments: 8,
    engagementRate: 3.6,
  });

  if (sparseEval.dataCoverage === "Insufficient" && sparseEval.confidence === "Low" && sparseEval.uncertaintyMargin >= 4.0) {
    console.log("✓ Test 3 Passed: Sparse Data Creator flagged with Low Confidence and wide uncertainty margin.");
    passed++;
  } else {
    console.error("✗ Test 3 Failed:", sparseEval);
  }

  console.log(`\nEngine Test Results: ${passed}/${total} tests passed.\n`);
  return passed === total;
}

if (require.main === module) {
  runTrustScoreEngineTests();
}
