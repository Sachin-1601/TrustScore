import { Platform, Category, RiskLevel, ScoreBand, FollowerGrowthPoint, EngagementPostPoint, CommentQualityMetric, SubScoreBreakdown, PrescriptiveGuidance } from "./influencer";

export interface Creator {
  id: string;
  username: string; // e.g. "@alexfitness"
  name: string;
  avatar: string;
  coverImage?: string;
  platform: Platform;
  category: Category;
  bio: string;
  location: string;
  joinedDate: string;
  verifiedBadge: boolean;
  verifiedDate?: string;
  profileUrl: string;

  // Audience & Authenticity Metrics
  followers: number;
  following: number;
  totalPosts: number;
  avgLikes: number;
  avgComments: number;
  avgViews?: number;
  engagementRate: number; // percentage, e.g. 4.8%

  // TrustScore Engine
  trustScore: number; // 0-100
  scoreBand: ScoreBand;
  riskLevel: RiskLevel;
  inflatedEngagementProbability: number; // e.g. 6.8%
  uncertaintyMargin: number; // e.g. 1.8%
  authenticityProbability: number; // e.g. 93.2%
  commentDiversityPercent: number; // e.g. 89%
  growthStabilityScore: number; // e.g. 91/100
  engagementConsistencyScore: number; // e.g. 92/100

  // Marketplace & Collaboration Details
  isAvailableForCollaboration: boolean;
  startingRate: number; // e.g. $450 USD
  preferredCampaignTypes: string[];
  pastBrandCollaborations?: string[];

  // Analytical Breakdown
  subScores: SubScoreBreakdown;
  commentQuality: CommentQualityMetric;
  prescriptiveGuidance: PrescriptiveGuidance;
  followerGrowthHistory: FollowerGrowthPoint[];
  engagementHistory: EngagementPostPoint[];
  positiveFactors: string[];
  warningFactors: string[];
  engagementVolatilityIndex: number;

  featuredRank?: number; // Leaderboard rank if top creator
  analyzedAt: string;
}

export interface Business {
  id: string;
  slug: string;
  name: string;
  logo: string;
  coverImage?: string;
  category: string;
  location: string;
  tagline: string;
  description: string;
  website: string;
  isSponsored: boolean;
  sponsorshipTier?: 'Starter' | 'Growth' | 'Premium';
  activeCampaignsCount: number;
  productsOrServices: string[];
  openOpportunities: {
    title: string;
    budget: string;
    deliverables: string;
    category: Category;
  }[];
  contactEmail: string;
  joinedDate: string;
}

export interface SponsoredAd {
  id: string;
  businessId: string;
  businessName: string;
  businessLogo: string;
  category: string;
  tagline: string;
  description: string;
  badgeText: 'Sponsored' | 'Featured Partner' | 'Advertisement';
  ctaText: string;
  ctaLink: string;
  placement: 'left_sidebar' | 'right_sidebar' | 'banner' | 'feed';
  impressionsCount?: number;
}

export interface CollaborationRequest {
  id: string;
  creatorId: string;
  creatorUsername: string;
  creatorAvatar: string;
  businessName: string;
  campaignName: string;
  campaignDescription: string;
  budget: number;
  deliverables: string;
  timeline: string;
  contactEmail: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Active' | 'Completed';
  createdAt: string;
  notes?: string;
}

export interface AdPackage {
  id: string;
  name: string;
  price: number;
  billingPeriod: string;
  tagline: string;
  features: string[];
  popular?: boolean;
  placementSummary: string;
}
