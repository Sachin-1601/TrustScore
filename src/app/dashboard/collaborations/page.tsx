"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MOCK_COLLABORATION_REQUESTS } from "@/data/mockCollaborations";
import { CollaborationRequest } from "@/types/creator";
import {
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  DollarSign,
  Calendar,
  Sparkles,
  ArrowRight,
  Plus,
} from "lucide-react";

export default function CollaborationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "Active" | "Pending" | "Accepted" | "Completed">("all");
  const [requests, setRequests] = useState<CollaborationRequest[]>(MOCK_COLLABORATION_REQUESTS);

  const filteredRequests = requests.filter((r) => {
    if (activeTab === "all") return true;
    return r.status === activeTab;
  });

  const getStatusBadge = (status: CollaborationRequest["status"]) => {
    switch (status) {
      case "Active":
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">Active</span>;
      case "Accepted":
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Accepted</span>;
      case "Pending":
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>;
      case "Completed":
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">Completed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">Declined</span>;
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Collaboration Pipeline"
        subtitle="Manage brand sponsorship proposals, milestone deliverables, and campaign agreements"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Controls & Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-2xl">
            {(["all", "Active", "Pending", "Accepted", "Completed"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer capitalize ${
                  activeTab === tab
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab === "all" ? "All Requests" : tab}
              </button>
            ))}
          </div>

          <Link
            href="/creators"
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Collaboration Request</span>
          </Link>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <img
                    src={req.creatorAvatar}
                    alt={req.creatorUsername}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/creators/${req.creatorId}`}
                        className="font-bold text-slate-100 text-sm hover:text-blue-400 transition-colors"
                      >
                        {req.creatorUsername}
                      </Link>
                      {getStatusBadge(req.status)}
                    </div>
                    <p className="text-xs text-slate-400 font-semibold">{req.campaignName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Agreed Budget</span>
                    <span className="text-sm font-extrabold text-emerald-400">${req.budget} USD</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Timeline</span>
                    <span className="text-slate-300 font-semibold">{req.timeline}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1 text-slate-300">
                <p>
                  <strong className="text-slate-400">Deliverables:</strong> {req.deliverables}
                </p>
                <p className="text-slate-400 text-[11px]">
                  {req.campaignDescription}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Submitted on {new Date(req.createdAt).toLocaleDateString()}</span>
                <Link
                  href={`/creators/${req.creatorId}`}
                  className="font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <span>View Creator Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
