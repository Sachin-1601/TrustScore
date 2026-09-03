"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Creator } from "@/types/creator";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { CollaborationModal } from "./CollaborationModal";
import { formatNumber } from "@/lib/utils";
import {
  ArrowRight,
  Info,
  Loader2,
} from "lucide-react";

interface TrustScoreLeaderboardProps {
  initialLimit?: number;
  showFilters?: boolean;
  className?: string;
}

const CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "Fitness", label: "Fitness" },
  { id: "Beauty", label: "Beauty" },
  { id: "Fashion", label: "Fashion" },
  { id: "Travel", label: "Travel" },
  { id: "Food", label: "Food" },
  { id: "Technology", label: "Technology" },
  { id: "Gaming", label: "Gaming" },
  { id: "Lifestyle", label: "Lifestyle" },
];

export function TrustScoreLeaderboard({
  initialLimit = 10,
  showFilters = true,
  className = "",
}: TrustScoreLeaderboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState<"month" | "all">("month");
  const [selectedCollabCreator, setSelectedCollabCreator] = useState<Creator | null>(null);

  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedPlatform && selectedPlatform !== "all") params.set("platform", selectedPlatform);
      if (initialLimit) params.set("limit", String(initialLimit));

      const res = await fetch(`/api/leaderboard?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCreators(data.leaderboard || []);
      }
    } catch {
      // Network error
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedPlatform, initialLimit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-base" title="1st Place (Gold)">🥇</span>;
    if (rank === 2) return <span className="text-base" title="2nd Place (Silver)">🥈</span>;
    if (rank === 3) return <span className="text-base" title="3rd Place (Bronze)">🥉</span>;
    return <span className="text-xs font-bold text-slate-500">{rank}</span>;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters Header */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Timeframe & Platform Switcher */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden shadow-xs cursor-pointer"
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
            </select>

            <div className="flex items-center bg-slate-50 border border-slate-200 p-0.5 rounded-xl text-xs shadow-xs">
              <button
                type="button"
                onClick={() => setSelectedTimeframe("month")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedTimeframe === "month" ? "bg-white text-slate-900 font-bold shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => setSelectedTimeframe("all")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedTimeframe === "all" ? "bg-white text-slate-900 font-bold shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                All Time
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs font-semibold text-slate-500">Loading verified leaderboard rankings...</span>
          </div>
        ) : creators.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No creators found meeting the criteria for this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">Rank</th>
                  <th className="py-3.5 px-4">Creator</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center">Platform</th>
                  <th className="py-3.5 px-4 text-right">Followers</th>
                  <th className="py-3.5 px-4 text-right">Eng. Rate</th>
                  <th className="py-3.5 px-4 text-right">Authenticity</th>
                  <th className="py-3.5 px-4 text-right">TrustScore</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {creators.map((creator, idx) => {
                  const rank = idx + 1;
                  return (
                    <tr
                      key={creator.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-center font-bold">
                        {getRankBadge(rank)}
                      </td>

                      {/* Creator Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Link href={`/creators/${creator.id}`} className="shrink-0">
                            <img
                              src={creator.avatar}
                              alt={creator.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 group-hover:border-blue-500 transition-colors"
                            />
                          </Link>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/creators/${creator.id}`}
                                className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate block"
                              >
                                {creator.username}
                              </Link>
                              {creator.verifiedBadge && <VerificationBadge size="sm" showText={false} />}
                            </div>
                            <span className="text-[11px] text-slate-500 truncate block">
                              {creator.name} • {creator.location.split(",")[0]}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200 text-[11px]">
                          {creator.category}
                        </span>
                      </td>

                      {/* Platform Icon */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                          <PlatformIcon platform={creator.platform} size="sm" />
                        </div>
                      </td>

                      {/* Followers */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                        {formatNumber(creator.followers)}
                      </td>

                      {/* Engagement Rate */}
                      <td className="py-3.5 px-4 text-right font-bold text-blue-600">
                        {creator.engagementRate}%
                      </td>

                      {/* Authenticity Probability */}
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                        {creator.authenticityProbability ? `${creator.authenticityProbability.toFixed(0)}%` : `${100 - creator.inflatedEngagementProbability}%`}
                      </td>

                      {/* TrustScore */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-baseline gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-extrabold text-sm">
                          <span>{creator.trustScore}</span>
                          <span className="text-[10px] text-blue-500 font-semibold">/100</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/creators/${creator.id}`}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200 transition-colors"
                          >
                            Profile
                          </Link>
                          <button
                            type="button"
                            onClick={() => setSelectedCollabCreator(creator)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
                          >
                            Collab
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Leaderboard Callout / Educational Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5 text-xs text-slate-600">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong className="text-slate-900">Follower count isn&apos;t everything.</strong> TrustScore ranks creators using authenticity and engagement quality signals, helping businesses discover partners based on trust rather than audience vanity metrics alone.
            </p>
          </div>

          <Link
            href="/creators"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline whitespace-nowrap"
          >
            <span>Explore All Creators</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {selectedCollabCreator && (
        <CollaborationModal
          creator={selectedCollabCreator}
          isOpen={!!selectedCollabCreator}
          onClose={() => setSelectedCollabCreator(null)}
        />
      )}
    </div>
  );
}

