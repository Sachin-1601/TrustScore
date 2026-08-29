"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MOCK_CREATORS } from "@/data/mockCreators";
import { MOCK_COLLABORATION_REQUESTS } from "@/data/mockCollaborations";
import { CreatorMarketplaceCard } from "@/components/marketplace/CreatorMarketplaceCard";
import { RiskBadge } from "@/components/common/RiskBadge";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import { formatNumber } from "@/lib/utils";
import {
  Users,
  Bookmark,
  Send,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
  DollarSign,
  Activity,
} from "lucide-react";

export default function DashboardOverviewPage() {
  const recommendedCreators = MOCK_CREATORS.filter((c) => c.trustScore >= 90).slice(0, 3);
  const recentCollaborations = MOCK_COLLABORATION_REQUESTS.slice(0, 3);

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Business Dashboard Overview"
        subtitle="Manage authentic creator discovery, campaign proposals, and budget risk allocation"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* 4 Core Marketplace Overview KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Creators Viewed
              </span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-black text-slate-100">142</p>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+24% this week</span>
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Saved Creators
              </span>
              <Bookmark className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-3xl font-black text-slate-100">4</p>
            <Link href="/dashboard/saved" className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold">
              View shortlisted →
            </Link>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Collaboration Requests
              </span>
              <Send className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-3xl font-black text-slate-100">{MOCK_COLLABORATION_REQUESTS.length}</p>
            <Link href="/dashboard/collaborations" className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold">
              Manage proposals →
            </Link>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Protected Budget
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-emerald-400">$18,450</p>
            <span className="text-[11px] text-slate-400">Via probabilistic fraud defense</span>
          </div>
        </div>

        {/* Recommended Creators Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <span>Recommended Authentic Creators</span>
              </h3>
              <p className="text-xs text-slate-400">
                High-converting micro-influencers with 90+ TrustScores and verified low volatility
              </p>
            </div>

            <Link
              href="/creators"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommendedCreators.map((creator) => (
              <CreatorMarketplaceCard key={creator.id} creator={creator} />
            ))}
          </div>
        </section>

        {/* Split Grid: Recent Collaboration Proposals & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Recent Collaborations */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" />
                <span>Recent Collaboration Proposals</span>
              </h4>
              <Link href="/dashboard/collaborations" className="text-xs font-bold text-blue-400">
                View all ({MOCK_COLLABORATION_REQUESTS.length})
              </Link>
            </div>

            <div className="divide-y divide-slate-800/60">
              {recentCollaborations.map((collab) => (
                <div key={collab.id} className="py-3 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={collab.creatorAvatar}
                      alt={collab.creatorUsername}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <span className="font-bold text-slate-100 block">{collab.creatorUsername}</span>
                      <span className="text-slate-400 text-[11px]">{collab.campaignName}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-emerald-400 block">${collab.budget} USD</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400">
                      {collab.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions & Search */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Quick Actions</span>
            </h4>

            <div className="space-y-2 text-xs">
              <Link
                href="/dashboard/analyze"
                className="p-3.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-2xl flex items-center justify-between transition-colors group"
              >
                <div>
                  <span className="font-bold text-slate-200 block group-hover:text-blue-400">
                    Analyze Any Creator Handle
                  </span>
                  <span className="text-slate-400 text-[11px]">Audit Instagram, TikTok or YouTube profile</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/dashboard/compare"
                className="p-3.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-2xl flex items-center justify-between transition-colors group"
              >
                <div>
                  <span className="font-bold text-slate-200 block group-hover:text-blue-400">
                    Compare Creators Matrix
                  </span>
                  <span className="text-slate-400 text-[11px]">Multi-dimensional 5-axis radar evaluation</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/dashboard/advertise"
                className="p-3.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-2xl flex items-center justify-between transition-colors group"
              >
                <div>
                  <span className="font-bold text-amber-400 block">
                    Advertise Your Business
                  </span>
                  <span className="text-slate-400 text-[11px]">Put your brand in front of 50K+ creators</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
