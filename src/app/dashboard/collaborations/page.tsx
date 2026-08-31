"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CollaborationRequest } from "@/types/creator";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText,
  DollarSign,
  Calendar,
  ArrowRight,
  Plus,
  Loader2,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
} from "lucide-react";

export default function CollaborationsPage() {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "Active" | "Pending" | "Accepted" | "Completed" | "Declined">("all");
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCollaborations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/collaborations");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.collaborations || []);
      }
    } catch {
      // Network error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollaborations();
  }, [fetchCollaborations]);

  const handleUpdateStatus = async (id: string, newStatus: CollaborationRequest["status"]) => {
    try {
      const res = await fetch(`/api/collaborations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch {
      // Error updating status
    }
  };

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
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">{status || "Declined"}</span>;
    }
  };

  const isCreator = role === "CREATOR";

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title={isCreator ? "Inbound Collaboration Proposals" : "Campaign Collaboration Pipeline"}
        subtitle={
          isCreator
            ? "Review sponsorship offers, deliverables, and commercial partnership terms from brands"
            : "Manage creator proposals, milestone deliverables, and active campaign agreements"
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Controls & Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-2xl">
            {(["all", "Pending", "Accepted", "Active", "Completed", "Declined"] as const).map((tab) => (
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
                {tab === "all" ? "All Proposals" : tab}
              </button>
            ))}
          </div>

          {!isCreator && (
            <Link
              href="/creators"
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Collaboration Request</span>
            </Link>
          )}
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-xs font-semibold">Loading collaboration pipeline...</span>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs"
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
                      <span className="text-xs text-slate-400">
                        Campaign: <strong className="text-slate-200">{req.campaignName}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold self-start sm:self-auto">
                    <div className="flex items-center gap-1 text-slate-200">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span>${req.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 font-normal">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{req.timeline}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 text-xs text-slate-300 space-y-2">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{req.deliverables}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                  <span className="text-[11px] text-slate-500">
                    Created: {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>

                  <div className="flex items-center gap-2">
                    {req.status === "Pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(req.id, "Accepted")}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(req.id, "Declined")}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </>
                    )}

                    <Link
                      href={`/dashboard/messages?collaborationId=${req.id}`}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors flex items-center gap-1"
                    >
                      <span>Messages</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-16 text-center space-y-4">
            <Briefcase className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">No collaboration proposals in this view</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isCreator
                ? "When businesses discover your profile and send campaign offers, they will appear here for your review."
                : "Find authentic creators on the marketplace to send direct sponsorship agreements."}
            </p>
            {!isCreator && (
              <div className="pt-2">
                <Link
                  href="/creators"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                  <span>Browse Creator Marketplace</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
