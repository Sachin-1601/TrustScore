import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RiskLevel, ScoreBand } from "@/types/influencer";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }
  return num.toLocaleString();
}

export function formatPercent(num: number, decimals = 1): string {
  return `${num.toFixed(decimals)}%`;
}

export function formatCurrency(num: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

export function getScoreBand(score: number): ScoreBand {
  if (score >= 90) return "Very High Trust";
  if (score >= 75) return "High Trust";
  if (score >= 50) return "Moderate Risk";
  if (score >= 25) return "High Risk";
  return "Very High Risk";
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return "Low";
  if (score >= 50) return "Moderate";
  if (score >= 25) return "High";
  return "Critical";
}

export function getScoreColor(score: number): {
  text: string;
  bg: string;
  border: string;
  hex: string;
  badge: string;
} {
  if (score >= 90) {
    return {
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      hex: "#10b981",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    };
  }
  if (score >= 75) {
    return {
      text: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
      hex: "#2563eb",
      badge: "bg-blue-100 text-blue-800 border-blue-300",
    };
  }
  if (score >= 50) {
    return {
      text: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      hex: "#f59e0b",
      badge: "bg-amber-100 text-amber-800 border-amber-300",
    };
  }
  if (score >= 25) {
    return {
      text: "text-orange-700",
      bg: "bg-orange-50",
      border: "border-orange-200",
      hex: "#ea580c",
      badge: "bg-orange-100 text-orange-800 border-orange-300",
    };
  }
  return {
    text: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    hex: "#e11d48",
    badge: "bg-rose-100 text-rose-800 border-rose-300",
  };
}

export function getRiskBadgeClasses(risk: RiskLevel): string {
  switch (risk) {
    case "Low":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Moderate":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "High":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "Critical":
      return "bg-rose-50 text-rose-700 border-rose-200";
  }
}
