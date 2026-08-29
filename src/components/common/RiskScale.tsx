import React from "react";
import { getScoreColor } from "@/lib/utils";

interface RiskScaleProps {
  score: number;
  className?: string;
  showLabels?: boolean;
}

export function RiskScale({ score, className = "", showLabels = true }: RiskScaleProps) {
  const color = getScoreColor(score);
  // score clamped between 0 and 100
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div className={`w-full ${className}`}>
      {/* Continuous Spectrum Track */}
      <div className="relative h-3 w-full rounded-full overflow-hidden bg-slate-200 shadow-inner">
        <div
          className="absolute inset-0 h-full w-full"
          style={{
            background:
              "linear-gradient(to right, #ef4444 0%, #f97316 25%, #f59e0b 50%, #3b82f6 75%, #10b981 90%, #059669 100%)",
          }}
        />
        {/* Band separators */}
        <div className="absolute inset-0 flex justify-between pointer-events-none px-[25%]">
          <span className="w-0.5 h-full bg-white/40" />
          <span className="w-0.5 h-full bg-white/40" />
        </div>
      </div>

      {/* Needle Pointer */}
      <div className="relative w-full h-4 mt-1">
        <div
          className="absolute -top-1.5 flex flex-col items-center -translate-x-1/2 transition-all duration-700 ease-out"
          style={{ left: `${clamped}%` }}
        >
          {/* Arrow */}
          <div
            className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px]"
            style={{ borderBottomColor: color.hex }}
          />
          <div
            className="w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: color.hex }}
          />
        </div>
      </div>

      {/* Threshold Labels */}
      {showLabels && (
        <div className="flex justify-between items-center text-[10px] font-medium text-slate-400 mt-1 px-1">
          <span className="text-rose-600">0 (Very High Risk)</span>
          <span className="text-orange-600">25 (High)</span>
          <span className="text-amber-600">50 (Moderate)</span>
          <span className="text-blue-600">75 (High Trust)</span>
          <span className="text-emerald-600">100 (Very High)</span>
        </div>
      )}
    </div>
  );
}
