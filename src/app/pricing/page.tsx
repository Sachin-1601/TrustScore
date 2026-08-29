"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { PricingSection } from "@/components/landing/PricingSection";
import { PricingCheckoutModal } from "@/components/landing/PricingCheckoutModal";
import {
  PricingService,
  SAAS_PLANS,
  FEATURE_COMPARISON_MATRIX,
} from "@/services/pricingService";
import { formatCurrency } from "@/lib/utils";
import {
  HelpCircle,
  ChevronDown,
  Calculator,
  ShieldCheck,
  Zap,
  Check,
  X,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Percent,
} from "lucide-react";

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [checksSlider, setChecksSlider] = useState<number>(45);
  const [spendSlider, setSpendSlider] = useState<number>(15000);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState<"starter" | "growth" | "agency">("growth");

  // Volume calculator computations
  const recommendedPlan = PricingService.getRecommendedPlan(checksSlider);
  const savings = PricingService.calculateEstimatedSavings(spendSlider);

  const handleOpenCheckout = (planId: "starter" | "growth" | "agency") => {
    setCheckoutPlanId(planId);
    setIsCheckoutModalOpen(true);
  };

  const faqs = [
    {
      q: "What is included in the 14-day free trial?",
      a: "The 14-day free trial gives you full access to your selected plan's creator audit quotas, the Bayesian TrustScore engine, predictive comment lexical entropy metrics, and the prescriptive rate negotiation calculator. You can cancel anytime before the trial period concludes with zero charges.",
    },
    {
      q: "How does TrustScore calculate the probability of inflated engagement?",
      a: "Our Bayesian model synthesizes 6 feature dimensions including comment vocabulary entropy, like-to-view constraints, post-by-post volatility, and 12-month Poisson growth step variance to output a calibrated percentage probability (e.g. 6.8%) with explicit uncertainty bounds.",
    },
    {
      q: "Can I buy additional creator checks if I run out during a campaign launch?",
      a: "Yes! You can purchase one-time Add-On Credit Boost packs directly from your dashboard (+25 for $29, +75 for $69, or +200 for $149) with no plan upgrade required.",
    },
    {
      q: "What is the Prescriptive Rate Adjustment Calculator?",
      a: "Rather than giving a binary 'approve/deny', TrustScore calculates data-backed counteroffers based on true community reach (e.g., suggesting an 18% fee reduction or a 50/50 performance milestone structure), giving your team copyable negotiation scripts for talent agencies.",
    },
    {
      q: "Can creators voluntarily verify their profiles?",
      a: "Yes. Creators can connect their official platform accounts via read-only OAuth to verify their engagement metrics and receive the '✓ TrustScore Verified' badge for their media kits and public marketplace listings.",
    },
    {
      q: "Can I cancel, upgrade, or switch billing cycles at any time?",
      a: "Yes. All plans can be upgraded or downgraded instantly in your Billing settings with automated Stripe prorated credits.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingNavbar />

      <main className="flex-1">
        {/* Main 3 Pricing Cards */}
        <PricingSection />

        {/* Interactive Volume & ROI Calculator */}
        <section className="py-16 bg-slate-900 text-white border-t border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
                <Calculator className="w-3.5 h-3.5" />
                <span>Interactive Cost &amp; Quota Estimator</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Find the right plan for your campaign volume
              </h2>
              <p className="text-sm sm:text-base text-slate-400">
                Adjust your monthly creator evaluation needs and budget spend to view recommended tier and projected fraud savings.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
              {/* Left Sliders */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                    <span>Monthly Creator Audits Needed:</span>
                    <span className="text-blue-400 text-sm font-extrabold">{checksSlider} Audits / mo</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="350"
                    step="5"
                    value={checksSlider}
                    onChange={(e) => setChecksSlider(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-800 rounded-lg accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>5 Audits (Starter Tier)</span>
                    <span>100 Audits (Growth)</span>
                    <span>300+ Audits (Agency)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                    <span>Monthly Influencer Marketing Budget:</span>
                    <span className="text-emerald-400 text-sm font-extrabold">{formatCurrency(spendSlider)}</span>
                  </div>
                  <input
                    type="range"
                    min="2000"
                    max="100000"
                    step="1000"
                    value={spendSlider}
                    onChange={(e) => setSpendSlider(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-800 rounded-lg accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>$2,000 / mo</span>
                    <span>$50,000 / mo</span>
                    <span>$100,000+ / mo</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Based on Bayesian detection benchmarks, ~28% of creator spend is exposed to engagement pods and synthetic followers. TrustScore protects this capital with prescriptive rate counter-offers.
                  </p>
                </div>
              </div>

              {/* Right Output Recommendation Box */}
              <div className="lg:col-span-5 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950 border border-blue-800/40 rounded-3xl p-6 sm:p-8 space-y-5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-400 block tracking-wider">
                    Recommended SaaS Tier:
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <h3 className="text-2xl font-black text-white">{recommendedPlan.name} Plan</h3>
                    <span className="text-xl font-black text-blue-400">${recommendedPlan.priceAnnual}/mo</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Includes {recommendedPlan.creatorChecksMonthly} audits/mo (billed annually).
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Estimated Fraud Exposure Saved:</span>
                    <span className="font-extrabold text-emerald-400">{formatCurrency(savings.monthlyWaste)} / mo</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Projected Annual Savings:</span>
                    <span className="font-extrabold text-emerald-400">{formatCurrency(savings.annualWaste)} / yr</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Estimated ROI Multiplier:</span>
                    <span className="font-black text-blue-400 text-sm">~{savings.estimatedRoi}x ROI</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenCheckout(recommendedPlan.id)}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Select {recommendedPlan.name} Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Comparison Matrix Table */}
        <section className="py-20 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Compare Plan Features Side-by-Side
              </h2>
              <p className="text-sm text-slate-600">
                Detailed breakdown of telemetry capabilities, decision algorithms, and enterprise tools across all plans.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  {/* Column Headers */}
                  <thead className="bg-slate-900 text-white border-b border-slate-800">
                    <tr>
                      <th className="py-4 px-6 font-bold text-sm w-1/3">Feature &amp; Capability</th>
                      <th className="py-4 px-6 font-bold text-center w-2/9">
                        <span className="block text-sm">Starter</span>
                        <span className="text-[11px] font-normal text-slate-400">$29 / month</span>
                      </th>
                      <th className="py-4 px-6 font-bold text-center w-2/9 bg-blue-900/60 border-x border-blue-800/60">
                        <span className="block text-sm text-blue-300">Growth (Most Popular)</span>
                        <span className="text-[11px] font-normal text-slate-300">$79 / month</span>
                      </th>
                      <th className="py-4 px-6 font-bold text-center w-2/9">
                        <span className="block text-sm">Agency</span>
                        <span className="text-[11px] font-normal text-slate-400">$199 / month</span>
                      </th>
                    </tr>
                  </thead>

                  {/* Body by Category */}
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {FEATURE_COMPARISON_MATRIX.map((catGroup) => (
                      <React.Fragment key={catGroup.category}>
                        {/* Category Header Row */}
                        <tr className="bg-slate-100/90 text-slate-900 font-extrabold uppercase tracking-wider text-[10px]">
                          <td colSpan={4} className="py-3 px-6 text-blue-700">
                            {catGroup.category}
                          </td>
                        </tr>

                        {catGroup.features.map((feat) => {
                          const renderVal = (val: boolean | string) => {
                            if (typeof val === "boolean") {
                              return val ? (
                                <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                              ) : (
                                <X className="w-4 h-4 text-slate-300 mx-auto" />
                              );
                            }
                            return <span className="font-semibold text-slate-800">{val}</span>;
                          };

                          return (
                            <tr key={feat.name} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-6">
                                <span className="font-bold text-slate-900 block">{feat.name}</span>
                                <span className="text-[11px] text-slate-500">{feat.description}</span>
                              </td>
                              <td className="py-3.5 px-6 text-center">{renderVal(feat.starter)}</td>
                              <td className="py-3.5 px-6 text-center bg-blue-50/40 border-x border-blue-100/60">
                                {renderVal(feat.growth)}
                              </td>
                              <td className="py-3.5 px-6 text-center">{renderVal(feat.agency)}</td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom CTA bar in table */}
              <div className="p-6 bg-slate-50 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => handleOpenCheckout("starter")}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl text-center cursor-pointer transition-colors"
                >
                  Choose Starter
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenCheckout("growth")}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl text-center cursor-pointer transition-colors shadow-md shadow-blue-500/20"
                >
                  Choose Growth (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenCheckout("agency")}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl text-center cursor-pointer transition-colors"
                >
                  Choose Agency
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Everything you need to know about pricing
              </h2>
              <p className="text-sm text-slate-500">
                Transparent answers regarding trial terms, quotas, data methodology, and cancellations.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={faq.q}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-6 py-4 text-left font-bold text-slate-900 flex items-center justify-between gap-4 text-sm sm:text-base cursor-pointer hover:bg-slate-50"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        openFaq === idx ? "rotate-180 text-blue-600" : ""
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />

      {/* Interactive Checkout Modal */}
      <PricingCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        defaultPlanId={checkoutPlanId}
        defaultIsAnnual={true}
      />
    </div>
  );
}
