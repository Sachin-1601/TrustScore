import { PortfolioSummary } from "@/types/influencer";

export const MOCK_PORTFOLIO_STATS: PortfolioSummary = {
  totalAnalyzed: 42,
  highTrustCount: 27,
  moderateRiskCount: 10,
  highRiskCount: 5,
  estimatedBudgetProtected: 18450,
  avgPortfolioTrustScore: 78.4,
};

export const MOCK_TRUST_DISTRIBUTION = [
  { name: "High Trust (75-100)", count: 27, percent: 64.3, color: "#10b981" },
  { name: "Moderate Risk (50-74)", count: 10, percent: 23.8, color: "#f59e0b" },
  { name: "High Risk (0-49)", count: 5, percent: 11.9, color: "#ef4444" },
];

export const MOCK_RISK_VS_ENGAGEMENT = [
  { category: "Fitness", avgTrust: 84.5, avgEngagement: 5.0, count: 8 },
  { category: "Beauty", avgTrust: 52.0, avgEngagement: 12.2, count: 6 },
  { category: "Travel", avgTrust: 82.0, avgEngagement: 4.4, count: 7 },
  { category: "Tech", avgTrust: 95.0, avgEngagement: 6.1, count: 5 },
  { category: "Food", avgTrust: 88.5, avgEngagement: 5.3, count: 6 },
  { category: "Fashion", avgTrust: 53.5, avgEngagement: 12.6, count: 5 },
  { category: "Gaming", avgTrust: 37.5, avgEngagement: 17.4, count: 5 },
];
