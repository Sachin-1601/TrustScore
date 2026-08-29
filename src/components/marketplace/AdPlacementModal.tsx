"use client";

import React, { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { MOCK_AD_PACKAGES } from "@/data/mockAdvertisements";
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

  const selectedPkg = MOCK_AD_PACKAGES.find((p) => p.id === selectedPackageId) || MOCK_AD_PACKAGES[1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 800);
  };

  const handleReset = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleReset} title="" maxWidth="xl">
      <div className="text-slate-100">
        {!isSuccess ? (
          <div>
            <div className="pb-4 border-b border-slate-800 space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>Sponsored Business Placement</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                Advertise Your Business on TrustScore
              </h3>
              <p className="text-xs text-slate-400">
                Put your brand in front of top creators and media planners actively looking for campaign collaborations.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              {/* Package Selector Pills */}
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-2">
                  Select Advertising Package
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {MOCK_AD_PACKAGES.map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedPackageId === pkg.id
                          ? "bg-blue-600/15 border-blue-500 shadow-xs"
                          : "bg-slate-950 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <span className="font-bold text-slate-100 text-xs block truncate">{pkg.name}</span>
                      <div className="flex items-baseline gap-0.5 mt-0.5">
                        <span className="text-base font-extrabold text-blue-400">${pkg.price}</span>
                        <span className="text-[10px] text-slate-500">{pkg.billingPeriod}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GymFuel Nutrition"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500 text-xs"
                  >
                    <option value="Fitness & Nutrition">Fitness & Nutrition</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Technology & Creator Tools">Technology & Creator Tools</option>
                    <option value="Beauty & Cosmetics">Beauty & Cosmetics</option>
                    <option value="Travel & Outdoor">Travel & Outdoor</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Business Website
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://yourbrand.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Short Tagline (e.g. 1 sentence)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium performance nutrition for active creators."
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                  Advertisement Pitch / Creator Collaboration Offer
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe your products and what you offer creators (e.g. monthly retainers, free product samples, high affiliate payouts)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500 text-xs"
                />
              </div>

              {/* Integrity Disclaimer */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-slate-200">Ethical AI Guarantee:</strong> Paid advertisements are clearly labeled as Sponsored and never alter or influence creator TrustScores or leaderboard rankings.
                </p>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800/60 text-slate-300 font-semibold transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer text-xs"
                >
                  {isSubmitting ? (
                    <span>Activating Placement...</span>
                  ) : (
                    <>
                      <span>Start Advertising (${selectedPkg.price}/mo)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                Sponsored Campaign Activated!
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                Your <span className="text-blue-400 font-semibold">{selectedPkg.name}</span> placement for <span className="font-semibold text-slate-200">{businessName || "Your Business"}</span> has been placed in the live TrustScore marketplace rotation.
              </p>
            </div>
            <div className="pt-3 flex justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
