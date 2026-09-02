"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Creator } from "@/types/creator";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { CollaborationModal } from "@/components/marketplace/CollaborationModal";
import { formatNumber } from "@/lib/utils";
import {
  Bookmark,
  Trash2,
  Plus,
  Loader2,
  Send,
  ArrowRight,
} from "lucide-react";

export default function SavedCreatorsPage() {
  const [savedCreators, setSavedCreators] = useState<Creator[]>([]);
  const [selectedCollabCreator, setSelectedCollabCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadSaved = async () => {
    try {
      const res = await fetch("/api/creators/saved");
      if (res.ok) {
        const data = await res.json();
        setSavedCreators(data.creators || []);
      }
    } catch {
      // safe ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleRemove = async (id: string) => {
    setSavedCreators((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/creators/saved?creatorId=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch {
      // rollback if needed
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Saved Creators"
        subtitle="Bookmarked creator profiles and shortlisted candidates for upcoming campaigns"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-slate-100">
              Shortlisted Creators ({savedCreators.length})
            </h3>
          </div>

          <Link
            href="/creators"
            className="py-2 px-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Discover More Creators</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-xs font-semibold">Loading saved creators...</span>
          </div>
        ) : savedCreators.length > 0 ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Creator</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 text-right">Followers</th>
                    <th className="py-3.5 px-4 text-right">Engagement</th>
                    <th className="py-3.5 px-4 text-right">TrustScore</th>
                    <th className="py-3.5 px-4 text-right">Est. Rate</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {savedCreators.map((creator) => (
                    <tr key={creator.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={creator.avatar}
                            alt={creator.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/creators/${creator.id}`}
                                className="font-bold text-slate-100 hover:text-blue-400 transition-colors"
                              >
                                {creator.username}
                              </Link>
                              {creator.verifiedBadge && <VerificationBadge size="sm" showText={false} />}
                            </div>
                            <span className="text-[11px] text-slate-400">{creator.name}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                          {creator.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                        {formatNumber(creator.followers)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-blue-400">
                        {creator.engagementRate}%
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="font-extrabold text-blue-400">{creator.trustScore}</span>
                        <span className="text-[10px] text-slate-500">/100</span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                        ${creator.startingRate}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCollabCreator(creator)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[11px] cursor-pointer flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Collab</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(creator.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                            title="Remove from saved"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-16 text-center space-y-3">
            <Bookmark className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">You haven&apos;t saved any creators yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Bookmark creators from the marketplace or leaderboard to track their authenticity and invite them to collaboration campaigns.
            </p>
            <div className="pt-2">
              <Link
                href="/creators"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl"
              >
                <span>Browse Creator Marketplace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {selectedCollabCreator && (
        <CollaborationModal
          creator={selectedCollabCreator}
          isOpen={!!selectedCollabCreator}
          onClose={() => setSelectedCollabCreator(null)}
        />
      )}
    </div>
  );
}
