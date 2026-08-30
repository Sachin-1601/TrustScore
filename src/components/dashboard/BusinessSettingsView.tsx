"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import {
  Key,
  Users,
  Shield,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Building2,
  Mail,
} from "lucide-react";

export function BusinessSettingsView() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState("ts_live_9f823a4b910e14c778f2aa90");
  const [copiedKey, setCopiedKey] = useState(false);
  const [lowRiskThreshold, setLowRiskThreshold] = useState(75);
  const [highRiskThreshold, setHighRiskThreshold] = useState(50);
  const [isSaved, setIsSaved] = useState(false);

  const teamMembers = [
    {
      name: user?.name || "Business Account Owner",
      email: user?.email || "owner@business.com",
      role: "Account Owner (Admin)",
      avatar: user?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80",
    },
  ];

  const handleCopyKey = () => {
    navigator.clipboard?.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleGenerateKey = () => {
    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    setApiKey(`ts_live_${randomHex}`);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Settings & Workspace Configuration"
        subtitle="Manage API keys, team member permissions, and scoring threshold bands"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Workspace & Account Profile */}
        <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span>Business Account Profile</span>
              </h3>
              <p className="text-xs text-slate-400">
                Your brand identity in the creator marketplace
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Company / Organization Name
              </label>
              <input
                type="text"
                readOnly
                value={user?.name || "Business Brand"}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Primary Account Email
              </label>
              <input
                type="text"
                readOnly
                value={user?.email || "business@domain.com"}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* REST API Access Card */}
        <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-400" />
                <span>REST API Access &amp; Webhooks</span>
              </h3>
              <p className="text-xs text-slate-400">
                Connect TrustScore directly to your internal CRM or media planning pipeline
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
              <p className="text-[11px] text-slate-500 mt-1">
                Keep this key confidential. Never expose it in client-side code repositories.
              </p>
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

        {/* Team Members */}
        <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>Workspace Team Members</span>
              </h3>
              <p className="text-xs text-slate-400">
                Manage role-based access for media planners and analysts
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-800/60">
            {teamMembers.map((member) => (
              <div key={member.email} className="py-3.5 flex items-center justify-between">
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
      </div>
    </div>
  );
}
