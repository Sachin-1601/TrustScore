"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Creator } from "@/types/creator";
import { RiskBadge } from "@/components/common/RiskBadge";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import { formatNumber } from "@/lib/utils";
import {
  Search,
  Grid,
  List,
  Scale,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function InfluencersDirectoryPage() {
  const router = useRouter();

  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [minTrustScore, setMinTrustScore] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"trust" | "risk" | "engagement" | "followers">("trust");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Comparison selection state
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const fetchCreators = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("query", search.trim());
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedPlatform !== "all") params.set("platform", selectedPlatform);
      if (minTrustScore > 0) params.set("minTrustScore", String(minTrustScore));
      if (verifiedOnly) params.set("verifiedOnly", "true");
      params.set("sortBy", sortBy);

      const res = await fetch(`/api/creators?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCreators(data.creators || []);
      }
    } catch {
      // Network error
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory, selectedPlatform, minTrustScore, verifiedOnly, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCreators();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchCreators]);

  const toggleCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((item) => item !== id));
    } else {
      if (selectedForCompare.length >= 4) {
        alert("You can compare up to 4 creators simultaneously.");
        return;
      }
      setSelectedForCompare([...selectedForCompare, id]);
    }
  };

  const handleLaunchCompare = () => {
    if (selectedForCompare.length < 2) return;
    router.push(`/dashboard/compare?ids=${selectedForCompare.join(",")}`);
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Creator Intelligence Directory"
        subtitle="Search, filter, and benchmark verified creators with probabilistic TrustScore analytics"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Control Bar: Search, View Mode, Filters */}
        <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-md space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by username, real name, or niche keywords..."
                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-700 bg-slate-950 focus:outline-hidden focus:border-blue-500 text-xs font-semibold text-slate-100 placeholder:text-slate-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>

            {/* Right Tools: View Toggle & Compare Floating Bar */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "grid" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "table" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {selectedForCompare.length > 0 && (
                <button
                  type="button"
                  onClick={handleLaunchCompare}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <Scale className="w-4 h-4" />
                  <span>Compare ({selectedForCompare.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-xs">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-semibold focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              <option value="Fitness">Fitness</option>
              <option value="Beauty">Beauty</option>
              <option value="Fashion">Fashion</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
              <option value="Technology">Technology</option>
              <option value="Gaming">Gaming</option>
              <option value="Lifestyle">Lifestyle</option>
            </select>

            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-semibold focus:outline-hidden"
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-semibold focus:outline-hidden"
            >
              <option value="trust">Highest TrustScore</option>
              <option value="engagement">Highest Engagement Rate</option>
              <option value="followers">Most Followers</option>
            </select>

            <button
              type="button"
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                verifiedOnly
                  ? "bg-blue-600/20 text-blue-400 border-blue-500/40"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              Verified Only
            </button>
          </div>
        </div>

        {/* Results Body */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-xs font-semibold">Loading verified creators...</span>
          </div>
        ) : creators.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <h3 className="text-base font-bold text-slate-200">No creators match your search</h3>
            <p className="text-xs text-slate-400">Try adjusting your filters or category selections.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => {
              const isSelected = selectedForCompare.includes(creator.id);
              return (
                <div
                  key={creator.id}
                  className={`bg-slate-900/90 border rounded-3xl p-5 space-y-4 transition-all shadow-md flex flex-col justify-between ${
                    isSelected ? "border-purple-500/60 ring-2 ring-purple-500/20" : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/creators/${creator.id}`}
                              className="font-bold text-slate-100 text-sm hover:text-blue-400 transition-colors"
                            >
                              {creator.username}
                            </Link>
                            {creator.verifiedBadge && <VerificationBadge size="sm" showText={false} />}
                          </div>
                          <span className="text-xs text-slate-400">{creator.name} • {creator.category}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleCompare(creator.id)}
                        className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-purple-600 text-white border-purple-500"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                        }`}
                        title="Compare creator"
                      >
                        <Scale className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {creator.bio}
                    </p>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Followers</span>
                        <strong className="text-slate-200">{formatNumber(creator.followers)}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Engagement</span>
                        <strong className="text-blue-400">{creator.engagementRate}%</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">TrustScore</span>
                        <strong className="text-emerald-400">{creator.trustScore}/100</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">
                      Starting at <strong className="text-slate-200">${creator.startingRate}</strong>
                    </span>
                    <Link
                      href={`/creators/${creator.id}`}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                    >
                      <span>Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Creator</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Followers</th>
                    <th className="py-3 px-4 text-right">Engagement</th>
                    <th className="py-3 px-4 text-right">TrustScore</th>
                    <th className="py-3 px-4 text-right">Rate</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {creators.map((creator) => (
                    <tr key={creator.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={creator.avatar}
                            alt={creator.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                          />
                          <div>
                            <Link href={`/creators/${creator.id}`} className="font-bold text-slate-100 hover:text-blue-400">
                              {creator.username}
                            </Link>
                            <span className="text-[11px] text-slate-400 block">{creator.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{creator.category}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-200">{formatNumber(creator.followers)}</td>
                      <td className="py-3 px-4 text-right font-bold text-blue-400">{creator.engagementRate}%</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">{creator.trustScore}/100</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-200">${creator.startingRate}</td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          href={`/creators/${creator.id}`}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-[11px]"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
