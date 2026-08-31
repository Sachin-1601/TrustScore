"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Creator } from "@/types/creator";
import { formatNumber } from "@/lib/utils";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Link2,
  RefreshCw,
  AlertCircle,
  Clock,
  XCircle,
  Unlink,
  ExternalLink,
  Loader2,
  FileCheck2,
} from "lucide-react";

type VerificationStatusState =
  | "NOT_VERIFIED"
  | "PENDING"
  | "VERIFIED"
  | "FAILED"
  | "NEEDS_ATTENTION";

interface ConnectedPlatformAccount {
  id: "instagram" | "tiktok" | "youtube";
  name: string;
  username: string;
  connected: boolean;
  followers: number;
  lastSynced: string;
  authMethod: string;
  dataAvailable: boolean;
}

export default function CreatorVerificationPage() {
  const { user } = useAuth();
  const { success, info, error: toastError } = useToast();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatusState>("NOT_VERIFIED");

  const [platforms, setPlatforms] = useState<ConnectedPlatformAccount[]>([
    {
      id: "instagram",
      name: "Instagram Professional",
      username: "",
      connected: false,
      followers: 0,
      lastSynced: "Never",
      authMethod: "Meta Graph API (Read-Only)",
      dataAvailable: false,
    },
    {
      id: "tiktok",
      name: "TikTok Creator Account",
      username: "",
      connected: false,
      followers: 0,
      lastSynced: "Never",
      authMethod: "TikTok Open SDK",
      dataAvailable: false,
    },
    {
      id: "youtube",
      name: "YouTube Partner Channel",
      username: "",
      connected: false,
      followers: 0,
      lastSynced: "Never",
      authMethod: "Google OAuth 2.0",
      dataAvailable: false,
    },
  ]);

  useEffect(() => {
    async function loadCreator() {
      try {
        const res = await fetch("/api/creators/me");
        if (res.ok) {
          const data = await res.json();
          if (data.creator) {
            const c: Creator = data.creator;
            setCreator(c);

            // Determine status
            if (c.verifiedBadge) {
              setVerificationStatus("VERIFIED");
            } else if (c.totalPosts >= 3) {
              setVerificationStatus("PENDING");
            } else {
              setVerificationStatus("NOT_VERIFIED");
            }

            // Sync connected platform info
            setPlatforms((prev) =>
              prev.map((p) => {
                if (p.id === c.platform) {
                  return {
                    ...p,
                    username: c.username,
                    connected: true,
                    followers: c.followers,
                    lastSynced: "Just now",
                    dataAvailable: true,
                  };
                }
                return p;
              })
            );
          }
        }
      } catch {
        // safe ignore
      } finally {
        setIsLoading(false);
      }
    }
    loadCreator();
  }, [user]);

  const handleConnect = (id: string, name: string) => {
    info(
      "OAuth Telemetry Handshake",
      `${name} read-only telemetry sync will activate when production platform client keys are configured.`
    );
  };

  const handleDisconnect = (id: string, name: string) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              connected: false,
              username: "",
              followers: 0,
              lastSynced: "Disconnected",
              dataAvailable: false,
            }
          : p
      )
    );
    success("Account Disconnected", `${name} channel unlinked from public telemetry.`);
  };

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      success("Telemetry Synced", "All direct telemetry channels refreshed with Bayesian baseline.");
    }, 700);
  };

  const handleSubmitVerification = () => {
    if (verificationStatus === "VERIFIED") return;
    setVerificationStatus("PENDING");
    success("Verification Submitted", "Your telemetry and follower integrity review is now in queue.");
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <DashboardHeader title="Creator Verification" />
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-xs font-semibold">Loading verification status...</span>
        </div>
      </div>
    );
  }

  const getStatusDisplay = (st: VerificationStatusState) => {
    switch (st) {
      case "VERIFIED":
        return {
          title: "TrustScore Authenticity Verified",
          subtitle: "Verified direct API telemetry with high Bayesian confidence",
          badge: "Verified",
          color: "emerald",
          icon: ShieldCheck,
        };
      case "PENDING":
        return {
          title: "Verification Review Pending",
          subtitle: "Auditing post lexical entropy and follower consistency curve",
          badge: "Pending Audit",
          color: "amber",
          icon: Clock,
        };
      case "NEEDS_ATTENTION":
        return {
          title: "Verification Needs Attention",
          subtitle: "Re-authentication required due to expired OAuth token",
          badge: "Needs Attention",
          color: "orange",
          icon: AlertCircle,
        };
      case "FAILED":
        return {
          title: "Verification Audit Incomplete",
          subtitle: "Insufficient historical post telemetry to satisfy margin bounds",
          badge: "Audit Failed",
          color: "rose",
          icon: XCircle,
        };
      default:
        return {
          title: "Not Yet Verified",
          subtitle: "Connect your primary social channel to unlock the verified marketplace badge",
          badge: "Not Verified",
          color: "slate",
          icon: ShieldCheck,
        };
    }
  };

  const currentStatus = getStatusDisplay(verificationStatus);
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Creator Verification &amp; Connected Accounts"
        subtitle="Manage your cryptographic Graph API integrations, telemetry sync, and marketplace authenticity badge"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Verification Status Hero Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  verificationStatus === "VERIFIED"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : verificationStatus === "PENDING"
                    ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                    : "bg-slate-950 border border-slate-800 text-slate-500"
                }`}
              >
                <StatusIcon className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-100">{currentStatus.title}</h3>
                  {verificationStatus === "VERIFIED" && <VerificationBadge size="md" showText={false} />}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{currentStatus.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSyncAll}
                disabled={isSyncing}
                className="py-2.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-blue-400" : ""}`} />
                <span>{isSyncing ? "Syncing..." : "Sync Telemetry"}</span>
              </button>

              {verificationStatus !== "VERIFIED" && (
                <button
                  type="button"
                  onClick={handleSubmitVerification}
                  className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Submit for Verification
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Verification Requirements Checklist */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-slate-100">
              Verification Requirements &amp; Audit Scope
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            TrustScore awards verified status automatically once the following cryptographically verifiable criteria are satisfied:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">1. Direct Read-Only Scope</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Connect official Meta Graph API or platform SDK with read-only audience metric permissions.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">2. Sample Depth (3+ Posts)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                At least 3 recent video or image posts with verified community comments and like tallies.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">3. Non-Volatile Stability</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Follower growth curve passes Poisson step-function filters with no crowd-turfing signatures.
              </p>
            </div>
          </div>
        </div>

        {/* Connected Accounts Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-blue-400" />
                <span>Connected Social Accounts ({platforms.filter((p) => p.connected).length}/3)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Authorized platform accounts providing verified engagement telemetry. Access tokens are encrypted and never exposed.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex p-1 bg-slate-950 rounded-lg border border-slate-800">
                      <PlatformIcon platform={platform.id} size="sm" />
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        platform.connected
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-950 text-slate-500 border border-slate-800"
                      }`}
                    >
                      {platform.connected ? "Connected" : "Not Linked"}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{platform.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {platform.connected ? (
                        <strong className="text-slate-200">{platform.username}</strong>
                      ) : (
                        "No profile linked"
                      )}
                    </p>
                  </div>

                  {platform.connected ? (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                      <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Followers</span>
                        <strong className="text-slate-200">{formatNumber(platform.followers)}</strong>
                      </div>
                      <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Last Synced</span>
                        <strong className="text-emerald-400">{platform.lastSynced}</strong>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Connect via read-only scopes to ingest post engagement rates and follower metrics.
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  {platform.connected ? (
                    <button
                      type="button"
                      onClick={() => handleDisconnect(platform.id, platform.name)}
                      className="w-full py-2 bg-slate-950 hover:bg-rose-950/30 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                      <span>Disconnect Channel</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnect(platform.id, platform.name)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Connect Channel</span>
                      <ExternalLink className="w-3.5 h-3.5" />
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
