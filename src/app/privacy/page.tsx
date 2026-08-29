"use client";

import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white">
      <LandingNavbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy &amp; Data Security</span>
          </div>
          <h1 className="text-3xl font-black text-slate-100">TrustScore Privacy Policy</h1>
          <p className="text-xs text-slate-400">Effective Date: August 29, 2026</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-100">1. Information We Ingest &amp; Analyze</h2>
            <p>
              TrustScore evaluates public and permissioned creator metrics provided via official platform APIs (Meta Graph API, YouTube Partner API, TikTok Creator API). We only access read-only engagement statistics, post timestamps, and public comment patterns. We never access private direct messages, unpublished drafts, or personal account credentials.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-100">2. How TrustScores Are Computed</h2>
            <p>
              Our proprietary probabilistic models calculate authenticity confidence intervals using Empirical Bayes estimation and statistical dispersion metrics. Creator TrustScores are never influenced by commercial payments or advertising spend.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-100">3. Data Retention &amp; Creator Rights</h2>
            <p>
              Creators retain full rights over their permissioned data. You may request account deletion, metric re-sync, or historical dossier export at any time by contacting privacy@trustscore.io.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-100">4. Payment Processing Security</h2>
            <p>
              All payment transactions and subscriptions are processed directly through Stripe under PCI-DSS Level 1 compliance. TrustScore servers never receive or store raw credit card numbers.
            </p>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
