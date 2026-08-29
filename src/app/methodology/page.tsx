"use client";

import React from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import {
  Cpu,
  Layers,
  ShieldCheck,
  Activity,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";

export default function MethodologyPage() {
  const pipelineSteps = [
    {
      num: "01",
      title: "Public Graph & Telemetry Ingestion",
      desc: "Ingests public media timestamps, likes, comments, and video view counts without requiring private account access.",
      math: "Input: Public graph data (n = 15–30 posts)",
    },
    {
      num: "02",
      title: "Comment Lexical Entropy & Gini Dispersion",
      desc: "Measures unique vocabulary stems, repeated patterns, emoji ratios, and identifies reciprocal engagement pod rings.",
      math: "H(C) = -∑ p(w) log₂ p(w)",
    },
    {
      num: "03",
      title: "12-Month Monotonicity Anomaly Filter",
      desc: "Evaluates follower growth history over 12 months using Poisson jump variance to identify artificial purchased spikes.",
      math: "λ(t) ~ Poisson(rate) + Anomaly(step)",
    },
    {
      num: "04",
      title: "Empirical Bayes Shrinkage & Uncertainty Bounds",
      desc: "Shrinks sparse sample noise toward robust category priors, yielding calibrated probabilities rather than crude heuristics.",
      math: "θ̂ᵢ = (σ²₀ yᵢ + σ²ᵢ μ₀) / (σ²₀ + σ²ᵢ)",
    },
    {
      num: "05",
      title: "Calibrated TrustScore & Prescriptive Guidance",
      desc: "Outputs a unified 0–100 TrustScore with confidence intervals and proportional fee adjustment guidance for marketers.",
      math: "TrustScore ∈ [0, 100], Uncertainty ±δ",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white">
      <LandingNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Header Title */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" />
            <span>Data Science Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight">
            The TrustScore Methodology
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            A sample-efficient probabilistic evaluation framework specifically engineered for micro- and nano-influencers (1,000–50,000 followers) with sparse historical data.
          </p>
        </div>

        {/* 5-Stage Pipeline */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-100">
            5-Stage Analytical Pipeline
          </h2>

          <div className="space-y-4">
            {pipelineSteps.map((step) => (
              <div
                key={step.num}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-black text-lg flex items-center justify-center shrink-0">
                    {step.num}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-100 text-base">{step.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{step.desc}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-blue-300 shrink-0">
                  {step.math}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Analytical Layers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3">
            <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
              Layer 1: Descriptive
            </span>
            <h4 className="font-bold text-slate-100 text-base">&quot;What Happened?&quot;</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Historical engagement curves, follower growth timelines, comment lexical diversity distributions, and engagement volatility metrics.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3">
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
              Layer 2: Predictive
            </span>
            <h4 className="font-bold text-slate-100 text-base">&quot;What Is Happening?&quot;</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calibrated estimated probability of inflated engagement, pod clustering detection, and confidence uncertainty intervals.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3">
            <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold uppercase tracking-wider">
              Layer 3: Prescriptive
            </span>
            <h4 className="font-bold text-slate-100 text-base">&quot;What Should You Do?&quot;</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Actionable non-binary decision support, proportional payment rate adjustment recommendations, and contract risk clauses.
            </p>
          </div>
        </div>

        {/* Links to Model Insights & Discover */}
        <div className="p-8 bg-slate-900/80 border border-slate-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-100">
              Inspect Academic Validation &amp; ROC-AUC Metrics
            </h3>
            <p className="text-xs text-slate-400">
              View empirical cross-validation benchmarks, Brier calibration curves, and confusion matrix demo.
            </p>
          </div>

          <Link
            href="/dashboard/model-insights"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0"
          >
            <span>View Model Insights Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
