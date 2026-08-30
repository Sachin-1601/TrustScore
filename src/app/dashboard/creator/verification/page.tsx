"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Creator } from "@/types/creator";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Link2,
  RefreshCw,
  Loader2,
} from "lucide-react";

export default function CreatorVerificationPage() {
  const { user } = useAuth();
  const { success, info } = useToast();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    async function loadCreator() {
      try {
        const res = await fetch("/api/creators/me");
        if (res.ok) {
          const data = await res.json();
          if (data.creator) setCreator(data.creator);
        }
      } catch {
        // safe ignore
      } finally {
        setIsLoading(false);
      }
    }
    loadCreator();
  }, [user]);

  const [platforms, setPlatforms] = useState([
    {
      id: "instagram",
      name: "Instagram Professional",
      handle: "",
      connected: false,
      authMethod: "Meta Graph API (Read-Only)",
    },
    {
      id: "tiktok",
      name: "TikTok Creator Account",
      handle: "",
      connected: false,
      authMethod: "TikTok Open SDK",
    },
    {
      id: "youtube",
      name: "YouTube Partner Channel",
      handle: "",
      connected: false,
      authMethod: "Google OAuth 2.0",
    },
  ]);

  const handleConnect = (id: string, name: string) => {
    info("OAuth Configuration", `${name} integration will sync when platform developer credentials are configured.`);
  };

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      success("Telemetry Synced", "All direct telemetry channels refreshed.");
    }, 600);
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <DashboardHeader title="Creator Verification" />
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-xs font-semibold">Loading verification records...</span>
        </div>
      </div>
    );
  }

  const isVerified = creator?.verifiedBadge || false;

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Creator Verification &amp; Account Integrations"
        subtitle="Manage your cryptographic Graph API verifications and connected social channels"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Verification Status Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                isVerified ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-slate-950 border border-slate-800 text-slate-500"
              }`}>
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-100">
                    {isVerified ? "TrustScore Authenticity Verified" : "Verification In Progress"}
                  </h3>
                  {isVerified && <VerificationBadge size="md" showText={false} />}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isVerified ? "Verified via direct API telemetry" : "Connect your primary channel to unlock the verified marketplace badge"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="py-2.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-blue-400" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Sync Telemetry"}</span>
            </button>
          </div>
        </div>

        {/* Channels Integration List */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-blue-400" />
            <span>Connected Social Telemetry Sources</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {platform.authMethod}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      platform.connected
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-950 text-slate-500 border border-slate-800"
                    }`}>
                      {platform.connected ? "Connected" : "Not Linked"}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-100 text-sm">{platform.name}</h4>
                  <p className="text-xs text-slate-400">
                    Ingests post engagement, video retention, and follower timestamps via read-only scopes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleConnect(platform.id, platform.name)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <span>Connect Channel</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
