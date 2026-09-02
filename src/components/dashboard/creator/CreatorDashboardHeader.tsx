"use client";

import React from "react";
import Link from "next/link";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { Creator } from "@/types/creator";
import { Edit3, ExternalLink, ArrowRight, Tag, MapPin, Globe, Sparkles } from "lucide-react";

interface CreatorDashboardHeaderProps {
  creator: Creator;
}

export function CreatorDashboardHeader({ creator }: CreatorDashboardHeaderProps) {
  const availabilityLabel =
    creator.availabilityStatus === "NOT_AVAILABLE"
      ? "Not Currently Available"
      : creator.availabilityStatus === "AVAILABLE_FOR_COLLABORATION"
      ? "Available for Collabs"
      : "Open to Work";

  const availabilityBadgeStyle =
    creator.availabilityStatus === "NOT_AVAILABLE"
      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
      : creator.availabilityStatus === "AVAILABLE_FOR_COLLABORATION"
      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

  const cleanUsername = creator.username.replace("@", "");
  const publicProfileUrl = `/creators/${cleanUsername}`;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar with edit shortcut */}
          <div className="relative shrink-0">
            {creator.avatar ? (
              <img
                src={creator.avatar}
                alt={creator.name || "Creator Avatar"}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-slate-700/80 shadow-md bg-slate-950"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-2 border-slate-700/80 bg-slate-950 flex items-center justify-center text-2xl font-black text-slate-400">
                {creator.name?.charAt(0) || "C"}
              </div>
            )}
            <Link
              href="/dashboard/creator/profile"
              className="absolute -bottom-1 -right-1 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition-colors cursor-pointer"
              title="Edit Profile"
              aria-label="Edit Profile"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Identity & Meta */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
                Welcome back, {creator.name || "Creator"}
              </h1>
              {creator.verifiedBadge && <VerificationBadge size="md" />}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${availabilityBadgeStyle}`}>
                {availabilityLabel}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Your creator performance, authenticity, and opportunities at a glance.
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400">
              <span className="font-bold text-slate-200">
                {creator.username.startsWith("@") ? creator.username : `@${creator.username}`}
              </span>
              {creator.category && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300 font-medium">{creator.category}</span>
                </>
              )}
              {creator.location && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{creator.location}</span>
                  </span>
                </>
              )}
              <span className="text-slate-600">•</span>
              <span className="capitalize text-slate-400">
                Primary: <strong className="text-slate-300">{creator.platform}</strong>
              </span>
            </div>

            {/* Profile Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {creator.profileTags && creator.profileTags.length > 0 ? (
                creator.profileTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 text-[10px] font-semibold"
                  >
                    <Tag className="w-2.5 h-2.5 text-blue-400" />
                    <span>{tag}</span>
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-500 italic">
                  No collaboration tags configured yet.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 lg:pt-0">
          <Link
            href={publicProfileUrl}
            className="py-2.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs rounded-2xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>Public Profile</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <Link
            href="/dashboard/creator/profile"
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl transition-all shadow-md shadow-blue-600/25 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Edit Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
