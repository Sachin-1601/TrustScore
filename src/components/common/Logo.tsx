import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
  showTagline?: boolean;
  variant?: "light" | "dark";
  showBadge?: boolean;
}

export function Logo({ className = "", size = "md", href = "/", showTagline = false, variant = "dark", showBadge = true }: LogoProps) {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 group cursor-pointer ${className}`}>
      {/* Abstract Shield + Checkmark Data Glyph */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5/6 h-5/6 text-white"
        >
          {/* Shield Outline */}
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          {/* Data Checkmark / Analytical Pulse */}
          <path d="M9 12l2 2.5 4.5-5" strokeWidth="2.4" />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-white"></span>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center">
          <span className={`font-bold tracking-tight ${variant === "light" ? "text-slate-100" : "text-slate-900"} ${textSizes[size]}`}>
            Trust<span className="text-blue-600">Score</span>
          </span>
          {showBadge && (
            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/80 rounded">
              SaaS
            </span>
          )}
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium text-slate-500 -mt-0.5">
            Know who you can trust.
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="inline-block">{content}</Link>;
  }

  return content;
}
