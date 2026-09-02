"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Creator, CollaborationRequest, Business } from "@/types/creator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { formatNumber } from "@/lib/utils";
import {
  Users,
  Bookmark,
  Send,
  ShieldCheck,
  Search,
  Plus,
  Briefcase,
  Megaphone,
  CreditCard,
  Building2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  Globe,
  MapPin,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  BookmarkCheck,
  Compass,
} from "lucide-react";

interface RecentAnalysis {
  id: string;
  creatorId: string;
  creatorUsername: string;
  creatorName: string;
  creatorAvatar: string;
  category: string;
  platform: string;
  followers: number;
  verifiedBadge: boolean;
  trustScore: number;
  scoreBand: string;
  riskLevel: string;
  calculatedAt: string;
}

interface CampaignItem {
  id: string;
  title: string;
  category: string;
  budget: number;
  status: string;
  deliverables: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  applications?: any[];
}

interface SubscriptionData {
  planId: string;
  planName: string;
  status: string;
  creatorChecksLimit: number;
  creatorChecksRemaining: number;
  checksUsed: number;
  usagePercentage: number;
  currentPeriodEnd: string;
}

export default function DedicatedBusinessDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  // Data States
  const [businessProfile, setBusinessProfile] = useState<Business | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [savedCreators, setSavedCreators] = useState<Creator[]>([]);
  const [savedUsernames, setSavedUsernames] = useState<Set<string>>(new Set());
  const [recentCollaborations, setRecentCollaborations] = useState<CollaborationRequest[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
  const [authenticCreators, setAuthenticCreators] = useState<Creator[]>([]);
  
  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [savingCreatorId, setSavingCreatorId] = useState<string | null>(null);

  const loadBusinessDashboardData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage("");

    try {
      const [
        creatorsRes,
        savedRes,
        collabsRes,
        campaignsRes,
        subRes,
        analysesRes,
        bizRes,
      ] = await Promise.all([
        fetch("/api/creators?minTrustScore=80&limit=6"),
        fetch("/api/creators/saved"),
        fetch("/api/collaborations"),
        fetch("/api/campaigns"),
        fetch("/api/payments/subscription"),
        fetch("/api/trustscore/analyze?limit=4"),
        fetch("/api/businesses"),
      ]);

      // 1. Featured Authentic Creators
      if (creatorsRes.ok) {
        const cData = await creatorsRes.json();
        setAuthenticCreators(cData.creators || []);
      }

      // 2. Saved Creators
      if (savedRes.ok) {
        const sData = await savedRes.json();
        setSavedCreators(sData.creators || []);
        if (Array.isArray(sData.saved)) {
          setSavedUsernames(new Set(sData.saved.map((u: string) => u.toLowerCase())));
        }
      }

      // 3. Collaborations
      if (collabsRes.ok) {
        const collabData = await collabsRes.json();
        setRecentCollaborations(collabData.collaborations || []);
      }

      // 4. Campaigns
      if (campaignsRes.ok) {
        const campData = await campaignsRes.json();
        setCampaigns(campData.campaigns || []);
      }

      // 5. Subscription
      if (subRes.ok) {
        const subData = await subRes.json();
        if (subData.subscription) {
          setSubscription(subData.subscription);
        }
      }

      // 6. Recent Analyses
      if (analysesRes.ok) {
        const aData = await analysesRes.json();
        setRecentAnalyses(aData.analyses || []);
      }

      // 7. Business Profile
      if (bizRes.ok) {
        const bData = await bizRes.json();
        if (bData.businesses && bData.businesses.length > 0) {
          const matched = bData.businesses.find(
            (b: Business) => b.contactEmail === user?.email || b.name === user?.name
          ) || bData.businesses[0];
          setBusinessProfile(matched);
        }
      }
    } catch (err: any) {
      console.error("Business Dashboard loading error:", err);
      setHasError(true);
      setErrorMessage(err.message || "Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadBusinessDashboardData();
  }, [loadBusinessDashboardData]);

  // Save / Bookmark Creator Toggle
  const handleToggleSaveCreator = async (creator: Creator) => {
    const rawUsername = creator.username.replace("@", "").toLowerCase();
    const isSaved = savedUsernames.has(rawUsername);
    setSavingCreatorId(creator.id);

    try {
      if (isSaved) {
        // DELETE
        const res = await fetch(`/api/creators/saved?creatorId=${encodeURIComponent(rawUsername)}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setSavedUsernames((prev) => {
            const next = new Set(prev);
            next.delete(rawUsername);
            return next;
          });
          setSavedCreators((prev) => prev.filter((c) => c.username.replace("@", "").toLowerCase() !== rawUsername));
          toastSuccess("Removed", `Removed ${creator.username} from your saved shortlist.`);
        }
      } else {
        // POST
        const res = await fetch("/api/creators/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ creatorId: rawUsername }),
        });
        if (res.ok) {
          setSavedUsernames((prev) => {
            const next = new Set(prev);
            next.add(rawUsername);
            return next;
          });
          setSavedCreators((prev) => [creator, ...prev]);
          toastSuccess("Saved", `Added ${creator.username} to your shortlisted creators.`);
        }
      }
    } catch (err: any) {
      toastError("Error", err.message || "Could not update bookmark.");
    } finally {
      setSavingCreatorId(null);
    }
  };

  const businessDisplayName = businessProfile?.name || user?.name || "Business";
  const activeCampaignsCount = campaigns.filter((c) => c.status === "ACTIVE" || c.status === "DRAFT").length;
  const activeCollaborationsCount = recentCollaborations.filter((c) => c.status === "Active" || c.status === "Pending" || c.status === "Accepted").length;
  const analysesCount = recentAnalyses.length;

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      {/* Top Header */}
      <DashboardHeader
        title={`Welcome back, ${businessDisplayName}`}
        subtitle="Discover authentic creators, evaluate campaign risk, and build stronger creator partnerships."
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Error Alert with Retry */}
        {hasError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage || "Unable to load some dashboard metrics."}</span>
            </div>
            <button
              type="button"
              onClick={loadBusinessDashboardData}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* PRIMARY BUSINESS ACTIONS: "What would you like to do?"      */}
        {/* ============================================================ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              What would you like to do?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ACTION 1: DISCOVER CREATORS */}
            <Link
              href="/creators"
              className="group bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-6 transition-all shadow-md hover:shadow-blue-500/10 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-100 group-hover:text-blue-400 transition-colors">
                  DISCOVER CREATORS
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Find creators based on authenticity, audience, niche and availability.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>Browse Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* ACTION 2: ANALYZE A CREATOR */}
            <Link
              href="/dashboard/analyze"
              className="group bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-3xl p-6 transition-all shadow-md hover:shadow-purple-500/10 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/15 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-100 group-hover:text-purple-400 transition-colors">
                  ANALYZE A CREATOR
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Evaluate creator authenticity and Bayesian TrustScore risk models.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
                <span>Run Authenticity Audit</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* ACTION 3: CREATE A CAMPAIGN */}
            <Link
              href="/dashboard/campaigns"
              className="group bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-6 transition-all shadow-md hover:shadow-emerald-500/10 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-100 group-hover:text-emerald-400 transition-colors">
                  CREATE A CAMPAIGN
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Launch a campaign and find authentic creators to work with.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>Launch New Campaign</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </section>

        {/* ============================================================ */}
        {/* BUSINESS OVERVIEW (4 KPI CARDS) — 100% REAL DATA             */}
        {/* ============================================================ */}
        <section className="space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Creator Analyses */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2 shadow-xs hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Creator Analyses
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
              </div>
              {isLoading ? (
                <div className="h-8 w-16 bg-slate-800 animate-pulse rounded-md" />
              ) : (
                <p className="text-3xl font-black text-slate-100">
                  {analysesCount > 0 ? analysesCount : "—"}
                </p>
              )}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-400">Audits conducted</span>
                <Link href="/dashboard/analyze" className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-0.5">
                  <span>Audit</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* KPI 2: Saved Creators */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2 shadow-xs hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Saved Creators
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Bookmark className="w-4 h-4" />
                </div>
              </div>
              {isLoading ? (
                <div className="h-8 w-16 bg-slate-800 animate-pulse rounded-md" />
              ) : (
                <p className="text-3xl font-black text-slate-100">
                  {savedCreators.length > 0 ? savedCreators.length : "—"}
                </p>
              )}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-400">Shortlisted candidates</span>
                <Link href="/dashboard/saved" className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5">
                  <span>View</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* KPI 3: Active Campaigns */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2 shadow-xs hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Active Campaigns
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              {isLoading ? (
                <div className="h-8 w-16 bg-slate-800 animate-pulse rounded-md" />
              ) : (
                <p className="text-3xl font-black text-slate-100">
                  {activeCampaignsCount > 0 ? activeCampaignsCount : "—"}
                </p>
              )}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-400">Campaign rosters</span>
                <Link href="/dashboard/campaigns" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5">
                  <span>Manage</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* KPI 4: Active Collaborations */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2 shadow-xs hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Active Collaborations
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
              </div>
              {isLoading ? (
                <div className="h-8 w-16 bg-slate-800 animate-pulse rounded-md" />
              ) : (
                <p className="text-3xl font-black text-slate-100">
                  {activeCollaborationsCount > 0 ? activeCollaborationsCount : "—"}
                </p>
              )}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-400">Partnership deals</span>
                <Link href="/dashboard/collaborations" className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-0.5">
                  <span>Pipeline</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* DISCOVER AUTHENTIC CREATORS                                  */}
        {/* ============================================================ */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-black text-slate-100 tracking-tight">
                  Discover Authentic Creators
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Find creators with strong authenticity signals for your next campaign.
              </p>
            </div>

            <Link
              href="/creators"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View All Creators</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Creators Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-3xl bg-slate-950 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : authenticCreators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {authenticCreators.map((creator) => {
                const rawUsername = creator.username.replace("@", "").toLowerCase();
                const isSaved = savedUsernames.has(rawUsername);

                return (
                  <div
                    key={creator.id}
                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 space-y-4 transition-all shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Creator Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={creator.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                            alt={creator.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/creators/${creator.id}`}
                                className="font-bold text-sm text-slate-100 hover:text-blue-400 truncate transition-colors"
                              >
                                {creator.username}
                              </Link>
                              {creator.verifiedBadge && <VerificationBadge size="sm" showText={false} />}
                            </div>
                            <span className="text-xs text-slate-400 block truncate">{creator.name}</span>
                          </div>
                        </div>

                        {/* Save Creator Button */}
                        <button
                          type="button"
                          disabled={savingCreatorId === creator.id}
                          onClick={() => handleToggleSaveCreator(creator)}
                          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                            isSaved
                              ? "bg-blue-600/20 border-blue-500/40 text-blue-400 hover:bg-rose-950/40 hover:text-rose-400"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                          }`}
                          title={isSaved ? "Remove from saved" : "Save creator"}
                        >
                          {isSaved ? <BookmarkCheck className="w-4 h-4 text-blue-400" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Score and Metric Badges */}
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">TrustScore</span>
                          <span className="font-extrabold text-blue-400 text-sm">
                            {creator.trustScore}
                            <span className="text-[10px] text-slate-500 font-normal">/100</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Audience</span>
                          <span className="font-bold text-slate-200 text-xs">
                            {formatNumber(creator.followers)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Engagement</span>
                          <span className="font-bold text-emerald-400 text-xs">
                            {creator.engagementRate}%
                          </span>
                        </div>
                      </div>

                      {/* Category & Availability tags */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-semibold flex items-center gap-1.5">
                          <PlatformIcon platform={creator.platform} size="sm" />
                          <span>{creator.category}</span>
                        </span>

                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase">
                          {creator.availabilityStatus === "OPEN_TO_WORK" ? "Available" : creator.availabilityStatus || "Open"}
                        </span>
                      </div>
                    </div>

                    {/* View Profile CTA */}
                    <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        Est. Rate: <strong className="text-slate-300 font-bold">${creator.startingRate}</strong>
                      </span>

                      <Link
                        href={`/creators/${creator.id}`}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-blue-600 hover:text-white border border-slate-800 text-slate-200 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1"
                      >
                        <span>View Profile</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-950/60 border border-slate-800 rounded-3xl space-y-3">
              <Compass className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-200">No creators available yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Explore the marketplace directory to discover and evaluate authentic creators across all categories.
              </p>
              <div className="pt-2">
                <Link
                  href="/creators"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Browse Creators</span>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* RECENT CREATOR ANALYSES                                      */}
        {/* ============================================================ */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Recent Creator Analyses</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Authenticity audits and Bayesian risk assessments.
              </p>
            </div>

            <Link
              href="/dashboard/analyze"
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>Analyze a Creator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-slate-950 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : recentAnalyses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Creator</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Followers</th>
                    <th className="py-3 px-4 text-right">TrustScore</th>
                    <th className="py-3 px-4 text-right">Authenticity Status</th>
                    <th className="py-3 px-4 text-right">Audited Date</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentAnalyses.map((analysis) => (
                    <tr key={analysis.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={analysis.creatorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                            alt={analysis.creatorName}
                            className="w-8 h-8 rounded-xl object-cover border border-slate-700"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-100">{analysis.creatorUsername}</span>
                              {analysis.verifiedBadge && <VerificationBadge size="sm" showText={false} />}
                            </div>
                            <span className="text-[10px] text-slate-400">{analysis.creatorName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px]">
                          {analysis.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-200">
                        {formatNumber(analysis.followers)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-extrabold text-blue-400 text-sm">{analysis.trustScore}</span>
                        <span className="text-[10px] text-slate-500">/100</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          analysis.riskLevel === "LOW"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : analysis.riskLevel === "HIGH"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {analysis.riskLevel === "LOW" ? "High Authenticity" : `${analysis.riskLevel} Risk`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                        {new Date(analysis.calculatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          href={`/creators/${analysis.creatorUsername.replace("@", "")}`}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-[11px] transition-colors inline-flex items-center gap-1"
                        >
                          <span>View Analysis</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center bg-slate-950/60 border border-slate-800 rounded-3xl space-y-2">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-200">No creator analyses yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Analyze a creator to understand audience authenticity and engagement quality.
              </p>
              <div className="pt-2">
                <Link
                  href="/dashboard/analyze"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Analyze a Creator</span>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* TWO-COLUMN GRID: SAVED CREATORS & CAMPAIGNS                  */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: SAVED CREATORS */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-blue-400" />
                  <h3 className="text-base font-bold text-slate-100">
                    Saved Creators ({savedCreators.length})
                  </h3>
                </div>

                <Link
                  href="/dashboard/saved"
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                >
                  <span>View Saved Creators</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 rounded-2xl bg-slate-950 animate-pulse border border-slate-800" />
                  ))}
                </div>
              ) : savedCreators.length > 0 ? (
                <div className="space-y-3">
                  {savedCreators.slice(0, 3).map((creator) => (
                    <div
                      key={creator.id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/creators/${creator.id}`}
                              className="font-bold text-xs text-slate-100 hover:text-blue-400 truncate"
                            >
                              {creator.username}
                            </Link>
                            {creator.verifiedBadge && <VerificationBadge size="sm" showText={false} />}
                          </div>
                          <span className="text-[10px] text-slate-400 truncate block">
                            {creator.category} • {formatNumber(creator.followers)} followers
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-blue-400 block">
                          {creator.trustScore}/100
                        </span>
                        <Link
                          href={`/creators/${creator.id}`}
                          className="text-[10px] text-slate-400 hover:text-slate-200 font-medium"
                        >
                          View Profile →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                  <Bookmark className="w-6 h-6 text-slate-600 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-200">No saved creators yet</h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Save creators you&apos;re interested in so you can quickly return to them.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Link
                href="/creators"
                className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>Browse Marketplace</span>
              </Link>
            </div>
          </div>

          {/* RIGHT: CAMPAIGNS */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-base font-bold text-slate-100">
                    Campaigns ({campaigns.length})
                  </h3>
                </div>

                <Link
                  href="/dashboard/campaigns"
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
                >
                  <span>Manage Campaigns</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 rounded-2xl bg-slate-950 animate-pulse border border-slate-800" />
                  ))}
                </div>
              ) : campaigns.length > 0 ? (
                <div className="space-y-3">
                  {campaigns.slice(0, 3).map((camp) => (
                    <div
                      key={camp.id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-100 truncate">{camp.title}</h4>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase shrink-0 ${
                          camp.status === "ACTIVE"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : camp.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-800 text-slate-400"
                        }`}>
                          {camp.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{camp.category} • {camp.applications?.length || 0} Applications</span>
                        <span className="font-bold text-emerald-400">${Math.round(camp.budget).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                  <Briefcase className="w-6 h-6 text-slate-600 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-200">No campaigns yet</h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Create structured influencer marketing campaigns to recruit authentic creators.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard/campaigns"
                className="w-full py-2.5 px-4 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-400 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Campaign</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TWO-COLUMN GRID: COLLABORATION ACTIVITY & MESSAGES           */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: COLLABORATION ACTIVITY */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-amber-400" />
                  <h3 className="text-base font-bold text-slate-100">
                    Collaboration Activity ({recentCollaborations.length})
                  </h3>
                </div>

                <Link
                  href="/dashboard/collaborations"
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
                >
                  <span>View Collaborations</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 rounded-2xl bg-slate-950 animate-pulse border border-slate-800" />
                  ))}
                </div>
              ) : recentCollaborations.length > 0 ? (
                <div className="space-y-3">
                  {recentCollaborations.slice(0, 3).map((collab) => (
                    <div
                      key={collab.id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-100 truncate">{collab.campaignName}</h4>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                            collab.status === "Active"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : collab.status === "Accepted"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : collab.status === "Pending"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-slate-800 text-slate-400"
                          }`}>
                            {collab.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block truncate">
                          Partner: {collab.creatorUsername || "Partner Creator"} • ${collab.budget.toLocaleString()}
                        </span>
                      </div>

                      <Link
                        href={`/dashboard/messages?collaborationId=${collab.id}`}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 text-[11px] font-bold rounded-lg shrink-0"
                      >
                        Message
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                  <Send className="w-6 h-6 text-slate-600 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-200">No collaboration activity yet.</h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Send structured proposals to verified creators with escrow milestone protections.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Link
                href="/creators"
                className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Find Creators to Partner With</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* RIGHT: MESSAGES */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <h3 className="text-base font-bold text-slate-100">Messages</h3>
                </div>

                <Link
                  href="/dashboard/messages"
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                >
                  <span>View Messages</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-16 rounded-2xl bg-slate-950 animate-pulse border border-slate-800" />
                </div>
              ) : recentCollaborations.length > 0 ? (
                <div className="space-y-3">
                  {recentCollaborations.slice(0, 2).map((collab) => (
                    <Link
                      key={collab.id}
                      href={`/dashboard/messages?collaborationId=${collab.id}`}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors block"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-200 truncate">{collab.creatorUsername || "Creator Partner"}</h4>
                          <p className="text-[11px] text-slate-400 truncate">Re: {collab.campaignName}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-blue-400 font-bold shrink-0">Open Thread →</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                  <MessageSquare className="w-6 h-6 text-slate-600 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-200">No conversations yet.</h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Direct conversation threads open automatically when you create a collaboration proposal.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard/messages"
                className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Open Communication Center</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TWO-COLUMN GRID: ADVERTISING & YOUR PLAN                     */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: BUSINESS ADVERTISING */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-amber-400" />
                  <h3 className="text-base font-bold text-slate-100">Promote Your Business</h3>
                </div>

                <Link
                  href="/dashboard/advertise"
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
                >
                  <span>Advertising</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Reach creators and businesses across the TrustScore platform with targeted advertising.
              </p>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-bold text-slate-300">Strict Algorithmic Isolation</div>
                <p>
                  Advertising placements are strictly separated from TrustScore evaluation and ranking algorithms.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard/advertise"
                className="w-full py-2.5 px-4 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-400 transition-colors flex items-center justify-center gap-1.5"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Create Advertisement</span>
              </Link>
            </div>
          </div>

          {/* RIGHT: YOUR PLAN (SUBSCRIPTION / BILLING)                    */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-base font-bold text-slate-100">Your Plan</h3>
                </div>

                <Link
                  href="/dashboard/billing"
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                >
                  <span>Manage Billing</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-12 rounded-2xl bg-slate-950 animate-pulse border border-slate-800" />
                  <div className="h-4 rounded-md bg-slate-950 animate-pulse" />
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Active SaaS Subscription
                      </span>
                      <h4 className="text-base font-black text-slate-100">
                        {subscription?.planName || "Starter Plan"}
                      </h4>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{subscription?.status || "ACTIVE"}</span>
                    </span>
                  </div>

                  {/* Quota Progress */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Analysis Quota:</span>
                      <span className="font-bold text-slate-200">
                        {subscription?.creatorChecksRemaining ?? 0} remaining{" "}
                        <span className="text-slate-500 font-normal">of {subscription?.creatorChecksLimit ?? 25}</span>
                      </span>
                    </div>

                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, Math.max(5, ((subscription?.creatorChecksRemaining ?? 0) / (subscription?.creatorChecksLimit || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {subscription?.currentPeriodEnd && (
                    <div className="text-[10px] text-slate-500 pt-1 flex items-center justify-between">
                      <span>Monthly billing cycle</span>
                      <span>Next renewal: {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard/billing"
                className="w-full py-2.5 px-4 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-400 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Manage Billing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
