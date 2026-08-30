"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { useToast } from "@/contexts/ToastContext";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Link2,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function CreatorVerificationPage() {
  const { success, info } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  const [platforms, setPlatforms] = useState([
    {
      id: "instagram",
      name: "Instagram Professional",
      handle: "@alexfitness",
      connected: true,
      verifiedDate: "August 30, 2026",
      authMethod: "Meta Graph API (Read-Only)",
    },
    {
      id: "tiktok",
      name: "TikTok Creator Account",
      handle: "",
      connected: false,
      verifiedDate: null,
      authMethod: "TikTok Open SDK",
    },
    {
      id: "youtube",
      name: "YouTube Partner Channel",
      handle: "",
      connected: false,
      verifiedDate: null,
      authMethod: "Google OAuth 2.0",
    },
  ]);

  const handleConnect = (id: string, name: string) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              connected: true,
              handle: "@alexfitness",
              verifiedDate: "August 30, 2026",
            }
          : p
      )
    );
    success(`${name} Connected!`, "Read-only audience metrics have been synced.");
  };

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      success("Telemetry Synced", "All connected platform metrics refreshed successfully.");
    }, 800);
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Creator Verification &amp; Account Integrations"
        subtitle="Manage your cryptographic Graph API verifications and connected social channels"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Verification Status Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-100">TrustScore Authenticity Verified</h3>
                  <VerificationBadge size="md" showText={false} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified on <strong className="text-slate-200">August 30, 2026</strong> via Meta Graph API
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isSyncing}
              onClick={handleSyncAll}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-blue-400" : ""}`} />
              <span>{isSyncing ? "Syncing Telemetry..." : "Refresh Telemetry"}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-100">Zero-Trust Read-Only Protection:</strong> TrustScore only requests read permissions for follower counts, post impressions, and comment threads. We never request publishing privileges or access your private direct messages.
            </div>
          </div>
        </div>

        {/* Platform OAuth Connections */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h4 className="font-bold text-slate-100 text-base">Connected Platform Accounts</h4>
            <p className="text-xs text-slate-400">
              Accounts verified with official APIs receive the verified checkmark badge on the TrustScore leaderboard.
            </p>
          </div>

          <div className="space-y-4">
            {platforms.map((plat) => (
              <div
                key={plat.id}
                className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-sm">{plat.name}</span>
                    {plat.connected ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Verified &amp; Linked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700">
                        Not Linked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {plat.connected ? `Connected as ${plat.handle} • ${plat.authMethod}` : `Verify using ${plat.authMethod}`}
                  </p>
                </div>

                <div>
                  {plat.connected ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Synced</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnect(plat.id, plat.name)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Connect Account</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
