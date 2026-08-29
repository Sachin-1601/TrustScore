"use client";

import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { ShieldCheck, Cookie } from "lucide-react";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white">
      <LandingNavbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
            <Cookie className="w-3.5 h-3.5" />
            <span>Consent &amp; Tracking</span>
          </div>
          <h1 className="text-3xl font-black text-slate-100">TrustScore Cookie Policy</h1>
          <p className="text-xs text-slate-400">Effective Date: August 29, 2026</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-100">1. Essential Authentication Cookies</h2>
            <p>
              We use strictly necessary session cookies to maintain your login state, role-based workspace permissions, and secure Stripe checkout tokens.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-100">2. Analytics &amp; Performance</h2>
            <p>
              We collect aggregated, privacy-conscious performance metrics (page load times, search query latency) without tracking individual third-party behavioral profiles across the web.
            </p>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
