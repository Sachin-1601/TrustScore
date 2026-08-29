"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { ShieldAlert, ArrowRight, DollarSign, Calculator, CheckCircle2, TrendingUp, Sparkles, Scale, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function BrandsPage() {
  const [monthlySpend, setMonthlySpend] = useState(15000);
  const [nanoCount, setNanoCount] = useState(12);

  // Estimator logic
  const estimatedFraudExposure = monthlySpend * 0.28; // ~28% average fraud/pod loss
  const estimatedAnnualSavings = estimatedFraudExposure * 12;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <LandingNavbar />

      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider border border-blue-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Brand & Agency Solutions</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Protect your influencer marketing ROI.
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Stop paying premium rates for purchased followers, bot likes, and engagement pods. TrustScore gives your team the scientific backing to negotiate fair creator rates.
            </p>
          </div>

          {/* Interactive ROI & Budget Waste Estimator */}
          <div className="mt-14 max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">
                Influencer Budget Protection Calculator
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-6">
              {/* Sliders */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Monthly Micro-Influencer Spend:</span>
                    <span className="text-blue-600 font-bold">{formatCurrency(monthlySpend)}</span>
                  </div>
                  <input
                    type="range"
                    min="2000"
                    max="100000"
                    step="1000"
                    value={monthlySpend}
                    onChange={(e) => setMonthlySpend(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>$2,000</span>
                    <span>$100,000</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Active Micro/Nano Creators Hired / Month:</span>
                    <span className="text-blue-600 font-bold">{nanoCount} creators</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="50"
                    step="1"
                    value={nanoCount}
                    onChange={(e) => setNanoCount(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>2 creators</span>
                    <span>50 creators</span>
                  </div>
                </div>
              </div>

              {/* Output Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 shadow-md">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Estimated At-Risk Spend / Month:
                  </span>
                  <p className="text-3xl font-extrabold text-amber-400 mt-1">
                    {formatCurrency(estimatedFraudExposure)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Based on 28% average industry synthetic engagement inflation.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Projected Annual Budget Protected:
                  </span>
                  <p className="text-2xl font-bold text-emerald-400 mt-0.5">
                    {formatCurrency(estimatedAnnualSavings)} / yr
                  </p>
                </div>

                <Link
                  href="/dashboard/analyze"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Audit Your Active Roster Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* 4 Brand Pillars Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs">
              <Scale className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900">Proportional Rate Negotiation</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Receive suggested 0–5% vs 15–30% rate adjustment guidelines to present data-driven counteroffers to talent agencies.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs">
              <TrendingUp className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900">Multi-Creator Comparisons</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Compare up to 4 creators side-by-side on 5 analytical dimensions to select the highest authenticity match for your campaign.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs">
              <FileText className="w-8 h-8 text-emerald-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900">Client-Ready Reports</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Generate clean, branded PDF summaries and live shareable links to report campaign safety to brand stakeholders.
              </p>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

export default BrandsPage;
