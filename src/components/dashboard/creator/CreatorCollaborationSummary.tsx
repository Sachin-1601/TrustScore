"use client";

import React from "react";
import Link from "next/link";
import { CollaborationRequest } from "@/types/creator";
import { Send, ArrowRight, DollarSign, Clock, CheckCircle2, MessageSquare } from "lucide-react";

interface CreatorCollaborationSummaryProps {
  collaborations: CollaborationRequest[];
}

export function CreatorCollaborationSummary({ collaborations }: CreatorCollaborationSummaryProps) {
  const newRequests = collaborations.filter(
    (c) => c.status?.toLowerCase() === "pending"
  );
  const inDiscussion = collaborations.filter(
    (c) => c.status?.toLowerCase() === "accepted"
  );
  const activeCollabs = collaborations.filter(
    (c) => c.status?.toLowerCase() === "active"
  );
  const completedCollabs = collaborations.filter(
    (c) => c.status?.toLowerCase() === "completed"
  );

  const recentList = collaborations.slice(0, 3);

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "pending") {
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
    if (s === "active" || s === "accepted") {
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
    if (s === "completed") {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
    return "bg-slate-800 text-slate-400 border-slate-700";
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-emerald-400" />
          <h3 className="text-base font-bold text-slate-100">
            Collaboration Pipeline
          </h3>
        </div>
        <Link
          href="/dashboard/collaborations"
          className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
        >
          <span>Manage</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 4 Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">New</span>
          <span className="text-lg font-black text-slate-100">{newRequests.length}</span>
        </div>
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">Accepted</span>
          <span className="text-lg font-black text-slate-100">{inDiscussion.length}</span>
        </div>
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">Active</span>
          <span className="text-lg font-black text-slate-100">{activeCollabs.length}</span>
        </div>
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Done</span>
          <span className="text-lg font-black text-slate-100">{completedCollabs.length}</span>
        </div>
      </div>

      {/* List / Empty State */}
      <div className="space-y-3 pt-1">
        {recentList.length > 0 ? (
          recentList.map((collab) => (
            <div
              key={collab.id}
              className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{collab.businessName || "Brand"}</span>
                <span className="font-black text-emerald-400">${collab.budget || 0}</span>
              </div>
              <p className="text-slate-400 text-[11px] truncate">
                {collab.campaignName || "Campaign proposal"}
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(collab.status)}`}>
                  {collab.status}
                </span>
                <Link
                  href="/dashboard/collaborations"
                  className="text-[11px] font-semibold text-blue-400 hover:text-blue-300"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800 text-center space-y-2">
            <p className="text-xs font-bold text-slate-300">
              No collaboration requests yet
            </p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Once brands discover your profile on the TrustScore marketplace, new sponsorship proposals will appear here.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/creator/profile"
                className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl transition-all"
              >
                <span>Boost Profile Discoverability</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
