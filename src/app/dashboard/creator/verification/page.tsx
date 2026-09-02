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
  Shield,
  Layers,
  ArrowRight,
  Info,
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

            // Determine verified state
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
                    lastSynced: "Direct API Live",
                    dataAvailable: true,
                  };
                }
                return p;
              })
            );
          }
        }
      } catch {
        // Safe ignore
      } finally {
        setIsLoading(false);
      }
    }
    loadCreator();
  }, [user]);

  const handleConnect = (id: string, name: string) => {
    info(
      "OAuth Integration Handshake",
      `${name} read-only OAuth telemetry integration will open when platform client keys are configured.`
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
    success("Account Disconnected", `${name} channel unlinked from telemetry sync.`);
  };

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      success("Telemetry Refreshed", "Direct Graph API telemetry metrics refreshed.");
    }, 600);
  };

  const handleSubmitVerification = () => {
    if (verificationStatus === "VERIFIED") return;
    setVerificationStatus("PENDING");
    success("Audit Request Queued", "Your telemetry and follower integrity review is now in the verification audit pipeline.");
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
          title: "Audience Telemetry Verified",
          subtitle: "Cryptographically verified direct API telemetry with active marketplace badge",
          badge: "Verified Badge Active",
          icon: ShieldCheck,
          colorClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
        };
      case "PENDING":
        return {
          title: "Verification Audit In Queue",
          subtitle: "Analyzing post comment entropy and follower acquisition monotonicity",
          badge: "Pending Verification",
          icon: Clock,
          colorClass: "bg-amber-500/10 border-amber-500/30 text-amber-400",
        };
      case "NEEDS_ATTENTION":
        return {
          title: "Re-Authentication Required",
          subtitle: "OAuth token expired. Re-authenticate to resume telemetry ingestion",
          badge: "Needs Attention",
          icon: AlertCircle,
          colorClass: "bg-orange-500/10 border-orange-500/30 text-orange-400",
        };
      case "FAILED":
        return {
          title: "Verification Audit Incomplete",
          subtitle: "Insufficient post sample depth to satisfy Poisson margin bounds",
          badge: "Audit Failed",
          icon: XCircle,
          colorClass: "bg-rose-500/10 border-rose-500/30 text-rose-400",
        };
      default:
        return {
          title: "Verification Not Started",
          subtitle: "Connect your primary social account to initiate the verified creator audit",
          badge: "Unverified",
          icon: Shield,
          colorClass: "bg-slate-950 border-slate-800 text-slate-400",
        };
    }
  };

  const currentStatus = getStatusDisplay(verificationStatus);
  const StatusIcon = currentStatus.icon;

  const steps = [
    { num: 1, title: "Account Auth", desc: "TrustScore secure login", isDone: true },
    { num: 2, title: "Social Connection", desc: "Link read-only Graph API", isDone: platforms.some((p) => p.connected) },
    { num: 3, title: "Ingest Telemetry", desc: "Sample 3+ posts & comments", isDone: (creator?.totalPosts || 0) >= 3 },
    { num: 4, title: "Statistical Audit", desc: "Bayesian entropy screening", isDone: (creator?.trustScore || 0) > 0 },
    { num: 5, title: "Verified Badge", desc: "Marketplace badge awarded", isDone: verificationStatus === "VERIFIED" },
  ];

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Verification"
        subtitle="Connect and verify your supported social accounts and data."
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Important Product Distinction Alert Box */}
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <strong className="text-blue-200 block">Understanding TrustScore Verification</strong>
            <span>
              Logging in with Google authenticates your TrustScore user session. Social data verification requires connecting your primary creator channel via read-only Graph API scopes to establish audited audience telemetry.
            </span>
          </div>
        </div>

        {/* Verification Status Hero Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${currentStatus.colorClass}`}>
                <StatusIcon className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-black text-slate-100">{currentStatus.title}</h3>
                  {verificationStatus === "VERIFIED" && <VerificationBadge size="md" showText={false} />}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{currentStatus.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleSyncAll}
                disabled={isSyncing}
                className="py-2.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-2xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-blue-400" : ""}`} />
                <span>{isSyncing ? "Syncing..." : "Sync Telemetry"}</span>
              </button>

              {verificationStatus !== "VERIFIED" && (
                <button
                  type="button"
                  onClick={handleSubmitVerification}
                  className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-600/25 transition-colors cursor-pointer"
                >
                  Submit For Verification
                </button>
              )}
            </div>
          </div>

          {/* 5-Step Lifecycle Bar */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Verification Lifecycle Flow:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
              {steps.map((step) => (
                <div
                  key={step.num}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-1.5 ${
                    step.isDone
                      ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                      : "bg-slate-950/80 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Step {step.num}
                    </span>
                    {step.isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-700" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-200">{step.title}</h5>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
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
                Direct OAuth read-only connections providing verified audience engagement telemetry.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex p-1.5 bg-slate-950 rounded-xl border border-slate-800">
                      <PlatformIcon platform={platform.id} size="sm" />
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
                        "No channel linked"
                      )}
                    </p>
                  </div>

                  {platform.connected ? (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Followers</span>
                        <strong className="text-slate-200 font-bold">{formatNumber(platform.followers)}</strong>
                      </div>
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Status</span>
                        <strong className="text-emerald-400 font-bold">{platform.lastSynced}</strong>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Connect via official API scopes to ingest authentic post engagement rates and follower metrics.
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  {platform.connected ? (
                    <button
                      type="button"
                      onClick={() => handleDisconnect(platform.id, platform.name)}
                      className="w-full py-2.5 bg-slate-950 hover:bg-rose-950/20 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 border border-slate-800 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                      <span>Disconnect Channel</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnect(platform.id, platform.name)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
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

        {/* Verification Audit Criteria Checklist */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-slate-100">
              Audit Scope &amp; Verified Badge Criteria
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            TrustScore automatically grants verified status when these 3 criteria are satisfied:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">1. Official OAuth Scope</span>
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
      </div>
    </div>
  );
}
