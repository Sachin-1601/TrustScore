"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  SAAS_PLANS,
  ADDON_CREDIT_PACKS,
  SaaSSubscriptionPlan,
  AddonCreditPack,
  PricingService,
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
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SubscriptionData {
  planId: string;
  planName: string;
  status: string;
  billingCycle: string;
  creatorChecksLimit: number;
  creatorChecksRemaining: number;
  checksUsed: number;
  usagePercentage: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

interface PaymentMethodData {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

interface InvoiceData {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  hostedInvoiceUrl?: string;
  invoicePdfUrl?: string;
}

function BillingContent() {
  const searchParams = useSearchParams();
  const { success, error: toastError, info } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [subData, setSubData] = useState<SubscriptionData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodData | null>(null);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [isAnnual, setIsAnnual] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  // Modals state
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);

  // Load subscription and invoice data from server
  const loadBillingData = async () => {
    try {
      setIsLoading(true);
      const [subRes, invRes] = await Promise.all([
        fetch("/api/payments/subscription"),
        fetch("/api/payments/invoices"),
      ]);

      if (subRes.ok) {
        const data = await subRes.json();
        if (data.subscription) {
          setSubData(data.subscription);
          setPaymentMethod(data.paymentMethod || null);
          setIsAnnual(data.subscription.billingCycle === "annual");
        }
      }

      if (invRes.ok) {
        const data = await invRes.json();
        setInvoices(data.invoices || []);
      }
    } catch (err) {
      console.error("Failed to load billing data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  const currentPlanId = (subData?.planId?.toLowerCase() as "starter" | "growth" | "agency") || "growth";
  const activePlan = SAAS_PLANS.find((p) => p.id === currentPlanId) || SAAS_PLANS[1];
  const checksLimit = subData?.creatorChecksLimit ?? activePlan.creatorChecksMonthly;
  const checksRemaining = subData?.creatorChecksRemaining ?? activePlan.creatorChecksMonthly;
  const checksUsed = subData?.checksUsed ?? 0;
  const usagePercentage = subData?.usagePercentage ?? 0;

  // Format cycle dates
  const formatDate = (isoString?: string) => {
    if (!isoString) return "Active";
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleUpgrade = async (plan: SaaSSubscriptionPlan) => {
    setIsProcessing(true);
    info("Redirecting to Checkout", "Preparing secure Stripe Checkout session...");
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "SUBSCRIPTION",
          itemId: plan.id,
          billingCycle: isAnnual ? "annual" : "monthly",
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toastError("Checkout Error", data.error || "Could not create Stripe Checkout session.");
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err: any) {
      toastError("Error", err.message || "Failed to initiate Stripe Checkout.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePurchaseAddon = async (pack: AddonCreditPack) => {
    setIsProcessing(true);
    info("Redirecting to Checkout", `Preparing checkout for ${pack.name}...`);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "CREDIT_TOP_UP",
          itemId: pack.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toastError("Checkout Error", data.error || "Could not initiate add-on purchase.");
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err: any) {
      toastError("Error", err.message || "Failed to initiate add-on purchase.");
    } finally {
      setIsProcessing(false);
      setIsAddonModalOpen(false);
    }
  };

  const handleOpenCustomerPortal = async () => {
    setIsPortalLoading(true);
    try {
      const res = await fetch("/api/payments/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || data.error) {
        toastError("Portal Error", data.error || "Could not open Stripe Billing Portal.");
        return;
      }
      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      }
    } catch (err: any) {
      toastError("Error", err.message || "Failed to open Stripe Billing Portal.");
    } finally {
      setIsPortalLoading(false);
    }
  };

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
                  {subData?.status === "TRIALING" ? "14-Day Trial Active" : `${activePlan.name} Tier Active`}
                </span>
                {subData?.currentPeriodEnd && (
                  <span className="text-[10px] text-slate-500">
                    Cycle: {formatDate(subData.currentPeriodStart)} – {formatDate(subData.currentPeriodEnd)}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-100 mt-1">
                Creator Authenticity Audit Quota
              </h3>
            </div>

            <div className="flex items-center gap-3">
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

              <button
                type="button"
                onClick={handleOpenCustomerPortal}
                disabled={isPortalLoading}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                title="Manage billing details, cards, and invoices via Stripe"
              >
                {isPortalLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Manage Billing</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span>
                {checksUsed} of {checksLimit} Audits Consumed ({usagePercentage}%)
              </span>
              <span className="text-emerald-400 font-bold">
                {subData?.currentPeriodEnd ? `Quota Resets on ${formatDate(subData.currentPeriodEnd)}` : "Quota Resets Monthly"}
              </span>
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
                  Save 20–26%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SAAS_PLANS.map((plan) => {
              const isCurrent = currentPlanId === plan.id;
              const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
              const billedTotal = isAnnual ? plan.priceAnnual * 12 : plan.priceMonthly;

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
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-100 text-lg">{plan.name}</h4>
                      {isAnnual && (
                        <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          Save {PricingService.getSavingsPercentage(plan)}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline gap-1 pt-2">
                      <span className="text-3xl font-black text-slate-100">${price}</span>
                      <span className="text-xs text-slate-400 font-semibold">/ month</span>
                    </div>
                    {isAnnual && (
                      <p className="text-[11px] text-slate-400">
                        Billed annually at <strong className="text-slate-200">${billedTotal}/yr</strong>
                      </p>
                    )}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-slate-100 text-base">Invoice &amp; Billing History</h4>
              <p className="text-xs text-slate-400">Download official receipts and Stripe transaction records</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CreditCard className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {paymentMethod ? (
                  `${paymentMethod.brand} •••• ${paymentMethod.last4} (Exp ${paymentMethod.expMonth}/${paymentMethod.expYear})`
                ) : (
                  "No payment method on file"
                )}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {invoices.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Invoice / Record</th>
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
                      <td className="py-3 px-4 font-bold text-slate-100">{formatCurrency(inv.amount)} {inv.currency}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {inv.hostedInvoiceUrl || inv.invoicePdfUrl ? (
                          <a
                            href={inv.hostedInvoiceUrl || inv.invoicePdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Stripe Receipt</span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(inv)}
                            className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF Receipt</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                <p>No billing invoices recorded yet.</p>
                <p className="text-[11px] text-slate-500">Official invoice receipts will appear here after your first Stripe subscription payment.</p>
              </div>
            )}
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
                  disabled={isProcessing}
                  onClick={() => handlePurchaseAddon(pack)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
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
                <span className="font-bold text-slate-100 block">Verified Business Account</span>
                <span className="text-slate-400">{paymentMethod ? `${paymentMethod.brand} •••• ${paymentMethod.last4}` : "Stripe Payment"}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Invoice Date:</span>
                <span className="font-bold text-slate-100 block">{selectedInvoice.date}</span>
                <span className="text-slate-400">Status: {selectedInvoice.status}</span>
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
                <span>Total Paid ({selectedInvoice.currency})</span>
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
                  success("Receipt Exported", "Receipt details printed.");
                  setSelectedInvoice(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Done</span>
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
