"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  PROTOTYPE_MODEL_METADATA,
  MODEL_PERFORMANCE_METRICS,
  FEATURE_IMPORTANCES,
  ROC_CURVE_DATA,
  CALIBRATION_CURVE_DATA,
  CONFUSION_MATRIX,
} from "@/data/modelInsightsData";
import {
  Cpu,
  Database,
  Layers,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  GitBranch,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ModelInsightsPage() {
  const [activeChart, setActiveChart] = useState<"roc" | "calibration">("roc");

  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      <DashboardHeader
        title="Model Insights & Data Science Transparency"
        subtitle="Sample-efficient probabilistic modeling specifications & prototype validation benchmark"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Prototype Transparency Notice Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-7 flex items-start gap-4">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm text-amber-900">
            <h4 className="font-bold text-amber-900 text-sm sm:text-base">
              Research Prototype Notice &amp; Academic Transparency
            </h4>
            <p className="leading-relaxed text-amber-800">
              The metrics, ROC curves, and confusion matrix below represent preliminary cross-validation benchmarks conducted on the prototype research benchmark dataset. They demonstrate model calibration for decision support rather than final commercial guarantees.
            </p>
          </div>
        </div>

        {/* Model Architecture Metadata Specs */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Model Pipeline Specifications
              </h3>
              <p className="text-xs text-slate-500">
                Sample-efficient architecture designed specifically for 1k–50k follower accounts
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
              {PROTOTYPE_MODEL_METADATA.modelStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Model Family</span>
              <p className="font-bold text-slate-900 text-sm">{PROTOTYPE_MODEL_METADATA.modelFamily}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Dataset Benchmark</span>
              <p className="font-bold text-slate-900 text-sm">{PROTOTYPE_MODEL_METADATA.datasetName}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Sample Size</span>
              <p className="font-bold text-slate-900 text-sm">{PROTOTYPE_MODEL_METADATA.datasetSize}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Validation Methodology</span>
              <p className="font-bold text-slate-900 text-sm">{PROTOTYPE_MODEL_METADATA.evaluationStatus}</p>
            </div>
          </div>
        </div>

        {/* Validation Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {MODEL_PERFORMANCE_METRICS.map((m) => (
            <div key={m.label} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">{m.label}</span>
              <p className="text-2xl font-extrabold text-blue-700">{m.value}</p>
              <span className="text-[10px] text-slate-500 font-medium block leading-tight">{m.sublabel}</span>
            </div>
          ))}
        </div>

        {/* Charts Grid: ROC-AUC vs Calibration Curve & Confusion Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: ROC-AUC & Calibration Visual */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  {activeChart === "roc" ? "ROC-AUC Discrimination Curve (0.942)" : "Brier Calibration Curve"}
                </h4>
                <p className="text-xs text-slate-500">
                  {activeChart === "roc"
                    ? "Demonstrates true positive sensitivity vs false positive rate"
                    : "Verifies that predicted probability matches empirical ground truth frequencies"}
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveChart("roc")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeChart === "roc" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600"
                  }`}
                >
                  ROC Curve
                </button>
                <button
                  onClick={() => setActiveChart("calibration")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeChart === "calibration" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600"
                  }`}
                >
                  Calibration
                </button>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === "roc" ? (
                  <LineChart data={ROC_CURVE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="fpr" stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: "False Positive Rate (FPR)", position: "insideBottom", offset: -5, fontSize: 10 }} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 1]} label={{ value: "True Positive Rate (TPR)", angle: -90, position: "insideLeft", fontSize: 10 }} />
                    <Tooltip
                      formatter={(val: any, name: any) => [val, name === "tpr" ? "TrustScore Model" : "Random Guessing Baseline"]}
                      contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="tpr" name="TrustScore Model (AUC = 0.942)" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: "#2563eb" }} />
                    <Line type="monotone" dataKey="baseline" name="Random Baseline (AUC = 0.50)" stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                  </LineChart>
                ) : (
                  <LineChart data={CALIBRATION_CURVE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="predictedProb" stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: "Predicted Probability", position: "insideBottom", offset: -5, fontSize: 10 }} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 1]} label={{ value: "Observed Relative Frequency", angle: -90, position: "insideLeft", fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                    <Legend />
                    <Line type="monotone" dataKey="observedFreq" name="TrustScore Calibrated Model" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: "#10b981" }} />
                    <Line type="monotone" dataKey="perfect" name="Perfect Calibration Line" stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column: Confusion Matrix & Feature Weights */}
          <div className="lg:col-span-5 space-y-6">
            {/* Confusion Matrix Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm">
                  Evaluation Confusion Matrix (n = 680 holdout)
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-center text-xs">
                {/* True Negative */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">True Negative (342)</span>
                  <p className="text-lg font-extrabold text-emerald-700">Genuine</p>
                  <p className="text-[10px] text-emerald-600">Correctly passed genuine creator</p>
                </div>

                {/* False Positive */}
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-rose-800 block">False Positive (38)</span>
                  <p className="text-lg font-extrabold text-rose-700">Type I Error</p>
                  <p className="text-[10px] text-rose-600">Genuine creator flagged as risky</p>
                </div>

                {/* False Negative */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block">False Negative (27)</span>
                  <p className="text-lg font-extrabold text-amber-700">Type II Error</p>
                  <p className="text-[10px] text-amber-600">Missed pod/bot manipulation</p>
                </div>

                {/* True Positive */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-blue-800 block">True Positive (273)</span>
                  <p className="text-lg font-extrabold text-blue-700">Inflated</p>
                  <p className="text-[10px] text-blue-600">Correctly flagged manipulation</p>
                </div>
              </div>
            </div>

            {/* Feature Weights Checklist */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">
                Empirical Feature Importances
              </h4>
              <div className="space-y-2 text-xs">
                {FEATURE_IMPORTANCES.slice(0, 4).map((f) => (
                  <div key={f.feature} className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-800 truncate max-w-[200px]">{f.feature}</span>
                      <span className="text-blue-600 font-bold">{(f.weight * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${f.weight * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
