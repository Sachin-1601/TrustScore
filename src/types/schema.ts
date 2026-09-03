export type UserRole = "CREATOR" | "BUSINESS" | "AGENCY" | "ADMIN";

export type RiskLevel = "Low" | "Moderate" | "High" | "Critical";

export type ScoreBand =
  | "Very High Trust"
  | "High Trust"
  | "Moderate Risk"
  | "High Risk"
  | "Very High Risk";

export type DataCoverage =
  | "Excellent"
  | "Good"
  | "Moderate"
  | "Limited"
  | "Insufficient";

export type SocialPlatform = "instagram" | "tiktok" | "youtube";

export type CollaborationStatus =
  | "Pending"
  | "Accepted"
  | "Declined"
  | "Active"
  | "Completed"
  | "Cancelled";

export type CampaignStatus =
  | "Draft"
  | "Pending"
  | "Active"
  | "Completed"
  | "Cancelled";

export type AdPlacement = "left_sidebar" | "right_sidebar" | "banner" | "feed";

export type SubscriptionStatus =
  | "Active"
  | "Trialing"
  | "Past_Due"
  | "Cancelled"
  | "Expired";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  onboardingCompleted: boolean;
  onboardingStep?: number;
  creatorProfileId?: string;
  businessProfileId?: string;
}

export interface CreatorMetricSummary {
  followers: number;
  following: number;
  totalPosts: number;
  avgLikes: number;
  avgComments: number;
  avgViews?: number;
  engagementRate: number;
}

export interface TrustScoreEvaluation {
  score: number; // 0-100
  scoreBand: ScoreBand;
  riskLevel: RiskLevel;
  inflatedProbability: number; // e.g. 6.8%
  uncertaintyMargin: number; // ±1.8%
  authenticityProbability: number; // 93.2%
  commentDiversityPercent: number; // 89%
  growthStabilityScore: number; // 94
  consistencyScore: number; // 92
  volatilityIndex: number; // 11.4
  dataCoverage: DataCoverage;
  confidence: "High" | "Moderate" | "Low";
  modelVersion: string; // "v1.2"
  calculatedAt: string;
  factors: {
    name: string;
    score: number;
    signalType: "positive" | "warning";
    description: string;
  }[];
  prescriptiveGuidance: {
    recommendation: string;
    paymentAdjustment: string;
    riskChecklist: string[];
  };
}

export interface MatchRecommendation {
  creatorId: string;
  matchScore: number; // 0-100% fit
  matchReasons: string[];
  categoryMatch: boolean;
  trustScoreMatch: boolean;
  audienceMatch: boolean;
  locationMatch: boolean;
}
