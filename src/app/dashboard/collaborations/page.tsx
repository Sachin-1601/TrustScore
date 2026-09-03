"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CollaborationRequest } from "@/types/creator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
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
  Building2,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export default function CollaborationsPage() {
  const { role } = useAuth();
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<"all" | "Active" | "Pending" | "Accepted" | "Completed" | "Declined">("all");
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

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
    setProcessingId(id);
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
        success("Status Updated", `Collaboration proposal marked as ${newStatus}.`);
      } else {
        const err = await res.json().catch(() => ({}));
        toastError("Update Failed", err.error || "Could not update status.");
      }
    } catch (err: any) {
      toastError("Error", err.message || "Network error.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (activeTab === "all") return true;
    return r.status?.toLowerCase() === activeTab.toLowerCase();
  });

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "active":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">Active</span>;
      case "accepted":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">Accepted</span>;
      case "pending":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
      case "completed":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">Completed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">{status || "Declined"}</span>;
    }
  };

  const isCreator = role === "CREATOR";

  const newRequestsCount = requests.filter((r) => r.status?.toLowerCase() === "pending").length;
  const inDiscussionCount = requests.filter((r) => r.status?.toLowerCase() === "accepted").length;
  const activeCount = requests.filter((r) => r.status?.toLowerCase() === "active").length;
  const completedCount = requests.filter((r) => r.status?.toLowerCase() === "completed").length;

  return (
    <div className="min-h-full flex flex-col bg-[#f8f9fb] text-slate-900">
      <DashboardHeader
        title="Collaborations"
        subtitle="Manage brand proposals, active partnerships, and completed collaborations."
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Pipeline Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">New Requests</span>
            <div className="text-2xl font-black text-slate-900">{newRequestsCount}</div>
            <p className="text-[10px] text-slate-400">Awaiting your review</p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">In Discussion</span>
            <div className="text-2xl font-black text-slate-900">{inDiscussionCount}</div>
            <p className="text-[10px] text-slate-400">Accepted &amp; coordinating</p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">Active Deals</span>
            <div className="text-2xl font-black text-slate-900">{activeCount}</div>
            <p className="text-[10px] text-slate-400">Content in production</p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Completed</span>
            <div className="text-2xl font-black text-slate-900">{completedCount}</div>
            <p className="text-[10px] text-slate-400">Delivered &amp; archived</p>
          </div>
        </div>

        {/* Filter Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-white border border-slate-200 rounded-xl shadow-xs">
            {(["all", "Pending", "Accepted", "Active", "Completed", "Declined"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer capitalize ${
                  activeTab === tab
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {tab === "all" ? `All (${requests.length})` : tab}
              </button>
            ))}
          </div>

          {!isCreator && (
            <Link
              href="/creators"
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Collaboration Request</span>
            </Link>
          )}
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs font-semibold text-slate-500">Loading collaboration pipeline...</span>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-black text-sm shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-base">{req.businessName || "Verified Brand"}</h4>
                        {getStatusBadge(req.status)}
                      </div>
                      <span className="text-xs text-slate-500 mt-0.5 block">
                        Campaign: <strong className="text-slate-800">{req.campaignName}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 text-xs font-bold self-start sm:self-auto">
                    <div className="flex items-center gap-1 text-slate-800">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span className="text-base font-black text-emerald-600">${req.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 font-normal">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.timeline}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{req.deliverables}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                  <span className="text-[11px] text-slate-400">
                    Received: {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>

                  <div className="flex items-center gap-2.5">
                    {req.status === "Pending" && (
                      <>
                        <button
                          type="button"
                          disabled={processingId === req.id}
                          onClick={() => handleUpdateStatus(req.id, "Accepted")}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept Offer</span>
                        </button>
                        <button
                          type="button"
                          disabled={processingId === req.id}
                          onClick={() => handleUpdateStatus(req.id, "Declined")}
                          className="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200 font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </>
                    )}

                    <Link
                      href={`/dashboard/messages?collaborationId=${req.id}`}
                      className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>Thread Messages</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-4 shadow-xs">
            <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                No collaborations in this view
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {isCreator
                  ? "When businesses discover your public creator profile on the marketplace and send campaign proposals, they will appear here for your review."
                  : "Find authentic creators on the marketplace to send direct sponsorship agreements."}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href={isCreator ? "/dashboard/creator/profile" : "/creators"}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                <span>{isCreator ? "Manage Profile Visibility" : "Browse Creator Marketplace"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
