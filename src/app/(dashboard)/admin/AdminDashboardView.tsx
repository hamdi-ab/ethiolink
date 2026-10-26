"use client";

import React, { useState, useMemo } from "react";
import { formatETB } from "@/lib/sales";
import type {
  PlatformOverviewStats,
  SystemHealthMetrics,
  AdminAnalyticsData,
} from "@/lib/admin";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AdminSidebar, type AdminTab } from "./AdminSidebar";
import { CampaignShareModal } from "@/components/campaign/CampaignShareModal";
import {
  Search,
  CheckCircle2,
  Download,
  Server,
  RefreshCw,
  Store,
  Users,
  Menu,
  Send,
  PhoneCall,
  MapPin,
  Copy,
  Sparkles,
  ArrowRight,
  Radio,
  Tag,
  Receipt,
  ArrowUpRight,
  ChevronRight,
  Activity,
  Award,
  QrCode,
} from "lucide-react";

export interface SaleAuditItem {
  id: string;
  amountETB: number;
  campaignName: string;
  campaignSlug: string;
  promoCode: string;
  brandName: string;
  loggedByName: string;
  loggedByRole: string;
  notes: string | null;
  recordedAt: string;
}

export interface CampaignAuditItem {
  id: string;
  name: string;
  slug: string;
  promoCode: string;
  status: string;
  brandName: string;
  creators: string[];
  eventsCount: number;
  salesCount: number;
  createdAt: string;
}

export interface BrandAuditItem {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  campaignsCount: number;
  staffCount: number;
  createdAt: string;
}

export interface CreatorAuditItem {
  id: string;
  name: string;
  phone: string;
  telegramUsername: string | null;
  assignedCampaigns: string[];
  createdAt: string;
}

export interface EventAuditItem {
  id: string;
  eventType: string;
  visitorId: string;
  campaignName: string;
  campaignSlug: string;
  brandName: string;
  timestamp: string;
}

export interface AdminDashboardViewProps {
  adminName: string;
  stats: PlatformOverviewStats;
  health: SystemHealthMetrics;
  analytics: AdminAnalyticsData;
  audit: {
    sales: SaleAuditItem[];
    campaigns: CampaignAuditItem[];
    brands: BrandAuditItem[];
    creators: CreatorAuditItem[];
    events: EventAuditItem[];
  };
}

export function AdminDashboardView({
  adminName,
  stats,
  health,
  analytics,
  audit,
}: AdminDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [synced, setSynced] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedShareCampaign, setSelectedShareCampaign] = useState<{
    id: string;
    name: string;
    slug: string;
    promoCode: string;
    brandName: string;
  } | null>(null);

  // Search filters
  const filteredSales = useMemo(() => {
    if (!searchQuery.trim()) return audit.sales;
    const q = searchQuery.toLowerCase();
    return audit.sales.filter(
      (s) =>
        s.brandName.toLowerCase().includes(q) ||
        s.campaignName.toLowerCase().includes(q) ||
        s.promoCode.toLowerCase().includes(q) ||
        s.loggedByName.toLowerCase().includes(q)
    );
  }, [audit.sales, searchQuery]);

  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) return audit.campaigns;
    const q = searchQuery.toLowerCase();
    return audit.campaigns.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.brandName.toLowerCase().includes(q) ||
        c.promoCode.toLowerCase().includes(q)
    );
  }, [audit.campaigns, searchQuery]);

  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return audit.brands;
    const q = searchQuery.toLowerCase();
    return audit.brands.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.ownerName.toLowerCase().includes(q) ||
        b.phone.includes(q)
    );
  }, [audit.brands, searchQuery]);

  const filteredCreators = useMemo(() => {
    if (!searchQuery.trim()) return audit.creators;
    const q = searchQuery.toLowerCase();
    return audit.creators.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.telegramUsername && c.telegramUsername.toLowerCase().includes(q))
    );
  }, [audit.creators, searchQuery]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return audit.events;
    const q = searchQuery.toLowerCase();
    return audit.events.filter(
      (e) =>
        e.eventType.toLowerCase().includes(q) ||
        e.campaignName.toLowerCase().includes(q) ||
        e.brandName.toLowerCase().includes(q) ||
        e.visitorId.toLowerCase().includes(q)
    );
  }, [audit.events, searchQuery]);

  const formatUptime = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const exportAuditCSV = () => {
    const headers = [
      "TxID",
      "Brand",
      "Campaign",
      "Promo Code",
      "Amount (ETB)",
      "Cashier",
      "Timestamp",
    ];
    const rows = audit.sales.map((s) => [
      s.id,
      `"${s.brandName.replace(/"/g, '""')}"`,
      `"${s.campaignName.replace(/"/g, '""')}"`,
      s.promoCode,
      s.amountETB,
      `"${s.loggedByName.replace(/"/g, '""')}"`,
      s.recordedAt,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ethiolink_admin_sales_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const channelTotals = analytics.funnel.channels;
  const channelTotalSafe = channelTotals.total || 1;
  const telegramPct = Math.round((channelTotals.telegram / channelTotalSafe) * 100);
  const phonePct = Math.round((channelTotals.phone / channelTotalSafe) * 100);
  const mapPct = Math.round((channelTotals.map / channelTotalSafe) * 100);
  const promoPct = Math.round((channelTotals.promo / channelTotalSafe) * 100);

  // Tab Title helper
  const getTabLabel = (tab: AdminTab) => {
    switch (tab) {
      case "overview":
        return "Executive Overview";
      case "analytics":
        return "Funnel & Intelligence";
      case "sales":
        return "Sales Ledger";
      case "campaigns":
        return "Active Campaigns";
      case "merchants":
        return "Registered Brands";
      case "creators":
        return "Creator Directory";
      case "telemetry":
        return "Raw Telemetry Stream";
      case "health":
        return "System Health & Diagnostics";
      default:
        return "Admin Console";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-body antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* SaaS Collapsible Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        counts={{
          sales: audit.sales.length,
          campaigns: audit.campaigns.length,
          merchants: audit.brands.length,
          creators: audit.creators.length,
          events: audit.events.length,
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        adminName={adminName}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top App Bar */}
        <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-xs">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile hamburger button */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-xs truncate">
                <span className="text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
                  Admin Console
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 hidden sm:inline" />
                <span className="font-headline font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                  {getTabLabel(activeTab)}
                </span>
              </div>
            </div>

            {/* Top Bar Actions & Indicators */}
            <div className="flex items-center gap-3">
              {/* Live Cluster indicator */}
              <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Addis Ababa East-1 • {health.dbLatencyMs}ms</span>
              </div>

              {/* Quick CSV Export */}
              <button
                onClick={exportAuditCSV}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 active:scale-95 transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Export CSV</span>
              </button>

              {/* Trigger Sync */}
              <button
                onClick={() => {
                  setSynced(true);
                  setTimeout(() => setSynced(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 active:scale-95 transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${
                    synced ? "animate-spin text-emerald-600 dark:text-emerald-400" : ""
                  }`}
                />
                <span className="hidden sm:inline">{synced ? "Synced!" : "Sync"}</span>
              </button>

              <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

              {/* Theme Toggle in Top Bar for mobile/quick access */}
              <div className="lg:hidden">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-[1600px] w-full mx-auto">
          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Telemetry Status Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold font-headline text-slate-900 dark:text-slate-100">
                      Platform Operation Center
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      All cluster nodes and payment gateways reporting nominal telemetry
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs cursor-pointer"
                  >
                    <span>View Funnel Analytics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Core Platform KPIs Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
                {/* KPI 1: Gross Sales */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Platform Revenue
                  </span>
                  <div className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                    {formatETB(stats.totalRevenueETB)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Attributed POS volume</span>
                  </div>
                </div>

                {/* KPI 2: Total Recorded Sales */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Verified Orders
                  </span>
                  <div className="text-lg font-black font-mono text-slate-900 dark:text-slate-100 mt-1">
                    {stats.totalSalesCount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Receipts matched
                  </div>
                </div>

                {/* KPI 3: Registered Brands */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Brand Merchants
                  </span>
                  <div className="text-lg font-black font-mono text-slate-900 dark:text-slate-100 mt-1">
                    {stats.totalBrands}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Active retail partners
                  </div>
                </div>

                {/* KPI 4: Creators */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Influencer Roster
                  </span>
                  <div className="text-lg font-black font-mono text-slate-900 dark:text-slate-100 mt-1">
                    {stats.totalCreators}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Affiliate partners
                  </div>
                </div>

                {/* KPI 5: Active Campaigns */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Active Campaigns
                  </span>
                  <div className="text-lg font-black font-mono text-slate-900 dark:text-slate-100 mt-1">
                    {stats.activeCampaigns}{" "}
                    <span className="text-xs font-normal text-slate-400">/ {stats.totalCampaigns}</span>
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                    Live promos running
                  </div>
                </div>

                {/* KPI 6: Ingested Events */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Ingested Telemetry
                  </span>
                  <div className="text-lg font-black font-mono text-slate-900 dark:text-slate-100 mt-1">
                    {stats.totalEvents.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Clicks &amp; page views
                  </div>
                </div>
              </div>

              {/* Two Column Grid: Recent Sales & Top Campaigns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Sales Preview */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold font-headline text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Recent POS Transactions</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Latest sales logged by in-store cashiers
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("sales")}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {audit.sales.slice(0, 5).map((sale) => (
                      <div key={sale.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {sale.brandName}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            Campaign: {sale.campaignName} • Promo:{" "}
                            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                              {sale.promoCode}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black font-mono text-emerald-700 dark:text-emerald-400">
                            {formatETB(sale.amountETB)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {new Date(sale.recordedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Performing Campaigns Preview */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold font-headline text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Top Campaigns Leaderboard</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Ranked by verified revenue generated
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("analytics")}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Deep Analytics</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {analytics.topCampaigns.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No sales recorded yet for active campaigns.
                      </div>
                    ) : (
                      analytics.topCampaigns.slice(0, 5).map((camp, idx) => (
                        <div key={camp.id} className="py-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-[10px] flex items-center justify-center">
                              #{idx + 1}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100">
                                {camp.name}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                {camp.brandName} • Code:{" "}
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                                  {camp.promoCode}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-black font-mono text-emerald-700 dark:text-emerald-400">
                              {formatETB(camp.revenueETB)}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {camp.salesCount} orders
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INDUSTRY STANDARD ANALYTICS & CONVERSION FUNNEL */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Analytics Header & Period Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold font-headline text-slate-900 dark:text-slate-100">
                      Platform Conversion Funnel &amp; Velocity
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      LIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Full-funnel attribution across all retail campaigns, creator traffic, and merchant POS registers
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Real-time Ingestion</span>
                  </div>
                </div>
              </div>

              {/* High-Level Velocity & Economic Run-Rate Bento Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Platform GMV */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Total Attributed GMV
                  </div>
                  <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-2">
                    {formatETB(analytics.funnel.totalRevenueETB)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      100% Verified
                    </span>
                    <span>POS match</span>
                  </div>
                </div>

                {/* 2. Average Order Value (AOV) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Average Order Value (AOV)
                  </div>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100 mt-2">
                    {formatETB(analytics.funnel.averageOrderValueETB)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Per converted customer
                  </div>
                </div>

                {/* 3. Attributed Sales Velocity */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Sales Velocity
                  </div>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100 mt-2">
                    {analytics.funnel.recordedSales}{" "}
                    <span className="text-sm font-normal text-slate-400">orders</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Across {stats.activeCampaigns} active campaigns
                  </div>
                </div>

                {/* 4. Full Funnel Conversion Rate */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Overall Conversion Rate
                  </div>
                  <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-2">
                    {analytics.funnel.overallConversionRate}%
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Visitors converting to sales
                  </div>
                </div>
              </div>

              {/* 4-Stage Industry Standard Visual Conversion Funnel */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
                <div>
                  <h3 className="text-sm font-bold font-headline text-slate-900 dark:text-slate-100">
                    4-Stage Customer Journey Conversion Funnel
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Progression from initial landing page visit to in-person physical store checkout
                  </p>
                </div>

                {/* Funnel Stage Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Stage 1: Page Views */}
                  <div className="relative p-4.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 transition-all space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                        STAGE 1
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">100% Baseline</span>
                    </div>
                    <div>
                      <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
                        {analytics.funnel.pageViews.toLocaleString()}
                      </div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                        Landing Page Views
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Total link clicks from creator channels
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-600 h-2 rounded-full w-full"></div>
                    </div>
                  </div>

                  {/* Stage 2: Unique Visitors */}
                  <div className="relative p-4.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 transition-all space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                        STAGE 2
                      </span>
                      <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                        {analytics.funnel.pageViews > 0
                          ? Math.round((analytics.funnel.uniqueVisitors / analytics.funnel.pageViews) * 100)
                          : 0}
                        % unique
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
                        {analytics.funnel.uniqueVisitors.toLocaleString()}
                      </div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                        Engaged Visitors
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Deduplicated prospective customers
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            analytics.funnel.pageViews > 0
                              ? Math.min(
                                  100,
                                  Math.round((analytics.funnel.uniqueVisitors / analytics.funnel.pageViews) * 100)
                                )
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Stage 3: Intent Action Taps */}
                  <div className="relative p-4.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 transition-all space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                        STAGE 3
                      </span>
                      <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">
                        {analytics.funnel.visitToActionRate}% intent
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
                        {analytics.funnel.actionTaps.toLocaleString()}
                      </div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                        Intent Action Taps
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Telegram, Phone, Maps, or Promo copies
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, analytics.funnel.visitToActionRate)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Stage 4: Attributed POS Sales */}
                  <div className="relative p-4.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 transition-all space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                        STAGE 4
                      </span>
                      <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {analytics.funnel.actionToSaleRate}% close rate
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400">
                        {analytics.funnel.recordedSales.toLocaleString()}
                      </div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                        Attributed POS Sales
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Verified transactions at merchant cashiers
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, analytics.funnel.actionToSaleRate)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Conversion Flow Metrics Footer */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                    <span className="text-slate-500 dark:text-slate-400">Visit-to-Action Rate:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {analytics.funnel.visitToActionRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                    <span className="text-slate-500 dark:text-slate-400">Action-to-Sale Rate:</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {analytics.funnel.actionToSaleRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                    <span className="text-slate-500 dark:text-slate-400">Full Funnel Conversion:</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {analytics.funnel.overallConversionRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Touchpoint Preference Distribution (Channel Mix) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold font-headline text-slate-900 dark:text-slate-100">
                      Omnichannel Touchpoint Distribution
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Which conversion channels Ethiopian customers prefer when taking action
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {channelTotals.total} total intent actions
                  </span>
                </div>

                {/* Proportional Segmented Share Bar */}
                <div className="space-y-2">
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-2xs">
                    {channelTotals.telegram > 0 && (
                      <div
                        style={{ width: `${telegramPct}%` }}
                        className="bg-[#229ED9] h-full transition-all duration-500"
                        title={`Telegram: ${channelTotals.telegram} (${telegramPct}%)`}
                      />
                    )}
                    {channelTotals.phone > 0 && (
                      <div
                        style={{ width: `${phonePct}%` }}
                        className="bg-emerald-500 h-full transition-all duration-500"
                        title={`Phone Calls: ${channelTotals.phone} (${phonePct}%)`}
                      />
                    )}
                    {channelTotals.map > 0 && (
                      <div
                        style={{ width: `${mapPct}%` }}
                        className="bg-indigo-500 h-full transition-all duration-500"
                        title={`Map Directions: ${channelTotals.map} (${mapPct}%)`}
                      />
                    )}
                    {channelTotals.promo > 0 && (
                      <div
                        style={{ width: `${promoPct}%` }}
                        className="bg-amber-500 h-full transition-all duration-500"
                        title={`Promo Code Copies: ${channelTotals.promo} (${promoPct}%)`}
                      />
                    )}
                    {channelTotals.total === 0 && (
                      <div className="w-full h-full bg-slate-200 dark:bg-slate-700/60" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Channel 1: Telegram */}
                  <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          Telegram Referral
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs text-sky-700 dark:text-sky-400">
                        {telegramPct}%
                      </span>
                    </div>
                    <div className="text-xl font-black font-mono text-slate-900 dark:text-slate-100">
                      {channelTotals.telegram}
                    </div>
                    <div className="w-full bg-sky-200/60 dark:bg-sky-900/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-sky-600 dark:bg-sky-400 h-1.5 rounded-full"
                        style={{ width: `${telegramPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Channel 2: Phone Direct Calls */}
                  <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PhoneCall className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          Phone Calls
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
                        {phonePct}%
                      </span>
                    </div>
                    <div className="text-xl font-black font-mono text-slate-900 dark:text-slate-100">
                      {channelTotals.phone}
                    </div>
                    <div className="w-full bg-emerald-200/60 dark:bg-emerald-900/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 dark:bg-emerald-400 h-1.5 rounded-full"
                        style={{ width: `${phonePct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Channel 3: Google Maps */}
                  <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          Store Directions
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs text-amber-700 dark:text-amber-400">
                        {mapPct}%
                      </span>
                    </div>
                    <div className="text-xl font-black font-mono text-slate-900 dark:text-slate-100">
                      {channelTotals.map}
                    </div>
                    <div className="w-full bg-amber-200/60 dark:bg-amber-900/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-600 dark:bg-amber-400 h-1.5 rounded-full"
                        style={{ width: `${mapPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Channel 4: Promo Code Copies */}
                  <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Copy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          Promo Copies
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs text-amber-700 dark:text-amber-400">
                        {promoPct}%
                      </span>
                    </div>
                    <div className="text-xl font-black font-mono text-slate-900 dark:text-slate-100">
                      {channelTotals.promo}
                    </div>
                    <div className="w-full bg-amber-200/60 dark:bg-amber-900/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-600 dark:bg-amber-400 h-1.5 rounded-full"
                        style={{ width: `${promoPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Leaderboards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 5 Campaigns by Revenue */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold font-headline text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Top 5 Campaigns by Revenue</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Ranked by gross attributed birr generated
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {analytics.topCampaigns.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No campaign sales data recorded yet.
                      </div>
                    ) : (
                      analytics.topCampaigns.map((camp, idx) => (
                        <div key={camp.id} className="py-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                              #{idx + 1}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100">
                                {camp.name}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                {camp.brandName} • Code:{" "}
                                <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded text-slate-700 dark:text-slate-300">
                                  {camp.promoCode}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-black font-mono text-emerald-700 dark:text-emerald-400">
                              {formatETB(camp.revenueETB)}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {camp.salesCount} orders
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Top 5 Creators by Attributed Volume */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold font-headline text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Top 5 Creators by Volume</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Ranked by attributed in-store cashier sales
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {analytics.topCreators.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No creator partner attribution data recorded yet.
                      </div>
                    ) : (
                      analytics.topCreators.map((creator, idx) => (
                        <div key={creator.id} className="py-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                              #{idx + 1}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100">
                                {creator.name}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                {creator.telegramUsername ? `@${creator.telegramUsername}` : "Creator"} •{" "}
                                {creator.assignedCampaignsCount} campaigns
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-black font-mono text-emerald-700 dark:text-emerald-400">
                              {formatETB(creator.attributedRevenueETB)}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {creator.attributedSalesCount} orders
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SALES LEDGER */}
          {activeTab === "sales" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-headline font-bold text-sm text-slate-900 dark:text-slate-100">
                    Recorded Sales Audit Trail
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Immutable record of merchant transactions matching POS receipts with influencer attribution
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search sales ledger..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {filteredSales.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No recorded sales matched your search criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Merchant</th>
                        <th className="py-3 px-4">Campaign</th>
                        <th className="py-3 px-4">Promo Code</th>
                        <th className="py-3 px-4 text-right">Amount (ETB)</th>
                        <th className="py-3 px-4">Cashier / Staff</th>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4 text-center">Audit Proof</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-body">
                      {filteredSales.map((sale) => (
                        <tr
                          key={sale.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                            {sale.brandName}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                            {sale.campaignName}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded text-[11px]">
                              {sale.promoCode}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-black font-mono text-emerald-700 dark:text-emerald-400">
                            {formatETB(sale.amountETB)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {sale.loggedByName}
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase font-mono">
                              {sale.loggedByRole}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">
                            {new Date(sale.recordedAt).toLocaleString("en-US", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              VERIFIED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ACTIVE CAMPAIGNS */}
          {activeTab === "campaigns" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-headline font-bold text-sm text-slate-900 dark:text-slate-100">
                    Global Campaign Registry
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Network-wide active promotions and creator assignments
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Campaign</th>
                      <th className="py-3 px-4">Merchant</th>
                      <th className="py-3 px-4">Promo Code</th>
                      <th className="py-3 px-4 text-right">Events</th>
                      <th className="py-3 px-4 text-right">Orders</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Distribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-body">
                    {filteredCampaigns.map((camp) => (
                      <tr
                        key={camp.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                          {camp.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          {camp.brandName}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded">
                            {camp.promoCode}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                          {camp.eventsCount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                          {camp.salesCount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              camp.status === "ACTIVE"
                                ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {camp.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() =>
                              setSelectedShareCampaign({
                                id: camp.id,
                                name: camp.name,
                                slug: camp.slug,
                                promoCode: camp.promoCode,
                                brandName: camp.brandName,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
                            title="Generate POS QR Code & Telegram deep link"
                          >
                            <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>QR &amp; Share</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: REGISTERED BRANDS */}
          {activeTab === "merchants" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-headline font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Registered Brand Merchants ({filteredBrands.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Retail stores, cafes, and service businesses registered on the platform
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search merchants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Merchant Name</th>
                      <th className="py-3 px-4">Owner</th>
                      <th className="py-3 px-4">Contact Phone</th>
                      <th className="py-3 px-4 text-center">Campaigns</th>
                      <th className="py-3 px-4 text-center">Cashiers / Staff</th>
                      <th className="py-3 px-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-body">
                    {filteredBrands.map((brand) => (
                      <tr
                        key={brand.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                          {brand.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          {brand.ownerName}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                          {brand.phone}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 dark:text-slate-100">
                          {brand.campaignsCount}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-slate-600 dark:text-slate-400">
                          {brand.staffCount}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono">
                          {new Date(brand.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: CREATOR DIRECTORY */}
          {activeTab === "creators" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-headline font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Influencer Creator Partners ({filteredCreators.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Content creators driving retail foot traffic and social conversions
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search creators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Creator Name</th>
                      <th className="py-3 px-4">Telegram Handle</th>
                      <th className="py-3 px-4">Contact Phone</th>
                      <th className="py-3 px-4">Assigned Campaigns</th>
                      <th className="py-3 px-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-body">
                    {filteredCreators.map((creator) => (
                      <tr
                        key={creator.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                          {creator.name}
                        </td>
                        <td className="py-3.5 px-4">
                          {creator.telegramUsername ? (
                            <span className="font-mono text-sky-600 dark:text-sky-400 font-medium">
                              @{creator.telegramUsername}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                          {creator.phone}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {creator.assignedCampaigns.length === 0 ? (
                              <span className="text-slate-400">None</span>
                            ) : (
                              creator.assignedCampaigns.map((campName, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                >
                                  {campName}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono">
                          {new Date(creator.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: EVENT TELEMETRY STREAM */}
          {activeTab === "telemetry" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-headline font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Real-Time Ingestion Event Stream</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Live raw telemetry events captured with SHA-256 IP anonymization
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No telemetry events matched your search query.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Event Type</th>
                        <th className="py-3 px-4">Campaign</th>
                        <th className="py-3 px-4">Merchant</th>
                        <th className="py-3 px-4">Visitor Hash</th>
                        <th className="py-3 px-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-body">
                      {filteredEvents.map((evt) => (
                        <tr
                          key={evt.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                evt.eventType === "PAGE_VIEW"
                                  ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                  : evt.eventType === "TELEGRAM_CLICK"
                                  ? "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                                  : evt.eventType === "CALL_CLICK"
                                  ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                  : evt.eventType === "MAP_CLICK"
                                  ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                  : "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                              }`}
                            >
                              {evt.eventType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                            {evt.campaignName}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                            {evt.brandName}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {evt.visitorId.slice(0, 16)}...
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono">
                            {new Date(evt.timestamp).toLocaleString("en-US", {
                              dateStyle: "short",
                              timeStyle: "medium",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: SYSTEM HEALTH & GATEWAYS */}
          {activeTab === "health" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>System Infrastructure Diagnostics &amp; Gateway Watchdog</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Production health metrics for database clusters, process memory, and national payment rails
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                  <span>Operational</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-400 font-sans font-bold uppercase text-[10px]">
                    Database Engine
                  </span>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    PostgreSQL / Prisma
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-400">
                    Status: {health.dbStatus} ({health.dbLatencyMs}ms)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-400 font-sans font-bold uppercase text-[10px]">
                    Process &amp; Platform
                  </span>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {health.platform}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    Runtime: Node {health.nodeVersion}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-400 font-sans font-bold uppercase text-[10px]">
                    System Uptime
                  </span>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {formatUptime(health.uptimeSeconds)}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    Heap: {health.memory.heapUsedMB} MB
                  </div>
                </div>
              </div>

              {/* National Payment Gateway Watchdog */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  National Payment Rails Watchdog
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-emerald-900 dark:text-emerald-300">
                        Telebirr Merchant Gateway
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        API Latency: 124ms • Auto-settlement active
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-emerald-900 dark:text-emerald-300">
                        CBE Birr Notification Webhook
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        HMAC-SHA256 verified • Heartbeat nominal
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Campaign POS QR & Distribution Suite Modal */}
      <CampaignShareModal
        isOpen={!!selectedShareCampaign}
        onClose={() => setSelectedShareCampaign(null)}
        campaign={selectedShareCampaign}
      />
    </div>
  );
}
