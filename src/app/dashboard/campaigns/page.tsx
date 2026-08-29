"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  Briefcase,
  Plus,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function CampaignsPage() {
  const campaigns = [
    {
      id: "camp-1",
      title: "Q4 Hydration Launch Roster",
      category: "Fitness & Wellness",
      status: "Active",
      budget: "$8,500",
      creatorsCount: 6,
      completedDeliverables: "4 / 6 Delivered",
      progress: 66,
      startDate: "Aug 15, 2026",
      endDate: "Oct 15, 2026",
    },
    {
      id: "camp-2",
      title: "Autumn Capsule Styling Showcase",
      category: "Fashion & Apparel",
      status: "In Planning",
      budget: "$4,200",
      creatorsCount: 4,
      completedDeliverables: "0 / 4 Scheduled",
      progress: 15,
      startDate: "Sep 01, 2026",
      endDate: "Oct 30, 2026",
    },
    {
      id: "camp-3",
      title: "Clean Skincare Barrier Campaign",
      category: "Beauty",
      status: "Completed",
      budget: "$6,000",
      creatorsCount: 5,
      completedDeliverables: "5 / 5 Completed",
      progress: 100,
      startDate: "Jul 01, 2026",
      endDate: "Aug 20, 2026",
    },
  ];

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
            className="py-2 px-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Campaign</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-100 text-base">{camp.title}</h4>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        camp.status === "Active"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : camp.status === "Completed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {camp.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{camp.category} • {camp.startDate} – {camp.endDate}</p>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Budget</span>
                    <span className="text-sm font-extrabold text-emerald-400">{camp.budget}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Creators</span>
                    <span className="text-sm font-bold text-slate-200">{camp.creatorsCount} Creators</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                  <span>Deliverables Progress ({camp.completedDeliverables})</span>
                  <span className="text-blue-400">{camp.progress}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${camp.progress}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
                <Link
                  href="/creators"
                  className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                >
                  <span>+ Add More Creators</span>
                </Link>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold text-xs"
                >
                  Manage Roster
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
