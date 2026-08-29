import React from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { FEATURE_IMPORTANCES, PROTOTYPE_MODEL_METADATA } from "@/data/modelInsightsData";
import { ArrowRight, Database, Cpu, ShieldCheck, Layers, GitBranch, Binary, HelpCircle, CheckCircle2 } from "lucide-react";

export default function HowItWorksPage() {
  const pipelineSteps = [
    {
      step: "01",
      title: "Input Data Ingestion",
      icon: Database,
      desc: "Sparse profile telemetry from Instagram, TikTok, or YouTube (follower counts, following velocity, recent 30 posts, video views, and comment streams).",
      tags: ["Public Graph APIs", "Creator OAuth", "CSV/JSON batch imports"],
    },
    {
      step: "02",
      title: "Feature Engineering",
      icon: Binary,
      desc: "Extraction of domain-specific analytical signals designed for small sample sizes: comment lexical entropy, Poisson growth step jumps, and like-to-view constraints.",
      tags: ["Laplace Smoothing", "Gini Lexical Entropy", "Poisson Step Filters"],
    },
    {
      step: "03",
      title: "Probabilistic Inference",
      icon: Cpu,
      desc: "Empirical Bayes shrinkage ensemble combined with Isolation Trees to prevent false positive penalties on genuine nano-creators.",
      tags: ["Bayesian Priors", "Sample-Efficient Modeling", "Uncertainty Estimation"],
    },
    {
      step: "04",
      title: "Calibrated TrustScore",
      icon: ShieldCheck,
      desc: "Outputs a calibrated 0–100 TrustScore with an estimated inflated engagement percentage and confidence interval (e.g. 6.8% ± 1.8%).",
      tags: ["0–100 Continuous Scale", "Prototype Risk Bands", "Uncertainty Bounds"],
    },
    {
      step: "05",
      title: "Prescriptive Decision Guidance",
      icon: Layers,
      desc: "Provides proportional rate adjustment suggestions (e.g. 0–5% vs 20% discount), escrow recommendations, and campaign deliverables checklists.",
      tags: ["Decision Support", "Proportional Adjustments", "Risk Mitigation"],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <LandingNavbar />

      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider border border-blue-200">
              <Cpu className="w-3.5 h-3.5" />
              <span>Data Science Transparency</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              How TrustScore Works
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              A sample-efficient probabilistic evaluation framework designed to address the statistical challenge of sparse data in micro- and nano-influencer accounts.
            </p>
          </div>

          {/* Theoretical Framing Banner */}
          <div className="mt-12 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-slate-900">
              The Statistical Challenge of Micro-Creator Analytics
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              Traditional influencer analytics engines rely on millions of data points and years of historical post archives. When applied to micro-creators (1k–50k followers) who post only a few times a week, standard heuristic tools produce excessive false alarms or fail entirely.
            </p>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              TrustScore uses <strong>Empirical Bayes shrinkage</strong> to pool category-level priors with sparse individual signals. This ensures that genuine creators aren&apos;t penalized for small sample variances, while coordinated bot rings and engagement pods are detected with high sensitivity.
            </p>

            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
              <span className="font-semibold text-slate-800">
                Model Classification: {PROTOTYPE_MODEL_METADATA.modelFamily}
              </span>
              <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-700 font-medium">
                Status: {PROTOTYPE_MODEL_METADATA.modelStatus} (Research Prototype)
              </span>
            </div>
          </div>

          {/* 5-Step Pipeline Flow */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">
              The 5-Stage Data Science Pipeline
            </h2>

            <div className="max-w-4xl mx-auto space-y-6">
              {pipelineSteps.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.step}
                    className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start gap-6 hover:border-blue-200 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Icon className="w-7 h-7" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          STAGE {s.step}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                      </div>

                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                        {s.desc}
                      </p>

                      <div className="mt-3.5 flex flex-wrap gap-2">
                        {s.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feature Importance Table */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Feature Weights & Model Inputs
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    How individual signal vectors contribute to the overall probabilistic assessment.
                  </p>
                </div>
                <Link
                  href="/dashboard/model-insights"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  <span>View ROC-AUC & Confusion Matrix</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-4">
                {FEATURE_IMPORTANCES.map((f) => (
                  <div key={f.feature} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">{f.feature}</span>
                      <span className="text-blue-600 font-bold">{(f.weight * 100).toFixed(0)}% weight</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                        style={{ width: `${f.weight * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="mt-16 text-center">
            <Link
              href="/dashboard/analyze"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-2xl shadow-lg shadow-blue-500/20 transition-all"
            >
              <span>Test an Influencer URL in the Live Engine</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
