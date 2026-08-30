"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Creator } from "@/types/creator";
import { ScoreGauge } from "@/components/common/ScoreGauge";
import { RiskBadge } from "@/components/common/RiskBadge";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import { RateAdjustmentCalculator } from "@/components/dashboard/RateAdjustmentCalculator";
import { formatNumber } from "@/lib/utils";
import {
  Sparkles,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Share2,
  Download,
  Loader2,
} from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function InfluencerResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params.id as string) || "alexfitness";

  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeChartTab, setActiveChartTab] = useState<"growth" | "engagement">("growth");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadCreator() {
      try {
        const res = await fetch(`/api/creators/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.creator) {
            setCreator(data.creator);
          }
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }
    loadCreator();
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <DashboardHeader title="Analyzing Creator Dossier" />
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-xs font-semibold">Loading verified TrustScore dossier...</span>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <DashboardHeader title="Creator Not Found" />
        <div className="p-8 max-w-md mx-auto text-center space-y-4 py-20">
          <h3 className="text-lg font-bold text-slate-200">Analysis Record Not Found</h3>
          <p className="text-xs text-slate-400">The requested creator is not registered on TrustScore or has no public telemetry.</p>
          <Link href="/dashboard/analyze" className="inline-block px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl">
            Analyze New Creator
          </Link>
        </div>
      </div>
    );
  }

  const commentPieData = [
    { name: "Unique Comments", value: creator.commentQuality?.uniqueCommentsPercent || 88, color: "#10b981" },
    { name: "Repeated Patterns", value: creator.commentQuality?.repeatedPatternsPercent || 6, color: "#f59e0b" },
    { name: "Generic / Emoji", value: creator.commentQuality?.genericCommentsPercent || 6, color: "#94a3b8" },
  ];

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title={`Analysis Result: ${creator.username}`}
        subtitle={`Evaluated on ${new Date(creator.analyzedAt || Date.now()).toLocaleDateString()} • TrustScore Statistical Engine v1.2`}
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Top Hero Card: Creator Summary & TrustScore Gauge */}
        <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Creator Identity */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-20 h-20 rounded-3xl object-cover border-2 border-slate-700 shadow-md shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                      {creator.username}
                    </h2>
                    <PlatformIcon platform={creator.platform} size="md" />
                    <RiskBadge risk={creator.riskLevel} size="md" />
                  </div>
                  <p className="text-sm font-medium text-slate-400 mt-1">
                    {creator.name} • {creator.category} • {creator.location}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {creator.verifiedBadge && <VerificationBadge size="sm" />}
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 text-[10px] font-semibold">
                      Direct Telemetry
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                {creator.bio}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={`/creators/${creator.id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Public Marketplace Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? "Copied Link!" : "Share Dossier"}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Score Gauge */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800">
              <ScoreGauge score={creator.trustScore} size="lg" />
              <span className="mt-3 text-xs font-bold text-slate-300 uppercase tracking-wider">
                {creator.scoreBand}
              </span>
              <span className="text-[11px] text-emerald-400 mt-1 font-semibold">
                {creator.authenticityProbability ? `${creator.authenticityProbability}%` : `${100 - creator.inflatedEngagementProbability}%`} Authenticity Probability
              </span>
            </div>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Followers</span>
            <p className="text-2xl sm:text-3xl font-black text-slate-100">{formatNumber(creator.followers)}</p>
            <span className="text-[11px] text-slate-400">Total audience</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Engagement Rate</span>
            <p className="text-2xl sm:text-3xl font-black text-blue-400">{creator.engagementRate}%</p>
            <span className="text-[11px] text-slate-400">Recent posts avg</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Comment Diversity</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400">{creator.commentDiversityPercent}%</p>
            <span className="text-[11px] text-emerald-400 font-semibold">Low repetition risk</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Growth Stability</span>
            <p className="text-2xl sm:text-3xl font-black text-slate-100">{creator.growthStabilityScore}/100</p>
            <span className="text-[11px] text-slate-400">Smooth trendline</span>
          </div>
        </div>

        {/* Rate Adjustment Calculator */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <RateAdjustmentCalculator
            creatorName={creator.name}
            creatorUsername={creator.username}
            trustScore={creator.trustScore}
            riskLevel={creator.riskLevel}
            inflatedProbability={creator.inflatedEngagementProbability}
            uncertaintyMargin={creator.uncertaintyMargin}
            initialRate={creator.startingRate}
            followersCount={creator.followers}
            engagementRate={creator.engagementRate}
            isDark={true}
          />
        </div>
      </div>
    </div>
  );
}
