"use client";

import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { ShieldCheck, FileText, Scale } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white">
      <LandingNavbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl font-black text-slate-100">TrustScore Terms of Service</h1>
          <p className="text-xs text-slate-400">Effective Date: August 29, 2026</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-100">1. Nature of Decision-Support Services</h2>
            <p>
              TrustScore provides statistical decision support and probabilistic authenticity estimation. TrustScore ratings represent model-based estimates derived from mathematical feature extraction and do not constitute absolute legal certifications of fraud or authenticity.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-100">2. Commercial Advertising Separation</h2>
            <p>
              Sponsored business placements and advertising packages are separate commercial products. In accordance with our Charter of Data Integrity, paid sponsorships will never modify creator TrustScores, confidence metrics, or leaderboard rankings.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-100">3. Collaboration Agreements &amp; Escrow</h2>
            <p>
              Businesses and creators negotiate deliverables and compensation directly. TrustScore provides proposal workflows and deliverable tracking tools to facilitate transparent partnerships.
            </p>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
