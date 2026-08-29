"use client";

import React from "react";
import Link from "next/link";
import { SponsoredAd } from "@/types/creator";
import { ExternalLink, Sparkles, ShieldCheck } from "lucide-react";

interface SponsoredBusinessCardProps {
  ad: SponsoredAd;
  compact?: boolean;
  className?: string;
}

export function SponsoredBusinessCard({
  ad,
  compact = false,
  className = "",
}: SponsoredBusinessCardProps) {
  return (
    <div
      className={`group relative bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-sm ${className}`}
    >
      {/* Top subtle glow line on hover */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Header: Badge & Category */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="w-2.5 h-2.5" />
            {ad.badgeText}
          </span>
          <span className="text-[11px] font-medium text-slate-400 truncate">
            {ad.category}
          </span>
        </div>

        {/* Business Info: Logo + Name */}
        <div className="flex items-center gap-3 mb-2">
          <img
            src={ad.businessLogo}
            alt={ad.businessName}
            className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0"
          />
          <div className="min-w-0">
            <h4 className="font-bold text-slate-100 text-sm group-hover:text-blue-400 transition-colors truncate">
              {ad.businessName}
            </h4>
            <p className="text-xs text-slate-400 line-clamp-1">
              {ad.tagline}
            </p>
          </div>
        </div>

        {/* Description */}
        {!compact && (
          <p className="text-xs text-slate-300/80 leading-relaxed mb-3 line-clamp-2">
            {ad.description}
          </p>
        )}
      </div>

      {/* Footer CTA & Disclaimer */}
      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2 mt-1">
        <span className="text-[10px] text-slate-500 flex items-center gap-1" title="Paid sponsorships do not affect creator TrustScores">
          <ShieldCheck className="w-3 h-3 text-slate-400" />
          <span>Independent ranking</span>
        </span>

        <Link
          href={ad.ctaLink}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
        >
          <span>{ad.ctaText}</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
