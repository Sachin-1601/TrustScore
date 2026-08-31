"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2, ArrowRight, RefreshCw, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const isAddon = searchParams.get("type") === "addon";

  const [isVerifying, setIsVerifying] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [subDetails, setSubDetails] = useState<any | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const checkStatus = async () => {
    try {
      setIsVerifying(true);
      const res = await fetch("/api/payments/subscription");
      if (res.ok) {
        const data = await res.json();
        if (data.subscription) {
          setSubDetails(data.subscription);
          if (data.subscription.status === "ACTIVE" || data.subscription.status === "TRIALING") {
            setIsConfirmed(true);
            setIsVerifying(false);
            return;
          }
        }
      }
    } catch (err) {
      console.error("Status polling error:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    checkStatus();

    // Auto-poll up to 5 times (every 2.5 seconds) while waiting for Stripe webhook confirmation
    if (!isConfirmed && pollCount < 5) {
      const timer = setTimeout(() => {
        setPollCount((prev) => prev + 1);
        checkStatus();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [pollCount, isConfirmed]);

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Payment Confirmation"
        subtitle="Verifying Stripe subscription transaction with the TrustScore database"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-xl mx-auto w-full space-y-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-md">
          {isConfirmed ? (
            <>
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  Subscription Verified &amp; Active
                </span>
                <h3 className="text-2xl font-black text-slate-100">
                  {isAddon ? "Audit Credits Added!" : `Welcome to TrustScore ${subDetails?.planName || "Pro"}!`}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  {isAddon
                    ? "Your add-on audit credits have been confirmed by Stripe and added to your balance."
                    : `Your ${subDetails?.planName || "Growth"} plan subscription is now active with ${subDetails?.creatorChecksRemaining || 100} creator authenticity audits.`}
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Subscription Status:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{subDetails?.status === "TRIALING" ? "14-Day Free Trial" : "Active"}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Available Creator Checks:</span>
                  <span className="font-bold text-blue-400">
                    ⚡ {subDetails?.creatorChecksRemaining} / {subDetails?.creatorChecksLimit} Audits
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Billing Cycle:</span>
                  <span className="font-bold text-slate-200 capitalize">{subDetails?.billingCycle || "Monthly"}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Link
                  href="/dashboard/analyze"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Auditing Creators</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/dashboard/billing"
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors block text-center"
                >
                  Return to Billing Dashboard
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
                  Stripe Payment Received
                </span>
                <h3 className="text-xl font-black text-slate-100">
                  Confirming Your Subscription...
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Your payment was received by Stripe. We are awaiting final webhook event confirmation to activate your database quota.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center gap-3 text-left">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-[11px]">
                  All plan activations require verified webhook confirmation. This usually takes 2–5 seconds.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => checkStatus()}
                  disabled={isVerifying}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
                  <span>Check Status Again</span>
                </button>

                <Link
                  href="/dashboard/billing"
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
                >
                  Go to Billing
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Verifying payment result...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
