import React from "react";
import { RiskLevel } from "@/types/influencer";
import { ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon } from "lucide-react";

interface RiskBadgeProps {
  risk: RiskLevel;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function RiskBadge({ risk, size = "md", showIcon = true, className = "" }: RiskBadgeProps) {
  const configs = {
    Low: {
      label: "Low Risk",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      icon: ShieldCheck,
    },
    Moderate: {
      label: "Moderate Risk",
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
      icon: AlertTriangle,
    },
    High: {
      label: "High Risk",
      bg: "bg-orange-50 text-orange-700 border-orange-200",
      dot: "bg-orange-500",
      icon: ShieldAlert,
    },
    Critical: {
      label: "Critical Risk",
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
      icon: AlertOctagon,
    },
  };

  const current = configs[risk] || configs.Low;
  const Icon = current.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs font-semibold gap-1.5",
    lg: "px-3.5 py-1.5 text-sm font-semibold gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${current.bg} ${sizeClasses[size]} ${className}`}
    >
      {showIcon ? (
        <Icon className={`${iconSizes[size]} shrink-0`} />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot} shrink-0`} />
      )}
      <span>{current.label}</span>
    </span>
  );
}
