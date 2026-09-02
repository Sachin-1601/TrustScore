"use client";

import React from "react";
import Link from "next/link";
import { Creator } from "@/types/creator";
import { Eye, ShieldCheck, ArrowRight, Settings, CheckCircle2, Lock } from "lucide-react";

interface CreatorVisibilityCardProps {
  creator: Creator;
}

export function CreatorVisibilityCard({ creator }: CreatorVisibilityCardProps) {
  const isProfilePublic = Boolean(creator.name && creator.category);
  const isAvailable = creator.availabilityStatus !== "NOT_AVAILABLE";

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-400" />
          <h3 className="text-base font-bold text-slate-100">
            Marketplace Visibility
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{isProfilePublic ? "Public & Listed" : "Unlisted"}</span>
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Discoverability Status</span>
          <strong className="text-slate-200 font-bold">
            {isProfilePublic ? "Search Indexed" : "Incomplete Profile"}
          </strong>
        </div>

        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Availability</span>
          <strong className={isAvailable ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
            {creator.availabilityStatus === "AVAILABLE_FOR_COLLABORATION"
              ? "Available for Collabs"
              : creator.availabilityStatus === "NOT_AVAILABLE"
              ? "Not Available"
              : "Open to Work"}
          </strong>
        </div>

        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Primary Social Channel</span>
          <strong className="text-slate-200 font-bold uppercase">
            {creator.platform || "Instagram"}
          </strong>
        </div>
      </div>

      <div className="pt-1">
        <Link
          href="/dashboard/creator/profile"
          className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span>Manage Visibility &amp; Status</span>
        </Link>
      </div>
    </div>
  );
}
