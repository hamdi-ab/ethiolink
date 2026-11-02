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
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Top: Brand Logo & Search */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Link href="/brand" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                E
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-black text-lg text-slate-900 dark:text-white leading-none tracking-tight">
                  Ethio<span className="text-emerald-600 dark:text-emerald-400">Link.</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                  Merchant Console
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Shortcut Input (Matchly style) */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              readOnly
              placeholder="Search campaigns... ⌘K"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors select-none"
              onClick={() => {
                const el = document.getElementById("campaign-search-input");
                if (el) el.focus();
              }}
            />
          </div>
        </div>

        {/* Middle Navigation Menus */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 sidebar-scroll">
          {/* Main Menu */}
          <div className="space-y-1">
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Main Menu
            </span>

            <nav className="space-y-1 pt-1.5">
              <Link
                href="/brand"
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isOverview
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutGrid className={`w-4 h-4 ${isOverview ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                  <span>Overview</span>
                </div>
                {campaignCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    {campaignCount}
                  </span>
                )}
              </Link>

              <Link
                href="/brand/sales"
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSales
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Store className={`w-4 h-4 ${isSales ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                  <span>POS Terminal</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </Link>

              <Link
                href="/brand/analytics"
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isAnalytics
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className={`w-4 h-4 ${isAnalytics ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                  <span>Analytics Funnel</span>
                </div>
              </Link>

              <Link
                href="/creator"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Creator Portal</span>
                </div>
              </Link>
            </nav>
          </div>

          {/* Campaign Sectors (Matchly Category Tags) */}
          <div className="space-y-1.5">
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Campaign Sectors
            </span>

            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Retail &amp; POS Walk-in</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">1</span>
              </div>

              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#229ED9]" />
                  <span>Telegram Bots</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">2</span>
              </div>

              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  <span>Fashion &amp; Lifestyle</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">1</span>
              </div>

              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Food &amp; Coffee</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">2</span>
              </div>
            </div>
          </div>

          {/* Other & Support */}
          <div className="space-y-1">
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Operations &amp; Help
            </span>

            <nav className="space-y-1 pt-1">
              {onOpenReportModal && (
                <button
                  type="button"
                  onClick={onOpenReportModal}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <LifeBuoy className="w-4 h-4 text-amber-500" />
                    <span>Report Issue</span>
                  </div>
                </button>
              )}

              <Link
                href="/privacy"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Privacy &amp; Data</span>
                </div>
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom: Merchant Profile & Quick Actions */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                {brandName.charAt(0)}
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-xs text-slate-900 dark:text-white block truncate">
                  {brandName}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                  {ownerName} • {staffCount > 0 ? `${staffCount} staff` : role}
                </span>
              </div>
            </div>

            <ThemeToggle size="sm" />
          </div>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200/60 dark:border-slate-800 transition-colors cursor-pointer"
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
