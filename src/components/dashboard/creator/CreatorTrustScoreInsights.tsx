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
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <h3 className="text-base font-bold text-slate-100">
            TrustScore Insights &amp; Signals
          </h3>
        </div>
        <Link
          href="/dashboard/creator/analytics"
          className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
        >
          <span>Deep Dive</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {hasScore ? (
        <div className="space-y-4">
          {/* Positive Signals */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
              Positive Authenticity Signals
            </span>
            {positiveFactors.length > 0 ? (
              <div className="space-y-1.5">
                {positiveFactors.map((signal, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-2 text-xs text-emerald-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{signal}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No primary positive factors identified.</p>
            )}
          </div>

          {/* Warning Signals / Improvement Areas */}
          {warningFactors.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                Signals To Monitor / Improve
              </span>
              <div className="space-y-1.5">
                {warningFactors.map((warn, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2 text-xs text-amber-300"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{warn}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-blue-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-200">
            Insights will appear after your first TrustScore analysis
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Once social engagement telemetry is ingested, the engine evaluates lexical comment variance, pod detection, and follower stability curves.
          </p>
          <div className="pt-1">
            <Link
              href="/dashboard/creator/analytics"
              className="inline-flex items-center gap-1.5 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
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
