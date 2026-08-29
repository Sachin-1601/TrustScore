import React from "react";
import { ShieldCheck, LineChart, TrendingUp, MessageSquare, Compass, CheckCircle2, Layers } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: ShieldCheck,
      title: "1. Probabilistic TrustScore",
      description:
        "Estimate the probability that engagement has been artificially inflated. Generates a calibrated 0–100 score designed specifically for sparse, micro-tier creator timelines.",
    },
    {
      icon: LineChart,
      title: "2. Engagement Intelligence",
      description:
        "Understand how likes, comments and other engagement signals behave over time. Pinpoint unnatural engagement bursts, abnormal like-to-view ratios, and posting velocity anomalies.",
    },
    {
      icon: TrendingUp,
      title: "3. Follower Growth Analysis",
      description:
        "Identify unusual growth patterns and sudden follower spikes. Differentiate organic audience accumulation from discrete bot-pack purchases and follow-churn cycles.",
    },
    {
      icon: MessageSquare,
      title: "4. Comment Quality Analysis",
      description:
        "Measure comment diversity and detect repetitive or suspicious interaction patterns. Uncover automated bot pods, copy-paste reciprocal comments, and emoji-only rings.",
    },
    {
      icon: Compass,
      title: "5. Actionable Recommendations",
      description:
        "Move beyond fake/real classification with proportional recommendations. Receive calculated fee adjustment percentages (e.g. 0–5% vs 25% discount) and contract risk mitigation steps.",
    },
    {
      icon: CheckCircle2,
      title: "6. Creator Verification",
      description:
        "Creators can voluntarily connect their accounts and receive a verification badge. Transparent proof of authenticity that builds trust with premium sponsor brands.",
    },
  ];

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider border border-blue-200">
            <Layers className="w-3.5 h-3.5" />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Comprehensive Authenticity Intelligence
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Everything your marketing and data teams need to verify micro- and nano-influencers before committing campaign spend.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-5">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
