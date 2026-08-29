"use client";

import React from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ScoreGauge } from "@/components/common/ScoreGauge";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { MOCK_COLLABORATION_REQUESTS } from "@/data/mockCollaborations";
import {
  Sparkles,
  TrendingUp,
  Eye,
  Send,
  Briefcase,
  DollarSign,
  Share2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Clock,
} from "lucide-react";

export default function CreatorDashboardPage() {
  const myCollabs = MOCK_COLLABORATION_REQUESTS.slice(0, 3);

  const scoreHistory = [
    { month: "August 2026", score: 92, status: "Active (Current)" },
    { month: "July 2026", score: 89, status: "Stable" },
    { month: "June 2026", score: 87, status: "Initial Verification" },
  ];

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Creator Dashboard & Authenticity Dossier"
        subtitle="Manage your public marketplace presence, incoming brand proposals, and TrustScore telemetry"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Creator Hero Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"
                alt="Alex Rivera"
                className="w-18 h-18 sm:w-22 sm:h-22 rounded-3xl object-cover border-2 border-slate-700 shadow-md"
              />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-100">Alex Rivera</h3>
                  <VerificationBadge size="md" showText={false} />
                </div>
                <p className="text-xs text-slate-400 font-semibold">@alexfitness • Fitness &amp; Strength • Melbourne, Australia</p>
                <div className="flex items-center gap-2 text-xs pt-1">
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    Profile Complete (95%)
                  </span>
                  <span className="text-slate-400">Starting Rate: $350 USD</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/creators/alexfitness"
                className="px-4 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>View Public Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(window.location.origin + "/creators/alexfitness")}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Creator Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Marketplace Profile Views
            </span>
            <p className="text-3xl font-black text-slate-100">1,240</p>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+38% this month</span>
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Brand Proposals Received
            </span>
            <p className="text-3xl font-black text-slate-100">{myCollabs.length}</p>
            <span className="text-[11px] text-blue-400 font-semibold">2 Pending review</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Leaderboard Rank
            </span>
            <p className="text-3xl font-black text-amber-400">#1 🥇</p>
            <span className="text-[11px] text-slate-400">Fitness Vertical (Australia)</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Estimated Inflation Risk
            </span>
            <p className="text-3xl font-black text-emerald-400">3.2%</p>
            <span className="text-[11px] text-slate-400">Very High Trust Rating</span>
          </div>
        </div>

        {/* Center Split: Score Gauge & Historical Scores Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Score Gauge */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center space-y-4 shadow-sm">
            <h4 className="font-bold text-slate-100 text-sm">Calibrated Creator TrustScore</h4>
            <ScoreGauge score={92} size="xl" inflatedProbability={3.2} uncertaintyMargin={1.2} />
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 text-center leading-relaxed">
              Based on 48 analyzed posts over 12 months with verified Graph API connection.
            </div>
          </div>

          {/* Right: Score Evolution History */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h4 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>TrustScore Calculation History</span>
            </h4>
            <p className="text-xs text-slate-400">
              TrustScore is recalculated monthly to reflect audience growth and comment diversity trends.
            </p>

            <div className="space-y-3 pt-2">
              {scoreHistory.map((item, idx) => (
                <div
                  key={item.month}
                  className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center">
                      #{scoreHistory.length - idx}
                    </span>
                    <div>
                      <span className="font-bold text-slate-100 block">{item.month}</span>
                      <span className="text-[11px] text-slate-400">{item.status}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-black text-blue-400">{item.score}</span>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">TrustScore</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Incoming Brand Proposals */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span>Incoming Brand Sponsorship Proposals ({myCollabs.length})</span>
            </h4>
          </div>

          <div className="space-y-3">
            {myCollabs.map((collab) => (
              <div
                key={collab.id}
                className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h5 className="font-bold text-slate-100 text-sm">{collab.campaignName}</h5>
                  <span className="text-slate-400 text-xs">From {collab.businessName} • Deliverables: {collab.deliverables}</span>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-emerald-400 font-extrabold text-sm">${collab.budget} USD</span>
                  <Link
                    href="/dashboard/messages"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl"
                  >
                    Open Thread
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
