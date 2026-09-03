"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import {
  Search,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Activity,
  CheckCircle2,
  Lock,
} from "lucide-react";

export function MarketplaceHero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/creators?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/creators");
    }
  };

  const quickPills = [
    { label: "Fitness creators", q: "Fitness" },
    { label: "Beauty creators", q: "Beauty" },
    { label: "Australian creators", q: "Australia" },
    { label: "TrustScore above 90", q: "90" },
  ];

  return (
    <div className="py-12 sm:py-16 text-center space-y-8 max-w-4xl mx-auto px-4">
      {/* Eyebrow Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-xs">
        <Sparkles className="w-3.5 h-3.5" />
        <span>THE TRUSTED CREATOR MARKETPLACE</span>
      </div>

      {/* Main Headline */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
          Discover creators <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
            you can trust.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          TrustScore helps ambitious businesses discover authentic micro- and nano-influencers, evaluate engagement quality, and launch high-performing collaborations.
        </p>
      </div>

      {/* Main Large Search Bar */}
      <div className="max-w-2xl mx-auto space-y-3">
        <form onSubmit={handleSearch} className="relative group">
          <div className="relative flex items-center bg-white border-2 border-slate-200 focus-within:border-blue-600 rounded-2xl shadow-xs overflow-hidden transition-all">
            <Search className="w-5 h-5 text-slate-400 ml-4.5 shrink-0 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creators, categories, platforms..."
              className="w-full py-4 px-3 bg-transparent text-slate-900 placeholder-slate-400 text-sm sm:text-base font-semibold focus:outline-hidden"
            />
            <button
              type="submit"
              className="m-2 py-2.5 px-5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>Search</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="text-[11px] text-slate-500 font-semibold">Try searching:</span>
          {quickPills.map((pill) => (
            <button
              key={pill.label}
              type="button"
              onClick={() => router.push(`/creators?q=${encodeURIComponent(pill.q)}`)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs transition-colors cursor-pointer shadow-xs"
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Prototype Stats Row */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>50K+ creators analyzed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Data-driven authenticity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-slate-400" />
            <span>Enterprise SLA Telemetry</span>
          </div>
        </div>
      </div>

      {/* Live-Looking Creator Discovery Preview Card */}
      <div className="max-w-md mx-auto pt-4 text-left">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden group">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                alt="Alex Rivera"
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-base">@alexfitness</span>
                  <VerificationBadge size="sm" showText={false} />
                </div>
                <p className="text-xs text-slate-500">Fitness • Melbourne, Australia</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">32.4K followers</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-3xl font-black text-blue-600 block leading-tight">97</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TRUSTSCORE</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>High Authenticity</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4 text-center text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Engagement</span>
              <span className="font-bold text-blue-600 text-sm">4.8%</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Comment Diversity</span>
              <span className="font-bold text-emerald-700 text-sm">89%</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Follower Growth</span>
              <span className="font-bold text-slate-800 text-sm">Stable</span>
            </div>
          </div>

          <Link
            href="/creators/alexfitness"
            className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <span>View Full Creator Profile &amp; Data Insights</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

