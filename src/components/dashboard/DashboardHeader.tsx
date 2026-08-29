"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Bell, Sparkles, Shield, ArrowRight, X } from "lucide-react";
import { MOCK_INFLUENCERS } from "@/data/mockInfluencers";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

export function DashboardHeader({ title = "Overview", subtitle }: DashboardHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const filteredCreators = searchQuery.trim()
    ? MOCK_INFLUENCERS.filter(
        (inf) =>
          inf.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inf.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectCreator = (id: string) => {
    setSearchQuery("");
    setIsSearchOpen(false);
    router.push(`/dashboard/influencer/${id}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/dashboard/analyze?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Title / Breadcrumb */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-md relative hidden sm:block">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search creator handle, name, or paste URL..."
            className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 pl-9 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </form>

        {/* Live Search Autocomplete Dropdown */}
        {isSearchOpen && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50">
            <div className="p-2 border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Matching Creator Analyses</span>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
              {filteredCreators.length > 0 ? (
                filteredCreators.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCreator(c.id)}
                    className="p-2.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {c.username}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {c.category} • {(c.followers / 1000).toFixed(1)}k followers
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-blue-700 block">
                        {c.trustScore}/100
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {c.riskLevel} Risk
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className="text-xs text-slate-600">No cached analysis for &quot;{searchQuery}&quot;</p>
                  <Link
                    href={`/dashboard/analyze?q=${encodeURIComponent(searchQuery)}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <span>Run new probabilistic audit</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Action Icons & Status */}
      <div className="flex items-center gap-3">
        {/* Prototype Engine Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Bayesian Engine Active</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-50 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Notifications & Alerts
                </span>
                <span className="text-[10px] text-blue-600 font-semibold cursor-pointer">
                  Mark all read
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-blue-50/60 rounded-xl border border-blue-100">
                  <p className="font-semibold text-blue-900">Analysis completed</p>
                  <p className="text-blue-700 text-[11px]">
                    @alexfitness evaluated with TrustScore 87/100 (Low Risk).
                  </p>
                </div>
                <div className="p-2 bg-amber-50/60 rounded-xl border border-amber-100">
                  <p className="font-semibold text-amber-900">Engagement Pod Warning</p>
                  <p className="text-amber-700 text-[11px]">
                    Reciprocal comment clustering flagged on @beautybymia.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* New Analysis CTA */}
        <Link
          href="/dashboard/analyze"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>New Analysis</span>
        </Link>
      </div>
    </header>
  );
}
