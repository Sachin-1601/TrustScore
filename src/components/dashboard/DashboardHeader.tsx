"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Bell, ArrowRight, X } from "lucide-react";
import { Creator } from "@/types/creator";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

export function DashboardHeader({ title = "Overview", subtitle }: DashboardHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [matchingCreators, setMatchingCreators] = useState<Creator[]>([]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setMatchingCreators([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/creators?query=${encodeURIComponent(searchQuery.trim())}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setMatchingCreators(data.creators || []);
        }
      } catch {
        // safe ignore
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectCreator = (id: string) => {
    setSearchQuery("");
    setIsSearchOpen(false);
    router.push(`/creators/${id}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/creators?query=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-20 text-slate-100">
      {/* Title / Breadcrumb */}
      <div>
        <h1 className="text-lg font-bold text-slate-100 leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
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
            placeholder="Search creator handle, name, or category..."
            className="w-full bg-slate-950 hover:bg-slate-900 focus:bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 pl-9 text-xs font-medium text-slate-100 placeholder:text-slate-500 focus:outline-hidden transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </form>

        {/* Live Search Autocomplete Dropdown */}
        {isSearchOpen && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden z-50">
            <div className="p-2.5 border-b border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span>Matching Verified Creators</span>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60">
              {matchingCreators.length > 0 ? (
                matchingCreators.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCreator(c.id)}
                    className="p-3 hover:bg-slate-850 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-8 h-8 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-100 block">
                          {c.username}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {c.category} • {(c.followers / 1000).toFixed(1)}k followers
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-blue-400 block">
                        {c.trustScore}/100
                      </span>
                      <span className="text-[10px] text-emerald-400">
                        {c.scoreBand}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className="text-xs text-slate-400">No matching creators found for &quot;{searchQuery}&quot;</p>
                  <Link
                    href={`/creators?query=${encodeURIComponent(searchQuery)}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300"
                  >
                    <span>Search Marketplace</span>
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
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Bayesian Engine Active</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-4 z-50 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Notifications &amp; Alerts
                </span>
                <span className="text-[10px] text-blue-400 font-semibold cursor-pointer">
                  Mark all read
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <p className="font-semibold text-slate-200">System Ready</p>
                  <p className="text-slate-400 text-[11px]">
                    Marketplace telemetry active with zero-inflation Bayesian scoring.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Explore Marketplace CTA */}
        <Link
          href="/creators"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Browse Creators</span>
        </Link>
      </div>
    </header>
  );
}
