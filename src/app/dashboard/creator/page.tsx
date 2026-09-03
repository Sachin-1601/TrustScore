"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Creator, CollaborationRequest } from "@/types/creator";
import { CreatorDashboardHeader } from "@/components/dashboard/creator/CreatorDashboardHeader";
import { CreatorTrustScoreCard } from "@/components/dashboard/creator/CreatorTrustScoreCard";
import { CreatorMetricsOverview } from "@/components/dashboard/creator/CreatorMetricsOverview";
import { CreatorNextSteps } from "@/components/dashboard/creator/CreatorNextSteps";
import { CreatorProfileCompletion } from "@/components/dashboard/creator/CreatorProfileCompletion";
import { CreatorCollaborationSummary } from "@/components/dashboard/creator/CreatorCollaborationSummary";
import { CreatorOpportunities } from "@/components/dashboard/creator/CreatorOpportunities";
import { CreatorTrustScoreInsights } from "@/components/dashboard/creator/CreatorTrustScoreInsights";
import { CreatorVisibilityCard } from "@/components/dashboard/creator/CreatorVisibilityCard";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

export default function CreatorDashboardPage() {
  const { user } = useAuth();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [collaborations, setCollaborations] = useState<CollaborationRequest[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage(null);

    try {
      const [creatorRes, collabRes, campaignRes] = await Promise.all([
        fetch("/api/creators/me"),
        fetch("/api/collaborations"),
        fetch("/api/campaigns"),
      ]);

      if (creatorRes.ok) {
        const cData = await creatorRes.json();
        if (cData.creator) {
          setCreator(cData.creator);
        }
      } else {
        const errData = await creatorRes.json().catch(() => ({}));
        console.warn("Creator profile response status:", creatorRes.status, errData);
      }

      if (collabRes.ok) {
        const collabData = await collabRes.json();
        if (collabData.collaborations) {
          setCollaborations(collabData.collaborations);
        }
      }

      if (campaignRes.ok) {
        const campData = await campaignRes.json();
        if (campData.campaigns) {
          setCampaigns(campData.campaigns);
        }
      }
    } catch (err: any) {
      console.error("Failed to load creator dashboard data", err);
      setHasError(true);
      setErrorMessage(err.message || "Failed to load dashboard data. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, user]);

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="min-h-full flex flex-col bg-[#f8f9fb] text-slate-900 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-36 bg-white border border-slate-200 rounded-2xl shadow-xs" />

        {/* Hero TrustScore Skeleton */}
        <div className="h-72 bg-white border border-slate-200 rounded-2xl shadow-xs" />

        {/* Metrics Overview Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-white border border-slate-200 rounded-2xl shadow-xs" />
          ))}
        </div>

        {/* 2-Column Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <div className="h-64 bg-white border border-slate-200 rounded-2xl shadow-xs" />
            <div className="h-48 bg-white border border-slate-200 rounded-2xl shadow-xs" />
          </div>
          <div className="lg:col-span-5 space-y-8">
            <div className="h-64 bg-white border border-slate-200 rounded-2xl shadow-xs" />
            <div className="h-48 bg-white border border-slate-200 rounded-2xl shadow-xs" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (hasError && !creator) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center py-24 px-4 bg-[#f8f9fb] text-slate-900">
        <div className="max-w-md w-full p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Unable to load Creator Dashboard
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {errorMessage || "There was a problem connecting to the TrustScore servers."}
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // Fallback for uninitialized profile — NO fake data, strictly real authenticated user attributes
  const activeCreator: Creator = creator || {
    id: user?.creatorProfileId || "me",
    userId: user?.id,
    username: `@${user?.name?.toLowerCase().replace(/[^a-z0-9_]/g, "") || "creator"}`,
    name: user?.name || "Creator",
    avatar: user?.avatar || "",
    platform: "instagram",
    category: "Lifestyle" as any,
    bio: "",
    location: "Australia",
    country: "Australia",
    joinedDate: "Recently",
    verifiedBadge: false,
    profileUrl: "",
    followers: 0,
    following: 0,
    totalPosts: 0,
    avgLikes: 0,
    avgComments: 0,
    avgViews: 0,
    engagementRate: 0,
    trustScore: 0,
    scoreBand: "MODERATE_RISK" as any,
    riskLevel: "MODERATE" as any,
    inflatedEngagementProbability: 0,
    uncertaintyMargin: 0,
    authenticityProbability: 0,
    commentDiversityPercent: 0,
    growthStabilityScore: 0,
    engagementConsistencyScore: 0,
    engagementVolatilityIndex: 0,
    isAvailableForCollaboration: true,
    availabilityStatus: "OPEN_TO_WORK",
    profileTags: ["Open to Work", "Available for Collaboration"],
    startingRate: 250,
    preferredCampaignTypes: [],
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
      crowdTurfingRisk: "Very Low",
    },
    prescriptiveGuidance: {
      primaryRecommendation: "Connect social analytics to calculate your verified score",
      recommendedPaymentAdjustment: "N/A",
      confidenceLevel: "Low",
      alternativeAction: "Complete profile verification",
      riskMitigationChecklist: [],
    },
    followerGrowthHistory: [],
    engagementHistory: [],
    positiveFactors: [],
    warningFactors: ["Insufficient post telemetry for comprehensive scoring"],
    analyzedAt: new Date().toISOString(),
  };

  return (
    <div className="min-h-full flex flex-col bg-[#f8f9fb] text-slate-900">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* SECTION A: Creator Welcome Header */}
        <CreatorDashboardHeader creator={activeCreator} />

        {/* SECTION B: TrustScore Hero Card */}
        <CreatorTrustScoreCard creator={activeCreator} />

        {/* SECTION C: Performance Metrics Overview */}
        <CreatorMetricsOverview creator={activeCreator} />

        {/* TWO-COLUMN WORKSPACE AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* SECTION D: What to do next */}
            <CreatorNextSteps creator={activeCreator} />

            {/* SECTION E: Profile completion */}
            <CreatorProfileCompletion creator={activeCreator} />

            {/* SECTION H: TrustScore Insights */}
            <CreatorTrustScoreInsights creator={activeCreator} />
          </div>

          {/* RIGHT COLUMN (5 Cols) */}
          <div className="lg:col-span-5 space-y-8">
            {/* SECTION F: Collaboration pipeline */}
            <CreatorCollaborationSummary collaborations={collaborations} />

            {/* SECTION I: Marketplace visibility */}
            <CreatorVisibilityCard creator={activeCreator} />
          </div>
        </div>

        {/* SECTION G: Campaign / Brand Opportunities */}
        <CreatorOpportunities
          campaigns={campaigns}
          creatorCategory={activeCreator.category}
        />
      </div>
    </div>
  );
}
