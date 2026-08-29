"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/common/Modal";
import { SAAS_PLANS, SaaSSubscriptionPlan } from "@/services/pricingService";
import {
  Sparkles,
  CheckCircle2,
  Lock,
  CreditCard,
  Building2,
  Mail,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

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
  const { success } = useToast();

  const [selectedPlanId, setSelectedPlanId] = useState<"starter" | "growth" | "agency">(defaultPlanId);
  const [isAnnual, setIsAnnual] = useState(defaultIsAnnual);
  const [workEmail, setWorkEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [cardNumber, setCardNumber] = useState("•••• •••• •••• 4242");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync state if default changes
  React.useEffect(() => {
    setSelectedPlanId(defaultPlanId);
    setIsAnnual(defaultIsAnnual);
  }, [defaultPlanId, defaultIsAnnual]);

  const selectedPlan = SAAS_PLANS.find((p) => p.id === selectedPlanId) || SAAS_PLANS[1];
  const unitPrice = isAnnual ? selectedPlan.priceAnnual : selectedPlan.priceMonthly;
  const billedAmount = isAnnual ? unitPrice * 12 : unitPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "SUBSCRIPTION",
          itemId: selectedPlan.id,
          billingCycle: isAnnual ? "annual" : "monthly",
          successUrl: "/dashboard/billing",
        }),
      });
      await res.json();
    } catch (err) {
      // simulated fallback
    }

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("ts_active_plan", selectedPlan.id);
        localStorage.setItem("ts_checks_limit", String(selectedPlan.creatorChecksMonthly));
      }
      success(
        `Welcome to TrustScore ${selectedPlan.name}!`,
        `Your 14-day trial is active with ${selectedPlan.creatorChecksMonthly} creator audits.`
      );
    }, 1000);
  };

  const handleFinish = () => {
    setIsSuccess(false);
    onClose();
    router.push(`/dashboard/billing?plan=${selectedPlan.id}&billing=${isAnnual ? "annual" : "monthly"}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={isSuccess ? handleFinish : onClose} title="" maxWidth="lg">
      <div className="text-slate-100">
        {!isSuccess ? (
          <div>
            {/* Header */}
            <div className="pb-4 border-b border-slate-800 space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>14-Day Free Trial • Instant Activation</span>
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
                      Annual (Save 20%)
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

              {/* Form Input Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Work Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="marketing@yourbrand.com"
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500 text-xs"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Company / Brand Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Media Corp"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500 text-xs"
                    />
                    <Building2 className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Payment Card Simulation */}
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Payment Method (Stripe Test Simulation)
                </label>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    <span className="font-mono text-slate-300 text-xs">{cardNumber}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Test Mode Ready
                  </span>
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
                    <span>Activating trial workspace...</span>
                  ) : (
                    <>
                      <span>Start 14-Day Free Trial ({selectedPlan.name})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="mt-2 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Zero risk. Cancel anytime in 1-click before trial ends.</span>
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-100">
                Welcome to TrustScore {selectedPlan.name}!
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your 14-day free trial has been activated with{" "}
                <span className="text-blue-400 font-bold">
                  {selectedPlan.creatorChecksMonthly} Creator Authenticity Audits
                </span>.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left text-xs max-w-sm mx-auto space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Active Tier:</span>
                <span className="font-bold text-slate-100">{selectedPlan.name} Plan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Audit Quota:</span>
                <span className="font-bold text-emerald-400">{selectedPlan.creatorChecksMonthly} Audits / mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Next Billing Date:</span>
                <span className="font-bold text-slate-200">Sep 12, 2026 (After 14d trial)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="w-full max-w-sm py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <span>Go to Billing &amp; Quotas Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
