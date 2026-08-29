import React from "react";
import Link from "next/link";
import { CheckCircle2, Shield, Award, Zap, ArrowRight, Lock } from "lucide-react";
import { VerificationBadge } from "@/components/common/VerificationBadge";

export function ForCreatorsSection() {
  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200/80" id="creators">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider border border-emerald-200">
              <Award className="w-3.5 h-3.5" />
              <span>For Authentic Creators</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              Prove that your influence is authentic.
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Genuine creators shouldn&apos;t be punished by blanket fraud detection algorithms. TrustScore gives creators an opportunity to voluntarily verify their account and demonstrate authentic engagement directly to sponsor brands.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Verified Authenticity Badge
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Embed your verified score on media kits, rate cards, and pitch decks to justify premium sponsor rates.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Transparent Data Control
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect read-only platform OAuth with zero password sharing. Disconnect anytime with one click.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Faster Brand Deal Approvals
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Skip lengthy agency background checks and get approved for brand partnerships in minutes.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/for-creators"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all group"
              >
                <span>Claim Your Creator Verification</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Badge Demonstration Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Creator Media Kit Badge Preview
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  OAuth Verified
                </span>
              </div>

              {/* Creator Profile Badge Showcase */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
                    alt="Jordan Blake"
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">@jordantravel</h3>
                    <p className="text-xs text-slate-500">Jordan Blake • Travel & Photography</p>
                    <div className="mt-1.5">
                      <VerificationBadge isVerified={true} size="md" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">TrustScore</span>
                    <span className="text-lg font-bold text-blue-700">91 / 100</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Inflated Risk</span>
                    <span className="text-lg font-bold text-emerald-700">4.2% (Low)</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-800 space-y-1">
                <span className="font-bold block">Verified Badge Protection</span>
                <p className="text-blue-700 leading-relaxed text-[11px]">
                  &quot;Verified badges do not guarantee zero anomalies; they establish cryptographic proof of direct API telemetry and transparent audience history.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
