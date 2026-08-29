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
  AlertTriangle,
  FileText,
  Lock,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [telemetry, setTelemetry] = useState({
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
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white">
      <LandingNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>Restricted Platform Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100">
              Admin &amp; Model Observability Console
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time model drift monitoring, platform telemetry, and data science integrity audits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400">All Systems Nominal</span>
          </div>
        </div>

        {/* 4 Core Platform Volume KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Creators</span>
            <p className="text-3xl font-black text-slate-100">{telemetry.totalCreators}</p>
            <span className="text-[11px] text-emerald-400 font-semibold">{telemetry.verifiedCreators} Verified</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Active Businesses</span>
            <p className="text-3xl font-black text-slate-100">{telemetry.totalBusinesses}</p>
            <span className="text-[11px] text-blue-400 font-semibold">10 Brand Partners</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Collaboration Pipeline</span>
            <p className="text-3xl font-black text-slate-100">{telemetry.totalCollaborations}</p>
            <span className="text-[11px] text-emerald-400 font-semibold">$18.4k volume</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Sponsored Ads</span>
            <p className="text-3xl font-black text-amber-400">{telemetry.activeAdvertisements}</p>
            <span className="text-[11px] text-slate-400">Strictly Isolated</span>
          </div>
        </div>

        {/* TrustScore Model Observability Panel */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base">TrustScore Model Engine Telemetry</h3>
                <p className="text-xs text-slate-400">Model Version: {telemetry.modelHealth.currentModelVersion} (Bayesian Shrinkage Architecture)</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Drift Status: {telemetry.modelHealth.driftStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Cross-Validation ROC-AUC</span>
              <span className="text-2xl font-black text-blue-400">{telemetry.modelHealth.crossValidationRocAuc}</span>
              <p className="text-[11px] text-slate-400">Discriminative power against synthetic injection benchmarks</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Brier Calibration Loss</span>
              <span className="text-2xl font-black text-emerald-400">{telemetry.modelHealth.brierCalibrationLoss}</span>
              <p className="text-[11px] text-slate-400">Exceptional calibration probability alignment</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">30-Day Evaluation Volume</span>
              <span className="text-2xl font-black text-slate-100">{telemetry.modelHealth.predictionCount30d.toLocaleString()}</span>
              <p className="text-[11px] text-slate-400">Automated Bayesian inferences processed</p>
            </div>
          </div>
        </div>

        {/* Score Distribution Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-100 text-base">Creator Authenticity Score Distribution</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-blue-400 font-bold block">Very High Trust (90+)</span>
              <span className="text-2xl font-black text-slate-100">{telemetry.scoreDistribution.veryHighTrust} creators</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-emerald-400 font-bold block">High Trust (75–89)</span>
              <span className="text-2xl font-black text-slate-100">{telemetry.scoreDistribution.highTrust} creators</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-amber-400 font-bold block">Moderate Risk (50–74)</span>
              <span className="text-2xl font-black text-slate-100">{telemetry.scoreDistribution.moderateRisk} creators</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-rose-400 font-bold block">High Risk (&lt;50)</span>
              <span className="text-2xl font-black text-slate-100">{telemetry.scoreDistribution.highRisk} creators</span>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
