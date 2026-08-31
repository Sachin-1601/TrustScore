import { AdPackage } from "@/types/creator";

/**
 * Production advertising package configuration (single source of truth for ad
 * pricing/placements). Prices are in USD; see currency centralization notes.
 */
export const AD_PACKAGES: AdPackage[] = [
  {
    id: "starter",
    name: "STARTER",
    price: 49,
    billingPeriod: "/ month",
    tagline: "For boutique brands & emerging consumer products",
    placementSummary: "Sidebar sponsored card & business directory listing",
    features: [
      "Homepage sponsored card (30-day rotation)",
      "Verified business profile page",
      "Listed in TrustScore Business Directory",
      "Direct creator inbound collaboration link",
      "Basic impression & click telemetry",
    ],
  },
  {
    id: "growth",
    name: "GROWTH",
    price: 99,
    billingPeriod: "/ month",
    tagline: "For scaling brands looking for active creator rosters",
    placementSummary: "Featured homepage placement & creator marketplace visibility",
    popular: true,
    features: [
      "Priority homepage sidebar & leaderboard placement",
      "Featured business badge across /creators marketplace",
      "Publish up to 5 open creator campaign opportunities",
      "60-day active sponsorship placement",
      "Direct creator messaging & collaboration tools",
      "Detailed engagement analytics & click tracking",
    ],
  },
  {
    id: "premium",
    name: "PREMIUM",
    price: 199,
    billingPeriod: "/ month",
    tagline: "For enterprise agencies & high-volume brand campaigns",
    placementSummary: "Top-tier banner & multi-channel marketplace advertising",
    features: [
      "Prime sticky homepage & directory top placement",
      "Unlimited open campaign opportunity listings",
      "Priority inclusion in creator recommendation engine",
      "90-day multi-channel campaign placement",
      "Dedicated account manager & creator matchmaking",
      "Advanced campaign ROI & TrustScore verification reporting",
    ],
  },
];

export function getAdPackageById(id: string): AdPackage | undefined {
  return AD_PACKAGES.find((p) => p.id === id);
}
