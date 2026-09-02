"use client";

import React from "react";
import { Creator } from "@/types/creator";
import { Users, Heart, MessageSquare, DollarSign, BarChart2, Eye, TrendingUp, Info } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface CreatorMetricsOverviewProps {
  creator: Creator;
}

export function CreatorMetricsOverview({ creator }: CreatorMetricsOverviewProps) {
  const hasHistory = creator.engagementHistory && creator.engagementHistory.length > 1;

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
          Audience &amp; Performance Telemetry
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">
          Source: {creator.platform ? creator.platform.toUpperCase() : "INSTAGRAM"} Verified API
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Followers */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Followers</span>
            <Users className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-100">
              {formatNumber(creator.followers || 0)}
            </div>
            <p className="text-[10px] text-slate-500 pt-0.5">
              {hasHistory ? "Verified audience size" : "Total followers"}
            </p>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Eng. Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              {creator.engagementRate > 0 ? `${creator.engagementRate.toFixed(1)}%` : "0.0%"}
            </div>
            <p className="text-[10px] text-slate-500 pt-0.5">
              Benchmark vs niche
            </p>
          </div>
        </div>

        {/* Avg Likes */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg. Likes</span>
            <Heart className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-100">
              {formatNumber(creator.avgLikes || 0)}
            </div>
            <p className="text-[10px] text-slate-500 pt-0.5">
              Per published post
            </p>
          </div>
        </div>

        {/* Avg Comments */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg. Comments</span>
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-100">
              {formatNumber(creator.avgComments || 0)}
            </div>
            <p className="text-[10px] text-slate-500 pt-0.5">
              Conversation volume
            </p>
          </div>
        </div>

        {/* Total Posts */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Posts</span>
            <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-100">
              {formatNumber(creator.totalPosts || 0)}
            </div>
            <p className="text-[10px] text-slate-500 pt-0.5">
              Analyzed catalog
            </p>
          </div>
        </div>

        {/* Starting Collab Rate */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Starting Rate</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              ${creator.startingRate || 0}
            </div>
            <p className="text-[10px] text-slate-500 pt-0.5">
              Base sponsorship fee
            </p>
          </div>
        </div>
      </div>

      {!hasHistory && (
        <div className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center gap-2 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Historical growth trend lines will populate automatically as successive engagement snapshots are recorded.</span>
        </div>
      )}
    </div>
  );
}
