"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Creator } from "@/types/creator";
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
  Loader2,
} from "lucide-react";

interface ReportItem {
  id: string;
  creator: Creator;
  title: string;
  generatedAt: string;
  type: string;
  status: string;
}

export default function ReportsHubPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCreatorId, setSelectedCreatorId] = useState("");
  const [includePrescriptive, setIncludePrescriptive] = useState(true);

  useEffect(() => {
    async function loadReportsData() {
      try {
        const res = await fetch("/api/creators");
        if (res.ok) {
          const data = await res.json();
          const list: Creator[] = data.creators || [];
          setCreators(list);
          if (list.length > 0) {
            setSelectedCreatorId(list[0].id);
            setReports(
              list.slice(0, 4).map((c, i) => ({
                id: `rep-${c.id}`,
                creator: c,
                title: `${c.username} Authenticity Audit Dossier`,
                generatedAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
                type: "Full Authenticity Audit",
                status: "Ready",
              }))
            );
          }
        }
      } catch {
        // Error
      } finally {
        setIsLoading(false);
      }
    }
    loadReportsData();
  }, []);

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const match = creators.find((c) => c.id === selectedCreatorId) || creators[0];
    if (!match) return;

    const newReport: ReportItem = {
      id: `rep-${Date.now()}`,
      creator: match,
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
    <div className="min-h-full flex flex-col bg-[#f8f9fb] text-slate-900">
      <DashboardHeader
        title="Reports Hub"
        subtitle="Export, share, and manage stakeholder-ready authenticity audit dossiers"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Top Action Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Audit Report</span>
          </button>
        </div>

        {/* Reports Table List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs font-semibold text-slate-500">Loading generated reports...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No reports generated yet</h3>
            <p className="text-xs text-slate-500">Click &quot;Generate New Audit Report&quot; above to create a dossier for any creator.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-6">Creator &amp; Audit Name</th>
                    <th className="py-4 px-6">Audit Type</th>
                    <th className="py-4 px-6">Generated Date</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={report.creator.avatar}
                            alt={report.creator.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">{report.title}</span>
                            <span className="text-[11px] text-slate-500">
                              {report.creator.username} • TrustScore {report.creator.trustScore}/100
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-700 font-medium">{report.type}</td>
                      <td className="py-4 px-6 text-slate-500">
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {report.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/creators/${report.creator.id}`}
                            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Creator Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Print / Save PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Generate Authenticity Audit Dossier"
        >
          <form onSubmit={handleCreateReport} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1">
                Select Creator Candidate
              </label>
              <select
                value={selectedCreatorId}
                onChange={(e) => setSelectedCreatorId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-hidden focus:border-blue-600 focus:bg-white"
              >
                {creators.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.username} — {c.name} ({c.category} • TrustScore {c.trustScore})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={includePrescriptive}
                  onChange={(e) => setIncludePrescriptive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Include prescriptive rate adjustments and risk checklist</span>
              </label>
            </div>

            <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Generate Report
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
