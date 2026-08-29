import React from "react";
import { Users, Repeat, Network, Database, AlertTriangle } from "lucide-react";

export function ProblemSection() {
  const problems = [
    {
      icon: Users,
      title: "Purchased Followers",
      badge: "Audience Distortion",
      description:
        "Low-cost bot farms inflate follower counters with inactive ghost profiles, giving the illusion of social proof while providing zero real brand impressions or purchasing power.",
      stat: "Up to 34% of micro-tier followers can be inactive or synthetic bots.",
    },
    {
      icon: Repeat,
      title: "Engagement Pods",
      badge: "Artificial Engagement",
      description:
        "Coordinated groups of creators systematically like, save, and comment on each other's posts within minutes of publishing to game discovery algorithms and fake genuine community interest.",
      stat: "Generates high comment volume with near-zero authentic buying intent.",
    },
    {
      icon: Network,
      title: "Crowdturfing Networks",
      badge: "Distributed Manipulation",
      description:
        "Decentralized micro-task platforms pay real human gig workers cents to leave generic comments and follows, bypassing standard algorithmic bot-filter heuristics.",
      stat: "Standard heuristics fail because interactions originate from genuine IP addresses.",
    },
    {
      icon: Database,
      title: "Sparse Creator Data",
      badge: "The Data Science Gap",
      description:
        "Traditional fraud detection engines are designed for macro-influencers with millions of data points. Micro-creators (1k–50k) have sparse, noisy timelines that confuse naive statistical tools.",
      stat: "Requires sample-efficient probabilistic models with empirical Bayes shrinkage.",
    },
  ];

  return (
    <section className="py-20 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold uppercase tracking-wider border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>The Micro-Influencer Dilemma</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Follower count doesn&apos;t tell the whole story.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Micro- and nano-influencers deliver high niche conversion, but can easily manipulate engagement through bought followers, pod rings, and crowd-turfing. Brands need robust, sample-efficient decision support.
          </p>
        </div>

        {/* 4 Problem Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((prob) => {
            const Icon = prob.icon;
            return (
              <div
                key={prob.title}
                className="group relative bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-200/90 hover:border-blue-200 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="mt-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {prob.badge}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {prob.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                    {prob.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60">
                  <p className="text-xs font-medium text-slate-500 italic">
                    {prob.stat}
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
