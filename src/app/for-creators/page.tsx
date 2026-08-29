"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Layers,
  Cpu,
  Lock,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export default function ForCreatorsPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [handle, setHandle] = useState("@myhandle");
  const [name, setName] = useState("My Creator Profile");
  const [category, setCategory] = useState("Fitness");
  const [location, setLocation] = useState("Sydney, Australia");
  const [platform, setPlatform] = useState<"instagram" | "tiktok" | "youtube">("instagram");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setCurrentStep(4);
    }, 1800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white">
      <LandingNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Creator Authenticity Verification</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight">
            Let your authenticity <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
              speak for itself.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Build a trusted creator profile, demonstrate authentic community engagement, and make it easier for ambitious businesses to discover you.
          </p>
        </div>

        {/* 4-Step Interactive Creator Onboarding Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 max-w-3xl mx-auto space-y-8 shadow-xl">
          {/* Progress Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800 text-xs">
            {[
              { num: 1, label: "Profile" },
              { num: 2, label: "Connect Account" },
              { num: 3, label: "Trust Analysis" },
              { num: 4, label: "Live Profile" },
            ].map((step) => (
              <div
                key={step.num}
                className={`flex items-center gap-2 ${
                  currentStep >= step.num ? "text-blue-400 font-bold" : "text-slate-500"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep >= step.num
                      ? "bg-blue-600 text-white"
                      : "bg-slate-950 border border-slate-800 text-slate-500"
                  }`}
                >
                  {step.num}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </div>
            ))}
          </div>

          {/* Step 1: Create Profile */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-100">Step 1: Creator Identity Details</h3>
                <p className="text-xs text-slate-400">Enter your public handle and primary niche.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Username / Handle
                  </label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="Fitness">Fitness &amp; Health</option>
                    <option value="Beauty">Beauty &amp; Skincare</option>
                    <option value="Fashion">Fashion &amp; Styling</option>
                    <option value="Travel">Travel &amp; Adventure</option>
                    <option value="Food">Food &amp; Culinary</option>
                    <option value="Technology">Technology &amp; Dev</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Account Connect</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Connect Account */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-100">Step 2: Connect Social Graph</h3>
                <p className="text-xs text-slate-400">
                  Account connection is voluntary and provides direct Graph API telemetry for authenticity analysis.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "instagram", name: "Instagram Graph", icon: "instagram", connected: true },
                  { id: "tiktok", name: "TikTok Creator", icon: "tiktok", connected: false },
                  { id: "youtube", name: "YouTube Partner", icon: "youtube", connected: false },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-center"
                  >
                    <div className="flex justify-center">
                      <PlatformIcon platform={item.icon as any} size="lg" />
                    </div>
                    <span className="font-bold text-slate-200 text-xs block">{item.name}</span>
                    <button
                      type="button"
                      onClick={() => setPlatform(item.id as any)}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        platform === item.id
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {platform === item.id ? "✓ Connected" : "Connect"}
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-blue-950/30 border border-blue-800/40 rounded-2xl flex items-start gap-2.5 text-xs text-blue-200">
                <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  TrustScore uses read-only public engagement endpoints. We never post on your behalf, modify settings, or access private direct messages.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(3);
                    handleStartAnalysis();
                  }}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <span>Run TrustScore Analysis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Analysis Simulation */}
          {currentStep === 3 && (
            <div className="py-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center animate-spin">
                <Cpu className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  Computing Sample-Efficient TrustScore...
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                  Evaluating comment lexical entropy, 12-month follower growth monotonicity, and engagement consistency.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Live Verified Profile Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-100">
                  Congratulations, You&apos;re TrustScore Verified!
                </h3>
                <p className="text-xs text-slate-400">
                  Your creator profile is now live in the TrustScore discovery marketplace.
                </p>
              </div>

              {/* Profile Card Preview */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-500 text-blue-400 font-bold flex items-center justify-center text-lg">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-100">{handle}</span>
                        <VerificationBadge size="sm" showText={false} />
                      </div>
                      <span className="text-xs text-slate-400">{category} • {location}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-blue-400">92</span>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">TrustScore</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs p-2.5 bg-slate-900 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Followers</span>
                    <span className="font-bold text-slate-200">18.4K</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Engagement</span>
                    <span className="font-bold text-blue-400">5.1%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Authenticity</span>
                    <span className="font-bold text-emerald-400">94.2%</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <Link
                  href="/creators/alexfitness"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2"
                >
                  <span>View Public Marketplace Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
