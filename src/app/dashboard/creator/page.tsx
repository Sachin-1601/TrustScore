"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ScoreGauge } from "@/components/common/ScoreGauge";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { useAuth } from "@/contexts/AuthContext";
import { Creator, CollaborationRequest } from "@/types/creator";
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  Briefcase,
  Send,
  ArrowRight,
  ShieldCheck,
  Tag,
  Edit3,
  Loader2,
  Sparkles,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function CreatorDashboardPage() {
  const { user } = useAuth();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [collaborations, setCollaborations] = useState<CollaborationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [creatorRes, collabRes] = await Promise.all([
          fetch("/api/creators/me"),
          fetch("/api/collaborations"),
        ]);

        if (creatorRes.ok) {
          const cData = await creatorRes.json();
          if (cData.creator) setCreator(cData.creator);
        }

        if (collabRes.ok) {
          const collabData = await collabRes.json();
          if (collabData.collaborations) setCollaborations(collabData.collaborations);
        }
      } catch (err) {
        console.error("Failed to load creator dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center py-24 bg-slate-950 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-xs font-semibold">Loading your creator dashboard...</span>
      </div>
    );
  }

  const active = creator || {
    id: user?.creatorProfileId || "creator",
    username: `@${user?.name?.toLowerCase().replace(/\s+/g, "") || "creator"}`,
    name: user?.name || "Creator",
    avatar: user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
    platform: "instagram" as const,
    category: "Creator",
    bio: "Complete your profile bio in settings to attract brand sponsorships.",
    location: "Global",
    joinedDate: "Recently",
    verifiedBadge: false,
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
    isAvailableForCollaboration: true,
    availabilityStatus: "OPEN_TO_WORK" as const,
    profileTags: ["Open to Work", "Available for Collaboration"],
    startingRate: 250,
    preferredCampaignTypes: ["Sponsored Post", "Story Series"],
    pastBrandCollaborations: [],
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
      primaryRecommendation: "Connect social analytics to calculate your verified score",
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

  const myCollabs = collaborations.slice(0, 3);

  // Profile completion calculation from real fields
  const fields = [
    active.name,
    active.bio && active.bio.length > 10,
    active.category,
    active.location,
    active.avatar,
    active.startingRate > 0,
    active.profileTags && active.profileTags.length > 0,
    active.verifiedBadge,
  ];
  const completionPercentage = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  const availabilityLabel =
    active.availabilityStatus === "NOT_AVAILABLE"
      ? "Not Currently Available"
      : active.availabilityStatus === "AVAILABLE_FOR_COLLABORATION"
      ? "Available for Collaboration"
      : "Open to Work";

  const availabilityColor =
    active.availabilityStatus === "NOT_AVAILABLE"
      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
      : active.availabilityStatus === "AVAILABLE_FOR_COLLABORATION"
      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. CREATOR IDENTITY & PUBLIC PROFILE HERO HEADER                          */}
        {/* ========================================================================= */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={active.avatar}
                  alt={active.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-slate-700 shadow-md"
                />
                <Link
                  href="/dashboard/creator/profile"
                  className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs transition-colors"
                  title="Edit Profile"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-100">{active.name}</h1>
                  {active.verifiedBadge && <VerificationBadge size="md" />}
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${availabilityColor}`}>
                    {availabilityLabel}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">{active.username}</span>
                  <span>•</span>
                  <span>{active.category}</span>
                  <span>•</span>
                  <span>{active.location}</span>
                </div>

                {/* Profile Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {active.profileTags && active.profileTags.length > 0 ? (
                    active.profileTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 text-[10px] font-semibold"
                      >
                        <Tag className="w-2.5 h-2.5 text-blue-400" />
                        <span>{tag}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-500">No profile tags set yet.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0 self-start md:self-auto">
              <Link
                href={`/creators/${active.username.replace("@", "")}`}
                className="py-2.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>View Public Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/dashboard/creator/profile"
                className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
              >
                <span>Edit Profile &amp; Tags</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. PROFILE COMPLETION & MARKETPLACE READINESS                              */}
        {/* ========================================================================= */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Marketplace Profile Completion ({completionPercentage}%)
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {completionPercentage >= 80 ? "Your profile is fully visible in business discovery search" : "Complete remaining items for enhanced brand visibility"}
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${active.bio ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-slate-950 border-slate-800 text-slate-400"}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Bio &amp; Category</span>
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${active.startingRate > 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-slate-950 border-slate-800 text-slate-400"}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Starting Collab Rate</span>
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${active.profileTags && active.profileTags.length > 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-slate-950 border-slate-800 text-slate-400"}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Collaboration Tags</span>
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${active.verifiedBadge ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-slate-950 border-slate-800 text-slate-400"}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Telemetry</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. TRUSTSCORE SCORECARD & AUTHENTICITY INTELLIGENCE                        */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: TrustScore Gauge & Authenticity Breakdown */}
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-slate-100">
                  Your Authenticity &amp; TrustScore Dossier
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                Updated {new Date(active.analyzedAt || Date.now()).toLocaleDateString()}
              </span>
            </div>

            {active.trustScore > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
                  <ScoreGauge score={active.trustScore} size="lg" />
                  <span className="mt-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {active.scoreBand}
                  </span>
                </div>

                <div className="sm:col-span-7 space-y-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Authenticity Probability:</span>
                    <strong className="text-emerald-400 font-bold">{active.authenticityProbability}%</strong>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Estimated Inflated Engagement:</span>
                    <strong className="text-blue-400 font-bold">{active.inflatedEngagementProbability}%</strong>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Comment Diversity:</span>
                    <strong className="text-slate-200 font-bold">{active.commentDiversityPercent}%</strong>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Growth Stability:</span>
                    <strong className="text-slate-200 font-bold">{active.growthStabilityScore}/100</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <Sparkles className="w-8 h-8 text-blue-400 mx-auto" />
                <h4 className="font-bold text-slate-200 text-sm">TrustScore Not Yet Computed</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Complete your profile and connect your social accounts to generate an audited Bayesian TrustScore.
                </p>
                <Link
                  href="/dashboard/creator/analytics"
                  className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl"
                >
                  Run Initial Verification
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Inbound Collaboration Pipeline */}
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Collaboration Pipeline ({myCollabs.length})
                </h3>
              </div>
              <Link href="/dashboard/collaborations" className="text-[11px] font-bold text-blue-400 hover:text-blue-300">
                View all →
              </Link>
            </div>

            <div className="space-y-3">
              {myCollabs.length > 0 ? (
                myCollabs.map((collab) => (
                  <div
                    key={collab.id}
                    className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-200">{collab.businessName}</strong>
                      <span className="text-emerald-400 font-extrabold">${collab.budget}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] truncate">{collab.campaignName}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-semibold border border-blue-500/20">
                        {collab.status}
                      </span>
                      <Link
                        href="/dashboard/collaborations"
                        className="text-[11px] text-slate-400 hover:text-slate-200 font-semibold"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  No collaboration requests yet. Once brands discover your profile, new proposals will appear here.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
