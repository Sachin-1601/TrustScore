"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { MOCK_CREATORS } from "@/data/mockCreators";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { RiskBadge } from "@/components/common/RiskBadge";
import { ScoreGauge } from "@/components/common/ScoreGauge";
import { RateAdjustmentCalculator } from "@/components/dashboard/RateAdjustmentCalculator";
import { CollaborationModal } from "@/components/marketplace/CollaborationModal";
import { formatNumber } from "@/lib/utils";
import {
  MapPin,
  Calendar,
  DollarSign,
  Send,
  Bookmark,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowRight,
  MessageSquare,
  BarChart2,
  Lock,
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

export default function CreatorProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = use(params);
  const targetId = resolvedParams.username.replace("@", "").toLowerCase();

  const creator = MOCK_CREATORS.find(
    (c) => c.id === targetId || c.username.replace("@", "").toLowerCase() === targetId
  );

  if (!creator) {
    // Fallback to alexfitness for demo resilience
    const fallback = MOCK_CREATORS[0];
    return <CreatorProfileView creator={fallback} />;
  }

  return <CreatorProfileView creator={creator} />;
}

function CreatorProfileView({ creator }: { creator: (typeof MOCK_CREATORS)[0] }) {
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const commentPieData = [
    { name: "Unique Comments", value: creator.commentQuality.uniqueCommentsPercent, color: "#10b981" },
    { name: "Generic Comments", value: creator.commentQuality.genericCommentsPercent, color: "#f59e0b" },
    { name: "Repeated Patterns", value: creator.commentQuality.repeatedPatternsPercent, color: "#ef4444" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white">
      <LandingNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/creators" className="hover:text-slate-200">
            Creators
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-semibold">{creator.username}</span>
        </div>

        {/* Creator Hero Banner Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Avatar, Name & Bio */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative shrink-0">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-slate-700 shadow-lg"
                />
                <div className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-slate-950 rounded-xl border border-slate-800">
                  <PlatformIcon platform={creator.platform} size="md" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-100">
                    {creator.name}
                  </h1>
                  <span className="text-base sm:text-lg font-bold text-slate-400">
                    {creator.username}
                  </span>
                  {creator.verifiedBadge && <VerificationBadge size="md" />}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-semibold">
                    {creator.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{creator.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Joined {creator.joinedDate}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300/90 max-w-xl leading-relaxed pt-1">
                  {creator.bio}
                </p>
              </div>
            </div>

            {/* Right: Collaboration & Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Est. Starting Rate</span>
                <span className="text-xl font-black text-emerald-400">
                  ${creator.startingRate} <span className="text-xs text-slate-400 font-semibold">USD</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSaved(!isSaved)}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer text-xs flex items-center justify-center ${
                    isSaved
                      ? "bg-blue-600/20 border-blue-500 text-blue-400"
                      : "bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-400"
                  }`}
                  title="Save Creator to Dashboard"
                >
                  <Bookmark className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer text-xs flex items-center justify-center"
                  title="Share Profile"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsCollabModalOpen(true)}
                  className="py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Collaborate With Creator</span>
                </button>
              </div>

              {copiedLink && (
                <span className="text-[11px] font-bold text-emerald-400 animate-fade-in">
                  ✓ Profile link copied!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 4 Core Metrics Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Followers</span>
            <p className="text-2xl font-black text-slate-100">{formatNumber(creator.followers)}</p>
            <span className="text-[11px] text-emerald-400 font-semibold">100% Organic curve</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Engagement Rate</span>
            <p className="text-2xl font-black text-blue-400">{creator.engagementRate}%</p>
            <span className="text-[11px] text-slate-400">Benchmark: 3.2% – 5.5%</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Comment Diversity</span>
            <p className="text-2xl font-black text-emerald-400">{creator.commentQuality.uniqueCommentsPercent}%</p>
            <span className="text-[11px] text-slate-400">Unique lexical stems</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Growth Stability</span>
            <p className="text-2xl font-black text-purple-400">{creator.growthStabilityScore}/100</p>
            <span className="text-[11px] text-slate-400">Low volatility index</span>
          </div>
        </div>

        {/* TrustScore Authenticity Intelligence Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: TrustScore Gauge & Probabilistic Breakdown */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <span>TrustScore Authenticity Index</span>
              </h3>
              <RiskBadge risk={creator.riskLevel} size="sm" />
            </div>

            {/* Circular Gauge Centerpiece */}
            <div className="flex flex-col items-center justify-center py-2">
              <ScoreGauge
                score={creator.trustScore}
                size="lg"
                showRiskLabel={false}
              />
              <div className="text-center mt-3 space-y-0.5">
                <span className="text-sm font-bold text-slate-200 block">
                  {creator.scoreBand}
                </span>
                <p className="text-xs text-slate-400">
                  Estimated inflated risk: <strong className="text-slate-200">{creator.inflatedEngagementProbability}%</strong> (±{creator.uncertaintyMargin}%)
                </p>
              </div>
            </div>

            {/* 5 Sub-Score Progress Bars */}
            <div className="space-y-3 pt-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                5-Vector Authenticity Breakdown
              </span>

              {[
                { label: "Follower Quality", val: creator.subScores.followerAuthenticity },
                { label: "Engagement Authenticity", val: creator.subScores.engagementAuthenticity },
                { label: "Comment Diversity", val: creator.subScores.commentQuality },
                { label: "Growth Monotonicity", val: creator.subScores.growthPattern },
                { label: "Consistency Index", val: creator.subScores.engagementConsistency },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="text-blue-400 font-bold">{item.val}/100</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${item.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Prescriptive Recommendation Box */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-200 block">Campaign Decision Support:</span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                {creator.prescriptiveGuidance.primaryRecommendation}
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-500">Rate Guidance:</span>
                <span className="text-emerald-400">{creator.prescriptiveGuidance.recommendedPaymentAdjustment}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Time-Series Charts & Comment Analysis */}
          <div className="lg:col-span-7 space-y-6">
            {/* Follower Growth Chart */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">
                    12-Month Follower Growth Timeline
                  </h4>
                  <p className="text-xs text-slate-400">
                    Monitored for sudden purchased follower spikes vs expected organic trajectory
                  </p>
                </div>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={creator.followerGrowthHistory}>
                    <defs>
                      <linearGradient id="growthColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "1px solid #1e293b", color: "#f8fafc" }}
                    />
                    <Area type="monotone" dataKey="followers" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#growthColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Comment Diversity & Why Businesses Trust Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Comment Diversity Donut */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3">
                <h4 className="font-bold text-slate-100 text-xs">
                  Comment Quality Breakdown
                </h4>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={commentPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={55}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {commentPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #1e293b" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-emerald-400 font-semibold">• Unique Authentic</span>
                    <span className="font-bold">{creator.commentQuality.uniqueCommentsPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-400 font-semibold">• Generic Emojis</span>
                    <span className="font-bold">{creator.commentQuality.genericCommentsPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rose-400 font-semibold">• Pod Repetitive</span>
                    <span className="font-bold">{creator.commentQuality.repeatedPatternsPercent}%</span>
                  </div>
                </div>
              </div>

              {/* Positive Factors */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-100 text-xs">
                    Why Businesses Trust {creator.username}
                  </h4>
                  <ul className="space-y-2 text-[11px] text-slate-300 mt-2">
                    {creator.positiveFactors.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Model-based decision support prototype</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prescriptive Rate & Counter-Offer Calculator */}
        <RateAdjustmentCalculator
          creatorName={creator.name}
          creatorUsername={creator.username}
          trustScore={creator.trustScore}
          riskLevel={creator.riskLevel}
          inflatedProbability={creator.inflatedEngagementProbability}
          uncertaintyMargin={creator.uncertaintyMargin}
          initialRate={creator.startingRate || 450}
          followersCount={creator.followers}
          engagementRate={creator.engagementRate}
          isDark={true}
        />

        {/* Preferred Campaigns & Past Brands */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-slate-100">
            Campaign Formats &amp; Brand Compatibility
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Preferred Campaign Types
              </span>
              <div className="flex flex-wrap gap-2">
                {creator.preferredCampaignTypes.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-semibold"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {creator.pastBrandCollaborations && creator.pastBrandCollaborations.length > 0 && (
              <div className="space-y-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Past Brand Partnerships
                </span>
                <div className="flex flex-wrap gap-2">
                  {creator.pastBrandCollaborations.map((b) => (
                    <span
                      key={b}
                      className="px-3 py-1.5 rounded-xl bg-blue-950/40 border border-blue-800/50 text-blue-300 font-semibold"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <LandingFooter />

      <CollaborationModal
        creator={creator}
        isOpen={isCollabModalOpen}
        onClose={() => setIsCollabModalOpen(false)}
      />
    </div>
  );
}
