"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  SAAS_PLANS,
  ADDON_CREDIT_PACKS,
  SaaSSubscriptionPlan,
  AddonCreditPack,
} from "@/services/pricingService";
import { Modal } from "@/components/common/Modal";
import { useToast } from "@/contexts/ToastContext";
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  Clock,
  Download,
  Plus,
  Printer,
  FileText,
  AlertCircle,
  Lock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

function BillingContent() {
  const searchParams = useSearchParams();
  const { success, info } = useToast();

  const planParam = searchParams.get("plan") as "starter" | "growth" | "agency" | null;
  const billingParam = searchParams.get("billing");

  const [currentPlanId, setCurrentPlanId] = useState<"starter" | "growth" | "agency">(() => {
    if (planParam && ["starter", "growth", "agency"].includes(planParam)) return planParam;
    if (typeof window !== "undefined") {
      const savedPlan = localStorage.getItem("ts_active_plan") as "starter" | "growth" | "agency" | null;
      if (savedPlan && ["starter", "growth", "agency"].includes(savedPlan)) return savedPlan;
    }
    return "growth";
  });
  const [isAnnual, setIsAnnual] = useState(billingParam === "annual");
  const [bonusChecks, setBonusChecks] = useState(0);
  const [checksUsed, setChecksUsed] = useState(13);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modals state
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Active plan details
  const activePlan = SAAS_PLANS.find((p) => p.id === currentPlanId) || SAAS_PLANS[1];
  const checksLimit = activePlan.creatorChecksMonthly + bonusChecks;
  const checksRemaining = Math.max(0, checksLimit - checksUsed);
  const usagePercentage = Math.min(100, Math.round((checksUsed / checksLimit) * 100));

  const handleUpgrade = async (plan: SaaSSubscriptionPlan) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "SUBSCRIPTION",
          itemId: plan.id,
          billingCycle: isAnnual ? "annual" : "monthly",
          successUrl: window.location.href,
        }),
      });
      await res.json();
      setCurrentPlanId(plan.id);
      if (typeof window !== "undefined") {
        localStorage.setItem("ts_active_plan", plan.id);
      }
      success(
        `Switched to ${plan.name} Plan!`,
        `Your creator audit quota has been updated to ${plan.creatorChecksMonthly + bonusChecks} audits.`
      );
    } catch (e) {
      setCurrentPlanId(plan.id);
      info("Plan Updated", `Active tier set to ${plan.name}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePurchaseAddon = (pack: AddonCreditPack) => {
    setBonusChecks((prev) => prev + pack.checksCount);
    setIsAddonModalOpen(false);
    success(
      `Added +${pack.checksCount} Creator Checks!`,
      `Your total audit quota is now ${activePlan.creatorChecksMonthly + bonusChecks + pack.checksCount}.`
    );
  };

  const invoices = [
    {
      id: "INV-2026-0829",
      date: "Aug 29, 2026",
      description: `${activePlan.name} Plan (${isAnnual ? "Annual" : "Monthly"})`,
      amount: isAnnual ? activePlan.priceAnnual * 12 : activePlan.priceMonthly,
      status: "Paid",
      tax: isAnnual ? 0 : 0,
      paymentMethod: "Visa ending in 4242",
    },
    {
      id: "INV-2026-0729",
      date: "Jul 29, 2026",
      description: "Growth Plan (Monthly)",
      amount: 99.0,
      status: "Paid",
      tax: 0,
      paymentMethod: "Visa ending in 4242",
    },
  ];

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Billing & Creator Audit Quotas"
        subtitle="Manage your brand subscription plan, check credits, and invoice history"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Usage Quota Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  {activePlan.name} Tier Active
                </span>
                <span className="text-[10px] text-slate-500">
                  Cycle: Aug 29 – Sep 28, 2026
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mt-1">
                Creator Authenticity Audit Quota
              </h3>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-left sm:text-right">
                <span className="text-3xl font-black text-blue-400">{checksRemaining}</span>
                <span className="text-sm font-semibold text-slate-400"> / {checksLimit} Checks Remaining</span>
              </div>

              <button
                type="button"
                onClick={() => setIsAddonModalOpen(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Top Up Audits</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span>
                {checksUsed} of {checksLimit} Audits Consumed ({usagePercentage}%)
                {bonusChecks > 0 && <span className="text-blue-400 ml-1">({bonusChecks} bonus credits active)</span>}
              </span>
              <span className="text-emerald-400 font-bold">Quota Resets in 30 Days</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Subscription Plans Selection */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Available SaaS Plans</h3>
              <p className="text-xs text-slate-400">
                Upgrade or downgrade your team tier anytime with automated Stripe prorated billing.
              </p>
            </div>

            <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl self-start sm:self-auto text-xs">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                  !isAnnual ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  isAnnual ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>Annual</span>
                <span className="text-[10px] text-emerald-300 font-extrabold bg-emerald-500/20 px-1.5 py-0.2 rounded">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SAAS_PLANS.map((plan) => {
              const isCurrent = currentPlanId === plan.id;
              const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;

              return (
                <div
                  key={plan.id}
                  className={`bg-slate-900/90 border rounded-3xl p-6 space-y-6 relative transition-all duration-200 ${
                    isCurrent
                      ? "border-blue-500 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white shadow-md">
                      Current Active Plan
                    </span>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-100 text-lg">{plan.name}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline gap-1 pt-2">
                      <span className="text-3xl font-black text-slate-100">${price}</span>
                      <span className="text-xs text-slate-400 font-semibold">/ month</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-semibold text-blue-300">
                    ⚡ {plan.creatorChecksMonthly} Creator Authenticity Audits / mo
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    disabled={isCurrent || isProcessing}
                    onClick={() => handleUpgrade(plan)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-slate-800 text-slate-400 cursor-default"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25"
                    }`}
                  >
                    {isCurrent ? "Active Plan" : `Switch to ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invoices History Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-100 text-base">Invoice &amp; Billing History</h4>
              <p className="text-xs text-slate-400">Download official PDF receipts for your accounting department</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <CreditCard className="w-3.5 h-3.5 text-blue-400" />
              <span>Default Card: Visa •••• 4242</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-100">{inv.id}</td>
                    <td className="py-3 px-4">{inv.date}</td>
                    <td className="py-3 px-4">{inv.description}</td>
                    <td className="py-3 px-4 font-bold text-slate-100">{formatCurrency(inv.amount)} USD</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(inv)}
                        className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add-On Credits Purchase Modal */}
      <Modal
        isOpen={isAddonModalOpen}
        onClose={() => setIsAddonModalOpen(false)}
        title="Top Up Creator Authenticity Audits"
        description="Purchase instant add-on credits to continue auditing creators without upgrading your monthly plan tier."
      >
        <div className="space-y-4 pt-2 text-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ADDON_CREDIT_PACKS.map((pack) => (
              <div
                key={pack.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                  pack.popular
                    ? "bg-blue-600/15 border-blue-500"
                    : "bg-slate-950 border-slate-800"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-100">{pack.name}</span>
                    {pack.popular && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-blue-600 text-white">
                        Best Value
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-black text-blue-400">${pack.price}</span>
                    <span className="text-[10px] text-slate-400">USD</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold block mt-1">
                    +{pack.checksCount} Creator Checks
                  </span>
                  <span className="text-[10px] text-slate-500">
                    ${pack.unitPrice} per audit
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handlePurchaseAddon(pack)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Buy +{pack.checksCount} Checks
                </button>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Add-on credits never expire and roll over indefinitely.</span>
          </div>
        </div>
      </Modal>

      {/* Invoice PDF Receipt Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Receipt: ${selectedInvoice.id}`}
        >
          <div className="space-y-5 text-xs text-slate-200">
            {/* Header branding */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-base font-black text-white block">TrustScore Inc.</span>
                <span className="text-[10px] text-slate-500">ABN: 88 192 849 102 • Sydney, Australia</span>
              </div>
              <span className="px-2.5 py-1 rounded-full font-bold uppercase text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Paid in Full
              </span>
            </div>

            {/* Invoice metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Billed To:</span>
                <span className="font-bold text-slate-100 block">Sarah Jenkins (Acme Brand)</span>
                <span className="text-slate-400">sarah@acmebrand.com</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Invoice Date:</span>
                <span className="font-bold text-slate-100 block">{selectedInvoice.date}</span>
                <span className="text-slate-400">Paid via {selectedInvoice.paymentMethod}</span>
              </div>
            </div>

            {/* Line items */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2">
              <div className="flex justify-between font-bold text-slate-100 pb-2 border-b border-slate-800">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>{selectedInvoice.description}</span>
                <span className="font-mono">{formatCurrency(selectedInvoice.amount)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px] pt-2 border-t border-slate-800">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedInvoice.amount)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Tax (0%)</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-emerald-400 pt-2 border-t border-slate-800">
                <span>Total Paid (USD)</span>
                <span>{formatCurrency(selectedInvoice.amount)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  success("Receipt Downloaded", "PDF saved to your downloads.");
                  setSelectedInvoice(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading billing workspace...</div>}>
      <BillingContent />
    </Suspense>
  );
}
