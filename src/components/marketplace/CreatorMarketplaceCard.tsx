"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Creator } from "@/types/creator";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { CollaborationModal } from "./CollaborationModal";
import { formatNumber, getScoreColor } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Bookmark,
  Info,
  CheckCircle2,
  AlertCircle,
  Tag,
  Zap,
} from "lucide-react";

interface CreatorMarketplaceCardProps {
  creator: Creator;
  isSaved?: boolean;
  onToggleSave?: (creatorId: string, newState: boolean) => void;
  showCollaborateBtn?: boolean;
}

export function CreatorMarketplaceCard({
  creator,
  isSaved: initialIsSaved = false,
  onToggleSave,
  showCollaborateBtn = true,
}: CreatorMarketplaceCardProps) {
  const { user } = useAuth();
  const { success, info, error: toastError } = useToast();

  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [showScoreTooltip, setShowScoreTooltip] = useState(false);

  const cleanHandle = creator.username.replace("@", "");
  const hasInsufficientData =
    !creator.trustScore ||
    creator.trustScore === 0 ||
    (creator.followers === 0 && creator.engagementRate === 0);

  const scoreColors = getScoreColor(creator.trustScore);

  // Score band label
  const getScoreBandLabel = (score: number) => {
    if (hasInsufficientData) return "Insufficient Data";
    if (score >= 90) return "Very High Trust";
    if (score >= 80) return "High Trust";
    if (score >= 70) return "Moderate";
    if (score >= 60) return "Low Trust";
    return "High Risk";
  };

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      info("Sign In Required", "Please sign in to save creators to your business shortlist.");
      return;
    }

    const nextState = !isSaved;
    setIsSaved(nextState);
    setIsSaving(true);

    try {
      const res = await fetch(`/api/creators/saved${nextState ? "" : `?creatorId=${encodeURIComponent(creator.id)}`}`, {
        method: nextState ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: nextState ? JSON.stringify({ creatorId: creator.id }) : undefined,
      });

      if (res.ok) {
        if (nextState) {
          success("Creator Shortlisted", `${creator.username} added to saved creators.`);
        } else {
          info("Removed from Shortlist", `${creator.username} removed.`);
        }
        onToggleSave?.(creator.id, nextState);
      } else {
        setIsSaved(!nextState); // Rollback
      }
    } catch {
      setIsSaved(!nextState);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCollaborateClick = () => {
    if (!user) {
      info("Sign In Required", "Please sign in as a brand to send collaboration proposals.");
      window.location.href = `/login?redirect=/creators/${cleanHandle}`;
      return;
    }

    if (user.role === "CREATOR") {
      info("Creator Account", "Collaboration proposals are dispatched by brand/agency accounts.");
      return;
    }

    setIsCollabModalOpen(true);
  };

  // Extract key positive factor or fallback insight
  const insightSummary =
    creator.positiveFactors && creator.positiveFactors.length > 0
      ? creator.positiveFactors[0]
      : creator.verifiedBadge
      ? "Verified account with stable audience growth"
      : hasInsufficientData
      ? "Awaiting initial authenticity analysis"
      : "Consistent engagement across verified posts";

  return (
    <>
      <div className="group relative bg-white hover:bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md">
        <div>
          {/* Top Header: Avatar + Identity + TrustScore Ring */}
          <div className="flex items-start justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-13 h-13 rounded-xl object-cover border border-slate-200 group-hover:border-blue-400 transition-colors"
                />
                <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full border border-slate-200 shadow-xs">
                  <PlatformIcon platform={creator.platform} size="sm" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/creators/${cleanHandle}`}
                    className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors truncate block"
                  >
                    {creator.username}
                  </Link>
                  {creator.verifiedBadge && <VerificationBadge size="sm" showText={false} />}
                </div>

                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{creator.name}</p>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                  <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-700">
                    {creator.category}
                  </span>
                  {creator.location && (
                    <span className="flex items-center gap-0.5 truncate max-w-[120px] text-slate-500">
                      <MapPin className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{creator.location}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bookmark and TrustScore Gauge */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                {/* Save Bookmark Button */}
                <button
                  type="button"
                  data-testid={`save-creator-${creator.id}`}
                  onClick={handleBookmarkToggle}
                  disabled={isSaving}
                  title={isSaved ? "Saved to shortlist" : "Save to shortlist"}
                  className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                    isSaved
                      ? "bg-rose-50 border-rose-200 text-rose-600"
                      : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
                </button>

                {/* TrustScore Radial Badge */}
                <div
                  className="relative cursor-help"
                  onMouseEnter={() => setShowScoreTooltip(true)}
                  onMouseLeave={() => setShowScoreTooltip(false)}
                >
                  {hasInsufficientData ? (
                    <div className="px-2 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-500 text-right">
                      <span className="block text-[9px] text-slate-400 uppercase">Score</span>
                      <span>Pending</span>
                    </div>
                  ) : (
                    <div className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-right">
                      <div className="flex items-baseline justify-end gap-0.5">
                        <span className="text-base font-black text-blue-600">
                          {creator.trustScore}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400">/100</span>
                      </div>
                      <span
                        className={`text-[9px] font-extrabold block uppercase tracking-wider ${
                          creator.trustScore >= 80 ? "text-emerald-700" : "text-amber-700"
                        }`}
                      >
                        {getScoreBandLabel(creator.trustScore)}
                      </span>
                    </div>
                  )}

                  {/* Tooltip */}
                  {showScoreTooltip && (
                    <div className="absolute right-0 top-full mt-2 w-56 p-3 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-700 shadow-xl z-30 space-y-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>About TrustScore</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        TrustScore estimates creator authenticity using available engagement stability, audience quality, and verification signals.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio Snippet */}
          {creator.bio && (
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3.5 min-h-[32px]">
              {creator.bio}
            </p>
          )}

          {/* 3 Core Authenticity Metrics Grid (Rendered only if values exist) */}
          <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 mb-3.5 text-center">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Followers</span>
              <span className="text-xs font-bold text-slate-900">
                {creator.followers > 0 ? formatNumber(creator.followers) : "—"}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Engagement</span>
              <span className="text-xs font-bold text-blue-600">
                {creator.engagementRate > 0 ? `${creator.engagementRate}%` : "—"}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Authenticity</span>
              <span className="text-xs font-bold text-emerald-700">
                {hasInsufficientData
                  ? "—"
                  : creator.authenticityProbability
                  ? `${creator.authenticityProbability.toFixed(0)}%`
                  : "95%"}
              </span>
            </div>
          </div>

          {/* Contextual TrustScore Insight Bar */}
          <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center gap-2 text-[11px] text-slate-700 mb-3.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{insightSummary}</span>
          </div>

          {/* Profile Tags & Rate */}
          <div className="flex items-center justify-between gap-2 mb-2 text-[11px]">
            <div className="flex flex-wrap gap-1">
              {creator.profileTags?.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-600 truncate max-w-[130px]"
                >
                  {tag}
                </span>
              ))}
            </div>

            {creator.startingRate > 0 && (
              <span className="text-[10px] text-slate-500 font-medium shrink-0">
                From <strong className="text-slate-900">${creator.startingRate}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: View Profile + Collaborate */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
          <Link
            href={`/creators/${cleanHandle}`}
            className="flex-1 py-2.5 px-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View Profile</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          {showCollaborateBtn && (
            <button
              type="button"
              onClick={handleCollaborateClick}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs transition-all shadow-xs cursor-pointer shrink-0"
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
