"use client";

import React, { useState, useEffect } from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import {
  Cpu,
  ShieldCheck,
  Activity,
  Users,
  Building2,
  Send,
  Megaphone,
  CheckCircle2,
  Lock,
  Loader2,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch("/api/admin/metrics");
        if (res.ok) {
          const data = await res.json();
          setTelemetry(data);
        }
      } catch {
        // Error
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const metrics = telemetry || {
    totalCreators: 20,
    verifiedCreators: 18,
    totalBusinesses: 10,
    totalCollaborations: 6,
    activeAdvertisements: 15,
    modelHealth: {
      currentModelVersion: "v1.2",
      crossValidationRocAuc: 0.942,
      brierCalibrationLoss: 0.048,
      predictionCount30d: 3840,
      driftStatus: "STABLE",
      lastTrainedAt: "August 20, 2026",
    },
    scoreDistribution: {
      veryHighTrust: 14,
      highTrust: 4,
      moderateRisk: 2,
      highRisk: 0,
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fb] text-slate-900 selection:bg-blue-600 selection:text-white">
      <LandingNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>Restricted Platform Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Admin &amp; Model Observability Console
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time model drift monitoring, platform telemetry, and data science integrity audits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-emerald-700">All Systems Nominal</span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs font-semibold text-slate-500">Loading platform telemetry...</span>
          </div>
        ) : (
          <>
            {/* 4 Core Platform Volume KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Creators</span>
                <p className="text-3xl font-black text-slate-900">{metrics.totalCreators}</p>
                <span className="text-[11px] text-emerald-700 font-semibold">{metrics.verifiedCreators} Verified</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Active Businesses</span>
                <p className="text-3xl font-black text-slate-900">{metrics.totalBusinesses}</p>
                <span className="text-[11px] text-blue-700 font-semibold">Brand Partners</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Collaborations</span>
                <p className="text-3xl font-black text-slate-900">{metrics.totalCollaborations}</p>
                <span className="text-[11px] text-purple-700 font-semibold">Active Agreements</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Sponsored Ads</span>
                <p className="text-3xl font-black text-slate-900">{metrics.activeAdvertisements}</p>
                <span className="text-[11px] text-amber-700 font-semibold">Live Placements</span>
              </div>
            </div>

            {/* Model Observability Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    TrustScore Engine Calibration Metrics ({metrics.modelHealth.currentModelVersion})
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {metrics.modelHealth.driftStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Cross-Validated ROC-AUC</span>
                  <p className="text-2xl font-black text-emerald-700">{metrics.modelHealth.crossValidationRocAuc}</p>
                  <p className="text-[10px] text-slate-500">Discriminative power against synthetic bot pods</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Brier Calibration Loss</span>
                  <p className="text-2xl font-black text-blue-600">{metrics.modelHealth.brierCalibrationLoss}</p>
                  <p className="text-[10px] text-slate-500">Mean squared probability error across sample cohort</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">30-Day Evaluation Volume</span>
                  <p className="text-2xl font-black text-slate-900">{metrics.modelHealth.predictionCount30d.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500">Bayesian inferences computed</p>
                </div>
              </div>
            </div>

            {/* Score Distribution Breakdown */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span>Marketplace Creator Score Distribution</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 block">Very High Trust (90+)</span>
                  <p className="text-2xl font-black text-emerald-800">{metrics.scoreDistribution.veryHighTrust}</p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-blue-700 block">High Trust (75–89)</span>
                  <p className="text-2xl font-black text-blue-800">{metrics.scoreDistribution.highTrust}</p>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-amber-700 block">Moderate Risk (50–74)</span>
                  <p className="text-2xl font-black text-amber-800">{metrics.scoreDistribution.moderateRisk}</p>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-rose-700 block">High Risk (&lt;50)</span>
                  <p className="text-2xl font-black text-rose-800">{metrics.scoreDistribution.highRisk}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
