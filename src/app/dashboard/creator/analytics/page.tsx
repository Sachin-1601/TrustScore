"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ScoreGauge } from "@/components/common/ScoreGauge";
import { useAuth } from "@/contexts/AuthContext";
import { Creator } from "@/types/creator";
import {
  TrendingUp,
  ShieldCheck,
  Sparkles,
  BarChart3,
  MessageSquare,
  Users,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function CreatorAnalyticsPage() {
  const { user } = useAuth();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCreator() {
      try {
        const userId = user?.id || "user-alex-creator";
        const res = await fetch(`/api/creators/me?userId=${userId}`);
        const data = await res.json();
        if (data.creator) {
          setCreator(data.creator);
        }
      } catch (err) {
        console.error("Failed to load creator analytics", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCreator();
  }, [user]);

  const active = creator || {
    id: "alexfitness",
    username: "@alexfitness",
    name: "Alex Rivera",
    followers: 32400,
    following: 684,
    totalPosts: 342,
    avgLikes: 1450,
    avgComments: 105,
    avgViews: 8900,
    engagementRate: 4.8,
    trustScore: 97,
    scoreBand: "Very High Trust",
    riskLevel: "Low",
    inflatedEngagementProbability: 3.2,
    uncertaintyMargin: 1.2,
    authenticityProbability: 96.8,
    commentDiversityPercent: 89,
    growthStabilityScore: 96,
    engagementConsistencyScore: 95,
    subScores: {
      followerAuthenticity: 98,
      engagementAuthenticity: 96,
      commentQuality: 97,
      growthPattern: 98,
      engagementConsistency: 96,
    },
    positiveFactors: [
      "Verified direct Instagram Graph API telemetry",
      "Consistent organic follower accumulation curve",
      "High lexical comment diversity with zero bot cluster markers",
    ],
  };

  const subScoreItems = [
    { label: "Follower Authenticity", score: active.subScores?.followerAuthenticity || 98, desc: "Real human account proportion" },
    { label: "Engagement Authenticity", score: active.subScores?.engagementAuthenticity || 96, desc: "Like & view distribution naturalness" },
    { label: "Comment Diversity", score: active.subScores?.commentQuality || 97, desc: "Lexical entropy & conversation richness" },
    { label: "Growth Trajectory", score: active.subScores?.growthPattern || 98, desc: "Absence of artificial follower purchase spikes" },
    { label: "Consistency Score", score: active.subScores?.engagementConsistency || 96, desc: "Long-term engagement stability across 48 posts" },
  ];

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Creator TrustScore &amp; Telemetry Analytics"
        subtitle="Deep-dive into your verified audience signals, Bayesian authenticity scores, and engagement stability"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Top Split: Master Score Card & Key Signal Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center space-y-4 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Verified Master TrustScore
            </span>
            <ScoreGauge
              score={active.trustScore}
              size="xl"
              inflatedProbability={active.inflatedEngagementProbability}
              uncertaintyMargin={active.uncertaintyMargin}
            />
            <div className="text-center space-y-1">
              <span className="text-base font-bold text-slate-100">{active.scoreBand}</span>
              <p className="text-xs text-slate-400">
                Estimated Authenticity: <strong className="text-emerald-400">{active.authenticityProbability}%</strong>
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div>
              <h4 className="font-bold text-slate-100 text-base">5 Core Authenticity Sub-Scores</h4>
              <p className="text-xs text-slate-400">
                Calibrated against 100,000+ creators across Australian and global creator verticals
              </p>
            </div>

            <div className="space-y-3.5">
              {subScoreItems.map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-200">{item.label}</span>
                      <span className="text-[11px] text-slate-500 ml-2">({item.desc})</span>
                    </div>
                    <span className="font-black text-blue-400">{item.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Positive Authenticity Indicators */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-slate-100 text-base">Key Authenticity Factors Identified</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Natural Comment Lexicon</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                89% lexical entropy. Comments contain contextual, meaningful questions and feedback rather than generic emoji spam.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero Pod Activity</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Engagement timing analysis reveals naturally distributed likes without reciprocal pod ring spikes.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Steady Follower Growth</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Follower trajectory aligns with organic viral discovery peaks without overnight unexplainable 10k jumps.
              </p>
            </div>
          </div>
        </div>

        {/* Connected Channels & Empty States for Unlinked Platforms */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div>
            <h4 className="font-bold text-slate-100 text-base">Multi-Platform Telemetry Status</h4>
            <p className="text-xs text-slate-400">
              Connect additional social accounts to consolidate your TrustScore dossier
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Instagram (Connected) */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-blue-500/30 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-sm">Instagram Graph API</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Connected
                  </span>
                </div>
                <span className="text-xs text-slate-400 block">{active.username} • 32.4K Followers</span>
              </div>
              <span className="text-[11px] text-slate-500">Synced: Today, 08:30 AM</span>
            </div>

            {/* TikTok (Unlinked State) */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-sm">TikTok Creator API</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700">
                    Not Linked
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Connect your TikTok account to unlock video completion and sound velocity analytics.
                </p>
              </div>
              <Link
                href="/dashboard/creator/verification"
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>Connect TikTok</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* YouTube (Unlinked State) */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-sm">YouTube Partner API</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700">
                    Not Linked
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Connect your YouTube channel to unlock retention duration and subscriber watch hours.
                </p>
              </div>
              <Link
                href="/dashboard/creator/verification"
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>Connect YouTube</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
