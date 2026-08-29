"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MOCK_CREATORS } from "@/data/mockCreators";
import { Creator } from "@/types/creator";
import { Platform, Category } from "@/types/influencer";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { CollaborationModal } from "./CollaborationModal";
import { formatNumber } from "@/lib/utils";
import {
  Trophy,
  Filter,
  ArrowRight,
  Sparkles,
  Info,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

interface TrustScoreLeaderboardProps {
  initialLimit?: number;
  showFilters?: boolean;
  className?: string;
}

export function TrustScoreLeaderboard({
  initialLimit = 10,
  showFilters = true,
  className = "",
}: TrustScoreLeaderboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState<"month" | "all">("month");
  const [selectedCollabCreator, setSelectedCollabCreator] = useState<Creator | null>(null);

  const categories = [
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

  // Filter and sort by TrustScore (descending)
  const filteredCreators = MOCK_CREATORS.filter((c) => {
    if (selectedCategory !== "all" && c.category !== selectedCategory) return false;
    if (selectedPlatform !== "all" && c.platform !== selectedPlatform) return false;
    return true;
  }).sort((a, b) => b.trustScore - a.trustScore);

  const displayedCreators = initialLimit ? filteredCreators.slice(0, initialLimit) : filteredCreators;

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
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
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
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 focus:outline-hidden"
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
            </select>

            <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setSelectedTimeframe("month")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedTimeframe === "month" ? "bg-slate-800 text-slate-100 font-bold" : "text-slate-500"
                }`}
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => setSelectedTimeframe("all")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedTimeframe === "all" ? "bg-slate-800 text-slate-100 font-bold" : "text-slate-500"
                }`}
              >
                All Time
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
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

            <tbody className="divide-y divide-slate-800/60">
              {displayedCreators.map((creator, idx) => {
                const rank = idx + 1;
                return (
                  <tr
                    key={creator.id}
                    className="hover:bg-slate-850/60 transition-colors group"
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
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700 group-hover:border-blue-500/50 transition-colors"
                          />
                        </Link>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/creators/${creator.id}`}
                              className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors truncate block"
                            >
                              {creator.username}
                            </Link>
                            {creator.verifiedBadge && <VerificationBadge size="sm" showText={false} />}
                          </div>
                          <span className="text-[11px] text-slate-400 truncate block">
                            {creator.name} • {creator.location.split(",")[0]}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50 text-[11px]">
                        {creator.category}
                      </span>
                    </td>

                    {/* Platform Icon */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex p-1.5 bg-slate-950 rounded-lg border border-slate-800">
                        <PlatformIcon platform={creator.platform} size="sm" />
                      </div>
                    </td>

                    {/* Followers */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                      {formatNumber(creator.followers)}
                    </td>

                    {/* Engagement Rate */}
                    <td className="py-3.5 px-4 text-right font-bold text-blue-400">
                      {creator.engagementRate}%
                    </td>

                    {/* Authenticity Probability */}
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                      {creator.authenticityProbability ? `${creator.authenticityProbability.toFixed(0)}%` : `${100 - creator.inflatedEngagementProbability}%`}
                    </td>

                    {/* TrustScore */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-baseline gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-extrabold text-sm">
                        <span>{creator.trustScore}</span>
                        <span className="text-[10px] text-blue-300/60 font-semibold">/100</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/creators/${creator.id}`}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] transition-colors"
                        >
                          Profile
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSelectedCollabCreator(creator)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
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

        {/* Leaderboard Callout / Educational Footer */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5 text-xs text-slate-400">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong className="text-slate-200">Follower count isn&apos;t everything.</strong> TrustScore ranks creators using authenticity and engagement quality signals, helping businesses discover partners based on trust rather than audience vanity metrics alone.
            </p>
          </div>

          <Link
            href="/creators"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 whitespace-nowrap"
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
