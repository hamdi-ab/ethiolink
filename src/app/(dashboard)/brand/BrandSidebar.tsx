"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  LayoutGrid,
  TrendingUp,
  Store,
  Users,
  LifeBuoy,
  LogOut,
  Search,
  Shield,
  X,
  ChevronsUpDown,
  Layers,
} from "lucide-react";

export interface BrandSidebarProps {
  brandName: string;
  ownerName: string;
  role: string;
  campaignCount: number;
  staffCount: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenReportModal?: () => void;
}

export function BrandSidebar({
  brandName,
  ownerName,
  role,
  campaignCount,
  staffCount,
  isMobileOpen,
  onCloseMobile,
  onOpenReportModal,
}: BrandSidebarProps) {
  const pathname = usePathname();

  const isOverview = pathname === "/brand";
  const isSales = pathname === "/brand/sales";
  const isAnalytics = pathname === "/brand/analytics";

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container (Stitch Evergreen Theme: #102F2B / Dark: #0B1512) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#102F2B] dark:bg-[#0B1512] text-white border-r border-[#163E3A] dark:border-[#1E332B] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Top: Brand Header & Search Bar (Matchly Pattern) */}
        <div className="p-3.5 space-y-3">
          <div className="flex items-center justify-between px-1 pt-0.5">
            <Link href="/brand" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-[#78B99D] text-white dark:text-[#0D2119] flex items-center justify-center font-black text-base shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5 text-white dark:text-[#0D2119]" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-bold text-lg text-white leading-none tracking-tight">
                  Ethio<span className="text-emerald-400 dark:text-[#78B99D]">Link</span>
                </span>
                <span className="text-[10px] font-semibold text-emerald-300 dark:text-[#83D1A5] uppercase tracking-wider mt-0.5">
                  Attribution Engine
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#163E3A] dark:hover:bg-[#142621] transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Shortcut Bar (Clean Windows-friendly without Mac ⌘K symbol) */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-200/60 dark:text-[#9BAAA1] pointer-events-none" />
            <input
              type="text"
              readOnly
              placeholder="Search campaigns..."
              className="w-full pl-9 pr-3 h-9 text-xs rounded-xl bg-[#163E3A]/60 dark:bg-[#142621]/60 border border-[#205B50]/40 dark:border-[#28493D] text-slate-200 dark:text-[#F1F5F1] placeholder:text-emerald-200/50 dark:placeholder:text-[#9BAAA1]/70 focus:outline-none cursor-pointer hover:bg-[#163E3A] dark:hover:bg-[#1A2A24] hover:border-emerald-500/50 dark:hover:border-[#78B99D]/50 transition-all select-none"
              onClick={() => {
                const el = document.getElementById("campaign-search-input");
                if (el) el.focus();
              }}
            />
          </div>
        </div>

        {/* Middle Navigation Menus */}
        <div className="flex-1 overflow-y-auto px-3.5 py-1 space-y-5 sidebar-scroll">
          {/* Main Menu */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-200/50 dark:text-[#9BAAA1]">
              Cockpit Navigation
            </span>

            <nav className="space-y-1 pt-1">
              <Link
                href="/brand"
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isOverview
                    ? "bg-[#1C4E49] dark:bg-[#1B322C] text-white shadow-xs font-bold"
                    : "text-slate-300 dark:text-[#C0CCC4] hover:bg-[#163E3A] dark:hover:bg-[#142621] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutGrid
                    className={`w-4 h-4 ${
                      isOverview ? "text-emerald-400 dark:text-[#78B99D]" : "text-emerald-200/60 dark:text-[#9BAAA1]"
                    }`}
                  />
                  <span>Overview</span>
                </div>
                {campaignCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#102F2B] dark:bg-[#0B1512] border border-[#205B50] dark:border-[#28493D] text-emerald-200 dark:text-[#78B99D]">
                    {campaignCount}
                  </span>
                )}
              </Link>

              <Link
                href="/brand/sales"
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSales
                    ? "bg-[#1C4E49] dark:bg-[#1B322C] text-white shadow-xs font-bold"
                    : "text-slate-300 dark:text-[#C0CCC4] hover:bg-[#163E3A] dark:hover:bg-[#142621] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Store
                    className={`w-4 h-4 ${
                      isSales ? "text-emerald-400 dark:text-[#78B99D]" : "text-emerald-200/60 dark:text-[#9BAAA1]"
                    }`}
                  />
                  <span>Sales &amp; Attribution</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300 dark:text-[#83D1A5] bg-emerald-900/60 dark:bg-[#193629] px-1.5 py-0.5 rounded-full border border-emerald-700/40 dark:border-[#28493D]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-[#83D1A5] animate-pulse" />
                  POS
                </span>
              </Link>

              <Link
                href="/brand/analytics"
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isAnalytics
                    ? "bg-[#1C4E49] dark:bg-[#1B322C] text-white shadow-xs font-bold"
                    : "text-slate-300 dark:text-[#C0CCC4] hover:bg-[#163E3A] dark:hover:bg-[#142621] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp
                    className={`w-4 h-4 ${
                      isAnalytics ? "text-emerald-400 dark:text-[#78B99D]" : "text-emerald-200/60 dark:text-[#9BAAA1]"
                    }`}
                  />
                  <span>Reports &amp; Funnel</span>
                </div>
              </Link>

              <Link
                href="/creator"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 dark:text-[#C0CCC4] hover:bg-[#163E3A] dark:hover:bg-[#142621] hover:text-white transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-emerald-200/60 dark:text-[#9BAAA1]" />
                  <span>Creators Directory</span>
                </div>
              </Link>
            </nav>
          </div>

          {/* Campaign Sectors & Channels */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-200/50 dark:text-[#9BAAA1]">
              Attribution Channels
            </span>

            <div className="space-y-0.5 pt-1">
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-300 dark:text-[#C0CCC4] hover:bg-[#163E3A]/60 dark:hover:bg-[#142621]/60 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-[#78B99D]" />
                  <span>In-Store POS (Bole)</span>
                </div>
                <span className="text-[10px] text-emerald-200/60 dark:text-[#9BAAA1] font-mono">31%</span>
              </div>

              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-300 dark:text-[#C0CCC4] hover:bg-[#163E3A]/60 dark:hover:bg-[#142621]/60 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#229ED9]" />
                  <span>Telegram Bots</span>
                </div>
                <span className="text-[10px] text-emerald-200/60 dark:text-[#9BAAA1] font-mono">58%</span>
              </div>

              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-300 dark:text-[#C0CCC4] hover:bg-[#163E3A]/60 dark:hover:bg-[#142621]/60 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 dark:bg-[#F0B85C]" />
                  <span>Direct Phone Orders</span>
                </div>
                <span className="text-[10px] text-emerald-200/60 dark:text-[#9BAAA1] font-mono">11%</span>
              </div>
            </div>
          </div>

          {/* Support & Audit */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-200/50 dark:text-[#9BAAA1]">
              Governance &amp; Support
            </span>

            <nav className="space-y-1 pt-1">
              {onOpenReportModal && (
                <button
                  type="button"
                  onClick={onOpenReportModal}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 dark:text-[#C0CCC4] hover:bg-[#163E3A] dark:hover:bg-[#142621] hover:text-white transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <LifeBuoy className="w-4 h-4 text-amber-400 dark:text-[#F0B85C]" />
                    <span>Report Issue</span>
                  </div>
                </button>
              )}

              <Link
                href="/privacy"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 dark:text-[#C0CCC4] hover:bg-[#163E3A] dark:hover:bg-[#142621] hover:text-white transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-emerald-200/60 dark:text-[#9BAAA1]" />
                  <span>Privacy &amp; Data Audit</span>
                </div>
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom: Payment Gateway Status, Merchant Switcher & Profile (Matchly Pattern) */}
        <div className="p-3.5 border-t border-[#163E3A] dark:border-[#1E332B] bg-[#0c2522]/80 dark:bg-[#08100E] space-y-2.5">
          {/* Matchly Merchant Account Switcher Card */}
          <div className="bg-[#163E3A] dark:bg-[#142621] rounded-xl p-2.5 flex items-center justify-between border border-[#205B50]/40 dark:border-[#28493D] transition-colors hover:bg-[#1C4E49] dark:hover:bg-[#1B322C] cursor-pointer">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 dark:text-[#F0B85C] flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {brandName}
                </p>
                <p className="text-[10px] text-emerald-200/70 dark:text-[#9BAAA1] truncate">
                  {staffCount > 0 ? `${staffCount} Staff` : "Merchant"} • Bole Flagship
                </p>
              </div>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-emerald-200/60 dark:text-[#9BAAA1] shrink-0" />
          </div>

          {/* Telebirr & CBE Birr Live Integration Card (Stitch Spec) */}
          <div className="bg-[#163E3A]/90 dark:bg-[#142621]/90 rounded-xl p-2 flex items-center justify-between border border-[#205B50]/30 dark:border-[#28493D]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-[#83D1A5] animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-white leading-tight">
                  Telebirr &amp; CBE Birr
                </span>
                <span className="text-[9px] text-emerald-200/70 dark:text-[#9BAAA1]">Gateway Sync v2.4</span>
              </div>
            </div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-300 dark:text-[#83D1A5] bg-emerald-950/80 dark:bg-[#193629] px-1.5 py-0.5 rounded border border-emerald-600/30 dark:border-[#28493D]">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-emerald-600 dark:bg-[#78B99D] text-white dark:text-[#0D2119] font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {brandName.charAt(0)}
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-xs text-white block truncate leading-tight">
                  {ownerName}
                </span>
                <span className="text-[10px] text-emerald-200/60 dark:text-[#9BAAA1] block truncate">
                  {role === "OWNER" ? "Brand Merchant" : role}
                </span>
              </div>
            </div>

            <ThemeToggle size="sm" />
          </div>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold text-slate-300 dark:text-[#C0CCC4] hover:text-rose-300 hover:bg-rose-950/30 border border-[#205B50]/40 dark:border-[#28493D] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
