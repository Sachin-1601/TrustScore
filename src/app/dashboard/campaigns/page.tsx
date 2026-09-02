"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useToast } from "@/contexts/ToastContext";
import {
  Briefcase,
  Plus,
  DollarSign,
  Users,
  ArrowRight,
  Loader2,
  Calendar,
  FileText,
  X,
  Sparkles,
} from "lucide-react";

interface CampaignItem {
  id: string;
  title: string;
  category: string;
  budget: number;
  status: string;
  deliverables: string;
  targetMinTrustScore?: number;
  targetFollowerRange?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  applications?: any[];
  collaborations?: any[];
}

export default function CampaignsPage() {
  const { success, error: toastError } = useToast();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Fitness");
  const [budget, setBudget] = useState("5000");
  const [deliverables, setDeliverables] = useState("1x Dedicated Reel, 2x Story Posts with link sticker");
  const [targetMinTrustScore, setTargetMinTrustScore] = useState(80);
  const [targetFollowerRange, setTargetFollowerRange] = useState("10k-50k");

  const loadCampaigns = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/campaigns");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch {
      // safe ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !budget) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          budget: Number(budget),
          deliverables: deliverables.trim(),
          targetMinTrustScore: Number(targetMinTrustScore),
          targetFollowerRange,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        success("Campaign Created", "Your new marketing campaign has been published.");
        setIsCreateModalOpen(false);
        setTitle("");
        setBudget("5000");
        loadCampaigns();
      } else {
        const err = await res.json().catch(() => ({}));
        toastError("Creation Failed", err.error || "Could not create campaign.");
      }
    } catch (err: any) {
      toastError("Error", err.message || "Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Active Campaigns"
        subtitle="Manage multi-creator marketing rosters, deliverable schedules, and budget allocations"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-slate-100">
              Your Brand Campaigns ({campaigns.length})
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-md shadow-blue-600/25"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Campaign</span>
          </button>
        </div>

        {/* Campaign Cards List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-xs font-semibold">Loading brand campaigns...</span>
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-md hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-bold text-slate-100 text-base">{camp.title}</h4>
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          camp.status === "ACTIVE"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : camp.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {camp.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {camp.category} • Target Followers: {camp.targetFollowerRange || "10k-50k"} • Min TrustScore: {camp.targetMinTrustScore || 80}/100
                    </p>
                  </div>

                  <div className="flex items-center gap-6 text-xs self-start sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Budget</span>
                      <span className="text-base font-black text-emerald-400">
                        ${Math.round(camp.budget).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Applications</span>
                      <span className="text-sm font-bold text-slate-200">
                        {camp.applications?.length || 0} Creators
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deliverables requirement */}
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                  <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{camp.deliverables}</p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
                  <Link
                    href="/creators"
                    className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    <span>+ Invite Creators to Campaign</span>
                  </Link>

                  <span className="text-[11px] text-slate-500">
                    Created: {new Date(camp.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-16 text-center space-y-4 shadow-md">
            <Briefcase className="w-10 h-10 text-slate-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-200">No campaigns yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Create structured influencer marketing campaigns to recruit authentic creators, set deliverable milestones, and allocate budgets.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-600/25 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Campaign</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-slate-100">Create New Campaign</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q4 Hydration Product Launch"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="Fitness">Fitness &amp; Health</option>
                    <option value="Beauty">Beauty &amp; Skincare</option>
                    <option value="Travel">Travel &amp; Adventure</option>
                    <option value="Technology">Technology &amp; Gaming</option>
                    <option value="Fashion">Fashion &amp; Style</option>
                    <option value="Food">Food &amp; Culinary</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Budget ($ USD)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    step="50"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Min TrustScore</label>
                  <select
                    value={targetMinTrustScore}
                    onChange={(e) => setTargetMinTrustScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                  >
                    <option value={75}>75+ (Moderate Risk)</option>
                    <option value={80}>80+ (High Authenticity)</option>
                    <option value={90}>90+ (Elite Verified)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Follower Target</label>
                  <select
                    value={targetFollowerRange}
                    onChange={(e) => setTargetFollowerRange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="5k-15k">Nano (5k-15k)</option>
                    <option value="10k-50k">Micro (10k-50k)</option>
                    <option value="50k-250k">Mid-Tier (50k-250k)</option>
                    <option value="250k+">Macro (250k+)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">Deliverables Requirements</label>
                <textarea
                  rows={3}
                  required
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                  placeholder="e.g. 1x Instagram Reel with product demonstration, 2x 24hr Stories with UTM link sticker"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-semibold focus:outline-hidden focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-blue-600/25"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Publish Campaign</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
