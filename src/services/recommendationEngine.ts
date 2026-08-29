import { Creator } from "@/types/creator";
import { MatchRecommendation } from "@/types/schema";

export interface CampaignBriefRequirements {
  category?: string;
  platform?: string;
  minTrustScore?: number;
  maxBudget?: number;
  minFollowers?: number;
  maxFollowers?: number;
  targetLocation?: string;
}

export class RecommendationEngine {
  /**
   * Calculate Campaign Match Score for a given creator
   */
  public static matchCreator(creator: Creator, reqs: CampaignBriefRequirements): MatchRecommendation {
    let score = 50; // baseline
    const reasons: string[] = [];

    // 1. Category Alignment (+20)
    let categoryMatch = false;
    if (reqs.category && reqs.category !== "all") {
      if (creator.category.toLowerCase() === reqs.category.toLowerCase()) {
        score += 20;
        categoryMatch = true;
        reasons.push(`✓ Matches your ${creator.category} campaign category`);
      }
    } else {
      categoryMatch = true;
    }

    // 2. TrustScore Threshold (+20)
    let trustScoreMatch = false;
    const minScore = reqs.minTrustScore || 80;
    if (creator.trustScore >= minScore) {
      score += 20;
      trustScoreMatch = true;
      reasons.push(`✓ TrustScore of ${creator.trustScore} exceeds your ${minScore} threshold`);
    } else {
      score -= 15;
    }

    // 3. Audience Size Tier (+10)
    let audienceMatch = true;
    if (reqs.minFollowers && creator.followers < reqs.minFollowers) {
      audienceMatch = false;
      score -= 10;
    }
    if (reqs.maxFollowers && creator.followers > reqs.maxFollowers) {
      audienceMatch = false;
      score -= 10;
    }
    if (audienceMatch) {
      score += 10;
      reasons.push(`✓ Audience size (${(creator.followers / 1000).toFixed(1)}k) aligns with your target reach`);
    }

    // 4. Budget Compatibility
    if (reqs.maxBudget && creator.startingRate <= reqs.maxBudget) {
      reasons.push(`✓ Starting rate ($${creator.startingRate}) fits within your $${reqs.maxBudget} budget`);
    }

    // 5. Verification Bonus
    if (creator.verifiedBadge) {
      score += 5;
      reasons.push(`✓ Verified Creator credentials confirmed via Graph API`);
    }

    // 6. Location Match
    let locationMatch = false;
    if (reqs.targetLocation) {
      if (creator.location.toLowerCase().includes(reqs.targetLocation.toLowerCase())) {
        score += 10;
        locationMatch = true;
        reasons.push(`✓ Based in your target territory (${creator.location})`);
      }
    }

    const finalMatchScore = Math.min(99, Math.max(25, score));

    return {
      creatorId: creator.id,
      matchScore: finalMatchScore,
      matchReasons: reasons,
      categoryMatch,
      trustScoreMatch,
      audienceMatch,
      locationMatch,
    };
  }

  /**
   * Rank creators for a specific campaign brief
   */
  public static recommendCreators(creators: Creator[], reqs: CampaignBriefRequirements, limit = 6): { creator: Creator; match: MatchRecommendation }[] {
    const scored = creators.map((creator) => ({
      creator,
      match: this.matchCreator(creator, reqs),
    }));

    scored.sort((a, b) => b.match.matchScore - a.match.matchScore);
    return scored.slice(0, limit);
  }
}
