"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Bell, ArrowRight, X } from "lucide-react";
import { Creator } from "@/types/creator";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  showEngineBadge?: boolean;
  showBrowseCreators?: boolean;
  showNotifications?: boolean;
  actions?: React.ReactNode;
}

export function DashboardHeader({
  title = "Overview",
  subtitle,
  showSearch = false,
  searchPlaceholder = "Search...",
  showEngineBadge = false,
  showBrowseCreators = false,
  showNotifications = false,
  actions,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotificationPopover, setShowNotificationPopover] = useState(false);
  const [matchingCreators, setMatchingCreators] = useState<Creator[]>([]);

  useEffect(() => {
    if (!showSearch || !searchQuery.trim()) {
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
  }, [searchQuery, showSearch]);

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
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-20 text-slate-900 shadow-xs">
      {/* Title / Context Subtitle */}
      <div className="min-w-0">
        <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-none truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {/* Optional Search Bar (Disabled by default on creator workspace) */}
      {showSearch && (
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
              placeholder={searchPlaceholder}
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3.5 py-2 pl-9 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </form>

          {/* Live Search Autocomplete Dropdown */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50">
              <div className="p-2.5 border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Matching Verified Creators</span>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {matchingCreators.length > 0 ? (
                  matchingCreators.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCreator(c.id)}
                      className="p-3 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            {c.username}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {c.category} • {(c.followers / 1000).toFixed(1)}k followers
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-extrabold text-blue-600 block">
                          {c.trustScore}/100
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          {c.scoreBand}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-xs text-slate-500">No matching creators found for &quot;{searchQuery}&quot;</p>
                    <Link
                      href={`/creators?query=${encodeURIComponent(searchQuery)}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
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
      )}

      {/* Right Action Icons & Contextual Buttons */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Optional Engine Status Badge (only if explicitly enabled) */}
        {showEngineBadge && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Bayesian Engine Active</span>
          </div>
        )}

        {/* Optional Contextual Action Elements */}
        {actions}

        {/* Optional Notifications Popover */}
        {showNotifications && (
          <div className="relative">
            <button
              onClick={() => setShowNotificationPopover(!showNotificationPopover)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
            </button>

            {showNotificationPopover && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-50 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Notifications &amp; Alerts
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <p className="font-semibold text-slate-800">System Ready</p>
                    <p className="text-slate-500 text-[11px]">
                      Your TrustScore account telemetry and notifications are active.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Optional Browse Creators CTA (only for business discovery pages) */}
        {showBrowseCreators && (
          <Link
            href="/creators"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Browse Creators</span>
          </Link>
        )}
      </div>
    </header>
  );
}

