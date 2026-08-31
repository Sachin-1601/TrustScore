"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { XCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

function CancelContent() {
  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Checkout Cancelled"
        subtitle="Your checkout session was cancelled before completing payment"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-xl mx-auto w-full space-y-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-md">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
            <XCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
              No Charge Made
            </span>
            <h3 className="text-2xl font-black text-slate-100">
              Checkout Cancelled
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              No payment was processed. Your account tier and existing creator audit quotas remain unchanged.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center gap-3 text-left">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
            <span className="text-[11px]">
              You can restart the checkout process anytime or choose another plan that suits your brand&apos;s roster needs.
            </span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/billing"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Try Again</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors block text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading cancellation status...</div>}>
      <CancelContent />
    </Suspense>
  );
}
