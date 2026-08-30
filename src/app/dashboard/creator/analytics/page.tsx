"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ScoreGauge } from "@/components/common/ScoreGauge";
import { useAuth } from "@/contexts/AuthContext";
import { Creator } from "@/types/creator";
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
      <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <DashboardHeader title="Authenticity Analytics" />
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-xs font-semibold">Loading authenticity analytics...</span>
        </div>
      </div>
    );
  }

  const active = creator || {
    id: user?.creatorProfileId || "creator",
    username: `@${user?.name?.toLowerCase().replace(/\s+/g, "") || "creator"}`,
    name: user?.name || "Creator",
    followers: 0,
    following: 0,
    totalPosts: 0,
    avgLikes: 0,
    avgComments: 0,
    avgViews: 0,
    engagementRate: 0,
    trustScore: 0,
    scoreBand: "Insufficient Data" as any,
    riskLevel: "Moderate" as any,
    inflatedEngagementProbability: 0,
    uncertaintyMargin: 0,
    authenticityProbability: 0,
    commentDiversityPercent: 0,
    growthStabilityScore: 0,
    engagementConsistencyScore: 0,
    subScores: {
      followerAuthenticity: 0,
      engagementAuthenticity: 0,
      commentQuality: 0,
      growthPattern: 0,
      engagementConsistency: 0,
    },
    commentQuality: {
      uniqueCommentsPercent: 0,
      repeatedPatternsPercent: 0,
      genericCommentsPercent: 0,
      emojiOnlyPercent: 0,
      sampleAnalyzedComments: [],
      podClusterDetected: false,
      crowdTurfingRisk: "N/A",
    },
    prescriptiveGuidance: {
      primaryRecommendation: "Connect social telemetry to calculate verified metrics",
      recommendedPaymentAdjustment: "0%",
      confidenceLevel: "Pending Data",
      alternativeAction: "Complete profile verification",
      riskMitigationChecklist: [],
    },
    followerGrowthHistory: [],
    engagementHistory: [],
    positiveFactors: [],
    warningFactors: [],
    engagementVolatilityIndex: 0,
    analyzedAt: new Date().toISOString(),
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="TrustScore &amp; Authenticity Deep Dive"
        subtitle="Transparent data science breakdown of your engagement consistency and crowd-turfing indicators"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Top Hero: Score Summary */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800">
              <ScoreGauge score={active.trustScore} size="lg" />
              <span className="mt-3 text-xs font-bold text-slate-300 uppercase tracking-wider">
                {active.scoreBand}
              </span>
              <span className="text-[11px] text-emerald-400 mt-1 font-semibold">
                {active.authenticityProbability ? `${active.authenticityProbability}%` : "0%"} Authenticity Probability
              </span>
            </div>

            <div className="lg:col-span-7 space-y-4 text-xs">
              <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-[10px]">
                <Sparkles className="w-4 h-4" />
                <span>Bayesian Model Decision Support</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100">
                How Brands View Your Trust Profile
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {active.prescriptiveGuidance?.primaryRecommendation || "Connect social telemetry to calculate verified metrics."}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Estimated Inflated Engagement</span>
                  <strong className="text-blue-400 text-sm">{active.inflatedEngagementProbability}%</strong>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Statistical Margin</span>
                  <strong className="text-emerald-400 text-sm">±{active.uncertaintyMargin || 1.5}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Vectors Grid */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span>5-Factor Mathematical Integrity Breakdown</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Comment Diversity</span>
              <p className="text-2xl font-black text-slate-100">{active.commentDiversityPercent}%</p>
              <p className="text-[11px] text-slate-400">Lexical variety across follower comments, screening for repetitive bot pods.</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Growth Stability</span>
              <p className="text-2xl font-black text-slate-100">{active.growthStabilityScore}/100</p>
              <p className="text-[11px] text-slate-400">Natural organic follower curve without step-function acquisition anomalies.</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Engagement Consistency</span>
              <p className="text-2xl font-black text-slate-100">{active.engagementConsistencyScore || 90}/100</p>
              <p className="text-[11px] text-slate-400">Natural post-to-post volatility matching authentic creator distributions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
