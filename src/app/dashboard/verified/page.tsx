"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Creator } from "@/types/creator";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import { Modal } from "@/components/common/Modal";
import { formatNumber } from "@/lib/utils";
import {
  ShieldCheck,
  Award,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function VerifiedCreatorsPage() {
  const [verifiedCreators, setVerifiedCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [handle, setHandle] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadVerified() {
      try {
        const res = await fetch("/api/creators?verifiedOnly=true");
        if (res.ok) {
          const data = await res.json();
          setVerifiedCreators(data.creators || []);
        }
      } catch {
        // Network error
      } finally {
        setIsLoading(false);
      }
    }
    loadVerified();
  }, []);

  const handleConnectTelemetry = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setStatusMessage(null);
    setTimeout(() => {
      setIsConnecting(false);
      setStatusMessage("Platform API credentials are required in production environment to complete OAuth sync.");
    }, 1000);
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Verified Creators Portal"
        subtitle="Browse creators with cryptographically verified direct engagement telemetry"
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
              Verified creators connect direct analytics credentials or upload verifiable audit logs. This unlocks the highest confidence scoring and verified badge placement in the business marketplace.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all shrink-0 cursor-pointer self-start md:self-auto"
          >
            Apply for Verification Badge
          </button>
        </div>

        {/* Directory Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Verified Creator Cohort ({verifiedCreators.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Creators with cryptographically verified engagement and public authenticity dossiers
            </p>
          </div>

          <Link
            href="/creators?verifiedOnly=true"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>Explore on Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Verified Creators Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-xs font-semibold">Loading verified creators cohort...</span>
          </div>
        ) : verifiedCreators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verifiedCreators.map((creator) => (
              <div
                key={creator.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/creators/${creator.id}`}
                          className="font-bold text-slate-100 text-sm hover:text-blue-400 truncate block"
                        >
                          {creator.username}
                        </Link>
                        <VerificationBadge size="sm" showText={false} />
                      </div>
                      <span className="text-xs text-slate-400 block">{creator.name} • {creator.category}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {creator.bio}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Followers</span>
                      <strong className="text-slate-200">{formatNumber(creator.followers)}</strong>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">TrustScore</span>
                      <strong className="text-emerald-400">{creator.trustScore}/100</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/creators/${creator.id}`}
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>View Authenticity Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <h3 className="text-base font-bold text-slate-200">No verified creators yet</h3>
            <p className="text-xs text-slate-400">Complete verification to be the first creator listed in this cohort.</p>
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setStatusMessage(null);
          }}
          title="Apply for Direct Telemetry Verification"
        >
          <form onSubmit={handleConnectTelemetry} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                Your Primary Social Handle
              </label>
              <input
                type="text"
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@yourhandle"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500 text-xs"
              />
            </div>

            {statusMessage && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs leading-relaxed">
                {statusMessage}
              </div>
            )}

            <div className="pt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isConnecting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
              >
                {isConnecting ? "Initiating..." : "Submit for Verification"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
