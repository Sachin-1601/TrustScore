"use client";

import React from "react";
import Link from "next/link";
import { Creator } from "@/types/creator";
import { CheckCircle2, Circle, ArrowUpRight, Award } from "lucide-react";

interface CreatorProfileCompletionProps {
  creator: Creator;
}

export function CreatorProfileCompletion({ creator }: CreatorProfileCompletionProps) {
  const items = [
    {
      id: "name_avatar",
      label: "Profile Identity & Avatar",
      isComplete: Boolean(creator.name && creator.avatar),
      href: "/dashboard/creator/profile",
    },
    {
      id: "bio_category",
      label: "Bio & Industry Niche",
      isComplete: Boolean(creator.bio && creator.bio.length >= 15 && creator.category),
      href: "/dashboard/creator/profile",
    },
    {
      id: "location",
      label: "Location & Country",
      isComplete: Boolean(creator.location),
      href: "/dashboard/creator/profile",
    },
    {
      id: "starting_rate",
      label: "Starting Collaboration Rate",
      isComplete: (creator.startingRate || 0) > 0,
      href: "/dashboard/creator/profile",
    },
    {
      id: "tags",
      label: "Marketplace Search Tags",
      isComplete: Boolean(creator.profileTags && creator.profileTags.length > 0),
      href: "/dashboard/creator/profile",
    },
    {
      id: "telemetry",
      label: "Social Telemetry Verification",
      isComplete: Boolean(creator.verifiedBadge),
      href: "/dashboard/creator/verification",
    },
  ];

  const completedCount = items.filter((i) => i.isComplete).length;
  const percentage = Math.round((completedCount / items.length) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">
            Profile Completion
          </h3>
        </div>
        <span className="text-sm font-black text-emerald-600">
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-xs text-slate-500">
        {percentage >= 80
          ? "Your profile is ranked in priority brand search filters."
          : "Complete remaining items to maximize brand collaboration discovery."}
      </p>

      {/* Checklist items */}
      <div className="space-y-2 pt-1 text-xs">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`p-2.5 rounded-xl border flex items-center justify-between transition-all group ${
              item.isComplete
                ? "bg-emerald-50/60 border-emerald-200 text-emerald-800"
                : "bg-slate-50/80 hover:bg-slate-100/70 border-slate-200/80 text-slate-600 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {item.isComplete ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span className="font-semibold">{item.label}</span>
            </div>

            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  );
}
