"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MOCK_INFLUENCERS } from "@/data/mockInfluencers";
import { generateSimulatedAnalysis, findInfluencerByQuery } from "@/lib/scoring";
import { ScoreGauge } from "@/components/common/ScoreGauge";
import { RiskScale } from "@/components/common/RiskScale";
import { RiskBadge } from "@/components/common/RiskBadge";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import { Modal } from "@/components/common/Modal";
import { formatNumber, formatPercent, getScoreColor } from "@/lib/utils";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Download,
  Scale,
  Sparkles,
  ExternalLink,
  Info,
  TrendingUp,
  Activity,
  MessageSquare,
  Users,
  Copy,
  Check,
  Compass,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function InfluencerResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params.id as string) || "alexfitness";

  // Find creator or generate realistic simulation
  const influencer = findInfluencerByQuery(id) || generateSimulatedAnalysis(id);

  // Modal states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<"growth" | "engagement" | "correlation" | "volatility">("growth");

  const color = getScoreColor(influencer.trustScore);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  // Comment breakdown chart data
  const commentPieData = [
    { name: "Unique Comments", value: influencer.commentQuality.uniqueCommentsPercent, color: "#10b981" },
    { name: "Repeated Patterns", value: influencer.commentQuality.repeatedPatternsPercent, color: "#f59e0b" },
    { name: "Generic / Emoji", value: influencer.commentQuality.genericCommentsPercent, color: "#94a3b8" },
  ];

  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      <DashboardHeader
        title={`Analysis Result: ${influencer.username}`}
        subtitle={`Evaluated on ${new Date(influencer.analyzedAt).toLocaleDateString()} • Prototype Engine v0.8.4`}
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Top Hero Card: Creator Summary & TrustScore Gauge */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Creator Identity */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <img
                  src={influencer.avatar}
                  alt={influencer.name}
                  className="w-20 h-20 rounded-3xl object-cover ring-4 ring-blue-50 shadow-md shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {influencer.username}
                    </h2>
                    <PlatformIcon platform={influencer.platform} size="md" />
                    <RiskBadge risk={influencer.riskLevel} size="md" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    {influencer.name} • {influencer.category} &amp; Lifestyle • {influencer.location}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <VerificationBadge
                      isVerified={influencer.verifiedBadge}
                      verifiedDate={influencer.verifiedDate}
                    />
                    <a
                      href={influencer.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Public profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Bio snippet */}
              <p className="text-xs sm:text-sm text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                &quot;{influencer.bio}&quot;
              </p>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Followers</span>
                  <span className="text-base font-extrabold text-slate-900">{formatNumber(influencer.followers)}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Engagement</span>
                  <span className="text-base font-extrabold text-slate-900">{influencer.engagementRate}%</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Avg. Likes</span>
                  <span className="text-base font-extrabold text-slate-900">{formatNumber(influencer.avgLikes)}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Avg. Comments</span>
                  <span className="text-base font-extrabold text-slate-900">{formatNumber(influencer.avgComments)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Report</span>
                </button>
                <button
                  onClick={handlePrintPdf}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export PDF</span>
                </button>
                <Link
                  href={`/dashboard/compare?c1=${influencer.id}&c2=beautybymia`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-xl transition-colors"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Compare with peers</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Score Gauge & Risk Scale */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              <ScoreGauge
                score={influencer.trustScore}
                inflatedProbability={influencer.inflatedEngagementProbability}
                uncertaintyMargin={influencer.uncertaintyMargin}
                size="xl"
              />

              <div className="w-full mt-6 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block text-center">
                  Continuous Risk Spectrum Position
                </span>
                <RiskScale score={influencer.trustScore} showLabels={true} />
              </div>
            </div>
          </div>
        </div>

        {/* 5 Sub-Score Dimensions Breakdown Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">
              Analytical Sub-Scores Breakdown
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Calibrated out of 100
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* 1. Follower Authenticity */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-400">Follower Quality</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                {influencer.subScores.followerAuthenticity} <span className="text-xs font-normal text-slate-400">/ 100</span>
              </p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${influencer.subScores.followerAuthenticity}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">Ghost bot ratio: ~{(100 - influencer.subScores.followerAuthenticity) * 0.4}%</span>
            </div>

            {/* 2. Engagement Authenticity */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-400">Engagement Auth.</span>
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                {influencer.subScores.engagementAuthenticity} <span className="text-xs font-normal text-slate-400">/ 100</span>
              </p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${influencer.subScores.engagementAuthenticity}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">Like/View ratio match</span>
            </div>

            {/* 3. Comment Quality */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-400">Comment Quality</span>
                <MessageSquare className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                {influencer.subScores.commentQuality} <span className="text-xs font-normal text-slate-400">/ 100</span>
              </p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${influencer.subScores.commentQuality}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">Lexical entropy score</span>
            </div>

            {/* 4. Growth Pattern */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-400">Growth Pattern</span>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                {influencer.subScores.growthPattern} <span className="text-xs font-normal text-slate-400">/ 100</span>
              </p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${influencer.subScores.growthPattern}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">Monotonic growth filter</span>
            </div>

            {/* 5. Engagement Consistency */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-400">Consistency</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                {influencer.subScores.engagementConsistency} <span className="text-xs font-normal text-slate-400">/ 100</span>
              </p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${influencer.subScores.engagementConsistency}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">Low post-to-post jitter</span>
            </div>
          </div>
        </div>

        {/* Descriptive Analytics Charts Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Descriptive Analytics Deep Dive
              </h3>
              <p className="text-xs text-slate-500">
                Granular empirical time-series data evaluated by the TrustScore engine
              </p>
            </div>

            {/* Chart Tab Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { id: "growth", label: "Follower Growth" },
                { id: "engagement", label: "30-Post Trend" },
                { id: "volatility", label: "Volatility" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveChartTab(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeChartTab === tab.id
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Rendering Area */}
          <div className="h-72 sm:h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {activeChartTab === "growth" ? (
                <AreaChart data={influencer.followerGrowthHistory}>
                  <defs>
                    <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toLocaleString()} followers`, "Followers"]}
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="followers"
                    name="Actual Followers"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#areaColor)"
                  />
                  <Line
                    type="monotone"
                    dataKey="expectedOrganic"
                    name="Expected Organic Baseline"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </AreaChart>
              ) : activeChartTab === "engagement" ? (
                <LineChart data={influencer.engagementHistory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} interval={4} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} unit="%" />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, "Engagement Rate"]}
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="engagementRate"
                    name="Post Engagement Rate (%)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 2, fill: "#10b981" }}
                  />
                </LineChart>
              ) : (
                <BarChart data={influencer.engagementHistory.slice(0, 15)} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}
                  />
                  <Legend />
                  <Bar dataKey="likes" name="Likes Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="comments" name="Comments Count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Two Column Grid: Comment Quality & Predictive Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Comment Diversity Breakdown */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  Comment Diversity &amp; Lexical Entropy
                </h4>
                <p className="text-xs text-slate-500">
                  Measures vocabulary diversity to distinguish real community from pod rings
                </p>
              </div>
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>

            {/* Donut Visual & Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="h-44 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={commentPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {commentPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val}%`, name]}
                      contentStyle={{ backgroundColor: "#ffffff", borderRadius: "10px", fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-extrabold text-emerald-600">
                    {influencer.commentQuality.uniqueCommentsPercent}%
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Unique</span>
                </div>
              </div>

              {/* Breakdown Legend */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-50 text-emerald-900">
                  <span className="font-semibold">Unique Discussion:</span>
                  <span className="font-bold">{influencer.commentQuality.uniqueCommentsPercent}%</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-amber-50 text-amber-900">
                  <span className="font-semibold">Repeated Patterns:</span>
                  <span className="font-bold">{influencer.commentQuality.repeatedPatternsPercent}%</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-100 text-slate-700">
                  <span className="font-semibold">Generic / Emojis:</span>
                  <span className="font-bold">{influencer.commentQuality.genericCommentsPercent}%</span>
                </div>
              </div>
            </div>

            {/* Sample Analyzed Comments Feed */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Sample Extracted Comment Stream
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {influencer.commentQuality.sampleAnalyzedComments.map((c, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between text-xs gap-3"
                  >
                    <p className="text-slate-800 font-medium italic">&quot;{c.text}&quot;</p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase ${
                        c.type === "organic"
                          ? "bg-emerald-100 text-emerald-700"
                          : c.type === "generic"
                          ? "bg-slate-200 text-slate-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {c.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              * Comment diversity is one of several signals considered by the TrustScore model and should not be used in isolation.
            </p>
          </div>

          {/* Right Column: Predictive Analytics & Prescriptive Decision Guidance */}
          <div className="lg:col-span-6 space-y-6">
            {/* Predictive Probability Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
                  Predictive Analytics
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                  Probability of Inflated Engagement
                </h4>
              </div>

              <div className="flex items-baseline gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">
                  {influencer.inflatedEngagementProbability}%
                </span>
                <div>
                  <span className="text-sm font-bold text-emerald-700 block">
                    Low Probability of Manipulation
                  </span>
                  <span className="text-xs text-slate-400">
                    Uncertainty Margin: ±{influencer.uncertaintyMargin}%
                  </span>
                </div>
              </div>

              {/* Key Indicators */}
              <div className="space-y-2 pt-1 text-xs">
                <span className="font-bold text-slate-700 block">Contributing Model Signals:</span>
                {influencer.positiveFactors.slice(0, 3).map((f) => (
                  <div key={f} className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
                {influencer.warningFactors.slice(0, 2).map((w) => (
                  <div key={w} className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-400 italic">
                * The score represents a model-based probability estimate and should be interpreted alongside the underlying signals.
              </p>
            </div>

            {/* Prescriptive Analytics & Decision Support Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                  Prescriptive Analytics • Decision Support
                </span>
                <h4 className="text-xl font-bold text-white mt-1">
                  &quot;{influencer.prescriptiveGuidance.primaryRecommendation}&quot;
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Recommended Fee Adjustment
                  </span>
                  <span className="text-lg font-extrabold text-emerald-400 mt-1 block">
                    {influencer.prescriptiveGuidance.recommendedPaymentAdjustment}
                  </span>
                </div>

                <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Model Confidence
                  </span>
                  <span className="text-lg font-extrabold text-blue-400 mt-1 block">
                    {influencer.prescriptiveGuidance.confidenceLevel} Confidence
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <span className="font-bold text-slate-300 block">
                  Contract Terms &amp; Risk Mitigation Checklist:
                </span>
                {influencer.prescriptiveGuidance.riskMitigationChecklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-300">
                    <Compass className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Positive & Warning Risk Factors List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              What influenced this score?
            </h3>
            <p className="text-xs text-slate-500">
              Transparent breakdown of positive signals and detected warning vectors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Positive Factors */}
            <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-200/80 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Positive Authenticity Drivers</span>
              </div>
              <ul className="space-y-2 text-xs text-emerald-900">
                {influencer.positiveFactors.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Warning Factors */}
            <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Warning &amp; Risk Factors</span>
              </div>
              <ul className="space-y-2 text-xs text-amber-900">
                {influencer.warningFactors.map((w) => (
                  <li key={w} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Share Report Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share Influencer Report"
        description={`Generate a secure link to share ${influencer.username}'s TrustScore audit with your team or brand clients.`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Public / Team Share Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-700 select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shrink-0 transition-colors"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900">
            <span className="font-bold block">Stakeholder Presentation:</span>
            <p className="text-[11px] text-blue-700 mt-0.5">
              Includes full TrustScore (87/100), 5 sub-dimensions, and prescriptive rate negotiation recommendations.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
