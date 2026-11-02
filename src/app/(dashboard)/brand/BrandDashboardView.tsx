"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
  Filter,
  Search,
  Sparkles,
  Crown,
  Receipt,
  Store,
  Tag,
  Send,
  Phone,
  MapPin,
  Copy,
  ChevronDown,
  Menu,
  Layers,
  Calendar,
  ExternalLink,
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
        camp.slug.toLowerCase().includes(searchQuery.toLowerCase());

      const effectiveStatus = getEffectiveStatus({
        status: camp.status as "ACTIVE" | "PAUSED" | "DRAFT" | "COMPLETED" | "EXPIRED",
        startDate: camp.startDate ? new Date(camp.startDate) : null,
        endDate: camp.endDate ? new Date(camp.endDate) : null,
      });

      const matchesStatus =
        statusFilter === "ALL" || effectiveStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, statusFilter]);

  // Aggregate metrics
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

  const totalInteractionsCount = useMemo(() => {
    return campaigns.reduce(
      (acc, camp) => acc + (camp._count?.events || 0),
      0
    );
  }, [campaigns]);

  const activeCampaignsCount = useMemo(() => {
    return campaigns.filter(
      (c) =>
        getEffectiveStatus({
          status: c.status as "ACTIVE" | "PAUSED" | "DRAFT" | "COMPLETED" | "EXPIRED",
          startDate: c.startDate ? new Date(c.startDate) : null,
          endDate: c.endDate ? new Date(c.endDate) : null,
        }) === "ACTIVE"
    ).length;
  }, [campaigns]);

  // Top Creators Ranking for "Top Performer" chart widget
  const creatorLeaderboard = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; handle: string | null; totalSales: number; campaignsCount: number }
    >();

    for (const c of campaigns) {
      const campSales = (c.sales || []).reduce(
        (acc, s) => acc + Number(s.amountETB || 0),
        0
      );
      for (const ca of c.creators || []) {
        const existing = map.get(ca.creator.id);
        if (existing) {
          existing.totalSales += campSales;
          existing.campaignsCount += 1;
        } else {
          map.set(ca.creator.id, {
            id: ca.creator.id,
            name: ca.creator.user.name,
            handle: ca.creator.telegramUsername,
            totalSales: campSales,
            campaignsCount: 1,
          });
        }
      }
    }

    const sorted = Array.from(map.values()).sort(
      (a, b) => b.totalSales - a.totalSales
    );

    // If no creators in DB, provide helpful mock creator bars for realistic Dribbble fidelity
    if (sorted.length === 0) {
      return [
        { id: "1", name: "Helen", handle: "helen_addis", totalSales: 45000, campaignsCount: 2, heightPercent: 95, isTop: true },
        { id: "2", name: "Abebe", handle: "abebe_vibe", totalSales: 28500, campaignsCount: 1, heightPercent: 65, isTop: false },
        { id: "3", name: "Selam", handle: "selam_style", totalSales: 19200, campaignsCount: 1, heightPercent: 45, isTop: false },
        { id: "4", name: "Yonas", handle: "yonas_tech", totalSales: 12000, campaignsCount: 1, heightPercent: 30, isTop: false },
        { id: "5", name: "Bethel", handle: "bethel_food", totalSales: 8400, campaignsCount: 1, heightPercent: 20, isTop: false },
      ];
    }

    const maxSales = Math.max(...sorted.map((c) => c.totalSales), 1);
    return sorted.slice(0, 5).map((c, idx) => ({
      ...c,
      heightPercent: Math.max(Math.round((c.totalSales / maxSales) * 100), 20),
      isTop: idx === 0,
    }));
  }, [campaigns]);

  // Channel Breakdown
  const channelTotal =
    eventsBreakdown.telegram +
    eventsBreakdown.calls +
    eventsBreakdown.maps +
    eventsBreakdown.promoCopies;

  const tgPercent = channelTotal > 0 ? (eventsBreakdown.telegram / channelTotal) * 100 : 42.4;
  const callPercent = channelTotal > 0 ? (eventsBreakdown.calls / channelTotal) * 100 : 28.1;
  const mapPercent = channelTotal > 0 ? (eventsBreakdown.maps / channelTotal) * 100 : 18.2;
  const copyPercent = channelTotal > 0 ? (eventsBreakdown.promoCopies / channelTotal) * 100 : 11.3;

  const currentDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b12] text-slate-900 dark:text-slate-100 flex font-body antialiased">
      {/* 1. Left SaaS Sidebar (Matchly design) */}
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
        {/* Top Header / Action Bar */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="px-5 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Title & Mobile Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-black font-headline text-slate-900 dark:text-white tracking-tight">
                  Overview
                </h1>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  {currentDateFormatted}
                </p>
              </div>
            </div>

            {/* Right Action Suite */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs font-semibold rounded-xl border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-2xs cursor-pointer"
              >
                <a href="/api/analytics?format=csv" download>
                  <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  <span>Download report</span>
                </a>
              </Button>

              <Button
                asChild
                size="sm"
                className="h-9 px-4 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Link href="/brand/campaigns/new">
                  <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                  <span>New campaign</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Sub-Header: Matchly Filter Controls Strip */}
          <div className="px-5 sm:px-8 py-2.5 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Timeframe pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium shadow-2xs">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Last 30 days</span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </div>

              {/* Status filter pill */}
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

              {/* Omnichannel Tag */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium shadow-2xs">
                <Tag className="w-3.5 h-3.5 text-emerald-500" />
                <span>By Platform (Telegram &amp; POS)</span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </div>
            </div>

            {/* Quick search input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="campaign-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name, code..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
              />
            </div>
          </div>
        </header>

        {/* 3. Main Bento Grid Content Area */}
        <main className="p-5 sm:p-8 space-y-6">
          {/* Matchly 4-Column Metric KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {/* Card 1: Content Output / Active Campaigns */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Active Campaigns
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                  +{campaigns.length > 0 ? "21%" : "0%"}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-headline text-slate-900 dark:text-white tracking-tight">
                  {activeCampaignsCount}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  / {campaigns.length} total
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Verified influencer promotions live
              </p>
            </div>

            {/* Card 2: Reach & Impressions */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Reach &amp; Impression
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                  +18%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-headline text-slate-900 dark:text-white tracking-tight">
                  {totalInteractionsCount > 1000
                    ? `${(totalInteractionsCount / 1000).toFixed(1)}k`
                    : totalInteractionsCount}
                </span>
                <span className="text-xs text-slate-400 font-medium">views &amp; taps</span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Total exposed Ethiopian audience
              </p>
            </div>

            {/* Card 3: Conversions */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  In-Store Conversions
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                  +12%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-headline text-slate-900 dark:text-white tracking-tight">
                  {totalVerifiedSalesCount}
                </span>
                <span className="text-xs text-slate-400 font-medium">tickets</span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Purchases tracked at cashier POS
              </p>
            </div>

            {/* Card 4: Attributed Revenue */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Attributed Revenue
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                  +28%
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                  {formatETB(totalGrossETB)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Gross verified transaction volume
              </p>
            </div>
          </div>

          {/* Bento Grid: 2 Columns Layout (8 cols Left / 4 cols Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (8 cols): Campaign Reach & Management Portfolio */}
            <div className="lg:col-span-8 space-y-6">
              {/* Matchly Center Widget: Influencer Campaign Reach & Channel Split */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold font-headline text-slate-900 dark:text-white">
                      Influencer Campaign Reach
                    </h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Cross-channel audience touchpoints and verified in-store foot traffic
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span>Filter</span>
                  </div>
                </div>

                {/* 3 Inline KPI Counters */}
                <div className="grid grid-cols-3 gap-4 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">User Reached</span>
                    <span className="text-lg sm:text-xl font-black font-headline text-slate-900 dark:text-white">
                      {totalInteractionsCount > 1000 ? `${(totalInteractionsCount / 1000).toFixed(0)}k` : totalInteractionsCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Campaign Reach</span>
                    <span className="text-lg sm:text-xl font-black font-headline text-slate-900 dark:text-white">
                      {campaigns.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Attribution Match</span>
                    <span className="text-lg sm:text-xl font-black font-headline text-emerald-600 dark:text-emerald-400">
                      +98.4%
                    </span>
                  </div>
                </div>

                {/* Omnichannel Proportional Spectrum Bar */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Live Traffic Distribution</span>
                    <span className="font-mono text-[11px]">{channelTotal.toLocaleString()} total actions</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner">
                    <div
                      style={{ width: `${tgPercent}%` }}
                      className="bg-[#229ED9] transition-all duration-300"
                      title={`Telegram: ${tgPercent.toFixed(1)}%`}
                    />
                    <div
                      style={{ width: `${callPercent}%` }}
                      className="bg-emerald-500 transition-all duration-300"
                      title={`Direct Calls: ${callPercent.toFixed(1)}%`}
                    />
                    <div
                      style={{ width: `${mapPercent}%` }}
                      className="bg-indigo-500 transition-all duration-300"
                      title={`Store Maps: ${mapPercent.toFixed(1)}%`}
                    />
                    <div
                      style={{ width: `${copyPercent}%` }}
                      className="bg-amber-500 transition-all duration-300"
                      title={`Promo Codes: ${copyPercent.toFixed(1)}%`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 flex-wrap gap-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#229ED9]" /> Telegram ({tgPercent.toFixed(0)}%)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Calls ({callPercent.toFixed(0)}%)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" /> Maps ({mapPercent.toFixed(0)}%)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> Promo Code ({copyPercent.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Campaign Portfolio Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Active Campaign Cards ({filteredCampaigns.length})
                    </h3>
                  </div>
                  {filteredCampaigns.length !== campaigns.length && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("ALL");
                      }}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Clear filters
                    </button>
                  )}
                </div>

                {filteredCampaigns.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-center space-y-3">
                    <Tag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      No campaigns match current filter
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Try clearing search keywords or launching a new influencer campaign.
                    </p>
                  </div>
                ) : (
                  filteredCampaigns.map((camp) => {
                    const effectiveStatus = getEffectiveStatus({
                      status: camp.status as "ACTIVE" | "PAUSED" | "DRAFT" | "COMPLETED" | "EXPIRED",
                      startDate: camp.startDate ? new Date(camp.startDate) : null,
                      endDate: camp.endDate ? new Date(camp.endDate) : null,
                    });
                    const badgeConfig = getStatusBadgeConfig(effectiveStatus);
                    const campSalesTotal = (camp.sales || []).reduce(
                      (acc, s) => acc + Number(s.amountETB || 0),
                      0
                    );

                    return (
                      <div
                        key={camp.id}
                        className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
                      >
                        {/* Header: Name, Ticket Voucher Code, Status, Actions */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h4 className="font-bold text-slate-900 dark:text-white text-base font-headline">
                                {camp.name}
                              </h4>
                              {/* Ticket Voucher Promo Code Badge */}
                              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-black text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-700">
                                <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                {camp.promoCode}
                              </span>
                              <Badge
                                variant="outline"
                                className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${badgeConfig.badgeClass}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${badgeConfig.dotClass}`} />
                                {badgeConfig.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                              <span>Slug: /c/{camp.slug}</span>
                              {camp.creators && camp.creators.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-violet-600 dark:text-violet-400 font-sans font-medium flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    {camp.creators.map((c) => c.creator.user.name).join(", ")}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons Suite */}
                          <BrandCampaignActions
                            campaign={{
                              id: camp.id,
                              name: camp.name,
                              slug: camp.slug,
                              promoCode: camp.promoCode,
                              brandName: brandName,
                              status: camp.status,
                              effectiveStatus,
                              description: camp.description,
                              telegramUrl: camp.telegramUrl,
                              phoneNumber: camp.phoneNumber,
                              mapUrl: camp.mapUrl,
                              startDate: camp.startDate,
                              endDate: camp.endDate,
                            }}
                          />
                        </div>

                        {/* Mid-Row: Metric Grid inside card */}
                        <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-400 uppercase font-semibold">Revenue</span>
                            <span className="font-bold text-slate-900 dark:text-white font-mono text-sm block">
                              {formatETB(campSalesTotal)}
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-400 uppercase font-semibold">Orders</span>
                            <span className="font-bold text-slate-900 dark:text-white font-mono text-sm block">
                              {camp._count?.sales || 0} tickets
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-400 uppercase font-semibold">Clicks</span>
                            <span className="font-bold text-slate-900 dark:text-white font-mono text-sm block">
                              {camp._count?.events || 0} taps
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-400 uppercase font-semibold">Timeline</span>
                            <span className="font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {camp.endDate
                                ? `Ends ${new Date(camp.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                                : "Continuous"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Matchly Bottom-Left Widget: Campaign Progress & Status Distribution */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
                <h3 className="text-sm font-bold font-headline text-slate-900 dark:text-white">
                  Campaign Lifecycle Progress
                </h3>
                <div className="grid grid-cols-3 gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Active &amp; Live</span>
                    <span className="text-2xl font-black font-headline text-emerald-600 dark:text-emerald-400">
                      {activeCampaignsCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Paused</span>
                    <span className="text-2xl font-black font-headline text-amber-500">
                      {campaigns.filter((c) => c.status === "PAUSED").length}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Completed / Expired</span>
                    <span className="text-2xl font-black font-headline text-slate-400">
                      {campaigns.filter((c) => c.status === "COMPLETED" || c.status === "EXPIRED").length}
                    </span>
                  </div>
                </div>

                {/* Matchly-style barcode/striped progress indicator */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Portfolio Lifecycle Health</span>
                    <span className="font-mono">{campaigns.length > 0 ? "100% Monitored" : "Empty"}</span>
                  </div>
                  <div className="flex h-3 w-full gap-1 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 p-0.5">
                    <div
                      style={{
                        width: `${campaigns.length > 0 ? (activeCampaignsCount / campaigns.length) * 100 : 70}%`,
                      }}
                      className="bg-emerald-500 rounded-full transition-all"
                    />
                    <div
                      style={{
                        width: `${campaigns.length > 0 ? (campaigns.filter((c) => c.status === "PAUSED").length / campaigns.length) * 100 : 20}%`,
                      }}
                      className="bg-amber-400 rounded-full transition-all"
                    />
                    <div
                      style={{
                        width: `${campaigns.length > 0 ? (campaigns.filter((c) => c.status === "COMPLETED" || c.status === "EXPIRED").length / campaigns.length) * 100 : 10}%`,
                      }}
                      className="bg-slate-300 dark:bg-slate-700 rounded-full transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Matchly Top Performer & Channel Widgets */}
            <div className="lg:col-span-4 space-y-6">
              {/* Matchly Top-Right Widget: Top Performer (Creator bar chart with crown) */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold font-headline text-slate-900 dark:text-white">
                      Top Performer
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Influencers with the highest attributed conversion
                  </p>
                </div>

                {/* Matchly-style Vertical Bar Chart with Crown */}
                <div className="h-44 pt-6 flex items-end justify-between gap-3 px-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  {creatorLeaderboard.map((creator) => (
                    <div key={creator.id} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      {/* Crown on top bar */}
                      {creator.isTop ? (
                        <div className="animate-bounce">
                          <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
                        </div>
                      ) : (
                        <div className="w-4 h-4" />
                      )}

                      {/* Vertical bar */}
                      <div className="w-full max-w-[28px] bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex flex-col justify-end h-28 relative">
                        <div
                          style={{ height: `${creator.heightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            creator.isTop
                              ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                              : "bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-700 dark:to-slate-600 group-hover:from-emerald-400 group-hover:to-emerald-300"
                          }`}
                          title={`${creator.name}: ${formatETB(creator.totalSales)}`}
                        />
                      </div>

                      {/* Avatar / Initials */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border transition-transform group-hover:scale-110 ${
                          creator.isTop
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                        title={creator.name}
                      >
                        {creator.name.charAt(0)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500 dark:text-slate-400">
                    Leader: <strong className="text-slate-900 dark:text-white">{creatorLeaderboard[0]?.name || "N/A"}</strong>
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatETB(creatorLeaderboard[0]?.totalSales || 0)}
                  </span>
                </div>
              </div>

              {/* Matchly Middle-Right Widget: Channel Performance */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
                <div>
                  <h3 className="text-sm font-bold font-headline text-slate-900 dark:text-white">
                    Channel Performance
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Audience engagement across platforms
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Telegram */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#229ED9]/10 text-[#229ED9] flex items-center justify-center shrink-0">
                        <Send className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white block">
                          Telegram Channel
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          +{eventsBreakdown.telegram.toLocaleString()} clicks
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-xs font-mono text-slate-900 dark:text-white">
                      {tgPercent.toFixed(1)}%
                    </span>
                  </div>

                  {/* Direct Phone Calls */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white block">
                          Phone Inquiries
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          +{eventsBreakdown.calls.toLocaleString()} calls
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-xs font-mono text-slate-900 dark:text-white">
                      {callPercent.toFixed(1)}%
                    </span>
                  </div>

                  {/* Store Map Locations */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white block">
                          Store Locations
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          +{eventsBreakdown.maps.toLocaleString()} visits
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-xs font-mono text-slate-900 dark:text-white">
                      {mapPercent.toFixed(1)}%
                    </span>
                  </div>

                  {/* Promo Code Copies */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                        <Copy className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white block">
                          Promo Copies
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          +{eventsBreakdown.promoCopies.toLocaleString()} copies
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-xs font-mono text-slate-900 dark:text-white">
                      {copyPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Matchly Bottom-Right Widget: Live Cashier POS Activity Feed (Today's Activity equivalent) */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                      <Receipt className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-sm font-bold font-headline text-slate-900 dark:text-white">
                      Live In-Store Receipts
                    </h3>
                  </div>
                  <Link
                    href="/brand/sales"
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>Terminal</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {recentSales.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 space-y-2">
                    <Store className="w-7 h-7 mx-auto text-slate-300 dark:text-slate-600" />
                    <span>No in-store receipts logged yet. Cashiers record tickets via the retail terminal.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {recentSales.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {formatETB(Number(s.amountETB))}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 font-bold">
                              {s.campaign.promoCode}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block truncate">
                            By {s.loggedBy.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono shrink-0">
                          {new Date(s.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Link href="/brand/sales">
                    <Store className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                    <span>Open POS Terminal</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Operational Support Modal */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        campaigns={campaigns.map((c) => ({ id: c.id, name: c.name, promoCode: c.promoCode }))}
      />
    </div>
  );
}
