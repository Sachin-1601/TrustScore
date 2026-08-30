"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Business } from "@/types/creator";
import {
  MapPin,
  Briefcase,
  Mail,
  Send,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from "lucide-react";

export default function BusinessProfilePage({
  params,
}: {
  params: Promise<{ business: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.business.toLowerCase();

  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [creatorPitch, setCreatorPitch] = useState("");
  const [creatorHandle, setCreatorHandle] = useState("");
  const [creatorEmail, setCreatorEmail] = useState("");
  const [isPitchSent, setIsPitchSent] = useState(false);

  useEffect(() => {
    async function loadBusiness() {
      try {
        const res = await fetch(`/api/businesses/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.business) {
            setBusiness(data.business);
          }
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }
    loadBusiness();
  }, [slug]);

  const handleSendPitch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPitchSent(true);
    setTimeout(() => setIsPitchSent(false), 4000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
        <LandingNavbar />
        <main className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-xs font-semibold">Loading brand profile...</span>
        </main>
        <LandingFooter />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
        <LandingNavbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-16 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-200">Business Profile Not Found</h2>
          <p className="text-xs text-slate-400">The requested business profile does not exist or has been modified.</p>
          <Link href="/businesses" className="inline-block px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl">
            Back to Business Directory
          </Link>
        </main>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white">
      <LandingNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/businesses" className="hover:text-slate-200">
            Businesses
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-semibold">{business.name}</span>
        </div>

        {/* Business Header Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={business.logo}
                alt={business.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-slate-700 shadow-lg"
              />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-100">
                    {business.name}
                  </h1>
                  {business.isSponsored && (
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Sponsored
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-semibold">
                    {business.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{business.location}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed pt-1">
                  {business.tagline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
              <a
                href={business.website}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>Visit Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={`mailto:${business.contactEmail}`}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Brand</span>
              </a>
            </div>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: About & Products */}
          <div className="lg:col-span-7 space-y-6">
            {/* About Section */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-base font-bold text-slate-100">About {business.name}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {business.description}
              </p>
            </div>

            {/* Products & Services */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-base font-bold text-slate-100">Featured Products &amp; Services</h3>
              <div className="flex flex-wrap gap-2.5">
                {business.productsOrServices.map((prod) => (
                  <span
                    key={prod}
                    className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-semibold text-xs"
                  >
                    {prod}
                  </span>
                ))}
              </div>
            </div>

            {/* Open Creator Opportunities */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  <span>Open Creator Opportunities ({business.openOpportunities.length})</span>
                </h3>
              </div>

              <div className="space-y-4">
                {business.openOpportunities.map((opp) => (
                  <div
                    key={opp.title}
                    className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-100 text-sm">{opp.title}</h4>
                      <span className="text-emerald-400 font-extrabold">{opp.budget}</span>
                    </div>
                    <p className="text-slate-400">
                      <strong className="text-slate-300">Deliverables:</strong> {opp.deliverables}
                    </p>
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-900 text-slate-300 text-[10px] font-semibold">
                      Category: {opp.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Pitch Form */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 sticky top-24">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-100">Pitch Your Creator Profile</h3>
              <p className="text-xs text-slate-400">
                Send your TrustScore profile and campaign idea directly to {business.name}&apos;s marketing team.
              </p>
            </div>

            {!isPitchSent ? (
              <form onSubmit={handleSendPitch} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                    Your Creator Handle (@username)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="@alexfitness"
                    value={creatorHandle}
                    onChange={(e) => setCreatorHandle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                    Your Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@creator.com"
                    value={creatorEmail}
                    onChange={(e) => setCreatorEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                    Collaboration Concept / Pitch
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tell the brand why your audience is a great fit, your average engagement rate, and proposed deliverable format..."
                    value={creatorPitch}
                    onChange={(e) => setCreatorPitch(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Pitch to Brand</span>
                </button>
              </form>
            ) : (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-100 text-sm">Pitch Transmitted!</h4>
                <p className="text-xs text-slate-400">
                  {business.name} will review your TrustScore analytics and get in touch via email.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
