"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MOCK_INFLUENCERS } from "@/data/mockInfluencers";
import { Category, Platform, RiskLevel } from "@/types/influencer";
import { RiskBadge } from "@/components/common/RiskBadge";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import { formatNumber, getScoreColor } from "@/lib/utils";
import {
  Search,
  Filter,
  Grid,
  List,
  Scale,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Check,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";

export default function InfluencersDirectoryPage() {
  const router = useRouter();

  // Filters state
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRisk, setSelectedRisk] = useState<string>("all");
  const [minTrustScore, setMinTrustScore] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"trust_desc" | "risk_asc" | "engagement_desc" | "followers_desc">("trust_desc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Comparison selection state
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>(["alexfitness", "beautybymia"]);

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

  // Filter & Sort logic
  const filteredInfluencers = MOCK_INFLUENCERS.filter((inf) => {
    const matchesSearch =
      inf.username.toLowerCase().includes(search.toLowerCase()) ||
      inf.name.toLowerCase().includes(search.toLowerCase()) ||
      inf.bio.toLowerCase().includes(search.toLowerCase());
    const matchesPlatform = selectedPlatform === "all" || inf.platform === selectedPlatform;
    const matchesCategory = selectedCategory === "all" || inf.category === selectedCategory;
    const matchesRisk = selectedRisk === "all" || inf.riskLevel === selectedRisk;
    const matchesTrust = inf.trustScore >= minTrustScore;
    const matchesVerified = !verifiedOnly || inf.verifiedBadge;

    return matchesSearch && matchesPlatform && matchesCategory && matchesRisk && matchesTrust && matchesVerified;
  }).sort((a, b) => {
    if (sortBy === "trust_desc") return b.trustScore - a.trustScore;
    if (sortBy === "risk_asc") return a.inflatedEngagementProbability - b.inflatedEngagementProbability;
    if (sortBy === "engagement_desc") return b.engagementRate - a.engagementRate;
    if (sortBy === "followers_desc") return b.followers - a.followers;
    return 0;
  });

  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      <DashboardHeader
        title="Influencer Intelligence Directory"
        subtitle="Search and benchmark 15+ micro- and nano-creators across 8 categories"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Control Bar: Search, View Mode, Filters */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by username, real name, or niche keywords..."
                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-xs font-semibold text-slate-900 placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>

            {/* Sort & View Mode Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden"
                >
                  <option value="trust_desc">Highest TrustScore</option>
                  <option value="risk_asc">Lowest Risk (Est. Inflated %)</option>
                  <option value="engagement_desc">Highest Engagement Rate</option>
                  <option value="followers_desc">Most Followers</option>
                </select>
              </div>

              {/* Grid / Table View Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "grid" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "table" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Pills Toolbar */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
            {/* Platform filter */}
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-400 uppercase text-[10px]">Platform:</span>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
              >
                <option value="all">All Platforms</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-400 uppercase text-[10px]">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
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
            </div>

            {/* Risk filter */}
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-400 uppercase text-[10px]">Risk Tier:</span>
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
              >
                <option value="all">All Risk Levels</option>
                <option value="Low">Low Risk</option>
                <option value="Moderate">Moderate Risk</option>
                <option value="High">High Risk</option>
                <option value="Critical">Critical Risk</option>
              </select>
            </div>

            {/* Verified Only Toggle */}
            <label className="flex items-center gap-1.5 ml-auto text-slate-700 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Verified Creators Only</span>
            </label>
          </div>
        </div>

        {/* Floating Side-by-Side Compare Bar (when 2+ selected) */}
        {selectedForCompare.length > 0 && (
          <div className="sticky top-20 z-20 bg-slate-900 text-white rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-800">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-400 shrink-0" />
              <span className="text-xs font-bold">
                {selectedForCompare.length} Creator{selectedForCompare.length > 1 ? "s" : ""} selected for side-by-side comparison:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedForCompare.map((id) => {
                  const match = MOCK_INFLUENCERS.find((c) => c.id === id);
                  return (
                    <span key={id} className="px-2 py-0.5 bg-slate-800 rounded text-xs font-semibold text-blue-300">
                      {match?.username || `@${id}`}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedForCompare([])}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleLaunchCompare}
                disabled={selectedForCompare.length < 2}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Launch Radar Comparison</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Influencer Grid View */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInfluencers.map((inf) => {
              const color = getScoreColor(inf.trustScore);
              const isSelected = selectedForCompare.includes(inf.id);
              return (
                <div
                  key={inf.id}
                  className={`bg-white rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between hover:shadow-md ${
                    isSelected ? "border-blue-600 ring-2 ring-blue-600/20" : "border-slate-200/90"
                  }`}
                >
                  <div>
                    {/* Header bar */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={inf.avatar}
                          alt={inf.name}
                          className="w-13 h-13 rounded-2xl object-cover ring-2 ring-slate-100"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-slate-900 text-base">{inf.username}</h3>
                            <PlatformIcon platform={inf.platform} size="sm" />
                          </div>
                          <p className="text-xs text-slate-500">{inf.name} • {inf.category}</p>
                        </div>
                      </div>

                      <label className="cursor-pointer" title="Select to compare">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCompare(inf.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </label>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-slate-600 mt-3.5 line-clamp-2 leading-relaxed">
                      {inf.bio}
                    </p>

                    {/* Verification Status */}
                    <div className="mt-3">
                      <VerificationBadge isVerified={inf.verifiedBadge} size="sm" />
                    </div>

                    {/* TrustScore & Probability Gauge Pill */}
                    <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">TrustScore</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-extrabold text-slate-900">{inf.trustScore}</span>
                          <span className="text-xs text-slate-400 font-medium">/100</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Inflated Risk</span>
                        <span className="text-sm font-bold text-slate-800">{inf.inflatedEngagementProbability}%</span>
                      </div>
                    </div>

                    {/* Metric Row */}
                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                        <span className="text-[10px] text-slate-400 font-medium block">Followers</span>
                        <span className="font-bold text-slate-900">{formatNumber(inf.followers)}</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                        <span className="text-[10px] text-slate-400 font-medium block">Engagement</span>
                        <span className="font-bold text-slate-900">{inf.engagementRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <RiskBadge risk={inf.riskLevel} size="sm" />
                    <Link
                      href={`/dashboard/influencer/${inf.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <span>Full Analysis</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Influencer Table View */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-8"></th>
                    <th className="py-3 px-4">Creator</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Followers</th>
                    <th className="py-3 px-4">TrustScore</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4">Engagement</th>
                    <th className="py-3 px-4">Comment Diversity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInfluencers.map((inf) => (
                    <tr key={inf.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={selectedForCompare.includes(inf.id)}
                          onChange={() => toggleCompare(inf.id)}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <Link href={`/dashboard/influencer/${inf.id}`} className="flex items-center gap-2.5">
                          <img src={inf.avatar} alt={inf.name} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <span className="font-bold text-slate-900 block">{inf.username}</span>
                            <span className="text-[10px] text-slate-400">{inf.name}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{inf.category}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{formatNumber(inf.followers)}</td>
                      <td className="py-3.5 px-4 font-extrabold text-blue-700 text-sm">{inf.trustScore}/100</td>
                      <td className="py-3.5 px-4">
                        <RiskBadge risk={inf.riskLevel} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{inf.engagementRate}%</td>
                      <td className="py-3.5 px-4 font-medium text-emerald-700">
                        {inf.commentQuality.uniqueCommentsPercent}% Unique
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/dashboard/influencer/${inf.id}`}
                          className="px-3 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold rounded-lg transition-colors text-xs inline-block"
                        >
                          Report
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
