export type CreatorPlanType = "FREE" | "PRO" | "VERIFIED";

export type SubscriptionStatus = "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELLED" | "INACTIVE";

export interface CreatorSubscriptionInfo {
  id: string;
  userId: string;
  plan: CreatorPlanType;
  priceMonthly: number;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  usage: {
    trustScoreChecks: {
      used: number;
      limit: number;
    };
    profileViews: {
      used: number;
      limit: number;
    };
    socialConnections: {
      used: number;
      limit: number;
    };
  };
}

export interface CreatorPlanFeature {
  id: CreatorPlanType;
  name: string;
  priceMonthly: number;
  description: string;
  popular?: boolean;
  badge?: string;
  features: string[];
}

export const CREATOR_PLANS: CreatorPlanFeature[] = [
  {
    id: "FREE",
    name: "Free",
    priceMonthly: 0,
    description: "For creators building their TrustScore profile.",
    features: [
      "Public creator profile",
      "TrustScore visibility",
      "Basic authenticity analytics",
      "Marketplace profile",
      "Collaboration opportunities",
    ],
  },
  {
    id: "PRO",
    name: "Pro Creator",
    priceMonthly: 9.99,
    description: "Designed for creators who want more visibility and deeper analytics.",
    popular: true,
    badge: "Most Popular",
    features: [
      "Advanced TrustScore analytics",
      "Detailed authenticity breakdown",
      "Verification badge eligibility",
      "Advanced profile insights",
      "More social account connections",
      "Priority collaboration visibility",
    ],
  },
  {
    id: "VERIFIED",
    name: "Verified Creator",
    priceMonthly: 19.99,
    description: "For creators who want enhanced credibility with brands.",
    badge: "Maximum Visibility",
    features: [
      "Everything in Pro",
      "Enhanced verification",
      "Verified authenticity badge",
      "Advanced creator analytics",
      "Increased marketplace visibility",
      "Priority discovery by businesses",
    ],
  },
];
