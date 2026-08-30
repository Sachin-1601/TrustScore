"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ScoreGauge } from "@/components/common/ScoreGauge";
import { RiskBadge } from "@/components/common/RiskBadge";
import { ArrowRight, CheckCircle2, TrendingUp, AlertTriangle, MessageSquare, BarChart2 } from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DEMO_SHOWCASE_CREATOR = {
  id: "alexfitness",
  username: "@alexfitness",
  name: "Alex Rivera",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
  category: "Fitness & Nutrition",
  platform: "instagram" as const,
  followers: 32400,
  engagementRate: 4.8,
  trustScore: 87,
  scoreBand: "High Trust",
  riskLevel: "Low" as const,
  inflatedEngagementProbability: 4.2,
  uncertaintyMargin: 1.5,
  commentDiversityPercent: 88,
  growthStabilityScore: 92,
  authenticityProbability: 95.8,
  isAvailableForCollaboration: true,
  startingRate: 450,
  followerGrowthHistory: [
    { month: "Jan", followers: 26000, organicGrowth: 800, suspiciousSpike: 0 },
    { month: "Feb", followers: 27200, organicGrowth: 1200, suspiciousSpike: 0 },
    { month: "Mar", followers: 28100, organicGrowth: 900, suspiciousSpike: 0 },
    { month: "Apr", followers: 29500, organicGrowth: 1400, suspiciousSpike: 0 },
    { month: "May", followers: 30800, organicGrowth: 1300, suspiciousSpike: 0 },
    { month: "Jun", followers: 32400, organicGrowth: 1600, suspiciousSpike: 0 },
  ],
  engagementHistory: [
    { post: "Post 1", rate: 4.6, benchmark: 2.8 },
    { post: "Post 2", rate: 5.1, benchmark: 2.8 },
    { post: "Post 3", rate: 4.4, benchmark: 2.8 },
    { post: "Post 4", rate: 4.9, benchmark: 2.8 },
    { post: "Post 5", rate: 5.2, benchmark: 2.8 },
    { post: "Post 6", rate: 4.8, benchmark: 2.8 },
  ],
  positiveFactors: [
    "Comment diversity is high (88% unique vocabulary)",
    "Engagement pattern is naturally volatile (low bot signature)",
    "Follower growth curve is smooth and organic",
  ],
  warningFactors: [
    "Slightly elevated comment cluster on carousel posts",
  ],
  prescriptiveGuidance: {
    primaryRecommendation: "Proceed with standard sponsorship agreement",
    recommendedPaymentAdjustment: "0% (Fair Market Value)",
    confidenceLevel: "High Confidence (0.94)",
    riskMitigationChecklist: [
      "Standard net-30 payment milestone terms",
      "Usage rights for 90-day paid amplification",
    ],
  },
};

export function ProductDemoSection() {
  const influencer = DEMO_SHOWCASE_CREATOR;
  const [activeTab, setActiveTab] = useState<"growth" | "engagement">("growth");

  return (
    <section className="py-20 bg-white" id="demo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider border border-blue-200">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Interactive SaaS Demo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            From influencer profile to actionable decision.
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Explore a full profile analysis below. Every score is backed by granular descriptive charts, predictive indicators, and prescriptive guidance.
          </p>
        </div>

        {/* Main Demo Container */}
        <div className="mt-12 bg-slate-50 border border-slate-200/90 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg">
          {/* Creator Profile Top Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div className="flex items-center gap-4">
              <img
                src={influencer.avatar}
                alt={influencer.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-100 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{influencer.username}</h3>
                  <RiskBadge risk={influencer.riskLevel} size="sm" />
                </div>
                <p className="text-sm text-slate-500 mt-0.5">
                  {influencer.name} • {influencer.category} Creator • 32.4K followers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/dashboard/influencer/${influencer.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
              >
                <span>Open Full Interactive Report</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 my-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-slate-400">TrustScore</span>
              <p className="text-xl font-extrabold text-blue-700 mt-1">87 / 100</p>
              <span className="text-[10px] text-emerald-600 font-semibold">High Trust</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Est. Inflated</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">6.8%</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Low Probability</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Engagement</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">4.8%</p>
              <span className="text-[10px] text-slate-500">Benchmark: 3.2%</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Like / Follower</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">4.47%</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Organic Band</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Comment Diversity</span>
              <p className="text-xl font-extrabold text-emerald-600 mt-1">82%</p>
              <span className="text-[10px] text-slate-500">Unique stems</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Volatility Index</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">14.2</p>
              <span className="text-[10px] text-emerald-600 font-semibold">High Stability</span>
            </div>
          </div>

          {/* Chart & Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Chart Area */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    {activeTab === "growth" ? "12-Month Follower Growth Curve" : "Last 30 Posts Engagement Rate Trend"}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {activeTab === "growth"
                      ? "Evaluates organic linear accumulation vs unnatural purchased follower step-jumps."
                      : "Tracks post-by-post engagement stability against expected cohort baselines."}
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab("growth")}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      activeTab === "growth"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Follower Growth
                  </button>
                  <button
                    onClick={() => setActiveTab("engagement")}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      activeTab === "engagement"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Engagement Trend
                  </button>
                </div>
              </div>

              {/* Chart Visual */}
              <div className="h-64 sm:h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  {activeTab === "growth" ? (
                    <AreaChart data={influencer.followerGrowthHistory}>
                      <defs>
                        <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(val: any) => [`${Number(val).toLocaleString()} followers`, "Followers"]}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="followers"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#growthGrad)"
                      />
                      <Line
                        type="monotone"
                        dataKey="expectedOrganic"
                        stroke="#94a3b8"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </AreaChart>
                  ) : (
                    <LineChart data={influencer.engagementHistory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} interval={4} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} unit="%" />
                      <Tooltip
                        formatter={(val: any) => [`${val}%`, "Engagement Rate"]}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="engagementRate"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ r: 2, fill: "#10b981" }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  Actual Verified Data
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-slate-400 border-dashed" />
                  Expected Cohort Baseline
                </span>
              </div>
            </div>

            {/* Prescriptive Guidance Box */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  Prescriptive Recommendation
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">
                  &quot;Proceed with normal campaign consideration.&quot;
                </h4>
              </div>

              <div className="bg-emerald-50 border border-emerald-200/70 rounded-xl p-3.5 space-y-1.5">
                <span className="text-xs font-semibold text-emerald-900 block">
                  Recommended Payment Adjustment:
                </span>
                <p className="text-xl font-extrabold text-emerald-700">0–5%</p>
                <p className="text-[11px] text-emerald-800">
                  Confidence: <strong>High</strong> • Natural CPM benchmarks justified ($18–$24 CPM).
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-semibold text-slate-700 block">Key Indicators:</span>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Stable, monotonic follower growth</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>High comment diversity (82% unique)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No sudden bot spike anomalies</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Slightly elevated like-to-comment ratio</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
