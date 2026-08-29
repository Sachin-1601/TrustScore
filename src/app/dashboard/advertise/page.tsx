"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AdPlacementModal } from "@/components/marketplace/AdPlacementModal";
import { MOCK_SPONSORED_ADS } from "@/data/mockAdvertisements";
import {
  Megaphone,
  Plus,
  Sparkles,
  Eye,
  MousePointer,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export default function DashboardAdvertisePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const activeAds = MOCK_SPONSORED_ADS.slice(0, 3);

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Sponsored Business Advertising"
        subtitle="Manage active homepage and sidebar sponsored placements across the TrustScore marketplace"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-400" />
              <span>Active Marketplace Sponsorships ({activeAds.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Live placements promoting your brand to creators and agency planners
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Placement</span>
          </button>
        </div>

        {/* Live Ads Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activeAds.map((ad) => (
            <div
              key={ad.id}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {ad.badgeText}
                </span>
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active (30d left)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={ad.businessLogo}
                  alt={ad.businessName}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{ad.businessName}</h4>
                  <span className="text-xs text-slate-400">{ad.category}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {ad.description}
              </p>

              {/* Performance Telemetry */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-950 rounded-xl text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Impressions</span>
                  <span className="font-bold text-slate-200">{ad.impressionsCount ? ad.impressionsCount.toLocaleString() : "12,400"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">CTR</span>
                  <span className="font-bold text-blue-400">3.8%</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-500">Placement: {ad.placement.replace("_", " ")}</span>
                <Link
                  href={ad.ctaLink}
                  className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                >
                  <span>Preview</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Ethical Transparency Box */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl flex items-start gap-3 text-xs text-slate-400">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-slate-200 text-sm">Commercial Independence</h4>
            <p className="leading-relaxed">
              Sponsored business placements do not affect creator TrustScore algorithms, authenticity metrics, or leaderboard rankings. This preserves absolute credibility for brands and creators alike.
            </p>
          </div>
        </div>
      </div>

      <AdPlacementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
