import React from "react";
import { CheckCircle2 } from "lucide-react";

interface VerificationBadgeProps {
  isVerified?: boolean;
  verifiedDate?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export function VerificationBadge({
  isVerified = true,
  verifiedDate,
  size = "md",
  className = "",
  showText = true,
}: VerificationBadgeProps) {
  if (!isVerified) {
    return (
      <span
        className={`inline-flex items-center text-slate-400 text-xs font-medium ${className}`}
        title="Unverified account (Public profile evaluation)"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-1.5" />
        Unverified
      </span>
    );
  }

  const sizes = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-xs font-medium px-2.5 py-1 gap-1.5",
    lg: "text-sm font-semibold px-3 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 ${sizes[size]} ${className}`}
      title={verifiedDate ? `TrustScore Verified via OAuth on ${verifiedDate}` : "TrustScore Verified Creator"}
    >
      <CheckCircle2 className={`${iconSizes[size]} text-blue-600 shrink-0`} />
      {showText && <span>TrustScore Verified</span>}
    </span>
  );
}
