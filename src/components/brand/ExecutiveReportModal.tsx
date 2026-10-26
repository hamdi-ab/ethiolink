"use client";

import React from "react";
import { formatETB } from "@/lib/sales";
import { FunnelMetrics, CampaignAnalyticsResponse } from "@/lib/analytics";
import { formatReportTimestamp, generateSummaryCSV, downloadCSV } from "@/lib/reports";
import {
  Printer,
  Download,
  X,
  FileText,
  ShieldCheck,
  Layers,
  Send,
  Phone,
  MapPin,
  Copy,
} from "lucide-react";

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  summary: FunnelMetrics;
  campaigns: CampaignAnalyticsResponse[];
  selectedCampaignId?: string;
}

export function ExecutiveReportModal({
  isOpen,
  onClose,
  brandName,
  summary,
  campaigns,
  selectedCampaignId = "all",
}: ExecutiveReportModalProps) {
  if (!isOpen) return null;

  const activeCampaign =
    selectedCampaignId !== "all"
      ? campaigns.find((c) => c.campaignId === selectedCampaignId)
      : null;

  const targetCampaigns = activeCampaign ? [activeCampaign] : campaigns;
  const metrics = activeCampaign || summary;
  const generatedTimestamp = formatReportTimestamp(new Date());

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSummaryCSV = () => {
    const csv = generateSummaryCSV(brandName, targetCampaigns, metrics);
    const sanitizedName = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    downloadCSV(`${sanitizedName}_executive_summary.csv`, csv);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:z-auto"
    >
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:rounded-none print:w-full print:max-w-none print:bg-white print:text-black">
        {/* Modal Action Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 id="report-modal-title" className="font-headline font-bold text-sm text-slate-900 dark:text-white">
                Executive Attribution Report
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Official Board &amp; Audit-Ready Summary
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSummaryCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs transition-all cursor-pointer"
              title="Download Executive Summary as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer ml-1"
              aria-label="Close report"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Executive Report Paper Canvas */}
        <div id="executive-report-document" className="p-6 sm:p-10 space-y-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 print:p-8 print:bg-white print:text-black">
          {/* Document Header & Seal */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 print:border-slate-300">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 print:border-emerald-700 print:text-emerald-800">
                  EthioLink Verified
                </span>
                <span className="text-xs text-slate-400 print:text-slate-600 font-mono">
                  {generatedTimestamp}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-headline tracking-tight text-slate-900 dark:text-white print:text-black">
                {brandName}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-700 mt-1">
                Executive Promotional Attribution &amp; Omnichannel Performance Statement
              </p>
            </div>

            <div className="flex sm:flex-col items-end gap-1 text-right">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 print:text-black">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Audit Certificate</span>
              </div>
              <div className="text-[11px] text-slate-400 print:text-slate-600 font-mono">
                Scope: {activeCampaign ? activeCampaign.campaignName : `All Active Campaigns (${targetCampaigns.length})`}
              </div>
              <div className="text-[10px] text-slate-400 print:text-slate-500">
                Period: Cumulative Telemetry
              </div>
            </div>
          </div>

          {/* Key Executive Financial Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:break-inside-avoid">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 print:bg-slate-50 print:border-slate-300">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
                Attributed Gross Sales
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 print:text-emerald-800 mt-1">
                {formatETB(metrics.totalRevenueETB)}
              </div>
              <div className="text-[10px] text-slate-500 print:text-slate-600 mt-1">
                Verified in-store &amp; POS
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 print:bg-slate-50 print:border-slate-300">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
                Verified Conversions
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white print:text-black mt-1">
                {metrics.salesCount.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 print:text-slate-600 mt-1">
                AOV: <strong className="font-mono">{formatETB(metrics.aovETB)}</strong>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 print:bg-slate-50 print:border-slate-300">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
                Funnel Conversion Rate
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono text-indigo-700 dark:text-indigo-400 print:text-indigo-900 mt-1">
                {metrics.salesConversionRate}%
              </div>
              <div className="text-[10px] text-slate-500 print:text-slate-600 mt-1">
                Click-Through: <strong>{metrics.clickThroughRate}%</strong>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 print:bg-slate-50 print:border-slate-300">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
                Total Intent Taps
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono text-sky-700 dark:text-sky-400 print:text-sky-900 mt-1">
                {metrics.totalClicks.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 print:text-slate-600 mt-1">
                Across {metrics.uniqueVisitors.toLocaleString()} visitors
              </div>
            </div>
          </div>

          {/* 5-Stage Funnel Table */}
          <div className="space-y-3 print:break-inside-avoid">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 print:border-slate-300">
              <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 print:text-black flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Conversion Pipeline Progression</span>
              </h3>
              <span className="text-[11px] text-slate-400 print:text-slate-600">
                Efficiency: {metrics.salesConversionRate}%
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 print:bg-slate-100 print:border-slate-300">
                <div className="text-[10px] text-slate-500 print:text-slate-600 font-bold uppercase">1. Views</div>
                <div className="text-base font-black font-mono mt-1 text-slate-900 dark:text-white print:text-black">
                  {metrics.pageViews.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 print:bg-slate-100 print:border-slate-300">
                <div className="text-[10px] text-indigo-700 dark:text-indigo-400 print:text-slate-600 font-bold uppercase">2. Visitors</div>
                <div className="text-base font-black font-mono mt-1 text-slate-900 dark:text-white print:text-black">
                  {metrics.uniqueVisitors.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-sky-50/50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 print:bg-slate-100 print:border-slate-300">
                <div className="text-[10px] text-sky-700 dark:text-sky-400 print:text-slate-600 font-bold uppercase">3. Action Taps</div>
                <div className="text-base font-black font-mono mt-1 text-slate-900 dark:text-white print:text-black">
                  {metrics.totalClicks.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 print:bg-slate-100 print:border-slate-300">
                <div className="text-[10px] text-amber-700 dark:text-amber-400 print:text-slate-600 font-bold uppercase">4. Orders</div>
                <div className="text-base font-black font-mono mt-1 text-slate-900 dark:text-white print:text-black">
                  {metrics.salesCount.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 print:bg-slate-100 print:border-slate-300">
                <div className="text-[10px] text-emerald-800 dark:text-emerald-400 print:text-slate-600 font-bold uppercase">5. Gross ETB</div>
                <div className="text-sm sm:text-base font-black font-mono mt-1 text-emerald-700 dark:text-emerald-400 print:text-emerald-900">
                  {formatETB(metrics.totalRevenueETB)}
                </div>
              </div>
            </div>
          </div>

          {/* Omnichannel Distribution Breakdown */}
          <div className="space-y-3 print:break-inside-avoid">
            <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 print:text-black border-b border-slate-200 dark:border-slate-800 pb-2 print:border-slate-300">
              Omnichannel Touchpoint Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between print:bg-slate-50 print:border-slate-300">
                <div>
                  <div className="text-[11px] text-slate-500 print:text-slate-600 font-medium">Telegram Clicks</div>
                  <div className="text-lg font-black font-mono text-slate-900 dark:text-white print:text-black mt-0.5">
                    {metrics.telegramClicks}
                  </div>
                </div>
                <Send className="w-4 h-4 text-[#229ED9]" />
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between print:bg-slate-50 print:border-slate-300">
                <div>
                  <div className="text-[11px] text-slate-500 print:text-slate-600 font-medium">Direct Calls</div>
                  <div className="text-lg font-black font-mono text-slate-900 dark:text-white print:text-black mt-0.5">
                    {metrics.callClicks}
                  </div>
                </div>
                <Phone className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between print:bg-slate-50 print:border-slate-300">
                <div>
                  <div className="text-[11px] text-slate-500 print:text-slate-600 font-medium">Map Directions</div>
                  <div className="text-lg font-black font-mono text-slate-900 dark:text-white print:text-black mt-0.5">
                    {metrics.mapClicks}
                  </div>
                </div>
                <MapPin className="w-4 h-4 text-indigo-600" />
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between print:bg-slate-50 print:border-slate-300">
                <div>
                  <div className="text-[11px] text-slate-500 print:text-slate-600 font-medium">Promo Code Copies</div>
                  <div className="text-lg font-black font-mono text-slate-900 dark:text-white print:text-black mt-0.5">
                    {metrics.copyCodeClicks}
                  </div>
                </div>
                <Copy className="w-4 h-4 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Campaign Audit Table */}
          <div className="space-y-3 print:break-inside-avoid">
            <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 print:text-black border-b border-slate-200 dark:border-slate-800 pb-2 print:border-slate-300">
              Campaign &amp; Creator Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
                    <th className="py-2 px-2">Campaign</th>
                    <th className="py-2 px-2">Promo Code</th>
                    <th className="py-2 px-2 text-right">Views</th>
                    <th className="py-2 px-2 text-right">Taps</th>
                    <th className="py-2 px-2 text-right">Orders</th>
                    <th className="py-2 px-2 text-right">Revenue (ETB)</th>
                    <th className="py-2 px-2 text-right">Conv. Rate</th>
                    <th className="py-2 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-slate-200">
                  {targetCampaigns.map((camp) => (
                    <tr key={camp.campaignId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 print:hover:bg-transparent">
                      <td className="py-2.5 px-2">
                        <div className="font-bold text-slate-900 dark:text-white print:text-black">
                          {camp.campaignName}
                        </div>
                        <div className="text-[10px] text-slate-400 print:text-slate-600">
                          {camp.creators.length > 0
                            ? camp.creators.map((c) => c.name).join(", ")
                            : "No assigned creators"}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 font-mono font-semibold text-emerald-700 dark:text-emerald-400 print:text-black">
                        {camp.promoCode}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600 dark:text-slate-300 print:text-black">
                        {camp.pageViews.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600 dark:text-slate-300 print:text-black">
                        {camp.totalClicks.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900 dark:text-white print:text-black">
                        {camp.salesCount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 print:text-black">
                        {formatETB(camp.totalRevenueETB)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-700 dark:text-slate-300 print:text-black">
                        {camp.salesConversionRate}%
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 print:border print:border-slate-300">
                          {camp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Verification & Legal Footer */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-[10px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:border-slate-300 print:text-slate-600 print:break-inside-avoid">
            <div>
              <p className="font-semibold text-slate-600 dark:text-slate-400 print:text-black">
                EthioLink Certified Telemetry &amp; POS Attribution Ledger
              </p>
              <p className="mt-0.5">
                Financial records and conversion metrics are calculated from immutable timestamped telemetry events and verified in-store POS receipts.
              </p>
            </div>
            <div className="text-right font-mono shrink-0">
              <div>System: EthioLink Engine v2.4</div>
              <div>Certified: {generatedTimestamp}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
