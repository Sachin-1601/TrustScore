"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MOCK_INFLUENCERS } from "@/data/mockInfluencers";
import { Platform, Category } from "@/types/influencer";
import { generateSimulatedAnalysis, findInfluencerByQuery } from "@/lib/scoring";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import {
  Search,
  UploadCloud,
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
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [category, setCategory] = useState<Category>("Fitness");
  const [activeTab, setActiveTab] = useState<"url" | "upload">("url");

  // Simulation loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const simulationSteps = [
    { title: "Ingesting Public Creator Telemetry", desc: "Querying public graph endpoints & video watch histories..." },
    { title: "Computing Comment Lexical Entropy", desc: "Detecting repetitive patterns & reciprocal pod rings..." },
    { title: "Evaluating Follower Growth Variance", desc: "Running Poisson step-jump anomaly filters over 12 months..." },
    { title: "Executing Bayesian Shrinkage Model", desc: "Calibrating probabilistic uncertainty bounds & TrustScore..." },
    { title: "Generating Prescriptive Recommendations", desc: "Calculating proportional rate adjustments & contract terms..." },
  ];

  const presetProfiles = [
    { handle: "@alexfitness", platform: "instagram", cat: "Fitness", name: "Alex Rivera (High Trust 87)" },
    { handle: "@beautybymia", platform: "instagram", cat: "Beauty", name: "Mia Thorne (Moderate Risk 63)" },
    { handle: "@jordantravel", platform: "instagram", cat: "Travel", name: "Jordan Blake (Very High Trust 91)" },
    { handle: "@fitwithsam", platform: "instagram", cat: "Fitness", name: "Sam Vance (High Risk 38)" },
    { handle: "@lunabuilds", platform: "tiktok", cat: "Technology", name: "Luna Chen (Very High Trust 94)" },
    { handle: "@hypebeast_leo", platform: "instagram", cat: "Fashion", name: "Leo Sterling (High Risk 29)" },
  ];

  const handleRunAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setIsAnalyzing(true);
    setCurrentStepIndex(0);

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= simulationSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            const match = findInfluencerByQuery(inputUrl);
            const targetId = match ? match.id : inputUrl.replace("@", "").toLowerCase().split("/").pop() || "creator";
            router.push(`/dashboard/influencer/${targetId}`);
          }, 400);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
  };

  const handleSelectPreset = (p: (typeof presetProfiles)[0]) => {
    setInputUrl(p.handle);
    setPlatform(p.platform as Platform);
    setCategory(p.cat as Category);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-8">
      {/* Main Analysis Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200 shadow-md">
        {/* Tab Switcher: URL Input vs Batch File Upload */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("url")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "url"
                  ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Profile URL / Handle
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "upload"
                  ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Upload CSV / JSON
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Public Graph API &amp; OAuth Supported</span>
          </div>
        </div>

        {!isAnalyzing ? (
          activeTab === "url" ? (
            <form onSubmit={handleRunAnalysis} className="mt-6 space-y-6">
              {/* Platform Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Target Platform
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "instagram", label: "Instagram" },
                    { id: "tiktok", label: "TikTok" },
                    { id: "youtube", label: "YouTube" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPlatform(item.id as Platform)}
                      className={`py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                        platform === item.id
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <PlatformIcon platform={item.id as Platform} size="sm" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Influencer Profile URL or @Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="e.g. https://instagram.com/alexfitness or @alexfitness"
                    className="w-full px-4 py-3.5 pl-11 rounded-2xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-sm font-semibold text-slate-900"
                    required
                  />
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Preset Quick Picks */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Or select a pre-analyzed demo creator:
                </span>
                <div className="flex flex-wrap gap-2">
                  {presetProfiles.map((p) => (
                    <button
                      key={p.handle}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                    >
                      {p.handle} ({p.cat})
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy & Ethics Note */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Privacy &amp; Ethical Standards:</span>
                  <p className="mt-0.5 text-slate-500 leading-relaxed text-[11px]">
                    Only analyze public creator information or data provided with creator permission. TrustScore never accesses private direct messages or non-public creator data.
                  </p>
                </div>
              </div>

              {/* Submit Action Button */}
              <button
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-blue-200" />
                <span>Run TrustScore Analysis</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          ) : (
            /* CSV / JSON Upload Tab */
            <div className="mt-6 space-y-6">
              <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 sm:p-12 text-center hover:border-blue-500 hover:bg-blue-50/20 transition-all cursor-pointer">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Upload Batch Engagement Dataset
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                  Drag and drop your export file here, or browse local files. Supports .csv, .json, and .xlsx.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="px-2.5 py-1 bg-slate-100 rounded text-[11px] font-semibold text-slate-600">
                    CSV
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded text-[11px] font-semibold text-slate-600">
                    JSON
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setInputUrl("@alexfitness");
                    setActiveTab("url");
                  }}
                  className="px-6 py-3 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-blue-700"
                >
                  Load Sample CSV Roster
                </button>
              </div>
            </div>
          )
        ) : (
          /* Progressive Simulation State */
          <div className="py-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center animate-spin">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Running Probabilistic Engine
              </h3>
              <p className="text-xs text-slate-500">
                Processing signals for <span className="font-semibold text-slate-800">{inputUrl}</span>
              </p>
            </div>

            {/* Step by step checklist */}
            <div className="max-w-md mx-auto space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              {simulationSteps.map((step, idx) => {
                const isDone = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div
                    key={step.title}
                    className={`flex items-start gap-3 transition-opacity duration-300 ${
                      idx > currentStepIndex ? "opacity-30" : "opacity-100"
                    }`}
                  >
                    <div className="mt-0.5">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isCurrent ? (
                        <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin block" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-300 block" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{step.title}</p>
                      <p className="text-[11px] text-slate-500">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalyzeCreatorPage() {
  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      <DashboardHeader
        title="Analyze an Influencer"
        subtitle="Evaluate authenticity and compute calibrated engagement risk scores"
      />
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading analysis engine...</div>}>
        <AnalyzeContent />
      </Suspense>
    </div>
  );
}
