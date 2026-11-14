"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { formatETB } from "@/lib/sales";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { FunnelMetrics, CampaignAnalyticsResponse } from "@/lib/analytics";
import { AuditLogEntry, generateSummaryCSV, generateAuditCSV, downloadCSV } from "@/lib/reports";
import { ExecutiveReportModal } from "@/components/brand/ExecutiveReportModal";
import { CampaignComparisonMatrix } from "@/components/brand/CampaignComparisonMatrix";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Send,
  Phone,
  MapPin,
  TrendingUp,
  ArrowLeft,
  Filter,
  Download,
  Calendar,
  CheckCircle2,
  Check,
  Layers,
  Users,
  FileText,
  ChevronDown,
  ChevronUp,
  Printer,
  Table,
  ShieldCheck,
  Zap,
  Search,
  Store,
  Rocket,
  MoreVertical,
  Activity,
  CreditCard,
  CheckCircle,
} from "lucide-react";

export interface AnalyticsViewProps {
  brandName: string;
  summary: FunnelMetrics;
  campaigns: CampaignAnalyticsResponse[];
  auditEntries?: AuditLogEntry[];
  embedded?: boolean;
  onNavigateTab?: (tab: "overview" | "sales" | "analytics") => void;
  onOpenCreateCampaignModal?: () => void;
}

export function AnalyticsView({
  brandName,
  summary,
  campaigns,
  auditEntries = [],
  embedded = false,
  onNavigateTab,
  onOpenCreateCampaignModal,
}: AnalyticsViewProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("all");
  const [selectedBranch, setSelectedBranch] = useState<"ALL" | "BOLE" | "KAZANCHIS">("ALL");
  const [selectedChannel, setSelectedChannel] = useState<"ALL" | "TELEGRAM" | "POS" | "PHONE">("ALL");
  const [creatorSearchQuery, setCreatorSearchQuery] = useState<string>("");
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isDisclaimerExpanded, setIsDisclaimerExpanded] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<"7D" | "30D" | "90D" | "ALL">("30D");

  const activeMetrics = useMemo(() => {
    return selectedCampaignId === "all"
      ? summary
      : campaigns.find((c) => c.campaignId === selectedCampaignId) || summary;
  }, [selectedCampaignId, summary, campaigns]);

  const activeCampaign = useMemo(() => {
    return selectedCampaignId === "all"
      ? null
      : campaigns.find((c) => c.campaignId === selectedCampaignId);
  }, [selectedCampaignId, campaigns]);

  const targetCampaigns = activeCampaign ? [activeCampaign] : campaigns;

  const totalCreators = useMemo(() => {
    return campaigns.reduce((acc, c) => acc + (c.creators?.length || 0), 0);
  }, [campaigns]);

  const sanitizedBrandName = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "_");

  // Omnichannel Channel Share calculations
  const totalTouchpoints = activeMetrics.totalClicks > 0 ? activeMetrics.totalClicks : 100;
  const rawTg = activeMetrics.telegramClicks;
  const rawCall = activeMetrics.callClicks;
  const rawMap = activeMetrics.mapClicks;

  const telegramPct = activeMetrics.totalClicks > 0
    ? Math.round((rawTg / totalTouchpoints) * 100)
    : 58;
  const mapPct = activeMetrics.totalClicks > 0
    ? Math.round((rawMap / totalTouchpoints) * 100)
    : 31;
  const callPct = activeMetrics.totalClicks > 0
    ? Math.round((rawCall / totalTouchpoints) * 100)
    : 11;

  // Pipeline Stage Volumes (with realistic fallbacks matching Stitch spec 71260bb1/f7004aa8)
  const stage1Impressions = activeMetrics.pageViews > 0 ? activeMetrics.pageViews : 48200;
  const stage2Visits = activeMetrics.uniqueVisitors > 0 ? activeMetrics.uniqueVisitors : 12450;
  const stage3Intent = activeMetrics.totalClicks > 0 ? activeMetrics.totalClicks : 4120;
  const stage4Scans = activeMetrics.copyCodeClicks > 0
    ? activeMetrics.copyCodeClicks + activeMetrics.salesCount
    : 1580;
  const stage5Sales = activeMetrics.salesCount > 0 ? activeMetrics.salesCount : 1240;

  const stage2Pct = ((stage2Visits / stage1Impressions) * 100).toFixed(1);
  const stage3Pct = ((stage3Intent / stage1Impressions) * 100).toFixed(1);
  const stage4Pct = ((stage4Scans / stage1Impressions) * 100).toFixed(1);
  const stage5Pct = ((stage5Sales / stage1Impressions) * 100).toFixed(1);

  const intentToPurchaseRetention = stage3Intent > 0
    ? ((stage5Sales / stage3Intent) * 100).toFixed(1)
    : "30.1";

  // Channel share monetary values
  const grossTotal = activeMetrics.totalRevenueETB > 0 ? activeMetrics.totalRevenueETB : 245850;
  const tgRevETB = Math.round(grossTotal * (telegramPct / 100));
  const posRevETB = Math.round(grossTotal * (mapPct / 100));
  const callRevETB = Math.max(0, grossTotal - tgRevETB - posRevETB);

  // Derived Creator Roster for Influencer Performance Ledger
  const creatorLedgerItems = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      handle: string;
      initials: string;
      reach: string;
      channelType: string;
      orders: number;
      revenueETB: number;
      revenueSharePct: number;
      commissionETB: number;
      payoutMethod: string;
      roiMultiple: number;
      status: string;
    }> = [];

    // Extract creators from live database campaigns
    let orderCounter = 0;
    campaigns.forEach((camp, cIdx) => {
      (camp.creators || []).forEach((cr, crIdx) => {
        const parts = cr.name.trim().split(" ");
        const initials = parts.length > 1
          ? `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
          : cr.name.slice(0, 2).toUpperCase();

        const shareOfCamp = 1 / Math.max(1, camp.creators.length);
        const allocatedRev = (camp.totalRevenueETB || 60000) * shareOfCamp;
        const allocatedOrders = Math.max(1, Math.round((camp.salesCount || 100) * shareOfCamp));
        const totalRev = grossTotal || 1;
        const revSharePct = Math.round((allocatedRev / totalRev) * 1000) / 10;
        const commission = Math.round(allocatedRev * 0.1);

        list.push({
          id: `cr-${cIdx}-${crIdx}`,
          name: cr.name,
          handle: cr.telegramUsername ? `@${cr.telegramUsername.replace("@", "")}` : `@creator_${orderCounter + 1}`,
          initials,
          reach: `${(80 + orderCounter * 25)}K`,
          channelType: orderCounter % 2 === 0 ? "TikTok / IG" : "Telegram Channel",
          orders: allocatedOrders,
          revenueETB: allocatedRev,
          revenueSharePct: revSharePct,
          commissionETB: commission,
          payoutMethod: orderCounter % 2 === 0 ? "Via Telebirr Pay" : "Direct CBE Transfer",
          roiMultiple: 10.0,
          status: "Active",
        });
        orderCounter++;
      });
    });

    // If no creators currently mapped in DB, populate Stitch spec benchmark roster
    if (list.length === 0) {
      return [
        {
          id: "cr-stitch-1",
          name: "Meron B.",
          handle: "@ethio_lifestyle",
          initials: "MB",
          reach: "120K",
          channelType: "TikTok / IG",
          orders: 420,
          revenueETB: 84500,
          revenueSharePct: 34.3,
          commissionETB: 8450,
          payoutMethod: "Via Telebirr Pay",
          roiMultiple: 10.0,
          status: "Active",
        },
        {
          id: "cr-stitch-2",
          name: "Yared K.",
          handle: "@addisfoodie",
          initials: "YK",
          reach: "85K",
          channelType: "Telegram Channel",
          orders: 315,
          revenueETB: 62100,
          revenueSharePct: 25.2,
          commissionETB: 6210,
          payoutMethod: "Direct CBE Transfer",
          roiMultiple: 10.0,
          status: "Active",
        },
        {
          id: "cr-stitch-3",
          name: "Dawit T.",
          handle: "@habesha_tech",
          initials: "DT",
          reach: "64K",
          channelType: "YouTube / Telegram",
          orders: 280,
          revenueETB: 54300,
          revenueSharePct: 22.1,
          commissionETB: 5430,
          payoutMethod: "Via Telebirr Pay",
          roiMultiple: 10.0,
          status: "Active",
        },
        {
          id: "cr-stitch-4",
          name: "Bethlehem G.",
          handle: "@sheba_vibes",
          initials: "BG",
          reach: "45K",
          channelType: "Instagram Reels",
          orders: 225,
          revenueETB: 44950,
          revenueSharePct: 18.3,
          commissionETB: 4495,
          payoutMethod: "Direct CBE Transfer",
          roiMultiple: 10.0,
          status: "Active",
        },
      ];
    }

    return list;
  }, [campaigns, grossTotal]);

  const filteredCreatorLedger = useMemo(() => {
    if (!creatorSearchQuery.trim()) return creatorLedgerItems;
    const q = creatorSearchQuery.toLowerCase();
    return creatorLedgerItems.filter(
      (c) => c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q)
    );
  }, [creatorLedgerItems, creatorSearchQuery]);

  // Export CSV Handlers
  const handleExportSummaryCSV = () => {
    const csv = generateSummaryCSV(brandName, targetCampaigns, activeMetrics);
    const suffix = activeCampaign ? `_${activeCampaign.slug}` : "";
    downloadCSV(`${sanitizedBrandName}_summary${suffix}.csv`, csv);
  };

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
  };

  const selectedCampaignName =
    selectedCampaignId === "all"
      ? `All Campaigns Combined (${campaigns.length})`
      : activeCampaign
      ? `${activeCampaign.campaignName} (${activeCampaign.promoCode})`
      : "All Campaigns Combined";

  const campaignDropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="h-8.5 flex items-center gap-2 bg-white dark:bg-[#101C18] border border-[#D7DED9]/80 dark:border-[#304239] px-3 rounded-xl shadow-2xs text-xs font-semibold text-slate-800 dark:text-[#F1F5F1] hover:bg-[#F0F2EF] dark:hover:bg-[#1A2A24] hover:border-emerald-500/50 dark:hover:border-[#78B99D]/50 focus:outline-none focus:ring-1 focus:ring-emerald-600/40 dark:focus:ring-[#78B99D]/40 transition-all cursor-pointer"
          aria-label="Filter campaign"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#83D1A5]" />
          <span className="max-w-[180px] sm:max-w-xs truncate font-medium">
            {selectedCampaignName}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400 dark:text-[#9BAAA1] shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-72 max-h-80 overflow-y-auto p-1.5 bg-white dark:bg-[#14211D] border border-[#D7DED9] dark:border-[#26372F] shadow-lg rounded-xl z-50 text-xs"
      >
        <DropdownMenuLabel className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9BAAA1]">
          Filter by Campaign
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-[#26372F]" />
        <DropdownMenuItem
          onClick={() => setSelectedCampaignId("all")}
          className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
            selectedCampaignId === "all"
              ? "bg-emerald-50 dark:bg-[#193629] text-emerald-800 dark:text-[#83D1A5] font-semibold"
              : "text-slate-700 dark:text-[#C0CCC4] hover:bg-slate-50 dark:hover:bg-[#1A2A24]"
          }`}
        >
          <div>
            <div className="font-semibold text-slate-900 dark:text-[#F1F5F1]">
              All Campaigns Combined
            </div>
            <div className="text-[10px] text-slate-400 dark:text-[#9BAAA1]">
              Aggregated across all {campaigns.length} campaigns
            </div>
          </div>
          {selectedCampaignId === "all" && (
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-[#78B99D] shrink-0" />
          )}
        </DropdownMenuItem>

        {campaigns.map((c) => {
          const isSelected = selectedCampaignId === c.campaignId;
          return (
            <DropdownMenuItem
              key={c.campaignId}
              onClick={() => setSelectedCampaignId(c.campaignId)}
              className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                isSelected
                  ? "bg-emerald-50 dark:bg-[#193629] text-emerald-800 dark:text-[#83D1A5] font-semibold"
                  : "text-slate-700 dark:text-[#C0CCC4] hover:bg-slate-50 dark:hover:bg-[#1A2A24]"
              }`}
            >
              <div className="min-w-0 pr-2">
                <div className="font-semibold text-slate-900 dark:text-[#F1F5F1] truncate">
                  {c.campaignName}
                </div>
                <div className="text-[10px] font-mono text-emerald-700 dark:text-[#78B99D]">
                  Promo Code: {c.promoCode}
                </div>
              </div>
              {isSelected && (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-[#78B99D] shrink-0" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const analyticsToolbar = (
    <div className="bg-white dark:bg-[#14211D] border border-[#D7DED9]/80 dark:border-[#26372F] rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-slate-500 dark:text-[#9BAAA1] font-semibold flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-[#78B99D]" />
          Filter by Campaign:
        </span>
        {campaignDropdown}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setIsReportModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#78B99D] dark:hover:bg-[#91C9AE] dark:text-[#0D2119] font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-[0.98]"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Executive Report</span>
        </button>
        <button
          type="button"
          onClick={handleExportSummaryCSV}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#101C18] hover:bg-slate-50 dark:hover:bg-[#1A2A24] text-slate-700 dark:text-[#C0CCC4] font-semibold text-xs border border-[#D7DED9]/80 dark:border-[#304239] shadow-2xs transition-all cursor-pointer"
        >
          <Table className="w-3.5 h-3.5 text-emerald-600 dark:text-[#78B99D]" />
          <span>Summary CSV</span>
        </button>
        <button
          type="button"
          onClick={handleExportAuditCSV}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#101C18] hover:bg-slate-50 dark:hover:bg-[#1A2A24] text-slate-700 dark:text-[#C0CCC4] font-semibold text-xs border border-[#D7DED9]/80 dark:border-[#304239] shadow-2xs transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-[#78B99D]" />
          <span>Audit CSV</span>
        </button>
      </div>
    </div>
  );

  const analyticsContent = (
    <div className="space-y-6">
      {/* 1. Attribution Methodology & Transparency Banner (PRD FR-025 / FR-029) */}
      <div className="bg-white dark:bg-[#14211D] rounded-2xl border border-[#D7DED9]/80 dark:border-[#26372F] p-4 sm:p-5 shadow-xs transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-[#193629] text-emerald-600 dark:text-[#78B99D] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-bold text-xs text-slate-900 dark:text-[#F1F5F1] uppercase tracking-wider">
                  Attribution Methodology &amp; Reporting Scope
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#101C18] text-slate-600 dark:text-[#9BAAA1] border border-slate-200 dark:border-[#26372F]">
                  PRD FR-025 / FR-029
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-[#9BAAA1] leading-relaxed">
                Conversions and revenue represent merchant-recorded in-store redemptions and digital orders, rather than automated bank/card clearance. Event progressions reflect aggregate touchpoints, not 100% deterministic individual consumer journeys.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDisclaimerExpanded((prev) => !prev)}
            className="text-xs font-semibold text-emerald-700 dark:text-[#78B99D] hover:text-emerald-800 dark:hover:text-[#83D1A5] flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-[#193629] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
          >
            <span>{isDisclaimerExpanded ? "Hide Details" : "Read Methodology"}</span>
            {isDisclaimerExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isDisclaimerExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#26372F] grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#101C18] border border-transparent dark:border-[#26372F]/50">
              <span className="font-bold text-slate-800 dark:text-[#F1F5F1] block mb-1">
                1. Merchant-Recorded Redemptions
              </span>
              <p className="text-slate-500 dark:text-[#9BAAA1] leading-relaxed">
                Sales are recorded by retail cashiers and store staff matching promotional codes or QR scans. Figures represent reported merchant volume rather than independently verified third-party banking records.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#101C18] border border-transparent dark:border-[#26372F]/50">
              <span className="font-bold text-slate-800 dark:text-[#F1F5F1] block mb-1">
                2. Aggregate Event Progression
              </span>
              <p className="text-slate-500 dark:text-[#9BAAA1] leading-relaxed">
                The 5-stage conversion pipeline measures aggregate traffic volume and channel touchpoints. The system does not claim that every recorded sale was exclusively caused by a single creator.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#101C18] border border-transparent dark:border-[#26372F]/50">
              <span className="font-bold text-slate-800 dark:text-[#F1F5F1] block mb-1">
                3. Gross Revenue vs Profit (FR-030)
              </span>
              <p className="text-slate-500 dark:text-[#9BAAA1] leading-relaxed">
                Campaign revenue equals the gross sum of eligible recorded transactions. Figures do not deduct merchant product cost of goods, taxes, or store overhead, and are not a measure of business profit.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Top Bento KPI Grid (4 Modular Cards matching Stitch f7004aa8) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Attributed Gross Sales */}
        <div className="bg-white dark:bg-[#14211D] p-5 rounded-2xl border border-[#D7DED9]/80 dark:border-[#26372F] shadow-xs hover:border-slate-300 dark:hover:border-[#304239] hover:shadow-md transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9BAAA1]">
                Attributed Gross Sales
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-[#193629] text-emerald-600 dark:text-[#83D1A5] flex items-center justify-center font-bold">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#F1F5F1] tracking-tight">
                {formatETB(activeMetrics.totalRevenueETB || 245850)}
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="inline-flex items-center font-semibold text-emerald-700 dark:text-[#83D1A5] bg-emerald-50 dark:bg-[#193629] px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-[#264D3A] font-mono text-[11px]">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +24.5%
                </span>
                <span className="text-slate-400 dark:text-[#9BAAA1] text-[11px]">vs. previous 30d</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#26372F] flex justify-between text-[11px] text-slate-500 dark:text-[#9BAAA1] font-medium">
            <span>Direct Telebirr / CBE Birr</span>
            <span className="font-mono text-slate-800 dark:text-[#F1F5F1] font-semibold">
              {formatETB((activeMetrics.totalRevenueETB || 245850) * 0.77)}
            </span>
          </div>
        </div>

        {/* KPI 2: Verified Conversions */}
        <div className="bg-white dark:bg-[#14211D] p-5 rounded-2xl border border-[#D7DED9]/80 dark:border-[#26372F] shadow-xs hover:border-slate-300 dark:hover:border-[#304239] hover:shadow-md transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9BAAA1]">
                Verified Conversions
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-[#102220] text-blue-600 dark:text-[#78B99D] flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold font-heading text-slate-900 dark:text-[#F1F5F1] tracking-tight">
                {(activeMetrics.salesCount || 1240).toLocaleString()}{" "}
                <span className="text-sm font-sans font-normal text-slate-500 dark:text-[#9BAAA1]">orders</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="inline-flex items-center font-semibold text-emerald-700 dark:text-[#83D1A5] bg-emerald-50 dark:bg-[#193629] px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-[#264D3A] font-mono text-[11px]">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +18.2%
                </span>
                <span className="text-slate-400 dark:text-[#9BAAA1] text-[11px]">MoM growth</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#26372F] flex justify-between text-[11px] text-slate-500 dark:text-[#9BAAA1] font-medium">
            <span>Avg Order Turnaround</span>
            <span className="font-mono text-slate-800 dark:text-[#F1F5F1] font-semibold">14.2 mins</span>
          </div>
        </div>

        {/* KPI 3: Active Influencers */}
        <div className="bg-white dark:bg-[#14211D] p-5 rounded-2xl border border-[#D7DED9]/80 dark:border-[#26372F] shadow-xs hover:border-slate-300 dark:hover:border-[#304239] hover:shadow-md transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9BAAA1]">
                Active Influencers
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-[#252317] text-amber-600 dark:text-[#F0B85C] flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold font-heading text-slate-900 dark:text-[#F1F5F1] tracking-tight">
                {totalCreators > 0 ? totalCreators : 18}{" "}
                <span className="text-sm font-sans font-normal text-slate-500 dark:text-[#9BAAA1]">creators</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="inline-flex items-center font-medium text-amber-800 dark:text-[#F0B85C] bg-amber-50 dark:bg-[#252317] px-2 py-0.5 rounded border border-amber-200 dark:border-[#3A331E] text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
                  4 pending approval
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#26372F] flex justify-between text-[11px] text-slate-500 dark:text-[#9BAAA1] font-medium">
            <span>Aggregated Reach</span>
            <span className="font-mono text-slate-800 dark:text-[#F1F5F1] font-semibold">314,000 users</span>
          </div>
        </div>

        {/* KPI 4: Blended Conversion Rate */}
        <div className="bg-white dark:bg-[#14211D] p-5 rounded-2xl border border-[#D7DED9]/80 dark:border-[#26372F] shadow-xs hover:border-slate-300 dark:hover:border-[#304239] hover:shadow-md transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9BAAA1]">
                Blended Conversion Rate
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-[#1F192E] text-purple-600 dark:text-[#C084FC] flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#F1F5F1] tracking-tight">
                {activeMetrics.salesConversionRate > 0 ? `${activeMetrics.salesConversionRate}%` : "4.8%"}
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="inline-flex items-center font-semibold text-emerald-700 dark:text-[#83D1A5] bg-emerald-50 dark:bg-[#193629] px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-[#264D3A] font-mono text-[11px]">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +0.7%
                </span>
                <span className="text-slate-400 dark:text-[#9BAAA1] text-[11px]">vs retail benchmark (4.1%)</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#26372F] flex justify-between text-[11px] text-slate-500 dark:text-[#9BAAA1] font-medium">
            <span>In-Store Voucher Redemption</span>
            <span className="font-mono text-slate-800 dark:text-[#F1F5F1] font-semibold">78.4%</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: 2-Column Split (7 cols: Pipeline + 5 cols: Channel Share) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (7 cols): 5-Stage Attribution Conversion Pipeline */}
        <div className="lg:col-span-7 bg-white dark:bg-[#14211D] p-6 rounded-2xl border border-[#D7DED9]/80 dark:border-[#26372F] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <div>
                <h2 className="font-headline font-bold text-base text-slate-900 dark:text-[#F1F5F1] flex items-center gap-2">
                  <span>Attribution Conversion Pipeline</span>
                  <span className="text-[11px] font-normal text-slate-500 dark:text-[#9BAAA1] bg-slate-100 dark:bg-[#101C18] px-2 py-0.5 rounded border border-slate-200 dark:border-[#26372F]">
                    5 Stages
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#9BAAA1] mt-0.5">
                  End-to-end buyer journey from creator link to confirmed settlement
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-[#9BAAA1]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 dark:bg-[#78B99D] inline-block" />
                  <span>Converted</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-[#26372F] inline-block" />
                  <span>Drop-off</span>
                </span>
              </div>
            </div>

            {/* Pipeline Stages */}
            <div className="space-y-4 my-2">
              {/* Stage 1: Creator Link Impressions */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-[#101C18] text-slate-700 dark:text-[#C0CCC4] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-[#F1F5F1] truncate">
                      Creator Link Impressions
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-[#9BAAA1] hidden sm:inline truncate">
                      (Stories, Bios &amp; Telegram posts)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-slate-900 dark:text-[#F1F5F1]">
                      {stage1Impressions.toLocaleString()}
                    </span>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#101C18] text-slate-700 dark:text-[#C0CCC4] w-16 text-right">
                      100.0%
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-[#101C18] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 dark:bg-[#78B99D] rounded-full w-full" />
                </div>
              </div>

              {/* Stage 2: Campaign Landing Page Visits */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-[#101C18] text-slate-700 dark:text-[#C0CCC4] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-[#F1F5F1] truncate">
                      Campaign Landing Page Visits
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-[#9BAAA1] hidden sm:inline truncate">
                      (EthioLink unique tracking slug)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-slate-900 dark:text-[#F1F5F1]">
                      {stage2Visits.toLocaleString()}
                    </span>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-[#193629] text-emerald-700 dark:text-[#83D1A5] w-16 text-right">
                      {stage2Pct}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-[#101C18] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 dark:bg-[#78B99D] rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(8, Number(stage2Pct)))}%` }}
                  />
                </div>
              </div>

              {/* Stage 3: Omnichannel Intent Activation */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-[#101C18] text-slate-700 dark:text-[#C0CCC4] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-[#F1F5F1] truncate">
                      Omnichannel Intent Activation
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-[#9BAAA1] hidden sm:inline truncate">
                      (Telegram clicks &amp; Direct calls)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-slate-900 dark:text-[#F1F5F1]">
                      {stage3Intent.toLocaleString()}
                    </span>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-[#193629] text-emerald-700 dark:text-[#83D1A5] w-16 text-right">
                      {stage3Pct}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-[#101C18] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 dark:bg-[#78B99D] rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(5, Number(stage3Pct)))}%` }}
                  />
                </div>
              </div>

              {/* Stage 4: In-Store POS Promo Code Scans */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-[#101C18] text-slate-700 dark:text-[#C0CCC4] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                      4
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-[#F1F5F1] truncate">
                      In-Store POS Promo Code Scans
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-[#9BAAA1] hidden sm:inline truncate">
                      (Voucher presented at register)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-slate-900 dark:text-[#F1F5F1]">
                      {stage4Scans.toLocaleString()}
                    </span>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-[#193629] text-emerald-700 dark:text-[#83D1A5] w-16 text-right">
                      {stage4Pct}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-[#101C18] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 dark:bg-[#78B99D] rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(3, Number(stage4Pct)))}%` }}
                  />
                </div>
              </div>

              {/* Stage 5: Verified Completed Transactions */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 dark:bg-[#78B99D] text-white dark:text-[#0D2119] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                      5
                    </span>
                    <span className="font-semibold text-emerald-900 dark:text-[#83D1A5] truncate">
                      Verified Completed Transactions
                    </span>
                    <span className="text-[11px] text-emerald-700 dark:text-[#78B99D] font-medium hidden sm:inline truncate">
                      (Paid via CBE/Telebirr/Cash)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-emerald-800 dark:text-[#83D1A5]">
                      {stage5Sales.toLocaleString()}
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-600 dark:bg-[#78B99D] text-white dark:text-[#0D2119] w-16 text-right">
                      {stage5Pct}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-[#101C18] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 dark:bg-[#78B99D] rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(2, Number(stage5Pct)))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-[#26372F] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-[#9BAAA1]">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-[#78B99D]" />
              <span>High intent retention from intent-to-purchase:</span>
              <strong className="text-slate-800 dark:text-[#F1F5F1] font-mono font-semibold">
                {intentToPurchaseRetention}%
              </strong>
            </span>
            <span className="font-mono text-[11px] text-slate-400 dark:text-[#9BAAA1]">
              Attribution Window: 14 Days
            </span>
          </div>
        </div>

        {/* Right Column (5 cols): Omnichannel Channel Share */}
        <div className="lg:col-span-5 bg-white dark:bg-[#14211D] p-6 rounded-2xl border border-[#D7DED9]/80 dark:border-[#26372F] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-headline font-bold text-base text-slate-900 dark:text-[#F1F5F1]">
                  Omnichannel Channel Share
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#9BAAA1] mt-0.5">
                  Revenue and conversion distribution across order touchpoints
                </p>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-400 dark:text-[#9BAAA1] font-medium">Avg Order Value (AOV)</div>
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-[#F1F5F1]">
                  {formatETB(activeMetrics.aovETB || 198.26)}
                </div>
              </div>
            </div>

            {/* Visual Multi-segment Distribution Bar */}
            <div className="mb-5 space-y-1.5">
              <div className="h-4 w-full rounded-lg flex overflow-hidden p-0.5 bg-slate-100 dark:bg-[#101C18] gap-0.5">
                <div
                  style={{ width: `${telegramPct}%` }}
                  className="bg-blue-600 rounded-l-md hover:opacity-90 transition-opacity"
                  title={`Telegram: ${telegramPct}%`}
                />
                <div
                  style={{ width: `${mapPct}%` }}
                  className="bg-emerald-600 dark:bg-[#78B99D] hover:opacity-90 transition-opacity"
                  title={`In-Store POS: ${mapPct}%`}
                />
                <div
                  style={{ width: `${callPct}%` }}
                  className="bg-amber-500 rounded-r-md hover:opacity-90 transition-opacity"
                  title={`Direct Phone: ${callPct}%`}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 dark:text-[#9BAAA1] font-mono">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Channel Breakdown Cards */}
            <div className="space-y-3">
              {/* Telegram Bot */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-[#26372F] bg-slate-50/70 dark:bg-[#101C18] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-[#152733] text-blue-700 dark:text-[#60A5FA] flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-[#F1F5F1]">Telegram Bot &amp; Channel</span>
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-blue-100 dark:bg-[#1E3A4C] text-blue-800 dark:text-[#93C5FD]">
                        {telegramPct}% SHARE
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-[#9BAAA1]">
                      Telebirr &amp; CBE Birr integrated bot orders
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-slate-900 dark:text-[#F1F5F1]">
                    {formatETB(tgRevETB)}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-[#9BAAA1] font-mono">
                    {Math.round(stage5Sales * (telegramPct / 100))} orders
                  </div>
                </div>
              </div>

              {/* In-Store POS */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-[#26372F] bg-slate-50/70 dark:bg-[#101C18] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-[#193629] text-emerald-700 dark:text-[#83D1A5] flex items-center justify-center shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-[#F1F5F1]">In-Store POS Redemptions</span>
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-[#193629] text-emerald-800 dark:text-[#83D1A5]">
                        {mapPct}% SHARE
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-[#9BAAA1]">
                      Bole &amp; Kazanchis physical cashier scans
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-slate-900 dark:text-[#F1F5F1]">
                    {formatETB(posRevETB)}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-[#9BAAA1] font-mono">
                    {Math.round(stage5Sales * (mapPct / 100))} orders
                  </div>
                </div>
              </div>

              {/* Direct Phone */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-[#26372F] bg-slate-50/70 dark:bg-[#101C18] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-[#2B2313] text-amber-800 dark:text-[#F0B85C] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-[#F1F5F1]">Direct Roastery Phone Orders</span>
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-amber-100 dark:bg-[#2B2313] text-amber-900 dark:text-[#F0B85C]">
                        {callPct}% SHARE
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-[#9BAAA1]">
                      Custom grind consultation &amp; dispatch
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-slate-900 dark:text-[#F1F5F1]">
                    {formatETB(callRevETB)}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-[#9BAAA1] font-mono">
                    {Math.round(stage5Sales * (callPct / 100))} orders
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-[#26372F] flex items-center justify-between text-xs text-slate-500 dark:text-[#9BAAA1]">
            <span className="text-[11px]">
              Dominant payment method: <strong className="text-slate-800 dark:text-[#F1F5F1] font-semibold">Telebirr (64.2%)</strong>
            </span>
            <span className="text-emerald-700 dark:text-[#83D1A5] font-medium text-[11px] flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-[#78B99D]" />
              <span>Real-time reconciliation</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Influencer Performance Ledger (Stitch Spec Table) */}
      <section className="bg-white dark:bg-[#14211D] rounded-2xl border border-[#D7DED9]/80 dark:border-[#26372F] shadow-xs overflow-hidden">
        {/* Table Header & Search Filter */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-[#26372F] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-headline font-bold text-base text-slate-900 dark:text-[#F1F5F1] flex items-center gap-2">
              <span>Influencer Performance Ledger</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-[#193629] text-emerald-700 dark:text-[#83D1A5] border border-emerald-200 dark:border-[#264D3A]">
                {filteredCreatorLedger.length} Creators Tracked
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#9BAAA1] mt-0.5">
              Direct coupon code attribution, link tracking, and commission breakdown
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#9BAAA1]" />
              <input
                type="text"
                value={creatorSearchQuery}
                onChange={(e) => setCreatorSearchQuery(e.target.value)}
                placeholder="Search creator or handle..."
                className="pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#101C18] border border-slate-200/80 dark:border-[#304239] rounded-xl w-56 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-800 dark:text-[#F1F5F1] placeholder:text-slate-400"
              />
            </div>
            {onOpenCreateCampaignModal && (
              <button
                type="button"
                onClick={onOpenCreateCampaignModal}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-[#83D1A5] bg-emerald-50 dark:bg-[#193629] border border-emerald-200/80 dark:border-[#264D3A] rounded-xl hover:bg-emerald-100 dark:hover:bg-[#204434] transition-colors cursor-pointer"
              >
                + New Deal
              </button>
            )}
          </div>
        </div>

        {/* High-Fidelity Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-[#101C18] border-b border-slate-100 dark:border-[#26372F] text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9BAAA1]">
                <th className="py-3 px-6">Creator &amp; Handle</th>
                <th className="py-3 px-4">Channel Reach</th>
                <th className="py-3 px-4 text-center">Attributed Orders</th>
                <th className="py-3 px-4 text-right">Attributed Revenue</th>
                <th className="py-3 px-4 text-right">Commission (10%)</th>
                <th className="py-3 px-4 text-center">ROI Multiple</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#26372F]">
              {filteredCreatorLedger.map((cr) => (
                <tr
                  key={cr.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-[#1A2A24]/60 transition-colors group"
                >
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-[#193629] border border-emerald-300 dark:border-[#264D3A] text-emerald-800 dark:text-[#83D1A5] font-bold flex items-center justify-center font-heading text-xs shrink-0 shadow-2xs">
                        {cr.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-[#F1F5F1] flex items-center gap-1.5 truncate">
                          <span>{cr.name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#78B99D] shrink-0" />
                        </div>
                        <div className="text-slate-500 dark:text-[#9BAAA1] font-mono text-[11px] truncate">
                          {cr.handle}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono font-medium text-slate-800 dark:text-[#F1F5F1]">
                      {cr.reach}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-[#9BAAA1] block">
                      {cr.channelType}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="font-mono font-bold text-slate-900 dark:text-[#F1F5F1] bg-slate-100 dark:bg-[#101C18] px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-[#26372F]">
                      {cr.orders}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="font-mono font-bold text-slate-900 dark:text-[#F1F5F1]">
                      {formatETB(cr.revenueETB)}
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-[#78B99D] font-medium">
                      {cr.revenueSharePct}% of total rev
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="font-mono font-semibold text-slate-800 dark:text-[#C0CCC4]">
                      {formatETB(cr.commissionETB)}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-[#9BAAA1]">
                      {cr.payoutMethod}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-50 dark:bg-[#193629] text-emerald-700 dark:text-[#83D1A5] border border-emerald-200/80 dark:border-[#264D3A]">
                      <Rocket className="w-3 h-3 text-emerald-600 dark:text-[#78B99D]" />
                      <span>{cr.roiMultiple.toFixed(1)}x</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-[#193629] text-emerald-800 dark:text-[#83D1A5] border border-transparent dark:border-[#264D3A]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-[#83D1A5] animate-pulse" />
                      <span>{cr.status}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      aria-label="Actions"
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#101C18] transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination / Summary Bar */}
        <div className="px-6 py-3.5 bg-slate-50/60 dark:bg-[#101C18] border-t border-slate-100 dark:border-[#26372F] flex items-center justify-between text-xs text-slate-500 dark:text-[#9BAAA1]">
          <div>
            Showing <span className="font-semibold text-slate-900 dark:text-[#F1F5F1]">{filteredCreatorLedger.length}</span> active creator partnerships
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2.5 py-0.5 bg-slate-200/80 dark:bg-[#1A2A24] rounded font-bold text-slate-800 dark:text-[#F1F5F1]">
              Page 1 of 1
            </span>
          </div>
        </div>
      </section>

      {/* 5. PRD FR-031: Comparative Campaign Performance Matrix & Cohort Benchmarks */}
      <CampaignComparisonMatrix
        campaigns={campaigns}
        brandName={brandName}
        onSelectCampaign={(id) => setSelectedCampaignId(id)}
        onOpenCreateCampaignModal={onOpenCreateCampaignModal}
      />
    </div>
  );

  if (embedded) {
    return (
      <div className="space-y-6">
        {analyticsToolbar}
        {analyticsContent}
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

  return (
    <div className="min-h-screen bg-[#F7F8F5] dark:bg-[#08120F] text-[#202824] dark:text-[#F1F5F1] font-body antialiased pb-20 selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-200">
      {/* Top Application Bar (Consumes Layout Tokens) */}
      <header className="bg-white/95 dark:bg-[#121F1B]/95 backdrop-blur-md border-b border-[#D7DED9]/80 dark:border-[#243730] sticky top-0 z-30 shadow-xs">
        <div className="layout-container min-h-[var(--navbar-height)] px-[var(--page-px)] py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/brand"
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-[#9BAAA1] dark:hover:text-[#F1F5F1] hover:bg-slate-100 dark:hover:bg-[#1A2A24] rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline font-bold text-lg text-slate-900 dark:text-[#F1F5F1] leading-tight">
                  Ethio<span className="text-emerald-600 dark:text-[#78B99D]">Link</span>
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-[#193629] text-emerald-700 dark:text-[#83D1A5] border border-emerald-200 dark:border-[#264D3A]">
                  PRO CONSOLE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#9BAAA1]">
                {brandName} &bull; Omnichannel Performance &amp; Attribution Console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Telemetry Status */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-700 dark:text-[#83D1A5] font-semibold bg-emerald-50 dark:bg-[#193629] border border-emerald-200 dark:border-[#264D3A] px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Telemetry Active (4ms)</span>
            </div>

            {/* Executive Report Modal Trigger */}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#78B99D] dark:hover:bg-[#91C9AE] dark:text-[#0D2119] px-3.5 py-1.5 rounded-xl shadow-xs text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              title="Open Executive Report Preview"
            >
              <FileText className="w-4 h-4" />
              <span>Executive Report</span>
            </button>

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 bg-white dark:bg-[#101C18] hover:bg-slate-50 dark:hover:bg-[#1A2A24] text-slate-700 dark:text-[#C0CCC4] px-3 py-1.5 rounded-xl border border-[#D7DED9]/80 dark:border-[#304239] shadow-xs text-xs font-semibold transition-all hover:text-slate-900 dark:hover:text-[#F1F5F1] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <Download className="w-4 h-4 text-slate-500 dark:text-[#9BAAA1]" />
                  <span>Export (CSV/PDF)</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-[#9BAAA1]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 p-1.5 bg-white dark:bg-[#14211D] border border-[#D7DED9] dark:border-[#26372F] rounded-xl shadow-xl z-50 text-xs"
              >
                <DropdownMenuLabel className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-[#9BAAA1] uppercase tracking-wider">
                  Download Formats
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-[#26372F]" />
                <DropdownMenuItem
                  onClick={handleExportSummaryCSV}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer text-slate-700 dark:text-[#C0CCC4] hover:bg-emerald-50 dark:hover:bg-[#1A2A24] hover:text-emerald-700 dark:hover:text-[#83D1A5] transition-colors"
                >
                  <Table className="w-4 h-4 text-emerald-600 dark:text-[#78B99D] shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-[#F1F5F1]">Executive Summary (.csv)</div>
                    <div className="text-[10px] text-slate-400 dark:text-[#9BAAA1]">
                      Aggregated campaign KPIs &amp; ROI
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleExportAuditCSV}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer text-slate-700 dark:text-[#C0CCC4] hover:bg-emerald-50 dark:hover:bg-[#1A2A24] hover:text-emerald-700 dark:hover:text-[#83D1A5] transition-colors"
                >
                  <Layers className="w-4 h-4 text-emerald-600 dark:text-[#78B99D] shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-[#F1F5F1]">Attribution &amp; Sales Audit (.csv)</div>
                    <div className="text-[10px] text-slate-400 dark:text-[#9BAAA1]">
                      Granular touchpoints &amp; POS redemptions
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-slate-100 dark:border-[#26372F]" />
                <DropdownMenuItem
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer text-slate-700 dark:text-[#C0CCC4] hover:bg-emerald-50 dark:hover:bg-[#1A2A24] hover:text-emerald-700 dark:hover:text-[#83D1A5] transition-colors"
                >
                  <Printer className="w-4 h-4 text-slate-400 dark:text-[#9BAAA1] shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-[#F1F5F1]">Print / Save PDF</div>
                    <div className="text-[10px] text-slate-400 dark:text-[#9BAAA1]">
                      Formatted board-ready executive report
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Secondary Breadcrumbs & Global Filter Strip (Stitch Spec) */}
      <div className="bg-white/80 dark:bg-[#121F1B]/80 backdrop-blur-md border-b border-[#D7DED9]/80 dark:border-[#243730] py-2.5">
        <div className="layout-container px-[var(--page-px)] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Branch Scope Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 dark:text-[#9BAAA1] font-medium flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-slate-500" />
                <span>Branch:</span>
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#101C18] p-0.5 rounded-lg border border-slate-200/60 dark:border-[#26372F]">
                <button
                  type="button"
                  onClick={() => setSelectedBranch("ALL")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    selectedBranch === "ALL"
                      ? "bg-white dark:bg-[#193629] text-emerald-700 dark:text-[#83D1A5] shadow-xs border border-slate-200/80 dark:border-[#264D3A]"
                      : "text-slate-600 dark:text-[#C0CCC4] hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  All Branches (3)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBranch("BOLE")}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    selectedBranch === "BOLE"
                      ? "bg-white dark:bg-[#193629] text-emerald-700 dark:text-[#83D1A5] shadow-xs border border-slate-200/80 dark:border-[#264D3A] font-semibold"
                      : "text-slate-600 dark:text-[#C0CCC4] hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Bole Flagship
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBranch("KAZANCHIS")}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    selectedBranch === "KAZANCHIS"
                      ? "bg-white dark:bg-[#193629] text-emerald-700 dark:text-[#83D1A5] shadow-xs border border-slate-200/80 dark:border-[#264D3A] font-semibold"
                      : "text-slate-600 dark:text-[#C0CCC4] hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Kazanchis Hub
                </button>
              </div>
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-[#26372F] hidden sm:block" />

            {/* Channel Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 dark:text-[#9BAAA1] font-medium flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Channel:</span>
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedChannel("ALL")}
                  className={`px-2.5 py-1 rounded-md font-semibold text-xs border transition-all cursor-pointer ${
                    selectedChannel === "ALL"
                      ? "bg-emerald-50 dark:bg-[#193629] text-emerald-700 dark:text-[#83D1A5] border-emerald-200/80 dark:border-[#264D3A]"
                      : "bg-white dark:bg-[#101C18] text-slate-600 dark:text-[#C0CCC4] border-slate-200 dark:border-[#26372F] hover:bg-slate-50"
                  }`}
                >
                  All Channels
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChannel("TELEGRAM")}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer ${
                    selectedChannel === "TELEGRAM"
                      ? "bg-blue-50 dark:bg-[#152733] text-blue-700 dark:text-[#60A5FA] border-blue-200 dark:border-[#1E3A4C] font-semibold"
                      : "bg-white dark:bg-[#101C18] text-slate-600 dark:text-[#C0CCC4] border-slate-200 dark:border-[#26372F] hover:bg-slate-50"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Telegram Bot</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChannel("POS")}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer ${
                    selectedChannel === "POS"
                      ? "bg-emerald-50 dark:bg-[#193629] text-emerald-700 dark:text-[#83D1A5] border-emerald-200 dark:border-[#264D3A] font-semibold"
                      : "bg-white dark:bg-[#101C18] text-slate-600 dark:text-[#C0CCC4] border-slate-200 dark:border-[#26372F] hover:bg-slate-50"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>In-Store POS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChannel("PHONE")}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer ${
                    selectedChannel === "PHONE"
                      ? "bg-amber-50 dark:bg-[#2B2313] text-amber-800 dark:text-[#F0B85C] border-amber-200 dark:border-[#3A331E] font-semibold"
                      : "bg-white dark:bg-[#101C18] text-slate-600 dark:text-[#C0CCC4] border-slate-200 dark:border-[#26372F] hover:bg-slate-50"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Phone Line</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sync Status Indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#9BAAA1] font-medium shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Telemetry Active</span>
            <span className="text-slate-300 dark:text-[#26372F]">&bull;</span>
            <span className="font-mono text-slate-400 dark:text-[#9BAAA1]">Addis Ababa (EAT)</span>
          </div>
        </div>
      </div>

      <main className="layout-container px-[var(--page-px)] py-8 space-y-8">
        {analyticsContent}
      </main>

      {/* High-Density Status Footer (Stitch Spec) */}
      <footer className="bg-white dark:bg-[#121F1B] border-t border-[#D7DED9]/80 dark:border-[#243730] py-4 mt-auto">
        <div className="layout-container px-[var(--page-px)] flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-[#193629] border border-emerald-200 dark:border-[#264D3A] text-emerald-800 dark:text-[#83D1A5] text-[11px] font-medium font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span>Attribution Engine: Live (Latency 4ms)</span>
              <span className="text-emerald-300 dark:text-[#264D3A]">&bull;</span>
              <span>100% Transactions Synced</span>
            </div>
            <span className="text-slate-300 dark:text-[#26372F] hidden sm:inline">|</span>
            <span className="text-slate-500 dark:text-[#9BAAA1] hidden sm:inline font-medium">
              POS Webhook Gateway v2.4 (Bole / Kazanchis Active)
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 dark:text-[#9BAAA1] text-[11px]">
            <Link href="/brand" className="hover:text-emerald-600 dark:hover:text-[#78B99D] transition-colors">
              Brand Cockpit
            </Link>
            <Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-[#78B99D] transition-colors">
              Privacy &amp; Audit
            </Link>
            <span className="text-slate-300 dark:text-[#26372F]">&bull;</span>
            <span>&copy; 2026 EthioLink platform. Addis Ababa, Ethiopia.</span>
          </div>
        </div>
      </footer>

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
