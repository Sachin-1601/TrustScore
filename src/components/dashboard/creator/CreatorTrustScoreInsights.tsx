"use client";

import React from "react";
import Link from "next/link";
import { Creator } from "@/types/creator";
import { CheckCircle2, AlertCircle, Sparkles, ArrowRight, ShieldAlert, BarChart3 } from "lucide-react";

interface CreatorTrustScoreInsightsProps {
  creator: Creator;
}

export function CreatorTrustScoreInsights({ creator }: CreatorTrustScoreInsightsProps) {
  const hasScore = creator.trustScore > 0;
  const positiveFactors = creator.positiveFactors || [];
  const warningFactors = creator.warningFactors || [];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">
            TrustScore Insights &amp; Signals
          </h3>
        </div>
        <Link
          href="/dashboard/creator/analytics"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
        >
          <span>Deep Dive</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {hasScore ? (
        <div className="space-y-4">
          {/* Positive Signals */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
              Positive Authenticity Signals
            </span>
            {positiveFactors.length > 0 ? (
              <div className="space-y-1.5">
                {positiveFactors.map((signal, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-tight">{signal}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No primary positive factors identified.</p>
            )}
          </div>

          {/* Warning Signals / Improvement Areas */}
          {warningFactors.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                Signals To Monitor / Improve
              </span>
              <div className="space-y-1.5">
                {warningFactors.map((warn, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 flex items-start gap-2 text-xs text-amber-800"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="leading-tight">{warn}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-blue-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">
            Insights will appear after your first TrustScore analysis
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once social engagement telemetry is ingested, the engine evaluates lexical comment variance, pod detection, and follower stability curves.
          </p>
          <div className="pt-1">
            <Link
              href="/dashboard/creator/analytics"
              className="inline-flex items-center gap-1.5 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
            >
              <span>Run TrustScore Analysis</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
