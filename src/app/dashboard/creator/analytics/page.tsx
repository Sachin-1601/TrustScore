"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ScoreGauge } from "@/components/common/ScoreGauge";
import { useAuth } from "@/contexts/AuthContext";
import { Creator } from "@/types/creator";
import { getScoreBand, getScoreColor } from "@/lib/utils";
import {
  TrendingUp,
  ShieldCheck,
  Sparkles,
  BarChart3,
  MessageSquare,
  Users,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  HelpCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function CreatorAnalyticsPage() {
  const { user } = useAuth();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCreator() {
      try {
        const res = await fetch("/api/creators/me");
        const data = await res.json();
        if (data.creator) {
          setCreator(data.creator);
        }
      } catch (err) {
        console.error("Failed to load creator analytics", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCreator();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-full flex flex-col bg-[#f8f9fb] text-slate-900">
        <DashboardHeader title="TrustScore &amp; Authenticity Analytics" />
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs font-semibold text-slate-500">Loading authenticity analytics...</span>
        </div>
      </div>
    );
  }

  const hasValidScore = Boolean(creator && creator.trustScore > 0);
  const scoreBand = creator ? getScoreBand(creator.trustScore) : "Insufficient Data";
  const scoreColor = creator ? getScoreColor(creator.trustScore) : { hex: "#64748b" };

  const formattedDate = creator?.analyzedAt
    ? new Date(creator.analyzedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  const snapshots = creator?.engagementHistory || [];

  return (
    <div className="min-h-full flex flex-col bg-[#f8f9fb] text-slate-900">
      <DashboardHeader
        title="TrustScore & Analytics"
        subtitle="Understand your authenticity assessment, data quality, and performance signals."
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {hasValidScore && creator ? (
          <>
            {/* SECTION 1: Hero Score Dossier */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Your Authenticity Dossier
                  </h2>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Last evaluated on {formattedDate}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50/80 rounded-2xl border border-slate-200/70 shadow-xs">
                  <ScoreGauge score={creator.trustScore} size="lg" showSubtitle={false} showRiskLabel={false} />
                  <div className="mt-3 text-center space-y-1">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${scoreColor.hex}15`,
                        color: scoreColor.hex,
                        border: `1px solid ${scoreColor.hex}30`,
                      }}
                    >
                      {scoreBand}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Confidence: <strong className="text-slate-800 font-semibold">{creator.prescriptiveGuidance?.confidenceLevel || "High"}</strong>
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      How Brands Evaluate Your Profile
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      {creator.prescriptiveGuidance?.primaryRecommendation ||
                        "Your engagement curve demonstrates organic community alignment across published video and image media."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Authenticity Probability
                      </span>
                      <strong className="text-emerald-600 text-lg font-black">
                        {creator.authenticityProbability}%
                      </strong>
                      <p className="text-[10px] text-slate-400">
                        Statistical likelihood of organic audience interaction.
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Estimated Inflated Activity
                      </span>
                      <strong className="text-blue-600 text-lg font-black">
                        {creator.inflatedEngagementProbability}%
                      </strong>
                      <p className="text-[10px] text-slate-400">
                        Calculated pod or automated engagement concentration.
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Statistical Margin Bounds
                      </span>
                      <strong className="text-slate-800 text-lg font-black">
                        ±{creator.uncertaintyMargin || 1.5}%
                      </strong>
                      <p className="text-[10px] text-slate-400">
                        Precision interval based on sample volume.
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Post Volatility Index
                      </span>
                      <strong className="text-slate-800 text-lg font-black">
                        {creator.engagementVolatilityIndex || 12.0}
                      </strong>
                      <p className="text-[10px] text-slate-400">
                        Natural post-to-post engagement variance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: 5-Vector Mathematical Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Why is my TrustScore evaluated this way?
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Comment Diversity</span>
                    <span className="text-sm font-black text-emerald-600">{creator.commentDiversityPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${creator.commentDiversityPercent}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Evaluates lexical variety across comments. High diversity indicates natural organic questions and banter rather than repetitive spam pods.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Growth Stability</span>
                    <span className="text-sm font-black text-blue-600">{creator.growthStabilityScore}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${creator.growthStabilityScore}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Follower growth curve monotonicity. Filters against erratic sudden acquisition jumps often correlated with bought bot batches.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Engagement Consistency</span>
                    <span className="text-sm font-black text-purple-600">{creator.engagementConsistencyScore || 90}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: `${creator.engagementConsistencyScore || 90}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Authentic accounts have expected natural variance across different content formats rather than perfectly uniform like distributions.
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 3: Post Telemetry Snapshots */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Recent Analyzed Post Telemetry ({snapshots.length} Snapshots)
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">Direct Graph API Telemetry</span>
              </div>

              {snapshots.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-5 p-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <span>Post Index</span>
                    <span>Recorded Date</span>
                    <span>Likes</span>
                    <span>Comments</span>
                    <span className="text-right">Engagement</span>
                  </div>
                  {snapshots.map((snap, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs items-center"
                    >
                      <span className="font-bold text-slate-800">Post #{snap.postIndex}</span>
                      <span className="text-slate-500">{snap.date}</span>
                      <span className="text-slate-800 font-semibold">{formatNumber(snap.likes)}</span>
                      <span className="text-slate-800 font-semibold">{formatNumber(snap.comments)}</span>
                      <span className="text-right font-black text-emerald-600">{snap.engagementRate.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                  Historical post telemetry records will accumulate as automatic Graph API sync cycles occur.
                </div>
              )}
            </div>

            {/* SECTION 4: How to Improve Your TrustScore */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  How To Maintain &amp; Improve Your TrustScore
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                  <span className="font-bold text-slate-800 block">1. Foster Organic Conversation</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Ask open-ended questions in captions to encourage multi-word authentic replies, which naturally improves comment entropy scores.
                  </p>
                </div>
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                  <span className="font-bold text-slate-800 block">2. Maintain Continuous Telemetry</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Keep your social channels connected so the Bayesian engine has uninterrupted sample depth, reducing statistical uncertainty margins.
                  </p>
                </div>
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                  <span className="font-bold text-slate-800 block">3. Avoid Engagement Pods</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Automated reciprocity groups generate identifiable synchronized clusters that elevate inflated engagement risk estimates.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* PENDING / EMPTY STATE */
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-6 max-w-2xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">
                TrustScore Analysis Not Yet Computed
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                TrustScore evaluates real Graph API engagement telemetry, lexical comment diversity, and follower curve stability. Connect your social account to run your initial Bayesian assessment.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/dashboard/creator/verification"
                className="py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Connect Social Account</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
