"use client";

import React from "react";
import Link from "next/link";
import { ScoreGauge } from "@/components/common/ScoreGauge";
import { Creator } from "@/types/creator";
import { Sparkles, ShieldCheck, AlertCircle, ArrowRight, Activity, CheckCircle2, RefreshCw } from "lucide-react";
import { getScoreBand, getScoreColor } from "@/lib/utils";

interface CreatorTrustScoreCardProps {
  creator: Creator;
}

export function CreatorTrustScoreCard({ creator }: CreatorTrustScoreCardProps) {
  const hasValidScore = creator.trustScore > 0;
  const scoreBand = getScoreBand(creator.trustScore);
  const scoreColor = getScoreColor(creator.trustScore);

  const formattedDate = creator.analyzedAt
    ? new Date(creator.analyzedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Authenticity &amp; TrustScore™
            </h2>
            <p className="text-xs text-slate-500">
              Statistical Bayesian authenticity evaluation calibrated against verified audience signals.
            </p>
          </div>
        </div>

        {hasValidScore && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Audited on {formattedDate}</span>
          </div>
        )}
      </div>

      {hasValidScore ? (
        /* ========================================================================= */
        /* STATE 1: VALID SCORE COMPUTED                                             */
        /* ========================================================================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Visual Gauge */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50/80 rounded-2xl border border-slate-200/70 shadow-xs">
            <ScoreGauge
              score={creator.trustScore}
              size="lg"
              showSubtitle={false}
              showRiskLabel={false}
            />
            <div className="mt-3 text-center space-y-1">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: `${scoreColor.hex}15`,
                  color: scoreColor.hex,
                  border: `1px solid ${scoreColor.hex}30`,
                }}
              >
                {scoreBand}
              </span>
              <p className="text-[11px] text-slate-500">
                Confidence: <strong className="text-slate-800 font-semibold">{creator.prescriptiveGuidance?.confidenceLevel || "High"}</strong>
              </p>
            </div>
          </div>

          {/* Core Authenticity Dossier Metrics */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Authenticity Probability</span>
                  <strong className="text-emerald-600 font-black text-sm">
                    {creator.authenticityProbability}%
                  </strong>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${creator.authenticityProbability}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  High statistical confidence of organic follower engagement.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Inflated Engagement Risk</span>
                  <strong className="text-blue-600 font-black text-sm">
                    {creator.inflatedEngagementProbability}%
                  </strong>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${Math.min(100, creator.inflatedEngagementProbability * 3)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Estimated artificial or engagement pod concentration.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Comment Lexical Diversity</span>
                  <strong className="text-slate-800 font-black text-sm">
                    {creator.commentDiversityPercent}%
                  </strong>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Linguistic variance across audience replies and interactions.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Growth Stability Score</span>
                  <strong className="text-slate-800 font-black text-sm">
                    {creator.growthStabilityScore}/100
                  </strong>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Follower acquisition monotonicity without erratic spikes.
                </p>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-500">
                Probabilistic authenticity index computed via multi-signal statistical inference.
              </span>
              <Link
                href="/dashboard/creator/analytics"
                className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>View TrustScore Analytics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* STATE 2: NO SCORE YET (INSUFFICIENT DATA / INITIAL SETUP PENDING)         */
        /* ========================================================================= */
        <div className="p-6 sm:p-8 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-center space-y-5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center mx-auto">
            <Activity className="w-6 h-6" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="text-lg font-bold text-slate-900">
              TrustScore Not Available Yet
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your profile requires social telemetry and initial post analysis before the TrustScore engine can compute an audited Bayesian score.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left text-xs pt-1">
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Step 1</span>
              <p className="font-bold text-slate-800">Connect Social Account</p>
              <p className="text-[11px] text-slate-500">Sync engagement snapshots.</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Step 2</span>
              <p className="font-bold text-slate-800">Telemetry Ingestion</p>
              <p className="text-[11px] text-slate-500">Audit lexical comment diversity.</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Step 3</span>
              <p className="font-bold text-slate-800">Compute TrustScore</p>
              <p className="text-[11px] text-slate-500">Generate verified badge dossier.</p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard/creator/verification"
              className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Connect Social Account</span>
            </Link>
            <Link
              href="/dashboard/creator/analytics"
              className="py-2.5 px-5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Run TrustScore Analysis</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
