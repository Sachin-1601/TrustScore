"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ShieldCheck,
  Eye,
  Camera,
  Layers,
  Award,
  Circle,
  ArrowUpRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

const PRESET_TAGS = [
  "Open to Work",
  "Available for Collaboration",
  "Open to Brand Deals",
  "Looking for Sponsorships",
  "Available for Campaigns",
  "Open to UGC",
  "Open to Affiliate Partnerships",
  "Product Reviews",
  "Event Appearances",
  "Long-term Ambassador",
];

export default function CreatorProfilePage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form states
  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("Fitness");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("Australia");
  const [website, setWebsite] = useState("");
  const [platform, setPlatform] = useState<"instagram" | "tiktok" | "youtube">("instagram");
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
        if (res.ok) {
          const data = await res.json();
          if (data.creator) {
            const c: Creator = data.creator;
            setCreator(c);
            setAvatar(c.avatar || user?.avatar || "");
            setName(c.name || user?.name || "");
            setUsername(c.username || "");
            setBio(c.bio || "");
            setCategory(c.category || "Fitness");
            setLocation(c.location || "Australia");
            setCountry(c.country || "Australia");
            setWebsite(c.website || "");
            setPlatform((c.platform as any) || "instagram");
            setStartingRate(c.startingRate || 350);
            setAvailabilityStatus(c.availabilityStatus || "OPEN_TO_WORK");
            if (c.profileTags && c.profileTags.length > 0) {
              setSelectedTags(c.profileTags);
            }
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

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toastError("File Too Large", "Please select an image smaller than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setAvatar(dataUrl);
          setHasUnsavedChanges(true);
          success("Photo Selected", "New profile photo ready. Click Save Changes to apply.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleTag = (tag: string) => {
    setHasUnsavedChanges(true);
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
      setHasUnsavedChanges(true);
    }
    setCustomTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setHasUnsavedChanges(true);
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
          avatar,
          name: name.trim(),
          bio: bio.trim(),
          category,
          location: location.trim(),
          country,
          website: website.trim(),
          platform,
          startingRate: Number(startingRate),
          availabilityStatus,
          profileTags: selectedTags,
          isAvailableForCollaboration: availabilityStatus !== "NOT_AVAILABLE",
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toastError("Update Failed", data.error || "Could not save profile changes");
      } else {
        setCreator(data.creator);
        setHasUnsavedChanges(false);
        success("Profile Updated!", "Your creator profile, tags, and availability are live in the marketplace.");
      }
    } catch (err: any) {
      toastError("Network Error", err.message || "Could not connect to the server");
    } finally {
      setIsSaving(false);
    }
  };

  // Derived Completion Metrics
  const completionItems = [
    { label: "Display Name & Avatar", isComplete: Boolean(name && avatar) },
    { label: "Bio & Pitch (15+ chars)", isComplete: Boolean(bio && bio.length >= 15) },
    { label: "Category & Location", isComplete: Boolean(category && location) },
    { label: "Starting Collaboration Rate", isComplete: Number(startingRate) > 0 },
    { label: "Marketplace Search Tags", isComplete: selectedTags.length > 0 },
    { label: "Social Telemetry Verification", isComplete: Boolean(creator?.verifiedBadge) },
  ];
  const completedCount = completionItems.filter((i) => i.isComplete).length;
  const completionPercentage = Math.round((completedCount / completionItems.length) * 100);

  const cleanHandle = (username || creator?.username || "").replace("@", "");
  const publicProfileUrl = `/creators/${cleanHandle || "me"}`;

  if (isLoading) {
    return (
      <div className="min-h-full flex flex-col bg-[#f8f9fb] text-slate-900">
        <DashboardHeader title="Profile & Tags" />
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs font-semibold text-slate-500">Loading creator profile editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-[#f8f9fb] text-slate-900">
      <DashboardHeader
        title="Profile & Tags"
        subtitle="Manage how brands discover and understand your creator profile."
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Marketplace Discoverability</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {completionPercentage >= 80 ? "Public & Listed" : "Incomplete Profile"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Profile changes persist directly to the PostgreSQL database and update your public card instantly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={publicProfileUrl}
              target="_blank"
              className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Public Profile</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Main Form Layout */}
        <form onSubmit={handleSaveChanges} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Editor Sections */}
          <div className="lg:col-span-8 space-y-6">
            {/* SECTION 1: Identity & Avatar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  1. Profile Identity &amp; Avatar
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Required</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="relative shrink-0">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name || "Avatar"}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-slate-100 ring-1 ring-slate-200 bg-slate-50 shadow-sm"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-slate-100 ring-1 ring-slate-200 bg-slate-50 flex items-center justify-center text-2xl font-black text-slate-400">
                      {name?.charAt(0) || "C"}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                    title="Change Photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Creator Display Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="e.g. Alex Rivera"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Creator Handle (Locked)
                      </label>
                      <input
                        type="text"
                        value={username}
                        disabled
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-400 font-semibold cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Avatar Image URL (Alternative to upload)
                    </label>
                    <input
                      type="url"
                      value={avatar}
                      onChange={(e) => {
                        setAvatar(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Bio & Description */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  2. Creator Bio &amp; Pitch
                </span>
                <span className={`text-[11px] font-semibold ${bio.length < 15 ? "text-amber-600" : "text-slate-500"}`}>
                  {bio.length} / 500 characters
                </span>
              </div>

              <div>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Describe your content niche, audience demographics, typical collaboration deliverables (e.g. 1 Reel + 3 Story frames), and brand partnership values..."
                  className="w-full p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all leading-relaxed"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Pro-tip: Clear deliverable packages and niche focus increase response rates on inbound brand proposals.
                </p>
              </div>
            </div>

            {/* SECTION 3: Category, Location & Rate */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  3. Niche Category, Geography &amp; Base Rate
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Industry Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
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
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Location / City
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="e.g. Melbourne, Australia"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Starting Collab Rate (USD)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="25"
                      value={startingRate}
                      onChange={(e) => {
                        setStartingRate(Number(e.target.value));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-3.5 py-2.5 pl-8 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
                    />
                    <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Primary Social Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => {
                      setPlatform(e.target.value as any);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all cursor-pointer capitalize"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Media Kit / Website URL
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => {
                      setWebsite(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="https://yourlinktree.com/creator"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: Collaboration Availability */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  4. Collaboration Availability Status
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAvailabilityStatus("OPEN_TO_WORK");
                    setHasUnsavedChanges(true);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    availabilityStatus === "OPEN_TO_WORK"
                      ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 text-slate-900"
                      : "bg-slate-50/80 border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-bold text-xs text-slate-900">Open to Work</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    Actively reviewing inbound brand deals and retainer proposals.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAvailabilityStatus("AVAILABLE_FOR_COLLABORATION");
                    setHasUnsavedChanges(true);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    availabilityStatus === "AVAILABLE_FOR_COLLABORATION"
                      ? "bg-blue-50 border-blue-600 ring-1 ring-blue-600 text-slate-900"
                      : "bg-slate-50/80 border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    <span className="font-bold text-xs text-slate-900">Available for Collabs</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    Selective partnerships for campaigns matching specific briefs.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAvailabilityStatus("NOT_AVAILABLE");
                    setHasUnsavedChanges(true);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    availabilityStatus === "NOT_AVAILABLE"
                      ? "bg-rose-50 border-rose-500 ring-1 ring-rose-500 text-slate-900"
                      : "bg-slate-50/80 border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                    <span className="font-bold text-xs text-slate-900">Not Available</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    Temporarily fully booked or not accepting new brand briefs.
                  </span>
                </button>
              </div>
            </div>

            {/* SECTION 5: Marketplace Profile Tags */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    5. Reusable Marketplace Profile Tags
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {selectedTags.length} active tag{selectedTags.length === 1 ? "" : "s"}
                </span>
              </div>

              {/* Active display tags */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-600 block">
                  Active Display Tags (Click X to remove):
                </span>
                <div className="flex flex-wrap gap-2 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 min-h-[52px] items-center">
                  {selectedTags.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No profile tags added yet. Choose from presets below or add custom tags.</span>
                  ) : (
                    selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs shadow-xs"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-blue-900 cursor-pointer p-0.5"
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
                <span className="text-[11px] font-bold text-slate-600 block">
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
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
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
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Create custom tag (e.g. 'Podcast Host', 'Speaking Engagements')..."
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  Add Tag
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Profile tags are marketplace discovery attributes and do not modify your statistical TrustScore.
                </span>
              </div>
            </div>

            {/* Save Actions Bar */}
            <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <span className={`text-xs font-semibold ${hasUnsavedChanges ? "text-amber-600" : "text-slate-500"}`}>
                {hasUnsavedChanges ? "● You have unsaved changes" : "All changes saved to database"}
              </span>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Changes...</span>
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

          {/* Right Column (4 cols): Sticky Profile Completion & Preview */}
          <div className="lg:col-span-4 space-y-6 sticky top-6">
            {/* Completion Progress Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Profile Completeness
                  </h4>
                </div>
                <span className="text-sm font-black text-emerald-600">
                  {completionPercentage}%
                </span>
              </div>

              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>

              <div className="space-y-2 pt-1 text-xs">
                {completionItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-600">
                    <div className="flex items-center gap-2">
                      {item.isComplete ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className={item.isComplete ? "text-slate-800 font-medium" : "text-slate-500"}>{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Marketplace Card Preview */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block pb-1 border-b border-slate-100">
                Live Marketplace Card Preview:
              </span>

              <div className="flex items-center gap-3.5">
                <img
                  src={avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"}
                  alt={name || "Creator"}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs bg-slate-50"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{name || "Your Name"}</h4>
                  <span className="text-xs text-slate-500 block truncate">{username || "@yourhandle"}</span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{location || "Australia"}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="pt-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                    availabilityStatus === "NOT_AVAILABLE"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : availabilityStatus === "AVAILABLE_FOR_COLLABORATION"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>
                    {availabilityStatus === "NOT_AVAILABLE"
                      ? "Not Available"
                      : availabilityStatus === "AVAILABLE_FOR_COLLABORATION"
                      ? "Available for Collabs"
                      : "Open to Work"}
                  </span>
                </span>
              </div>

              {/* Bio snippet */}
              <p className="text-xs text-slate-600 leading-relaxed min-h-[36px] line-clamp-2">
                {bio || "Your bio will appear here to prospective brands seeking creator talent."}
              </p>

              {/* Active Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedTags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-semibold text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
                {selectedTags.length > 4 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-500">
                    +{selectedTags.length - 4} more
                  </span>
                )}
              </div>

              {/* Starting Rate Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-600 font-semibold">Starting Rate:</span>
                <span className="font-black text-emerald-600">${startingRate} USD</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
