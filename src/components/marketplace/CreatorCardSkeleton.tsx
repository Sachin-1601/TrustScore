"use client";

import React from "react";

export function CreatorCardSkeleton() {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 animate-pulse">
      {/* Top row: Avatar + Identity + Score Ring */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-slate-800 shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-28 bg-slate-800 rounded-md" />
            <div className="h-3 w-20 bg-slate-800/60 rounded-md" />
            <div className="h-2.5 w-16 bg-slate-800/40 rounded-md" />
          </div>
        </div>

        {/* Score indicator skeleton */}
        <div className="w-12 h-12 rounded-full bg-slate-800/80 shrink-0" />
      </div>

      {/* Bio line skeleton */}
      <div className="space-y-1.5 py-1">
        <div className="h-3 w-full bg-slate-800/60 rounded-md" />
        <div className="h-3 w-4/5 bg-slate-800/40 rounded-md" />
      </div>

      {/* 3 Metrics Box Skeleton */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80">
        <div className="space-y-1 text-center">
          <div className="h-2 w-10 bg-slate-800/50 rounded mx-auto" />
          <div className="h-3.5 w-12 bg-slate-800 rounded mx-auto" />
        </div>
        <div className="space-y-1 text-center">
          <div className="h-2 w-10 bg-slate-800/50 rounded mx-auto" />
          <div className="h-3.5 w-10 bg-slate-800 rounded mx-auto" />
        </div>
        <div className="space-y-1 text-center">
          <div className="h-2 w-10 bg-slate-800/50 rounded mx-auto" />
          <div className="h-3.5 w-12 bg-slate-800 rounded mx-auto" />
        </div>
      </div>

      {/* Insight & Tags Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-5 w-24 bg-slate-800/60 rounded-md" />
        <div className="h-5 w-20 bg-slate-800/40 rounded-md" />
      </div>

      {/* Action buttons skeleton */}
      <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between gap-2">
        <div className="h-9 flex-1 bg-slate-800/60 rounded-xl" />
        <div className="h-9 w-24 bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
