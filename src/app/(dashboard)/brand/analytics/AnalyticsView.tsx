"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatETB } from "@/lib/sales";
import { FunnelMetrics, CampaignAnalyticsResponse } from "@/lib/analytics";
import {
  BarChart3,
  Send,
  Phone,
  MapPin,
  Copy,
  TrendingUp,
  ArrowLeft,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";

interface AnalyticsViewProps {
  brandName: string;
  summary: FunnelMetrics;
  campaigns: CampaignAnalyticsResponse[];
}

export function AnalyticsView({
  brandName,
  summary,
  campaigns,
}: AnalyticsViewProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("all");

  const activeMetrics =
    selectedCampaignId === "all"
      ? summary
      : campaigns.find((c) => c.campaignId === selectedCampaignId) || summary;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/brand"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                {brandName} Performance Funnel
              </h1>
              <p className="text-xs text-slate-500">
                Attribution pipeline, touchpoint clicks, and ETB conversion
              </p>
            </div>
          </div>

          {/* Campaign Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Campaigns Combined ({campaigns.length})</option>
              {campaigns.map((c) => (
                <option key={c.campaignId} value={c.campaignId}>
                  {c.campaignName} ({c.promoCode})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Conversion Funnel Progress Bar Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Marketing & Sales Conversion Funnel</span>
              </h2>
              <p className="text-xs text-slate-500">
                End-to-end customer journey from public link visit to recorded ETB revenue
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-slate-600">
                CTR: <strong className="text-slate-900">{activeMetrics.clickThroughRate}%</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Sales Conv: <strong>{activeMetrics.salesConversionRate}%</strong>
              </span>
            </div>
          </div>

          {/* Step Progression Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            {/* Step 1: Total Visits */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Step 1 • Visits
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {activeMetrics.pageViews.toLocaleString()}
                </div>
              </div>
              <span className="text-[11px] text-slate-500 mt-3">Total Page Views</span>
            </div>

            {/* Step 2: Unique Visitors */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  Step 2 • Visitors
                </span>
                <div className="text-2xl font-black text-indigo-950 mt-1">
                  {activeMetrics.uniqueVisitors.toLocaleString()}
                </div>
              </div>
              <span className="text-[11px] text-indigo-700/80 mt-3">Distinct Client UUIDs</span>
            </div>

            {/* Step 3: Touchpoint Taps */}
            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                  Step 3 • Action Taps
                </span>
                <div className="text-2xl font-black text-sky-950 mt-1">
                  {activeMetrics.totalClicks.toLocaleString()}
                </div>
              </div>
              <span className="text-[11px] text-sky-700/80 mt-3">Telegram / Calls / Maps</span>
            </div>

            {/* Step 4: Attributed Sales */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Step 4 • In-Store Sales
                </span>
                <div className="text-2xl font-black text-amber-950 mt-1">
                  {activeMetrics.salesCount.toLocaleString()}
                </div>
              </div>
              <span className="text-[11px] text-amber-700/80 mt-3">Redeemed Purchases</span>
            </div>

            {/* Step 5: Gross Revenue */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Step 5 • Gross Revenue
                </span>
                <div className="text-xl sm:text-2xl font-black text-emerald-950 mt-1 font-mono">
                  {formatETB(activeMetrics.totalRevenueETB)}
                </div>
              </div>
              <span className="text-[11px] text-emerald-700/80 mt-3">
                AOV: {formatETB(activeMetrics.aovETB)}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Touchpoint Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Telegram Clicks</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {activeMetrics.telegramClicks}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#229ED9]/10 text-[#229ED9] flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Phone Calls</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {activeMetrics.callClicks}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Map Views</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {activeMetrics.mapClicks}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Code Copies</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {activeMetrics.copyCodeClicks}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Copy className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Side-by-Side Campaign Comparison Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Campaign Attribution & Creator Leaderboard
              </h3>
              <p className="text-xs text-slate-500">
                Side-by-side performance of all influencer campaigns and assigned creators
              </p>
            </div>
            <Link
              href="/brand/campaigns/new"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>+ New Campaign</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No campaign performance data available yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                    <th className="py-3 px-3">Campaign / Code</th>
                    <th className="py-3 px-3">Influencer / Creator</th>
                    <th className="py-3 px-3 text-right">Page Views</th>
                    <th className="py-3 px-3 text-right">Action Taps</th>
                    <th className="py-3 px-3 text-right">Sales Count</th>
                    <th className="py-3 px-3 text-right">Revenue (ETB)</th>
                    <th className="py-3 px-3 text-right">Conversion</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {campaigns.map((camp) => (
                    <tr key={camp.campaignId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900 text-sm">
                          {camp.campaignName}
                        </div>
                        <div className="font-mono text-[11px] text-emerald-800 font-semibold mt-0.5">
                          {camp.promoCode}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        {camp.creators.length > 0 ? (
                          <div>
                            <div className="font-semibold text-slate-800">
                              {camp.creators[0].name}
                            </div>
                            {camp.creators[0].telegramUsername && (
                              <div className="text-[11px] text-slate-400">
                                @{camp.creators[0].telegramUsername}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right font-medium">
                        {camp.pageViews.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 text-right font-medium">
                        {camp.totalClicks.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 text-right font-semibold text-slate-900">
                        {camp.salesCount.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 text-right font-bold text-emerald-950 font-mono text-sm">
                        {formatETB(camp.totalRevenueETB)}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                          {camp.salesConversionRate}%
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <Link
                          href={`/c/${camp.slug}`}
                          target="_blank"
                          className="inline-flex items-center p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                          title="View Landing"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
