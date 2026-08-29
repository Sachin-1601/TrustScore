"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { BusinessCard } from "@/components/marketplace/BusinessCard";
import { AdPlacementModal } from "@/components/marketplace/AdPlacementModal";
import { MOCK_BUSINESSES } from "@/data/mockBusinesses";
import {
  Building2,
  Search,
  Sparkles,
  Filter,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Plus,
} from "lucide-react";

export default function BusinessesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sponsoredOnly, setSponsoredOnly] = useState(false);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);

  const categories = [
    "all",
    "Fitness & Nutrition",
    "Fashion & Apparel",
    "Technology & Creator Tools",
    "Beauty & Wellness",
    "Travel & Outdoor Gear",
    "Food & Culinary",
  ];

  const filteredBusinesses = useMemo(() => {
    return MOCK_BUSINESSES.filter((b) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = b.name.toLowerCase().includes(q);
        const matchesDesc = b.description.toLowerCase().includes(q);
        const matchesCategory = b.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCategory) return false;
      }

      if (selectedCategory !== "all" && b.category !== selectedCategory) {
        return false;
      }

      if (sponsoredOnly && !b.isSponsored) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, sponsoredOnly]);

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white">
      <LandingNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>Two-Sided Brand Network</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
              Businesses on TrustScore
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Discover brands actively looking for authentic creator collaborations, ambassador retainers, and product gifting campaigns.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAdModalOpen(true)}
            className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 shrink-0 self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>List Your Business</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search businesses by name, vertical, or product..."
                className="w-full py-3 px-4 pl-10 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={() => setSponsoredOnly(!sponsoredOnly)}
              className={`px-3.5 py-3 rounded-xl border text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 w-full sm:w-auto justify-center ${
                sponsoredOnly
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sponsored Only</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Business Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
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
