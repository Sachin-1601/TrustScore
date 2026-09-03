"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/common/Logo";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import {
  User,
  Sparkles,
  Share2,
  CalendarCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Globe,
  MapPin,
  DollarSign,
  AlertCircle,
} from "lucide-react";

const CATEGORIES = [
  "Fitness",
  "Fashion",
  "Beauty",
  "Food",
  "Travel",
  "Gaming",
  "Technology",
  "Lifestyle",
  "Education",
  "Entertainment",
];

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
];

export default function CreatorOnboardingPage() {
  const router = useRouter();
  const { user, role, isLoading: authLoading, refreshSession } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [displayName, setDisplayName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [avatar, setAvatar] = useState<string>(AVATAR_OPTIONS[0]);
  const [bio, setBio] = useState<string>("");
  const [location, setLocation] = useState<string>("Sydney, Australia");
  const [country, setCountry] = useState<string>("Australia");

  const [category, setCategory] = useState<string>("Lifestyle");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Open to Work"]);

  const [platform, setPlatform] = useState<"INSTAGRAM" | "TIKTOK" | "YOUTUBE">("INSTAGRAM");
  const [socialHandle, setSocialHandle] = useState<string>("");

  const [availabilityStatus, setAvailabilityStatus] = useState<string>("OPEN_TO_WORK");
  const [startingRate, setStartingRate] = useState<number>(350);

  // Load existing data
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/onboarding");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.onboardingCompleted) {
            router.replace("/dashboard/creator");
            return;
          }

          if (data.user) {
            setDisplayName(data.user.name || "");
            if (data.user.avatar) setAvatar(data.user.avatar);
            if (data.user.onboardingStep && data.user.onboardingStep < 5) {
              setStep(data.user.onboardingStep);
            }
          }

          if (data.creatorProfile) {
            const cp = data.creatorProfile;
            if (cp.name) setDisplayName(cp.name);
            if (cp.username) setUsername(cp.username.replace(/^@/, ""));
            if (cp.avatar) setAvatar(cp.avatar);
            if (cp.bio) setBio(cp.bio);
            if (cp.location) setLocation(cp.location);
            if (cp.country) setCountry(cp.country);
            if (cp.category) setCategory(cp.category);
            if (cp.platform) setPlatform(cp.platform.toUpperCase());
            if (cp.availabilityStatus) setAvailabilityStatus(cp.availabilityStatus);
            if (cp.startingRate) setStartingRate(cp.startingRate);
            if (cp.profileTags?.length) setSelectedTags(cp.profileTags);
          }

          if (data.creatorProfile?.socialAccounts?.length) {
            const firstSocial = data.creatorProfile.socialAccounts[0];
            setPlatform(firstSocial.platform.toUpperCase());
            setSocialHandle(firstSocial.username || "");
          }
        }
      } catch {
        // Continue with defaults
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      if (!user) {
        router.replace("/login");
      } else if (role !== "CREATOR") {
        router.replace("/onboarding/business");
      } else {
        loadData();
      }
    }
  }, [user, role, authLoading, router]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length < 5) {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  };

  const handleSaveStep = async (nextStep: number, isCompleting: boolean = false) => {
    setErrorMessage(null);

    // Basic Validation per step
    if (step === 1) {
      if (!displayName.trim()) {
        setErrorMessage("Please enter your display name.");
        return;
      }
      if (!username.trim()) {
        setErrorMessage("Please choose a creator username handle.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        step: nextStep,
        complete: isCompleting,
        creatorData: {
          name: displayName.trim(),
          username: username.trim().startsWith("@") ? username.trim() : `@${username.trim()}`,
          avatar,
          bio: bio.trim(),
          location: location.trim(),
          country: country.trim(),
          category,
          profileTags: selectedTags,
          platform,
          socialPlatform: platform,
          socialHandle: socialHandle.trim(),
          availabilityStatus,
          startingRate: Number(startingRate) || 300,
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
        router.replace("/dashboard/creator");
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs font-semibold">Loading your creator profile setup...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
            <span className="hidden sm:inline">Creator Workspace Onboarding</span>
            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
              Step {step} of 5
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        {/* Progress Bar & Dots */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 text-xs font-medium text-slate-400">
            <span className={step >= 1 ? "text-blue-400 font-semibold" : ""}>1. Basic Profile</span>
            <span className={step >= 2 ? "text-blue-400 font-semibold" : ""}>2. Category</span>
            <span className={step >= 3 ? "text-blue-400 font-semibold" : ""}>3. Socials</span>
            <span className={step >= 4 ? "text-blue-400 font-semibold" : ""}>4. Availability</span>
            <span className={step >= 5 ? "text-emerald-400 font-semibold" : ""}>5. Ready</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Card Frame */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
          {/* STEP 1: Basic Profile */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-2">
                  <User className="w-3.5 h-3.5" /> Profile Identity
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Create Your Creator Profile</h2>
                <p className="text-sm text-slate-400 mt-1">
                  How brands and agencies will identify your talent on TrustScore.
                </p>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4 flex-wrap">
                  <img
                    src={avatar}
                    alt="Current Avatar"
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500/50 shadow-md"
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    {AVATAR_OPTIONS.map((url, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setAvatar(url)}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                          avatar === url ? "border-blue-500 scale-105" : "border-slate-700 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={url} alt={`Option ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Display Name & Handle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Display Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Creator Username <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm font-semibold">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                      placeholder="alexrivera"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Bio & Introduction
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short summary of your content focus, brand partnerships, and creative style..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    City / Region
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Sydney, Australia"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Country
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. Australia"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Creator Category & Niche */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Content Focus
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Select Your Primary Category</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Categorization enables brands to discover your profile for relevant campaign activations.
                </p>
              </div>

              {/* Primary Category Grid */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Primary Category <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category.toLowerCase() === cat.toLowerCase();
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`p-3.5 rounded-xl border text-left text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10"
                            : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Creator Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Profile Focus Tags (Select up to 3)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Open to Work",
                    "Sponsored Posts",
                    "Long-term Ambassador",
                    "UGC Content",
                    "Product Reviews",
                    "Event Appearances",
                  ].map((tag) => {
                    const isTagged = selectedTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isTagged
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                        }`}
                      >
                        {isTagged ? "✓ " : "+ "}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Connect Social Accounts */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-2">
                  <Share2 className="w-3.5 h-3.5" /> Social Platform
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Connect Your Primary Channel</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Specify the social platform where you publish your primary content.
                </p>
              </div>

              {/* Platform Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Primary Social Platform
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPlatform("INSTAGRAM")}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                      platform === "INSTAGRAM"
                        ? "bg-pink-500/10 border-pink-500/50 text-white"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <PlatformIcon platform="instagram" size="lg" />
                    <span className="text-xs font-semibold">Instagram</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatform("TIKTOK")}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                      platform === "TIKTOK"
                        ? "bg-cyan-500/10 border-cyan-500/50 text-white"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <PlatformIcon platform="tiktok" size="lg" />
                    <span className="text-xs font-semibold">TikTok</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatform("YOUTUBE")}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                      platform === "YOUTUBE"
                        ? "bg-red-500/10 border-red-500/50 text-white"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <PlatformIcon platform="youtube" size="lg" />
                    <span className="text-xs font-semibold">YouTube</span>
                  </button>
                </div>
              </div>

              {/* Handle Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Your {platform.charAt(0) + platform.slice(1).toLowerCase()} Handle
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm font-semibold">@</span>
                  <input
                    type="text"
                    value={socialHandle}
                    onChange={(e) => setSocialHandle(e.target.value.replace(/^@+/, ""))}
                    placeholder={username || "yourhandle"}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Note: Social verification will be scheduled upon your first 30-day posting audit. No fake engagement or metrics are synthesized.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Availability & Rates */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-2">
                  <CalendarCheck className="w-3.5 h-3.5" /> Collaboration Terms
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Availability & Commercial Rates</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Let brands know your collaboration availability and baseline starting rate.
                </p>
              </div>

              {/* Availability Options */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Current Status
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "OPEN_TO_WORK", label: "Open to Work", desc: "Actively seeking brand collaborations" },
                    { id: "OPEN_TO_OFFERS", label: "Open to Offers", desc: "Selective partnership review" },
                    { id: "NOT_AVAILABLE", label: "Not Available", desc: "Fully booked currently" },
                  ].map((item) => {
                    const isSelected = availabilityStatus === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setAvailabilityStatus(item.id)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-blue-600/20 border-blue-500 text-white"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Starting Rate */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Starting Collaboration Rate (USD)
                </label>
                <div className="relative max-w-xs">
                  <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    min={50}
                    step={25}
                    value={startingRate}
                    onChange={(e) => setStartingRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                  Baseline price for standard content package. You can negotiate custom terms per proposal.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Ready & Completion */}
          {step === 5 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Your Creator Profile Is Ready</h2>
                <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                  Your creator workspace is now initialized. You can view analytics, manage collaboration proposals, and build credibility.
                </p>
              </div>

              {/* Profile Summary Card */}
              <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left flex items-center gap-4">
                <img src={avatar} alt={displayName} className="w-14 h-14 rounded-full object-cover border border-slate-700" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{displayName}</p>
                  <p className="text-xs text-blue-400 font-medium">@{username}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span>{category}</span>
                    <span>•</span>
                    <span>{location}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800/80 mt-8">
            {step > 1 && step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all flex items-center gap-2"
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
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
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
                className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mx-auto"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Launching...
                  </>
                ) : (
                  <>
                    Go to Creator Dashboard <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 text-center text-xs text-slate-400">
        TrustScore © {new Date().getFullYear()} • Account Onboarding
      </footer>
    </div>
  );
}
