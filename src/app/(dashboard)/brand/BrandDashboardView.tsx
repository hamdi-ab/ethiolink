"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatETB } from "@/lib/sales";
import { getEffectiveStatus, getStatusBadgeConfig } from "@/lib/lifecycle";
import { BrandSidebar } from "./BrandSidebar";
import { BrandCampaignActions } from "./BrandCampaignActions";
import { SalesTerminal, ActiveCampaign, RecentSale } from "./sales/SalesTerminal";
import { AnalyticsView } from "./analytics/AnalyticsView";
import { BrandPrivacyAuditView } from "./BrandPrivacyAuditView";
import { FunnelMetrics, CampaignAnalyticsResponse } from "@/lib/analytics";
import { ReportIssueModal } from "@/components/support/ReportIssueModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
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
  QrCode,
  UserPlus,
  Check,
  Filter,
} from "lucide-react";
import {
  WeeklyVelocityBucket,
  BranchHotspotItem,
  CreatorRosterItem,
  PeriodTrends,
  resolveSaleChannelAndBranch,
  calculateWeeklyVelocity,
  generateSalesCurvePaths,
} from "./brand-helpers";

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
  notes?: string | null;
  campaign: { id?: string; name: string; promoCode: string };
  loggedBy: { id?: string; name: string };
  isVoided?: boolean;
  voidReason?: string | null;
  voidedAt?: string | null;
  voidedBy?: { id?: string; name?: string } | null;
}

export type BrandDashboardTab = "overview" | "sales" | "analytics" | "privacy";

export interface BrandDashboardViewProps {
  brandName: string;
  ownerName: string;
  brandPhone?: string;
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
  staffList?: Array<{ id: string; name: string; phone: string; role: string }>;
  weeklyVelocity?: WeeklyVelocityBucket[];
  branchHotspots?: BranchHotspotItem[];
  periodTrends?: PeriodTrends;
  creatorRoster?: CreatorRosterItem[];
  currentTimestamp?: string;
}

export function BrandDashboardView({
  brandName,
  ownerName,
  brandPhone,
  role,
  campaigns,
  recentSales,
  eventsBreakdown,
  staffCount,
  staffList = [],
  weeklyVelocity: initialWeeklyVelocity = [],
  branchHotspots: initialBranchHotspots = [],
  periodTrends,
  creatorRoster = [],
  currentTimestamp,
}: BrandDashboardViewProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<BrandDashboardTab>("overview");
  const [localSales, setLocalSales] = useState<RecentSaleItem[]>(recentSales);
  const [localCampaigns, setLocalCampaigns] = useState<BrandCampaignItem[]>(campaigns);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<"7D" | "30D" | "90D" | "ALL">("30D");

  // Read URL query parameter on initial load (e.g., ?tab=sales or ?tab=analytics)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "sales" || tabParam === "analytics" || tabParam === "privacy" || tabParam === "overview") {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleTabChange = (newTab: BrandDashboardTab) => {
    setActiveTab(newTab);
    if (typeof window !== "undefined") {
      const url = newTab === "overview" ? "/brand" : `/brand?tab=${newTab}`;
      window.history.pushState({ tab: newTab }, "", url);
    }
  };

  // Support browser back/forward buttons
  React.useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "sales" || tabParam === "analytics" || tabParam === "privacy") {
        setActiveTab(tabParam);
      } else {
        setActiveTab("overview");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Keep local state in sync when server props revalidate
  React.useEffect(() => {
    setLocalSales(recentSales);
  }, [recentSales]);

  React.useEffect(() => {
    setLocalCampaigns(campaigns);
  }, [campaigns]);

  // Client-side targeted refresh: updates only the dashboard body in place
  const handleRefreshFeeds = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const [salesRes, campRes] = await Promise.all([
        fetch("/api/sales").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/campaigns").then((r) => (r.ok ? r.json() : null)),
      ]);

      if (salesRes?.sales && Array.isArray(salesRes.sales)) {
        setLocalSales(
          salesRes.sales.map((s: { id: string; amountETB: number | string; createdAt: string; notes?: string | null; campaign: { name: string; promoCode: string }; loggedBy: { name: string } }) => ({
            id: s.id,
            amountETB: Number(s.amountETB),
            createdAt: s.createdAt,
            notes: s.notes,
            campaign: s.campaign,
            loggedBy: s.loggedBy,
          }))
        );
      }

      if (campRes?.campaigns && Array.isArray(campRes.campaigns)) {
        setLocalCampaigns(campRes.campaigns);
      }

      toast.success("Cockpit feeds updated");
    } catch {
      toast.error("Failed to sync feeds");
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  // Pure deterministic base time from immutable server timestamp prop
  const baseTime = useMemo(() => {
    return currentTimestamp ? new Date(currentTimestamp).getTime() : 1793774400000;
  }, [currentTimestamp]);

  const baseDate = useMemo(() => new Date(baseTime), [baseTime]);

  // Dynamic date range cutoff in milliseconds
  const dateCutoffMs = useMemo(() => {
    if (dateRange === "ALL") return 0;
    const days = dateRange === "7D" ? 7 : dateRange === "30D" ? 30 : 90;
    return baseTime - days * 24 * 60 * 60 * 1000;
  }, [dateRange, baseTime]);

  // Dynamic date range label string
  const dateRangeLabel = useMemo(() => {
    if (dateRange === "ALL") return "All Time (Complete History)";
    const days = dateRange === "7D" ? 7 : dateRange === "30D" ? 30 : 90;
    const start = new Date(baseTime - days * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `Last ${days} Days (${fmt(start)} - ${fmt(baseDate)})`;
  }, [dateRange, baseTime, baseDate]);

  // Filtered sales matching date window
  const filteredSales = useMemo(() => {
    return localSales.filter((s) => {
      if (dateCutoffMs === 0) return true;
      return new Date(s.createdAt).getTime() >= dateCutoffMs;
    });
  }, [localSales, dateCutoffMs]);

  // Filtered campaigns matching search query & status
  const filteredCampaigns = useMemo(() => {
    return localCampaigns.filter((camp) => {
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
  }, [localCampaigns, searchQuery, statusFilter]);

  // Aggregate high-level totals
  const totalGrossETB = useMemo(() => {
    if (filteredSales.length > 0 || dateRange !== "ALL") {
      return filteredSales.reduce((sum, s) => sum + (Number(s.amountETB) || 0), 0);
    }
    return localCampaigns.reduce((acc, camp) => {
      const campSalesSum = (camp.sales || []).reduce(
        (sAcc, s) => sAcc + Number(s.amountETB || 0),
        0
      );
      return acc + campSalesSum;
    }, 0);
  }, [filteredSales, localCampaigns, dateRange]);

  const totalVerifiedSalesCount = useMemo(() => {
    if (dateRange !== "ALL") {
      return filteredSales.length;
    }
    const campCount = localCampaigns.reduce(
      (acc, camp) => acc + (camp._count?.sales || 0),
      0
    );
    return Math.max(campCount, localSales.length);
  }, [dateRange, filteredSales, localCampaigns, localSales]);

  const totalInteractions = useMemo(() => {
    return localCampaigns.reduce(
      (acc, camp) => acc + (camp._count?.events || 0),
      0
    );
  }, [localCampaigns]);

  const activeCampaignsCount = useMemo(() => {
    return localCampaigns.filter((c) => getEffectiveStatus(c) === "ACTIVE").length;
  }, [localCampaigns]);

  // Dynamic Intent & Conversion Rates
  const visitToIntentRate = useMemo(() => {
    if (totalInteractions === 0) return "0.0";
    return ((eventsBreakdown.total / totalInteractions) * 100).toFixed(1);
  }, [totalInteractions, eventsBreakdown.total]);

  const salesConversionRate = useMemo(() => {
    if (totalInteractions === 0) return "0.0";
    return ((totalVerifiedSalesCount / totalInteractions) * 100).toFixed(1);
  }, [totalInteractions, totalVerifiedSalesCount]);

  const averageTicketETB = useMemo(() => {
    return totalVerifiedSalesCount > 0
      ? totalGrossETB / totalVerifiedSalesCount
      : 0;
  }, [totalGrossETB, totalVerifiedSalesCount]);

  // Dynamic Semicircle Arc Gauge
  const intentConversionRateNumber = useMemo(() => {
    if (totalInteractions === 0) return 0;
    return Math.min(100, Math.round((eventsBreakdown.total / totalInteractions) * 100));
  }, [totalInteractions, eventsBreakdown.total]);

  // Arc length for r=80 is PI * 80 ≈ 251.327
  const strokeDashoffset = useMemo(() => {
    const circumference = 251.327;
    return circumference * (1 - intentConversionRateNumber / 100);
  }, [intentConversionRateNumber]);

  // Dynamic Channel Breakdown Percentages
  const channelTotal =
    eventsBreakdown.telegram +
    eventsBreakdown.calls +
    eventsBreakdown.maps +
    eventsBreakdown.promoCopies;

  const tgPercent =
    channelTotal > 0
      ? Math.round((eventsBreakdown.telegram / channelTotal) * 100)
      : 0;
  const mapPercent =
    channelTotal > 0
      ? Math.round((eventsBreakdown.maps / channelTotal) * 100)
      : 0;
  const callPercent =
    channelTotal > 0
      ? Math.round((eventsBreakdown.calls / channelTotal) * 100)
      : 0;
  const copyPercent =
    channelTotal > 0
      ? Math.round((eventsBreakdown.promoCopies / channelTotal) * 100)
      : 0;

  // Dynamic Top Channel Label
  const topChannelInfo = useMemo(() => {
    const list = [
      { name: "Telegram Mini-App", count: eventsBreakdown.telegram, percent: tgPercent },
      { name: "In-Store POS (Maps)", count: eventsBreakdown.maps, percent: mapPercent },
      { name: "Direct Calls", count: eventsBreakdown.calls, percent: callPercent },
    ];
    list.sort((a, b) => b.count - a.count);
    return list[0] || { name: "Telegram Mini-App", count: 0, percent: 0 };
  }, [eventsBreakdown, tgPercent, mapPercent, callPercent]);

  // Dynamic Weekly Velocity (filtered or initial)
  const currentWeeklyVelocity = useMemo(() => {
    if (filteredSales.length > 0) {
      return calculateWeeklyVelocity(filteredSales, baseDate);
    }
    if (initialWeeklyVelocity.length > 0) {
      return initialWeeklyVelocity;
    }
    return calculateWeeklyVelocity([], baseDate);
  }, [filteredSales, initialWeeklyVelocity, baseDate]);

  // Dynamic Sales Timeline Curve Paths (SVG)
  const salesCurveData = useMemo(() => {
    return generateSalesCurvePaths(filteredSales, 540);
  }, [filteredSales]);

  // Dynamic Net ROI Multiple (Attributed Gross / Creator Payouts @ 10%)
  const estimatedCreatorSpend = totalGrossETB * 0.1;
  const roiMultiple = useMemo(() => {
    if (totalGrossETB <= 0) return "0.0";
    return (totalGrossETB / Math.max(estimatedCreatorSpend, 1)).toFixed(1);
  }, [totalGrossETB, estimatedCreatorSpend]);

  // Unique creators count across portfolio
  const uniqueCreatorsCount = useMemo(() => {
    if (creatorRoster.length > 0) return creatorRoster.length;
    const set = new Set<string>();
    for (const c of localCampaigns) {
      for (const ca of c.creators || []) {
        set.add(ca.creator.id);
      }
    }
    return set.size;
  }, [creatorRoster, localCampaigns]);

  // Fallback creator portrait photos downloaded from Stitch
  const creatorImages = [
    "/images/stitch/creator_1.jpg",
    "/images/stitch/creator_2.jpg",
    "/images/stitch/creator_3.jpg",
  ];

  // In-cockpit Sales Terminal data and handlers
  const terminalCampaigns = useMemo<ActiveCampaign[]>(() => {
    return localCampaigns
      .filter((c) => c.status === "ACTIVE")
      .map((c) => ({
        id: c.id,
        name: c.name,
        promoCode: c.promoCode,
      }));
  }, [localCampaigns]);

  const terminalSales = useMemo<RecentSale[]>(() => {
    return localSales.map((s) => ({
      id: s.id,
      amountETB: Number(s.amountETB),
      notes: s.notes || null,
      createdAt: s.createdAt,
      isVoided: s.isVoided,
      voidReason: s.voidReason,
      voidedAt: s.voidedAt,
      voidedBy: s.voidedBy,
      campaign: {
        id: s.campaign?.id || "",
        name: s.campaign?.name || "Campaign",
        promoCode: s.campaign?.promoCode || "",
      },
      loggedBy: {
        id: s.loggedBy?.id || "",
        name: s.loggedBy?.name || "Cashier",
      },
    }));
  }, [localSales]);

  const handleSaleLogged = (newSale: RecentSale) => {
    setLocalSales((prev) => [
      {
        id: newSale.id,
        amountETB: newSale.amountETB,
        createdAt: newSale.createdAt,
        notes: newSale.notes,
        campaign: newSale.campaign,
        loggedBy: newSale.loggedBy,
        isVoided: newSale.isVoided,
        voidReason: newSale.voidReason,
        voidedAt: newSale.voidedAt,
        voidedBy: newSale.voidedBy,
      },
      ...prev,
    ]);
  };

  const handleSaleVoided = (saleId: string, reason: string) => {
    setLocalSales((prev) =>
      prev.map((s) =>
        s.id === saleId
          ? {
              ...s,
              isVoided: true,
              voidReason: reason,
              voidedAt: new Date().toISOString(),
              voidedBy: { name: ownerName },
            }
          : s
      )
    );
  };

  // In-cockpit Analytics data
  const analyticsSummary = useMemo<FunnelMetrics>(() => {
    const totalTouchpoints = eventsBreakdown.total || 0;
    const sCount = filteredSales.length;
    const aov = sCount > 0 ? totalGrossETB / sCount : 0;
    return {
      pageViews: totalTouchpoints > 0 ? totalTouchpoints * 2 : 0,
      uniqueVisitors: totalTouchpoints > 0 ? Math.round(totalTouchpoints * 0.85) : 0,
      telegramClicks: eventsBreakdown.telegram,
      callClicks: eventsBreakdown.calls,
      mapClicks: eventsBreakdown.maps,
      copyCodeClicks: eventsBreakdown.promoCopies,
      totalClicks: totalTouchpoints,
      salesCount: sCount,
      totalRevenueETB: totalGrossETB,
      clickThroughRate:
        totalTouchpoints > 0
          ? Math.min(100, Math.round((totalTouchpoints / (totalTouchpoints * 2)) * 100))
          : 0,
      salesConversionRate:
        totalTouchpoints > 0 ? Math.round((sCount / totalTouchpoints) * 1000) / 10 : 0,
      aovETB: Math.round(aov * 100) / 100,
    };
  }, [eventsBreakdown, filteredSales.length, totalGrossETB]);

  const analyticsCampaigns = useMemo<CampaignAnalyticsResponse[]>(() => {
    return localCampaigns.map((camp) => {
      const campSales = camp.sales || [];
      const campSalesCount = campSales.length;
      const campRevenue = campSales.reduce((acc, s) => acc + Number(s.amountETB || 0), 0);
      const campEvents = camp._count?.events || 0;
      const aov = campSalesCount > 0 ? campRevenue / campSalesCount : 0;

      return {
        campaignId: camp.id,
        campaignName: camp.name,
        slug: camp.slug,
        promoCode: camp.promoCode,
        status: camp.status,
        startDate: camp.startDate,
        endDate: camp.endDate,
        pageViews: campEvents * 2,
        uniqueVisitors: Math.round(campEvents * 0.85),
        telegramClicks: Math.round(campEvents * 0.4),
        callClicks: Math.round(campEvents * 0.3),
        mapClicks: Math.round(campEvents * 0.2),
        copyCodeClicks: Math.round(campEvents * 0.1),
        totalClicks: campEvents,
        salesCount: campSalesCount,
        totalRevenueETB: campRevenue,
        clickThroughRate: campEvents > 0 ? 50 : 0,
        salesConversionRate: campEvents > 0 ? Math.round((campSalesCount / campEvents) * 1000) / 10 : 0,
        aovETB: Math.round(aov * 100) / 100,
        creators: (camp.creators || []).map((ca) => ({
          name: ca.creator.user.name,
          telegramUsername: ca.creator.telegramUsername,
        })),
      };
    });
  }, [localCampaigns]);

  return (
    <div className="min-h-screen bg-[#F7F8F5] dark:bg-[#0D1714] text-[#202824] dark:text-[#F1F5F1] flex font-body antialiased transition-colors duration-150">
      {/* 1. Left SaaS Sidebar (The Dark Anchor — Deep Evergreen #10352F) */}
      <BrandSidebar
        brandName={brandName}
        ownerName={ownerName}
        brandPhone={brandPhone}
        role={role}
        campaignCount={localCampaigns.length}
        staffCount={staffCount}
        staffList={staffList}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        eventsBreakdown={eventsBreakdown}
        creatorRoster={creatorRoster}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* 2. Main Workspace (Fluid desktop width with lg:pl-64) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header / Action Bar (Stitch Spec: h-16 sticky) */}
        <header className="bg-white/90 dark:bg-[#14211D]/90 backdrop-blur-md sticky top-0 z-20 border-b border-[#D7DED9]/80 dark:border-[#26372F]">
          <div className="px-5 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search Input & Mobile Drawer Toggle */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-[#C0CCC4] hover:bg-[#F0F2EF] dark:hover:bg-[#1A2A24] transition-colors cursor-pointer"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#9BAAA1]" />
                <input
                  id="campaign-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search influencers, campaigns, or promo codes..."
                  className="w-full bg-[#F7F8F5] dark:bg-[#101C18] pl-9 pr-4 py-2 text-xs rounded-xl text-[#202824] dark:text-[#F1F5F1] placeholder:text-slate-400 dark:placeholder:text-[#9BAAA1]/60 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:focus:ring-[#91C9AE] border border-[#D7DED9]/80 dark:border-[#304239] shadow-2xs transition-colors"
                />
              </div>
            </div>

            {/* Right Action Suite */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Dynamic Theme-Responsive Date Range Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="h-8.5 flex items-center gap-2 bg-white dark:bg-[#14211D] border border-[#D7DED9]/80 dark:border-[#304239] px-3 rounded-xl shadow-2xs text-xs font-semibold text-slate-700 dark:text-[#C0CCC4] hover:bg-[#F0F2EF] dark:hover:bg-[#1A2A24] hover:border-emerald-500/50 dark:hover:border-[#78B99D]/50 focus:outline-none focus:ring-1 focus:ring-emerald-600/40 dark:focus:ring-[#78B99D]/40 transition-all cursor-pointer"
                    aria-label="Filter date range"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400 dark:text-[#9BAAA1]" />
                    <span>{dateRangeLabel}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 dark:text-[#9BAAA1]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 p-1.5 bg-white dark:bg-[#14211D] border border-[#D7DED9] dark:border-[#26372F] shadow-lg rounded-xl z-50 text-xs"
                >
                  <DropdownMenuLabel className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9BAAA1]">
                    Time Horizon
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-[#26372F]" />
                  {[
                    { id: "7D", label: "Last 7 Days", desc: "Past week velocity" },
                    { id: "30D", label: "Last 30 Days", desc: "Default monthly window" },
                    { id: "90D", label: "Last 90 Days", desc: "Quarterly trajectory" },
                    { id: "ALL", label: "All Time", desc: "Complete historical ledger" },
                  ].map((opt) => (
                    <DropdownMenuItem
                      key={opt.id}
                      onClick={() => setDateRange(opt.id as "7D" | "30D" | "90D" | "ALL")}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
                        dateRange === opt.id
                          ? "bg-emerald-50 dark:bg-[#193629] text-emerald-800 dark:text-[#83D1A5] font-semibold"
                          : "text-slate-700 dark:text-[#C0CCC4] hover:bg-slate-50 dark:hover:bg-[#1A2A24]"
                      }`}
                    >
                      <div>
                        <span className="block leading-tight">{opt.label}</span>
                        <span className="block text-[11px] text-slate-400 dark:text-[#9BAAA1] mt-0.5">
                          {opt.desc}
                        </span>
                      </div>
                      {dateRange === opt.id && (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-[#78B99D]" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Dynamic Theme-Responsive Status Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="h-8.5 flex items-center gap-2 bg-white dark:bg-[#14211D] border border-[#D7DED9]/80 dark:border-[#304239] px-3 rounded-xl shadow-2xs text-xs font-semibold text-slate-700 dark:text-[#C0CCC4] hover:bg-[#F0F2EF] dark:hover:bg-[#1A2A24] hover:border-emerald-500/50 dark:hover:border-[#78B99D]/50 focus:outline-none focus:ring-1 focus:ring-emerald-600/40 dark:focus:ring-[#78B99D]/40 transition-all cursor-pointer"
                    aria-label="Filter campaign status"
                  >
                    <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-[#9BAAA1]" />
                    <span>
                      {statusFilter === "ALL"
                        ? "All Statuses"
                        : statusFilter === "ACTIVE"
                        ? "Active Only"
                        : statusFilter === "PAUSED"
                        ? "Paused Only"
                        : "Completed"}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400 dark:text-[#9BAAA1]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-44 p-1.5 bg-white dark:bg-[#14211D] border border-[#D7DED9] dark:border-[#26372F] shadow-lg rounded-xl z-50 text-xs"
                >
                  <DropdownMenuLabel className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9BAAA1]">
                    Campaign Lifecycle
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-[#26372F]" />
                  {[
                    { id: "ALL", label: "All Statuses", color: "bg-slate-400" },
                    { id: "ACTIVE", label: "Active Only", color: "bg-emerald-500 dark:bg-[#83D1A5]" },
                    { id: "PAUSED", label: "Paused Only", color: "bg-amber-400 dark:bg-[#F0B85C]" },
                    { id: "COMPLETED", label: "Completed", color: "bg-slate-400 dark:bg-[#9BAAA1]" },
                  ].map((opt) => (
                    <DropdownMenuItem
                      key={opt.id}
                      onClick={() => setStatusFilter(opt.id)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
                        statusFilter === opt.id
                          ? "bg-emerald-50 dark:bg-[#193629] text-emerald-800 dark:text-[#83D1A5] font-semibold"
                          : "text-slate-700 dark:text-[#C0CCC4] hover:bg-slate-50 dark:hover:bg-[#1A2A24]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                        <span>{opt.label}</span>
                      </div>
                      {statusFilter === opt.id && (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-[#78B99D]" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8.5 px-3 text-xs font-semibold rounded-xl border-[#D7DED9]/80 dark:border-[#304239] bg-white dark:bg-[#14211D] text-slate-700 dark:text-[#C0CCC4] hover:bg-[#F0F2EF] dark:hover:bg-[#1A2A24] shadow-2xs cursor-pointer"
              >
                <a href="/api/analytics?format=csv" download>
                  <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500 dark:text-[#9BAAA1]" />
                  <span>Export Report</span>
                </a>
              </Button>

              <Button
                asChild
                size="sm"
                className="h-8.5 px-3.5 text-xs font-semibold rounded-xl bg-[#287362] hover:bg-[#205B50] text-white dark:bg-[#78B99D] dark:hover:bg-[#91C9AE] dark:text-[#0D2119] shadow-xs shadow-emerald-950/20 active:scale-[0.98] transition-all cursor-pointer font-bold"
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
          {/* Top Breadcrumb & Live Context Sub-bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-[#9BAAA1] uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => handleTabChange("overview")}
                  className="hover:text-emerald-700 dark:hover:text-[#78B99D] cursor-pointer"
                >
                  Overview
                </button>
                <span>/</span>
                <span className="text-emerald-700 dark:text-[#78B99D] font-bold">
                  {activeTab === "sales"
                    ? "POS Register"
                    : activeTab === "analytics"
                    ? "Attribution Analytics"
                    : activeTab === "privacy"
                    ? "Privacy & Data Audit"
                    : "Attribution Cockpit"}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100/70 dark:bg-[#193629] text-emerald-800 dark:text-[#83D1A5] border border-transparent dark:border-[#264D3A] ml-2">
                  Addis Ababa Standard Time (GMT+3)
                </span>
              </div>
              <h1 className="text-2xl font-bold font-headline text-slate-900 dark:text-[#F1F5F1] tracking-tight mt-1">
                {activeTab === "sales"
                  ? "In-Store POS Terminal & Retail Attribution"
                  : activeTab === "analytics"
                  ? "Omnichannel Performance & Conversion Funnel"
                  : activeTab === "privacy"
                  ? "Privacy, Telemetry & Data Retention Audit"
                  : "Campaign Attribution & Retail Sales"}
              </h1>
            </div>

            {/* Quick Action Pill Group */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#14211D] shadow-2xs border border-[#D7DED9]/80 dark:border-[#304239] text-xs text-slate-600 dark:text-[#C0CCC4] font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-[#83D1A5] animate-ping" />
                <span className="font-semibold text-slate-900 dark:text-[#F1F5F1]">
                  Telebirr &amp; CBE Birr
                </span>
                <span className="text-slate-300 dark:text-[#304239]">|</span>
                <span className="text-emerald-700 dark:text-[#83D1A5] font-semibold">
                  Live Ingest
                </span>
              </div>

              <button
                type="button"
                onClick={handleRefreshFeeds}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#14211D] hover:bg-[#F0F2EF] dark:hover:bg-[#1A2A24] border border-[#D7DED9]/80 dark:border-[#304239] text-xs font-semibold text-slate-700 dark:text-[#C0CCC4] transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
              >
                <RotateCw
                  className={`w-3.5 h-3.5 text-emerald-600 dark:text-[#78B99D] ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                <span>{isRefreshing ? "Syncing..." : "Refresh Feeds"}</span>
              </button>
            </div>
          </div>

          {/* In-Cockpit View Switching: Body updates in place without navigating away */}
          {activeTab === "sales" && (
            <SalesTerminal
              userName={ownerName}
              userRole={role}
              brandName={brandName}
              initialCampaigns={terminalCampaigns}
              initialSales={terminalSales}
              embedded={true}
              onSaleLogged={handleSaleLogged}
              onSaleVoided={handleSaleVoided}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsView
              brandName={brandName}
              summary={analyticsSummary}
              campaigns={analyticsCampaigns}
              auditEntries={[]}
              embedded={true}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === "privacy" && (
            <BrandPrivacyAuditView
              brandName={brandName}
              onNavigateTab={handleTabChange}
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          )}

          {activeTab === "overview" && (
            <>
          {/* 4. KPI Top Metric Row (4 Modular Dynamic Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {/* Card 1: Revenue Recorded */}
            <div className="bg-white dark:bg-[#14211D] rounded-2xl p-5 shadow-xs border border-[#D7DED9]/80 dark:border-[#26372F] hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9BAAA1]">
                  Revenue Recorded
                </span>
                <span title="Sum of verified sale amounts with matched creator promo codes">
                  <Info className="w-4 h-4 text-slate-400 dark:text-[#9BAAA1] group-hover:text-emerald-600 dark:group-hover:text-[#78B99D] transition-colors cursor-help" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold tracking-tight font-headline text-slate-900 dark:text-[#F1F5F1]">
                  {formatETB(totalGrossETB)}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-[#C0CCC4] mt-0.5 truncate">
                  Promo codes &amp; Telebirr merchant sync
                </p>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between text-xs border-t border-slate-100 dark:border-[#26372F]">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-[#193629] text-emerald-700 dark:text-[#83D1A5] border border-transparent dark:border-[#264D3A] font-semibold text-[11px]">
                  <TrendingUp className="w-3 h-3" />
                  {periodTrends?.revenueTrendPercent !== null && periodTrends?.revenueTrendPercent !== undefined
                    ? `${periodTrends.revenueTrendPercent >= 0 ? "+" : ""}${periodTrends.revenueTrendPercent}%`
                    : "+100%"}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-[#9BAAA1]">
                  {periodTrends?.revenueTrendPercent !== null ? "vs previous 30d" : "Baseline Period"}
                </span>
              </div>
            </div>

            {/* Card 2: Campaign Visits */}
            <div className="bg-white dark:bg-[#14211D] rounded-2xl p-5 shadow-xs border border-[#D7DED9]/80 dark:border-[#26372F] hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9BAAA1]">
                  Campaign Visits
                </span>
                <span title="Unique visits captured across Telegram mini-apps, Instagram bio links, & QR points">
                  <Info className="w-4 h-4 text-slate-400 dark:text-[#9BAAA1] group-hover:text-emerald-600 dark:group-hover:text-[#78B99D] transition-colors cursor-help" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold tracking-tight font-headline text-slate-900 dark:text-[#F1F5F1]">
                  {totalInteractions.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-[#C0CCC4] mt-0.5 truncate">
                  Across {localCampaigns.length} creator deep links
                </p>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between text-xs border-t border-slate-100 dark:border-[#26372F]">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-[#193629] text-emerald-700 dark:text-[#83D1A5] border border-transparent dark:border-[#264D3A] font-semibold text-[11px]">
                  <TrendingUp className="w-3 h-3" />
                  {periodTrends?.visitsTrendPercent !== null && periodTrends?.visitsTrendPercent !== undefined
                    ? `${periodTrends.visitsTrendPercent >= 0 ? "+" : ""}${periodTrends.visitsTrendPercent}%`
                    : "+18.5%"}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-[#9BAAA1]">WoW acquisition</span>
              </div>
            </div>

            {/* Card 3: Intent Actions */}
            <div className="bg-white dark:bg-[#14211D] rounded-2xl p-5 shadow-xs border border-[#D7DED9]/80 dark:border-[#26372F] hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9BAAA1]">
                  Intent Actions
                </span>
                <span title="High-intent triggers: Telegram DM starts, tap-to-call direct orders, Google Maps navigation to store">
                  <Info className="w-4 h-4 text-slate-400 dark:text-[#9BAAA1] group-hover:text-emerald-600 dark:group-hover:text-[#78B99D] transition-colors cursor-help" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold tracking-tight font-headline text-slate-900 dark:text-[#F1F5F1]">
                  {eventsBreakdown.total.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-[#C0CCC4] mt-0.5 truncate">
                  Bot starts, phone taps, map routes
                </p>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between text-xs border-t border-slate-100 dark:border-[#26372F]">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-[#193629] text-emerald-700 dark:text-[#83D1A5] border border-transparent dark:border-[#264D3A] font-semibold text-[11px]">
                  <TrendingUp className="w-3 h-3" />
                  {visitToIntentRate}%
                </span>
                <span className="text-[11px] text-slate-500 dark:text-[#9BAAA1] font-medium">
                  visit-to-intent rate
                </span>
              </div>
            </div>

            {/* Card 4: Sales Recorded */}
            <div className="bg-white dark:bg-[#14211D] rounded-2xl p-5 shadow-xs border border-[#D7DED9]/80 dark:border-[#26372F] hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9BAAA1]">
                  Sales Recorded
                </span>
                <span title="Merchant-verified redemptions at Bole Flagship and via Telebirr payment reference match">
                  <Info className="w-4 h-4 text-slate-400 dark:text-[#9BAAA1] group-hover:text-emerald-600 dark:group-hover:text-[#78B99D] transition-colors cursor-help" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold tracking-tight font-headline text-slate-900 dark:text-[#F1F5F1]">
                  {totalVerifiedSalesCount.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-[#C0CCC4] mt-0.5 truncate">
                  {salesConversionRate}% recorded sales / visit rate
                </p>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between text-xs border-t border-slate-100 dark:border-[#26372F]">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-[#193629] text-emerald-700 dark:text-[#83D1A5] border border-transparent dark:border-[#264D3A] font-semibold text-[11px]">
                  <ShieldCheck className="w-3 h-3" />
                  100% Attributed
                </span>
                <span className="text-[11px] text-slate-500 dark:text-[#9BAAA1] font-medium">
                  Avg ticket: {formatETB(averageTicketETB)}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Middle Main Analytics Row (3 Columns - Intent Funnel, Spend vs Sales Curve, Quarter Velocity) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Panel: Intent Funnel & Semicircle Dynamic Gauge */}
            <div className="lg:col-span-4 xl:col-span-3 bg-white dark:bg-[#14211D] rounded-2xl p-6 shadow-xs border border-[#D7DED9]/80 dark:border-[#26372F] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-headline font-bold text-base text-slate-900 dark:text-[#F1F5F1]">
                    Intent Funnel
                  </h2>
                  <button
                    type="button"
                    onClick={() => handleTabChange("analytics")}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-[#78B99D] hover:underline cursor-pointer"
                  >
                    Show Breakdown
                  </button>
                </div>

                {/* Semicircle Gauge Graphic (Dynamic SVG) */}
                <div className="relative flex flex-col items-center justify-center my-2">
                  <svg className="w-48 overflow-visible" viewBox="0 0 200 115">
                    {/* Semicircle Track */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="#E2E8E4"
                      strokeLinecap="round"
                      strokeWidth="18"
                      className="dark:stroke-[#1A2A24]"
                    />
                    {/* Dynamic Intent Conversion Active Arc */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="#059669"
                      strokeDasharray="251.2"
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      strokeWidth="18"
                      className="dark:stroke-[#78B99D] transition-all duration-1000"
                    />
                  </svg>
                  {/* Gauge Center Label */}
                  <div className="absolute bottom-0 text-center flex flex-col items-center">
                    <span className="text-2xl font-bold font-headline tracking-tight text-slate-900 dark:text-[#F1F5F1]">
                      {eventsBreakdown.total >= 1000
                        ? `${(eventsBreakdown.total / 1000).toFixed(1)}K`
                        : eventsBreakdown.total.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-[#9BAAA1] uppercase tracking-wider">
                      {intentConversionRateNumber}% Active Intent
                    </span>
                  </div>
                </div>

                {/* Dynamic Channel Breakdown under Gauge */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="p-2 rounded-lg bg-[#F7F8F5] dark:bg-[#101C18] border border-slate-200/50 dark:border-[#26372F]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#229ED9]" />
                      <span className="text-slate-500 dark:text-[#9BAAA1] text-[11px]">Telegram</span>
                    </div>
                    <span className="font-bold text-xs text-slate-800 dark:text-[#F1F5F1] block mt-0.5">
                      {eventsBreakdown.telegram.toLocaleString()} ({tgPercent}%)
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F7F8F5] dark:bg-[#101C18] border border-slate-200/50 dark:border-[#26372F]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-[#78B99D]" />
                      <span className="text-slate-500 dark:text-[#9BAAA1] text-[11px]">In-Store Maps</span>
                    </div>
                    <span className="font-bold text-xs text-slate-800 dark:text-[#F1F5F1] block mt-0.5">
                      {eventsBreakdown.maps.toLocaleString()} ({mapPercent}%)
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F7F8F5] dark:bg-[#101C18] border border-slate-200/50 dark:border-[#26372F]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-[#F0B85C]" />
                      <span className="text-slate-500 dark:text-[#9BAAA1] text-[11px]">Direct Calls</span>
                    </div>
                    <span className="font-bold text-xs text-slate-800 dark:text-[#F1F5F1] block mt-0.5">
                      {eventsBreakdown.calls.toLocaleString()} ({callPercent}%)
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F7F8F5] dark:bg-[#101C18] border border-slate-200/50 dark:border-[#26372F]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-[#69756F]" />
                      <span className="text-slate-500 dark:text-[#9BAAA1] text-[11px]">Promo Copies</span>
                    </div>
                    <span className="font-bold text-xs text-slate-800 dark:text-[#F1F5F1] block mt-0.5">
                      {eventsBreakdown.promoCopies.toLocaleString()} ({copyPercent}%)
                    </span>
                  </div>
                </div>

                {/* Attribution Insight Callout */}
                <div className="mt-4 p-3 bg-[#F7F8F5] dark:bg-[#101C18] rounded-xl border border-slate-200/60 dark:border-[#26372F]">
                  <div className="flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-500 dark:text-[#F0B85C] shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed text-slate-600 dark:text-[#C0CCC4]">
                      <span className="font-semibold text-slate-900 dark:text-[#F1F5F1]">
                        Transparent Attribution:
                      </span>{" "}
                      Visits → Telegram direct chats → In-Store redemption at Bole.
                      No ad-network cookie reliance.
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => handleTabChange("analytics")}
                className="mt-4 w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-[#193629] dark:hover:bg-[#204434] border-emerald-200 dark:border-[#264D3A] text-emerald-800 dark:text-[#83D1A5] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Funnel Cohorts</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Center Panel: Ad Spend vs Attributed Gross Sales Dynamic Timeline Curve */}
            <div className="lg:col-span-8 xl:col-span-6 bg-white dark:bg-[#14211D] rounded-2xl p-6 shadow-xs border border-[#D7DED9]/80 dark:border-[#26372F] flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div>
                    <h2 className="font-headline font-bold text-base text-slate-900 dark:text-[#F1F5F1]">
                      Ad Spend vs Attributed Gross Sales
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-[#9BAAA1]">
                      Continuous creator cohort performance tracking
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-[#C0CCC4] bg-[#F0F2EF] dark:bg-[#1A2A24] px-2.5 py-1 rounded-lg">
                    <span>{localCampaigns.length} Campaigns</span>
                  </div>
                </div>

                {/* Dynamic Dual-Metric Summary Chips */}
                <div className="flex items-center gap-5 my-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-[#69756F]" />
                    <span className="text-xs text-slate-600 dark:text-[#C0CCC4] font-medium">
                      {formatETB(estimatedCreatorSpend)} Est. Payouts (10%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-[#78B99D]" />
                    <span className="text-xs font-semibold text-emerald-700 dark:text-[#78B99D]">
                      {formatETB(totalGrossETB)} Attributed Sales
                    </span>
                  </div>
                </div>

                {/* Primary Curve Visual (Dynamic SVG Bezier Curve) */}
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
                      className="dark:stroke-[#26372F]"
                    />
                    <line
                      x1="0"
                      x2="540"
                      y1="85"
                      y2="85"
                      stroke="#E2E8F0"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                      className="dark:stroke-[#26372F]"
                    />
                    <line
                      x1="0"
                      x2="540"
                      y1="135"
                      y2="135"
                      stroke="#E2E8F0"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                      className="dark:stroke-[#26372F]"
                    />

                    {/* Baseline Ad Spend / Payouts Curve */}
                    <path
                      d={salesCurveData.spendAreaPath}
                      fill="url(#spendGrad)"
                    />
                    <path
                      d={salesCurveData.spendStrokePath}
                      fill="none"
                      stroke="#94A3B8"
                      strokeDasharray="3 3"
                      strokeWidth="2"
                      className="dark:stroke-[#53605A]"
                    />

                    {/* Dynamic High Attributed Sales Curve */}
                    <path
                      d={salesCurveData.salesAreaPath}
                      fill="url(#primaryAreaGrad)"
                    />
                    <path
                      d={salesCurveData.salesStrokePath}
                      fill="none"
                      stroke="#059669"
                      strokeLinecap="round"
                      strokeWidth="3.5"
                      className="dark:stroke-[#78B99D]"
                    />

                    {/* Dynamic Landmark Pulse Circle at Peak */}
                    <circle
                      cx={salesCurveData.peakPoint.x}
                      cy={salesCurveData.peakPoint.y}
                      r="5"
                      fill="#059669"
                      className="animate-pulse dark:fill-[#78B99D]"
                    />
                    <circle
                      cx={salesCurveData.peakPoint.x}
                      cy={salesCurveData.peakPoint.y}
                      r="9"
                      fill="#059669"
                      fillOpacity="0.25"
                      className="dark:fill-[#78B99D]"
                    />
                  </svg>

                  {/* Floating Milestone Tag */}
                  <div className="absolute right-2 top-0 bg-[#102F2B] dark:bg-[#0B1512] text-white dark:text-[#83D1A5] px-2.5 py-1 rounded-lg text-[11px] font-semibold font-headline shadow-md border border-emerald-500/30 dark:border-[#264D3A]">
                    {roiMultiple}x Net ROI
                  </div>
                </div>

                {/* Bottom Metric Granularity */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                  <div className="p-2 rounded-xl bg-[#F7F8F5] dark:bg-[#101C18] border border-slate-200/50 dark:border-[#26372F]">
                    <span className="text-[11px] uppercase font-bold text-slate-500 dark:text-[#9BAAA1] block">
                      Creators
                    </span>
                    <span className="text-sm font-bold font-headline text-slate-900 dark:text-[#F1F5F1]">
                      {uniqueCreatorsCount} Active
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F7F8F5] dark:bg-[#101C18] border border-slate-200/50 dark:border-[#26372F]">
                    <span className="text-[11px] uppercase font-bold text-slate-500 dark:text-[#9BAAA1] block">
                      Attributed Sales
                    </span>
                    <span className="text-sm font-bold font-headline text-slate-900 dark:text-[#F1F5F1]">
                      {totalVerifiedSalesCount} Logged
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F7F8F5] dark:bg-[#101C18] border border-slate-200/50 dark:border-[#26372F]">
                    <span className="text-[11px] uppercase font-bold text-slate-500 dark:text-[#9BAAA1] block">
                      Net Multiple
                    </span>
                    <span className="text-sm font-bold font-headline text-emerald-600 dark:text-[#78B99D]">
                      {roiMultiple}x ROI
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Dynamic Quarter Velocity & Weekly Pillar Bar Chart */}
            <div className="lg:col-span-12 xl:col-span-3 bg-white dark:bg-[#14211D] rounded-2xl p-6 shadow-xs border border-[#D7DED9]/80 dark:border-[#26372F] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-headline font-bold text-base text-slate-900 dark:text-[#F1F5F1]">
                    Quarter Velocity
                  </h2>
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-[#83D1A5] bg-emerald-100 dark:bg-[#193629] border border-transparent dark:border-[#264D3A] px-2 py-0.5 rounded-full uppercase">
                    Q4 Volume
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-[#9BAAA1]">
                  Attributed sales volume by weeks
                </p>

                {/* Metric Display Banner */}
                <div className="my-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-[#193629] flex items-center justify-center text-emerald-600 dark:text-[#83D1A5] font-bold text-xs">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-2xl font-bold font-headline text-slate-900 dark:text-[#F1F5F1]">
                      {periodTrends?.weeklyVelocityPercent !== null && periodTrends?.weeklyVelocityPercent !== undefined
                        ? `${periodTrends.weeklyVelocityPercent >= 0 ? "+" : ""}${periodTrends.weeklyVelocityPercent}%`
                        : "+0%"}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-[#9BAAA1] block mt-0.5">
                    {formatETB(totalGrossETB)} total portfolio velocity
                  </span>
                </div>

                {/* Dynamic Segmented Pillar Bar Chart */}
                <div className="h-36 flex items-end justify-between gap-2 px-1 pt-4">
                  {currentWeeklyVelocity.map((bucket) => {
                    const isPeak = bucket.isPeak;
                    return (
                      <div
                        key={bucket.label}
                        className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative group cursor-pointer"
                        title={`${bucket.label} (${bucket.dateRange}): ${formatETB(bucket.amountETB)} across ${bucket.count} sales`}
                      >
                        <div
                          className={`w-full rounded-lg transition-all duration-300 relative flex items-center justify-center ${
                            isPeak
                              ? "bg-emerald-600 dark:bg-[#78B99D] shadow-xs"
                              : "bg-emerald-100/70 dark:bg-[#1A2A24] hover:bg-emerald-500/80 dark:hover:bg-[#78B99D]/80"
                          }`}
                          style={{ height: `${bucket.percentage}%` }}
                        >
                          {isPeak && bucket.amountETB > 0 && (
                            <span className="[writing-mode:vertical-rl] text-[11px] font-bold text-white dark:text-[#0D2119] tracking-wider uppercase rotate-180">
                              {bucket.amountETB >= 1000
                                ? `ETB ${(bucket.amountETB / 1000).toFixed(1)}K`
                                : `ETB ${bucket.amountETB.toFixed(0)}`}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[11px] font-semibold ${
                            isPeak
                              ? "text-emerald-700 dark:text-[#78B99D] font-bold"
                              : "text-slate-400 dark:text-[#9BAAA1]"
                          }`}
                        >
                          {bucket.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-[11px] text-slate-500 dark:text-[#9BAAA1] border-t border-slate-100 dark:border-[#26372F]">
                <span>Top Channel:</span>
                <span className="font-bold text-slate-900 dark:text-[#F1F5F1]">
                  {topChannelInfo.name} ({topChannelInfo.percent}%)
                </span>
              </div>
            </div>
          </div>

          {/* 6. Active Campaign Portfolio & Action Suite */}
          <div id="campaigns" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold font-headline text-slate-900 dark:text-[#F1F5F1] tracking-tight">
                  Active Campaign Portfolio &amp; Direct Actions
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#9BAAA1]">
                  Manage lifecycle status, POS QR displays, creator invites, and verified retail links
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-emerald-50 dark:bg-[#193629] text-emerald-700 dark:text-[#83D1A5] border-emerald-200 dark:border-[#264D3A]"
                >
                  {activeCampaignsCount} Active Campaigns
                </Badge>
                <Button
                  asChild
                  size="sm"
                  className="h-7 px-2.5 rounded-lg bg-[#287362] hover:bg-[#205B50] text-white dark:bg-[#78B99D] dark:hover:bg-[#91C9AE] dark:text-[#0D2119] text-xs font-semibold shadow-xs cursor-pointer inline-flex items-center gap-1"
                >
                  <Link href="/brand/campaigns/new">
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Campaign</span>
                  </Link>
                </Button>
              </div>
            </div>

            {filteredCampaigns.length === 0 ? (
              <div className="bg-white dark:bg-[#14211D] rounded-2xl border border-[#D7DED9]/80 dark:border-[#26372F] p-10 text-center space-y-3">
                <Tag className="w-10 h-10 text-slate-300 dark:text-[#9BAAA1] mx-auto" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-[#F1F5F1]">
                  No campaigns found matching filter
                </h3>
                <p className="text-xs text-slate-400 dark:text-[#9BAAA1] max-w-sm mx-auto">
                  Try adjusting your search query or status filter, or create a brand-new campaign to get started.
                </p>
                <Button
                  asChild
                  size="sm"
                  className="bg-[#287362] hover:bg-[#205B50] text-white dark:bg-[#78B99D] dark:hover:bg-[#91C9AE] dark:text-[#0D2119] rounded-xl text-xs font-bold"
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
                      className="bg-white dark:bg-[#14211D] rounded-2xl border border-[#D7DED9]/80 dark:border-[#26372F] p-5 shadow-xs hover:border-slate-300 dark:hover:border-[#304239] transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3.5">
                        {/* Header: Title, Promo Badge & Lifecycle */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-base text-slate-900 dark:text-[#F1F5F1] tracking-tight truncate">
                                {campaign.name}
                              </h3>
                              <span
                                className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full border ${badgeCfg.badgeClass}`}
                              >
                                {badgeCfg.label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-[#9BAAA1] mt-0.5 line-clamp-1">
                              {campaign.description || "Omnichannel attribution link"}
                            </p>
                          </div>

                          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-[#193629] text-emerald-700 dark:text-[#83D1A5] border border-emerald-200/60 dark:border-[#264D3A] shrink-0">
                            {campaign.promoCode}
                          </span>
                        </div>

                        {/* Metrics Strip */}
                        <div className="grid grid-cols-3 divide-x divide-slate-200/80 dark:divide-[#26372F] p-3 rounded-xl bg-[#F7F8F5] dark:bg-[#101C18] border border-slate-200/40 dark:border-[#26372F]/60">
                          <div className="pr-3">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-[#9BAAA1] block">
                              Attributed Revenue
                            </span>
                            <span className="font-bold text-sm text-slate-900 dark:text-[#F1F5F1] font-headline mt-0.5 block tracking-tight">
                              {formatETB(totalCampaignSales)}
                            </span>
                          </div>
                          <div className="px-3">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-[#9BAAA1] block">
                              Verified Sales
                            </span>
                            <span className="font-bold text-sm text-slate-900 dark:text-[#F1F5F1] mt-0.5 block tracking-tight">
                              {campaign._count?.sales || 0}
                            </span>
                          </div>
                          <div className="pl-3">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-[#9BAAA1] block">
                              Interactions
                            </span>
                            <span className="font-bold text-sm text-slate-900 dark:text-[#F1F5F1] mt-0.5 block tracking-tight">
                              {campaign._count?.events || 0}
                            </span>
                          </div>
                        </div>

                        {/* Channels active chips */}
                        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-[#C0CCC4]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {campaign.telegramUrl && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#229ED9]/10 text-[#229ED9] font-medium border border-[#229ED9]/20">
                                <Send className="w-3 h-3" />
                                Telegram
                              </span>
                            )}
                            {campaign.phoneNumber && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-[#F0B85C] font-medium border border-amber-500/20">
                                <Phone className="w-3 h-3" />
                                Phone
                              </span>
                            )}
                            {campaign.mapUrl && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-[#78B99D] font-medium border border-emerald-500/20">
                                <MapPin className="w-3 h-3" />
                                Maps
                              </span>
                            )}
                          </div>
                          {campaign.startDate && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-[#9BAAA1] font-mono shrink-0">
                              <Calendar className="w-3 h-3" />
                              {new Date(campaign.startDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Direct Visible Campaign Actions */}
                      <div className="pt-3 border-t border-slate-100 dark:border-[#26372F]">
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

                {/* Balanced "Launch New Campaign" Action Companion Slot */}
                {filteredCampaigns.length % 2 !== 0 && (
                  <div className="bg-slate-50/50 dark:bg-[#101C18]/40 hover:bg-emerald-50/20 dark:hover:bg-[#142620]/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-[#26372F] hover:border-emerald-500/60 dark:hover:border-[#78B99D]/60 p-5 transition-all flex flex-col justify-between space-y-4 group">
                    <div className="space-y-3.5">
                      {/* Header: Title, Badge & Placeholder Code */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-base text-slate-900 dark:text-[#F1F5F1] tracking-tight group-hover:text-emerald-700 dark:group-hover:text-[#78B99D] transition-colors truncate">
                              Launch New Campaign
                            </h3>
                            <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full border bg-emerald-50 dark:bg-[#193629] text-emerald-700 dark:text-[#83D1A5] border-emerald-200 dark:border-[#264D3A]">
                              Quick Setup
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-[#9BAAA1] mt-0.5 line-clamp-1">
                            Deploy an omnichannel attribution link with custom promo codes and verified retail tracking
                          </p>
                        </div>

                        <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-[#1A2A24] text-slate-400 dark:text-[#7C8F85] border border-dashed border-slate-300 dark:border-[#2B4036] shrink-0">
                          + PROMO CODE
                        </span>
                      </div>

                      {/* Middle Block */}
                      <div className="grid grid-cols-3 divide-x divide-slate-200/80 dark:divide-[#26372F] p-3 rounded-xl bg-[#F7F8F5] dark:bg-[#101C18] border border-slate-200/40 dark:border-[#26372F]/60">
                        <div className="pr-3">
                          <span className="text-[11px] font-medium text-slate-500 dark:text-[#9BAAA1] block">
                            Channel Routing
                          </span>
                          <span className="font-bold text-xs text-slate-800 dark:text-[#E2E8E4] mt-1 block tracking-tight">
                            Telegram &amp; Calls
                          </span>
                        </div>
                        <div className="px-3">
                          <span className="text-[11px] font-medium text-slate-500 dark:text-[#9BAAA1] block">
                            POS Retail QR
                          </span>
                          <span className="font-bold text-xs text-slate-800 dark:text-[#E2E8E4] mt-1 block tracking-tight">
                            Print Display
                          </span>
                        </div>
                        <div className="pl-3">
                          <span className="text-[11px] font-medium text-slate-500 dark:text-[#9BAAA1] block">
                            Creator Splits
                          </span>
                          <span className="font-bold text-xs text-slate-800 dark:text-[#E2E8E4] mt-1 block tracking-tight">
                            Signed Invites
                          </span>
                        </div>
                      </div>

                      {/* Feature Capabilities row */}
                      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-[#C0CCC4]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-[#193629] text-emerald-700 dark:text-[#83D1A5] font-medium border border-emerald-200/80 dark:border-[#264D3A]">
                            <QrCode className="w-3 h-3" />
                            POS QR
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#229ED9]/10 text-[#229ED9] font-medium border border-[#229ED9]/20">
                            <Send className="w-3 h-3" />
                            Telebirr &amp; CBE
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-[#F0B85C] font-medium border border-amber-500/20">
                            <UserPlus className="w-3 h-3" />
                            Magic Invite
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 dark:text-[#9BAAA1] font-mono shrink-0">
                          Takes &lt; 60s
                        </span>
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="pt-3 border-t border-slate-100 dark:border-[#26372F] flex items-center justify-between">
                      <Button
                        asChild
                        size="sm"
                        className="h-8 px-3.5 rounded-xl bg-[#287362] hover:bg-[#205B50] text-white dark:bg-[#78B99D] dark:hover:bg-[#91C9AE] dark:text-[#0D2119] text-xs font-semibold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Link href="/brand/campaigns/new">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create Campaign</span>
                        </Link>
                      </Button>

                      <Link
                        href="/brand/campaigns/new"
                        className="text-[11px] font-medium text-emerald-700 dark:text-[#78B99D] hover:underline inline-flex items-center gap-1"
                      >
                        <span>Open Studio</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 7. Bottom Section: Side-by-Side Panels (Sales Table + Regional Share) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Panel (7/12 cols): Recent Recorded Sales Activity Table */}
            <div className="lg:col-span-7 bg-white dark:bg-[#14211D] rounded-2xl p-6 shadow-xs border border-[#D7DED9]/80 dark:border-[#26372F] flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-headline font-bold text-base text-slate-900 dark:text-[#F1F5F1] leading-tight">
                        Recent Recorded Sales Activity
                      </h2>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-[#193629] text-emerald-800 dark:text-[#83D1A5] border border-transparent dark:border-[#264D3A]">
                        Live Feed
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-[#9BAAA1] mt-0.5">
                      Merchant-entered sales with creator attribution tags
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleTabChange("sales")}
                      className="h-8 px-3 rounded-lg bg-[#287362] hover:bg-[#205B50] text-white dark:bg-[#78B99D] dark:hover:bg-[#91C9AE] dark:text-[#0D2119] text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5 mr-1.5" />
                      <span>Log Manual Sale</span>
                    </Button>
                  </div>
                </div>

                {/* Polished Table Container */}
                <div className="overflow-x-auto border border-slate-200/80 dark:border-[#26372F] rounded-xl shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8F9F7] dark:bg-[#101C18] border-b border-slate-200/80 dark:border-[#26372F]">
                      <tr className="text-[11px] font-bold text-slate-500 dark:text-[#9BAAA1] uppercase tracking-wider">
                        <th className="py-2.5 px-3.5 text-left font-bold align-top whitespace-nowrap">Receipt ID</th>
                        <th className="py-2.5 px-3 text-left font-bold align-top">Creator / Campaign</th>
                        <th className="py-2.5 px-3 text-left font-bold align-top whitespace-nowrap">Channel / Branch</th>
                        <th className="py-2.5 px-3 text-left font-bold align-top whitespace-nowrap">Logged Date</th>
                        <th className="py-2.5 px-3 text-right font-bold align-top whitespace-nowrap">Amount</th>
                        <th className="py-2.5 px-3.5 text-right font-bold align-top whitespace-nowrap">Attribution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#26372F] bg-white dark:bg-[#14211D]">
                      {filteredSales.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 text-center text-xs text-slate-400 dark:text-[#9BAAA1]"
                          >
                            No sales recorded in this period. Cashiers log tickets via the POS terminal.
                          </td>
                        </tr>
                      ) : (
                        filteredSales.slice(0, 5).map((sale, idx) => {
                          const avatarImg =
                            creatorImages[idx % creatorImages.length];
                          const dateObj = new Date(sale.createdAt);
                          const dateFormatted = dateObj.toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          });
                          const timeFormatted = dateObj.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                          // Resolve dynamic branch and channel from notes & context
                          const { branch, channel } = resolveSaleChannelAndBranch(
                            sale.notes,
                            sale.campaign.name
                          );

                          return (
                            <tr
                              key={sale.id}
                              className="hover:bg-slate-50/70 dark:hover:bg-[#1A2A24]/60 transition-colors group"
                            >
                              <td className="py-3 px-3.5 whitespace-nowrap align-top">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-slate-100 dark:bg-[#1B2924] text-slate-700 dark:text-[#C0CCC4] border border-slate-200/80 dark:border-[#28493D] shadow-2xs group-hover:border-emerald-500/40 transition-colors">
                                  #{sale.id.slice(-5).toUpperCase()}
                                </span>
                              </td>
                              <td className="py-3 px-3 align-top">
                                <div className="flex items-start gap-2.5">
                                  <Image
                                    src={avatarImg}
                                    alt="Creator avatar"
                                    width={28}
                                    height={28}
                                    unoptimized
                                    className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200/80 dark:ring-[#304239]"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-semibold text-slate-900 dark:text-[#F1F5F1] leading-tight truncate max-w-[190px] text-xs">
                                      {sale.campaign.name}
                                    </p>
                                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-[#9BAAA1] font-mono mt-0.5">
                                      <Tag className="w-2.5 h-2.5 text-slate-400 dark:text-[#9BAAA1]" />
                                      {sale.campaign.promoCode}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap align-top">
                                <span className="inline-flex items-center gap-1.5 font-medium text-slate-800 dark:text-[#C0CCC4] text-xs leading-tight">
                                  {channel === "telegram" ? (
                                    <Send className="w-3.5 h-3.5 text-[#229ED9] shrink-0" />
                                  ) : channel === "phone" ? (
                                    <Phone className="w-3.5 h-3.5 text-amber-500 dark:text-[#F0B85C] shrink-0" />
                                  ) : (
                                    <Store className="w-3.5 h-3.5 text-emerald-600 dark:text-[#78B99D] shrink-0" />
                                  )}
                                  {branch}
                                </span>
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap align-top">
                                <div className="flex flex-col text-xs leading-tight">
                                  <span className="font-medium text-slate-700 dark:text-[#C0CCC4]">
                                    {dateFormatted}
                                  </span>
                                  <span className="text-[11px] text-slate-400 dark:text-[#9BAAA1] font-mono mt-0.5">
                                    {timeFormatted}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-right whitespace-nowrap align-top">
                                <div className="text-right leading-tight">
                                  <span className="font-bold text-xs text-slate-900 dark:text-[#F1F5F1] font-mono tracking-tight">
                                    {Number(sale.amountETB).toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                  <span className="text-[11px] font-medium text-slate-400 dark:text-[#9BAAA1] ml-1 uppercase">
                                    ETB
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-3.5 text-right whitespace-nowrap align-top">
                                <div className="text-right">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-[#193629] text-emerald-700 dark:text-[#83D1A5] border border-emerald-200/80 dark:border-[#264D3A] shadow-2xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#83D1A5] animate-pulse" />
                                    Verified Sale
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-[#9BAAA1] border-t border-slate-100 dark:border-[#26372F]">
                <span className="font-medium text-[11px]">
                  Showing {filteredSales.slice(0, 5).length} of{" "}
                  {totalVerifiedSalesCount} attributed transactions
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleTabChange("sales")}
                    className="text-[11px] font-semibold text-emerald-700 dark:text-[#78B99D] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Sales Ledger</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="text-[11px] text-slate-400 dark:text-[#9BAAA1] font-mono">
                    Telebirr Sync v2.4 • CBE Live
                  </span>
                </div>
              </div>
            </div>

            {/* Right Panel (5/12 cols): Dynamic Regional & Channel Share */}
            <div className="lg:col-span-5 bg-white dark:bg-[#14211D] rounded-2xl p-6 shadow-xs border border-[#D7DED9]/80 dark:border-[#26372F] flex flex-col justify-between">
              <div className="flex-1 flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-headline font-bold text-base text-slate-900 dark:text-[#F1F5F1] leading-tight">
                      Regional &amp; Channel Share
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-[#9BAAA1] mt-0.5">
                      Addis Ababa store branches &amp; deep channels
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTabChange("analytics")}
                    className="text-xs font-semibold text-emerald-600 dark:text-[#78B99D] hover:underline cursor-pointer"
                  >
                    Details
                  </button>
                </div>

                {/* Proportional Share Bar */}
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-[#101C18] overflow-hidden flex mt-3.5">
                  <div style={{ width: `${tgPercent}%` }} className="bg-blue-500 h-full" title={`Telegram ${tgPercent}%`} />
                  <div style={{ width: `${mapPercent}%` }} className="bg-emerald-500 dark:bg-[#78B99D] h-full" title={`In-Store POS ${mapPercent}%`} />
                  <div style={{ width: `${callPercent}%` }} className="bg-amber-500 dark:bg-[#F0B85C] h-full" title={`Direct Calls ${callPercent}%`} />
                </div>

                {/* Dynamic Channel Share Pill Breakdown */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F8F5] dark:bg-[#101C18] border border-transparent dark:border-[#26372F] font-medium text-slate-800 dark:text-[#C0CCC4]">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Telegram: <span className="font-bold">{tgPercent}%</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F8F5] dark:bg-[#101C18] border border-transparent dark:border-[#26372F] font-medium text-slate-800 dark:text-[#C0CCC4]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-[#78B99D]" />
                    In-Store POS: <span className="font-bold">{mapPercent}%</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F8F5] dark:bg-[#101C18] border border-transparent dark:border-[#26372F] font-medium text-slate-800 dark:text-[#C0CCC4]">
                    <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-[#F0B85C]" />
                    Direct Calls: <span className="font-bold">{callPercent}%</span>
                  </span>
                </div>

                {/* Stylized Geographic Location Widget with Addis Ababa background */}
                <div className="mt-3.5 relative rounded-xl overflow-hidden shadow-xs flex-1 min-h-[200px] group">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage: "url('/images/stitch/addis_ababa_map.jpg')",
                    }}
                  />
                  {/* Minimalist Map Overlay Card */}
                  <div className="absolute inset-0 bg-[#102F2B]/40 dark:bg-[#0D1714]/65 backdrop-blur-[2px] p-4 flex flex-col justify-between text-white">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 bg-black/60 dark:bg-[#08100E]/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase border border-white/10 dark:border-[#304239]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-[#83D1A5] animate-pulse" />
                        Active Hotspots
                      </span>
                      <span className="text-xs font-bold text-emerald-300 dark:text-[#78B99D] font-headline">
                        Addis Ababa Metro
                      </span>
                    </div>

                    {/* Dynamic Hotspot Node Tags */}
                    <div className="space-y-2">
                      {initialBranchHotspots.length > 0 ? (
                        initialBranchHotspots.slice(0, 2).map((hotspot) => (
                          <div
                            key={hotspot.name}
                            className="bg-black/65 dark:bg-[#0D1714]/85 backdrop-blur-md p-2 rounded-lg flex items-center justify-between border border-white/10 dark:border-[#304239]"
                          >
                            <div className="flex items-center gap-2">
                              {hotspot.type === "telegram" ? (
                                <Send className="w-3.5 h-3.5 text-[#229ED9] shrink-0" />
                              ) : hotspot.type === "phone" ? (
                                <Phone className="w-3.5 h-3.5 text-amber-400 dark:text-[#F0B85C] shrink-0" />
                              ) : (
                                <MapPin className="w-3.5 h-3.5 text-emerald-400 dark:text-[#78B99D] shrink-0" />
                              )}
                              <span className="text-xs font-semibold text-white dark:text-[#F1F5F1]">
                                {hotspot.name}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-emerald-300 dark:text-[#83D1A5]">
                              {hotspot.sharePercent}% Share
                            </span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="bg-black/65 dark:bg-[#0D1714]/85 backdrop-blur-md p-2 rounded-lg flex items-center justify-between border border-white/10 dark:border-[#304239]">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400 dark:text-[#78B99D] shrink-0" />
                              <span className="text-xs font-semibold text-white dark:text-[#F1F5F1]">
                                Bole Flagship (Medhanialem)
                              </span>
                            </div>
                            <span className="text-xs font-bold text-emerald-300 dark:text-[#83D1A5]">
                              58% Share
                            </span>
                          </div>

                          <div className="bg-black/65 dark:bg-[#0D1714]/85 backdrop-blur-md p-2 rounded-lg flex items-center justify-between border border-white/10 dark:border-[#304239]">
                            <div className="flex items-center gap-2">
                              <Store className="w-3.5 h-3.5 text-amber-400 dark:text-[#F0B85C] shrink-0" />
                              <span className="text-xs font-semibold text-white dark:text-[#F1F5F1]">
                                Piassa Roastery Hub
                              </span>
                            </div>
                            <span className="text-xs font-bold text-amber-300 dark:text-[#F0C36F]">
                              28% Share
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Settlement Footer */}
              <div className="mt-4 pt-3 flex items-center justify-between text-xs border-t border-slate-100 dark:border-[#26372F]">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-[#9BAAA1] text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-[#78B99D]" />
                  <span>EthioLink POS Gateway Verified</span>
                </div>
                <a
                  href="/api/analytics?format=csv"
                  download
                  className="text-[11px] font-semibold text-emerald-600 dark:text-[#78B99D] hover:underline cursor-pointer"
                >
                  Export Branch Audit
                </a>
              </div>
            </div>
          </div>
          </>
          )}
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
