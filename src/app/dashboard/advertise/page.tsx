"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AdPlacementModal } from "@/components/marketplace/AdPlacementModal";
import { SponsoredAd } from "@/types/creator";
import {
  Megaphone,
  Plus,
  Eye,
  MousePointer,
  ExternalLink,
  Loader2,
} from "lucide-react";

export default function DashboardAdvertisePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ads, setAds] = useState<SponsoredAd[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAds() {
      try {
        const res = await fetch("/api/advertisements");
        if (res.ok) {
          const data = await res.json();
          setAds(data.advertisements || []);
        }
      } catch {
        // Network error
      } finally {
        setIsLoading(false);
      }
    }
    loadAds();
  }, []);

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
              <span>Active Marketplace Sponsorships ({ads.length})</span>
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
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-xs font-semibold">Loading active advertising campaigns...</span>
          </div>
        ) : ads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {ad.placement.replace("_", " ")}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{ad.badgeText || "Active"}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={ad.businessLogo}
                      alt={ad.businessName}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{ad.businessName}</h4>
                      <p className="text-xs text-slate-400">{ad.tagline}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{ad.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Impressions</span>
                      <strong className="text-slate-200">{(ad.impressionsCount || 0).toLocaleString()}</strong>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Clicks</span>
                      <strong className="text-blue-400">{(ad.clicksCount || 0).toLocaleString()}</strong>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">CTR</span>
                      <strong className="text-emerald-400">
                        {ad.impressionsCount ? (((ad.clicksCount || 0) / ad.impressionsCount) * 100).toFixed(1) : "0.0"}%
                      </strong>
                    </div>
                  </div>

                  <a
                    href={ad.ctaLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>View Target URL</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Megaphone className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">No active sponsorships</h3>
            <p className="text-xs text-slate-400">Create a sponsored placement to promote your brand across TrustScore.</p>
          </div>
        )}
      </div>

      <AdPlacementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
