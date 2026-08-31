"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/common/Modal";
import { SAAS_PLANS, PricingService } from "@/services/pricingService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Loader2,
} from "lucide-react";

interface PricingCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlanId?: "starter" | "growth" | "agency";
  defaultIsAnnual?: boolean;
}

export function PricingCheckoutModal({
  isOpen,
  onClose,
  defaultPlanId = "growth",
  defaultIsAnnual = true,
}: PricingCheckoutModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { error: toastError, info } = useToast();

  const [selectedPlanId, setSelectedPlanId] = useState<"starter" | "growth" | "agency">(defaultPlanId);
  const [isAnnual, setIsAnnual] = useState(defaultIsAnnual);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedPlan = SAAS_PLANS.find((p) => p.id === selectedPlanId) || SAAS_PLANS[1];
  const unitPrice = isAnnual ? selectedPlan.priceAnnual : selectedPlan.priceMonthly;
  const billedAmount = isAnnual ? selectedPlan.priceAnnual * 12 : selectedPlan.priceMonthly;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!user) {
      // Direct unauthenticated users to signup with plan preserved
      onClose();
      router.push(`/signup?role=BUSINESS&plan=${selectedPlan.id}&billing=${isAnnual ? "annual" : "monthly"}`);
      return;
    }

    info("Redirecting to Stripe", "Preparing your secure Stripe Checkout session...");

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "SUBSCRIPTION",
          itemId: selectedPlan.id,
          billingCycle: isAnnual ? "annual" : "monthly",
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toastError("Checkout Error", data.error || "Could not create Stripe Checkout session.");
        setIsProcessing(false);
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err: any) {
      toastError("Error", err.message || "Failed to initiate Stripe Checkout.");
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="lg">
      <div className="text-slate-100">
        <div>
          {/* Header */}
          <div className="pb-4 border-b border-slate-800 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>14-Day Free Trial • Stripe Verified Checkout</span>
            </div>
            <h3 className="text-xl font-bold text-slate-100">
              Activate Your {selectedPlan.name} Plan
            </h3>
            <p className="text-xs text-slate-400">
              Audit influencer authenticity, detect pod manipulation, and negotiate fair rates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-5 text-xs">
            {/* Plan Selector Buttons */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                  Selected Tier
                </label>
                <div className="flex items-center gap-2 text-[11px]">
                  <span
                    onClick={() => setIsAnnual(false)}
                    className={`cursor-pointer ${!isAnnual ? "text-white font-bold" : "text-slate-500"}`}
                  >
                    Monthly
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAnnual(!isAnnual)}
                    className="relative w-8 h-4 bg-slate-800 rounded-full p-0.5 cursor-pointer transition-colors"
                  >
                    <div
                      className={`w-3 h-3 bg-blue-400 rounded-full transition-transform ${
                        isAnnual ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span
                    onClick={() => setIsAnnual(true)}
                    className={`cursor-pointer ${isAnnual ? "text-emerald-400 font-bold" : "text-slate-500"}`}
                  >
                    Annual ({PricingService.getSavingsPercentage(selectedPlan)}% Savings)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {SAAS_PLANS.map((p) => {
                  const price = isAnnual ? p.priceAnnual : p.priceMonthly;
                  const isSelected = selectedPlanId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-600/15 border-blue-500 shadow-xs ring-1 ring-blue-500"
                          : "bg-slate-950 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-100 text-xs">{p.name}</span>
                        {p.popular && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-600 text-white uppercase">
                            Hot
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-0.5 mt-1">
                        <span className="text-base font-black text-blue-400">${price}</span>
                        <span className="text-[10px] text-slate-500">/mo</span>
                      </div>
                      <span className="text-[9px] text-slate-400 block mt-0.5 truncate">
                        {p.creatorChecksMonthly} checks/mo
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Features Summary */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-300">Plan Features:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                {selectedPlan.features.slice(0, 4).map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">
                  {selectedPlan.name} Plan ({isAnnual ? "Annual Billing" : "Monthly Billing"}):
                </span>
                <span className="font-bold text-slate-100">
                  ${unitPrice}/mo ({isAnnual ? `$${billedAmount}/yr` : `$${billedAmount}/mo`})
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Included Creator Authenticity Audits:</span>
                <span className="font-bold text-blue-400">
                  ⚡ {selectedPlan.creatorChecksMonthly} audits / month
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">Due Today (14-Day Free Trial):</span>
                <span className="text-base font-black text-emerald-400">$0.00 USD</span>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Stripe Checkout...</span>
                  </span>
                ) : (
                  <>
                    <span>Start 14-Day Free Trial ({selectedPlan.name})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="mt-2 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Hosted on Stripe&apos;s secure payment infrastructure. Cancel anytime before trial ends.</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
