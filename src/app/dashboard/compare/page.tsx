"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MOCK_INFLUENCERS } from "@/data/mockInfluencers";
import { Influencer } from "@/types/influencer";
import { RiskBadge } from "@/components/common/RiskBadge";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import { formatNumber, getScoreColor } from "@/lib/utils";
import {
  Scale,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get initial creator IDs from URL or default
  const idsParam = searchParams.get("ids") || searchParams.get("c1");
  const initialIds = idsParam
    ? idsParam.split(",").concat(searchParams.get("c2") ? [searchParams.get("c2")!] : [])
    : ["alexfitness", "beautybymia", "jordantravel"];

  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);

  const activeInfluencers: Influencer[] = selectedIds
    .map((id) => MOCK_INFLUENCERS.find((inf) => inf.id === id || inf.username.replace("@", "") === id))
    .filter(Boolean) as Influencer[];

  const handleRemove = (id: string) => {
    if (selectedIds.length <= 2) {
      alert("At least 2 creators are required for comparison.");
      return;
    }
    setSelectedIds(selectedIds.filter((item) => item !== id));
  };

  const handleAddCreator = (id: string) => {
    if (selectedIds.includes(id)) return;
    if (selectedIds.length >= 4) {
      alert("Maximum 4 creators can be compared side-by-side.");
      return;
    }
    setSelectedIds([...selectedIds, id]);
  };

  const radarColors = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6"];

  const radarDimensions = [
    { subject: "Follower Quality", key: "followerAuthenticity" },
    { subject: "Engagement Authenticity", key: "engagementAuthenticity" },
    { subject: "Comment Diversity", key: "commentQuality" },
    { subject: "Growth Stability", key: "growthPattern" },
    { subject: "Consistency", key: "engagementConsistency" },
  ];

  const radarChartData = radarDimensions.map((dim) => {
    const dataPoint: any = { subject: dim.subject };
    activeInfluencers.forEach((inf) => {
      dataPoint[inf.username] = (inf.subScores as any)[dim.key];
    });
    return dataPoint;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Creator Selector Pills */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Comparing {activeInfluencers.length} Creators
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Add to matrix:</span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddCreator(e.target.value);
                  e.target.value = "";
                }
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="">+ Add creator...</option>
              {MOCK_INFLUENCERS.filter((inf) => !selectedIds.includes(inf.id)).map((inf) => (
                <option key={inf.id} value={inf.id}>
                  {inf.username} ({inf.category} • {inf.trustScore}/100)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Creator Chips */}
        <div className="flex flex-wrap gap-2.5 pt-1">
          {activeInfluencers.map((inf, idx) => (
            <div
              key={inf.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: radarColors[idx] }} />
              <span>{inf.username}</span>
              <span className="text-slate-400 font-normal">({inf.trustScore}/100)</span>
              <button
                onClick={() => handleRemove(inf.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
                title="Remove from comparison"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5-Dimension Radar Comparison Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              5-Dimension Multi-Dimensional Radar Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Evaluates strengths and vulnerabilities across all sub-score vectors simultaneously
            </p>
          </div>
        </div>

        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={11} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={10} />
              {activeInfluencers.map((inf, idx) => (
                <Radar
                  key={inf.id}
                  name={inf.username}
                  dataKey={inf.username}
                  stroke={radarColors[idx]}
                  fill={radarColors[idx]}
                  fillOpacity={0.2}
                />
              ))}
              <Legend />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparative Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            Comparative Metrics Matrix
          </h3>
          <p className="text-xs text-slate-500">
            Side-by-side evaluation against key authenticity and risk benchmarks
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-4 px-5 w-48">Metric / Dimension</th>
                {activeInfluencers.map((inf) => (
                  <th key={inf.id} className="py-4 px-5 min-w-[200px]">
                    <div className="flex items-center gap-2.5">
                      <img src={inf.avatar} alt={inf.name} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-900 text-sm">{inf.username}</span>
                          <PlatformIcon platform={inf.platform} size="sm" />
                        </div>
                        <span className="text-[11px] text-slate-400">{inf.category}</span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="bg-slate-50/40">
                <td className="py-3.5 px-5 font-bold text-slate-900">TrustScore (0–100)</td>
                {activeInfluencers.map((inf) => (
                  <td key={inf.id} className="py-3.5 px-5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-extrabold text-slate-900">{inf.trustScore}</span>
                      <span className="text-xs font-semibold text-slate-400">/ 100</span>
                    </div>
                    <RiskBadge risk={inf.riskLevel} size="sm" className="mt-1" />
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3.5 px-5 font-semibold text-slate-700">Inflated Risk Probability</td>
                {activeInfluencers.map((inf) => (
                  <td key={inf.id} className="py-3.5 px-5 font-bold text-slate-900">
                    <span className={inf.inflatedEngagementProbability > 40 ? "text-rose-600" : "text-emerald-700"}>
                      {inf.inflatedEngagementProbability}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal ml-1">
                      (±{inf.uncertaintyMargin}%)
                    </span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3.5 px-5 font-semibold text-slate-700">Followers Count</td>
                {activeInfluencers.map((inf) => (
                  <td key={inf.id} className="py-3.5 px-5 font-bold text-slate-900">
                    {formatNumber(inf.followers)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3.5 px-5 font-semibold text-slate-700">Engagement Rate</td>
                {activeInfluencers.map((inf) => (
                  <td key={inf.id} className="py-3.5 px-5 font-bold text-slate-900">
                    {inf.engagementRate}%
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3.5 px-5 font-semibold text-slate-700">Comment Diversity</td>
                {activeInfluencers.map((inf) => (
                  <td key={inf.id} className="py-3.5 px-5 font-semibold text-slate-800">
                    {inf.commentQuality.uniqueCommentsPercent}% Unique
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3.5 px-5 font-semibold text-slate-700">Volatility Index (Stability)</td>
                {activeInfluencers.map((inf) => (
                  <td key={inf.id} className="py-3.5 px-5 font-semibold text-slate-800">
                    {inf.engagementVolatilityIndex} {inf.engagementVolatilityIndex < 20 ? "(Very Stable)" : "(Erratic)"}
                  </td>
                ))}
              </tr>

              <tr className="bg-blue-50/30">
                <td className="py-3.5 px-5 font-bold text-blue-900">Recommended Action</td>
                {activeInfluencers.map((inf) => (
                  <td key={inf.id} className="py-3.5 px-5">
                    <p className="font-bold text-slate-900 leading-snug">
                      {inf.prescriptiveGuidance.primaryRecommendation}
                    </p>
                    <p className="text-[11px] text-blue-700 font-semibold mt-1">
                      Adjustment: {inf.prescriptiveGuidance.recommendedPaymentAdjustment}
                    </p>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3.5 px-5 font-semibold text-slate-500">Report Link</td>
                {activeInfluencers.map((inf) => (
                  <td key={inf.id} className="py-3.5 px-5">
                    <Link
                      href={`/dashboard/influencer/${inf.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      <span>View Full Breakdown</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      <DashboardHeader
        title="Multi-Influencer Comparison"
        subtitle="Side-by-side probabilistic authenticity & risk intelligence matrix"
      />
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading comparison matrix...</div>}>
        <CompareContent />
      </Suspense>
    </div>
  );
}
