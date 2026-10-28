"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { formatETB } from "@/lib/sales";
import { CampaignAnalyticsResponse } from "@/lib/analytics";
import { getEffectiveStatus, getStatusBadgeConfig } from "@/lib/lifecycle";
import {
  sortCampaigns,
  calculateCohortBenchmarks,
  compareTwoCampaigns,
  getChannelBreakdown,
  CampaignComparisonSortField,
  SortOrder,
} from "@/lib/comparison";
import {
  TrendingUp,
  ArrowUpDown,
  Award,
  Sparkles,
  ArrowRight,
  Info,
  Scale,
  Table as TableIcon,
} from "lucide-react";

interface CampaignComparisonMatrixProps {
  campaigns: CampaignAnalyticsResponse[];
  brandName: string;
  onSelectCampaign?: (campaignId: string) => void;
}

export function CampaignComparisonMatrix({
  campaigns,
  brandName,
  onSelectCampaign,
}: CampaignComparisonMatrixProps) {
  const [sortField, setSortField] = useState<CampaignComparisonSortField>("revenue");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [viewMode, setViewMode] = useState<"table" | "compare">("table");

  // Selection for head-to-head comparison
  const [compareIdA, setCompareIdA] = useState<string>(
    campaigns[0]?.campaignId || ""
  );
  const [compareIdB, setCompareIdB] = useState<string>(
    campaigns[1]?.campaignId || campaigns[0]?.campaignId || ""
  );

  const benchmarks = useMemo(() => calculateCohortBenchmarks(campaigns), [campaigns]);

  const sortedCampaigns = useMemo(
    () => sortCampaigns(campaigns, sortField, sortOrder),
    [campaigns, sortField, sortOrder]
  );

  const campaignA = useMemo(
    () => campaigns.find((c) => c.campaignId === compareIdA) || campaigns[0],
    [campaigns, compareIdA]
  );

  const campaignB = useMemo(
    () => campaigns.find((c) => c.campaignId === compareIdB) || campaigns[1] || campaigns[0],
    [campaigns, compareIdB]
  );

  const headToHead = useMemo(() => {
    if (!campaignA || !campaignB) return null;
    return compareTwoCampaigns(campaignA, campaignB);
  }, [campaignA, campaignB]);

  const toggleSort = (field: CampaignComparisonSortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  if (campaigns.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
          <Scale className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-headline font-bold text-base text-slate-900 dark:text-white">
            Comparative Campaign Matrix
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            No active campaigns found. Create campaigns to unlock cross-campaign cohort benchmarking, efficiency ratios, and omnichannel performance analysis.
          </p>
        </div>
        <Link
          href="/brand/campaigns/new"
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          <span>+ Create First Campaign</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Matrix Header & Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
                PRD FR-031 Benchmarking
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                {campaigns.length} Active Campaigns
              </span>
            </div>
            <h2 className="font-headline font-bold text-lg text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Comparative Performance Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Side-by-side performance benchmarking across funnel stages, efficiency rates, and channel distribution
            </p>
          </div>

          {/* Controls: Mode Switcher & Sort Selector */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-semibold">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Full Matrix</span>
              </button>

              <button
                onClick={() => setViewMode("compare")}
                disabled={campaigns.length < 2}
                title={campaigns.length < 2 ? "Requires at least 2 campaigns to compare" : "Head-to-head comparison"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  viewMode === "compare"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Head-to-Head (1 vs 1)</span>
              </button>
            </div>

            {/* Sort Selector (Active in Table Mode) */}
            {viewMode === "table" && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">Sort:</span>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as CampaignComparisonSortField)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="revenue">Gross Revenue (ETB)</option>
                  <option value="conversionRate">Conversion Rate (CVR %)</option>
                  <option value="clickThroughRate">Click-Through Rate (CTR %)</option>
                  <option value="salesCount">Total Redemptions</option>
                  <option value="pageViews">Page Views</option>
                  <option value="aov">Average Order Value (AOV)</option>
                </select>

                <button
                  onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                  className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  title={`Sort ${sortOrder === "desc" ? "Ascending" : "Descending"}`}
                  aria-label="Toggle sort order"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cohort Benchmarks Highlights Grid (When 2+ campaigns exist) */}
        {campaigns.length >= 2 && benchmarks.topConvertingCampaign && benchmarks.revenueLeader && (
          <div className="pt-5 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Cohort Benchmark Leaders ({brandName})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Leader 1: Top CVR */}
              <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                    Top Converting (CVR)
                  </span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[160px] mt-0.5">
                    {benchmarks.topConvertingCampaign.campaignName}
                  </div>
                  <div className="text-xs font-mono font-black text-indigo-700 dark:text-indigo-300 mt-1">
                    {benchmarks.topConvertingCampaign.salesConversionRate}% CVR
                    <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 ml-1">
                      (avg {benchmarks.averageConversionRate}%)
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                  %
                </div>
              </div>

              {/* Leader 2: Revenue Leader */}
              <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Gross Revenue Leader
                  </span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[160px] mt-0.5">
                    {benchmarks.revenueLeader.campaignName}
                  </div>
                  <div className="text-xs font-mono font-black text-emerald-700 dark:text-emerald-300 mt-1">
                    {formatETB(benchmarks.revenueLeader.totalRevenueETB)}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                  ETB
                </div>
              </div>

              {/* Leader 3: Highest AOV */}
              {benchmarks.highestAovCampaign && (
                <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      Highest Basket (AOV)
                    </span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[160px] mt-0.5">
                      {benchmarks.highestAovCampaign.campaignName}
                    </div>
                    <div className="text-xs font-mono font-black text-amber-700 dark:text-amber-300 mt-1">
                      {formatETB(benchmarks.highestAovCampaign.aovETB)}
                      <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 ml-1">
                        (avg {formatETB(benchmarks.averageAovETB)})
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Leader 4: Highest CTR */}
              {benchmarks.highestCtrCampaign && (
                <div className="p-3.5 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                      Top Engagement (CTR)
                    </span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[160px] mt-0.5">
                      {benchmarks.highestCtrCampaign.campaignName}
                    </div>
                    <div className="text-xs font-mono font-black text-sky-700 dark:text-sky-300 mt-1">
                      {benchmarks.highestCtrCampaign.clickThroughRate}% CTR
                      <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 ml-1">
                        (avg {benchmarks.averageClickThroughRate}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {campaigns.length === 1 && (
          <div className="pt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl mt-4">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-600" />
              Comparative cohort benchmarking activates when 2 or more campaigns are active.
            </span>
            <Link
              href="/brand/campaigns/new"
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              + Add another campaign
            </Link>
          </div>
        )}
      </div>

      {/* VIEW MODE 1: Full Portfolio Matrix Table */}
      {viewMode === "table" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-headline font-bold text-base text-slate-900 dark:text-white">
                Multi-Campaign Efficiency Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Standardized side-by-side comparison across all 5 funnel stages and omnichannel contact preferences
              </p>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Sorted by: <strong className="text-slate-700 dark:text-slate-200 uppercase">{sortField}</strong> ({sortOrder})
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-3 cursor-pointer select-none" onClick={() => toggleSort("revenue")}>
                    Campaign &amp; Code
                  </th>
                  <th className="py-3 px-3 text-right cursor-pointer select-none" onClick={() => toggleSort("pageViews")}>
                    Views &bull; Visitors
                  </th>
                  <th className="py-3 px-3 text-right cursor-pointer select-none" onClick={() => toggleSort("clickThroughRate")}>
                    Action Clicks &bull; CTR
                  </th>
                  <th className="py-3 px-3 text-right cursor-pointer select-none" onClick={() => toggleSort("conversionRate")}>
                    Orders &bull; CVR
                  </th>
                  <th className="py-3 px-3 text-right cursor-pointer select-none" onClick={() => toggleSort("revenue")}>
                    Gross Sales (ETB)
                  </th>
                  <th className="py-3 px-3 text-right cursor-pointer select-none" onClick={() => toggleSort("aov")}>
                    AOV (ETB)
                  </th>
                  <th className="py-3 px-3 text-center">Channel Mix</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  {onSelectCampaign && <th className="py-3 px-2 text-center">View</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedCampaigns.map((camp) => {
                  const channelBreakdown = getChannelBreakdown(camp);
                  const effectiveStatus = getEffectiveStatus(camp);
                  const badge = getStatusBadgeConfig(effectiveStatus);
                  const isTopCvr = benchmarks.topConvertingCampaign?.campaignId === camp.campaignId && campaigns.length > 1;
                  const isRevenueLeader = benchmarks.revenueLeader?.campaignId === camp.campaignId && campaigns.length > 1;

                  return (
                    <tr
                      key={camp.campaignId}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Campaign & Promo Code */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {camp.campaignName}
                          </div>
                          {isRevenueLeader && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                              Top Rev
                            </span>
                          )}
                          {isTopCvr && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                              Top CVR
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono font-bold text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                            {camp.promoCode}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                            /c/{camp.slug}
                          </span>
                        </div>
                      </td>

                      {/* Views & Visitors */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {camp.pageViews.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          {camp.uniqueVisitors.toLocaleString()} unique
                        </div>
                      </td>

                      {/* Actions & CTR */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {camp.totalClicks.toLocaleString()}
                        </div>
                        <div className="text-[11px] font-mono font-semibold text-sky-700 dark:text-sky-400">
                          {camp.clickThroughRate}% CTR
                        </div>
                      </td>

                      {/* Orders & CVR */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {camp.salesCount.toLocaleString()}
                        </div>
                        <div className="text-[11px] font-mono font-bold text-indigo-700 dark:text-indigo-400">
                          {camp.salesConversionRate}% CVR
                        </div>
                      </td>

                      {/* Gross Revenue */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="font-mono font-black text-emerald-700 dark:text-emerald-400">
                          {formatETB(camp.totalRevenueETB)}
                        </div>
                      </td>

                      {/* AOV */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {formatETB(camp.aovETB)}
                        </div>
                      </td>

                      {/* Omnichannel Distribution Bar */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="w-24 mx-auto space-y-1">
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-2xs">
                            {channelBreakdown.telegramPct > 0 && (
                              <div
                                style={{ width: `${channelBreakdown.telegramPct}%` }}
                                className="bg-[#229ED9] h-full"
                                title={`Telegram: ${channelBreakdown.telegramPct}%`}
                              />
                            )}
                            {channelBreakdown.callPct > 0 && (
                              <div
                                style={{ width: `${channelBreakdown.callPct}%` }}
                                className="bg-emerald-500 h-full"
                                title={`Calls: ${channelBreakdown.callPct}%`}
                              />
                            )}
                            {channelBreakdown.mapPct > 0 && (
                              <div
                                style={{ width: `${channelBreakdown.mapPct}%` }}
                                className="bg-indigo-500 h-full"
                                title={`Maps: ${channelBreakdown.mapPct}%`}
                              />
                            )}
                            {channelBreakdown.copyPct > 0 && (
                              <div
                                style={{ width: `${channelBreakdown.copyPct}%` }}
                                className="bg-amber-500 h-full"
                                title={`Codes: ${channelBreakdown.copyPct}%`}
                              />
                            )}
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono">
                            {camp.totalClicks > 0 ? (
                              <span>
                                {channelBreakdown.telegramPct}% TG &bull; {channelBreakdown.callPct}% Call
                              </span>
                            ) : (
                              <span>0 actions</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${badge.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                          {badge.label}
                        </span>
                      </td>

                      {/* Filter/View Action */}
                      {onSelectCampaign && (
                        <td className="py-3.5 px-2 text-center">
                          <button
                            onClick={() => onSelectCampaign(camp.campaignId)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            title="Filter full dashboard to this campaign"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: Head-to-Head (1 vs 1) Comparative Scorecard */}
      {viewMode === "compare" && headToHead && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-headline font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>Head-to-Head Campaign Benchmark</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Direct comparative scorecard across conversion metrics and channel adoption
              </p>
            </div>

            {/* Campaign Selectors */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-emerald-700 dark:text-emerald-400">Campaign A:</span>
                <select
                  value={compareIdA}
                  onChange={(e) => setCompareIdA(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 font-semibold text-slate-800 dark:text-slate-200"
                >
                  {campaigns.map((c) => (
                    <option key={c.campaignId} value={c.campaignId}>
                      {c.campaignName} ({c.promoCode})
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-slate-400 font-bold px-1">VS</span>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-indigo-700 dark:text-indigo-400">Campaign B:</span>
                <select
                  value={compareIdB}
                  onChange={(e) => setCompareIdB(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 font-semibold text-slate-800 dark:text-slate-200"
                >
                  {campaigns.map((c) => (
                    <option key={c.campaignId} value={c.campaignId}>
                      {c.campaignName} ({c.promoCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Metric Comparison Table with Delta Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Box: Campaign A Snapshot */}
            <div className="p-5 rounded-2xl bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/50 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                    Campaign A
                  </span>
                  <div className="font-headline font-black text-base text-slate-900 dark:text-white">
                    {campaignA.campaignName}
                  </div>
                </div>
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                  {campaignA.promoCode}
                </span>
              </div>

              {/* Core Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Gross Sales:</span>
                  <div className="font-mono font-black text-base text-emerald-700 dark:text-emerald-400">
                    {formatETB(campaignA.totalRevenueETB)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Conversion Rate:</span>
                  <div className="font-mono font-black text-base text-slate-900 dark:text-white">
                    {campaignA.salesConversionRate}% CVR
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">In-Store Orders:</span>
                  <div className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                    {campaignA.salesCount} redemptions
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Average Order Value:</span>
                  <div className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                    {formatETB(campaignA.aovETB)}
                  </div>
                </div>
              </div>

              {/* Channel Distribution */}
              <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/40 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500">Channel Share:</span>
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                  <span>TG: <strong>{headToHead.channelsA.telegramPct}%</strong></span>
                  <span>Call: <strong>{headToHead.channelsA.callPct}%</strong></span>
                  <span>Map: <strong>{headToHead.channelsA.mapPct}%</strong></span>
                  <span>Code: <strong>{headToHead.channelsA.copyPct}%</strong></span>
                </div>
              </div>
            </div>

            {/* Right Box: Campaign B Snapshot */}
            <div className="p-5 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/50 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-400">
                    Campaign B
                  </span>
                  <div className="font-headline font-black text-base text-slate-900 dark:text-white">
                    {campaignB.campaignName}
                  </div>
                </div>
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300">
                  {campaignB.promoCode}
                </span>
              </div>

              {/* Core Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Gross Sales:</span>
                  <div className="font-mono font-black text-base text-indigo-700 dark:text-indigo-400">
                    {formatETB(campaignB.totalRevenueETB)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Conversion Rate:</span>
                  <div className="font-mono font-black text-base text-slate-900 dark:text-white">
                    {campaignB.salesConversionRate}% CVR
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">In-Store Orders:</span>
                  <div className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                    {campaignB.salesCount} redemptions
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Average Order Value:</span>
                  <div className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                    {formatETB(campaignB.aovETB)}
                  </div>
                </div>
              </div>

              {/* Channel Distribution */}
              <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500">Channel Share:</span>
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                  <span>TG: <strong>{headToHead.channelsB.telegramPct}%</strong></span>
                  <span>Call: <strong>{headToHead.channelsB.callPct}%</strong></span>
                  <span>Map: <strong>{headToHead.channelsB.mapPct}%</strong></span>
                  <span>Code: <strong>{headToHead.channelsB.copyPct}%</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Granular Metric Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Metric</th>
                  <th className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400">Campaign A</th>
                  <th className="py-2.5 px-3 text-right text-indigo-700 dark:text-indigo-400">Campaign B</th>
                  <th className="py-2.5 px-3 text-right">Differential</th>
                  <th className="py-2.5 px-3 text-center">Leader</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {headToHead.metrics.map((m) => {
                  const formatVal = (v: number) => {
                    if (m.unit === "currency") return formatETB(v);
                    if (m.unit === "percentage") return `${v}%`;
                    return v.toLocaleString();
                  };

                  return (
                    <tr key={m.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {m.label}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatVal(m.valA)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatVal(m.valB)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500 dark:text-slate-400">
                        {m.pctDiff > 0 ? `+${m.pctDiff}%` : `${m.pctDiff}%`}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {m.leader === "A" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            Campaign A
                          </span>
                        )}
                        {m.leader === "B" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            Campaign B
                          </span>
                        )}
                        {m.leader === "TIE" && (
                          <span className="text-[10px] font-medium text-slate-400">
                            Equal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attribution Methodology & Benchmarking Transparency Note (PRD FR-025 / FR-029 / FR-031) */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
        <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed space-y-1">
          <span className="font-bold text-slate-800 dark:text-slate-200 block">
            Benchmarking Methodology &amp; Attribution Disclaimers (PRD FR-031, FR-025, FR-029):
          </span>
          <p>
            Campaigns are compared across standard cumulative timeframes using uniform 15-minute telemetry deduplication. Conversions represent merchant-recorded in-store POS redemptions, not automated bank/card clearance. Event progressions reflect aggregate touchpoint interactions and do not imply 100% deterministic individual consumer journeys. Gross revenue reflects reported transaction value before merchant cost of goods or profit.
          </p>
        </div>
      </div>
    </div>
  );
}
