"use client";

import React from "react";
import Link from "next/link";
import { Creator } from "@/types/creator";
import { CheckCircle2, ArrowRight, UserCheck, ShieldCheck, Tag, Sparkles, Sliders } from "lucide-react";

interface CreatorNextStepsProps {
  creator: Creator;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  href: string;
  ctaText: string;
  icon: React.ElementType;
  badge: string;
  isComplete: boolean;
}

export function CreatorNextSteps({ creator }: CreatorNextStepsProps) {
  const isProfileInfoComplete = Boolean(
    creator.name && creator.bio && creator.bio.length >= 15 && creator.category && creator.location
  );
  const isStartingRateSet = (creator.startingRate || 0) > 0;
  const isTagsSet = Boolean(creator.profileTags && creator.profileTags.length > 0);
  const isVerified = Boolean(creator.verifiedBadge);
  const isTrustScoreCalculated = (creator.trustScore || 0) > 0;

  const actions: ActionItem[] = [
    {
      id: "profile_info",
      title: "Complete Your Profile Bio & Details",
      description: "Add a descriptive bio, location, and niche category to rank in brand discovery filters.",
      href: "/dashboard/creator/profile",
      ctaText: "Complete Profile",
      icon: UserCheck,
      badge: "High Priority",
      isComplete: isProfileInfoComplete,
    },
    {
      id: "rates_and_tags",
      title: "Set Collaboration Rates & Tags",
      description: "Define starting sponsorship rates and collaboration tags to attract matching budgets.",
      href: "/dashboard/creator/profile",
      ctaText: "Update Rates & Tags",
      icon: Tag,
      badge: "Discovery",
      isComplete: isStartingRateSet && isTagsSet,
    },
    {
      id: "verification",
      title: "Connect Social Telemetry & Verification",
      description: "Establish OAuth verification to validate audience authenticity and unlock verified badges.",
      href: "/dashboard/creator/verification",
      ctaText: "Connect Account",
      icon: ShieldCheck,
      badge: "Authenticity",
      isComplete: isVerified,
    },
    {
      id: "trustscore",
      title: "Run Initial TrustScore Analysis",
      description: "Analyze post engagement distributions and lexical diversity to generate an audited score.",
      href: "/dashboard/creator/analytics",
      ctaText: "Run Analysis",
      icon: Sparkles,
      badge: "Audit",
      isComplete: isTrustScoreCalculated,
    },
  ];

  const pendingActions = actions.filter((a) => !a.isComplete);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">
            What To Do Next
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {pendingActions.length === 0
            ? "100% Optimized"
            : `${pendingActions.length} item${pendingActions.length === 1 ? "" : "s"} remaining`}
        </span>
      </div>

      <div className="space-y-3">
        {pendingActions.length > 0 ? (
          pendingActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                className="p-4 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                          {action.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/80">
                          {action.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Link
                    href={action.href}
                    className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{action.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 bg-emerald-50/60 rounded-xl border border-emerald-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              Profile Setup Complete &amp; Fully Optimized
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your profile has complete metadata, active telemetry, and verified metrics ready for brand sponsorships.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
