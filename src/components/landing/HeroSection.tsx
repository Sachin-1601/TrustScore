"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Search, TrendingUp, Sparkles, AlertCircle } from "lucide-react";
import { ScoreGauge } from "@/components/common/ScoreGauge";
import { RiskBadge } from "@/components/common/RiskBadge";

export function HeroSection() {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-radial-gradient">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & Value Proposition */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            {/* Small Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-xs font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Data-Driven Influencer Authenticity</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Know who you <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">
                can trust.
              </span>
            </h1>

            {/* Supporting Headline */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              TrustScore helps brands identify inflated engagement and evaluate micro- and nano-influencers before they spend their marketing budget.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <Link
                href="/dashboard/analyze"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-500/20 transition-all group"
              >
                <Search className="w-4 h-4 text-blue-200" />
                <span>Analyze an Influencer</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all"
              >
                <span>See How It Works</span>
              </Link>
            </div>

            {/* Trust Bullet Signals */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Sample-efficient Bayesian model</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Micro & nano-account specialized</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Decision support, not bans</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual - Live SaaS Analytics Dashboard Preview Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Card glow */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 blur-xl opacity-75" />

              {/* Main Dashboard Widget Card */}
              <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden p-5 sm:p-6 space-y-5">
                {/* Header Profile Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="Alex Rivera"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-base">@alexfitness</span>
                        <span className="text-slate-400 text-xs">• Fitness</span>
                      </div>
                      <p className="text-xs text-slate-500">32.4K followers • Instagram</p>
                    </div>
                  </div>
                  <RiskBadge risk="Low" size="sm" />
                </div>

                {/* Score & Gauge Highlight Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50/80 rounded-xl p-4 border border-slate-100">
                  <div className="flex justify-center">
                    <ScoreGauge score={87} size="sm" showSubtitle={false} />
                  </div>
                  <div className="space-y-2 text-center sm:text-left">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Authenticity Status
                      </span>
                      <p className="text-base font-bold text-emerald-700 flex items-center justify-center sm:justify-start gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        High Authenticity
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Est. Inflated Engagement
                      </span>
                      <p className="text-sm font-bold text-slate-800">
                        6.8% <span className="text-xs font-normal text-slate-500">(Low probability)</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mini Metric Bars */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-600">Comment Diversity</span>
                    <span className="font-bold text-slate-900">82% (High Organic)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "82%" }} />
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="font-medium text-slate-600">Follower Growth Stability</span>
                    <span className="font-bold text-slate-900">91 / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "91%" }} />
                  </div>
                </div>

                {/* Recommendation Callout */}
                <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
                  <TrendingUp className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-semibold text-blue-900">Prescriptive Guidance:</span>
                    <p className="text-blue-700 mt-0.5">
                      Proceed with normal campaign consideration. Recommended rate adjustment: <strong>0–5%</strong>.
                    </p>
                  </div>
                </div>

                {/* Quick Link */}
                <div className="text-center pt-1">
                  <Link
                    href="/dashboard/influencer/alexfitness"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span>View full interactive analysis report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
