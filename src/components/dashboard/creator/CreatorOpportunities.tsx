"use client";

import React from "react";
import Link from "next/link";
import { Briefcase, ArrowRight, DollarSign, Target, Building2, Sparkles } from "lucide-react";

interface CampaignItem {
  id: string;
  title: string;
  category: string;
  budget: number;
  deliverables: string;
  targetMinTrustScore?: number;
  targetFollowerRange?: string;
  business?: {
    name: string;
    logo?: string;
  };
}

interface CreatorOpportunitiesProps {
  campaigns: CampaignItem[];
  creatorCategory?: string;
}

export function CreatorOpportunities({ campaigns, creatorCategory }: CreatorOpportunitiesProps) {
  const displayCampaigns = campaigns.slice(0, 3);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200/80 text-purple-600 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Brand &amp; Campaign Opportunities
            </h3>
            <p className="text-xs text-slate-500">
              Active marketing campaigns seeking creators with verified audience quality.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/campaigns"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Explore Marketplace</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {displayCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayCampaigns.map((camp) => (
            <div
              key={camp.id}
              className="p-5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/80">
                    {camp.category || "General"}
                  </span>
                  <span className="text-sm font-black text-emerald-600">
                    ${camp.budget}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">
                    {camp.title}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{camp.business?.name || "Verified Brand"}</span>
                  </p>
                </div>

                <div className="space-y-1 pt-1 text-[11px] text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Target Min TrustScore:</span>
                    <strong className="text-slate-800">{camp.targetMinTrustScore || 80}+</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Audience Range:</span>
                    <strong className="text-slate-800">{camp.targetFollowerRange || "Any"}</strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
                  {camp.deliverables || "Content deliverables specified upon collaboration agreement."}
                </p>
              </div>

              <Link
                href={`/dashboard/collaborations`}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Opportunity</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">
              No Open Campaign Briefs Available Yet
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              When brands launch campaigns matching your niche ({creatorCategory || "Creator"}), they will be curated here for direct proposal submissions.
            </p>
          </div>
          <div className="pt-1">
            <Link
              href="/dashboard/creator/profile"
              className="inline-flex items-center gap-1.5 py-2 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all shadow-xs"
            >
              <span>Keep Profile Updated</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
