"use client";

import React, { useState } from "react";
import { Creator } from "@/types/creator";
import { Modal } from "@/components/common/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  Send,
  CheckCircle2,
  DollarSign,
  Calendar,
  Sparkles,
  ShieldCheck,
  Mail,
  Building2,
  Layers,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface CollaborationModalProps {
  creator: Creator;
  isOpen: boolean;
  onClose: () => void;
}

export function CollaborationModal({
  creator,
  isOpen,
  onClose,
}: CollaborationModalProps) {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [businessName, setBusinessName] = useState(user?.name || "");
  const [campaignName, setCampaignName] = useState("");
  const [campaignDesc, setCampaignDesc] = useState("");
  const [budget, setBudget] = useState(creator.startingRate ? `${creator.startingRate}` : "500");
  const [deliverables, setDeliverables] = useState(
    creator.preferredCampaignTypes?.[0] || "1 Dedicated Reel + Story Series"
  );
  const [timeline, setTimeline] = useState("2 Weeks");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/collaborations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: creator.id,
          businessName,
          campaignName,
          campaignDescription: campaignDesc || "Brand sponsorship proposal via TrustScore Discover.",
          budget: Number(budget),
          deliverables,
          timeline,
          contactEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toastError("Submission Error", data.error || "Failed to submit collaboration proposal.");
        return;
      }

      setIsSubmitted(true);
      success("Proposal Sent", `Collaboration offer dispatched to ${creator.username}.`);
    } catch (err: any) {
      toastError("Error", err.message || "Failed to submit collaboration proposal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setCampaignName("");
    setCampaignDesc("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleReset} title="" maxWidth="lg">
      <div className="text-slate-100" data-testid="collaborate-modal">
        {!isSubmitted ? (
          <div>
            {/* Header with Creator Info */}
            <div className="flex items-center gap-3.5 pb-5 border-b border-slate-800">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-13 h-13 rounded-2xl object-cover border border-slate-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-100 truncate">
                    Collaborate with {creator.username}
                  </h3>
                  {creator.trustScore > 0 && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                      {creator.trustScore} TrustScore
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {creator.category} • {creator.location} • Est. Rate: ${creator.startingRate} USD
                </p>
              </div>
            </div>

            {/* Collaboration Request Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Your Business / Brand Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Brand"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500 text-xs"
                    />
                    <Building2 className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Contact Work Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="partnerships@brand.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500 text-xs"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autumn Product Launch & Creator Showcase"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Proposed Budget (USD)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      placeholder="500"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full px-3 py-2.5 pl-7 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500 text-xs"
                    />
                    <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Timeline Target
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2 Weeks"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500 text-xs"
                    />
                    <Calendar className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Requested Deliverables
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1 Dedicated 60s Reel + 2 Story Frames with link"
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Brief Campaign Overview
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe your brand, campaign objectives, key messaging points, and shipping details..."
                  value={campaignDesc}
                  onChange={(e) => setCampaignDesc(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500 text-xs"
                />
              </div>

              {/* TrustScore Collaboration Protection Notice */}
              <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl flex items-start gap-2 text-[11px] text-blue-200">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p>
                  TrustScore protects brand collaborations with data-backed tracking and authenticity validation throughout campaign delivery.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800/60 text-slate-300 font-semibold transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer text-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Proposal...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Collaboration Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation Success State */
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                Collaboration Request Sent!
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                Your proposal for <span className="text-blue-400 font-semibold">{campaignName || "Campaign"}</span> has been transmitted to <span className="font-semibold text-slate-200">{creator.username}</span>. You will receive updates at <span className="text-slate-200 font-semibold">{contactEmail}</span>.
              </p>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                Back to Marketplace
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
