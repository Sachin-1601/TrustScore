"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/common/Logo";
import {
  Building2,
  Target,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Globe,
  MapPin,
  DollarSign,
  AlertCircle,
  Briefcase,
} from "lucide-react";

const BUSINESS_CATEGORIES = [
  "E-Commerce & Retail",
  "SaaS & Technology",
  "Health & Wellness",
  "Fashion & Apparel",
  "Beauty & Cosmetics",
  "Food & Beverage",
  "Finance & Fintech",
  "Travel & Hospitality",
  "Media & Entertainment",
  "Agency",
];

const LOGO_OPTIONS = [
  "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80",
];

const GOAL_OPTIONS = [
  { id: "find_creators", label: "Find & Discover Creators", desc: "Discover high-trust talent across specific niches" },
  { id: "audit_authenticity", label: "Audit Creator Authenticity", desc: "Evaluate fake followers, engagement pods, and true reach" },
  { id: "run_campaigns", label: "Run Influencer Campaigns", desc: "Post briefs, receive creator applications, and track ROAS" },
  { id: "manage_collabs", label: "Manage Direct Collaborations", desc: "Streamline communication, contracts, and deliverable review" },
  { id: "advertise_brand", label: "Advertise My Business", desc: "Place sponsored banner and sidebar ads to creators & brands" },
];

export default function BusinessOnboardingPage() {
  const router = useRouter();
  const { user, role, isLoading: authLoading, refreshSession } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [companyName, setCompanyName] = useState<string>("");
  const [logo, setLogo] = useState<string>(LOGO_OPTIONS[0]);
  const [website, setWebsite] = useState<string>("");
  const [category, setCategory] = useState<string>("E-Commerce & Retail");
  const [location, setLocation] = useState<string>("Sydney, Australia");
  const [description, setDescription] = useState<string>("");
  const [tagline, setTagline] = useState<string>("");

  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    "find_creators",
    "audit_authenticity",
  ]);

  const [targetCategories, setTargetCategories] = useState<string[]>([
    "Lifestyle",
    "Technology",
  ]);
  const [preferredPlatforms, setPreferredPlatforms] = useState<string[]>([
    "instagram",
    "tiktok",
  ]);
  const [targetFollowerRange, setTargetFollowerRange] = useState<string>("10k-50k");
  const [approxBudget, setApproxBudget] = useState<number>(2500);

  // Load existing data
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/onboarding");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.onboardingCompleted) {
            router.replace("/dashboard/businesses");
            return;
          }

          if (data.user) {
            setCompanyName(data.user.name || "");
            if (data.user.onboardingStep && data.user.onboardingStep < 5) {
              setStep(data.user.onboardingStep);
            }
          }

          if (data.businessProfile) {
            const bp = data.businessProfile;
            if (bp.name) setCompanyName(bp.name);
            if (bp.logo) setLogo(bp.logo);
            if (bp.website) setWebsite(bp.website);
            if (bp.category) setCategory(bp.category);
            if (bp.location) setLocation(bp.location);
            if (bp.description) setDescription(bp.description);
            if (bp.tagline) setTagline(bp.tagline);
            if (bp.goals?.length) setSelectedGoals(bp.goals);
            if (bp.targetCategories?.length) setTargetCategories(bp.targetCategories);
            if (bp.preferredPlatforms?.length) setPreferredPlatforms(bp.preferredPlatforms);
            if (bp.targetFollowerRange) setTargetFollowerRange(bp.targetFollowerRange);
            if (bp.approxBudget) setApproxBudget(bp.approxBudget);
          }
        }
      } catch {
        // Fallback to initial defaults
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      if (!user) {
        router.replace("/login");
      } else if (role === "CREATOR") {
        router.replace("/onboarding/creator");
      } else {
        loadData();
      }
    }
  }, [user, role, authLoading, router]);

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter((g) => g !== goalId));
      }
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const toggleTargetCategory = (cat: string) => {
    if (targetCategories.includes(cat)) {
      if (targetCategories.length > 1) {
        setTargetCategories(targetCategories.filter((c) => c !== cat));
      }
    } else {
      setTargetCategories([...targetCategories, cat]);
    }
  };

  const togglePlatform = (plat: string) => {
    if (preferredPlatforms.includes(plat)) {
      if (preferredPlatforms.length > 1) {
        setPreferredPlatforms(preferredPlatforms.filter((p) => p !== plat));
      }
    } else {
      setPreferredPlatforms([...preferredPlatforms, plat]);
    }
  };

  const handleSaveStep = async (nextStep: number, isCompleting: boolean = false) => {
    setErrorMessage(null);

    // Basic Validation per step
    if (step === 1) {
      if (!companyName.trim()) {
        setErrorMessage("Please enter your company / business name.");
        return;
      }
      if (website.trim() && !/^https?:\/\/.+/.test(website.trim())) {
        setErrorMessage("Website must start with http:// or https://");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        step: nextStep,
        complete: isCompleting,
        businessData: {
          name: companyName.trim(),
          logo,
          website: website.trim(),
          category,
          location: location.trim(),
          description: description.trim(),
          tagline: tagline.trim(),
          goals: selectedGoals,
          targetCategories,
          preferredPlatforms,
          targetFollowerRange,
          approxBudget: Number(approxBudget) || null,
        },
      };

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMessage(data.error || "Failed to save onboarding progress.");
        setSubmitting(false);
        return;
      }

      await refreshSession();

      if (isCompleting) {
        router.replace("/dashboard/businesses");
      } else {
        setStep(nextStep);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fb] text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs font-semibold">Loading your business workspace setup...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span className="hidden sm:inline">Business Workspace Onboarding</span>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              Step {step} of 5
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        {/* Progress Bar & Dots */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 text-xs font-medium text-slate-500">
            <span className={step >= 1 ? "text-blue-600 font-semibold" : ""}>1. Business Profile</span>
            <span className={step >= 2 ? "text-blue-600 font-semibold" : ""}>2. Goals</span>
            <span className={step >= 3 ? "text-blue-600 font-semibold" : ""}>3. Preferences</span>
            <span className={step >= 4 ? "text-blue-600 font-semibold" : ""}>4. Verification</span>
            <span className={step >= 5 ? "text-emerald-700 font-semibold" : ""}>5. Ready</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Card Frame */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          {/* STEP 1: Business Profile */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
                  <Building2 className="w-3.5 h-3.5" /> Company Information
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create Your Brand Workspace</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Enter your business details to start analyzing creators and publishing campaign briefs.
                </p>
              </div>

              {/* Logo Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Company Logo
                </label>
                <div className="flex items-center gap-4 flex-wrap">
                  <img
                    src={logo}
                    alt="Current Logo"
                    className="w-16 h-16 rounded-xl object-cover border-2 border-blue-600 shadow-xs"
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    {LOGO_OPTIONS.map((url, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setLogo(url)}
                        className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          logo === url ? "border-blue-600 scale-105" : "border-slate-200 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={url} alt={`Logo Option ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Company Name & Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Company / Brand Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Health Corp"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Official Website
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://acmebrand.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Category & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Industry Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all cursor-pointer shadow-xs"
                  >
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Headquarters / Region
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Sydney, Australia"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Tagline & Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Brand Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Premium organic wellness products for active lifestyles"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Company Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell creators and partners about your company mission and products..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all resize-none shadow-xs"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Business Goals */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
                  <Target className="w-3.5 h-3.5" /> Platform Objectives
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">What Do You Want to Achieve?</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Select your primary objectives so TrustScore can tailor your workspace views.
                </p>
              </div>

              {/* Goals List */}
              <div className="space-y-3">
                {GOAL_OPTIONS.map((goal) => {
                  const isChecked = selectedGoals.includes(goal.id);
                  return (
                    <button
                      type="button"
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-4 cursor-pointer ${
                        isChecked
                          ? "bg-blue-50 border-blue-500 text-slate-900 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{goal.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{goal.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all text-xs font-bold ${
                          isChecked ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
                        }`}
                      >
                        {isChecked && "✓"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Creator Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
                  <Users className="w-3.5 h-3.5" /> Targeting Criteria
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Target Creator Preferences</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Specify the creator profiles that best align with your marketing campaigns.
                </p>
              </div>

              {/* Target Categories */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Preferred Creator Niches
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Fitness", "Fashion", "Beauty", "Food", "Travel", "Gaming", "Technology", "Lifestyle"].map((cat) => {
                    const isSelected = targetCategories.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleTargetCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-50 border-blue-500 text-blue-700 font-semibold"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Platforms */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Target Social Platforms
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "instagram", name: "Instagram" },
                    { id: "tiktok", name: "TikTok" },
                    { id: "youtube", name: "YouTube" },
                  ].map((plat) => {
                    const isSelected = preferredPlatforms.includes(plat.id);
                    return (
                      <button
                        type="button"
                        key={plat.id}
                        onClick={() => togglePlatform(plat.id)}
                        className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}
                        {plat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Follower Range & Monthly Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Creator Follower Range
                  </label>
                  <select
                    value={targetFollowerRange}
                    onChange={(e) => setTargetFollowerRange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all cursor-pointer shadow-xs"
                  >
                    <option value="5k-25k">Nano: 5,000 - 25,000</option>
                    <option value="10k-50k">Micro: 10,000 - 50,000</option>
                    <option value="50k-250k">Mid-Tier: 50,000 - 250,000</option>
                    <option value="250k-1M+">Macro / Elite: 250,000+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Monthly Campaign Budget (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="number"
                      min={500}
                      step={250}
                      value={approxBudget}
                      onChange={(e) => setApproxBudget(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Business Verification info */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Trust & Compliance
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">TrustScore Business Verification</h2>
                <p className="text-sm text-slate-500 mt-1">
                  How verified brand accounts achieve higher proposal acceptance rates from top creators.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Verified Brand Status</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verifying your company domain establishes trusted credentials when sending inbound proposals.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Direct Marketplace Access</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      You can immediately access all discovery tools, search audited creators, and review Bayesian authenticity models.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center">
                You can submit additional domain verification records in your settings at any time.
              </p>
            </div>
          )}

          {/* STEP 5: Ready & Completion */}
          {step === 5 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Your Business Workspace Is Ready</h2>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                  Your brand profile is configured. You can now audit creators, launch campaigns, and manage direct collaborations.
                </p>
              </div>

              {/* Profile Summary Card */}
              <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200 text-left flex items-center gap-4">
                <img src={logo} alt={companyName} className="w-14 h-14 rounded-xl object-cover border border-slate-200" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">{companyName}</p>
                  <p className="text-xs text-blue-600 font-semibold">{category}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span>{location}</span>
                    {website && (
                      <>
                        <span>•</span>
                        <span className="truncate">{website.replace(/^https?:\/\//, "")}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
            {step > 1 && step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => handleSaveStep(step + 1, false)}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSaveStep(5, true)}
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 mx-auto cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Launching...
                  </>
                ) : (
                  <>
                    Go to Business Dashboard <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        TrustScore © {new Date().getFullYear()} • Business Workspace Onboarding
      </footer>
    </div>
  );
}

