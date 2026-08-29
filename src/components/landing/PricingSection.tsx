"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, Zap, Shield, ArrowRight } from "lucide-react";

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Starter",
      tagline: "For small brands & boutique agencies",
      monthlyPrice: 29,
      annualPrice: 23,
      checks: "25 influencer checks / mo",
      popular: false,
      features: [
        "25 influencer checks/month",
        "Probabilistic TrustScore analysis",
        "Basic exportable reports",
        "Up to 2 creator side-by-side comparisons",
        "Comment diversity overview",
        "Standard email support",
      ],
      cta: "Start Free Trial",
    },
    {
      name: "Pro",
      tagline: "For growing brands & marketing teams",
      monthlyPrice: 79,
      annualPrice: 63,
      checks: "100 influencer checks / mo",
      popular: true,
      badge: "Most Popular",
      features: [
        "100 influencer checks/month",
        "Advanced predictive analytics",
        "Full prescriptive rate adjustment calculator",
        "Detailed multi-page PDF reports",
        "Creator verification badge access",
        "Multi-influencer comparison (up to 4)",
        "Engagement volatility & pod detection",
        "Priority live support",
      ],
      cta: "Start Free Trial",
    },
    {
      name: "Agency",
      tagline: "For enterprise brands & media agencies",
      monthlyPrice: 199,
      annualPrice: 159,
      checks: "500 influencer checks / mo",
      popular: false,
      features: [
        "500 influencer checks/month",
        "Unlimited team user seats",
        "Collaborative team dashboard & workspaces",
        "Bulk CSV / JSON batch upload analysis",
        "Custom white-labeled client reports",
        "REST API access for CRM integration",
        "Dedicated account manager",
        "99.9% SLA & Custom feature requests",
      ],
      cta: "Contact Agency Sales",
    },
  ];

  return (
    <section className="py-20 bg-white border-t border-slate-200/80" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider border border-blue-200">
            <Zap className="w-3.5 h-3.5" />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Predictable plans for every stage
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Audit your first creator for free. Scale your analysis volume as your influencer campaigns expand.
          </p>

          {/* Billing Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span
              className={`text-sm font-semibold cursor-pointer ${
                !isAnnual ? "text-slate-900" : "text-slate-500"
              }`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly Billing
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-12 h-6 bg-slate-900 rounded-full p-0.5 transition-colors cursor-pointer"
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  isAnnual ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <span
              className={`text-sm font-semibold cursor-pointer flex items-center gap-1.5 ${
                isAnnual ? "text-slate-900" : "text-slate-500"
              }`}
              onClick={() => setIsAnnual(true)}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((p) => {
            const price = isAnnual ? p.annualPrice : p.monthlyPrice;
            return (
              <div
                key={p.name}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all ${
                  p.popular
                    ? "bg-slate-900 text-white shadow-xl ring-2 ring-blue-600"
                    : "bg-white text-slate-900 border border-slate-200 shadow-sm hover:shadow-md"
                }`}
              >
                {p.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                    {p.badge}
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-xl font-bold">{p.name}</h3>
                  </div>
                  <p className={`text-xs mt-1 ${p.popular ? "text-slate-300" : "text-slate-500"}`}>
                    {p.tagline}
                  </p>

                  {/* Price */}
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                      ${price}
                    </span>
                    <span className={`text-sm font-medium ${p.popular ? "text-slate-400" : "text-slate-500"}`}>
                      / month
                    </span>
                  </div>

                  <div className={`mt-2 text-xs font-semibold ${p.popular ? "text-blue-300" : "text-blue-600"}`}>
                    {p.checks}
                  </div>

                  {/* Feature Checklist */}
                  <div className="mt-8 space-y-3">
                    <span className={`text-xs font-bold uppercase tracking-wider block ${p.popular ? "text-slate-400" : "text-slate-400"}`}>
                      Includes:
                    </span>
                    {p.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm">
                        <Check className={`w-4 h-4 shrink-0 mt-0.5 ${p.popular ? "text-emerald-400" : "text-emerald-600"}`} />
                        <span className={p.popular ? "text-slate-200" : "text-slate-600"}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200/20">
                  <Link
                    href="/dashboard"
                    className={`w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                      p.popular
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                    }`}
                  >
                    <span>{p.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
