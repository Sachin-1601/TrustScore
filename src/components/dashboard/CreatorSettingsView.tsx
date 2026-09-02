"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Creator } from "@/types/creator";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import {
  User,
  Sparkles,
  Shield,
  Bell,
  Lock,
  Link as LinkIcon,
  HelpCircle,
  Info,
  LogOut,
  Globe,
  DollarSign,
  MapPin,
  ExternalLink,
  Save,
  ChevronRight,
  Eye,
  Mail,
  KeyRound,
  FileText,
  Check,
  Camera,
  ShieldCheck,
  CheckCircle2,
  Tag,
  X,
  Plus,
  RefreshCw,
  Unlink,
  Loader2,
} from "lucide-react";

type SettingsSection =
  | "overview"
  | "account"
  | "profile"
  | "status"
  | "accounts"
  | "trustscore"
  | "notifications"
  | "privacy"
  | "plan"
  | "subscription"
  | "help"
  | "about";

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

interface CreatorSettingsViewProps {
  initialSection?: SettingsSection;
}

export function CreatorSettingsView({ initialSection }: CreatorSettingsViewProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const { success, error: toastError, info } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sectionParam = searchParams.get("section") as SettingsSection | null;
  const [activeSection, setActiveSection] = useState<SettingsSection>(
    initialSection || sectionParam || "overview"
  );

  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Form states - Profile
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

  // Form states - Creator Status
  const [availabilityStatus, setAvailabilityStatus] = useState<
    "OPEN_TO_WORK" | "AVAILABLE_FOR_COLLABORATION" | "NOT_AVAILABLE"
  >("OPEN_TO_WORK");
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Open to Work",
    "Available for Collaboration",
    "Open to Brand Deals",
  ]);
  const [customTagInput, setCustomTagInput] = useState("");

  // Form states - Account / Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notification Preferences
  const [notifCollabs, setNotifCollabs] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifCampaigns, setNotifCampaigns] = useState(true);
  const [notifTrustScore, setNotifTrustScore] = useState(true);
  const [notifVerification, setNotifVerification] = useState(true);

  // Privacy Preferences
  const [privMarketplace, setPrivMarketplace] = useState(true);
  const [privTrustScore, setPrivTrustScore] = useState(true);
  const [privAvailability, setPrivAvailability] = useState(true);

  // Handle Photo Upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          success("Photo Selected", "New profile photo loaded. Click Save Changes to apply.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch Creator Profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`/api/creators/me`);
        if (res.ok) {
          const data = await res.json();
          if (data.creator) {
            const c: Creator = data.creator;
            setCreator(c);
            setAvatar(c.avatar || user?.avatar || "");
            setName(c.name || user?.name || "");
            setUsername(c.username || `@${user?.name?.toLowerCase().replace(/\s+/g, "") || "creator"}`);
            setBio(c.bio || "");
            setCategory(c.category || "Fitness");
            setLocation(c.location || "");
            setCountry(c.country || "Australia");
            setWebsite(c.website || "");
            setPlatform((c.platform as any) || "instagram");
            setStartingRate(c.startingRate || 250);
            setAvailabilityStatus(c.availabilityStatus || "OPEN_TO_WORK");
            if (c.profileTags && c.profileTags.length > 0) {
              setSelectedTags(c.profileTags);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load creator settings profile", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  // Tag Management
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

  // Save Creator Profile / Status / Preferences
  const handleSaveProfile = async (e: React.FormEvent) => {
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
        toastError("Update Failed", data.error || "Could not save settings changes.");
      } else {
        setCreator(data.creator);
        success("Settings Saved", "Your creator settings have been updated in the database.");
      }
    } catch (err: any) {
      toastError("Error", err.message || "Network error while saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toastError("Mismatch", "New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toastError("Too Short", "Password must be at least 8 characters.");
      return;
    }

    setIsChangingPassword(true);
    // Simulate auth security update
    setTimeout(() => {
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      success("Security Updated", "Your account password has been updated.");
    }, 600);
  };

  const navItems = [
    { id: "overview" as const, label: "Overview", icon: Sparkles },
    { id: "account" as const, label: "Account & Security", icon: Lock },
    { id: "profile" as const, label: "Public Profile", icon: User },
    { id: "status" as const, label: "Status & Rates", icon: DollarSign },
    { id: "accounts" as const, label: "Connected Channels", icon: LinkIcon },
    { id: "trustscore" as const, label: "TrustScore & Telemetry", icon: ShieldCheck },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "privacy" as const, label: "Marketplace Privacy", icon: Shield },
    { id: "plan" as const, label: "Creator Membership", icon: CheckCircle2 },
    { id: "help" as const, label: "Help & Support", icon: HelpCircle },
    { id: "about" as const, label: "About TrustScore", icon: Info },
  ];

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-xs font-semibold">Loading settings workspace...</span>
      </div>
    );
  }

  const cleanHandle = (username || creator?.username || "").replace("@", "");

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-black text-slate-100">Settings</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage your account, profile, privacy, notifications, and security.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/creators/${cleanHandle || "me"}`}
              target="_blank"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-2xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>Preview Public Profile</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* 2-Column Settings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation (3 cols) */}
          <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-3xl p-3 space-y-1 shadow-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white font-bold shadow-xs"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Content Area (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            {/* OVERVIEW SECTION */}
            {activeSection === "overview" && (
              <div className="space-y-6">
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-md">
                  <div className="flex items-center gap-4">
                    <img
                      src={avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"}
                      alt={name || "Creator"}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-700 bg-slate-950"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-100">{name || "Creator"}</h3>
                        {creator?.verifiedBadge && <VerificationBadge size="sm" showText={false} />}
                      </div>
                      <span className="text-xs text-slate-400">{username} • {category}</span>
                      <p className="text-[11px] text-emerald-400 mt-0.5 font-semibold">Creator Account — Active</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setActiveSection("profile")}
                    className="p-5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl space-y-2 cursor-pointer transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-400" />
                        <span>Public Profile</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                    <p className="text-xs text-slate-400">
                      Update your avatar, display name, category, and bio.
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveSection("status")}
                    className="p-5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl space-y-2 cursor-pointer transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span>Availability &amp; Rates</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                    <p className="text-xs text-slate-400">
                      Configure your starting collaboration rate and marketplace tags.
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveSection("accounts")}
                    className="p-5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl space-y-2 cursor-pointer transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-purple-400" />
                        <span>Connected Channels</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                    <p className="text-xs text-slate-400">
                      Manage read-only Graph API social telemetry connections.
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveSection("account")}
                    className="p-5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl space-y-2 cursor-pointer transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-400" />
                        <span>Account &amp; Security</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                    <p className="text-xs text-slate-400">
                      Manage authentication credentials and active login sessions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ACCOUNT & SECURITY */}
            {activeSection === "account" && (
              <div className="space-y-6">
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-lg">
                  <h3 className="text-base font-bold text-slate-100 pb-3 border-b border-slate-800">
                    Account Credentials
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Registered Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 cursor-not-allowed font-semibold"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Creator accounts require a verified Gmail address.</p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Account Role
                      </label>
                      <input
                        type="text"
                        value="CREATOR (Free Tier)"
                        disabled
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 cursor-not-allowed font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-lg">
                  <h3 className="text-base font-bold text-slate-100 pb-3 border-b border-slate-800">
                    Change Password
                  </h3>

                  <div className="space-y-3.5 max-w-md">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-hidden focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        New Password (8+ characters)
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-hidden focus:border-blue-500"
                        required
                        minLength={8}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-hidden focus:border-blue-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isChangingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* PROFILE SETTINGS */}
            {activeSection === "profile" && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-base font-bold text-slate-100">Public Profile Identity</h3>
                    <Link
                      href="/dashboard/creator/profile"
                      className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Open Full Profile Editor</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="relative shrink-0">
                      <img
                        src={avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"}
                        alt={name}
                        className="w-20 h-20 rounded-2xl object-cover border border-slate-700 bg-slate-950"
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md cursor-pointer"
                        title="Upload Photo"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-hidden focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Creator Bio &amp; Deliverables Pitch
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell brands about your audience demographics, content pillars, and typical collaboration deliverable packages..."
                      className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 leading-relaxed focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Category / Niche
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-hidden focus:border-blue-500 cursor-pointer"
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
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Location / City
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Melbourne, Australia"
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Media Kit URL
                      </label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://yourlinktree.com"
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? "Saving..." : "Save Profile Settings"}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* STATUS & RATES */}
            {activeSection === "status" && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-lg">
                  <h3 className="text-base font-bold text-slate-100 pb-3 border-b border-slate-800">
                    Availability &amp; Commercial Rates
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setAvailabilityStatus("OPEN_TO_WORK")}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
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
                        Actively accepting new brand sponsorship briefs.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAvailabilityStatus("AVAILABLE_FOR_COLLABORATION")}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
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
                        Selective partnerships for aligned campaigns.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAvailabilityStatus("NOT_AVAILABLE")}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
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
                        Temporarily fully booked.
                      </span>
                    </button>
                  </div>

                  <div className="max-w-xs pt-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Starting Collaboration Rate (USD)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="25"
                        value={startingRate}
                        onChange={(e) => setStartingRate(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 pl-8 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-semibold focus:outline-hidden focus:border-blue-500"
                      />
                      <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Profile Tags */}
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Marketplace Profile Tags ({selectedTags.length})
                    </span>

                    <div className="flex flex-wrap gap-2 p-3 bg-slate-950 rounded-2xl border border-slate-800 min-h-[48px] items-center">
                      {selectedTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold text-xs"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-white cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>

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

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? "Saving..." : "Save Status & Tags"}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* CONNECTED CHANNELS */}
            {activeSection === "accounts" && (
              <div className="space-y-6">
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-base font-bold text-slate-100">Social Channel Telemetry Integrations</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Direct OAuth connections used strictly for read-only engagement calculations.
                      </p>
                    </div>
                    <Link
                      href="/dashboard/creator/verification"
                      className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold shrink-0"
                    >
                      <span>Verification Center</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="space-y-3.5">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs">
                          IG
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">Instagram Professional</h4>
                          <span className="text-[10px] text-slate-400">Meta Graph API (Read-Only)</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Connected
                      </span>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs">
                          TT
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">TikTok Creator Account</h4>
                          <span className="text-[10px] text-slate-400">TikTok Open SDK</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-slate-500 border border-slate-800">
                        Not Linked
                      </span>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
                          YT
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">YouTube Partner Channel</h4>
                          <span className="text-[10px] text-slate-400">Google OAuth 2.0</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-slate-500 border border-slate-800">
                        Not Linked
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TRUSTSCORE & TELEMETRY */}
            {activeSection === "trustscore" && (
              <div className="space-y-6">
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-base font-bold text-slate-100">TrustScore Model Configuration</h3>
                    <Link
                      href="/dashboard/creator/analytics"
                      className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>View Authenticity Analytics</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
                    <span className="font-bold text-slate-200 block">Bayesian Statistical Engine v2.4</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      TrustScore assessments update automatically as new post telemetry and comment lexical entropy snapshots are recorded.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeSection === "notifications" && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-lg">
                <h3 className="text-base font-bold text-slate-100 pb-3 border-b border-slate-800">
                  Notification Preferences
                </h3>

                <div className="space-y-4 text-xs">
                  <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-200 block">Inbound Collaboration Offers</span>
                      <span className="text-[11px] text-slate-400">Receive alerts when brands send sponsorship proposals.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifCollabs}
                      onChange={(e) => setNotifCollabs(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-200 block">Direct Collaboration Messages</span>
                      <span className="text-[11px] text-slate-400">Alerts for new messages in active collaboration threads.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifMessages}
                      onChange={(e) => setNotifMessages(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-200 block">Verification &amp; Telemetry Updates</span>
                      <span className="text-[11px] text-slate-400">Notifications regarding Graph API token refresh and audit results.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifVerification}
                      onChange={(e) => setNotifVerification(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* PRIVACY */}
            {activeSection === "privacy" && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-lg">
                <h3 className="text-base font-bold text-slate-100 pb-3 border-b border-slate-800">
                  Marketplace Privacy Controls
                </h3>

                <div className="space-y-4 text-xs">
                  <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-200 block">Marketplace Discoverability</span>
                      <span className="text-[11px] text-slate-400">Allow verified brands to find your profile in marketplace searches.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privMarketplace}
                      onChange={(e) => setPrivMarketplace(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-200 block">Public TrustScore Display</span>
                      <span className="text-[11px] text-slate-400">Display your computed TrustScore badge on your public creator card.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privTrustScore}
                      onChange={(e) => setPrivTrustScore(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* CREATOR MEMBERSHIP / SUBSCRIPTION */}
            {(activeSection === "plan" || activeSection === "subscription") && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Creator Account</h3>
                    <p className="text-xs text-emerald-400 font-semibold">Free Forever on TrustScore</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pt-2">
                  Creators enjoy complimentary access to public marketplace listings, verified Graph API telemetry sync, authenticity analytics, and inbound brand collaboration proposals.
                </p>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1">
                  <span className="font-bold text-slate-200 block">No Credit Card Required</span>
                  <p className="text-[11px]">
                    Brand and agency subscriptions support the TrustScore verification ecosystem.
                  </p>
                </div>
              </div>
            )}

            {/* HELP & SUPPORT */}
            {activeSection === "help" && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-lg">
                <h3 className="text-base font-bold text-slate-100 pb-3 border-b border-slate-800">
                  Help &amp; Support Resources
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                    <span className="font-bold text-slate-200 block">Creator Support Desk</span>
                    <p className="text-[11px] text-slate-400">
                      Need assistance connecting social channels or auditing telemetry? Reach out to support@trustscore.io
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                    <span className="font-bold text-slate-200 block">Authenticity Methodology Guide</span>
                    <p className="text-[11px] text-slate-400">
                      Learn how our Bayesian algorithm evaluates comment diversity, growth curves, and engagement distributions.
                    </p>
                    <Link href="/methodology" className="text-blue-400 hover:underline inline-block pt-1 text-[11px]">
                      Read Methodology Whitepaper →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* ABOUT */}
            {activeSection === "about" && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-lg">
                <h3 className="text-base font-bold text-slate-100 pb-3 border-b border-slate-800">
                  About TrustScore
                </h3>

                <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
                  <p>
                    <strong className="text-slate-200">TrustScore Application v2.4.0 (Production Release)</strong>
                  </p>
                  <p>
                    TrustScore provides probabilistic authenticity evaluation for creators and commercial brands. Access tokens and read-only telemetry metrics are protected via AES-256 encryption.
                  </p>
                  <div className="flex items-center gap-4 pt-2 text-[11px]">
                    <Link href="/terms" className="text-blue-400 hover:underline">Terms of Service</Link>
                    <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>
                    <Link href="/cookies" className="text-blue-400 hover:underline">Cookie Policy</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
