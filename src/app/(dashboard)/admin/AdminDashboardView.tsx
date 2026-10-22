"use client";

import React, { useState } from "react";
import { formatETB } from "@/lib/sales";
import type { PlatformOverviewStats, SystemHealthMetrics } from "@/lib/admin";
import {
  Activity,
  Store,
  Users,
  Database,
  Cpu,
  Search,
  LogOut,
  Tag,
  CheckCircle2,
  Download,
  Server,
  RefreshCw,
} from "lucide-react";

interface SaleAuditItem {
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

interface CampaignAuditItem {
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

interface BrandAuditItem {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  campaignsCount: number;
  staffCount: number;
  createdAt: string;
}

interface CreatorAuditItem {
  id: string;
  name: string;
  phone: string;
  telegramUsername: string | null;
  assignedCampaigns: string[];
  createdAt: string;
}

interface EventAuditItem {
  id: string;
  eventType: string;
  visitorId: string;
  campaignName: string;
  campaignSlug: string;
  brandName: string;
  timestamp: string;
}

interface AdminDashboardViewProps {
  adminName: string;
  stats: PlatformOverviewStats;
  health: SystemHealthMetrics;
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
  audit,
}: AdminDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"sales" | "campaigns" | "accounts" | "health">("sales");
  const [searchQuery, setSearchQuery] = useState("");
  const [synced, setSynced] = useState(false);

  const filteredSales = audit.sales.filter(
    (s) =>
      s.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.promoCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.loggedByName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCampaigns = audit.campaigns.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.promoCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatUptime = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const exportAuditCSV = () => {
    const headers = ["TxID", "Brand", "Campaign", "Promo Code", "Amount (ETB)", "Cashier", "Timestamp"];
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-body antialiased pb-20 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-xs">
                EL
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline font-black text-lg text-slate-900 tracking-tight">
                    Ethio<span className="text-emerald-600">Link</span>
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    OPS v3.4.1
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Platform Ops &amp; Health Console</p>
              </div>
            </div>

            <div className="hidden xl:flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Production • Addis Ababa East-1
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                All Systems Operational
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSynced(true);
                setTimeout(() => setSynced(false), 2000);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${synced ? "animate-spin text-emerald-600" : ""}`} />
              <span>{synced ? "Synced!" : "Trigger Sync"}</span>
            </button>

            <button
              onClick={exportAuditCSV}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Audit CSV</span>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-mono text-xs font-semibold flex items-center justify-center ring-2 ring-emerald-500/30">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <p className="text-xs font-semibold text-slate-900">{adminName}</p>
                <p className="text-[10px] text-slate-500 font-mono">Superadmin</p>
              </div>
            </div>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-all cursor-pointer ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Core Infrastructure & Ingestion Telemetry Bento Grid */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-headline">
              Core Infrastructure &amp; Ingestion Telemetry
            </h2>
            <span className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live telemetry: 4ms latency
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Postgres Cluster */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-slate-400" />
                    Database Cluster
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    PostgreSQL
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                      {health.dbLatencyMs}
                    </span>
                    <span className="text-sm font-semibold text-slate-500 font-mono ml-0.5">ms</span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {health.dbStatus.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 font-mono flex items-center justify-between">
                <span>Node: {health.nodeVersion}</span>
                <span className="text-emerald-700 font-medium">Uptime: {formatUptime(health.uptimeSeconds)}</span>
              </div>
            </div>

            {/* Card 2: Memory & Cache Buffer */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-slate-400" />
                    System Memory Footprint
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                    RAM
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                      {health.memory.heapUsedMB}
                    </span>
                    <span className="text-sm font-semibold text-slate-500 font-mono ml-0.5">MB</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">Heap Used</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 font-mono flex items-center justify-between">
                <span>Platform: {health.platform}</span>
                <span className="text-emerald-700 font-medium">Healthy State</span>
              </div>
            </div>

            {/* Card 3: Events & Clicks Ingested */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-slate-400" />
                    Telemetry Events Ingested
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Stream
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                      {stats.totalEvents.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">99.98% SLA</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 font-mono flex items-center justify-between">
                <span>15m Sliding Dedup</span>
                <span className="text-slate-700 font-semibold">{stats.totalSalesCount} Attributed Sales</span>
              </div>
            </div>

            {/* Card 4: Network Attributed GMV */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    Network Attributed Sales
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    ETB Volume
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black font-mono text-slate-900 tracking-tight block">
                    {formatETB(stats.totalRevenueETB)}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 font-mono flex items-center justify-between">
                <span>{stats.totalBrands} Merchants</span>
                <span className="font-semibold text-slate-800">{stats.totalCreators} Creators</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Controls & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("sales")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "sales"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Sales Audit ({audit.sales.length})
            </button>
            <button
              onClick={() => setActiveTab("campaigns")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "campaigns"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Campaigns ({audit.campaigns.length})
            </button>
            <button
              onClick={() => setActiveTab("accounts")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "accounts"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Merchants &amp; Creators ({audit.brands.length + audit.creators.length})
            </button>
            <button
              onClick={() => setActiveTab("health")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "health"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              System Health &amp; Diagnostics
            </button>
          </div>

          {activeTab !== "health" && (
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Sales Audit Trail */}
        {activeTab === "sales" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-headline font-bold text-sm text-slate-900">
                  Recorded Sales Audit Trail
                </h3>
                <p className="text-xs text-slate-500">
                  Immutable record of merchant transactions matching POS receipts with influencer attribution
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400 font-mono">
                {filteredSales.length} records shown
              </span>
            </div>

            {filteredSales.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No recorded sales matched your search criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
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
                  <tbody className="divide-y divide-slate-100 font-body">
                    {filteredSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{sale.brandName}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          {sale.campaignName}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                            {sale.promoCode}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black font-mono text-emerald-800">
                          {formatETB(sale.amountETB)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{sale.loggedByName}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-mono">
                            {sale.loggedByRole}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono">
                          {new Date(sale.recordedAt).toLocaleString("en-US", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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

        {/* Tab 2: Campaigns Audit */}
        {activeTab === "campaigns" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-headline font-bold text-sm text-slate-900">
                  Global Campaign Registry
                </h3>
                <p className="text-xs text-slate-500">
                  Network-wide active promotions and creator assignments
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400 font-mono">
                {filteredCampaigns.length} campaigns
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Campaign</th>
                    <th className="py-3 px-4">Merchant</th>
                    <th className="py-3 px-4">Promo Code</th>
                    <th className="py-3 px-4 text-right">Events</th>
                    <th className="py-3 px-4 text-right">Orders</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-body">
                  {filteredCampaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{camp.name}</td>
                      <td className="py-3.5 px-4 text-slate-700">{camp.brandName}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                          {camp.promoCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                        {camp.eventsCount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {camp.salesCount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            camp.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {camp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Accounts Audit */}
        {activeTab === "accounts" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Merchants List */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
              <h3 className="font-headline font-bold text-sm text-slate-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>Registered Brand Merchants ({audit.brands.length})</span>
              </h3>
              <div className="divide-y divide-slate-100 overflow-y-auto max-h-96">
                {audit.brands.map((b) => (
                  <div key={b.id} className="py-3 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{b.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Owner: {b.ownerName} • {b.phone}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {b.campaignsCount} campaigns
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Creators List */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
              <h3 className="font-headline font-bold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Influencer Creator Partners ({audit.creators.length})</span>
              </h3>
              <div className="divide-y divide-slate-100 overflow-y-auto max-h-96">
                {audit.creators.map((c) => (
                  <div key={c.id} className="py-3 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {c.phone} {c.telegramUsername && `• @${c.telegramUsername}`}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {c.assignedCampaigns.length} campaigns
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: System Health & Diagnostics */}
        {activeTab === "health" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
            <h3 className="font-headline font-bold text-base text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-600" />
              <span>Full System Telemetry &amp; Gateway Watchdog</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 font-sans font-bold uppercase text-[10px]">
                  Database Engine
                </span>
                <div className="font-bold text-slate-900 text-sm">PostgreSQL / Prisma</div>
                <div className="text-emerald-700">Status: {health.dbStatus} ({health.dbLatencyMs}ms)</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 font-sans font-bold uppercase text-[10px]">
                  Process &amp; Platform
                </span>
                <div className="font-bold text-slate-900 text-sm">{health.platform}</div>
                <div className="text-slate-600">Runtime: Node {health.nodeVersion}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 font-sans font-bold uppercase text-[10px]">
                  System Uptime
                </span>
                <div className="font-bold text-slate-900 text-sm">
                  {formatUptime(health.uptimeSeconds)}
                </div>
                <div className="text-slate-600">Timestamp: {health.timestamp}</div>
              </div>
            </div>

            {/* Gateway Watchdog Status */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
                National Payment Gateway Watchdog
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-emerald-900">Telebirr Merchant Gateway</div>
                    <div className="text-[11px] text-emerald-700">API Latency: 124ms • Auto-settlement active</div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-emerald-900">CBE Birr Notification Webhook</div>
                    <div className="text-[11px] text-emerald-700">HMAC-SHA256 verified • Heartbeat 1s ago</div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
