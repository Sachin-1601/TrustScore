"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { PricingSection } from "@/components/landing/PricingSection";
import { HelpCircle, ChevronDown } from "lucide-react";

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "What constitutes a 'Micro-' or 'Nano-' influencer in TrustScore?",
      a: "TrustScore is calibrated specifically for creators with approximately 1,000 to 50,000 followers across Instagram, TikTok, and YouTube, where statistical sparsity requires specialized Bayesian shrinkage techniques.",
    },
    {
      q: "How does TrustScore calculate the probability of inflated engagement?",
      a: "Our model synthesizes 6 feature dimensions including comment vocabulary entropy, like-to-view constraints, post-by-post volatility, and 12-month Poisson growth step variance to output a calibrated percentage probability (e.g. 6.8%).",
    },
    {
      q: "Does a lower TrustScore mean an influencer should be banned?",
      a: "No. TrustScore is a decision-support platform, not an automatic ban system. We provide prescriptive recommendations and proportional rate adjustments (e.g. suggesting a 15–20% discount or milestone terms) rather than binary exclusions.",
    },
    {
      q: "Can creators voluntarily verify their profiles?",
      a: "Yes! Authentic creators can connect their official platform accounts via read-only OAuth to verify their engagement metrics and receive the '✓ TrustScore Verified' badge for their media kits.",
    },
    {
      q: "Can I cancel or switch plans at any time?",
      a: "Yes. All plans can be upgraded, downgraded, or cancelled at any time with zero long-term commitments or lock-ins.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingNavbar />

      <main className="flex-1">
        <PricingSection />

        {/* FAQ Section */}
        <section className="py-16 bg-slate-50 border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-slate-500">
                Everything you need to know about our data science platform and pricing.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={faq.q}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-6 py-4 text-left font-bold text-slate-900 flex items-center justify-between gap-4 text-sm sm:text-base cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        openFaq === idx ? "rotate-180 text-blue-600" : ""
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-50">
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
    </div>
  );
}
