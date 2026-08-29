"use client";

import React from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import {
  ShieldCheck,
  TrendingUp,
  Search,
  Sparkles,
  ArrowRight,
  BarChart3,
  DollarSign,
  Building2,
  CheckCircle2,
  Users,
} from "lucide-react";

export default function ForBusinessesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white">
      <LandingNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Brand Decision Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight">
            Find creators who fit your brand. <br />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
              Stop guessing authenticity.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Stop choosing creators based on follower count alone. TrustScore uses sample-efficient data science to evaluate real engagement quality before you commit marketing spend.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/creators"
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2"
            >
              <span>Find a Creator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/advertise"
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Advertise With Us</span>
            </Link>
          </div>
        </div>

        {/* 6 Core Business Value Capabilities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">Creator Discovery Marketplace</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore thousands of micro- and nano-influencers filtered by authentic TrustScore ratings, niche verticals, and locations.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">Engagement Pod &amp; Bot Defense</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detect reciprocal pod rings, comment repetitive spam, and sudden purchased follower surges with Bayesian statistical models.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">Multi-Creator Comparison</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluate 2 to 4 creators side-by-side on 5-dimension radar charts to choose the highest-retention candidates for your roster.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">Proportional Fee Guidance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receive data-backed payment rate adjustment recommendations (e.g. standard rate vs 15% discount) to safeguard your ROI.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">Direct Collaboration Proposals</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Send structured campaign offers, agree on deliverables, and track campaign milestones with creator transparency.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">Sponsored Business Advertising</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Promote your brand with featured marketplace placements and receive organic pitches from verified high-trust creators.
            </p>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
