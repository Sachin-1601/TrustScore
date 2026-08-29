import React from "react";
import { Activity, TrendingUp, MessageSquare, AlertCircle, Search, Sparkles, HelpCircle } from "lucide-react";

export function MethodologySection() {
  const dimensions = [
    {
      icon: Activity,
      title: "1. Engagement Consistency",
      description:
        "Evaluates post-by-post variance and like-to-view ratios to detect artificial burst spikes vs natural organic engagement decay.",
    },
    {
      icon: TrendingUp,
      title: "2. Follower Growth Dynamics",
      description:
        "Applies Poisson step-jump filters across 12-month histories to flag purchased bot batch increments vs steady organic accumulation.",
    },
    {
      icon: MessageSquare,
      title: "3. Comment Lexical Diversity",
      description:
        "Computes vocabulary entropy and Gini coefficients to distinguish authentic community inquiries from reciprocal engagement pod rings.",
    },
    {
      icon: AlertCircle,
      title: "4. Suspicious Signal Vectors",
      description:
        "Analyzes account reciprocity, follow/unfollow velocities, and initial 15-minute interaction surges typical of crowd-turfing networks.",
    },
  ];

  const tiers = [
    {
      tier: "Descriptive Analytics",
      question: "What happened?",
      color: "border-blue-500 bg-blue-50/50 text-blue-900",
      pill: "bg-blue-100 text-blue-800",
      description:
        "Historical 12-month follower accumulation, 30-post engagement rates, like-to-comment ratios, and comment vocabulary breakdown.",
    },
    {
      tier: "Predictive Analytics",
      question: "What is likely happening?",
      color: "border-indigo-500 bg-indigo-50/50 text-indigo-900",
      pill: "bg-indigo-100 text-indigo-800",
      description:
        "Model-based probability estimate of inflated engagement (e.g. 6.8%), confidence intervals, and automated pod risk signals.",
    },
    {
      tier: "Prescriptive Analytics",
      question: "What should you do?",
      color: "border-emerald-500 bg-emerald-50/50 text-emerald-900",
      pill: "bg-emerald-100 text-emerald-800",
      description:
        "Proportional campaign fee adjustment guidelines (e.g. 0–5% vs 20% discount), milestone terms, and risk mitigation checklists.",
    },
  ];

  return (
    <section className="py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider border border-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Data Science Methodology</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Built for imperfect data.
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            TrustScore is designed for low-volume influencer profiles where traditional large-scale fraud detection approaches may not be reliable.
          </p>
        </div>

        {/* 4 Analytical Dimensions Grid */}
        <div className="mt-14">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center mb-6">
            Four Analytical Dimensions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dimensions.map((dim) => {
              const Icon = dim.icon;
              return (
                <div
                  key={dim.title}
                  className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 mt-4 text-base">
                    {dim.title}
                  </h4>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {dim.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Three Analytics Tiers */}
        <div className="mt-16 bg-slate-900 text-white rounded-3xl p-8 sm:p-10 lg:p-12 shadow-xl overflow-hidden relative">
          <div className="relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Decision Science Architecture
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mt-2">
                From Descriptive to Prescriptive Intelligence
              </h3>
              <p className="text-slate-300 text-sm sm:text-base mt-2">
                We move beyond crude &quot;real vs fake&quot; classification to empower marketing teams with proportional, evidence-based decision guidance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((t) => (
                <div
                  key={t.tier}
                  className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-600 transition-colors"
                >
                  <div>
                    <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${t.pill}`}>
                      {t.tier}
                    </span>
                    <h4 className="text-xl font-bold text-white mt-3">
                      &quot;{t.question}&quot;
                    </h4>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                      {t.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
