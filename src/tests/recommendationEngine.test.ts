import { RecommendationEngine } from "../services/recommendationEngine";
import { MOCK_CREATORS } from "../data/mockCreators";

export function runRecommendationEngineTests() {
  console.log("--- RUNNING RECOMMENDATION ENGINE TESTS ---");
  let passed = 0;
  let total = 0;

  const alex = MOCK_CREATORS.find((c) => c.id === "alexfitness")!;

  // Test 1: High Category & TrustScore Alignment
  total++;
  const match = RecommendationEngine.matchCreator(alex, {
    category: "Fitness",
    minTrustScore: 85,
    minFollowers: 10000,
    maxFollowers: 50000,
    targetLocation: "Melbourne",
  });

  if (match.matchScore >= 85 && match.categoryMatch && match.trustScoreMatch && match.matchReasons.length >= 3) {
    console.log("✓ Test 1 Passed: Perfect campaign fit received >= 85% match score with clear explanations.");
    passed++;
  } else {
    console.error("✗ Test 1 Failed:", match);
  }

  // Test 2: Mismatched Category
  total++;
  const mismatch = RecommendationEngine.matchCreator(alex, {
    category: "Beauty",
    minTrustScore: 90,
  });

  if (!mismatch.categoryMatch && mismatch.matchScore < match.matchScore) {
    console.log("✓ Test 2 Passed: Category mismatch reduced match score accordingly.");
    passed++;
  } else {
    console.error("✗ Test 2 Failed:", mismatch);
  }

  console.log(`\nRecommendation Test Results: ${passed}/${total} tests passed.\n`);
  return passed === total;
}

if (require.main === module) {
  runRecommendationEngineTests();
}
