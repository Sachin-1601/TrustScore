"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { CreatorMarketplaceCard } from "@/components/marketplace/CreatorMarketplaceCard";
import { MOCK_CREATORS } from "@/data/mockCreators";
import { Creator } from "@/types/creator";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  Award,
  Filter,
  CheckCircle2,
  X,
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
];

function CreatorsMarketplaceContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "all";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [minTrustScore, setMinTrustScore] = useState<number>(0);
  const [followerRange, setFollowerRange] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"trust" | "risk" | "engagement" | "followers" | "verified">("trust");

  const categories = CATEGORIES;

  const filteredCreators = useMemo(() => {
    return MOCK_CREATORS.filter((creator) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = creator.name.toLowerCase().includes(q);
        const matchesUsername = creator.username.toLowerCase().includes(q);
        const matchesCategory = creator.category.toLowerCase().includes(q);
        const matchesBio = creator.bio.toLowerCase().includes(q);
        const matchesLocation = creator.location.toLowerCase().includes(q);
        if (!matchesName && !matchesUsername && !matchesCategory && !matchesBio && !matchesLocation) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== "all" && creator.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Platform
      if (selectedPlatform !== "all" && creator.platform !== selectedPlatform) {
        return false;
      }

      // TrustScore minimum
      if (minTrustScore > 0 && creator.trustScore < minTrustScore) {
        return false;
      }

      // Follower range
      if (followerRange === "nano" && (creator.followers < 1000 || creator.followers > 10000)) {
        return false;
      }
      if (followerRange === "micro" && (creator.followers < 10000 || creator.followers > 50000)) {
        return false;
      }

      // Location
      if (locationFilter === "australia" && !creator.location.includes("Australia")) return false;
      if (locationFilter === "usa" && !creator.location.includes(", ") && !creator.location.includes("USA")) return false;

      // Verified only
      if (verifiedOnly && !creator.verifiedBadge) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "trust") return b.trustScore - a.trustScore;
      if (sortBy === "risk") return a.inflatedEngagementProbability - b.inflatedEngagementProbability;
      if (sortBy === "engagement") return b.engagementRate - a.engagementRate;
      if (sortBy === "followers") return b.followers - a.followers;
      if (sortBy === "verified") return (b.verifiedBadge ? 1 : 0) - (a.verifiedBadge ? 1 : 0);
      return 0;
    });
  }, [
    searchQuery,
    selectedCategory,
    selectedPlatform,
    minTrustScore,
    followerRange,
    locationFilter,
    verifiedOnly,
    sortBy,
  ]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedPlatform("all");
    setMinTrustScore(0);
    setFollowerRange("all");
    setLocationFilter("all");
    setVerifiedOnly(false);
    setSortBy("trust");
  };

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Creator Intelligence Marketplace</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight">
          Find creators you can trust.
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Filter authentic micro- and nano-influencers by probabilistic TrustScore, verified direct API badges, engagement stability, and vertical niche.
        </p>
      </div>

      {/* Main Search & Filter Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-lg">
        {/* Search Input Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creators by name, handle, keyword, or city (e.g. Alex, Melbourne, Vegan, Sourdough)..."
            className="w-full py-3.5 px-4 pl-11 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm font-semibold focus:outline-hidden focus:border-blue-500"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer capitalize ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-blue-600 text-white shadow-xs font-bold"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        {/* Multi-Dimensional Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          {/* Platform */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Platform
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold focus:outline-hidden"
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>

          {/* Minimum TrustScore */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Min. TrustScore
            </label>
            <select
              value={minTrustScore}
              onChange={(e) => setMinTrustScore(Number(e.target.value))}
              className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold focus:outline-hidden"
            >
              <option value={0}>Any Score</option>
              <option value={90}>90+ (Very High Trust)</option>
              <option value={80}>80+ (High Trust)</option>
              <option value={70}>70+ (Moderate+)</option>
              <option value={50}>50+ (Baseline)</option>
            </select>
          </div>

          {/* Follower Tier */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Follower Tier
            </label>
            <select
              value={followerRange}
              onChange={(e) => setFollowerRange(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold focus:outline-hidden"
            >
              <option value="all">All Followers</option>
              <option value="nano">Nano (1K – 10K)</option>
              <option value="micro">Micro (10K – 50K)</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Location
            </label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold focus:outline-hidden"
            >
              <option value="all">Any Location</option>
              <option value="australia">Australia</option>
              <option value="usa">United States</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold focus:outline-hidden"
            >
              <option value="trust">Highest TrustScore</option>
              <option value="risk">Lowest Risk %</option>
              <option value="engagement">Highest Engagement</option>
              <option value="followers">Most Followers</option>
              <option value="verified">Verified First</option>
            </select>
          </div>

          {/* Verified Toggle */}
          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`w-full py-2 px-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                verifiedOnly
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Stats & Clear Filters */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-slate-200">{filteredCreators.length}</strong> authentic creators
        </span>
        {(searchQuery || selectedCategory !== "all" || selectedPlatform !== "all" || minTrustScore > 0 || followerRange !== "all" || verifiedOnly) && (
          <button
            onClick={handleClearFilters}
            className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset all filters</span>
          </button>
        )}
      </div>

      {/* Creator Marketplace Grid */}
      {filteredCreators.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCreators.map((creator) => (
            <CreatorMarketplaceCard key={creator.id} creator={creator} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 text-slate-500 mx-auto flex items-center justify-center">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">No creators found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms or relax your TrustScore and category filters.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function CreatorsMarketplacePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <LandingNavbar />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading marketplace...</div>}>
          <CreatorsMarketplaceContent />
        </Suspense>
      </main>
      <LandingFooter />
    </div>
  );
}
