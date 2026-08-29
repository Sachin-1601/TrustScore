"use client";

import React from "react";
import Link from "next/link";
import { Business } from "@/types/creator";
import {
  Building2,
  MapPin,
  Sparkles,
  ExternalLink,
  Briefcase,
  ArrowRight,
} from "lucide-react";

interface BusinessCardProps {
  business: Business;
}

export function BusinessCard({ business }: BusinessCardProps) {
  return (
    <div className="group relative bg-slate-900/85 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md">
      <div>
        {/* Header: Logo, Name & Sponsored Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <img
              src={business.logo}
              alt={business.name}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-800 shrink-0 group-hover:border-blue-500/50 transition-colors"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/businesses/${business.slug}`}
                  className="font-bold text-slate-100 text-base hover:text-blue-400 transition-colors truncate block"
                >
                  {business.name}
                </Link>
                {business.isSponsored && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    Sponsored
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">{business.category}</p>
            </div>
          </div>
        </div>

        {/* Location & Tagline */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{business.location}</span>
        </div>

        <p className="text-xs text-slate-300/90 line-clamp-2 leading-relaxed mb-4">
          {business.description}
        </p>

        {/* Open Opportunities Box */}
        {business.openOpportunities && business.openOpportunities.length > 0 && (
          <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 mb-4 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span className="flex items-center gap-1 text-blue-400">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Open Opportunity:</span>
              </span>
              <span className="text-emerald-400 font-extrabold">
                {business.openOpportunities[0].budget}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-200 line-clamp-1">
              {business.openOpportunities[0].title}
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
        <span className="text-slate-500 font-semibold text-[11px]">
          {business.activeCampaignsCount} Active Campaigns
        </span>

        <Link
          href={`/businesses/${business.slug}`}
          className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold transition-colors flex items-center gap-1.5"
        >
          <span>View Business</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
