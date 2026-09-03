"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Creator } from "@/types/creator";
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
  BarChart2,
  Tag,
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

export default function CreatorPublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = use(params);
  const rawHandle = resolvedParams.username.replace("@", "").toLowerCase();

  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFoundState, setNotFoundState] = useState<boolean>(false);

  useEffect(() => {
    async function loadCreator() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/creators/${rawHandle}`);
        if (res.status === 404) {
          setNotFoundState(true);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (data.creator) {
            setCreator(data.creator);
          } else {
            setNotFoundState(true);
          }
        } else {
          setNotFoundState(true);
        }
      } catch {
        setNotFoundState(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadCreator();
  }, [rawHandle]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f9fb] text-slate-900">
        <LandingNavbar />
        <main className="flex-1 flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs font-semibold text-slate-500">Loading verified creator profile...</span>
        </main>
        <LandingFooter />
      </div>
    );
  }

  if (notFoundState || !creator) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f9fb] text-slate-900">
        <LandingNavbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-24 text-center space-y-4">
          <h1 className="text-2xl font-black text-slate-900">Creator Profile Not Found</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            The creator <strong className="text-slate-800">@{rawHandle}</strong> is not registered on TrustScore yet or has updated their handle.
          </p>
          <Link
            href="/creators"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            <span>Explore All Verified Creators</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </main>
        <LandingFooter />
      </div>
    );
  }

  return <CreatorProfileDetailView creator={creator} />;
}

function CreatorProfileDetailView({ creator }: { creator: Creator }) {
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const commentPieData = [
    { name: "Unique Comments", value: creator.commentQuality?.uniqueCommentsPercent || 85, color: "#10b981" },
    { name: "Generic Comments", value: creator.commentQuality?.genericCommentsPercent || 10, color: "#f59e0b" },
    { name: "Repeated Patterns", value: creator.commentQuality?.repeatedPatternsPercent || 5, color: "#ef4444" },
  ];

  const handleToggleSave = async () => {
    const nextState = !isSaved;
    setIsSaved(nextState);
    try {
      if (nextState) {
        await fetch("/api/creators/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ creatorId: creator.id }),
        });
      } else {
        await fetch(`/api/creators/saved?creatorId=${encodeURIComponent(creator.id)}`, {
          method: "DELETE",
        });
      }
    } catch {
      // rollback if failed
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fb] text-slate-900 selection:bg-blue-600 selection:text-white">
      <LandingNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/creators" className="hover:text-slate-900 transition-colors">
            Creators
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{creator.username}</span>
        </div>

        {/* Hero Creator Dossier Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start sm:items-center gap-5">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0 bg-slate-50"
              />
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 truncate">
                    {creator.name}
                  </h1>
                  {creator.verifiedBadge && <VerificationBadge size="md" />}
                  <div className="inline-flex p-1 bg-slate-50 rounded-lg border border-slate-200 shadow-xs">
                    <PlatformIcon platform={creator.platform} size="sm" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{creator.username}</span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-semibold">
                    {creator.category}
                  </span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{creator.location}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed pt-1">
                  {creator.bio}
                </p>

                {/* Profile Tags & Availability */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    creator.availabilityStatus === "NOT_AVAILABLE"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}>
                    {creator.availabilityStatus === "NOT_AVAILABLE" ? "Not Available" : "Open to Work"}
                  </span>

                  {creator.profileTags && creator.profileTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-semibold"
                    >
                      <Tag className="w-2.5 h-2.5 text-blue-600" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 shrink-0 self-start md:self-auto">
              <button
                type="button"
                onClick={handleShare}
                className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                title="Share Profile Link"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleToggleSave}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  isSaved
                    ? "bg-purple-50 border-purple-200 text-purple-700"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{isSaved ? "Saved" : "Save Creator"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCollabModalOpen(true)}
                className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Request Collaboration</span>
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Followers</span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{formatNumber(creator.followers)}</p>
            <span className="text-[11px] text-slate-500">Total verified audience</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Engagement Rate</span>
            <p className="text-2xl sm:text-3xl font-black text-blue-600">{creator.engagementRate}%</p>
            <span className="text-[11px] text-slate-500">Across recent posts</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Authenticity Probability</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700">
              {creator.authenticityProbability ? `${creator.authenticityProbability}%` : `${100 - creator.inflatedEngagementProbability}%`}
            </p>
            <span className="text-[11px] text-emerald-700 font-semibold">Genuine human engagement</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Est. Starting Rate</span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">${creator.startingRate}</p>
            <span className="text-[11px] text-slate-500">Per sponsored deliverable</span>
          </div>
        </div>

        {/* TrustScore Dossier & Factor Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  TrustScore Authenticity Dossier
                </h3>
              </div>
              <RiskBadge risk={creator.riskLevel} />
            </div>

            {creator.trustScore > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <ScoreGauge score={creator.trustScore} size="lg" />
                  <span className="mt-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {creator.scoreBand}
                  </span>
                </div>

                <div className="sm:col-span-7 space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500">Comment Diversity:</span>
                    <strong className="text-slate-800 font-bold">{creator.commentDiversityPercent}%</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500">Growth Pattern Stability:</span>
                    <strong className="text-slate-800 font-bold">{creator.growthStabilityScore}/100</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500">Uncertainty Margin:</span>
                    <strong className="text-blue-600 font-bold">±{creator.uncertaintyMargin}%</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500">Data Coverage:</span>
                    <strong className="text-emerald-700 font-bold">Verified Direct Telemetry</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800 text-sm">TrustScore unavailable — insufficient data</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  This creator has recently joined the marketplace. A comprehensive TrustScore audit will be computed once direct post telemetry is verified.
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">Collaboration Terms</h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Deliverable Format:</span>
                <strong className="text-slate-800">Reels / Shorts / Posts</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Response Rate:</span>
                <strong className="text-emerald-700">&lt; 24 hours</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Fraud Protection:</span>
                <strong className="text-blue-600">Active Escrow</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCollabModalOpen(true)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Campaign Offer</span>
            </button>
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

