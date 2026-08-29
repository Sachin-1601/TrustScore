"use client";

import React, { useEffect, useState } from "react";
import { getScoreBand, getScoreColor } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  inflatedProbability?: number;
  uncertaintyMargin?: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showSubtitle?: boolean;
  showRiskLabel?: boolean;
}

export function ScoreGauge({
  score,
  inflatedProbability,
  uncertaintyMargin = 1.8,
  size = "lg",
  className = "",
  showSubtitle = true,
  showRiskLabel = true,
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const scoreBand = getScoreBand(score);
  const color = getScoreColor(score);

  // SVG parameters
  const dimensions = {
    sm: { size: 100, strokeWidth: 8, fontSize: "text-2xl", labelSize: "text-[10px]" },
    md: { size: 140, strokeWidth: 10, fontSize: "text-3xl", labelSize: "text-xs" },
    lg: { size: 180, strokeWidth: 12, fontSize: "text-4xl", labelSize: "text-xs" },
    xl: { size: 220, strokeWidth: 14, fontSize: "text-5xl", labelSize: "text-sm" },
  };

  const currentDim = dimensions[size] || dimensions.lg;
  const radius = (currentDim.size - currentDim.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative inline-flex items-center justify-center">
        {/* Background glow */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-25"
          style={{ backgroundColor: color.hex }}
        />

        <svg
          width={currentDim.size}
          height={currentDim.size}
          className="relative block transform -rotate-90"
        >
          {/* Track */}
          <circle
            cx={currentDim.size / 2}
            cy={currentDim.size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={currentDim.strokeWidth}
            fill="transparent"
          />

          {/* Animated Value Arc */}
          <circle
            cx={currentDim.size / 2}
            cy={currentDim.size / 2}
            r={radius}
            stroke={color.hex}
            strokeWidth={currentDim.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <span className={`font-black tracking-tight text-slate-100 ${currentDim.fontSize}`}>
            {animatedScore}
          </span>
          <span className={`font-bold uppercase tracking-widest text-slate-400 ${currentDim.labelSize}`}>
            TrustScore
          </span>
        </div>
      </div>

      {showSubtitle && showRiskLabel && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color.hex }}
            />
            <span className="text-sm font-bold text-slate-200">
              {scoreBand}
            </span>
          </div>

          {inflatedProbability !== undefined && (
            <div className="mt-1 flex items-center justify-center gap-1 text-xs text-slate-400">
              <span>Estimated inflated engagement:</span>
              <strong className="text-slate-200 font-semibold">
                {inflatedProbability}%
              </strong>
              {uncertaintyMargin && (
                <span className="text-slate-500 text-[11px]">
                  (±{uncertaintyMargin}%)
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
