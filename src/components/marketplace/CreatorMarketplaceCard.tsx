"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Creator } from "@/types/creator";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { RiskBadge } from "@/components/common/RiskBadge";
import { CollaborationModal } from "./CollaborationModal";
import { formatNumber, getScoreColor } from "@/lib/utils";
import {
  MapPin,
  TrendingUp,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface CreatorMarketplaceCardProps {
  creator: Creator;
  showCollaborateBtn?: boolean;
}

export function CreatorMarketplaceCard({
  creator,
  showCollaborateBtn = true,
}: CreatorMarketplaceCardProps) {
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const scoreColors = getScoreColor(creator.trustScore);

  return (
    <>
      <div className="group relative bg-slate-900/85 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/90 rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md hover:shadow-blue-950/20">
        <div>
          {/* Top Row: Avatar + Platform + TrustScore Ring */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-700 group-hover:border-blue-500/50 transition-colors"
                />
                <div className="absolute -bottom-1 -right-1 p-1 bg-slate-900 rounded-full border border-slate-800">
                  <PlatformIcon platform={creator.platform} size="sm" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/creators/${creator.id}`}
                    className="font-bold text-slate-100 text-sm hover:text-blue-400 transition-colors truncate block"
                  >
                    {creator.username}
                  </Link>
                  {creator.verifiedBadge && <VerificationBadge size="sm" showText={false} />}
                </div>
                <p className="text-xs text-slate-400 truncate">{creator.name}</p>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{creator.location}</span>
                </div>
              </div>
            </div>

            {/* TrustScore Badge Pill */}
            <div className="text-right shrink-0">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-lg font-black text-blue-400">
                  {creator.trustScore}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">/100</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 block uppercase tracking-wider">
                {creator.scoreBand.replace(" Risk", "").replace(" Trust", "")}
              </span>
            </div>
          </div>

          {/* Bio Snippet */}
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {creator.bio}
          </p>

          {/* 3 Core Authenticity Telemetry Cards */}
          <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-4 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Followers</span>
              <span className="text-xs font-bold text-slate-200">
                {formatNumber(creator.followers)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Engagement</span>
              <span className="text-xs font-bold text-blue-400">
                {creator.engagementRate}%
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Authenticity</span>
              <span className="text-xs font-bold text-emerald-400">
                {creator.authenticityProbability ? `${creator.authenticityProbability.toFixed(0)}%` : `${100 - creator.inflatedEngagementProbability}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <Link
            href={`/creators/${creator.id}`}
            className="flex-1 py-2 px-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {showCollaborateBtn && (
            <button
              type="button"
              onClick={() => setIsCollabModalOpen(true)}
              className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs shadow-blue-600/20 cursor-pointer shrink-0"
            >
              Collaborate
            </button>
          )}
        </div>
      </div>

      <CollaborationModal
        creator={creator}
        isOpen={isCollabModalOpen}
        onClose={() => setIsCollabModalOpen(false)}
      />
    </>
  );
}
