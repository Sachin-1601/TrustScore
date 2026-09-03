"use client";

import React, { useState } from "react";
import { Modal } from "@/components/common/Modal";
import {
  Sparkles,
  CheckCircle2,
  DollarSign,
  Building2,
  Globe,
  Tag,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const AD_PACKAGES = [
  {
    id: "starter",
    name: "Starter Showcase",
    price: 199,
    duration: "14 Days",
    placement: "Right Sidebar Placement",
    impressions: "15,000+ estimated impressions",
    popular: false,
    features: [
      "Right sidebar featured brand card",
      "Direct website traffic link",
      "Basic impression & click telemetry",
      "Brand category tagging",
    ],
  },
  {
    id: "growth",
    name: "Growth Spotlight",
    price: 399,
    duration: "30 Days",
    placement: "Homepage & Marketplace Top",
    impressions: "45,000+ estimated impressions",
    popular: true,
    features: [
      "Top-tier left sidebar placement",
      "Sponsored badge in brand directory",
      "Real-time CTR analytics dashboard",
      "Direct creator partnership pitch link",
      "Priority creator inbox routing",
    ],
  },
  {
    id: "premium",
    name: "Platform Takeover",
    price: 799,
    duration: "60 Days",
    placement: "Multi-Placement Network",
    impressions: "120,000+ estimated impressions",
    popular: false,
    features: [
      "Multi-slot rotation across all pages",
      "Featured placement on Creator Dashboards",
      "Verified brand partner seal",
      "Dedicated account manager",
      "Custom creator briefing support",
    ],
  },
];

interface AdPlacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPackageId?: string;
}

export function AdPlacementModal({
  isOpen,
  onClose,
  defaultPackageId = "growth",
}: AdPlacementModalProps) {
  const [selectedPackageId, setSelectedPackageId] = useState(defaultPackageId);
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("Fitness & Nutrition");
  const [website, setWebsite] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedPkg = AD_PACKAGES.find((p) => p.id === selectedPackageId) || AD_PACKAGES[1];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "ADVERTISEMENT",
          itemId: selectedPkg.id,
          adDetails: {
            businessName,
            category,
            tagline: tagline || `${businessName} Partnerships`,
            description: description || "Direct-to-consumer brand collaborating with creators.",
            ctaLink: website.startsWith("http") ? website : `https://${website}`,
            placement: selectedPkg.id === "growth" ? "LEFT_SIDEBAR" : "RIGHT_SIDEBAR",
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        // Fallback for unauthenticated visitors
        window.location.href = `/signup?role=BUSINESS&redirect=/dashboard/advertise`;
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch {
      window.location.href = `/signup?role=BUSINESS&redirect=/dashboard/advertise`;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-6">
        {!isSuccess ? (
          <>
            {/* Modal Header */}
            <div className="space-y-1 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>Sponsored Placement Booking</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Book Brand Sponsorship
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Promote your brand directly to thousands of high-trust creators and agency media buyers.
              </p>
            </div>

            {/* Package Selector Pills */}
            <div className="grid grid-cols-3 gap-3">
              {AD_PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedPackageId === pkg.id
                      ? "bg-blue-50 border-blue-600 text-slate-900 shadow-xs ring-1 ring-blue-600"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                    {pkg.name.split(" ")[0]}
                  </span>
                  <strong className="text-sm sm:text-base font-black text-slate-900 block">
                    ${pkg.price}
                  </strong>
                  <span className="text-[10px] text-slate-500 block">{pkg.duration}</span>
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Business / Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. GymFuel Nutrition"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white text-xs font-semibold shadow-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Industry Vertical
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    <option value="Fitness & Nutrition">Fitness &amp; Nutrition</option>
                    <option value="Fashion & Apparel">Fashion &amp; Apparel</option>
                    <option value="Technology & Creator Tools">Technology &amp; Creator Tools</option>
                    <option value="Beauty & Wellness">Beauty &amp; Wellness</option>
                    <option value="Food & Culinary">Food &amp; Culinary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Destination URL
                </label>
                <input
                  type="text"
                  required
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourbrand.com/creators"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white text-xs font-semibold shadow-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Promotional Tagline
                </label>
                <input
                  type="text"
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. $500–$2,000 per post • Free electrolyte samples for creators"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white text-xs font-semibold shadow-xs"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Creating Placement...</span>
                ) : (
                  <>
                    <span>Confirm &amp; Publish Placement (${selectedPkg.price})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Placement Transmitted!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Your sponsored business placement for <strong className="text-slate-800">{businessName}</strong> has been saved and queued for marketplace delivery.
              </p>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

