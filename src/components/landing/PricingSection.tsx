"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SAAS_PLANS, SaaSSubscriptionPlan } from "@/services/pricingService";
import { PricingCheckoutModal } from "@/components/landing/PricingCheckoutModal";
import { Check, Sparkles, Zap, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";

interface PricingSectionProps {
  showTitle?: boolean;
}

export function PricingSection({ showTitle = true }: PricingSectionProps) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<"starter" | "growth" | "agency">("growth");

  const handleSelectPlan = (planId: "starter" | "growth" | "agency") => {
    setSelectedPlanId(planId);
    setIsCheckoutOpen(true);
  };

  return (
    <section className="py-20 bg-white border-t border-slate-200/80" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        {showTitle && (
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider border border-blue-200">
              <Zap className="w-3.5 h-3.5" />
              <span>Transparent SaaS Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Predictable plans for every stage
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Audit your first creator for free. Scale your analysis volume as your influencer marketing campaigns expand.
            </p>
          </div>
        )}

        {/* Billing Toggle */}
        <div className="pt-6 flex items-center justify-center gap-3">
          <span
            className={`text-sm font-semibold cursor-pointer transition-colors ${
              !isAnnual ? "text-slate-900 font-bold" : "text-slate-500"
            }`}
            onClick={() => setIsAnnual(false)}
          >
            Monthly Billing
          </span>
          <button
            type="button"
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-12 h-6 bg-slate-900 rounded-full p-0.5 transition-colors cursor-pointer"
            aria-label="Toggle Billing Interval"
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                isAnnual ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={`text-sm font-semibold cursor-pointer flex items-center gap-1.5 transition-colors ${
              isAnnual ? "text-slate-900 font-bold" : "text-slate-500"
            }`}
            onClick={() => setIsAnnual(true)}
          >
            <span>Annual Billing</span>
            <span className="px-2 py-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
              Save 20%
            </span>
          </span>
        </div>

        {/* 3 Pricing Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {SAAS_PLANS.map((plan) => {
            const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
            const annualTotal = plan.priceAnnual * 12;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-200 ${
                  plan.popular
                    ? "bg-slate-900 text-white shadow-xl ring-2 ring-blue-600"
                    : "bg-white text-slate-900 border border-slate-200 shadow-sm hover:shadow-md"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                  </div>
                  <p className={`text-xs mt-1 min-h-[32px] ${plan.popular ? "text-slate-300" : "text-slate-500"}`}>
                    {plan.tagline}
                  </p>

                  {/* Price */}
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                      ${price}
                    </span>
                    <span className={`text-sm font-medium ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>
                      / month
                    </span>
                  </div>

                  {isAnnual && (
                    <span className={`text-[11px] block mt-0.5 ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>
                      Billed annually at ${annualTotal}/yr
                    </span>
                  )}

                  <div className={`mt-4 p-3 rounded-2xl border text-xs font-bold ${
                    plan.popular
                      ? "bg-slate-950 border-slate-800 text-blue-300"
                      : "bg-blue-50/70 border-blue-100 text-blue-700"
                  }`}>
                    ⚡ {plan.creatorChecksMonthly} Creator Authenticity Audits / mo
                  </div>

                  {/* Feature Checklist */}
                  <div className="mt-8 space-y-3">
                    <span className={`text-xs font-bold uppercase tracking-wider block ${
                      plan.popular ? "text-slate-400" : "text-slate-400"
                    }`}>
                      Included Features:
                    </span>
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm">
                        <Check className={`w-4 h-4 shrink-0 mt-0.5 ${
                          plan.popular ? "text-emerald-400" : "text-emerald-600"
                        }`} />
                        <span className={plan.popular ? "text-slate-200" : "text-slate-600"}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200/20 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      plan.popular
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    <span>Start 14-Day Free Trial</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <Link
                    href={`/dashboard/billing?plan=${plan.id}&billing=${isAnnual ? "annual" : "monthly"}`}
                    className={`text-[11px] block text-center font-medium ${
                      plan.popular ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    View in Billing Dashboard →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust Callout */}
        <div className="mt-14 p-6 rounded-3xl bg-slate-50 border border-slate-200 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Need custom enterprise quotas or high-frequency API rate limits?</h4>
              <p className="text-xs text-slate-500">We offer custom SLAs, whitelabel exports, and tailored graph ingestion pipelines.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSelectPlan("agency")}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 font-bold text-xs rounded-xl shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            Contact Enterprise Sales
          </button>
        </div>
      </div>

      {/* Interactive Checkout & Trial Activation Modal */}
      <PricingCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        defaultPlanId={selectedPlanId}
        defaultIsAnnual={isAnnual}
      />
    </section>
  );
}
