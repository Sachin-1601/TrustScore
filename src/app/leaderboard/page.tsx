"use client";

import React from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { TrustScoreLeaderboard } from "@/components/marketplace/TrustScoreLeaderboard";
import {
  Trophy,
  Award,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Info,
} from "lucide-react";

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white">
      <LandingNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Header Title */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>The Official Authenticity Index</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight">
            TrustScore Leaderboard
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            The most authentic creators on the TrustScore marketplace, evaluated through Bayesian sample-efficient engagement consistency, comment diversity, and follower stability.
          </p>
        </div>

        {/* Full Leaderboard Component */}
        <TrustScoreLeaderboard initialLimit={20} showFilters={true} />

        {/* Methodology Callout */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-slate-100">
              How the TrustScore Leaderboard Works
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="font-bold text-slate-200 block">1. Probabilistic Ranking</span>
              <p className="leading-relaxed text-[11px]">
                Creators are ranked by their calibrated TrustScore (0–100) rather than crude follower counts.
              </p>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="font-bold text-slate-200 block">2. Comment Quality Analysis</span>
              <p className="leading-relaxed text-[11px]">
                Lexical entropy filters reward thoughtful community discussions and penalize automated pod clusters.
              </p>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="font-bold text-slate-200 block">3. Growth Stability</span>
              <p className="leading-relaxed text-[11px]">
                Monitors 12-month Poisson step-jump filters to detect purchased follower anomalies.
              </p>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
