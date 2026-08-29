import React from "react";
import Link from "next/link";
import { ShieldAlert, CheckCircle2, ArrowRight, DollarSign, BarChart3, FileText, Scale } from "lucide-react";

export function ForBrandsSection() {
  const benefits = [
    {
      icon: ShieldAlert,
      title: "Vet creators before campaigns",
      desc: "Instant authenticity audits before signing contracts or paying upfront fees.",
    },
    {
      icon: Scale,
      title: "Compare multiple creators",
      desc: "Side-by-side radar comparisons across engagement quality, volatility, and audience trust.",
    },
    {
      icon: DollarSign,
      title: "Reduce wasted influencer spend",
      desc: "Save an estimated 25–40% of influencer budget by filtering out inflated nano-accounts.",
    },
    {
      icon: BarChart3,
      title: "Identify suspicious engagement",
      desc: "Expose hidden engagement pods, purchased likes, and artificial video view inflation.",
    },
    {
      icon: CheckCircle2,
      title: "Make evidence-based decisions",
      desc: "Empower campaign managers with clear, model-backed rate adjustment guidelines.",
    },
    {
      icon: FileText,
      title: "Generate shareable reports",
      desc: "Export client-ready PDF reports and live shareable links for marketing stakeholders.",
    },
  ];

  return (
    <section className="py-20 bg-white" id="brands">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden shadow-xl">
          {/* Subtle glow background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider border border-blue-400/30">
              For Brands, Agencies & Marketers
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Protect your influencer budget.
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Eliminate guesswork and fraudulent nano-tier spend. TrustScore provides the decision intelligence your brand needs to allocate marketing dollars with confidence.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xs hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base mt-3.5">
                    {b.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA Row */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-300 text-center sm:text-left">
              Trusted by 120+ modern consumer brands, media agencies, and D2C startups.
            </p>
            <Link
              href="/dashboard/analyze"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-xl shadow-md transition-all group shrink-0"
            >
              <span>Start analyzing creators</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
