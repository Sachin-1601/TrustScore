"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Creator } from "@/types/creator";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import {
  CreatorSubscriptionInfo,
  CreatorPlanType,
  CREATOR_PLANS,
} from "@/types/subscription";
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
  Trash2,
  Globe,
  DollarSign,
  MapPin,
  ExternalLink,
  Save,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  X,
  Eye,
  Cpu,
  Mail,
  KeyRound,
  FileText,
  Sliders,
  Check,
  Camera,
  CreditCard,
  Zap,
  Calendar,
  AlertCircle,
} from "lucide-react";

type SettingsSection =
  | "overview"
  | "account"
  | "profile"
  | "subscription"
  | "status"
  | "accounts"
  | "trustscore"
  | "notifications"
  | "privacy"
  | "help"
  | "about";

const PRESET_TAGS = [
  "Open to Work",
  "Available for Collaboration",
  "Open to Brand Deals",
  "Open to Sponsorships",
  "Open to UGC",
  "Open to Affiliate Partnerships",
];

interface CreatorSettingsViewProps {
  initialSection?: SettingsSection;
}

export function CreatorSettingsView({ initialSection }: CreatorSettingsViewProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sectionParam = searchParams.get("section") as SettingsSection | null;
  const [activeSection, setActiveSection] = useState<SettingsSection>(
    initialSection || sectionParam || "overview"
  );

  const [creator, setCreator] = useState<Creator | null>(null);
  const [subscription, setSubscription] = useState<CreatorSubscriptionInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Notification Preferences (persistent UI)
  const [notifCollabs, setNotifCollabs] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifCampaigns, setNotifCampaigns] = useState(true);
  const [notifTrustScore, setNotifTrustScore] = useState(true);
  const [notifVerification, setNotifVerification] = useState(true);

  // Privacy Preferences
  const [privMarketplace, setPrivMarketplace] = useState(true);
  const [privTrustScore, setPrivTrustScore] = useState(true);
  const [privAvailability, setPrivAvailability] = useState(true);
  const [privTags, setPrivTags] = useState(true);

  // Handle Device Photo Upload
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
          success("Photo Selected", "New profile photo loaded from your device. Click Save Changes to apply.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch Creator Profile & Subscription
  useEffect(() => {
    async function loadProfile() {
      try {
        const userId = user?.id || "user-alex-creator";
        const res = await fetch(`/api/creators/me?userId=${userId}`);
        const data = await res.json();
        if (data.creator) {
          const c: Creator = data.creator;
          setCreator(c);
          setAvatar(c.avatar || user?.avatar || "");
          setName(c.name || user?.name || "Alex Rivera");
          setUsername(c.username || "@alexfitness");
          setBio(c.bio || "");
          setCategory(c.category || "Fitness");
          setLocation(c.location || "Melbourne, Australia");
          setCountry(c.country || "Australia");
          setWebsite(c.website || "");
          setPlatform((c.platform as any) || "instagram");
          setStartingRate(c.startingRate || 350);
          setAvailabilityStatus(c.availabilityStatus || "OPEN_TO_WORK");
          if (c.profileTags && c.profileTags.length > 0) {
            setSelectedTags(c.profileTags);
          }
        }
      } catch (err) {
        console.error("Failed to load creator settings profile", err);
      }
    }

    async function loadSubscription() {
      try {
        const userId = user?.id || "user-alex-creator";
        const res = await fetch(`/api/creators/subscription?userId=${userId}`);
        const data = await res.json();
        if (data.subscription) {
          setSubscription(data.subscription);
        }
      } catch (err) {
        console.error("Failed to load creator subscription", err);
      }
    }

    loadProfile();
    loadSubscription();
  }, [user]);

  const fallbackCreator: Creator = {
    id: "alexfitness",
    username: "@alexfitness",
    name: user?.name || "Alex Rivera",
    avatar: user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
    platform: "instagram",
    category: "Fitness",
    bio: "Certified strength coach & hybrid athlete. Daily workouts, mobility routines & nutrition tips. Melbourne, Australia. 🏋️‍♂️🥑",
    location: "Melbourne, Australia",
    country: "Australia",
    joinedDate: "March 2021",
    verifiedBadge: true,
    profileUrl: "https://instagram.com/alexfitness",
    followers: 32400,
    following: 684,
    totalPosts: 342,
    avgLikes: 1450,
    avgComments: 105,
    engagementRate: 4.8,
    trustScore: 97,
    scoreBand: "Very High Trust",
    riskLevel: "Low",
    inflatedEngagementProbability: 3.2,
    uncertaintyMargin: 1.2,
    authenticityProbability: 96.8,
    commentDiversityPercent: 89,
    growthStabilityScore: 96,
    engagementConsistencyScore: 95,
    isAvailableForCollaboration: true,
    availabilityStatus: "OPEN_TO_WORK",
    profileTags: ["Open to Work", "Available for Collaboration", "Open to Brand Deals"],
    startingRate: 350,
    preferredCampaignTypes: ["Dedicated Reel", "Story Series"],
    subScores: {
      followerAuthenticity: 98,
      engagementAuthenticity: 96,
      commentQuality: 97,
      growthPattern: 98,
      engagementConsistency: 96,
    },
    commentQuality: {
      uniqueCommentsPercent: 89,
      repeatedPatternsPercent: 5,
      genericCommentsPercent: 6,
      emojiOnlyPercent: 4,
      sampleAnalyzedComments: [],
      podClusterDetected: false,
      crowdTurfingRisk: "Very Low",
    },
    prescriptiveGuidance: {
      primaryRecommendation: "Standard campaign terms",
      recommendedPaymentAdjustment: "0%",
      confidenceLevel: "High",
      alternativeAction: "Standard contract terms",
      riskMitigationChecklist: [],
    },
    followerGrowthHistory: [],
    engagementHistory: [],
    positiveFactors: ["Verified direct Graph API connection"],
    warningFactors: [],
    engagementVolatilityIndex: 12.0,
    analyzedAt: "2026-08-30T00:00:00Z",
  };

  const active = creator || fallbackCreator;
  const cleanUsername = active.username.replace("@", "");

  const currentSub: CreatorSubscriptionInfo = subscription || {
    id: "sub-creator-alex",
    userId: user?.id || "user-alex-creator",
    plan: "PRO",
    priceMonthly: 9.99,
    status: "ACTIVE",
    currentPeriodStart: "2026-08-01T00:00:00Z",
    currentPeriodEnd: "2026-09-01T00:00:00Z",
    cancelAtPeriodEnd: false,
    usage: {
      trustScoreChecks: { used: 12, limit: 25 },
      profileViews: { used: 84, limit: 1000 },
      socialConnections: { used: 2, limit: 3 },
    },
  };

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

  // Save Handlers
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/creators/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "user-alex-creator",
          creatorId: creator?.id || "alexfitness",
          role: user?.role || "CREATOR",
          name,
          avatar: avatar || active.avatar,
          bio,
          category,
          location,
          country,
          platform,
          website,
          startingRate: Number(startingRate),
          availabilityStatus,
          profileTags: selectedTags,
          isAvailableForCollaboration: availabilityStatus !== "NOT_AVAILABLE",
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toastError("Save Failed", data.error || "Could not save profile changes.");
      } else {
        setCreator(data.creator);
        success("Profile updated successfully.", "Your changes are now live on TrustScore.");
      }
    } catch (err: any) {
      toastError("Error", err.message || "Network error while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toastError("Password Error", "Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      toastError("Password Error", "New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError("Password Error", "New passwords do not match.");
      return;
    }

    success("Password updated successfully.", "Your security credentials have been updated.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    success("Notification preferences saved.", "Your notification settings have been updated.");
  };

  const handleSavePrivacy = (e: React.FormEvent) => {
    e.preventDefault();
    success("Privacy settings saved.", "Your profile visibility preferences have been updated.");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleUpgradePlan = async (plan: CreatorPlanType) => {
    setIsUpgrading(true);
    try {
      const res = await fetch("/api/creators/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "user-alex-creator",
          plan,
        }),
      });
      const data = await res.json();
      if (data.subscription) {
        setSubscription(data.subscription);
        success("Plan Updated", `Your creator account is now on the ${plan} plan.`);
      } else {
        toastError("Update Failed", data.error || "Failed to update plan.");
      }
    } catch (err: any) {
      toastError("Error", err.message || "Failed to update plan.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const currentPlanType = subscription?.plan || "PRO";

  // Navigation Items
  const menuCategories = [
    {
      group: "ACCOUNT",
      items: [
        {
          id: "account" as SettingsSection,
          label: "Account",
          desc: "Manage your email, password, and account security",
          icon: User,
          color: "text-blue-600 bg-blue-50 border-blue-200",
        },
        {
          id: "profile" as SettingsSection,
          label: "Profile",
          desc: "Manage display name, bio, rates, and public details",
          icon: Sliders,
          color: "text-indigo-600 bg-indigo-50 border-indigo-200",
        },
        {
          id: "subscription" as SettingsSection,
          label: "Subscription",
          desc: "Manage your TrustScore plan, usage and billing",
          icon: CreditCard,
          color: "text-amber-600 bg-amber-50 border-amber-200",
          badge: currentPlanType === "PRO" ? "Pro" : currentPlanType === "VERIFIED" ? "Verified" : "Free",
        },
        {
          id: "status" as SettingsSection,
          label: "Creator Status",
          desc: "Set availability and manage marketplace tags",
          icon: Sparkles,
          color: "text-emerald-600 bg-emerald-50 border-emerald-200",
        },
        {
          id: "accounts" as SettingsSection,
          label: "Connected Accounts",
          desc: "Manage Instagram, TikTok, and YouTube connections",
          icon: LinkIcon,
          color: "text-purple-600 bg-purple-50 border-purple-200",
        },
        {
          id: "trustscore" as SettingsSection,
          label: "TrustScore & Verification",
          desc: "View verified metrics, authenticity, and data coverage",
          icon: Shield,
          color: "text-rose-600 bg-rose-50 border-rose-200",
        },
      ],
    },
    {
      group: "PREFERENCES & SECURITY",
      items: [
        {
          id: "notifications" as SettingsSection,
          label: "Notifications",
          desc: "Choose which alerts and proposals you receive",
          icon: Bell,
          color: "text-sky-600 bg-sky-50 border-sky-200",
        },
        {
          id: "privacy" as SettingsSection,
          label: "Privacy & Security",
          desc: "Control marketplace visibility and public badges",
          icon: Lock,
          color: "text-slate-700 bg-slate-100 border-slate-200",
        },
      ],
    },
    {
      group: "HELP & ABOUT",
      items: [
        {
          id: "help" as SettingsSection,
          label: "Help & Support",
          desc: "Methodology guides, FAQ, and support contact",
          icon: HelpCircle,
          color: "text-teal-600 bg-teal-50 border-teal-200",
        },
        {
          id: "about" as SettingsSection,
          label: "About TrustScore",
          desc: "Platform version, Terms of Service, and Privacy Policy",
          icon: Info,
          color: "text-slate-600 bg-slate-100 border-slate-200",
        },
      ],
    },
  ];

  return (
    <div className="min-h-full flex flex-col bg-slate-50 text-slate-900">
      {/* Hidden Device Image File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Banner / Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Settings
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        {/* Desktop Dual-Pane Layout / Mobile Dynamic View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Menu (Categories) */}
          <div
            className={`lg:col-span-4 space-y-6 ${
              activeSection !== "overview" ? "hidden lg:block" : "block"
            }`}
          >
            {/* Creator Profile Summary Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={avatar || active.avatar}
                  alt={active.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full border-2 border-white shadow-xs transition-transform hover:scale-110 cursor-pointer"
                  title="Upload profile picture"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-black text-slate-900 truncate">{active.name}</h2>
                  {active.verifiedBadge && <VerificationBadge size="sm" showText={false} />}
                </div>
                <p className="text-xs text-slate-500 font-semibold truncate">{active.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-extrabold border border-blue-200">
                    Creator Account
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600">
                    TrustScore: {active.trustScore}
                  </span>
                </div>
              </div>
            </div>

            {/* Grouped Settings List */}
            {menuCategories.map((cat) => (
              <div key={cat.group} className="space-y-2">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-3">
                  {cat.group}
                </h3>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
                  {cat.items.map((item) => {
                    const Icon = item.icon;
                    const isCurrent = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveSection(item.id);
                        }}
                        className={`w-full p-4 flex items-center justify-between text-left transition-colors cursor-pointer ${
                          isCurrent
                            ? "bg-blue-50/80 text-blue-900"
                            : "hover:bg-slate-50/80 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-2xl border flex items-center justify-center shrink-0 ${item.color}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 block truncate">
                              {item.label}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate">
                              {item.desc}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {item.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight
                            className={`w-4 h-4 shrink-0 transition-transform ${
                              isCurrent ? "text-blue-600 translate-x-0.5" : "text-slate-300"
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Logout Card Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full p-3.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-2xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of TrustScore</span>
              </button>
            </div>
          </div>

          {/* Right Detail Pane (Selected Category Form/View) */}
          <div
            className={`lg:col-span-8 ${
              activeSection === "overview" ? "hidden lg:block" : "block"
            }`}
          >
            {/* Mobile Back Button */}
            <div className="lg:hidden mb-4">
              <button
                type="button"
                onClick={() => setActiveSection("overview")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Settings</span>
              </button>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SECTION: Overview (Default for Desktop when nothing selected) */}
            {/* ------------------------------------------------------------- */}
            {activeSection === "overview" && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Welcome to Creator Settings
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Select a category from the menu to update your profile details, manage subscription, view connected social accounts, or adjust notification and privacy preferences.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveSection("profile")}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-2">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-600">
                      Public Creator Profile
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Edit your bio, category, starting rate, and social handle
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection("subscription")}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-2">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-600">
                        Creator Subscription
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                        {currentPlanType === "PRO" ? "Pro" : currentPlanType === "VERIFIED" ? "Verified" : "Free"}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Manage your TrustScore plan, monthly usage limits, and billing
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection("status")}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-2">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-600">
                      Creator Status &amp; Tags
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Toggle Open to Work and customize marketplace tags
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection("accounts")}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mb-2">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-600">
                      Connected Socials
                    </span>
                    <span className="text-[11px] text-slate-500">
                      View Instagram Graph API connection and linked platforms
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection("trustscore")}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-2">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-600">
                      TrustScore Dossier
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Inspect your 97/100 authenticity rating and badge status
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SECTION: Account */}
            {/* ------------------------------------------------------------- */}
            {activeSection === "account" && (
              <div className="space-y-6">
                {/* Account Details Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                  <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        <span>Account Information</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Manage login email, password, and security
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-[11px] rounded-full border border-blue-200">
                      Creator Account
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Login Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          readOnly
                          value={user?.email || "alex@fitness.example.com"}
                          className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium text-xs select-all"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Contact support to update your primary login email.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Account Identifier
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={user?.id || "user-alex-creator"}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-mono text-xs select-all"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Unique TrustScore Creator ID
                      </p>
                    </div>
                  </div>
                </div>

                {/* Change Password Form */}
                <form
                  onSubmit={handleSavePassword}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6"
                >
                  <div className="pb-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-indigo-600" />
                      <span>Security &amp; Password</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ensure your account uses a strong, unique password
                    </p>
                  </div>

                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-xs font-medium text-slate-900 bg-white placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-xs font-medium text-slate-900 bg-white placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-xs font-medium text-slate-900 bg-white placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Update Password
                    </button>
                  </div>
                </form>

                {/* Danger Zone: Delete Account */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                    <div>
                      <h3 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                        <Trash2 className="w-4 h-4 text-rose-600" />
                        <span>Danger Zone</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Permanently delete your creator account and associated TrustScore telemetry
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <p className="text-xs text-slate-600">
                      Once deleted, your verified badges, public profile, and historical scores cannot be recovered.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SECTION: Profile */}
            {/* ------------------------------------------------------------- */}
            {activeSection === "profile" && (
              <form
                onSubmit={handleSaveProfile}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6"
              >
                <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-indigo-600" />
                      <span>Public Creator Profile</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Information visible to verified brands and agency buyers in the marketplace
                    </p>
                  </div>
                  <Link
                    href={`/creators/${cleanUsername}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <span>Preview</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Avatar Preview & Device Upload */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={avatar || active.avatar}
                        alt={name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full border-2 border-white shadow-xs transition-transform hover:scale-110 cursor-pointer"
                        title="Upload profile picture"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900">Profile Photo</h4>
                      <p className="text-[11px] text-slate-500">
                        Upload and set any picture directly from your device
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload New Photo</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Display Name / Stage Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-xs font-medium text-slate-900 bg-white placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Social Username / Handle
                    </label>
                    <input
                      type="text"
                      value={username}
                      readOnly
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium text-xs cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Handle is bound to your verified social profile.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Primary Niche / Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-xs font-medium text-slate-900 bg-white"
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Primary Platform
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-xs font-medium text-slate-900 bg-white"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="youtube">YouTube</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Location / City
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Melbourne, Australia"
                        className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-xs font-medium text-slate-900 bg-white placeholder:text-slate-400"
                      />
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Australia"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-xs font-medium text-slate-900 bg-white placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Starting Collaboration Rate ($ USD)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="25"
                        value={startingRate}
                        onChange={(e) => setStartingRate(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-xs font-medium text-slate-900 bg-white"
                      />
                      <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Website / Media Kit URL
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://yourportfolio.com"
                        className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-xs font-medium text-slate-900 bg-white placeholder:text-slate-400"
                      />
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Creator Bio
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Short description of your content style, audience, and specialty..."
                    className="w-full p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-xs font-medium text-slate-900 bg-white placeholder:text-slate-400 leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs text-slate-400">
                    Changes reflect immediately in marketplace search.
                  </span>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SECTION: Subscription & Billing */}
            {/* ------------------------------------------------------------- */}
            {activeSection === "subscription" && (
              <div className="space-y-8">
                {/* 1. Header & Current Plan Hero Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                  <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-amber-600" />
                        <span>Creator Subscription &amp; Plans</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Manage your TrustScore plan tier, monthly quotas, and billing settings
                      </p>
                    </div>
                    <span className="self-start sm:self-auto px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active Plan
                    </span>
                  </div>

                  {/* Prominent Current Plan Box */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400">
                              Your Current Plan
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-400/30">
                              {currentSub.plan === "PRO" ? "Pro Creator" : currentSub.plan === "VERIFIED" ? "Verified Creator" : "Free"}
                            </span>
                          </div>
                          <h4 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                            {currentSub.plan === "PRO" ? "Pro Creator" : currentSub.plan === "VERIFIED" ? "Verified Creator" : "Free Plan"}
                          </h4>
                          <p className="text-xs text-slate-300 mt-1">
                            {currentSub.plan === "PRO"
                              ? "Designed for creators who want more visibility and deeper analytics."
                              : currentSub.plan === "VERIFIED"
                              ? "For creators who want enhanced credibility with brands."
                              : "For creators building their TrustScore profile."}
                          </p>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <div className="text-2xl sm:text-3xl font-black text-white">
                            ${currentSub.priceMonthly}
                            <span className="text-xs font-normal text-slate-400"> / month</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center sm:justify-end gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Renewal: September 01, 2026</span>
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-700/60">
                        <p className="text-xs text-slate-300 font-semibold mb-3">Plan Features Included:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                          {(
                            CREATOR_PLANS.find((p) => p.id === currentSub.plan)?.features ||
                            CREATOR_PLANS[1].features
                          ).map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById("available-plans-section");
                            el?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          Change Plan
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById("creator-billing-section");
                            el?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Manage Billing
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Usage & Limits */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                  <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span>Usage &amp; Creator Quotas</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Track your monthly TrustScore audits and platform capacity
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
                      Resets next billing cycle
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {/* Quota 1: TrustScore checks */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">TrustScore Checks</span>
                        <span className="text-xs font-black text-slate-900">
                          {currentSub.usage.trustScoreChecks.used} / {currentSub.usage.trustScoreChecks.limit}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (currentSub.usage.trustScoreChecks.used / currentSub.usage.trustScoreChecks.limit) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Audits run this cycle
                      </p>
                    </div>

                    {/* Quota 2: Profile views */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Profile Views</span>
                        <span className="text-xs font-black text-slate-900">
                          {currentSub.usage.profileViews.used} / {currentSub.usage.profileViews.limit}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (currentSub.usage.profileViews.used / currentSub.usage.profileViews.limit) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Brand discovery views
                      </p>
                    </div>

                    {/* Quota 3: Connected accounts */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Social Connections</span>
                        <span className="text-xs font-black text-slate-900">
                          {currentSub.usage.socialConnections.used} / {currentSub.usage.socialConnections.limit}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (currentSub.usage.socialConnections.used / currentSub.usage.socialConnections.limit) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Linked social platforms
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      Usage limits reset automatically at the start of each billing cycle.
                    </span>
                  </div>
                </div>

                {/* 3. Available Plans & Upgrade Comparison */}
                <div id="available-plans-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                  <div className="pb-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Upgrade Your Creator Plan</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select the tier that best supports your brand partnerships and verification goals
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {CREATOR_PLANS.map((plan) => {
                      const isCurrent = currentSub.plan === plan.id;
                      return (
                        <div
                          key={plan.id}
                          className={`rounded-2xl p-5 sm:p-6 border flex flex-col justify-between transition-all ${
                            isCurrent
                              ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20 shadow-xs"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-sm">{plan.name}</span>
                              {plan.badge && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    plan.id === "PRO"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-purple-100 text-purple-700"
                                  }`}
                                >
                                  {plan.badge}
                                </span>
                              )}
                            </div>

                            <div>
                              <div className="text-2xl font-black text-slate-900">
                                ${plan.priceMonthly}
                                <span className="text-xs font-normal text-slate-500"> / month</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                {plan.description}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-slate-100 space-y-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                                What's included:
                              </span>
                              {plan.features.map((f, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{f}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-6 mt-6 border-t border-slate-100">
                            {isCurrent ? (
                              <button
                                type="button"
                                disabled
                                className="w-full py-2.5 bg-slate-100 text-slate-500 font-bold text-xs rounded-xl cursor-default text-center"
                              >
                                Current Plan
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isUpgrading}
                                onClick={() => handleUpgradePlan(plan.id)}
                                className={`w-full py-2.5 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer text-center ${
                                  plan.id === "FREE"
                                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                              >
                                {isUpgrading
                                  ? "Updating..."
                                  : plan.id === "FREE"
                                  ? "Downgrade to Free"
                                  : `Upgrade to ${plan.name}`}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Billing & Payment Management */}
                <div id="creator-billing-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                  <div className="pb-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-slate-700" />
                      <span>Billing &amp; Payment Details</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Payment methods, invoice receipts, and automated renewal terms
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                      <span className="text-slate-400 font-medium">Payment Method</span>
                      <p className="font-bold text-slate-900">Direct Account Billing</p>
                      <p className="text-[10px] text-slate-400">No external credit card attached</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                      <span className="text-slate-400 font-medium">Next Billing Date</span>
                      <p className="font-bold text-slate-900">September 01, 2026</p>
                      <p className="text-[10px] text-slate-400">Auto-renews monthly</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                      <span className="text-slate-400 font-medium">Billing History</span>
                      <p className="font-bold text-slate-900">0 Invoices</p>
                      <p className="text-[10px] text-slate-400">Past invoices will appear here</p>
                    </div>
                  </div>

                  {/* Honest Notice about Stripe connection */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <span className="font-bold text-amber-900">Payment Gateway Notice</span>
                      <p className="text-amber-800 leading-relaxed">
                        Billing management will be available once payments are connected.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => success("Billing Info", "Billing management will be available once payments are connected.")}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Manage Billing
                    </button>
                    <button
                      type="button"
                      onClick={() => success("Invoices", "No billing history available yet.")}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      View Billing History
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SECTION: Creator Status & Tags */}
            {/* ------------------------------------------------------------- */}
            {activeSection === "status" && (
              <form
                onSubmit={handleSaveProfile}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6"
              >
                <div className="pb-4 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <span>Creator Status &amp; Marketplace Tags</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Signal your current brand availability and active collaboration preferences
                  </p>
                </div>

                {/* Availability Radio Selector */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Current Collaboration Availability
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setAvailabilityStatus("OPEN_TO_WORK")}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        availabilityStatus === "OPEN_TO_WORK"
                          ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold">Open to Work</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-normal">
                        Actively seeking sponsorships and campaigns
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAvailabilityStatus("AVAILABLE_FOR_COLLABORATION")}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        availabilityStatus === "AVAILABLE_FOR_COLLABORATION"
                          ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 text-blue-900 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className="text-xs font-bold">Available</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-normal">
                        Open to select selective partnerships
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAvailabilityStatus("NOT_AVAILABLE")}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        availabilityStatus === "NOT_AVAILABLE"
                          ? "bg-rose-50/80 border-rose-400 ring-2 ring-rose-400/20 text-rose-900 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                        <span className="text-xs font-bold">Not Available</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-normal">
                        Currently at capacity or on break
                      </p>
                    </button>
                  </div>
                </div>

                {/* Profile Tags Selector */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Marketplace Profile Tags ({selectedTags.length})
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Helps brand filters match your profile
                    </span>
                  </div>

                  {/* Preset Pills */}
                  <div className="flex flex-wrap gap-2">
                    {PRESET_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Tag Input */}
                  <div className="pt-2">
                    <div className="flex gap-2 max-w-md">
                      <input
                        type="text"
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        placeholder="Add custom tag (e.g. Organic Food Specialist)..."
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-xs font-medium text-slate-900 bg-white placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomTag}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
                      >
                        Add Tag
                      </button>
                    </div>
                  </div>

                  {/* Selected Tags Display */}
                  {selectedTags.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Active Tags on Profile:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs text-slate-400">
                    Tags persist to database and are indexed for brand discovery.
                  </span>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? "Saving..." : "Save Status & Tags"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SECTION: Connected Social Accounts */}
            {/* ------------------------------------------------------------- */}
            {activeSection === "accounts" && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-purple-600" />
                    <span>Connected Social Accounts</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Direct API data feeds powering your TrustScore calculations and authenticity auditing
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Instagram - Connected */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">Instagram</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            ✓ Connected
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-600 mt-0.5">
                          {active.username} • 32.4k followers
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Last synced: 2 hours ago via Meta Graph API v19.0
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => success("Sync refreshed", "Latest Instagram telemetry loaded.")}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                      >
                        Sync Now
                      </button>
                    </div>
                  </div>

                  {/* TikTok - Not Connected */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0 font-black text-xs">
                        TT
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">TikTok</span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">
                            Not connected
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Connect TikTok to include short-form video engagement in your TrustScore
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => success("TikTok OAuth", "TikTok connection flow initialized.")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                    >
                      Connect TikTok
                    </button>
                  </div>

                  {/* YouTube - Not Connected */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0 font-black text-xs">
                        YT
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">YouTube</span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">
                            Not connected
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Connect YouTube to audit long-form watch time &amp; subscriber retention
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => success("YouTube OAuth", "YouTube connection flow initialized.")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                    >
                      Connect YouTube
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-blue-800 leading-relaxed">
                  <span className="font-bold block mb-0.5">TrustScore Data Security Guarantee:</span>
                  We only request read-only telemetry permissions (likes, comments, views, follower velocity). We never post, message, or modify your connected social accounts.
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SECTION: TrustScore & Verification */}
            {/* ------------------------------------------------------------- */}
            {activeSection === "trustscore" && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-amber-600" />
                      <span>TrustScore Dossier &amp; Verification</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your algorithmic credibility profile evaluated by TrustScore Engine v1.2
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[11px] rounded-full border border-emerald-200">
                    {active.scoreBand}
                  </span>
                </div>

                {/* Score Metric Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      TrustScore
                    </span>
                    <span className="text-3xl font-black text-slate-900 block mt-1">
                      {active.trustScore}
                      <span className="text-sm text-slate-400 font-medium"> / 100</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 mt-0.5 block">
                      Top 3% of Fitness Creators
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Audience Authenticity
                    </span>
                    <span className="text-3xl font-black text-emerald-600 block mt-1">
                      {active.authenticityProbability}%
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Low bot / inflation risk ({active.inflatedEngagementProbability}%)
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Data Coverage
                    </span>
                    <span className="text-3xl font-black text-blue-600 block mt-1">
                      98%
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      High Confidence Sample (342 posts)
                    </span>
                  </div>
                </div>

                {/* SubScore Breakdown */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    SubScore Component Breakdown
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Follower Quality &amp; Genuine Audience:</span>
                        <span className="text-emerald-700 font-bold">{active.subScores.followerAuthenticity} / 100</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${active.subScores.followerAuthenticity}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Engagement Authenticity (Organic Likes):</span>
                        <span className="text-emerald-700 font-bold">{active.subScores.engagementAuthenticity} / 100</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${active.subScores.engagementAuthenticity}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Comment Lexical Diversity &amp; Non-Spam:</span>
                        <span className="text-blue-700 font-bold">{active.subScores.commentQuality} / 100</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${active.subScores.commentQuality}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                  <span className="text-slate-400">
                    Scoring audited on: {new Date(active.analyzedAt).toLocaleDateString()}
                  </span>
                  <Link
                    href="/how-it-works"
                    className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Read Methodology</span>
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </Link>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SECTION: Notifications */}
            {/* ------------------------------------------------------------- */}
            {activeSection === "notifications" && (
              <form
                onSubmit={handleSaveNotifications}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6"
              >
                <div className="pb-4 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-sky-600" />
                    <span>Notification Preferences</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose which notifications, alerts, and proposal updates you want to receive
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Brand Collaboration Requests
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Get instant alerts when a verified business sends a paid campaign proposal
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifCollabs}
                      onChange={(e) => setNotifCollabs(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Direct Brand Messages
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Email notifications when active collaboration partners message you
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifMessages}
                      onChange={(e) => setNotifMessages(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Campaign Milestone Updates
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Updates on deliverable approvals, timeline shifts, and payout readiness
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifCampaigns}
                      onChange={(e) => setNotifCampaigns(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        TrustScore &amp; Authenticity Changes
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Monthly summary of your TrustScore updates and benchmark percentiles
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifTrustScore}
                      onChange={(e) => setNotifTrustScore(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Badge &amp; Verification Alerts
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Reminders when Graph API tokens need re-authentication
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifVerification}
                      onChange={(e) => setNotifVerification(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Save Notification Settings
                  </button>
                </div>
              </form>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SECTION: Privacy & Security */}
            {/* ------------------------------------------------------------- */}
            {activeSection === "privacy" && (
              <form
                onSubmit={handleSavePrivacy}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6"
              >
                <div className="pb-4 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-slate-700" />
                    <span>Privacy &amp; Marketplace Visibility</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Control how your profile and authenticity badges are displayed to brands
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Show Profile in Creator Marketplace
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Allow brands and agencies to discover your profile in search results
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privMarketplace}
                      onChange={(e) => setPrivMarketplace(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Display TrustScore Publicly
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Show your 97/100 TrustScore gauge on your public profile link
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privTrustScore}
                      onChange={(e) => setPrivTrustScore(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Display Availability Status
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Show &quot;Open to Work&quot; indicator on marketplace cards
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privAvailability}
                      onChange={(e) => setPrivAvailability(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Show Collaboration Tags
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Display your selected tags like &quot;Open to UGC&quot; publicly
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privTags}
                      onChange={(e) => setPrivTags(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Save Privacy Settings
                  </button>
                </div>
              </form>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SECTION: Help & Support */}
            {/* ------------------------------------------------------------- */}
            {activeSection === "help" && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-teal-600" />
                    <span>Help &amp; Support</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Resources, documentation, and dedicated creator support assistance
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    href="/how-it-works"
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition-all"
                  >
                    <FileText className="w-5 h-5 text-blue-600 mb-2" />
                    <span className="text-xs font-bold text-slate-900 block">
                      Creator Onboarding Guide
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Learn how TrustScore connects to your socials and verifies authenticity
                    </span>
                  </Link>

                  <Link
                    href="/methodology"
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition-all"
                  >
                    <Cpu className="w-5 h-5 text-indigo-600 mb-2" />
                    <span className="text-xs font-bold text-slate-900 block">
                      Scoring Methodology
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Deep-dive into our Bayesian audit engine and anti-fraud filters
                    </span>
                  </Link>
                </div>

                {/* Contact Support Box */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900">Need direct assistance?</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Our dedicated creator partner team is available Monday through Friday to assist with social connection troubleshooting, score inquiries, or brand collaboration escrow questions.
                  </p>
                  <a
                    href="mailto:support@trustscore.io"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>support@trustscore.io</span>
                  </a>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SECTION: About */}
            {/* ------------------------------------------------------------- */}
            {activeSection === "about" && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Info className="w-5 h-5 text-slate-600" />
                    <span>About TrustScore</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Platform legal agreements, privacy policies, and release versioning
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">TrustScore Platform</span>
                      <span className="text-[11px] text-slate-500">
                        Production Release v1.2.4 (Australasia Edition)
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      Up to Date
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    <Link
                      href="/terms"
                      className="p-3.5 flex items-center justify-between hover:bg-slate-50 text-slate-700 transition-colors"
                    >
                      <span className="font-semibold">Terms of Service</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                    <Link
                      href="/privacy"
                      className="p-3.5 flex items-center justify-between hover:bg-slate-50 text-slate-700 transition-colors"
                    >
                      <span className="font-semibold">Privacy Policy</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                    <Link
                      href="/cookies"
                      className="p-3.5 flex items-center justify-between hover:bg-slate-50 text-slate-700 transition-colors"
                    >
                      <span className="font-semibold">Cookie Policy</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Delete your TrustScore creator account?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This will permanently remove your creator profile, verified badges, and historical TrustScore evaluations. This action cannot be undone.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  toastError("Account Deletion", "Account deletion request submitted. Support will finalize processing.");
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Confirm Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
