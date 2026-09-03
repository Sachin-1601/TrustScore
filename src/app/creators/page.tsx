"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { CreatorMarketplaceCard } from "@/components/marketplace/CreatorMarketplaceCard";
import { CreatorCardSkeleton } from "@/components/marketplace/CreatorCardSkeleton";
import { Creator } from "@/types/creator";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  CheckCircle2,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Building2,
  ArrowRight,
  Users,
  Compass,
} from "lucide-react";

const CATEGORIES = [
  "all",
  "Fitness",
  "Beauty",
  "Fashion",
  "Travel",
  "Food",
  "Technology",
  "Gaming",
  "Lifestyle",
  "Other",
];

function CreatorsMarketplaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const initialQuery = searchParams.get("q") || searchParams.get("query") || "";
  const initialCategory = searchParams.get("category") || "all";

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [minTrustScore, setMinTrustScore] = useState<number>(0);
  const [followerRange, setFollowerRange] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [socialVerifiedOnly, setSocialVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"trust" | "risk" | "engagement" | "followers" | "verified" | "recent">("trust");

  // Mobile filter drawer modal
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Pagination and data states
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [savedCreatorIds, setSavedCreatorIds] = useState<Set<string>>(new Set());

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  // Debounce search query input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load saved creators for authenticated user
  const loadSavedCreators = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/creators/saved");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.saved)) {
          setSavedCreatorIds(new Set(data.saved.map((s: string) => s.toLowerCase())));
        }
      }
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    loadSavedCreators();
  }, [loadSavedCreators]);

  // Fetch creators from server
  const fetchCreators = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const params = new URLSearchParams();
      if (debouncedQuery.trim()) params.set("query", debouncedQuery.trim());
      if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedPlatform && selectedPlatform !== "all") params.set("platform", selectedPlatform);
      if (minTrustScore > 0) params.set("minTrustScore", String(minTrustScore));
      if (followerRange !== "all") params.set("followerRange", followerRange);
      if (locationFilter.trim()) params.set("location", locationFilter.trim());
      if (verifiedOnly) params.set("verifiedOnly", "true");
      if (socialVerifiedOnly) params.set("socialVerifiedOnly", "true");
      if (availableOnly) params.set("availableOnly", "true");
      if (sortBy) params.set("sortBy", sortBy);
      params.set("page", String(page));
      params.set("limit", String(limit));

      const res = await fetch(`/api/creators?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load creator directory");
      }

      const data = await res.json();
      setCreators(data.creators || []);
      setTotalCount(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Discover creators fetch error:", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [
    debouncedQuery,
    selectedCategory,
    selectedPlatform,
    minTrustScore,
    followerRange,
    locationFilter,
    verifiedOnly,
    socialVerifiedOnly,
    availableOnly,
    sortBy,
    page,
    limit,
  ]);

  useEffect(() => {
    fetchCreators();
  }, [fetchCreators]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setSelectedCategory("all");
    setSelectedPlatform("all");
    setMinTrustScore(0);
    setFollowerRange("all");
    setLocationFilter("");
    setVerifiedOnly(false);
    setSocialVerifiedOnly(false);
    setAvailableOnly(false);
    setSortBy("trust");
    setPage(1);
  };

  const handleToggleSave = (creatorId: string, newState: boolean) => {
    setSavedCreatorIds((prev) => {
      const next = new Set(prev);
      const clean = creatorId.replace("@", "").toLowerCase();
      if (newState) next.add(clean);
      else next.delete(clean);
      return next;
    });
  };

  const hasActiveFilters =
    Boolean(debouncedQuery.trim()) ||
    selectedCategory !== "all" ||
    selectedPlatform !== "all" ||
    minTrustScore > 0 ||
    followerRange !== "all" ||
    Boolean(locationFilter.trim()) ||
    verifiedOnly ||
    socialVerifiedOnly ||
    availableOnly ||
    sortBy !== "trust";

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 320, behavior: "smooth" });
    }
  };

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* ---------------------------------------------------- */}
      {/* A. HERO / HEADER */}
      {/* ---------------------------------------------------- */}
      <div className="text-center space-y-3.5 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Creator Intelligence Marketplace</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Find creators you can trust.
        </h1>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl mx-auto">
          Discover verified creators using TrustScore authenticity intelligence, engagement quality, and creator insights.
        </p>
      </div>

      {/* ---------------------------------------------------- */}
      {/* B. SEARCH & FILTER CONTROLS */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        {/* Top: Search Input + Mobile Filter Drawer Button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creators by name, handle, niche, or location..."
              className="w-full py-3.5 px-4 pl-11 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-semibold focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all shadow-xs"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Filter Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold flex items-center gap-2 hover:border-slate-300 transition-colors cursor-pointer shrink-0"
          >
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-600" />
            )}
          </button>
        </div>

        {/* Category Pills Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer capitalize shrink-0 ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            );
          })}
        </div>

        {/* Desktop Multi-Dimensional Filter Bar */}
        <div className="hidden lg:grid grid-cols-6 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* 1. Platform */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Platform
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => {
                setSelectedPlatform(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:border-blue-600 focus:bg-white cursor-pointer"
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>

          {/* 2. Min TrustScore */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Min. TrustScore
            </label>
            <select
              value={minTrustScore}
              onChange={(e) => {
                setMinTrustScore(Number(e.target.value));
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:border-blue-600 focus:bg-white cursor-pointer"
            >
              <option value={0}>Any Score</option>
              <option value={90}>90+ (Very High)</option>
              <option value={80}>80+ (High Trust)</option>
              <option value={70}>70+ (Moderate)</option>
              <option value={60}>60+ (Baseline)</option>
            </select>
          </div>

          {/* 3. Follower Tier */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Followers
            </label>
            <select
              value={followerRange}
              onChange={(e) => {
                setFollowerRange(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:border-blue-600 focus:bg-white cursor-pointer"
            >
              <option value="all">All Audiences</option>
              <option value="nano">Nano (1K – 10K)</option>
              <option value="micro">Micro (10K – 50K)</option>
              <option value="mid">Mid-Tier (50K – 500K)</option>
              <option value="macro">Macro (500K+)</option>
            </select>
          </div>

          {/* 4. Verification */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Verification
            </label>
            <select
              value={verifiedOnly ? "verified" : socialVerifiedOnly ? "social" : "all"}
              onChange={(e) => {
                const v = e.target.value;
                setVerifiedOnly(v === "verified");
                setSocialVerifiedOnly(v === "social");
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:border-blue-600 focus:bg-white cursor-pointer"
            >
              <option value="all">All Creators</option>
              <option value="verified">TrustScore Verified</option>
              <option value="social">Social API Linked</option>
            </select>
          </div>

          {/* 5. Sort By */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:border-blue-600 focus:bg-white cursor-pointer"
            >
              <option value="trust">Highest TrustScore</option>
              <option value="verified">Verified First</option>
              <option value="engagement">Engagement Quality</option>
              <option value="followers">Most Followers</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>

          {/* 6. Availability Toggle */}
          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={() => {
                setAvailableOnly(!availableOnly);
                setPage(1);
              }}
              className={`w-full py-2 px-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                availableOnly
                  ? "bg-blue-50 border-blue-300 text-blue-700 shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Open to Deals</span>
            </button>
          </div>
        </div>

        {/* Active Filter Badges Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Active Filters:
            </span>

            {debouncedQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-[11px]">
                <span>Query: &quot;{debouncedQuery}&quot;</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-[11px]">
                <span>Category: {selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedPlatform !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-[11px] capitalize">
                <span>Platform: {selectedPlatform}</span>
                <button
                  type="button"
                  onClick={() => setSelectedPlatform("all")}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {minTrustScore > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-[11px]">
                <span>TrustScore: {minTrustScore}+</span>
                <button
                  type="button"
                  onClick={() => setMinTrustScore(0)}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {followerRange !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-[11px] capitalize">
                <span>Tier: {followerRange}</span>
                <button
                  type="button"
                  onClick={() => setFollowerRange("all")}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {verifiedOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px]">
                <span>TrustScore Verified</span>
                <button
                  type="button"
                  onClick={() => setVerifiedOnly(false)}
                  className="hover:text-emerald-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {availableOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-[11px]">
                <span>Open for Collabs</span>
                <button
                  type="button"
                  onClick={() => setAvailableOnly(false)}
                  className="hover:text-blue-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleClearFilters}
              className="text-blue-600 hover:underline font-bold text-[11px] ml-auto cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* C. RESULTS SUMMARY HEADER */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div className="flex items-center gap-2">
          <span>
            {isLoading ? (
              <span className="flex items-center gap-1.5 text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Querying marketplace records...</span>
              </span>
            ) : totalCount > 0 ? (
              <span>
                Showing <strong className="text-slate-900">{(page - 1) * limit + 1}–{Math.min(page * limit, totalCount)}</strong> of <strong className="text-slate-900">{totalCount}</strong> verified creators
              </span>
            ) : (
              <span>0 creators found</span>
            )}
          </span>
        </div>

        {totalCount > 0 && totalPages > 1 && (
          <span className="text-slate-400 font-medium">
            Page {page} of {totalPages}
          </span>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* D. CREATOR GRID / STATES */}
      {/* ---------------------------------------------------- */}
      {isLoading ? (
        /* Loading Skeleton Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <CreatorCardSkeleton key={idx} />
          ))}
        </div>
      ) : isError ? (
        /* Error State */
        <div className="bg-white border border-rose-200 rounded-2xl p-10 sm:p-14 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Unable to load creators</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Something went wrong while retrieving creator directory records from the database.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchCreators()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : creators.length > 0 ? (
        /* Creator Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((creator) => (
            <CreatorMarketplaceCard
              key={creator.id}
              creator={creator}
              isSaved={savedCreatorIds.has(creator.id.toLowerCase()) || savedCreatorIds.has(creator.username.replace("@", "").toLowerCase())}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      ) : hasActiveFilters ? (
        /* Filtered Empty State */
        <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-14 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 mx-auto flex items-center justify-center">
            <SlidersHorizontal className="w-6 h-6 text-blue-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No creators match your current filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try relaxing your TrustScore threshold, clearing niche filters, or searching for broader terms.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Zero Database Records Empty State */
        <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-14 text-center space-y-5 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mx-auto flex items-center justify-center">
            <Compass className="w-8 h-8" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Creator Marketplace Launch
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              No creators available yet
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Creators will appear here once they complete their TrustScore authenticity profile and link their verified social accounts.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-md mx-auto text-xs text-slate-700 text-left flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="text-slate-900 block">Are you a creator or influencer?</strong>
              <span className="text-slate-500 text-[11px]">
                Create your verified profile to be listed on TrustScore&apos;s authenticity marketplace for brand sponsorships.
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup?role=CREATOR"
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Join as a Creator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/how-it-works"
              className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors text-center"
            >
              Explore How TrustScore Works
            </Link>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* E. SERVER-SIDE PAGINATION CONTROLS */}
      {/* ---------------------------------------------------- */}
      {totalCount > 0 && totalPages > 1 && (
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500">
            Showing <strong className="text-slate-900">{(page - 1) * limit + 1}–{Math.min(page * limit, totalCount)}</strong> of <strong className="text-slate-900">{totalCount}</strong> creators
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => handlePageChange(page - 1)}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;

                return (
                  <React.Fragment key={p}>
                    {showEllipsis && (
                      <span className="px-2 text-xs text-slate-400 font-bold">...</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handlePageChange(p)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        p === page
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs"
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              type="button"
              disabled={page >= totalPages || isLoading}
              onClick={() => handlePageChange(page + 1)}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* F. MOBILE FILTER DRAWER MODAL */}
      {/* ---------------------------------------------------- */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm bg-white h-full p-6 space-y-6 overflow-y-auto border-l border-slate-200 flex flex-col justify-between shadow-2xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-base">Filters</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Platform */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Platform
                </label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => {
                    setSelectedPlatform(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:bg-white focus:border-blue-600"
                >
                  <option value="all">All Platforms</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>

              {/* TrustScore */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Min. TrustScore
                </label>
                <select
                  value={minTrustScore}
                  onChange={(e) => {
                    setMinTrustScore(Number(e.target.value));
                    setPage(1);
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:bg-white focus:border-blue-600"
                >
                  <option value={0}>Any Score</option>
                  <option value={90}>90+ (Very High)</option>
                  <option value={80}>80+ (High Trust)</option>
                  <option value={70}>70+ (Moderate)</option>
                  <option value={60}>60+ (Baseline)</option>
                </select>
              </div>

              {/* Follower Tier */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Follower Range
                </label>
                <select
                  value={followerRange}
                  onChange={(e) => {
                    setFollowerRange(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:bg-white focus:border-blue-600"
                >
                  <option value="all">All Audiences</option>
                  <option value="nano">Nano (1K – 10K)</option>
                  <option value="micro">Micro (10K – 50K)</option>
                  <option value="mid">Mid-Tier (50K – 500K)</option>
                  <option value="macro">Macro (500K+)</option>
                </select>
              </div>

              {/* Verification & Availability Toggles */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setVerifiedOnly(!verifiedOnly);
                    setPage(1);
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer ${
                    verifiedOnly
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <span>TrustScore Verified Only</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAvailableOnly(!availableOnly);
                    setPage(1);
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer ${
                    availableOnly
                      ? "bg-blue-50 border-blue-300 text-blue-700 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <span>Available for Collabs</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                View Results ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => {
                  handleClearFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreatorsMarketplacePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fb] text-slate-900">
      <LandingNavbar />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading marketplace...</div>}>
          <CreatorsMarketplaceContent />
        </Suspense>
      </main>
      <LandingFooter />
    </div>
  );
}

