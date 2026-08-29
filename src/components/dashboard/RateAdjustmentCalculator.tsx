"use client";

import React, { useState } from "react";
import {
  Calculator,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  FileText,
  Scale,
  Percent,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RateAdjustmentCalculatorProps {
  creatorName: string;
  creatorUsername: string;
  trustScore: number;
  riskLevel?: "Low" | "Moderate" | "High" | "Critical" | string;
  inflatedProbability: number;
  uncertaintyMargin?: number;
  initialRate?: number;
  followersCount?: number;
  engagementRate?: number;
  className?: string;
  isDark?: boolean;
}

export function RateAdjustmentCalculator({
  creatorName,
  creatorUsername,
  trustScore,
  riskLevel,
  inflatedProbability,
  uncertaintyMargin = 4.2,
  initialRate = 450,
  followersCount = 18400,
  engagementRate = 4.8,
  className = "",
  isDark = true,
}: RateAdjustmentCalculatorProps) {
  const [quotedRate, setQuotedRate] = useState<number>(initialRate);
  const [deliverableType, setDeliverableType] = useState<string>("reel_stories");
  const [copied, setCopied] = useState(false);

  // Deliverable multiplier
  const deliverableOptions = [
    { id: "single_reel", label: "1 Dedicated Reel / Video", multiplier: 1.0 },
    { id: "reel_stories", label: "1 Reel + 3 Story Frames", multiplier: 1.35 },
    { id: "multi_platform", label: "Reel + TikTok + Short Bundle", multiplier: 1.85 },
    { id: "campaign_package", label: "3 Reels + 10 Stories (Monthly)", multiplier: 3.2 },
  ];

  const selectedDeliverable = deliverableOptions.find((d) => d.id === deliverableType) || deliverableOptions[1];
  const effectiveQuotedRate = Math.round(quotedRate * selectedDeliverable.multiplier);

  // Compute Prescriptive Adjustment % based on TrustScore & Inflated Probability
  let discountPercent = 0;
  let discountRationale = "";

  if (trustScore >= 85) {
    discountPercent = 0;
    discountRationale = "Standard or premium rate justified. High community authenticity with minimal manipulation risk.";
  } else if (trustScore >= 75) {
    discountPercent = 8;
    discountRationale = "Slight 8% adjustment suggested to align with modest engagement variance.";
  } else if (trustScore >= 60) {
    discountPercent = 18;
    discountRationale = "Moderate 18% counteroffer recommended due to repetitive comment patterns and volatility.";
  } else if (trustScore >= 45) {
    discountPercent = 28;
    discountRationale = "Substantial 28% discount suggested to offset high synthetic engagement probability.";
  } else {
    discountPercent = 40;
    discountRationale = "Heavy 40% discount or strict performance-only milestone terms recommended.";
  }

  // Calculate adjusted counter-offer and dollar savings
  const adjustedCounterOffer = Math.round(effectiveQuotedRate * (1 - discountPercent / 100));
  const estimatedBudgetProtected = effectiveQuotedRate - adjustedCounterOffer;

  // Milestone payment structure
  const upfrontPercentage = trustScore >= 75 ? 50 : trustScore >= 60 ? 40 : 25;
  const upfrontAmount = Math.round((adjustedCounterOffer * upfrontPercentage) / 100);
  const milestoneAmount = adjustedCounterOffer - upfrontAmount;

  // Pre-formatted professional negotiation script
  const negotiationScript = `Hi ${creatorName || creatorUsername},

Thanks for sending over your campaign rate of ${formatCurrency(effectiveQuotedRate)} for the ${selectedDeliverable.label}.

We love your creative storytelling and community focus. Based on our data-calibrated campaign model (benchmarking authentic reach and engagement consistency), we would love to propose a collaborative rate of ${formatCurrency(adjustedCounterOffer)}.

Structure:
• ${upfrontPercentage}% upfront (${formatCurrency(upfrontAmount)}) upon contract signing
• ${100 - upfrontPercentage}% (${formatCurrency(milestoneAmount)}) upon delivery & 7-day performance checkpoint

Would this structure work for you to kick off our partnership? Looking forward to creating something amazing together!

Best regards,
Brand Partnerships Team`;

  const handleCopyScript = () => {
    navigator.clipboard?.writeText(negotiationScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const bgClasses = isDark
    ? "bg-slate-900/90 border border-slate-800 text-slate-100 shadow-xl"
    : "bg-white border border-slate-200 text-slate-900 shadow-md";

  const subCardClasses = isDark
    ? "bg-slate-950 border border-slate-800"
    : "bg-slate-50 border border-slate-200";

  return (
    <div className={`rounded-3xl p-6 sm:p-8 space-y-6 ${bgClasses} ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Calculator className="w-3 h-3" />
            <span>Prescriptive Rate Adjustment Calculator</span>
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">
            Fair Rate &amp; Counter-Offer Optimizer
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Calculate data-backed counteroffers for {creatorUsername} based on {trustScore}/100 TrustScore &amp; {inflatedProbability}% inflation probability.
          </p>
        </div>

        <div className={`p-3 rounded-2xl text-right shrink-0 ${subCardClasses}`}>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">TrustScore Model</span>
          <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
            <span className="text-2xl font-black text-blue-400">{trustScore}</span>
            <span className="text-xs text-slate-400 font-semibold">/ 100</span>
          </div>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Input parameters */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Creator's Quoted Base Rate (USD)
            </label>
            <div className="relative">
              <input
                type="number"
                min="50"
                max="50000"
                step="25"
                value={quotedRate}
                onChange={(e) => setQuotedRate(Math.max(0, Number(e.target.value)))}
                className={`w-full px-3.5 py-2.5 pl-8 rounded-xl font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-slate-950 border border-slate-800 text-white" : "bg-white border border-slate-300 text-slate-900"
                }`}
              />
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>Suggested baseline starting rate: ${initialRate}</span>
              <button
                type="button"
                onClick={() => setQuotedRate(initialRate)}
                className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
              >
                Reset to default
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Campaign Deliverable Format
            </label>
            <div className="space-y-2">
              {deliverableOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                    deliverableType === opt.id
                      ? "bg-blue-600/15 border-blue-500 text-white shadow-xs"
                      : isDark
                      ? "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="deliverable"
                      checked={deliverableType === opt.id}
                      onChange={() => setDeliverableType(opt.id)}
                      className="accent-blue-500"
                    />
                    <span>{opt.label}</span>
                  </div>
                  <span className="font-bold text-blue-400">
                    {opt.multiplier === 1 ? "1.0x" : `${opt.multiplier}x`}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Calculations & Prescriptive Counteroffer Output */}
        <div className="space-y-4">
          <div className={`p-5 rounded-2xl space-y-4 border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Recommended Fair Counteroffer
                </span>
                <p className="text-3xl font-black text-emerald-400 mt-1">
                  {formatCurrency(adjustedCounterOffer)}
                </p>
                <span className="text-[11px] text-slate-400">
                  Effective asking quote: <span className="line-through">{formatCurrency(effectiveQuotedRate)}</span>
                </span>
              </div>

              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase inline-flex items-center gap-1 ${
                  discountPercent === 0
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                }`}>
                  <Percent className="w-3 h-3" />
                  {discountPercent === 0 ? "Standard Rate" : `-${discountPercent}% Adjustment`}
                </span>
              </div>
            </div>

            {/* Savings callout */}
            {estimatedBudgetProtected > 0 && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
                <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Budget protected from synthetic risk:</span>
                </span>
                <span className="font-extrabold text-emerald-400 text-sm">
                  +{formatCurrency(estimatedBudgetProtected)}
                </span>
              </div>
            )}

            {/* Milestone Escrow Breakdown */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Recommended Risk-Mitigated Escrow Terms:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Upfront Payment ({upfrontPercentage}%)</span>
                  <span className="text-sm font-bold text-slate-100">{formatCurrency(upfrontAmount)}</span>
                </div>
                <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">7-Day Retention Milestone ({100 - upfrontPercentage}%)</span>
                  <span className="text-sm font-bold text-blue-400">{formatCurrency(milestoneAmount)}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              {discountRationale}
            </p>
          </div>
        </div>
      </div>

      {/* Copyable Negotiation Script Section */}
      <div className={`p-5 rounded-2xl border space-y-3 ${isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">
              1-Click Negotiation Counter-Offer Script
            </h4>
          </div>

          <button
            type="button"
            onClick={handleCopyScript}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              copied
                ? "bg-emerald-600 text-white"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Script Copied to Clipboard!" : "Copy Negotiation Script"}</span>
          </button>
        </div>

        <pre className={`p-3.5 rounded-xl text-[11px] font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto border ${
          isDark ? "bg-slate-900 text-slate-300 border-slate-800" : "bg-white text-slate-700 border-slate-200"
        }`}>
          {negotiationScript}
        </pre>
      </div>
    </div>
  );
}
