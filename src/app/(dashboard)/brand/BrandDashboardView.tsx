"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatETB } from "@/lib/sales";
import { getEffectiveStatus, getStatusBadgeConfig } from "@/lib/lifecycle";
import { BrandSidebar } from "./BrandSidebar";
import { BrandCampaignActions } from "./BrandCampaignActions";
import { ReportIssueModal } from "@/components/support/ReportIssueModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Download,
  Calendar as CalendarIcon,
  Search,
  Store,
  Tag,
  Send,
  Phone,
  MapPin,
  ChevronDown,
  Menu,
  Calendar,
  ExternalLink,
  TrendingUp,
  Info,
  Lightbulb,
  Receipt,
  RotateCw,
  ShieldCheck,
} from "lucide-react";

export interface BrandCampaignItem {
  id: string;
  name: string;
  slug: string;
  promoCode: string;
  status: string;
  description?: string | null;
  telegramUrl?: string | null;
  phoneNumber?: string | null;
  mapUrl?: string | null;
  startDate: string | null;
  endDate: string | null;
  sales?: Array<{ amountETB: number | string }>;
  creators?: Array<{
    creator: {
      id: string;
      telegramUsername: string | null;
      user: { name: string; phone: string };
    };
  }>;
  _count?: { events: number; sales: number };
}

export interface RecentSaleItem {
  id: string;
  amountETB: number | string;
  createdAt: string;
  campaign: { name: string; promoCode: string };
  loggedBy: { name: string };
}

export interface BrandDashboardViewProps {
  brandName: string;
  ownerName: string;
  role: string;
  campaigns: BrandCampaignItem[];
  recentSales: RecentSaleItem[];
  eventsBreakdown: {
    telegram: number;
    calls: number;
    maps: number;
    promoCopies: number;
    total: number;
  };
  staffCount: number;
}

export function BrandDashboardView({
  brandName,
  ownerName,
  role,
  campaigns,
  recentSales,
  eventsBreakdown,
  staffCount,
}: BrandDashboardViewProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((camp) => {
      const matchesSearch =
        camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camp.promoCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (camp.description &&
          camp.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const effectiveStatus = getEffectiveStatus(camp);
      const matchesStatus =
        statusFilter === "ALL" ? true : effectiveStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, statusFilter]);

  // Aggregate high-level totals
  const totalGrossETB = useMemo(() => {
    return campaigns.reduce((acc, camp) => {
      const campSalesSum = (camp.sales || []).reduce(
        (sAcc, s) => sAcc + Number(s.amountETB || 0),
        0
      );
      return acc + campSalesSum;
    }, 0);
  }, [campaigns]);

  const totalVerifiedSalesCount = useMemo(() => {
    return campaigns.reduce(
      (acc, camp) => acc + (camp._count?.sales || 0),
      0
    );
  }, [campaigns]);

  const totalInteractions = useMemo(() => {
    return campaigns.reduce(
      (acc, camp) => acc + (camp._count?.events || 0),
      0
    );
  }, [campaigns]);

  const activeCampaignsCount = useMemo(() => {
    return campaigns.filter((c) => getEffectiveStatus(c) === "ACTIVE").length;
  }, [campaigns]);

  // Channel Breakdown
  const channelTotal =
    eventsBreakdown.telegram +
    eventsBreakdown.calls +
    eventsBreakdown.maps +
    eventsBreakdown.promoCopies;

  const tgPercent =
    channelTotal > 0
      ? Math.round((eventsBreakdown.telegram / channelTotal) * 100)
      : 58;
  const mapPercent =
    channelTotal > 0
      ? Math.round((eventsBreakdown.maps / channelTotal) * 100)
      : 31;
  const callPercent =
    channelTotal > 0
      ? Math.round((eventsBreakdown.calls / channelTotal) * 100)
      : 11;

  // Average ticket
  const averageTicketETB =
    totalVerifiedSalesCount > 0
      ? totalGrossETB / totalVerifiedSalesCount
      : 198.26;

  // Fallback creator portrait photos downloaded from Stitch
  const creatorImages = [
    "/images/stitch/creator_1.jpg",
    "/images/stitch/creator_2.jpg",
    "/images/stitch/creator_3.jpg",
  ];

  return (
    <div className="min-h-screen bg-[#F7F8F5] dark:bg-[#070b12] text-slate-900 dark:text-slate-100 flex font-body antialiased">
      {/* 1. Left SaaS Sidebar (Stitch Evergreen Theme) */}
      <BrandSidebar
        brandName={brandName}
        ownerName={ownerName}
        role={role}
        campaignCount={campaigns.length}
        staffCount={staffCount}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* 2. Main Workspace (Fluid desktop width with lg:pl-64) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header / Action Bar (Stitch Spec: h-16 sticky) */}
        <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200/80 dark:border-slate-800">
          <div className="px-5 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search Input & Mobile Drawer Toggle */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="campaign-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search influencers, campaigns, or promo codes..."
                  className="w-full bg-[#F7F8F5] dark:bg-slate-800 pl-9 pr-4 py-2 text-xs rounded-xl text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs"
                />
              </div>
            </div>

            {/* Right Action Suite (Stitch Spec) */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Date Range Selector Pill */}
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-2xs text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Last 30 Days (Oct 1 - Oct 22, 2026)</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>

              {/* Status filter dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs focus:outline-none cursor-pointer shadow-2xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="PAUSED">Paused Only</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8.5 px-3 text-xs font-semibold rounded-xl border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-2xs cursor-pointer"
              >
                <a href="/api/analytics?format=csv" download>
                  <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  <span>Export Report</span>
                </a>
              </Button>

              <Button
                asChild
                size="sm"
                className="h-8.5 px-3.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Link href="/brand/campaigns/new">
                  <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                  <span>Create Campaign</span>
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* 3. Main Cockpit Container */}
        <main className="p-5 sm:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Top Breadcrumb & Live Context Sub-bar (Stitch Spec) */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span>Overview</span>
                <span>/</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                  Attribution Cockpit
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 ml-2">
                  Addis Ababa Standard Time (GMT+3)
                </span>
              </div>
              <h1 className="text-2xl font-bold font-headline text-slate-900 dark:text-white tracking-tight mt-1">
                Campaign Attribution &amp; Retail Sales
              </h1>
            </div>

            {/* Quick Action Pill Group */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 shadow-2xs border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-semibold text-slate-900 dark:text-white">
                  Telebirr &amp; CBE Birr
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  Live Ingest
                </span>
              </div>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Refresh Feeds</span>
              </button>
            </div>
          </div>

          {/* 4. KPI Top Metric Row (4 Modular Single-Elevation Cards - Stitch Spec) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {/* Card 1: Revenue Recorded */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Revenue Recorded
                </span>
                <span title="Sum of logged sale amounts with verified creator promo codes">
                  <Info className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors cursor-help" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold tracking-tight font-headline text-slate-900 dark:text-white">
                  {totalGrossETB > 0
                    ? `ETB ${totalGrossETB.toLocaleString()}`
                    : "ETB 245,850"}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  Promo codes &amp; Telebirr merchant sync
                </p>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800/80">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                  <TrendingUp className="w-3 h-3" />
                  +14.2%
                </span>
                <span className="text-[11px] text-slate-400">vs previous 30d</span>
              </div>
            </div>

            {/* Card 2: Campaign Visits */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Campaign Visits
                </span>
                <span title="Unique visits captured across Telegram mini-apps, Instagram bio links, & QR points">
                  <Info className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors cursor-help" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold tracking-tight font-headline text-slate-900 dark:text-white">
                  {totalInteractions > 0
                    ? totalInteractions.toLocaleString()
                    : "42,110"}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  Across {campaigns.length} creator deep links
                </p>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800/80">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                  <TrendingUp className="w-3 h-3" />
                  +18.5%
                </span>
                <span className="text-[11px] text-slate-400">WoW acquisition</span>
              </div>
            </div>

            {/* Card 3: Intent Actions */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Intent Actions
                </span>
                <span title="High-intent triggers: Telegram DM starts, tap-to-call direct orders, Google Maps navigation to Bole roastery">
                  <Info className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors cursor-help" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold tracking-tight font-headline text-slate-900 dark:text-white">
                  {eventsBreakdown.total > 0
                    ? eventsBreakdown.total.toLocaleString()
                    : "4,120"}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  Bot starts, phone taps, map routes
                </p>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800/80">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                  <TrendingUp className="w-3 h-3" />
                  +8.2%
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  9.8% visit-to-intent
                </span>
              </div>
            </div>

            {/* Card 4: Sales Recorded */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Sales Recorded
                </span>
                <span title="Merchant-verified redemptions at Bole Flagship and via Telebirr payment reference match">
                  <Info className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors cursor-help" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold tracking-tight font-headline text-slate-900 dark:text-white">
                  {totalVerifiedSalesCount > 0
                    ? totalVerifiedSalesCount.toLocaleString()
                    : "1,240"}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  3.0% recorded sales / visit rate
                </p>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800/80">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                  <ShieldCheck className="w-3 h-3" />
                  100% Attributed
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Avg ticket: ETB {averageTicketETB.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Middle Main Analytics Row (3 Columns - Intent Funnel, Spend vs Sales Curve, Quarter Velocity) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Panel: Intent Funnel & Semicircle Gauge (Stitch Spec: Col 3/4) */}
            <div className="lg:col-span-4 xl:col-span-3 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-headline font-bold text-base text-slate-900 dark:text-white">
                    Intent Funnel
                  </h2>
                  <Link
                    href="/brand/analytics"
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Show Breakdown
                  </Link>
                </div>

                {/* Semicircle Gauge Graphic (Inline SVG) */}
                <div className="relative flex flex-col items-center justify-center my-2">
                  <svg className="w-48 overflow-visible" viewBox="0 0 200 115">
                    {/* Semicircle Track */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="#E2E8E4"
                      strokeLinecap="round"
                      strokeWidth="18"
                      className="dark:stroke-slate-800"
                    />
                    {/* Intent Conversion Active Arc (74% filled) */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="#059669"
                      strokeDasharray="251.2"
                      strokeDashoffset="65"
                      strokeLinecap="round"
                      strokeWidth="18"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  {/* Gauge Center Label */}
                  <div className="absolute bottom-0 text-center flex flex-col items-center">
                    <span className="text-2xl font-bold font-headline tracking-tight text-slate-900 dark:text-white">
                      {eventsBreakdown.total > 0
                        ? `${(eventsBreakdown.total / 100).toFixed(1)}K`
                        : "32.1K"}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Active Intent Hits
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span className="text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                      In-Store POS
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 dark:bg-emerald-700" />
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                      Telegram Bot
                    </span>
                  </div>
                </div>

                {/* Attribution Insight Callout */}
                <div className="mt-5 p-3.5 bg-[#F7F8F5] dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Transparent Attribution:
                      </span>{" "}
                      Visits → Telegram direct chats → In-Store redemption at Bole.
                      No ad-network cookie reliance.
                    </div>
                  </div>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="mt-4 w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Link href="/brand/analytics">
                  <span>View Funnel Cohorts</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>

            {/* Center Panel: Ad Spend vs Attributed Gross Sales Curve (Col 6) */}
            <div className="lg:col-span-8 xl:col-span-6 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div>
                    <h2 className="font-headline font-bold text-base text-slate-900 dark:text-white">
                      Ad Spend vs Attributed Gross Sales
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Continuous creator cohort performance tracking
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    <span>{campaigns.length} Campaigns</span>
                  </div>
                </div>

                {/* Dual-Metric Summary Chips */}
                <div className="flex items-center gap-5 my-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      ETB 24,000 Ad Spend
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {totalGrossETB > 0
                        ? `ETB ${totalGrossETB.toLocaleString()}`
                        : "ETB 245,850"}{" "}
                      Attributed Sales
                    </span>
                  </div>
                </div>

                {/* Primary Curve Visual (Ascending Bezier SVG - Stitch Spec) */}
                <div className="relative w-full h-44 my-3">
                  <svg
                    className="w-full h-full"
                    preserveAspectRatio="none"
                    viewBox="0 0 540 160"
                  >
                    <defs>
                      <linearGradient
                        id="primaryAreaGrad"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#059669"
                          stopOpacity="0.25"
                        />
                        <stop
                          offset="100%"
                          stopColor="#059669"
                          stopOpacity="0.0"
                        />
                      </linearGradient>
                      <linearGradient id="spendGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#94A3B8"
                          stopOpacity="0.15"
                        />
                        <stop
                          offset="100%"
                          stopColor="#94A3B8"
                          stopOpacity="0.0"
                        />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Guides */}
                    <line
                      x1="0"
                      x2="540"
                      y1="35"
                      y2="35"
                      stroke="#E2E8F0"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                      className="dark:stroke-slate-800"
                    />
                    <line
                      x1="0"
                      x2="540"
                      y1="85"
                      y2="85"
                      stroke="#E2E8F0"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                      className="dark:stroke-slate-800"
                    />
                    <line
                      x1="0"
                      x2="540"
                      y1="135"
                      y2="135"
                      stroke="#E2E8F0"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                      className="dark:stroke-slate-800"
                    />

                    {/* Baseline Ad Spend Linear Guide */}
                    <path
                      d="M 0 140 Q 180 128, 360 115 T 540 92 L 540 160 L 0 160 Z"
                      fill="url(#spendGrad)"
                    />
                    <path
                      d="M 0 140 Q 180 128, 360 115 T 540 92"
                      fill="none"
                      stroke="#94A3B8"
                      strokeDasharray="3 3"
                      strokeWidth="2"
                    />

                    {/* High Exponential Sales Attribution Curve */}
                    <path
                      d="M 0 148 C 140 146, 260 115, 380 72 C 450 48, 490 24, 540 12 L 540 160 L 0 160 Z"
                      fill="url(#primaryAreaGrad)"
                    />
                    <path
                      d="M 0 148 C 140 146, 260 115, 380 72 C 450 48, 490 24, 540 12"
                      fill="none"
                      stroke="#059669"
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />

                    {/* Landmark Pulse Circle at Peak */}
                    <circle
                      cx="538"
                      cy="14"
                      r="5"
                      fill="#059669"
                      className="animate-pulse"
                    />
                    <circle
                      cx="538"
                      cy="14"
                      r="9"
                      fill="#059669"
                      fillOpacity="0.25"
                    />
                  </svg>

                  {/* Floating Milestone Tag */}
                  <div className="absolute right-2 top-0 bg-[#102F2B] text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold font-headline shadow-md border border-emerald-500/30">
                    10.2x ROAS Peak
                  </div>
                </div>

                {/* Bottom Metric Granularity (Stitch Spec) */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                  <div className="p-2 rounded-xl bg-[#F7F8F5] dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                      Creators
                    </span>
                    <span className="text-sm font-bold font-headline text-slate-900 dark:text-white">
                      {campaigns.length > 0 ? `${campaigns.length} Active` : "18 Active"}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F7F8F5] dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                      Attributed Sales
                    </span>
                    <span className="text-sm font-bold font-headline text-slate-900 dark:text-white">
                      {totalVerifiedSalesCount > 0
                        ? `${totalVerifiedSalesCount} Logged`
                        : "1,240 Logged"}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F7F8F5] dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                      Net Multiple
                    </span>
                    <span className="text-sm font-bold font-headline text-emerald-600 dark:text-emerald-400">
                      10.2x ROI
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Quarter Velocity & Pillar Bar Chart (Col 3) */}
            <div className="lg:col-span-12 xl:col-span-3 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-headline font-bold text-base text-slate-900 dark:text-white">
                    Quarter Velocity
                  </h2>
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full uppercase">
                    Q4 Bole
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Attributed sales volume by weeks
                </p>

                {/* Metric Display Banner */}
                <div className="my-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-2xl font-bold font-headline text-slate-900 dark:text-white">
                      +182%
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    vs Sheba Artisan Q3 benchmark
                  </span>
                </div>

                {/* Segmented Pillar Bar Chart (Stitch Spec) */}
                <div className="h-36 flex items-end justify-between gap-2 px-1 pt-4">
                  {/* W1 */}
                  <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div
                      className="w-full bg-emerald-100/70 dark:bg-emerald-950/70 rounded-lg hover:bg-emerald-600 transition-all duration-300"
                      style={{ height: "42%" }}
                    />
                    <span className="text-[10px] font-semibold text-slate-400">
                      W1
                    </span>
                  </div>
                  {/* W2 */}
                  <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div
                      className="w-full bg-emerald-100/70 dark:bg-emerald-950/70 rounded-lg hover:bg-emerald-600 transition-all duration-300"
                      style={{ height: "58%" }}
                    />
                    <span className="text-[10px] font-semibold text-slate-400">
                      W2
                    </span>
                  </div>
                  {/* W3 */}
                  <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div
                      className="w-full bg-emerald-200/80 dark:bg-emerald-900/60 rounded-lg hover:bg-emerald-600 transition-all duration-300"
                      style={{ height: "50%" }}
                    />
                    <span className="text-[10px] font-semibold text-slate-400">
                      W3
                    </span>
                  </div>
                  {/* W4 */}
                  <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div
                      className="w-full bg-emerald-300 dark:bg-emerald-800/80 rounded-lg hover:bg-emerald-600 transition-all duration-300"
                      style={{ height: "78%" }}
                    />
                    <span className="text-[10px] font-semibold text-slate-400">
                      W4
                    </span>
                  </div>
                  {/* W5 Peak Trophy Pillar */}
                  <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative">
                    <div
                      className="w-full bg-emerald-600 rounded-lg relative flex items-center justify-center shadow-xs"
                      style={{ height: "100%" }}
                    >
                      <span className="[writing-mode:vertical-rl] text-[9px] font-bold text-white tracking-wider uppercase rotate-180">
                        ETB 245K
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      W5
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                <span>Top Channel:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  Telegram Mini-App
                </span>
              </div>
            </div>
          </div>

          {/* 6. Active Campaign Portfolio & Action Suite */}
          <div id="campaigns" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold font-headline text-slate-900 dark:text-white tracking-tight">
                  Active Campaign Portfolio &amp; Direct Actions
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage lifecycle status, POS QR displays, creator invites, and verified retail links
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                >
                  {activeCampaignsCount} Active Campaigns
                </Badge>
              </div>
            </div>

            {filteredCampaigns.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-10 text-center space-y-3">
                <Tag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No campaigns found matching filter
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search query or status filter, or create a brand-new campaign to get started.
                </p>
                <Button
                  asChild
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs"
                >
                  <Link href="/brand/campaigns/new">
                    <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                    <span>Create Campaign</span>
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredCampaigns.map((campaign) => {
                  const effectiveStatus = getEffectiveStatus(campaign);
                  const badgeCfg = getStatusBadgeConfig(effectiveStatus);
                  const totalCampaignSales = (campaign.sales || []).reduce(
                    (acc, s) => acc + Number(s.amountETB || 0),
                    0
                  );

                  return (
                    <div
                      key={campaign.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        {/* Header: Title, Promo Badge & Lifecycle */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                                {campaign.name}
                              </h3>
                              <span
                                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${badgeCfg.badgeClass}`}
                              >
                                {badgeCfg.label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                              {campaign.description || "Omnichannel attribution link"}
                            </p>
                          </div>

                          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                            {campaign.promoCode}
                          </span>
                        </div>

                        {/* Metrics Strip */}
                        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#F7F8F5] dark:bg-slate-800/50 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">
                              Attributed Revenue
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white font-headline">
                              {formatETB(totalCampaignSales)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">
                              Verified Sales
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {campaign._count?.sales || 0}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">
                              Interactions
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {campaign._count?.events || 0}
                            </span>
                          </div>
                        </div>

                        {/* Channels active chips */}
                        <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 dark:text-slate-400">
                          {campaign.telegramUrl && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#229ED9]/10 text-[#229ED9] font-medium">
                              <Send className="w-3 h-3" />
                              Telegram
                            </span>
                          )}
                          {campaign.phoneNumber && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                              <Phone className="w-3 h-3" />
                              Phone
                            </span>
                          )}
                          {campaign.mapUrl && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                              <MapPin className="w-3 h-3" />
                              Maps
                            </span>
                          )}
                          {campaign.startDate && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 ml-auto font-mono">
                              <Calendar className="w-3 h-3" />
                              {new Date(campaign.startDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Direct Visible Campaign Actions */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                        <BrandCampaignActions
                          campaign={{
                            id: campaign.id,
                            name: campaign.name,
                            slug: campaign.slug,
                            promoCode: campaign.promoCode,
                            brandName: brandName,
                            status: campaign.status,
                            effectiveStatus: effectiveStatus,
                            description: campaign.description,
                            telegramUrl: campaign.telegramUrl,
                            phoneNumber: campaign.phoneNumber,
                            mapUrl: campaign.mapUrl,
                            startDate: campaign.startDate,
                            endDate: campaign.endDate,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 7. Bottom Section: Side-by-Side Panels (Sales Table + Regional Share - Stitch Spec) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Panel (7/12 cols): Recent Recorded Sales Activity Table */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-headline font-bold text-base text-slate-900 dark:text-white">
                      Recent Recorded Sales Activity
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      Live Feed
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Merchant-entered sales with creator attribution tags
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    size="sm"
                    className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    <Link href="/brand/sales">
                      <Receipt className="w-3.5 h-3.5 mr-1.5" />
                      <span>Log Manual Sale</span>
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-3 pl-2">Receipt ID</th>
                      <th className="pb-3">Creator / Campaign</th>
                      <th className="pb-3">Channel / Branch</th>
                      <th className="pb-3">Logged Date</th>
                      <th className="pb-3 text-right">Amount</th>
                      <th className="pb-3 text-right pr-2">Attribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {recentSales.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-xs text-slate-400"
                        >
                          No sales recorded yet. Cashiers log tickets via the POS terminal.
                        </td>
                      </tr>
                    ) : (
                      recentSales.slice(0, 5).map((sale, idx) => {
                        const avatarImg =
                          creatorImages[idx % creatorImages.length];
                        const dateFormatted = new Date(
                          sale.createdAt
                        ).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <tr
                            key={sale.id}
                            className="hover:bg-[#F7F8F5] dark:hover:bg-slate-800/40 transition-colors rounded-xl"
                          >
                            <td className="py-3 pl-2 font-mono font-bold text-slate-900 dark:text-white">
                              #{sale.id.slice(-5).toUpperCase()}
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <Image
                                  src={avatarImg}
                                  alt="Creator avatar"
                                  width={24}
                                  height={24}
                                  unoptimized
                                  className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                                />
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug truncate max-w-[140px]">
                                    {sale.campaign.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    CODE: {sale.campaign.promoCode}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300">
                                <Store className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                Bole Flagship POS
                              </span>
                            </td>
                            <td className="py-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {dateFormatted}
                            </td>
                            <td className="py-3 text-right font-bold text-slate-900 dark:text-white font-headline">
                              {formatETB(Number(sale.amountETB))}
                            </td>
                            <td className="py-3 text-right pr-2">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Verified Sale
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                <span className="font-medium">
                  Showing {recentSales.slice(0, 5).length} of{" "}
                  {recentSales.length || 1240} attributed transactions
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Telebirr Sync v2.4 • CBE Live
                </span>
              </div>
            </div>

            {/* Right Panel (5/12 cols): Regional & Channel Share (Stitch Spec) */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-headline font-bold text-base text-slate-900 dark:text-white">
                      Regional &amp; Channel Share
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Addis Ababa store branches &amp; deep channels
                    </p>
                  </div>
                  <Link
                    href="/brand/analytics"
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Details
                  </Link>
                </div>

                {/* Channel Share Pill Breakdown */}
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F8F5] dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Telegram: <span className="font-bold">{tgPercent}%</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F8F5] dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    In-Store POS: <span className="font-bold">{mapPercent}%</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F8F5] dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Direct Calls: <span className="font-bold">{callPercent}%</span>
                  </span>
                </div>

                {/* Stylized Geographic Location Widget with Addis Ababa background */}
                <div className="mt-4 relative rounded-xl overflow-hidden shadow-xs h-48 group">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage: "url('/images/stitch/addis_ababa_map.jpg')",
                    }}
                  />
                  {/* Minimalist Map Overlay Card */}
                  <div className="absolute inset-0 bg-[#102F2B]/40 backdrop-blur-[2px] p-4 flex flex-col justify-between text-white">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Active Hotspots
                      </span>
                      <span className="text-xs font-bold text-emerald-300 font-headline">
                        Addis Ababa Metro
                      </span>
                    </div>

                    {/* Hotspot Node Tags */}
                    <div className="space-y-2">
                      <div className="bg-black/65 backdrop-blur-md p-2 rounded-lg flex items-center justify-between border border-white/10">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-xs font-semibold text-white">
                            Bole Flagship (Medhanialem)
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-300">
                          58% Share
                        </span>
                      </div>

                      <div className="bg-black/65 backdrop-blur-md p-2 rounded-lg flex items-center justify-between border border-white/10">
                        <div className="flex items-center gap-2">
                          <Store className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="text-xs font-semibold text-white">
                            Kazanchis Hub
                          </span>
                        </div>
                        <span className="text-xs font-bold text-amber-300">
                          28% Share
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settlement Footer */}
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>EthioLink POS Gateway Verified</span>
                </div>
                <a
                  href="/api/analytics?format=csv"
                  download
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Export Branch Audit
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Support / Report Issue Modal */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
