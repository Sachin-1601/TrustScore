import React from "react";
import { Link2, Cpu, CheckCircle, ArrowRight, ShieldCheck, BarChart3 } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: Link2,
      title: "Connect or Analyze",
      subtitle: "Sparse input ingestion",
      description:
        "Enter any public creator URL (@handle) or invite the creator to connect their account via OAuth for cryptographically verified analytics.",
    },
    {
      number: "02",
      icon: Cpu,
      title: "Probabilistic Analysis",
      subtitle: "Sample-efficient inference",
      description:
        "TrustScore extracts lexical entropy, follower growth jumps, like-to-view ratios, and engagement pod cluster patterns across recent posts.",
    },
    {
      number: "03",
      icon: ShieldCheck,
      title: "Proportional Decision",
      subtitle: "Actionable decision support",
      description:
        "Receive a 0–100 TrustScore, estimated inflated engagement probability (%), and specific fee adjustment recommendations (e.g. 0–5%).",
    },
  ];

  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider border border-blue-200">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Operational Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            How TrustScore Works
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            From raw, sparse creator data to calibrated probabilistic insights and actionable campaign decisions in seconds.
          </p>
        </div>

        {/* Visual Workflow Flow Indicator */}
        <div className="mt-12 max-w-4xl mx-auto hidden md:flex items-center justify-between px-8 py-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
              1
            </span>
            <span className="text-sm font-semibold text-slate-800">Profile URL</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300" />
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
              2
            </span>
            <span className="text-sm font-semibold text-slate-800">Data Analysis</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300" />
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
              3
            </span>
            <span className="text-sm font-semibold text-slate-800">TrustScore (0-100)</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300" />
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center">
              4
            </span>
            <span className="text-sm font-semibold text-slate-800">Prescriptive Action</span>
          </div>
        </div>

        {/* 3 Step Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="relative bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-extrabold text-slate-200">
                    {step.number}
                  </span>
                </div>

                <div className="mt-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    {step.subtitle}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
