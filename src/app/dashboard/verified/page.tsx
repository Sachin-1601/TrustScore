"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MOCK_INFLUENCERS } from "@/data/mockInfluencers";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import { Modal } from "@/components/common/Modal";
import { formatNumber } from "@/lib/utils";
import {
  CheckCircle2,
  ShieldCheck,
  Award,
  Lock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Search,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function VerifiedCreatorsPage() {
  const verifiedCreators = MOCK_INFLUENCERS.filter((inf) => inf.verifiedBadge);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [handle, setHandle] = useState("@alexfitness");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSimulateOAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsSuccess(true);
      confetti({ particleCount: 80, spread: 60 });
    }, 1200);
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      <DashboardHeader
        title="Verified Creators Portal"
        subtitle="Browse creators with cryptographically verified OAuth engagement telemetry"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider border border-blue-400/30">
              <Award className="w-3.5 h-3.5" />
              <span>Direct Telemetry Verification</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Voluntary Creator Verification
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Creators who voluntarily connect their official accounts demonstrate stronger evidence of authenticity. Verification unlocks higher brand sponsor conversions and verified media kit badges.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verify an Account Now</span>
          </button>
        </div>

        {/* Verified Directory Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">
              Active Verified Creator Roster ({verifiedCreators.length})
            </h3>
            <span className="text-xs text-slate-500">
              Filtered for verified status
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verifiedCreators.map((inf) => (
              <div
                key={inf.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={inf.avatar}
                        alt={inf.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-100"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-base">
                          <span>{inf.username}</span>
                          <PlatformIcon platform={inf.platform} size="sm" />
                        </div>
                        <p className="text-xs text-slate-500">{inf.name} • {inf.category}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <VerificationBadge isVerified={true} verifiedDate={inf.verifiedDate} size="md" />
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    {inf.bio}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">TrustScore</span>
                      <span className="text-base font-extrabold text-blue-700">{inf.trustScore} / 100</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Inflated Risk</span>
                      <span className="text-base font-extrabold text-emerald-700">{inf.inflatedEngagementProbability}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{formatNumber(inf.followers)} followers</span>
                  <Link
                    href={`/dashboard/influencer/${inf.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    <span>View Audit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Claim Simulator Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsSuccess(false);
        }}
        title="Simulate Creator Verification"
        description="Connect Instagram Graph API or TikTok Creator Marketplace credentials via read-only OAuth."
      >
        {!isSuccess ? (
          <form onSubmit={handleSimulateOAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Creator Social Handle
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@username"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                Read-Only Telemetry Scopes
              </span>
              <p className="text-[11px] text-blue-700">
                Audits post reach, video watch duration, and impressions directly via authorized platform APIs.
              </p>
            </div>

            <button
              type="submit"
              disabled={isConnecting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying API Telemetry...</span>
                </>
              ) : (
                <>
                  <span>Connect &amp; Authenticate</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <Check className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Verification Certificate Generated!</h4>
              <p className="text-xs text-slate-500 mt-1">{handle} has been verified.</p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <VerificationBadge isVerified={true} size="lg" />
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl"
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
