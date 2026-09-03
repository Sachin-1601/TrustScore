"use client";

import React from "react";

export function CreatorCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 animate-pulse shadow-xs">
      {/* Top row: Avatar + Identity + Score Ring */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-xl bg-slate-200 shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-28 bg-slate-200 rounded-md" />
            <div className="h-3 w-20 bg-slate-100 rounded-md" />
            <div className="h-2.5 w-16 bg-slate-100 rounded-md" />
          </div>
        </div>

        {/* Score indicator skeleton */}
        <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0" />
      </div>

      {/* Bio line skeleton */}
      <div className="space-y-1.5 py-1">
        <div className="h-3 w-full bg-slate-100 rounded-md" />
        <div className="h-3 w-4/5 bg-slate-100 rounded-md" />
      </div>

      {/* 3 Metrics Box Skeleton */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="space-y-1 text-center">
          <div className="h-2 w-10 bg-slate-200 rounded mx-auto" />
          <div className="h-3.5 w-12 bg-slate-200 rounded mx-auto" />
        </div>
        <div className="space-y-1 text-center">
          <div className="h-2 w-10 bg-slate-200 rounded mx-auto" />
          <div className="h-3.5 w-10 bg-slate-200 rounded mx-auto" />
        </div>
        <div className="space-y-1 text-center">
          <div className="h-2 w-10 bg-slate-200 rounded mx-auto" />
          <div className="h-3.5 w-12 bg-slate-200 rounded mx-auto" />
        </div>
      </div>

      {/* Insight & Tags Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-5 w-24 bg-slate-100 rounded-md" />
        <div className="h-5 w-20 bg-slate-100 rounded-md" />
      </div>

      {/* Action buttons skeleton */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="h-9 flex-1 bg-slate-100 rounded-xl" />
        <div className="h-9 w-24 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}

