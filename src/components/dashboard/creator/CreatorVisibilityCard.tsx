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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">
            Marketplace Visibility
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{isProfilePublic ? "Public & Listed" : "Unlisted"}</span>
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <span className="text-slate-500">Discoverability Status</span>
          <strong className="text-slate-800 font-bold">
            {isProfilePublic ? "Search Indexed" : "Incomplete Profile"}
          </strong>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <span className="text-slate-500">Availability</span>
          <strong className={isAvailable ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
            {creator.availabilityStatus === "AVAILABLE_FOR_COLLABORATION"
              ? "Available for Collabs"
              : creator.availabilityStatus === "NOT_AVAILABLE"
              ? "Not Available"
              : "Open to Work"}
          </strong>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <span className="text-slate-500">Primary Social Channel</span>
          <strong className="text-slate-800 font-bold uppercase">
            {creator.platform || "Instagram"}
          </strong>
        </div>
      </div>

      <div className="pt-1">
        <Link
          href="/dashboard/creator/profile"
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Settings className="w-3.5 h-3.5 text-slate-500" />
          <span>Manage Visibility &amp; Status</span>
        </Link>
      </div>
    </div>
  );
}
