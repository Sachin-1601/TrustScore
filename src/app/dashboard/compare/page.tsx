"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Creator } from "@/types/creator";
import { RiskBadge } from "@/components/common/RiskBadge";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import { formatNumber } from "@/lib/utils";
import {
  Scale,
  X,
  Sparkles,
  Loader2,
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

  const [availableCreators, setAvailableCreators] = useState<Creator[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch all creators from API
  useEffect(() => {
    async function loadCreators() {
      try {
        const res = await fetch("/api/creators");
        if (res.ok) {
          const data = await res.json();
          const list: Creator[] = data.creators || [];
          setAvailableCreators(list);

          const idsParam = searchParams.get("ids") || searchParams.get("c1");
          let initial: string[] = [];
          if (idsParam) {
            initial = idsParam.split(",").concat(searchParams.get("c2") ? [searchParams.get("c2")!] : []);
          } else if (list.length >= 2) {
            initial = [list[0].id, list[1].id];
          }
          setSelectedIds(initial);
        }
      } catch {
        // Network error
      } finally {
        setIsLoading(false);
      }
    }
    loadCreators();
  }, [searchParams]);

  const activeInfluencers = selectedIds
    .map((id) => availableCreators.find((inf) => inf.id === id || inf.username.replace("@", "") === id))
    .filter(Boolean) as Creator[];

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
    { subject: "Follower Quality", key: "followerAuthenticity", fallback: 90 },
    { subject: "Engagement Authenticity", key: "engagementAuthenticity", fallback: 85 },
    { subject: "Comment Diversity", key: "commentQuality", fallback: 88 },
    { subject: "Growth Stability", key: "growthPattern", fallback: 92 },
    { subject: "Consistency", key: "engagementConsistency", fallback: 90 },
  ];

  const radarChartData = radarDimensions.map((dim) => {
    const dataPoint: any = { subject: dim.subject };
    activeInfluencers.forEach((inf) => {
      const sub = (inf.subScores as any)?.[dim.key] || dim.fallback;
      dataPoint[inf.username] = sub;
    });
    return dataPoint;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Creator Selector Pills */}
      <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-slate-100">
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
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-hidden"
            >
              <option value="">+ Add creator...</option>
              {availableCreators
                .filter((inf) => !selectedIds.includes(inf.id))
                .map((inf) => (
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
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: radarColors[idx] }} />
              <span>{inf.username}</span>
              <span className="text-slate-400 font-normal">({inf.trustScore}/100)</span>
              <button
                onClick={() => handleRemove(inf.id)}
                className="text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer"
                title="Remove from comparison"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-xs font-semibold">Loading comparative matrix...</span>
        </div>
      ) : activeInfluencers.length < 2 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <Scale className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">Select at least 2 creators to compare</h3>
          <p className="text-xs text-slate-400">Use the selector above or browse the marketplace to add creators.</p>
        </div>
      ) : (
        <>
          {/* 5-Dimension Radar Comparison Chart */}
          <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  5-Dimension Multi-Dimensional Radar Comparison
                </h3>
                <p className="text-xs text-slate-400">
                  Evaluates strengths and vulnerabilities across all sub-score vectors simultaneously
                </p>
              </div>
            </div>

            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={10} />
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
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "1px solid #334155", color: "#f8fafc" }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comparative Matrix Table */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-md overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-100">
                Comparative Metrics Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Side-by-side evaluation against key authenticity and risk benchmarks
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-5 w-48">Metric / Dimension</th>
                    {activeInfluencers.map((inf) => (
                      <th key={inf.id} className="py-4 px-5 min-w-[200px]">
                        <div className="flex items-center gap-2.5">
                          <img src={inf.avatar} alt={inf.name} className="w-9 h-9 rounded-xl object-cover border border-slate-700" />
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-slate-100 text-sm">{inf.username}</span>
                              <PlatformIcon platform={inf.platform} size="sm" />
                            </div>
                            <span className="text-[11px] text-slate-400 font-normal">{inf.category}</span>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-400">TrustScore (0-100)</td>
                    {activeInfluencers.map((inf) => (
                      <td key={inf.id} className="py-3.5 px-5">
                        <span className="font-extrabold text-blue-400 text-sm">{inf.trustScore}</span>
                        <span className="text-[10px] text-slate-500">/100</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-400">Authenticity Probability</td>
                    {activeInfluencers.map((inf) => (
                      <td key={inf.id} className="py-3.5 px-5 font-bold text-emerald-400">
                        {inf.authenticityProbability ? `${inf.authenticityProbability}%` : `${100 - inf.inflatedEngagementProbability}%`}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-400">Followers</td>
                    {activeInfluencers.map((inf) => (
                      <td key={inf.id} className="py-3.5 px-5 font-bold text-slate-200">
                        {formatNumber(inf.followers)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-400">Engagement Rate</td>
                    {activeInfluencers.map((inf) => (
                      <td key={inf.id} className="py-3.5 px-5 font-bold text-blue-400">
                        {inf.engagementRate}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-400">Est. Starting Rate</td>
                    {activeInfluencers.map((inf) => (
                      <td key={inf.id} className="py-3.5 px-5 font-bold text-emerald-400">
                        ${inf.startingRate}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader
        title="Side-by-Side Creator Comparison"
        subtitle="Benchmark multiple creators simultaneously against core Bayesian risk factors"
      />
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading comparison matrix...</div>}>
        <CompareContent />
      </Suspense>
    </div>
  );
}
