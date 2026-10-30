"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { formatETB } from "@/lib/sales";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { FunnelMetrics, CampaignAnalyticsResponse } from "@/lib/analytics";
import { AuditLogEntry, generateSummaryCSV, generateAuditCSV, downloadCSV } from "@/lib/reports";
import { ExecutiveReportModal } from "@/components/brand/ExecutiveReportModal";
import { CampaignComparisonMatrix } from "@/components/brand/CampaignComparisonMatrix";
import {
  BarChart3,
  Send,
  Phone,
  MapPin,
  Copy,
  TrendingUp,
  ArrowLeft,
  Filter,
  Download,
  Calendar,
  CheckCircle2,
  Layers,
  Users,
  FileText,
  ChevronDown,
  ChevronUp,
  Printer,
  Table,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface AnalyticsViewProps {
  brandName: string;
  summary: FunnelMetrics;
  campaigns: CampaignAnalyticsResponse[];
  auditEntries?: AuditLogEntry[];
}

export function AnalyticsView({
  brandName,
  summary,
  campaigns,
  auditEntries = [],
}: AnalyticsViewProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("all");
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState<boolean>(false);
  const [isDisclaimerExpanded, setIsDisclaimerExpanded] = useState<boolean>(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Close export dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target as Node)
      ) {
        setIsExportDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeMetrics =
    selectedCampaignId === "all"
      ? summary
      : campaigns.find((c) => c.campaignId === selectedCampaignId) || summary;

  const activeCampaign =
    selectedCampaignId === "all"
      ? null
      : campaigns.find((c) => c.campaignId === selectedCampaignId);

  const targetCampaigns = activeCampaign ? [activeCampaign] : campaigns;

  const totalCreators = campaigns.reduce(
    (acc, c) => acc + (c.creators?.length || 0),
    0
  );

  const sanitizedBrandName = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "_");

  // Omnichannel Channel Share calculations
  const totalTouchpoints = activeMetrics.totalClicks || 1;
  const telegramPct = Math.round((activeMetrics.telegramClicks / totalTouchpoints) * 100);
  const callPct = Math.round((activeMetrics.callClicks / totalTouchpoints) * 100);
  const mapPct = Math.round((activeMetrics.mapClicks / totalTouchpoints) * 100);
  const copyPct = Math.max(0, 100 - telegramPct - callPct - mapPct);

  // Export 1: High-Level Executive Summary CSV
  const handleExportSummaryCSV = () => {
    const csv = generateSummaryCSV(brandName, targetCampaigns, activeMetrics);
    const suffix = activeCampaign ? `_${activeCampaign.slug}` : "";
    downloadCSV(`${sanitizedBrandName}_summary${suffix}.csv`, csv);
    setIsExportDropdownOpen(false);
  };

  // Export 2: Granular Audit & Redemption Ledger CSV
  const handleExportAuditCSV = () => {
    const filteredEntries =
      selectedCampaignId === "all"
        ? auditEntries
        : auditEntries.filter(
            (entry) => entry.campaignName === activeCampaign?.campaignName
          );

    const csv = generateAuditCSV(brandName, filteredEntries);
    const suffix = activeCampaign ? `_${activeCampaign.slug}` : "";
    downloadCSV(`${sanitizedBrandName}_audit_ledger${suffix}.csv`, csv);
    setIsExportDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-body antialiased pb-20 selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-200">
      {/* Top Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="layout-container min-h-[var(--navbar-height)] px-[var(--page-px)] py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/brand"
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline font-bold text-lg text-slate-900 dark:text-white leading-tight">
                  {brandName}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  BRAND CONSOLE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Omnichannel performance attribution, conversion funnel &amp; ETB metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Telemetry Status */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Attribution Engine Active</span>
            </div>

            {/* Executive Report Modal Trigger */}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg shadow-xs text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
              title="Open Executive Report Preview"
            >
              <FileText className="w-4 h-4" />
              <span>Executive Report</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative" ref={exportDropdownRef}>
              <button
                onClick={() => setIsExportDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs text-xs font-semibold transition-all hover:text-slate-900 dark:hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                aria-expanded={isExportDropdownOpen}
                aria-haspopup="true"
              >
                <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Export Data</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isExportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-2 z-40 text-xs">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    CSV Downloads
                  </div>
                  <button
                    onClick={handleExportSummaryCSV}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700/60 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-2 cursor-pointer transition-colors focus-visible:outline-none focus-visible:bg-slate-100 dark:focus-visible:bg-slate-700"
                  >
                    <Table className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="font-semibold">Executive Summary (.csv)</div>
                      <div className="text-[10px] text-slate-400">
                        Aggregated campaign KPIs &amp; ROI
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleExportAuditCSV}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700/60 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-2 cursor-pointer transition-colors focus-visible:outline-none focus-visible:bg-slate-100 dark:focus-visible:bg-slate-700"
                  >
                    <Layers className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="font-semibold">Attribution &amp; Sales Audit (.csv)</div>
                      <div className="text-[10px] text-slate-400">
                        Granular touchpoints &amp; POS redemptions
                      </div>
                    </div>
                  </button>

                  <div className="my-1.5 border-t border-slate-100 dark:border-slate-700" />

                  <button
                    onClick={() => {
                      setIsExportDropdownOpen(false);
                      setIsReportModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700/60 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-2 cursor-pointer transition-colors focus-visible:outline-none focus-visible:bg-slate-100 dark:focus-visible:bg-slate-700"
                  >
                    <Printer className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="font-semibold">Print / Save PDF</div>
                      <div className="text-[10px] text-slate-400">
                        Formatted board-ready executive report
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Filter Toolbar */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 py-2.5">
        <div className="layout-container px-[var(--page-px)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Filter by Campaign:
            </span>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <option value="all">All Campaigns Combined ({campaigns.length})</option>
              {campaigns.map((c) => (
                <option key={c.campaignId} value={c.campaignId}>
                  {c.campaignName} ({c.promoCode})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Reporting Period: <strong className="text-slate-800 dark:text-slate-200">Real-Time Cumulative</strong>
            </span>
          </div>
        </div>
      </div>

      <main className="layout-container px-[var(--page-px)] py-8 space-y-8">
        {/* Attribution Limitations & Methodology Transparency Banner (PRD FR-025 / FR-029) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    Attribution Methodology &amp; Reporting Scope
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    PRD FR-025 / FR-029
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Conversions and revenue represent merchant-recorded in-store redemptions and digital orders, rather than automated bank/card clearance. Event progressions reflect aggregate touchpoints, not 100% deterministic individual consumer journeys.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDisclaimerExpanded((prev) => !prev)}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span>{isDisclaimerExpanded ? "Hide Details" : "Read Methodology"}</span>
              {isDisclaimerExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {isDisclaimerExpanded && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-transparent">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  1. Merchant-Recorded Redemptions
                </span>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Sales are recorded by retail cashiers and store staff matching promotional codes or QR scans. Figures represent reported merchant volume rather than independently verified third-party banking records.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-transparent">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  2. Aggregate Event Progression
                </span>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  The 5-stage conversion pipeline measures aggregate traffic volume and channel touchpoints. The system does not claim that every recorded sale was exclusively caused by a single creator.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-transparent">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  3. Gross Revenue vs Profit (FR-030)
                </span>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Campaign revenue equals the gross sum of eligible recorded transactions. Figures do not deduct merchant product cost of goods, taxes, or store overhead, and are not a measure of business profit.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Top Bento KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Attributed Gross Sales */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Reported Gross Sales
              </span>
              <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                ETB
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                {formatETB(activeMetrics.totalRevenueETB)}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Merchant-recorded in-store &amp; POS orders</span>
              </div>
            </div>
          </div>

          {/* Card 2: Merchant-Recorded Conversions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Merchant-Recorded Orders
              </span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {activeMetrics.salesCount.toLocaleString()}
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5">
                Average Order Value:{" "}
                <strong className="text-slate-800 dark:text-slate-200 font-mono">
                  {formatETB(activeMetrics.aovETB)}
                </strong>
              </div>
            </div>
          </div>

          {/* Card 3: Active Influencers */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Creators &amp; Partners
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {totalCreators}
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5">
                Across {campaigns.length} active campaigns
              </div>
            </div>
          </div>

          {/* Card 4: Sales Conversion Rate */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Blended Conversion Rate
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                %
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {activeMetrics.salesConversionRate}%
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5">
                Visitor CTR:{" "}
                <strong className="text-slate-800 dark:text-slate-200">
                  {activeMetrics.clickThroughRate}%
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Stage Conversion Funnel Visualization - Flattened anti-slop tiles */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="font-headline font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>5-Stage Attribution &amp; Conversion Pipeline</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                End-to-end journey from link impression to verified purchase redemption
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                Funnel Efficiency: {activeMetrics.salesConversionRate}%
              </span>
            </div>
          </div>

          {/* Step Progression Grid - Flattened Borderless Tint Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {/* Step 1: Impressions / Page Views */}
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700/60 flex flex-col justify-between transition-all">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Stage 1 &bull; Views
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                  {activeMetrics.pageViews.toLocaleString()}
                </div>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">Link Impressions</span>
            </div>

            {/* Step 2: Unique Visitors */}
            <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-transparent hover:border-indigo-200/60 dark:hover:border-indigo-800/40 flex flex-col justify-between transition-all">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Stage 2 &bull; Visitors
                </span>
                <div className="text-2xl font-black text-indigo-950 dark:text-indigo-200 mt-1 font-mono">
                  {activeMetrics.uniqueVisitors.toLocaleString()}
                </div>
              </div>
              <span className="text-[11px] text-indigo-700/80 dark:text-indigo-400/80 mt-3">Distinct Client UUIDs</span>
            </div>

            {/* Step 3: Touchpoint Intent */}
            <div className="p-4 rounded-xl bg-sky-50/40 dark:bg-sky-950/20 border border-transparent hover:border-sky-200/60 dark:hover:border-sky-800/40 flex flex-col justify-between transition-all">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                  Stage 3 &bull; Action Intent
                </span>
                <div className="text-2xl font-black text-sky-950 dark:text-sky-200 mt-1 font-mono">
                  {activeMetrics.totalClicks.toLocaleString()}
                </div>
              </div>
              <span className="text-[11px] text-sky-700/80 dark:text-sky-400/80 mt-3">Telegram / Calls / Maps</span>
            </div>

            {/* Step 4: In-Store POS Scans & Sales */}
            <div className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-transparent hover:border-amber-200/60 dark:hover:border-amber-800/40 flex flex-col justify-between transition-all">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Stage 4 &bull; Redemptions
                </span>
                <div className="text-2xl font-black text-amber-950 dark:text-amber-200 mt-1 font-mono">
                  {activeMetrics.salesCount.toLocaleString()}
                </div>
              </div>
              <span className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-3">Merchant POS Logs</span>
            </div>

            {/* Step 5: Gross Revenue */}
            <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-transparent hover:border-emerald-200/60 dark:hover:border-emerald-800/40 flex flex-col justify-between transition-all">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  Stage 5 &bull; Reported Sales
                </span>
                <div className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-200 mt-1 font-mono">
                  {formatETB(activeMetrics.totalRevenueETB)}
                </div>
              </div>
              <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-3 font-mono">
                AOV: {formatETB(activeMetrics.aovETB)}
              </span>
            </div>
          </div>
        </div>

        {/* Omnichannel Channel Share & Horizontal Segmented Share Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-headline font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Omnichannel Touchpoint Mix</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Channel distribution and conversion preference across {activeMetrics.totalClicks.toLocaleString()} verified customer interactions
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              {activeMetrics.totalClicks.toLocaleString()} Total Actions
            </div>
          </div>

          {/* Proportional Segmented Share Bar */}
          <div className="space-y-2">
            <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-2xs">
              {activeMetrics.telegramClicks > 0 && (
                <div
                  style={{ width: `${telegramPct}%` }}
                  className="bg-[#229ED9] h-full transition-all duration-500"
                  title={`Telegram: ${activeMetrics.telegramClicks} (${telegramPct}%)`}
                />
              )}
              {activeMetrics.callClicks > 0 && (
                <div
                  style={{ width: `${callPct}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`Direct Calls: ${activeMetrics.callClicks} (${callPct}%)`}
                />
              )}
              {activeMetrics.mapClicks > 0 && (
                <div
                  style={{ width: `${mapPct}%` }}
                  className="bg-indigo-500 h-full transition-all duration-500"
                  title={`Map Views: ${activeMetrics.mapClicks} (${mapPct}%)`}
                />
              )}
              {activeMetrics.copyCodeClicks > 0 && (
                <div
                  style={{ width: `${copyPct}%` }}
                  className="bg-amber-500 h-full transition-all duration-500"
                  title={`Code Copies: ${activeMetrics.copyCodeClicks} (${copyPct}%)`}
                />
              )}
              {activeMetrics.totalClicks === 0 && (
                <div className="w-full h-full bg-slate-200 dark:bg-slate-700/60" />
              )}
            </div>

            {/* Micro Legend */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#229ED9]" />
                <span>Telegram: <strong className="text-slate-800 dark:text-slate-200 font-mono">{telegramPct}%</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Calls: <strong className="text-slate-800 dark:text-slate-200 font-mono">{callPct}%</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Maps: <strong className="text-slate-800 dark:text-slate-200 font-mono">{mapPct}%</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Promo Codes: <strong className="text-slate-800 dark:text-slate-200 font-mono">{copyPct}%</strong></span>
              </div>
            </div>
          </div>

          {/* Flattened Channel Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700/60 flex items-center justify-between transition-all">
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Telegram Clicks</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                  {activeMetrics.telegramClicks}
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#229ED9]/10 text-[#229ED9] flex items-center justify-center">
                <Send className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700/60 flex items-center justify-between transition-all">
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Phone Calls</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                  {activeMetrics.callClicks}
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Phone className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700/60 flex items-center justify-between transition-all">
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Map Views</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                  {activeMetrics.mapClicks}
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <MapPin className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700/60 flex items-center justify-between transition-all">
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Code Copies</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                  {activeMetrics.copyCodeClicks}
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Copy className="w-4.5 h-4.5" />
              </div>
            </div>
          </div>
        </div>

        {/* PRD FR-031: Comparative Campaign Performance Matrix & Cohort Benchmarks */}
        <CampaignComparisonMatrix
          campaigns={campaigns}
          brandName={brandName}
          onSelectCampaign={(id) => setSelectedCampaignId(id)}
        />
      </main>

      {/* Official Executive Attribution Report Modal */}
      <ExecutiveReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        brandName={brandName}
        summary={summary}
        campaigns={campaigns}
        selectedCampaignId={selectedCampaignId}
      />
    </div>
  );
}
