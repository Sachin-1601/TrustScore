export interface SaaSSubscriptionPlan {
  id: "starter" | "growth" | "agency";
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  creatorChecksMonthly: number;
  popular?: boolean;
  badge?: string;
  description: string;
  features: string[];
  stripePriceIdMonthly: string;
  stripePriceIdAnnual: string;
  teamSeats: number;
  radarLimit: number;
  apiAccess: boolean;
}

export interface AddonCreditPack {
  id: string;
  name: string;
  checksCount: number;
  price: number;
  unitPrice: number;
  popular?: boolean;
}

export interface FeatureMatrixCategory {
  category: string;
  features: {
    name: string;
    description: string;
    starter: boolean | string;
    growth: boolean | string;
    agency: boolean | string;
  }[];
}

export const SAAS_PLANS: SaaSSubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For small brands & boutique agencies verifying initial rosters",
    priceMonthly: 39,
    priceAnnual: 29,
    creatorChecksMonthly: 25,
    popular: false,
    badge: "Save 26%",
    description: "Ideal for boutique brands and emerging agencies verifying initial creator rosters.",
    features: [
      "25 Creator Authenticity Audits / month",
      "Probabilistic TrustScore analysis (0-100)",
      "Comment lexical entropy breakdown",
      "Up to 2 creator side-by-side comparisons",
      "Standard CSV dossier exports",
      "Direct collaboration messaging",
      "Standard email support",
    ],
    stripePriceIdMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || "",
    stripePriceIdAnnual: process.env.STRIPE_PRICE_STARTER_ANNUAL || "",
    teamSeats: 1,
    radarLimit: 2,
    apiAccess: false,
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For scaling brands running active multi-creator campaigns",
    priceMonthly: 99,
    priceAnnual: 79,
    creatorChecksMonthly: 100,
    popular: true,
    badge: "Most Popular • Save 20%",
    description: "For scaling direct-to-consumer brands running active multi-creator campaigns.",
    features: [
      "100 Creator Authenticity Audits / month",
      "Full 5-Dimension Radar comparisons (up to 4)",
      "Prescriptive rate adjustment calculator",
      "Copyable counter-offer negotiation scripts",
      "Engagement volatility & pod ring detection",
      "Multi-page branded PDF reports",
      "Campaign fit recommendation engine",
      "Team workspace (up to 3 seats)",
      "Priority live support",
    ],
    stripePriceIdMonthly: process.env.STRIPE_PRICE_GROWTH_MONTHLY || "",
    stripePriceIdAnnual: process.env.STRIPE_PRICE_GROWTH_ANNUAL || "",
    teamSeats: 3,
    radarLimit: 4,
    apiAccess: false,
  },
  {
    id: "agency",
    name: "Agency",
    tagline: "For talent agencies and enterprise media planners",
    priceMonthly: 249,
    priceAnnual: 199,
    creatorChecksMonthly: 300,
    popular: false,
    badge: "Save 20%",
    description: "For talent agencies and enterprise media planners managing hundreds of creators.",
    features: [
      "300 Creator Authenticity Audits / month",
      "Unlimited multi-creator comparison radars",
      "Bulk CSV & JSON batch upload analysis",
      "Custom white-labeled client PDF reports",
      "REST API Data Export & Webhooks",
      "Unlimited team user seats & permissions",
      "Dedicated account manager",
      "99.9% uptime SLA & custom feature requests",
    ],
    stripePriceIdMonthly: process.env.STRIPE_PRICE_AGENCY_MONTHLY || "",
    stripePriceIdAnnual: process.env.STRIPE_PRICE_AGENCY_ANNUAL || "",
    teamSeats: 999,
    radarLimit: 999,
    apiAccess: true,
  },
];

export const ADDON_CREDIT_PACKS: AddonCreditPack[] = [
  {
    id: "addon-25",
    name: "Starter Boost",
    checksCount: 25,
    price: 29,
    unitPrice: 1.16,
  },
  {
    id: "addon-75",
    name: "Campaign Surge",
    checksCount: 75,
    price: 69,
    unitPrice: 0.92,
    popular: true,
  },
  {
    id: "addon-200",
    name: "Enterprise Batch",
    checksCount: 200,
    price: 149,
    unitPrice: 0.74,
  },
];

export const FEATURE_COMPARISON_MATRIX: FeatureMatrixCategory[] = [
  {
    category: "Audits & Telemetry",
    features: [
      {
        name: "Monthly Creator Authenticity Audits",
        description: "Number of full creator profile audits included per monthly billing cycle",
        starter: "25 audits / mo",
        growth: "100 audits / mo",
        agency: "300 audits / mo",
      },
      {
        name: "Bayesian Shrinkage TrustScore (0–100)",
        description: "Probabilistic authenticity scoring calibrated for sparse micro-influencer data",
        starter: true,
        growth: true,
        agency: true,
      },
      {
        name: "Comment Lexical Entropy & Pod Detection",
        description: "Natural language entropy analysis to identify bot comments and reciprocal pod groups",
        starter: "Basic",
        growth: "Advanced (Full stream)",
        agency: "Enterprise deep-scan",
      },
      {
        name: "12-Month Poisson Follower Growth Analysis",
        description: "Statistical step-jump anomaly detection to identify sudden purchased follower spikes",
        starter: true,
        growth: true,
        agency: true,
      },
      {
        name: "Post-by-Post Engagement Volatility Index",
        description: "Variance metrics to distinguish organic viral spikes from inorganic engagement batches",
        starter: false,
        growth: true,
        agency: true,
      },
    ],
  },
  {
    category: "Rate Negotiation & ROI Protection",
    features: [
      {
        name: "Prescriptive Rate Adjustment Calculator",
        description: "Calculates suggested counter-offers and fair market baseline based on authentic audience size",
        starter: "Limited",
        growth: true,
        agency: true,
      },
      {
        name: "1-Click Counter-Offer Negotiation Scripts",
        description: "Pre-written professional negotiation messages ready to copy into DMs or outreach emails",
        starter: false,
        growth: true,
        agency: true,
      },
      {
        name: "Milestone Escrow Contract Guidelines",
        description: "Recommended risk-mitigation terms (e.g. 50% upfront / 50% 7-day retention checkpoint)",
        starter: false,
        growth: true,
        agency: true,
      },
      {
        name: "Estimated Budget Waste Protection Telemetry",
        description: "Real-time calculation of dollars saved from synthetic engagement inflation",
        starter: true,
        growth: true,
        agency: true,
      },
    ],
  },
  {
    category: "Comparisons, Reports & Workspaces",
    features: [
      {
        name: "Side-by-Side Multi-Creator Radar Matrix",
        description: "Simultaneous 5-dimensional evaluation of creator strengths and vulnerabilities",
        starter: "Up to 2 creators",
        growth: "Up to 4 creators",
        agency: "Unlimited creators",
      },
      {
        name: "Dossier Export Formats",
        description: "Export full authenticity audits for brand clients and team stakeholders",
        starter: "Standard CSV",
        growth: "Branded PDF + CSV",
        agency: "Whitelabel Custom PDF + CSV",
      },
      {
        name: "Bulk Batch Profile Upload",
        description: "Upload CSV or JSON rosters to audit hundreds of creator handles simultaneously",
        starter: false,
        growth: false,
        agency: true,
      },
      {
        name: "Team Collaboration Seats",
        description: "Invite media planners, analysts, and marketing directors to shared workspace",
        starter: "1 seat",
        growth: "3 seats",
        agency: "Unlimited seats",
      },
      {
        name: "REST API Access & Webhooks",
        description: "Programmatic endpoint access for custom CRM, Notion, or Zapier pipelines",
        starter: false,
        growth: false,
        agency: true,
      },
      {
        name: "Customer Support & SLA",
        description: "Response times and dedicated support options",
        starter: "Standard email",
        growth: "Priority email & chat",
        agency: "Dedicated Account Mgr & 99.9% SLA",
      },
    ],
  },
];

export class PricingService {
  public static getPlans(): SaaSSubscriptionPlan[] {
    return SAAS_PLANS;
  }

  public static getPlanById(id: string): SaaSSubscriptionPlan {
    return SAAS_PLANS.find((p) => p.id === id) || SAAS_PLANS[1];
  }

  public static getAddonPacks(): AddonCreditPack[] {
    return ADDON_CREDIT_PACKS;
  }

  public static getAddonPackById(id: string): AddonCreditPack | undefined {
    return ADDON_CREDIT_PACKS.find((p) => p.id === id);
  }

  public static getFeatureMatrix(): FeatureMatrixCategory[] {
    return FEATURE_COMPARISON_MATRIX;
  }

  /**
   * Recommends the optimal plan based on the volume of monthly creator checks needed
   */
  public static getRecommendedPlan(checksNeeded: number): SaaSSubscriptionPlan {
    if (checksNeeded <= 25) return SAAS_PLANS[0]; // Starter
    if (checksNeeded <= 100) return SAAS_PLANS[1]; // Growth
    return SAAS_PLANS[2]; // Agency
  }

  /**
   * Calculate exact annual billed total ($/year)
   */
  public static getAnnualBilledTotal(plan: SaaSSubscriptionPlan): number {
    return plan.priceAnnual * 12;
  }

  /**
   * Calculate exact savings percentage compared to 12 months of monthly pricing
   */
  public static getSavingsPercentage(plan: SaaSSubscriptionPlan): number {
    const fullMonthlyAnnualized = plan.priceMonthly * 12;
    const annualCost = plan.priceAnnual * 12;
    return Math.round(((fullMonthlyAnnualized - annualCost) / fullMonthlyAnnualized) * 100);
  }

  /**
   * Resolve configured Stripe Price ID from server environment
   */
  public static getStripePriceId(
    planId: "starter" | "growth" | "agency",
    billingCycle: "monthly" | "annual"
  ): string | undefined {
    const isAnnual = billingCycle === "annual";
    if (planId === "starter") {
      return isAnnual ? process.env.STRIPE_PRICE_STARTER_ANNUAL : process.env.STRIPE_PRICE_STARTER_MONTHLY;
    }
    if (planId === "growth") {
      return isAnnual ? process.env.STRIPE_PRICE_GROWTH_ANNUAL : process.env.STRIPE_PRICE_GROWTH_MONTHLY;
    }
    if (planId === "agency") {
      return isAnnual ? process.env.STRIPE_PRICE_AGENCY_ANNUAL : process.env.STRIPE_PRICE_AGENCY_MONTHLY;
    }
    return undefined;
  }

  /**
   * Estimate monthly budget waste prevented based on spend and industry average fraud rate (~28%)
   */
  public static calculateEstimatedSavings(monthlySpend: number, fraudRate = 0.28): {
    monthlyWaste: number;
    annualWaste: number;
    estimatedRoi: number;
  } {
    const monthlyWaste = Math.round(monthlySpend * fraudRate);
    const annualWaste = monthlyWaste * 12;
    const starterCost = SAAS_PLANS[0].priceMonthly * 12;
    const growthCost = SAAS_PLANS[1].priceMonthly * 12;
    const estimatedRoi = Math.round((annualWaste / growthCost) * 10) / 10;

    return {
      monthlyWaste,
      annualWaste,
      estimatedRoi: Math.max(estimatedRoi, 1.5),
    };
  }
}
