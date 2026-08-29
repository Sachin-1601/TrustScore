"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MOCK_INFLUENCERS } from "@/data/mockInfluencers";
import { RiskBadge } from "@/components/common/RiskBadge";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import { Modal } from "@/components/common/Modal";
import {
  FileText,
  Download,
  Share2,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  Calendar,
  Sparkles,
  Printer,
  Check,
} from "lucide-react";

export default function ReportsHubPage() {
  const [reports, setReports] = useState(
    MOCK_INFLUENCERS.slice(0, 6).map((inf, i) => ({
      id: `rep-${inf.id}`,
      influencer: inf,
      title: `${inf.username} Influencer Authenticity Report`,
      generatedAt: `2026-08-${28 - i}T10:00:00Z`,
      type: "Full Authenticity Audit",
      status: "Ready",
    }))
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCreatorId, setSelectedCreatorId] = useState("alexfitness");
  const [includePrescriptive, setIncludePrescriptive] = useState(true);
  const [includeCommentDump, setIncludeCommentDump] = useState(true);

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const match = MOCK_INFLUENCERS.find((inf) => inf.id === selectedCreatorId) || MOCK_INFLUENCERS[0];
    const newReport = {
      id: `rep-${Date.now()}`,
      influencer: match,
      title: `${match.username} Custom Campaign Audit`,
      generatedAt: new Date().toISOString(),
      type: "Custom Campaign Audit",
      status: "Ready",
    };
    setReports([newReport, ...reports]);
    setIsCreateModalOpen(false);
  };

  const handleDeleteReport = (id: string) => {
    setReports(reports.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      <DashboardHeader
        title="Reports Hub"
        subtitle="Export, share, and manage stakeholder-ready authenticity audit dossiers"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Top Action Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Generated Campaign Audits &amp; Dossiers
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Download high-res PDF summaries or create shareable live presentation links.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Report</span>
          </button>
        </div>

        {/* Reports Table Grid */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-5">Report Title</th>
                  <th className="py-3.5 px-5">Target Creator</th>
                  <th className="py-3.5 px-5">TrustScore</th>
                  <th className="py-3.5 px-5">Risk Tier</th>
                  <th className="py-3.5 px-5">Date Generated</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50 transition-colors">
                    {/* Title */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{rep.title}</span>
                          <span className="text-[10px] text-slate-400">{rep.type}</span>
                        </div>
                      </div>
                    </td>

                    {/* Creator */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <img
                          src={rep.influencer.avatar}
                          alt={rep.influencer.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="font-bold text-slate-800">{rep.influencer.username}</span>
                        <PlatformIcon platform={rep.influencer.platform} size="sm" />
                      </div>
                    </td>

                    {/* TrustScore */}
                    <td className="py-4 px-5 font-extrabold text-blue-700 text-sm">
                      {rep.influencer.trustScore} / 100
                    </td>

                    {/* Risk */}
                    <td className="py-4 px-5">
                      <RiskBadge risk={rep.influencer.riskLevel} size="sm" />
                    </td>

                    {/* Date */}
                    <td className="py-4 px-5 text-slate-500 font-medium">
                      {new Date(rep.generatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/influencer/${rep.influencer.id}`}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Live Report"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => window.print()}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Print / Save PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReport(rep.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Custom Report Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Generate Influencer Authenticity Report"
        description="Select a creator and configure dossier modules for brand presentation."
      >
        <form onSubmit={handleCreateReport} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Select Creator Profile
            </label>
            <select
              value={selectedCreatorId}
              onChange={(e) => setSelectedCreatorId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden"
            >
              {MOCK_INFLUENCERS.map((inf) => (
                <option key={inf.id} value={inf.id}>
                  {inf.username} ({inf.name} • {inf.category} • TrustScore {inf.trustScore})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Included Report Modules:
            </span>
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includePrescriptive}
                onChange={(e) => setIncludePrescriptive(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>Prescriptive Rate Adjustment &amp; Contract Mitigation Checklist</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCommentDump}
                onChange={(e) => setIncludeCommentDump(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>Comment Lexical Diversity &amp; Bot Pod Anomaly Feed</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <FileText className="w-4 h-4" />
            <span>Compile &amp; Save Report</span>
          </button>
        </form>
      </Modal>
    </div>
  );
}
