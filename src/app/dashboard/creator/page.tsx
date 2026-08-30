"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ScoreGauge } from "@/components/common/ScoreGauge";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { useAuth } from "@/contexts/AuthContext";
import { Creator } from "@/types/creator";
import { MOCK_COLLABORATION_REQUESTS } from "@/data/mockCollaborations";
import {
  TrendingUp,
  ExternalLink,
  Share2,
  CheckCircle2,
  Clock,
  Briefcase,
  Sliders,
  Send,
  ArrowRight,
  ShieldCheck,
  Tag,
  Edit3,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function CreatorDashboardPage() {
  const { user } = useAuth();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCreator() {
      try {
        const userId = user?.id || "user-alex-creator";
        const res = await fetch(`/api/creators/me?userId=${userId}`);
        const data = await res.json();
        if (data.creator) {
          setCreator(data.creator);
        }
      } catch (err) {
        console.error("Failed to load creator profile", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCreator();
  }, [user]);

  const fallbackCreator: Creator = {
    id: "alexfitness",
    username: "@alexfitness",
    name: "Alex Rivera",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
    platform: "instagram",
    category: "Fitness",
    bio: "Certified strength coach & hybrid athlete. Daily workouts, mobility routines & nutrition tips. Melbourne, Australia. 🏋️‍♂️🥑",
    location: "Melbourne, Australia",
    joinedDate: "March 2021",
    verifiedBadge: true,
    verifiedDate: "January 2024",
    profileUrl: "https://instagram.com/alexfitness",
    followers: 32400,
    following: 684,
    totalPosts: 342,
    avgLikes: 1450,
    avgComments: 105,
    avgViews: 8900,
    engagementRate: 4.8,
    trustScore: 97,
    scoreBand: "Very High Trust",
    riskLevel: "Low",
    inflatedEngagementProbability: 3.2,
    uncertaintyMargin: 1.2,
    authenticityProbability: 96.8,
    commentDiversityPercent: 89,
    growthStabilityScore: 96,
    engagementConsistencyScore: 95,
    isAvailableForCollaboration: true,
    availabilityStatus: "OPEN_TO_WORK",
    profileTags: ["Open to Work", "Available for Collaboration", "Open to Brand Deals"],
    startingRate: 450,
    preferredCampaignTypes: ["Dedicated Reel", "Story Series", "Product Review"],
    pastBrandCollaborations: ["GymFuel Nutrition", "Apex Athletics", "RecoveryPod"],
    subScores: {
      followerAuthenticity: 98,
      engagementAuthenticity: 96,
      commentQuality: 97,
      growthPattern: 98,
      engagementConsistency: 96,
    },
    commentQuality: {
      uniqueCommentsPercent: 89,
      repeatedPatternsPercent: 5,
      genericCommentsPercent: 6,
      emojiOnlyPercent: 4,
      sampleAnalyzedComments: [],
      podClusterDetected: false,
      crowdTurfingRisk: "Very Low",
    },
    prescriptiveGuidance: {
      primaryRecommendation: "Standard campaign terms",
      recommendedPaymentAdjustment: "0%",
      confidenceLevel: "High",
      alternativeAction: "Standard contract terms",
      riskMitigationChecklist: [],
    },
    followerGrowthHistory: [],
    engagementHistory: [],
    positiveFactors: [],
    warningFactors: [],
    engagementVolatilityIndex: 12.0,
    analyzedAt: "2026-08-30T00:00:00Z",
  };

  const active = creator || fallbackCreator;
  const myCollabs = MOCK_COLLABORATION_REQUESTS.slice(0, 3);

  // Profile completion calculation from real fields
  const fields = [
    active.name,
    active.bio,
    active.category,
    active.location,
    active.avatar,
    active.startingRate > 0,
    active.profileTags && active.profileTags.length > 0,
    active.verifiedBadge,
  ];
  const completionPercentage = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  const scoreHistory = [
    { month: "August 2026", score: active.trustScore, status: "Active (Current)" },
    { month: "July 2026", score: Math.max(70, active.trustScore - 3), status: "Stable" },
    { month: "June 2026", score: Math.max(65, active.trustScore - 5), status: "Initial Verification" },
  ];

  const availabilityLabel =
    active.availabilityStatus === "NOT_AVAILABLE"
      ? "Not Currently Available"
      : active.availabilityStatus === "AVAILABLE_FOR_COLLABORATION"
      ? "Available for Collaboration"
      : "Open to Work";

  const availabilityColor =
    active.availabilityStatus === "NOT_AVAILABLE"
      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Creator Hero Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <img
                src={active.avatar}
                alt={active.name}
                className="w-18 h-18 sm:w-22 sm:h-22 rounded-3xl object-cover border-2 border-slate-700 shadow-md"
              />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-100">{active.name}</h3>
                  {active.verifiedBadge && <VerificationBadge size="md" showText={false} />}
                </div>
                <p className="text-xs text-slate-400 font-semibold">
                  {active.username} • {active.category} • {active.location}
                </p>

                {/* Status Badge + Profile Completion */}
                <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                  <span className={`px-2.5 py-0.5 rounded-lg border font-bold flex items-center gap-1.5 ${availabilityColor}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    <span>{availabilityLabel}</span>
                  </span>

                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                    Profile {completionPercentage}% Complete
                  </span>
                  <span className="text-slate-400">Rate: ${active.startingRate} USD</span>
                </div>

                {/* Profile Tags Preview */}
                {active.profileTags && active.profileTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {active.profileTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-semibold text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard/creator/profile"
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile &amp; Tags</span>
              </Link>
              <Link
                href={`/creators/${active.id}`}
                target="_blank"
                className="px-4 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>View Public Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard.writeText(`${window.location.origin}/creators/${active.id}`);
                  }
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Creator Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Marketplace Profile Views
            </span>
            <p className="text-3xl font-black text-slate-100">1,284</p>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+38% this month</span>
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Collaboration Requests
            </span>
            <p className="text-3xl font-black text-slate-100">{myCollabs.length}</p>
            <span className="text-[11px] text-blue-400 font-semibold">2 Pending review</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Audience Authenticity
            </span>
            <p className="text-3xl font-black text-emerald-400">
              {active.authenticityProbability ? `${active.authenticityProbability.toFixed(0)}%` : "94%"}
            </p>
            <span className="text-[11px] text-slate-400 font-semibold">{active.scoreBand}</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Estimated Inflation Risk
            </span>
            <p className="text-3xl font-black text-blue-400">
              {active.inflatedEngagementProbability.toFixed(1)}%
            </p>
            <span className="text-[11px] text-emerald-400">Risk Rating: {active.riskLevel}</span>
          </div>
        </div>

        {/* Center Split: Score Gauge & Historical Scores Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Score Gauge */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center space-y-4 shadow-sm">
            <h4 className="font-bold text-slate-100 text-sm">Calibrated Creator TrustScore</h4>
            <ScoreGauge
              score={active.trustScore}
              size="xl"
              inflatedProbability={active.inflatedEngagementProbability}
              uncertaintyMargin={active.uncertaintyMargin}
            />
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 text-center leading-relaxed">
              Based on {active.totalPosts || 48} analyzed posts over 12 months with verified Graph API telemetry.
            </div>
            <Link
              href="/dashboard/creator/analytics"
              className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 pt-1"
            >
              <span>View Full Analytical Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Right: Score Evolution History */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h4 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>TrustScore Calculation History</span>
            </h4>
            <p className="text-xs text-slate-400">
              TrustScore is recalculated monthly to reflect audience growth and comment diversity trends.
            </p>

            <div className="space-y-3 pt-2">
              {scoreHistory.map((item, idx) => (
                <div
                  key={item.month}
                  className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${
                        idx === 0
                          ? "bg-blue-600/20 border border-blue-500/30 text-blue-400"
                          : "bg-slate-900 text-slate-400"
                      }`}
                    >
                      {item.score}
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">{item.month}</p>
                      <span className="text-[11px] text-slate-500">{item.status}</span>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-bold">Verified Organic</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Incoming Collaboration Proposals */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-100 text-base">Direct Brand Collaboration Proposals</h4>
              <p className="text-xs text-slate-400">
                Verified businesses reaching out with sponsored campaign offers
              </p>
            </div>
            <Link
              href="/dashboard/collaborations"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>View All ({myCollabs.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {myCollabs.map((collab) => (
              <div
                key={collab.id}
                className="p-5 bg-slate-950 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-sm">{collab.businessName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {collab.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{collab.campaignName}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <span>Deliverables: {collab.deliverables}</span>
                    <span>•</span>
                    <span>Timeline: {collab.timeline}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="text-base font-black text-emerald-400">${collab.budget} USD</span>
                  <Link
                    href={`/dashboard/collaborations?id=${collab.id}`}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    Review Proposal
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
