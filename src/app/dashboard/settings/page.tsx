"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  Settings,
  Key,
  Users,
  Shield,
  Bell,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Lock,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("ts_live_9f823a4b910e14c778f2aa90");
  const [copiedKey, setCopiedKey] = useState(false);
  const [lowRiskThreshold, setLowRiskThreshold] = useState(75);
  const [highRiskThreshold, setHighRiskThreshold] = useState(50);
  const [isSaved, setIsSaved] = useState(false);

  const teamMembers = [
    { name: "Sarah Jenkins", email: "sarah@acmebrand.com", role: "Brand Director (Admin)", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80" },
    { name: "David Kim", email: "david.k@acmebrand.com", role: "Media Planner", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80" },
    { name: "Elena Rostova", email: "elena@acmebrand.com", role: "Audience Analyst", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" },
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
    <div className="min-h-full flex flex-col bg-slate-50">
      <DashboardHeader
        title="Settings & Workspace Configuration"
        subtitle="Manage API keys, team member permissions, and scoring threshold bands"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Workspace & API Access Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                <span>REST API Access &amp; Webhooks</span>
              </h3>
              <p className="text-xs text-slate-500">
                Connect TrustScore directly to your internal CRM, media planning software, or Zapier
              </p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[11px] rounded-full border border-emerald-200">
              Active Key
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Live Production Secret Key
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={apiKey}
                  className="w-full px-3.5 py-2.5 bg-slate-50 font-mono text-xs text-slate-800 rounded-xl border border-slate-300 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey ? "Copied" : "Copy Key"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleGenerateKey}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors shrink-0 cursor-pointer"
                  title="Roll new API Key"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
              <span className="font-semibold text-slate-800">Quick cURL Example:</span>
              <pre className="p-2.5 bg-slate-900 text-slate-200 rounded-lg text-[11px] overflow-x-auto font-mono">
                {`curl -X POST https://api.trustscore.io/v1/analyze \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{"handle": "@alexfitness", "platform": "instagram"}'`}
              </pre>
            </div>
          </div>
        </div>

        {/* Custom Scoring Bands Thresholds */}
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <span>Custom Brand Risk Thresholds</span>
              </h3>
              <p className="text-xs text-slate-500">
                Configure when your marketing team receives high-risk notifications
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>High Trust Minimum Threshold:</span>
                <span className="text-emerald-700 font-bold">{lowRiskThreshold} / 100</span>
              </div>
              <input
                type="range"
                min="60"
                max="90"
                value={lowRiskThreshold}
                onChange={(e) => setLowRiskThreshold(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Creators above this score qualify for instant campaign approval.</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Moderate Risk Boundary:</span>
                <span className="text-amber-700 font-bold">{highRiskThreshold} / 100</span>
              </div>
              <input
                type="range"
                min="30"
                max="60"
                value={highRiskThreshold}
                onChange={(e) => setHighRiskThreshold(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Creators below this score require mandatory fee discount negotiation.</p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            {isSaved ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" />
                Thresholds saved successfully!
              </span>
            ) : (
              <span className="text-xs text-slate-400">Changes apply immediately across your workspace.</span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </form>

        {/* Team Members Management */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Team Members ({teamMembers.length})</span>
              </h3>
              <p className="text-xs text-slate-500">Collaborate with media planners, data scientists, and campaign leads</p>
            </div>
            <button
              type="button"
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invite Member</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {teamMembers.map((member) => (
              <div key={member.email} className="py-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <span className="font-bold text-slate-900 block">{member.name}</span>
                    <span className="text-slate-400">{member.email}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg text-[11px]">
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
