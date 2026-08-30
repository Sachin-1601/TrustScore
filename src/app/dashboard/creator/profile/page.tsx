"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Creator } from "@/types/creator";
import {
  UserCheck,
  Tag,
  CheckCircle2,
  ExternalLink,
  Plus,
  X,
  Sparkles,
  Save,
  Globe,
  MapPin,
  DollarSign,
  Layers,
  ShieldCheck,
  Eye,
} from "lucide-react";

const PRESET_TAGS = [
  "Open to Work",
  "Available for Collaboration",
  "Open to Brand Deals",
  "Looking for Sponsorships",
  "Available for Campaigns",
  "Open to UGC",
  "Open to Affiliate Partnerships",
];

export default function CreatorProfilePage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("Fitness");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [startingRate, setStartingRate] = useState<number>(350);
  const [availabilityStatus, setAvailabilityStatus] = useState<
    "OPEN_TO_WORK" | "AVAILABLE_FOR_COLLABORATION" | "NOT_AVAILABLE"
  >("OPEN_TO_WORK");
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Open to Work",
    "Available for Collaboration",
    "Open to Brand Deals",
  ]);
  const [customTagInput, setCustomTagInput] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/creators/me");
        const data = await res.json();
        if (data.creator) {
          const c: Creator = data.creator;
          setCreator(c);
          setName(c.name || user?.name || "");
          setUsername(c.username || "");
          setBio(c.bio || "");
          setCategory(c.category || "Fitness");
          setLocation(c.location || "Australia");
          setWebsite(c.website || "");
          setStartingRate(c.startingRate || 350);
          setAvailabilityStatus(c.availabilityStatus || "OPEN_TO_WORK");
          if (c.profileTags && c.profileTags.length > 0) {
            setSelectedTags(c.profileTags);
          }
        }
      } catch (err) {
        console.error("Failed to load creator profile", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customTagInput.trim();
    if (!clean) return;
    if (!selectedTags.includes(clean)) {
      setSelectedTags([...selectedTags, clean]);
    }
    setCustomTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/creators/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          category,
          location,
          website,
          startingRate: Number(startingRate),
          availabilityStatus,
          profileTags: selectedTags,
          isAvailableForCollaboration: availabilityStatus !== "NOT_AVAILABLE",
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toastError("Update Failed", data.error || "Could not save changes");
      } else {
        setCreator(data.creator);
        success("Profile Updated!", "Your creator profile, tags, and availability are live in the marketplace.");
      }
    } catch (err: any) {
      toastError("Error", err.message || "Network error while saving profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Creator Profile &amp; Marketplace Tag Manager"
        subtitle="Control your public creator identity, collaboration availability, and custom marketplace tags"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Public Marketplace Listing</h3>
              <p className="text-xs text-slate-400">
                Changes saved here reflect on your public profile and in brand discovery searches.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/creators/${creator?.id || "alexfitness"}`}
              target="_blank"
              className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Public Profile</span>
            </Link>
          </div>
        </div>

        <form onSubmit={handleSaveChanges} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Fields */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Availability Status Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  1. Collaboration Availability Status
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  onClick={() => setAvailabilityStatus("OPEN_TO_WORK")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    availabilityStatus === "OPEN_TO_WORK"
                      ? "bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500 text-slate-100"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="font-bold text-xs text-slate-100">Open to Work</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2">
                    Actively accepting new brand deals and retainer proposals.
                  </span>
                </label>

                <label
                  onClick={() => setAvailabilityStatus("AVAILABLE_FOR_COLLABORATION")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    availabilityStatus === "AVAILABLE_FOR_COLLABORATION"
                      ? "bg-blue-500/10 border-blue-500 ring-1 ring-blue-500 text-slate-100"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
                    <span className="font-bold text-xs text-slate-100">Available for Collabs</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2">
                    Selective partnerships for aligned campaign briefs.
                  </span>
                </label>

                <label
                  onClick={() => setAvailabilityStatus("NOT_AVAILABLE")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    availabilityStatus === "NOT_AVAILABLE"
                      ? "bg-rose-500/10 border-rose-500 ring-1 ring-rose-500 text-slate-100"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
                    <span className="font-bold text-xs text-slate-100">Not Available</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2">
                    Temporarily fully booked or on hiatus.
                  </span>
                </label>
              </div>
            </div>

            {/* 2. Reusable Profile Tags System */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    2. Marketplace Profile Tags
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {selectedTags.length} tags selected
                </span>
              </div>

              {/* Active selected tags */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block">
                  Active Display Tags (Click X to remove):
                </span>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-950 rounded-2xl border border-slate-800 min-h-[48px] items-center">
                  {selectedTags.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">No profile tags added yet.</span>
                  ) : (
                    selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold text-xs"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-white cursor-pointer"
                          title="Remove tag"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Preset selection chips */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-slate-400 block">
                  Popular Preset Tags (Click to toggle):
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-500 shadow-2xs"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                        }`}
                      >
                        {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom tag add form */}
              <div className="pt-3 border-t border-slate-800/80 flex gap-2">
                <input
                  type="text"
                  placeholder="Create custom tag (e.g. 'Podcast Host', 'Speaking Engagements')..."
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-hidden focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer shrink-0"
                >
                  Add Tag
                </button>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Profile tags are marketplace discovery attributes only and do not alter your TrustScore.
                </span>
              </div>
            </div>

            {/* 3. Core Profile Information */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  3. Creator Bio &amp; Marketplace Details
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Social Username / Handle
                  </label>
                  <input
                    type="text"
                    value={username}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Creator Bio &amp; Pitch
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell brands about your audience demographics, content pillars, and typical collaboration deliverable packages..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Category / Niche
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="Fitness">Fitness &amp; Health</option>
                    <option value="Beauty">Beauty &amp; Skincare</option>
                    <option value="Fashion">Fashion &amp; Style</option>
                    <option value="Technology">Technology &amp; Gadgets</option>
                    <option value="Food">Food &amp; Cooking</option>
                    <option value="Travel">Travel &amp; Hospitality</option>
                    <option value="Gaming">Gaming &amp; Esports</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Melbourne, Australia"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Starting Rate (USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={startingRate}
                    onChange={(e) => setStartingRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Website / Media Kit URL
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com/mediakit"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Live Marketplace Card Preview */}
          <div className="lg:col-span-4 space-y-4 sticky top-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Live Marketplace Preview:
            </span>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <img
                  src={creator?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"}
                  alt={name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shadow-xs"
                />
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{name || "Your Name"}</h4>
                  <span className="text-xs text-slate-400 block">{username || "@yourhandle"}</span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span>{location || "Australia"}</span>
                  </div>
                </div>
              </div>

              {/* Status indicator */}
              <div className="pt-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                    availabilityStatus === "NOT_AVAILABLE"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>
                    {availabilityStatus === "NOT_AVAILABLE"
                      ? "Not Currently Available"
                      : availabilityStatus === "AVAILABLE_FOR_COLLABORATION"
                      ? "Available for Collabs"
                      : "Open to Work"}
                  </span>
                </span>
              </div>

              {/* Bio */}
              <p className="text-xs text-slate-300 leading-relaxed min-h-[40px]">
                {bio || "Your bio will appear here to prospective brands and agencies looking for talent."}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-semibold text-blue-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Starting Rate:</span>
                <span className="font-black text-emerald-400">${startingRate} USD</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
