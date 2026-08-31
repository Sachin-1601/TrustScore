"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  Building2,
  Users,
  CreditCard,
  Key,
  Bell,
  Shield,
  HelpCircle,
  Info,
  Copy,
  Check,
  RefreshCw,
  Plus,
  ArrowRight,
  Download,
  ExternalLink,
  Lock,
  Mail,
  Zap,
} from "lucide-react";

type BusinessSettingsSection =
  | "account"
  | "profile"
  | "team"
  | "subscription"
  | "usage"
  | "invoices"
  | "notifications"
  | "security"
  | "help"
  | "about";

export function BusinessSettingsView() {
  const { user } = useAuth();
  const { success, info } = useToast();

  const [activeSection, setActiveSection] = useState<BusinessSettingsSection>("account");

  // Form states - Business Profile
  const [companyName, setCompanyName] = useState(user?.name || "Acme Brand");
  const [companyCategory, setCompanyCategory] = useState("Fitness & Nutrition");
  const [companyWebsite, setCompanyWebsite] = useState("https://acmebrand.com");
  const [companyBio, setCompanyBio] = useState("Direct-to-consumer health and performance nutrition brand.");

  // API Key state
  const [apiKey, setApiKey] = useState("ts_live_9f823a4b910e14c778f2aa90");
  const [copiedKey, setCopiedKey] = useState(false);

  // Notification toggles
  const [notifyProposals, setNotifyProposals] = useState(true);
  const [notifyQuota, setNotifyQuota] = useState(true);
  const [notifyMarketing, setNotifyMarketing] = useState(false);

  // Team state
  const [teamMembers, setTeamMembers] = useState([
    {
      id: "tm-1",
      name: user?.name || "Business Account Owner",
      email: user?.email || "owner@business.com",
      role: "Account Owner (Admin)",
      avatar: user?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80",
    },
    {
      id: "tm-2",
      name: "David Kim",
      email: "david.k@acmebrand.com",
      role: "Media Planner",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80",
    },
  ]);
  const [inviteEmail, setInviteEmail] = useState("");

  const handleCopyKey = () => {
    navigator.clipboard?.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleGenerateKey = () => {
    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    setApiKey(`ts_live_${randomHex}`);
    success("Secret Key Rotated", "A new live API key has been issued.");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    success("Business Profile Saved", "Your company details have been updated.");
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const newMember = {
      id: `tm-${Date.now()}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail.trim(),
      role: "Media Planner",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80",
    };
    setTeamMembers([...teamMembers, newMember]);
    setInviteEmail("");
    success("Invitation Sent", `Team invite dispatched to ${inviteEmail}.`);
  };

  const navigationSections = [
    {
      group: "ACCOUNT",
      items: [
        { id: "account" as const, label: "Business Account", icon: Building2 },
        { id: "profile" as const, label: "Company Profile", icon: Info },
        { id: "team" as const, label: "Team Members", icon: Users },
      ],
    },
    {
      group: "BILLING & USAGE",
      items: [
        { id: "subscription" as const, label: "Subscription Plan", icon: CreditCard },
        { id: "usage" as const, label: "Usage & Limits", icon: Zap },
        { id: "invoices" as const, label: "Payment History", icon: Download },
      ],
    },
    {
      group: "PREFERENCES & SECURITY",
      items: [
        { id: "notifications" as const, label: "Notifications", icon: Bell },
        { id: "security" as const, label: "API Keys & Security", icon: Key },
      ],
    },
    {
      group: "HELP & ABOUT",
      items: [
        { id: "help" as const, label: "Help & Support", icon: HelpCircle },
        { id: "about" as const, label: "About TrustScore", icon: Shield },
      ],
    },
  ];

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Business Settings &amp; Configuration"
        subtitle="Manage brand identity, workspace team permissions, subscription quotas, and API access"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Sidebar */}
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-6 shadow-md">
            {navigationSections.map((group) => (
              <div key={group.group} className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block">
                  {group.group}
                </span>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer text-left ${
                          isActive
                            ? "bg-blue-600 text-white font-bold shadow-xs"
                            : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Business Account */}
            {activeSection === "account" && (
              <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-6">
                <div className="pb-4 border-b border-slate-800">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <span>Business Account Overview</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Primary organization account identifier and credentials
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={user?.name || "Acme Brand"}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Primary Contact Email
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={user?.email || "business@domain.com"}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Account Type
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="Business / Brand Organization"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Account Identifier
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={user?.id || ""}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono text-xs select-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Company Profile */}
            {activeSection === "profile" && (
              <form
                onSubmit={handleSaveProfile}
                className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-6"
              >
                <div className="pb-4 border-b border-slate-800">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-400" />
                    <span>Public Brand Profile</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Information visible to creators when you send collaboration requests
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Brand / Company Display Name
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Industry Vertical
                      </label>
                      <select
                        value={companyCategory}
                        onChange={(e) => setCompanyCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs font-semibold focus:outline-hidden"
                      >
                        <option value="Fitness & Nutrition">Fitness &amp; Nutrition</option>
                        <option value="Beauty & Wellness">Beauty &amp; Wellness</option>
                        <option value="Fashion & Apparel">Fashion &amp; Apparel</option>
                        <option value="Technology & Software">Technology &amp; Software</option>
                        <option value="Food & Beverage">Food &amp; Beverage</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Official Website URL
                      </label>
                      <input
                        type="text"
                        required
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Company Bio &amp; Collaboration Focus
                    </label>
                    <textarea
                      rows={3}
                      value={companyBio}
                      onChange={(e) => setCompanyBio(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs font-semibold focus:outline-hidden focus:border-blue-500 leading-relaxed"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* 3. Team Members */}
            {activeSection === "team" && (
              <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-6">
                <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-400" />
                      <span>Workspace Team Members</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Collaborate with media planners, campaign directors, and analysts
                    </p>
                  </div>
                </div>

                {/* Add Member Form */}
                <form onSubmit={handleInviteMember} className="flex items-center gap-2">
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@yourbrand.com"
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 font-semibold"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Invite Member</span>
                  </button>
                </form>

                {/* Team List */}
                <div className="divide-y divide-slate-800/60 pt-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                        />
                        <div>
                          <strong className="text-slate-100 font-bold text-xs block">{member.name}</strong>
                          <span className="text-[11px] text-slate-400">{member.email}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-semibold text-[11px]">
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Subscription Plan */}
            {activeSection === "subscription" && (
              <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-6">
                <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                      <span>SaaS Subscription Tier</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Manage monthly audit limits and team seat allocation
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full">
                    Active Subscription
                  </span>
                </div>

                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Current Plan</span>
                      <h4 className="text-xl font-black text-slate-100">Growth Plan ($249/mo)</h4>
                    </div>
                    <Link
                      href="/dashboard/billing"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      Change Plan
                    </Link>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Includes 50 creator authenticity checks per month, unlimited saved creators, and priority Bayesian fraud detection.
                  </p>
                </div>
              </div>
            )}

            {/* 5. Usage & Limits */}
            {activeSection === "usage" && (
              <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-6">
                <div className="pb-4 border-b border-slate-800">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <span>Monthly Usage &amp; Quotas</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time quota tracking for creator authenticity audits
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span className="text-slate-300">Creator Authenticity Audits Used</span>
                      <span className="text-blue-400">13 / 50 used (37 remaining)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: "26%" }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Next Quota Reset</span>
                      <strong className="text-slate-200">September 30, 2026</strong>
                    </div>
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Saved Creator Capacity</span>
                      <strong className="text-emerald-400">Unlimited</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Payment History */}
            {activeSection === "invoices" && (
              <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-6">
                <div className="pb-4 border-b border-slate-800">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Download className="w-5 h-5 text-blue-400" />
                    <span>Payment History &amp; Invoices</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Download official VAT receipts and transaction records
                  </p>
                </div>

                <div className="divide-y divide-slate-800/60 text-xs">
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-200 block">Growth Plan Subscription ($249.00)</strong>
                      <span className="text-[11px] text-slate-500">August 1, 2026 • Stripe #INV-82910</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-[11px] font-semibold cursor-pointer"
                    >
                      Receipt PDF
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 7. Notifications */}
            {activeSection === "notifications" && (
              <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-6">
                <div className="pb-4 border-b border-slate-800">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-400" />
                    <span>Communication &amp; Alerts</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure event triggers and platform email notifications
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <label className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
                    <div>
                      <strong className="text-slate-200 block">Collaboration Proposal Updates</strong>
                      <span className="text-[11px] text-slate-400">Receive alerts when a creator accepts or messages about an offer.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyProposals}
                      onChange={(e) => setNotifyProposals(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
                    <div>
                      <strong className="text-slate-200 block">Monthly Quota Threshold Warning</strong>
                      <span className="text-[11px] text-slate-400">Alert team members when remaining checks fall below 10%.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyQuota}
                      onChange={(e) => setNotifyQuota(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* 8. API Keys & Security */}
            {activeSection === "security" && (
              <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-6">
                <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <Key className="w-5 h-5 text-blue-400" />
                      <span>REST API Access &amp; Webhooks</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Connect TrustScore directly to internal CRM pipelines
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 font-bold text-[11px] rounded-full border border-emerald-500/20">
                    Active Key
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Live Production Secret Key
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={apiKey}
                        className="w-full px-3.5 py-2.5 bg-slate-950 font-mono text-xs text-slate-200 rounded-xl border border-slate-800 select-all"
                      />
                      <button
                        type="button"
                        onClick={handleCopyKey}
                        className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleGenerateKey}
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Roll / Regenerate Secret Key</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 9. Help & Support */}
            {activeSection === "help" && (
              <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-6">
                <div className="pb-4 border-b border-slate-800">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-blue-400" />
                    <span>Help &amp; Enterprise Support</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Dedicated account management and API integration resources
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <strong className="text-slate-200 block font-bold">API Documentation</strong>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      Access REST endpoints for creator authenticity lookups and webhook payloads.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <strong className="text-slate-200 block font-bold">Enterprise Concierge</strong>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      Direct communication channel with TrustScore campaign specialists.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 10. About */}
            {activeSection === "about" && (
              <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-6">
                <div className="pb-4 border-b border-slate-800">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <span>About TrustScore Platform</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Production Data Science Engine v1.2
                  </p>
                </div>

                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <p>
                    TrustScore connects businesses and authentic creators with probabilistic integrity guarantees. By screening out artificial engagement pods, bot clusters, and step-jump follower spikes, TrustScore eliminates marketing waste and protects sponsorship investments.
                  </p>
                  <div className="pt-2 flex items-center gap-4 text-slate-400">
                    <Link href="/terms" className="hover:text-slate-200 underline">Terms of Service</Link>
                    <Link href="/privacy" className="hover:text-slate-200 underline">Privacy Policy</Link>
                    <Link href="/methodology" className="hover:text-slate-200 underline">Scoring Methodology</Link>
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
