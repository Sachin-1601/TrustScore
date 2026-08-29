import { db } from "@/db/client";
import { Creator } from "@/types/creator";
import { TrustScoreEngine } from "./trustScoreEngine";

export interface CreatorFilterParams {
  query?: string;
  category?: string;
  platform?: string;
  minTrustScore?: number;
  followerRange?: "all" | "nano" | "micro";
  location?: string;
  verifiedOnly?: boolean;
  sortBy?: "trust" | "risk" | "engagement" | "followers" | "verified";
  limit?: number;
  offset?: number;
}

export class CreatorService {
  /**
   * Search and filter creators with pagination
   */
  public static async getCreators(params: CreatorFilterParams = {}): Promise<{ creators: Creator[]; total: number }> {
    let all = await db.listCreators();

    if (params.query?.trim()) {
      const q = params.query.toLowerCase();
      all = all.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.bio.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
      );
    }

    if (params.category && params.category !== "all") {
      all = all.filter((c) => c.category.toLowerCase() === params.category!.toLowerCase());
    }

    if (params.platform && params.platform !== "all") {
      all = all.filter((c) => c.platform === params.platform);
    }

    if (params.minTrustScore && params.minTrustScore > 0) {
      all = all.filter((c) => c.trustScore >= params.minTrustScore!);
    }

    if (params.followerRange === "nano") {
      all = all.filter((c) => c.followers >= 1000 && c.followers <= 10000);
    } else if (params.followerRange === "micro") {
      all = all.filter((c) => c.followers > 10000 && c.followers <= 50000);
    }

    if (params.location && params.location !== "all") {
      all = all.filter((c) => c.location.toLowerCase().includes(params.location!.toLowerCase()));
    }

    if (params.verifiedOnly) {
      all = all.filter((c) => c.verifiedBadge);
    }

    // Sort
    all.sort((a, b) => {
      if (params.sortBy === "risk") return a.inflatedEngagementProbability - b.inflatedEngagementProbability;
      if (params.sortBy === "engagement") return b.engagementRate - a.engagementRate;
      if (params.sortBy === "followers") return b.followers - a.followers;
      if (params.sortBy === "verified") return (b.verifiedBadge ? 1 : 0) - (a.verifiedBadge ? 1 : 0);
      return b.trustScore - a.trustScore; // default: highest TrustScore
    });

    const total = all.length;
    const offset = params.offset || 0;
    const limit = params.limit || all.length;
    const paginated = all.slice(offset, offset + limit);

    return { creators: paginated, total };
  }

  public static async getCreatorById(id: string): Promise<Creator | null> {
    return db.findCreatorById(id);
  }

  public static async getLeaderboard(category = "all", platform = "all", limit = 15): Promise<Creator[]> {
    const { creators } = await this.getCreators({
      category,
      platform,
      sortBy: "trust",
      limit,
    });
    return creators;
  }

  /**
   * Onboard a new creator and evaluate their TrustScore
   */
  public static async onboardCreator(data: {
    name: string;
    username: string;
    category: string;
    location: string;
    platform: "instagram" | "tiktok" | "youtube";
    followers?: number;
    bio?: string;
  }): Promise<Creator> {
    const rawFollowers = data.followers || 18400;
    const rawEngagement = 5.1;

    // Run TrustScore Engine
    const evaluation = TrustScoreEngine.evaluate({
      followers: rawFollowers,
      following: 340,
      totalPosts: 120,
      avgLikes: 890,
      avgComments: 65,
      engagementRate: rawEngagement,
      category: data.category,
      isVerified: true,
    });

    const newCreator: Creator = {
      id: data.username.replace("@", "").toLowerCase(),
      username: data.username.startsWith("@") ? data.username : `@${data.username}`,
      name: data.name,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      platform: data.platform,
      category: data.category as any,
      bio: data.bio || `Creator in ${data.category}. Melbourne, Australia 🇦🇺`,
      location: data.location,
      joinedDate: "August 2026",
      verifiedBadge: true,
      verifiedDate: "August 2026",
      profileUrl: `https://${data.platform}.com/${data.username.replace("@", "")}`,
      followers: rawFollowers,
      following: 340,
      totalPosts: 120,
      avgLikes: 890,
      avgComments: 65,
      engagementRate: rawEngagement,
      trustScore: evaluation.score,
      scoreBand: evaluation.scoreBand,
      riskLevel: evaluation.riskLevel,
      inflatedEngagementProbability: evaluation.inflatedProbability,
      uncertaintyMargin: evaluation.uncertaintyMargin,
      authenticityProbability: evaluation.authenticityProbability,
      commentDiversityPercent: evaluation.commentDiversityPercent,
      growthStabilityScore: evaluation.growthStabilityScore,
      engagementConsistencyScore: evaluation.consistencyScore,
      isAvailableForCollaboration: true,
      startingRate: 350,
      preferredCampaignTypes: ["Dedicated Reel", "Story Series"],
      subScores: {
        followerAuthenticity: 94,
        engagementAuthenticity: 92,
        commentQuality: evaluation.commentDiversityPercent,
        growthPattern: evaluation.growthStabilityScore,
        engagementConsistency: evaluation.consistencyScore,
      },
      commentQuality: {
        uniqueCommentsPercent: evaluation.commentDiversityPercent,
        repeatedPatternsPercent: 5,
        genericCommentsPercent: 6,
        emojiOnlyPercent: 4,
        sampleAnalyzedComments: [
          { text: "Great quality advice on this post!", type: "organic", timestamp: "2h ago" },
        ],
        podClusterDetected: false,
        crowdTurfingRisk: "Very Low",
      },
      prescriptiveGuidance: {
        primaryRecommendation: evaluation.prescriptiveGuidance.recommendation,
        recommendedPaymentAdjustment: evaluation.prescriptiveGuidance.paymentAdjustment,
        confidenceLevel: evaluation.confidence,
        alternativeAction: "Standard campaign terms",
        riskMitigationChecklist: evaluation.prescriptiveGuidance.riskChecklist,
      },
      followerGrowthHistory: [
        { month: "Jan", followers: rawFollowers - 3000, expectedOrganic: rawFollowers - 3000 },
        { month: "Dec", followers: rawFollowers, expectedOrganic: rawFollowers },
      ],
      engagementHistory: Array.from({ length: 15 }).map((_, i) => ({
        postIndex: i + 1,
        date: `Day ${i + 1}`,
        likes: Math.round(850 + Math.sin(i) * 50),
        comments: Math.round(65 + Math.cos(i) * 5),
        engagementRate: rawEngagement,
        isAnomaly: false,
      })),
      positiveFactors: [
        "Verified direct Graph API connection",
        "Consistent follower accumulation rate",
        "High comment lexical diversity",
      ],
      warningFactors: [],
      engagementVolatilityIndex: evaluation.volatilityIndex,
      analyzedAt: evaluation.calculatedAt,
    };

    return db.createCreatorProfile(newCreator);
  }
}
