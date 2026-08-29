export type Platform = 'instagram' | 'tiktok' | 'youtube';

export type Category = 
  | 'Fitness'
  | 'Beauty'
  | 'Fashion'
  | 'Travel'
  | 'Food'
  | 'Technology'
  | 'Gaming'
  | 'Lifestyle';

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export type ScoreBand = 
  | 'Very High Trust'   // 90-100
  | 'High Trust'        // 75-89
  | 'Moderate Risk'     // 50-74
  | 'High Risk'         // 25-49
  | 'Very High Risk';   // 0-24

export interface FollowerGrowthPoint {
  month: string;
  followers: number;
  expectedOrganic: number;
  isSpike?: boolean;
  spikeReason?: string;
}

export interface EngagementPostPoint {
  postIndex: number;
  date: string;
  likes: number;
  comments: number;
  engagementRate: number; // percentage, e.g. 4.8
  views?: number;
  isAnomaly?: boolean;
}

export interface CommentQualityMetric {
  uniqueCommentsPercent: number; // e.g. 82
  repeatedPatternsPercent: number; // e.g. 8
  genericCommentsPercent: number; // e.g. 10
  emojiOnlyPercent: number;
  sampleAnalyzedComments: {
    text: string;
    type: 'organic' | 'generic' | 'pod_cluster' | 'repetitive';
    timestamp: string;
  }[];
  podClusterDetected: boolean;
  crowdTurfingRisk: 'Very Low' | 'Low' | 'Moderate' | 'High';
}

export interface SubScoreBreakdown {
  followerAuthenticity: number; // 0-100
  engagementAuthenticity: number; // 0-100
  commentQuality: number; // 0-100
  growthPattern: number; // 0-100
  engagementConsistency: number; // 0-100
}

export interface PrescriptiveGuidance {
  primaryRecommendation: string;
  recommendedPaymentAdjustment: string; // e.g. "0–5%", "15–25% discount", "Escrow / milestone pay"
  confidenceLevel: 'High' | 'Moderate' | 'Low';
  alternativeAction: string;
  riskMitigationChecklist: string[];
}

export interface Influencer {
  id: string;
  username: string;
  name: string;
  avatar: string;
  platform: Platform;
  category: Category;
  bio: string;
  location: string;
  joinedDate: string;
  verifiedBadge: boolean;
  verifiedDate?: string;
  profileUrl: string;

  // Key metrics
  followers: number;
  following: number;
  totalPosts: number;
  avgLikes: number;
  avgComments: number;
  avgViews?: number;
  engagementRate: number; // e.g. 4.8%

  // TrustScore Core
  trustScore: number; // 0-100
  scoreBand: ScoreBand;
  riskLevel: RiskLevel;
  inflatedEngagementProbability: number; // e.g. 6.8%
  uncertaintyMargin: number; // +/- e.g. 1.8%

  // Detailed breakdowns
  subScores: SubScoreBreakdown;
  commentQuality: CommentQualityMetric;
  prescriptiveGuidance: PrescriptiveGuidance;

  // Time-series & analytics data
  followerGrowthHistory: FollowerGrowthPoint[];
  engagementHistory: EngagementPostPoint[];
  
  // Drivers
  positiveFactors: string[];
  warningFactors: string[];

  // Comparison specific metrics
  likeToFollowerRatio: number; // percentage
  commentToLikeRatio: number; // percentage
  engagementVolatilityIndex: number; // 0-100, lower is more stable

  analyzedAt: string;
}

export interface PortfolioSummary {
  totalAnalyzed: number;
  highTrustCount: number;
  moderateRiskCount: number;
  highRiskCount: number;
  estimatedBudgetProtected: number;
  avgPortfolioTrustScore: number;
}
