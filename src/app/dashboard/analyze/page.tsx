"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import {
  Search,
  FileText,
  ShieldCheck,
  Cpu,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";

function AnalyzeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [inputUrl, setInputUrl] = useState(initialQuery || "https://instagram.com/alexfitness");
  const [platform, setPlatform] = useState<"instagram" | "tiktok" | "youtube">("instagram");
  const [category, setCategory] = useState("Fitness");
  const [activeTab, setActiveTab] = useState<"url" | "upload">("url");

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const simulationSteps = [
    { title: "Ingesting Public Creator Telemetry", desc: "Querying public graph endpoints & engagement snapshots..." },
    { title: "Computing Comment Lexical Entropy", desc: "Detecting repetitive patterns & reciprocal pod rings..." },
    { title: "Evaluating Follower Growth Variance", desc: "Running step-jump anomaly filters over 12 months..." },
    { title: "Executing Bayesian Shrinkage Model", desc: "Calibrating probabilistic uncertainty bounds & TrustScore..." },
    { title: "Generating Prescriptive Recommendations", desc: "Calculating proportional rate adjustments & contract terms..." },
  ];

  const presetProfiles = [
    { handle: "@alexfitness", platform: "instagram" as const, cat: "Fitness", name: "Alex Rivera (Verified High Trust)" },
    { handle: "@beautybymia", platform: "instagram" as const, cat: "Beauty", name: "Mia Thorne (Beauty Specialist)" },
    { handle: "@jordantravel", platform: "instagram" as const, cat: "Travel", name: "Jordan Blake (Travel Creator)" },
    { handle: "@lunabuilds", platform: "tiktok" as const, cat: "Technology", name: "Luna Chen (Tech Reviews)" },
  ];

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setCurrentStepIndex(0);

    const cleanHandle = inputUrl.replace("@", "").toLowerCase().split("/").pop() || "alexfitness";

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= simulationSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            router.push(`/dashboard/influencer/${cleanHandle}`);
          }, 300);
          return prev;
        }
        return prev + 1;
      });
    }, 450);
  };

  const handleSelectPreset = (p: (typeof presetProfiles)[0]) => {
    setInputUrl(p.handle);
    setPlatform(p.platform);
    setCategory(p.cat);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-8 text-slate-100">
      {/* Main Analysis Card */}
      <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-800 shadow-md">
        {/* Tab Switcher: URL Input vs Batch File Upload */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("url")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "url"
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                  : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              Profile URL / Handle
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "upload"
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                  : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              CSV Telemetry Ingestion
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Quota: 1 Creator Credit</span>
          </div>
        </div>

        {activeTab === "url" ? (
          <form onSubmit={handleRunAnalysis} className="mt-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Creator Profile URL or Handle
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://instagram.com/creator or @handle"
                  className="w-full px-4 py-3.5 pl-11 bg-slate-950 border border-slate-700 rounded-2xl text-slate-100 placeholder:text-slate-500 text-sm font-semibold focus:outline-hidden focus:border-blue-500 transition-all shadow-inner"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Platform & Category Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Target Social Platform
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["instagram", "tiktok", "youtube"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold capitalize flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        platform === p
                          ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <PlatformIcon platform={p} size="sm" />
                      <span>{p}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Industry Niche
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                >
                  <option value="Fitness">Fitness &amp; Nutrition</option>
                  <option value="Beauty">Beauty &amp; Skincare</option>
                  <option value="Travel">Travel &amp; Adventure</option>
                  <option value="Fashion">Fashion &amp; Style</option>
                  <option value="Technology">Technology &amp; Gaming</option>
                  <option value="Food">Food &amp; Culinary</option>
                </select>
              </div>
            </div>

            {/* Preset Demo Profiles */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Quick Benchmarks in Database:
              </span>
              <div className="flex flex-wrap gap-2">
                {presetProfiles.map((p) => (
                  <button
                    key={p.handle}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {p.handle} ({p.cat})
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? "Executing Bayesian Assessment..." : "Run TrustScore Analysis"}</span>
            </button>
          </form>
        ) : (
          <div className="py-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="font-bold text-slate-200 text-sm">Batch CSV Ingestion</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Upload exported CSV comment dumps or follower timestamp logs for batch scoring.
            </p>
          </div>
        )}

        {/* Live Step Progress Indicator */}
        {isAnalyzing && (
          <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400 animate-spin" />
                <span>{simulationSteps[currentStepIndex].title}</span>
              </span>
              <span className="text-blue-400">{Math.round(((currentStepIndex + 1) / simulationSteps.length) * 100)}%</span>
            </div>

            <p className="text-[11px] text-slate-400">
              {simulationSteps[currentStepIndex].desc}
            </p>

            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / simulationSteps.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Creator Authenticity Analysis"
        subtitle="Evaluate any creator profile against the Bayesian probabilistic fraud detection model"
      />
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading analysis engine...</div>}>
        <AnalyzeContent />
      </Suspense>
    </div>
  );
}
