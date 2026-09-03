"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { ShieldCheck, Sparkles } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-slate-50 text-slate-600 border-t border-slate-200 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Logo size="md" href="/" variant="light" />
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              &quot;Discover creators you can trust.&quot; The authentic creator marketplace powered by sample-efficient data science and probabilistic trust intelligence.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3" />
                <span>Certified Ethical AI</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                <Sparkles className="w-3 h-3" />
                <span>Enterprise Telemetry</span>
              </span>
            </div>
          </div>

          {/* Explore Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/creators" className="hover:text-slate-900 transition-colors">
                  Creator Marketplace
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-slate-900 transition-colors">
                  TrustScore Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/businesses" className="hover:text-slate-900 transition-colors">
                  Business Directory
                </Link>
              </li>
              <li>
                <Link href="/creators?category=Fitness" className="hover:text-slate-900 transition-colors">
                  Explore Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* For Businesses */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              For Businesses
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/for-businesses" className="hover:text-slate-900 transition-colors">
                  Brand Solutions
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="hover:text-amber-700 transition-colors text-amber-600 font-semibold">
                  Advertise With Us
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
                  Business Dashboard
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-slate-900 transition-colors">
                  SaaS Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* For Creators & Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              For Creators &amp; Science
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/for-creators" className="hover:text-slate-900 transition-colors">
                  Get Your TrustScore
                </Link>
              </li>
              <li>
                <Link href="/dashboard/verified" className="hover:text-slate-900 transition-colors">
                  Get Verified
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-slate-900 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/dashboard/model-insights" className="hover:text-slate-900 transition-colors">
                  Data Science Insights
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Notice */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} TrustScore Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Sponsored placements do not influence creator TrustScores.</span>
            <Link href="/how-it-works" className="hover:text-slate-900 underline">
              Methodology
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

