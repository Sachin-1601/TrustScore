"use client";

import React, { useState } from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { AdPlacementModal } from "@/components/marketplace/AdPlacementModal";
import { MOCK_AD_PACKAGES } from "@/data/mockAdvertisements";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Users,
  Building2,
  TrendingUp,
  Mail,
} from "lucide-react";

export default function AdvertisePage() {
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [selectedPkgId, setSelectedPkgId] = useState("growth");

  const handleOpenModal = (pkgId: string) => {
    setSelectedPkgId(pkgId);
    setIsAdModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white">
      <LandingNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Marketplace Sponsorships</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight">
            Put your business in front of <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
              trusted creators.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Reach brands, creators, and media planners actively looking for campaign collaboration opportunities.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => handleOpenModal("growth")}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Start Advertising</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#packages"
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl transition-colors"
            >
              View Advertising Packages
            </a>
          </div>
        </div>

        {/* 3 Metric Value Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-100 block">50K+</span>
            <h4 className="font-bold text-slate-200 text-sm">Active Creators Analyzed</h4>
            <p className="text-xs text-slate-400">Discover creators actively seeking brand sponsorships.</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-100 block">1,800+</span>
            <h4 className="font-bold text-slate-200 text-sm">Brand Marketing Leads</h4>
            <p className="text-xs text-slate-400">Agency planners researching creator rosters daily.</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-100 block">3.4x</span>
            <h4 className="font-bold text-slate-200 text-sm">Higher Collaboration Intent</h4>
            <p className="text-xs text-slate-400">High conversion intent compared to generic ads.</p>
          </div>
        </div>

        {/* Pricing Packages */}
        <section id="packages" className="space-y-6">
          <div className="text-center space-y-1 max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-slate-100">Advertising Packages</h3>
            <p className="text-xs text-slate-400">Select the right visibility tier for your business</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_AD_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-slate-900/90 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all duration-200 ${
                  pkg.popular
                    ? "border-2 border-blue-500 shadow-xl shadow-blue-950/40"
                    : "border border-slate-800 hover:border-slate-700"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-sm">
                    Most Popular
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="font-extrabold text-slate-100 text-lg">{pkg.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{pkg.tagline}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-100">${pkg.price}</span>
                    <span className="text-xs text-slate-400 font-semibold">{pkg.billingPeriod}</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold text-blue-400">
                    {pkg.placementSummary}
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                    {pkg.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-slate-300">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenModal(pkg.id)}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    pkg.popular
                      ? "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                  }`}
                >
                  Choose {pkg.name}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Ethical Guarantee Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
          <div className="space-y-1 text-xs text-slate-300">
            <h4 className="font-bold text-slate-100 text-sm">
              Advertising Transparency &amp; Independence Policy
            </h4>
            <p className="text-slate-400 leading-relaxed">
              TrustScore maintains strict separation between commercial advertising and data science analytics. Paid business sponsorships are explicitly marked with &quot;Sponsored&quot; badges and do NOT alter, bias, or influence creator TrustScore calculations or leaderboard positions.
            </p>
          </div>
        </div>
      </main>

      <LandingFooter />

      <AdPlacementModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        defaultPackageId={selectedPkgId}
      />
    </div>
  );
}
