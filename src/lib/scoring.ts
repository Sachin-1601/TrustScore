import { Influencer, Platform, Category } from "@/types/influencer";
import { MOCK_INFLUENCERS } from "@/data/mockInfluencers";
import { getScoreBand, getRiskLevel } from "./utils";

export function findInfluencerByQuery(query: string): Influencer | undefined {
  const clean = query.trim().toLowerCase().replace("@", "").replace("https://", "").replace("http://", "");
  
  // Direct match or partial match
  return MOCK_INFLUENCERS.find(
    (inf) =>
      inf.id.toLowerCase() === clean ||
      inf.username.toLowerCase().replace("@", "") === clean ||
      inf.name.toLowerCase().includes(clean) ||
      inf.profileUrl.toLowerCase().includes(clean)
  );
}

export function generateSimulatedAnalysis(input: string, platform: Platform = "instagram", category: Category = "Lifestyle"): Influencer {
  const existing = findInfluencerByQuery(input);
  if (existing) return existing;

  const handle = input.trim().startsWith("@") ? input.trim() : `@${input.trim().split("/").pop() || "creator"}`;
  const cleanName = handle.replace("@", "").replace(/[^a-zA-Z0-9_]/g, "");
  
  // Deterministic seed from string
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = (hash << 5) - hash + cleanName.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  
  const trustScore = 45 + (absHash % 50); // 45 to 94
  const inflatedProb = Number((Math.max(2.5, (100 - trustScore) * 0.85 + (absHash % 10) - 5)).toFixed(1));
  const followers = 5000 + (absHash % 45000);
  const engagementRate = Number((2.8 + (absHash % 55) / 10).toFixed(1));
  const risk = getRiskLevel(trustScore);
  const scoreBand = getScoreBand(trustScore);

  const subFollower = Math.min(99, Math.max(30, trustScore + (absHash % 8 - 4)));
  const subEngage = Math.min(99, Math.max(30, trustScore + (absHash % 10 - 5)));
  const subComment = Math.min(99, Math.max(30, trustScore + (absHash % 12 - 6)));
  const subGrowth = Math.min(99, Math.max(30, trustScore + (absHash % 6 - 3)));
  const subConsistency = Math.min(99, Math.max(30, trustScore + (absHash % 14 - 7)));

  return {
    id: cleanName.toLowerCase(),
    username: handle,
    name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
    avatar: `https://images.unsplash.com/photo-${1534528741775 + (absHash % 1000)}?w=150&auto=format&fit=crop&q=80`,
    platform,
    category,
    bio: `Content creator exploring ${category.toLowerCase()} & digital storytelling. Sharing authentic moments.`,
    location: "United States",
    joinedDate: "2022",
    verifiedBadge: trustScore > 90,
    profileUrl: `https://${platform}.com/${cleanName}`,
    followers,
    following: 400 + (absHash % 800),
    totalPosts: 80 + (absHash % 250),
    avgLikes: Math.round(followers * (engagementRate / 100) * 0.9),
    avgComments: Math.round(followers * (engagementRate / 100) * 0.1),
    avgViews: Math.round(followers * 0.6),
    engagementRate,
    trustScore,
    scoreBand,
    riskLevel: risk,
    inflatedEngagementProbability: inflatedProb,
    uncertaintyMargin: 1.8,
    subScores: {
      followerAuthenticity: subFollower,
      engagementAuthenticity: subEngage,
      commentQuality: subComment,
      growthPattern: subGrowth,
      engagementConsistency: subConsistency,
    },
    commentQuality: {
      uniqueCommentsPercent: Math.min(95, Math.max(40, trustScore - 5)),
      repeatedPatternsPercent: Math.max(5, Math.round((100 - trustScore) * 0.5)),
      genericCommentsPercent: Math.max(5, Math.round((100 - trustScore) * 0.4)),
      emojiOnlyPercent: Math.max(2, Math.round((100 - trustScore) * 0.2)),
      sampleAnalyzedComments: [
        { text: "Great insights on this topic!", type: "organic", timestamp: "1h ago" },
        { text: "Love the aesthetic and styling here", type: "organic", timestamp: "3h ago" },
        { text: "🔥🔥", type: "generic", timestamp: "4h ago" },
      ],
      podClusterDetected: trustScore < 65,
      crowdTurfingRisk: trustScore > 75 ? "Very Low" : trustScore > 50 ? "Moderate" : "High",
    },
    prescriptiveGuidance: {
      primaryRecommendation:
        trustScore >= 75
          ? "Proceed with normal campaign consideration."
          : trustScore >= 50
          ? "Negotiate 10–20% rate reduction and require trackable conversion metrics."
          : "Not recommended for fixed-fee activation. Require performance-only payout.",
      recommendedPaymentAdjustment:
        trustScore >= 85 ? "0–5%" : trustScore >= 75 ? "5–10%" : trustScore >= 50 ? "15–25% discount" : "40–60% discount",
      confidenceLevel: trustScore > 80 || trustScore < 40 ? "High" : "Moderate",
      alternativeAction:
        trustScore >= 75
          ? "Request Creator Verification badge link."
          : "Request 30-day story view & audience country analytics before signing.",
      riskMitigationChecklist: [
        "Include minimum performance deliverables in agreement",
        "Monitor post-campaign comment engagement velocity",
      ],
    },
    followerGrowthHistory: [
      { month: "Jan", followers: Math.round(followers * 0.7), expectedOrganic: Math.round(followers * 0.7) },
      { month: "Mar", followers: Math.round(followers * 0.77), expectedOrganic: Math.round(followers * 0.76) },
      { month: "Jun", followers: Math.round(followers * 0.86), expectedOrganic: Math.round(followers * 0.85) },
      { month: "Sep", followers: Math.round(followers * 0.94), expectedOrganic: Math.round(followers * 0.93) },
      { month: "Dec", followers: followers, expectedOrganic: followers },
    ],
    engagementHistory: Array.from({ length: 30 }).map((_, i) => ({
      postIndex: i + 1,
      date: `Day ${i + 1}`,
      likes: Math.round(followers * (engagementRate / 100) * (0.8 + Math.random() * 0.4)),
      comments: Math.round(followers * (engagementRate / 100) * 0.1 * (0.8 + Math.random() * 0.4)),
      engagementRate: Number((engagementRate * (0.85 + Math.random() * 0.3)).toFixed(2)),
      views: Math.round(followers * 0.5 * (0.8 + Math.random() * 0.4)),
      isAnomaly: false,
    })),
    positiveFactors: [
      "Consistent posting schedule aligned with creator category",
      "Stable follower growth line over analyzed window",
    ],
    warningFactors:
      trustScore < 75
        ? ["Elevated variance in comment-to-like ratios across top posts", "Mild engagement pod interaction signatures"]
        : ["Standard seasonal engagement fluctuations"],
    likeToFollowerRatio: Number((engagementRate * 0.9).toFixed(2)),
    commentToLikeRatio: 10.0,
    engagementVolatilityIndex: Number((100 - trustScore + 10).toFixed(1)),
    analyzedAt: new Date().toISOString(),
  };
}
