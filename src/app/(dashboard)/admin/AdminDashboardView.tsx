"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatETB } from "@/lib/sales";
import type { PlatformOverviewStats, SystemHealthMetrics } from "@/lib/admin";
import {
  ShieldAlert,
  Activity,
  Store,
  Users,
  Sparkles,
  ShoppingBag,
  Database,
  Clock,
  Cpu,
  Search,
  ExternalLink,
  LogOut,
  Tag,
  CheckCircle2,
  AlertTriangle,
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-black text-lg shadow-md shadow-purple-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Admin Console & System Audit
                </h1>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Logged in as {adminName} • System Oversight & Telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Health Pill */}
            <div
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                health.status === "healthy"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${
                  health.status === "healthy" ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              <span>
                DB {health.dbStatus} ({health.dbLatencyMs}ms)
              </span>
            </div>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Brands</span>
              <Store className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.totalBrands}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Registered merchants</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Creators</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.totalCreators}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Active influencers</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Campaigns</span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.totalCampaigns}</div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              {stats.activeCampaigns} currently active
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">In-Store Sales</span>
              <ShoppingBag className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.totalSalesCount}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Attributed transactions</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Gross Revenue</span>
              <Activity className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-900">
              {formatETB(stats.totalRevenueETB)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Platform-wide sales volume</span>
          </div>
        </div>

        {/* Tab Controls & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("sales")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "sales"
                  ? "bg-purple-700 text-white shadow-sm shadow-purple-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Sales Audit ({audit.sales.length})
            </button>
            <button
              onClick={() => setActiveTab("campaigns")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "campaigns"
                  ? "bg-purple-700 text-white shadow-sm shadow-purple-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Campaigns ({audit.campaigns.length})
            </button>
            <button
              onClick={() => setActiveTab("accounts")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "accounts"
                  ? "bg-purple-700 text-white shadow-sm shadow-purple-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Accounts ({audit.brands.length + audit.creators.length})
            </button>
            <button
              onClick={() => setActiveTab("health")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "health"
                  ? "bg-purple-700 text-white shadow-sm shadow-purple-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              System Health & Telemetry
            </button>
          </div>

          {activeTab !== "health" && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Sales Audit Trail (FR-039) */}
        {activeTab === "sales" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Recorded In-Store Sales Audit Log
                </h3>
                <p className="text-xs text-slate-500">
                  Immutable record of merchant POS sales attributed to influencer campaigns
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400">
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
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Brand</th>
                      <th className="py-3 px-4">Campaign</th>
                      <th className="py-3 px-4">Promo Code</th>
                      <th className="py-3 px-4">Amount (ETB)</th>
                      <th className="py-3 px-4">Attributed Staff</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{sale.brandName}</td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {sale.campaignName}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px]">
                            {sale.promoCode}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-black text-emerald-800">
                          {formatETB(sale.amountETB)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{sale.loggedByName}</div>
                          <div className="text-[10px] text-slate-400 uppercase">
                            {sale.loggedByRole}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(sale.recordedAt).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
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

        {/* Tab 2: Campaigns Oversight (FR-038) */}
        {activeTab === "campaigns" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Global Campaign Oversight
                </h3>
                <p className="text-xs text-slate-500">
                  All active and historical influencer campaigns running on EthioLink
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {filteredCampaigns.length} campaigns
              </span>
            </div>

            {filteredCampaigns.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No campaigns matched your search criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Campaign</th>
                      <th className="py-3 px-4">Brand</th>
                      <th className="py-3 px-4">Promo Code</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Creators</th>
                      <th className="py-3 px-4">Events</th>
                      <th className="py-3 px-4">Sales</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCampaigns.map((camp) => (
                      <tr key={camp.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{camp.name}</td>
                        <td className="py-3 px-4 font-medium text-slate-700">{camp.brandName}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px]">
                            {camp.promoCode}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              camp.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {camp.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {camp.creators.length > 0 ? camp.creators.join(", ") : "—"}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {camp.eventsCount}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {camp.salesCount}
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/c/${camp.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-semibold"
                          >
                            <span>Landing</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Account Directory (FR-037) */}
        {activeTab === "accounts" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Brands Directory */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Registered Brands ({audit.brands.length})
                  </h3>
                </div>
              </div>
              <div className="space-y-3">
                {audit.brands.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{b.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Owner: {b.ownerName} • {b.phone}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-800">
                        {b.campaignsCount} campaigns
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {b.staffCount} staff members
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Creators Directory */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Registered Creators ({audit.creators.length})
                  </h3>
                </div>
              </div>
              <div className="space-y-3">
                {audit.creators.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {c.phone} {c.telegramUsername && `• @${c.telegramUsername}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-800">
                        {c.assignedCampaigns.length} campaigns
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: System Health & Diagnostics (FR-041, FR-042) */}
        {activeTab === "health" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Database</span>
                  <Database className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex items-center gap-2">
                  {health.status === "healthy" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  )}
                  <span className="text-lg font-black text-slate-900">
                    {health.dbStatus.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Ping round-trip latency: <span className="font-bold">{health.dbLatencyMs} ms</span>
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Memory Allocation</span>
                  <Cpu className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-lg font-black text-slate-900">
                  {health.memory.heapUsedMB} MB / {health.memory.heapTotalMB} MB
                </div>
                <p className="text-xs text-slate-500">
                  Resident Set Size (RSS): <span className="font-bold">{health.memory.rssMB} MB</span>
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Node & Runtime</span>
                  <Clock className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-lg font-black text-slate-900">
                  {health.nodeVersion} ({health.platform})
                </div>
                <p className="text-xs text-slate-500">
                  Process uptime: <span className="font-bold">{formatUptime(health.uptimeSeconds)}</span>
                </p>
              </div>
            </div>

            {/* Recent Telemetry Stream */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Real-Time Ingested Telemetry Feed (Last 50)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live raw event ingestion stream with SHA-256 hashed visitor IDs
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  Total: {stats.totalEvents} events
                </span>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-4">Event Type</th>
                      <th className="py-2.5 px-4">Campaign</th>
                      <th className="py-2.5 px-4">Brand</th>
                      <th className="py-2.5 px-4">Visitor Hash</th>
                      <th className="py-2.5 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {audit.events.map((evt) => (
                      <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2 px-4">
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            <Tag className="w-2.5 h-2.5 text-purple-600" />
                            {evt.eventType}
                          </span>
                        </td>
                        <td className="py-2 px-4 font-semibold text-slate-800">
                          {evt.campaignName}
                        </td>
                        <td className="py-2 px-4 text-slate-600">{evt.brandName}</td>
                        <td className="py-2 px-4 font-mono text-[11px] text-slate-400 truncate max-w-xs">
                          {evt.visitorId}
                        </td>
                        <td className="py-2 px-4 text-slate-500">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
