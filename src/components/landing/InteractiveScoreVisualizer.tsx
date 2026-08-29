"use client";

import React, { useState } from "react";
import { ScoreGauge } from "@/components/common/ScoreGauge";
import { RiskScale } from "@/components/common/RiskScale";
import { getScoreBand, getScoreColor } from "@/lib/utils";
import { Info, Sparkles, Shield, AlertTriangle } from "lucide-react";

export function InteractiveScoreVisualizer() {
  const [selectedScore, setSelectedScore] = useState(87);

  // Preset prototype bands
  const bands = [
    { score: 95, label: "90–100", title: "Very High Trust", prob: "2.8%", color: "bg-emerald-500", text: "text-emerald-700" },
    { score: 87, label: "75–89", title: "High Trust", prob: "6.8%", color: "bg-blue-500", text: "text-blue-700" },
    { score: 63, label: "50–74", title: "Moderate Risk", prob: "28.4%", color: "bg-amber-500", text: "text-amber-700" },
    { score: 38, label: "25–49", title: "High Risk", prob: "68.2%", color: "bg-orange-500", text: "text-orange-700" },
    { score: 18, label: "0–24", title: "Very High Risk", prob: "85.0%", color: "bg-rose-500", text: "text-rose-700" },
  ];

  const currentBand = bands.find((b) => {
    if (selectedScore >= 90) return b.label === "90–100";
    if (selectedScore >= 75) return b.label === "75–89";
    if (selectedScore >= 50) return b.label === "50–74";
    if (selectedScore >= 25) return b.label === "25–49";
    return b.label === "0–24";
  }) || bands[1];

  const calculatedProb = Number((Math.max(2.1, (100 - selectedScore) * 0.88)).toFixed(1));

  return (
    <section className="py-20 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider border border-blue-200">
            <Shield className="w-3.5 h-3.5" />
            <span>Interactive Score Anatomy</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            The TrustScore Framework
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Explore how the 0–100 TrustScore maps to probabilistic risk bands and estimated inflated engagement.
          </p>
        </div>

        {/* Main Interactive Demo Box */}
        <div className="mt-12 max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-lg">
          {/* Preset Pill Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 pb-8 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">
              Preview Scoring Bands:
            </span>
            {bands.map((b) => (
              <button
                key={b.label}
                onClick={() => setSelectedScore(b.score)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedScore === b.score
                    ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900 ring-offset-2"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {b.label} ({b.title})
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-8">
            {/* Left Column: Big Circular Gauge */}
            <div className="md:col-span-6 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <ScoreGauge
                score={selectedScore}
                inflatedProbability={calculatedProb}
                uncertaintyMargin={1.8}
                size="xl"
              />

              {/* Slider Controller */}
              <div className="w-full mt-6 space-y-2">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Interactive Slider:</span>
                  <span className="font-bold text-slate-900">{selectedScore} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedScore}
                  onChange={(e) => setSelectedScore(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Right Column: Interpretation & Bands Breakdown */}
            <div className="md:col-span-6 space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Current Score Interpretation
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <span>{getScoreBand(selectedScore)}</span>
                  <span className="text-sm font-normal text-slate-500">
                    ({selectedScore}/100)
                  </span>
                </h3>
              </div>

              {/* Spectrum scale */}
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Continuous Risk Spectrum:</span>
                <RiskScale score={selectedScore} showLabels={true} />
              </div>

              {/* Prototype Scoring Bands Table */}
              <div className="pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Prototype Scoring Bands
                </span>
                <div className="space-y-1.5 text-xs">
                  {bands.map((b) => (
                    <div
                      key={b.label}
                      onClick={() => setSelectedScore(b.score)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        currentBand.label === b.label
                          ? "bg-blue-50/80 border border-blue-200 font-semibold"
                          : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${b.color}`} />
                        <span>{b.label}: {b.title}</span>
                      </div>
                      <span className="text-slate-400">Est. Inflated: ~{b.prob}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Research Disclaimer */}
              <div className="flex items-start gap-2 p-3 bg-amber-50/80 border border-amber-200/70 rounded-xl text-amber-800 text-[11px] leading-relaxed">
                <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Prototype scoring bands represent calibrated empirical thresholds and are continuously refined. They are intended for decision support rather than definitive classification.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
