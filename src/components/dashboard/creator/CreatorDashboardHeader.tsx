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
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : creator.availabilityStatus === "AVAILABLE_FOR_COLLABORATION"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";

  const cleanUsername = creator.username.replace("@", "");
  const publicProfileUrl = `/creators/${cleanUsername}`;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar with edit shortcut */}
          <div className="relative shrink-0">
            {creator.avatar ? (
              <img
                src={creator.avatar}
                alt={creator.name || "Creator Avatar"}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-slate-100 ring-1 ring-slate-200 shadow-sm bg-slate-50"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-slate-100 ring-1 ring-slate-200 bg-slate-50 flex items-center justify-center text-2xl font-black text-slate-400">
                {creator.name?.charAt(0) || "C"}
              </div>
            )}
            <Link
              href="/dashboard/creator/profile"
              className="absolute -bottom-1 -right-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
              title="Edit Profile"
              aria-label="Edit Profile"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Identity & Meta */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Welcome back, {creator.name || "Creator"}
              </h1>
              {creator.verifiedBadge && <VerificationBadge size="md" />}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${availabilityBadgeStyle}`}>
                {availabilityLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Your creator performance, authenticity, and opportunities at a glance.
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500">
              <span className="font-bold text-slate-800">
                {creator.username.startsWith("@") ? creator.username : `@${creator.username}`}
              </span>
              {creator.category && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-700 font-medium">{creator.category}</span>
                </>
              )}
              {creator.location && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{creator.location}</span>
                  </span>
                </>
              )}
              <span className="text-slate-300">•</span>
              <span className="capitalize text-slate-600">
                Primary: <strong className="text-slate-800 font-semibold">{creator.platform}</strong>
              </span>
            </div>

            {/* Profile Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {creator.profileTags && creator.profileTags.length > 0 ? (
                creator.profileTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-semibold"
                  >
                    <Tag className="w-2.5 h-2.5 text-blue-600" />
                    <span>{tag}</span>
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-400 italic">
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
            className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Public Profile</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <Link
            href="/dashboard/creator/profile"
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>Edit Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
