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

      {/* Sidebar Container: True Celadon Sage (#CBE1D4) in Light / Deep Evergreen Forest (#10352F) in Dark */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#CBE1D4] dark:bg-[#10352F] text-[#0A2621] dark:text-white border-r border-[#A2C7B4] dark:border-[#1B4B42] flex flex-col justify-between transition-colors duration-150 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Top: Brand Header & Search Bar (Matchly Pattern) */}
        <div className="p-3.5 space-y-3">
          <div className="flex items-center justify-between px-1 pt-0.5">
            <Link href="/brand" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#10352F] dark:bg-[#78B99D] text-white dark:text-[#0D2119] flex items-center justify-center font-black text-base shadow-xs group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5 text-white dark:text-[#0D2119]" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-bold text-lg text-[#0A2621] dark:text-white leading-none tracking-tight">
                  Ethio<span className="text-emerald-800 dark:text-[#78B99D]">Link</span>
                </span>
                <span className="text-[10px] font-semibold text-[#2D5E52] dark:text-[#83D1A5] uppercase tracking-wider mt-0.5">
                  Attribution Engine
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#2D5E52] hover:text-[#0A2621] hover:bg-[#B9D7C7] dark:text-emerald-200/70 dark:hover:text-white dark:hover:bg-[#16443D] transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Shortcut Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#2A5C50] dark:text-emerald-200/60 pointer-events-none" />
            <input
              type="text"
              readOnly
              placeholder="Search campaigns..."
              className="w-full pl-9 pr-3 h-9 text-xs rounded-xl bg-[#B9D7C7] dark:bg-[#16443D] border border-[#96BFA9] dark:border-[#225C52] text-[#0A2621] dark:text-slate-100 placeholder:text-[#2A5C50] dark:placeholder:text-emerald-200/60 focus:outline-none cursor-pointer hover:bg-[#ACD0BE] dark:hover:bg-[#1A4E46] hover:border-[#7FAFA0] dark:hover:border-emerald-400/60 transition-all select-none shadow-2xs"
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
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#2D5E52] dark:text-emerald-200/60">
              Cockpit Navigation
            </span>

            <nav className="space-y-1 pt-1">
              <Link
                href="/brand"
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isOverview
                    ? "bg-[#A9D0BD] dark:bg-[#1C554C] text-[#08221D] dark:text-white border border-[#7FAFA0] dark:border-emerald-400/30 shadow-xs font-bold"
                    : "text-[#154238] dark:text-[#C5DCD6] hover:bg-[#B9D7C7] dark:hover:bg-[#16443D] hover:text-[#08221D] dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutGrid
                    className={`w-4 h-4 ${
                      isOverview
                        ? "text-[#10352F] dark:text-emerald-300"
                        : "text-[#2D5E52] dark:text-emerald-200/60"
                    }`}
                  />
                  <span>Overview</span>
                </div>
                {campaignCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#96C4AD] dark:bg-[#0D2B26] border border-[#6E9E86] dark:border-emerald-500/40 text-[#08221D] dark:text-emerald-200">
                    {campaignCount}
                  </span>
                )}
              </Link>

              <Link
                href="/brand/sales"
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSales
                    ? "bg-[#A9D0BD] dark:bg-[#1C554C] text-[#08221D] dark:text-white border border-[#7FAFA0] dark:border-emerald-400/30 shadow-xs font-bold"
                    : "text-[#154238] dark:text-[#C5DCD6] hover:bg-[#B9D7C7] dark:hover:bg-[#16443D] hover:text-[#08221D] dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Store
                    className={`w-4 h-4 ${
                      isSales
                        ? "text-[#10352F] dark:text-emerald-300"
                        : "text-[#2D5E52] dark:text-emerald-200/60"
                    }`}
                  />
                  <span>Sales &amp; Attribution</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-950 dark:text-emerald-300 bg-emerald-200/90 dark:bg-emerald-900/70 px-1.5 py-0.5 rounded-full border border-emerald-400 dark:border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 dark:bg-emerald-400 animate-pulse" />
                  POS
                </span>
              </Link>

              <Link
                href="/brand/analytics"
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isAnalytics
                    ? "bg-[#A9D0BD] dark:bg-[#1C554C] text-[#08221D] dark:text-white border border-[#7FAFA0] dark:border-emerald-400/30 shadow-xs font-bold"
                    : "text-[#154238] dark:text-[#C5DCD6] hover:bg-[#B9D7C7] dark:hover:bg-[#16443D] hover:text-[#08221D] dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp
                    className={`w-4 h-4 ${
                      isAnalytics
                        ? "text-[#10352F] dark:text-emerald-300"
                        : "text-[#2D5E52] dark:text-emerald-200/60"
                    }`}
                  />
                  <span>Reports &amp; Funnel</span>
                </div>
              </Link>

              <Link
                href="/creator"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#154238] dark:text-[#C5DCD6] hover:bg-[#B9D7C7] dark:hover:bg-[#16443D] hover:text-[#08221D] dark:hover:text-white transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[#2D5E52] dark:text-emerald-200/60" />
                  <span>Creators Directory</span>
                </div>
              </Link>
            </nav>
          </div>

          {/* Campaign Sectors & Channels */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#2D5E52] dark:text-emerald-200/60">
              Attribution Channels
            </span>

            <div className="space-y-0.5 pt-1">
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-[#154238] dark:text-[#C5DCD6] hover:bg-[#B9D7C7]/70 dark:hover:bg-[#16443D]/70 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-700 dark:bg-emerald-400" />
                  <span>In-Store POS (Bole)</span>
                </div>
                <span className="text-[10px] text-[#2D5E52] dark:text-emerald-200/60 font-mono">31%</span>
              </div>

              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-[#154238] dark:text-[#C5DCD6] hover:bg-[#B9D7C7]/70 dark:hover:bg-[#16443D]/70 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#229ED9]" />
                  <span>Telegram Bots</span>
                </div>
                <span className="text-[10px] text-[#2D5E52] dark:text-emerald-200/60 font-mono">58%</span>
              </div>

              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-[#154238] dark:text-[#C5DCD6] hover:bg-[#B9D7C7]/70 dark:hover:bg-[#16443D]/70 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" />
                  <span>Direct Phone Orders</span>
                </div>
                <span className="text-[10px] text-[#2D5E52] dark:text-emerald-200/60 font-mono">11%</span>
              </div>
            </div>
          </div>

          {/* Support & Audit */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#2D5E52] dark:text-emerald-200/60">
              Governance &amp; Support
            </span>

            <nav className="space-y-1 pt-1">
              {onOpenReportModal && (
                <button
                  type="button"
                  onClick={onOpenReportModal}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#154238] dark:text-[#C5DCD6] hover:bg-[#B9D7C7] dark:hover:bg-[#16443D] hover:text-[#08221D] dark:hover:text-white transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <LifeBuoy className="w-4 h-4 text-amber-600 dark:text-[#F0B85C]" />
                    <span>Report Issue</span>
                  </div>
                </button>
              )}

              <Link
                href="/privacy"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#154238] dark:text-[#C5DCD6] hover:bg-[#B9D7C7] dark:hover:bg-[#16443D] hover:text-[#08221D] dark:hover:text-white transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-[#2D5E52] dark:text-emerald-200/60" />
                  <span>Privacy &amp; Data Audit</span>
                </div>
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom: Payment Gateway Status, Merchant Switcher & Profile (Matchly Pattern) */}
        <div className="p-3.5 border-t border-[#A2C7B4] dark:border-[#1B4B42] bg-[#BBD9C9] dark:bg-[#0B2520] space-y-2.5 transition-colors">
          {/* Matchly Merchant Account Switcher Card */}
          <div className="bg-[#D7EAE0] dark:bg-[#16443D] rounded-xl p-2.5 flex items-center justify-between border border-[#96BFA9] dark:border-[#225C52] transition-colors hover:bg-[#CCE3D5] dark:hover:bg-[#1C554C] cursor-pointer shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-400/20 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-[#08221D] dark:text-white truncate leading-tight">
                  {brandName}
                </p>
                <p className="text-[10px] text-[#2D5E52] dark:text-emerald-200/70 truncate">
                  {staffCount > 0 ? `${staffCount} Staff` : "Merchant"} • Bole Flagship
                </p>
              </div>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-[#2D5E52] dark:text-emerald-200/60 shrink-0" />
          </div>

          {/* Telebirr & CBE Birr Live Integration Card (Stitch Spec) */}
          <div className="bg-[#D7EAE0]/90 dark:bg-[#16443D]/90 rounded-xl p-2 flex items-center justify-between border border-[#96BFA9] dark:border-[#225C52] shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-700 dark:bg-emerald-400 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-[#08221D] dark:text-white leading-tight">
                  Telebirr &amp; CBE Birr
                </span>
                <span className="text-[9px] text-[#2D5E52] dark:text-emerald-200/70">Gateway Sync v2.4</span>
              </div>
            </div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-950 dark:text-emerald-300 bg-emerald-200/90 dark:bg-emerald-900/80 px-1.5 py-0.5 rounded border border-emerald-400 dark:border-emerald-500/40">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#10352F] dark:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {brandName.charAt(0)}
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-xs text-[#08221D] dark:text-white block truncate leading-tight">
                  {ownerName}
                </span>
                <span className="text-[10px] text-[#2D5E52] dark:text-emerald-200/60 block truncate">
                  {role === "OWNER" ? "Brand Merchant" : role}
                </span>
              </div>
            </div>

            <ThemeToggle size="sm" />
          </div>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold text-[#154238] dark:text-[#C5DCD6] bg-[#D7EAE0]/80 dark:bg-[#16443D]/70 hover:text-rose-800 dark:hover:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/40 border border-[#96BFA9] dark:border-[#225C52] shadow-2xs transition-colors cursor-pointer"
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
