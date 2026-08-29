"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { MarketplaceHero } from "@/components/marketplace/MarketplaceHero";
import { SponsoredBusinessCard } from "@/components/marketplace/SponsoredBusinessCard";
import { TrustScoreLeaderboard } from "@/components/marketplace/TrustScoreLeaderboard";
import { CreatorMarketplaceCard } from "@/components/marketplace/CreatorMarketplaceCard";
import { CategoryGrid } from "@/components/marketplace/CategoryGrid";
import { AdPlacementModal } from "@/components/marketplace/AdPlacementModal";
import { MOCK_SPONSORED_ADS } from "@/data/mockAdvertisements";
import { MOCK_CREATORS } from "@/data/mockCreators";
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Award,
  Users,
  Building2,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Cpu,
  BarChart3,
  BadgeCheck,
} from "lucide-react";

export default function MarketplaceHomePage() {
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);

  // Left and Right sponsored ads for 3-column desktop layout
  const leftAds = MOCK_SPONSORED_ADS.filter((a) => a.placement === "left_sidebar");
  const rightAds = MOCK_SPONSORED_ADS.filter((a) => a.placement === "right_sidebar");
  const recentlyVerifiedCreators = MOCK_CREATORS.filter((c) => c.verifiedBadge).slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white">
      <LandingNavbar />

      {/* Main 3-Column Marketplace Container */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Sponsored Business Cards (Desktop sticky sidebar)             */}
          {/* ========================================================================= */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-24">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-blue-400" />
                <span>Featured Businesses</span>
              </span>
              <button
                onClick={() => setIsAdModalOpen(true)}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                + Advertise
              </button>
            </div>

            {leftAds.map((ad) => (
              <SponsoredBusinessCard key={ad.id} ad={ad} />
            ))}

            {/* Quick Advertise Banner */}
            <div className="p-4 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950 border border-blue-900/40 rounded-2xl text-xs space-y-2">
              <span className="font-bold text-slate-200 block">Grow your brand with creators</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Connect with authentic micro-creators in your category.
              </p>
              <button
                type="button"
                onClick={() => setIsAdModalOpen(true)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors text-center block cursor-pointer"
              >
                Advertise Your Brand
              </button>
            </div>
          </aside>

          {/* ========================================================================= */}
          {/* CENTER COLUMN: Main Marketplace Content                                   */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 space-y-16">
            
            {/* 1. Centered Hero & Search */}
            <MarketplaceHero />

            {/* Mobile & Tablet Sponsored Section (Horizontal) */}
            <div className="lg:hidden space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Featured Business Sponsors
                </span>
                <button
                  onClick={() => setIsAdModalOpen(true)}
                  className="text-[11px] font-bold text-amber-400 cursor-pointer"
                >
                  + Advertise
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {leftAds.slice(0, 2).map((ad) => (
                  <SponsoredBusinessCard key={ad.id} ad={ad} compact />
                ))}
              </div>
            </div>

            {/* 2. Recently Verified Creators Showcase */}
            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-emerald-400" />
                    <span>Recently Verified Creators</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Creators with direct API telemetry verified for high engagement authenticity
                  </p>
                </div>
                <Link
                  href="/creators"
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentlyVerifiedCreators.map((creator) => (
                  <CreatorMarketplaceCard key={creator.id} creator={creator} />
                ))}
              </div>
            </section>

            {/* 3. TrustScore Leaderboard */}
            <section id="leaderboard" className="space-y-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
                  <Award className="w-3 h-3" />
                  <span>The Authenticity Index</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
                  TrustScore Leaderboard
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  The most authentic micro- and nano-creators ranked by probabilistic trust analytics.
                </p>
              </div>

              <TrustScoreLeaderboard initialLimit={8} showFilters={true} />
            </section>

            {/* 4. Why TrustScore Differentiator (Authenticity vs Reach) */}
            <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                  Core Differentiator
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-100">
                  Don&apos;t just find creators with reach. <br />
                  <span className="text-blue-400">Find creators you can trust.</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Traditional creator directories rank creators solely by follower vanity counts. TrustScore evaluates real engagement signals, comment lexical diversity, and follower stability.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                  <span className="font-bold text-rose-400 flex items-center gap-1.5">
                    <span>✕ Traditional Marketplaces</span>
                  </span>
                  <ul className="space-y-1.5 text-slate-400 text-[11px]">
                    <li>• Ranks by follower counts &amp; raw impressions</li>
                    <li>• Vulnerable to engagement pods &amp; fake likes</li>
                    <li>• High campaign budget waste on hollow reach</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-950/30 border border-blue-800/40 rounded-2xl space-y-2">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>✓ TrustScore Marketplace</span>
                  </span>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li>• Ranked by sample-efficient Bayesian TrustScore</li>
                    <li>• Analyzes comment lexical diversity &amp; stability</li>
                    <li>• Proportional rate adjustment decision support</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 5. 3-Step How It Works Workflow */}
            <section className="space-y-6">
              <div className="text-center space-y-1 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-slate-100">How TrustScore Works</h3>
                <p className="text-xs text-slate-400">
                  From discovery to data-backed campaign collaboration
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2 text-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mx-auto flex items-center justify-center font-bold">
                    1
                  </div>
                  <h4 className="font-bold text-slate-100">Discover Creators</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Search top creators by niche, location, engagement, and TrustScore band.
                  </p>
                </div>

                <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2 text-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center font-bold">
                    2
                  </div>
                  <h4 className="font-bold text-slate-100">Inspect Authenticity</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    View 12-month growth curves, comment diversity, and estimated inflated risk %.
                  </p>
                </div>

                <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2 text-center">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mx-auto flex items-center justify-center font-bold">
                    3
                  </div>
                  <h4 className="font-bold text-slate-100">Collaborate &amp; Track</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Send campaign proposals and manage brand deals with confidence.
                  </p>
                </div>
              </div>
            </section>

            {/* 6. Explore by Category Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">Explore by Category</h3>
                  <p className="text-xs text-slate-400">Discover authentic creators in your industry niche</p>
                </div>
              </div>
              <CategoryGrid />
            </section>

            {/* 7. For Businesses vs For Creators Split Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
                    For Brands &amp; Agencies
                  </span>
                  <h4 className="text-lg font-bold text-slate-100">Find Creators Who Fit Your Brand</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Stop spending budget on fake engagement. Discover authentic micro-creators with proven conversion quality.
                  </p>
                </div>
                <Link
                  href="/for-businesses"
                  className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl text-center transition-colors"
                >
                  Explore Brand Solutions
                </Link>
              </div>

              <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                    For Creators
                  </span>
                  <h4 className="text-lg font-bold text-slate-100">Let Your Authenticity Speak For Itself</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Get your verified TrustScore, showcase your authentic engagement to ambitious businesses, and secure high-paying collaborations.
                  </p>
                </div>
                <Link
                  href="/for-creators"
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl text-center transition-colors border border-slate-700"
                >
                  Get Your TrustScore
                </Link>
              </div>
            </section>

            {/* 8. Advertise Callout Banner */}
            <section className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-blue-500/10 border border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>Business Advertising</span>
                </div>
                <h3 className="text-xl font-bold text-slate-100">
                  Put Your Business in Front of 50K+ Creators
                </h3>
                <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                  Promote your brand, products, or creator opportunities with sponsored marketplace cards and directory listings.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAdModalOpen(true)}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all shrink-0 cursor-pointer"
              >
                Advertise Your Business
              </button>
            </section>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Sponsored Business Cards (Desktop sticky sidebar)            */}
          {/* ========================================================================= */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-24">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Sponsored Brands</span>
              </span>
              <Link
                href="/businesses"
                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                View all
              </Link>
            </div>

            {rightAds.map((ad) => (
              <SponsoredBusinessCard key={ad.id} ad={ad} />
            ))}

            {/* Ethical Guarantee Callout */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1 text-slate-300 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ethical Integrity Policy</span>
              </div>
              <p className="leading-relaxed text-slate-500">
                Paid business sponsorships never influence creator TrustScores or leaderboard rankings.
              </p>
            </div>
          </aside>

        </div>
      </main>

      <LandingFooter />

      <AdPlacementModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
      />
    </div>
  );
}
