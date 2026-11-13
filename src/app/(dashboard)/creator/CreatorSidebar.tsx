"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { formatETB } from "@/lib/sales";
import {
  Layers,
  LayoutGrid,
  Receipt,
  QrCode,
  Wallet,
  LifeBuoy,
  LogOut,
  Shield,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2,
  PieChart,
} from "lucide-react";

export interface CreatorSidebarProps {
  creator: {
    id: string;
    name: string;
    phone?: string | null;
    telegramUsername?: string | null;
  };
  activeTab: "overview" | "campaigns" | "links" | "payouts";
  onSelectTab: (tab: "overview" | "campaigns" | "links" | "payouts") => void;
  campaignCount: number;
  estimatedCommissionETB: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenReportModal: () => void;
  lang: "en" | "am";
  onToggleLang: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function CreatorSidebar({
  creator,
  activeTab,
  onSelectTab,
  campaignCount,
  estimatedCommissionETB,
  isMobileOpen,
  onCloseMobile,
  onOpenReportModal,
  lang,
  onToggleLang,
  isCollapsed = false,
  onToggleCollapse,
}: CreatorSidebarProps) {
  const navItems = [
    {
      id: "overview" as const,
      label: "Overview & Earnings",
      icon: LayoutGrid,
      href: "#overview",
    },
    {
      id: "campaigns" as const,
      label: "My Campaigns",
      icon: Receipt,
      href: "#campaigns",
      badge: campaignCount > 0 ? `${campaignCount} Active` : undefined,
    },
    {
      id: "links" as const,
      label: "Tracking Deep Links & QR",
      icon: QrCode,
      href: "#links",
    },
    {
      id: "payouts" as const,
      label: "Telebirr & CBE Payouts",
      icon: Wallet,
      href: "#payouts",
    },
  ];

  const handleNavClick = (id: "overview" | "campaigns" | "links" | "payouts", href: string) => {
    onSelectTab(id);
    onCloseMobile();
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container: The Dark Anchor — Deep Evergreen (#102F2B / Stitch brand-950) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#102F2B] dark:bg-[#08120F] text-white border-r border-[#163E3A] dark:border-[#1A2E28] flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isCollapsed ? "w-20" : "w-72"
        } ${isMobileOpen ? "translate-x-0 shadow-2xl w-72" : "-translate-x-full"}`}
        aria-label="Creator Navigation"
      >
        {/* Top: Brand Header & Creator Profile */}
        <div className={isCollapsed ? "p-3 pb-2 flex flex-col items-center gap-2" : "p-4 pb-2 space-y-3"}>
          <div className={`flex items-center justify-between px-1 pt-0.5 ${isCollapsed ? "flex-col gap-2.5 items-center w-full" : "w-full"}`}>
            <Link
              href="/creator"
              title={isCollapsed ? "EthioLink Attribution Mesh" : undefined}
              className={`flex items-center gap-2.5 group/brand ${isCollapsed ? "justify-center relative" : ""}`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-[#102F2B] dark:from-[#78B99D] dark:to-[#0D2119] text-white dark:text-[#0D2119] flex items-center justify-center font-black text-base shadow-xs group-hover/brand:scale-105 transition-transform shrink-0 border border-emerald-400/20 dark:border-transparent">
                <Layers className="w-5 h-5 text-white dark:text-[#0D2119]" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-headline font-bold text-lg text-white leading-none tracking-tight">
                    Ethio<span className="text-emerald-400 dark:text-[#78B99D]">Link</span>
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-300 dark:text-[#83D1A5] uppercase tracking-wider mt-0.5">
                    Creator Portal
                  </span>
                </div>
              )}
              {isCollapsed && (
                <div className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-[#091F1A] dark:bg-[#14211D] text-white text-xs font-semibold rounded-lg shadow-xl border border-[#1E4D43] dark:border-[#2B4237] whitespace-nowrap opacity-0 -translate-x-1 group-hover/brand:opacity-100 group-hover/brand:translate-x-0 transition-all duration-150 z-50 flex items-center gap-1.5">
                  <span className="font-bold">EthioLink</span>
                  <span className="text-[10px] text-emerald-300 dark:text-[#78B99D] font-mono">v2.4</span>
                </div>
              )}
            </Link>

            {/* Desktop Collapse / Expand Toggle */}
            {onToggleCollapse && (
              <div className="relative group/expand flex items-center justify-center">
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  className={`hidden lg:flex items-center justify-center rounded-xl text-emerald-200/70 hover:text-white hover:bg-[#163E3A] dark:text-[#9BAAA1] dark:hover:text-white dark:hover:bg-[#142621] transition-all cursor-pointer ${
                    isCollapsed ? "w-9 h-9" : "p-1.5"
                  }`}
                >
                  {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                </button>
                {isCollapsed && (
                  <div className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-[#091F1A] dark:bg-[#14211D] text-white text-[11px] font-semibold rounded-lg shadow-xl border border-[#1E4D43] dark:border-[#2B4237] whitespace-nowrap opacity-0 -translate-x-1 group-hover/expand:opacity-100 group-hover/expand:translate-x-0 transition-all duration-150 z-50">
                    Expand Sidebar
                  </div>
                )}
              </div>
            )}

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-emerald-200/70 hover:text-white hover:bg-[#163E3A] dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#142621] transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Creator Profile Card: Synchronized with Brand Sidebar Store Card */}
          {!isCollapsed ? (
            <div className="w-full bg-[#163E3A] hover:bg-[#1C4E49] dark:bg-[#11211C] dark:hover:bg-[#18332A] rounded-xl p-3 flex items-center justify-between transition-colors border border-[#225C52]/60 dark:border-[#20362E] text-left shadow-2xs group/creator">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-600 dark:bg-[#78B99D] text-white dark:text-[#0D2119] font-bold text-xs flex items-center justify-center shrink-0 shadow-xs relative">
                  {creator.name.charAt(0).toUpperCase()}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#163E3A] rounded-full" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-white truncate leading-tight group-hover/creator:text-emerald-200 transition-colors">
                      {creator.name}
                    </p>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-[10px] text-slate-300 dark:text-[#9BAAA1] truncate mt-0.5 font-mono">
                    {creator.telegramUsername ? `@${creator.telegramUsername}` : "@creator_partner"}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-amber-300 dark:text-[#F0B85C] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md shrink-0">
                Tier 1
              </span>
            </div>
          ) : (
            <div className="pt-1 flex justify-center w-full">
              <div
                title={`${creator.name} (Tier 1 Creator Partner)`}
                className="w-10 h-10 rounded-xl bg-[#163E3A] hover:bg-[#1C4E49] dark:bg-[#11211C] text-amber-300 dark:text-[#F0B85C] flex items-center justify-center transition-colors border border-[#225C52]/60 dark:border-[#20362E] shadow-2xs font-bold text-sm"
              >
                {creator.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-8 h-px bg-[#163E3A] dark:bg-[#1E332B] mx-auto mt-1" />
          )}
        </div>

        {/* Middle Navigation Menus */}
        <div
          className={`flex-1 ${
            isCollapsed
              ? "px-2 py-1.5 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden space-y-2 flex flex-col items-center"
              : "px-3.5 py-1 overflow-y-auto space-y-5 sidebar-scroll"
          }`}
        >
          {/* Main Attribution Core Navigation */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-emerald-200/60 dark:text-[#9BAAA1]">
                Attribution Core
              </span>
            )}

            <nav className={`space-y-1 pt-1 ${isCollapsed ? "flex flex-col items-center w-full space-y-1.5" : ""}`}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <div key={item.id} className={isCollapsed ? "relative group/nav flex items-center justify-center w-full" : "w-full"}>
                    <button
                      type="button"
                      onClick={() => handleNavClick(item.id, item.href)}
                      aria-label={item.label}
                      className={`flex items-center transition-all cursor-pointer ${
                        isCollapsed
                          ? "w-10 h-10 rounded-xl justify-center relative hover:scale-105"
                          : "w-full justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left"
                      } ${
                        isActive
                          ? "bg-[#1C554C] dark:bg-[#18332A] text-white border border-emerald-400/30 dark:border-[#28493D] shadow-xs font-bold"
                          : "text-[#C5DCD6] dark:text-[#9BAAA1] hover:bg-[#16443D] dark:hover:bg-[#11211C] hover:text-white dark:hover:text-white"
                      }`}
                    >
                      {isCollapsed && isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-emerald-400 dark:bg-[#78B99D] shadow-xs" />
                      )}
                      <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2.5"}`}>
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive
                              ? "text-emerald-300 dark:text-[#78B99D]"
                              : "text-emerald-200/60 dark:text-[#9BAAA1]"
                          }`}
                        />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>
                      {!isCollapsed && item.badge && (
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-md bg-[#0D2B26] dark:bg-[#060D0B] border border-emerald-500/40 dark:border-[#20362E] text-emerald-200 dark:text-[#78B99D]">
                          {item.badge}
                        </span>
                      )}
                      {!isCollapsed && !item.badge && isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-[#78B99D]" />
                      )}
                    </button>
                    {isCollapsed && (
                      <div className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-[#091F1A] dark:bg-[#14211D] text-white text-xs font-semibold rounded-lg shadow-xl border border-[#1E4D43] dark:border-[#2B4237] whitespace-nowrap opacity-0 -translate-x-1 group-hover/nav:opacity-100 group-hover/nav:translate-x-0 transition-all duration-150 z-50 flex items-center gap-1.5">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-mono font-bold text-emerald-300 dark:text-[#78B99D] bg-[#143B33] dark:bg-[#1C3229] px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Dynamic Attribution Channel Share Widget */}
          {isCollapsed ? (
            <div className="py-0.5 w-full flex flex-col items-center">
              <div className="w-8 h-px bg-[#1B4B42]/50 dark:bg-[#1E332B]/50 mx-auto my-1.5" />
              <div className="relative group/chan flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleNavClick("overview", "#overview")}
                  aria-label="Attribution Channels breakdown"
                  className="w-10 h-10 rounded-xl bg-[#0C2722]/80 dark:bg-[#060D0B]/80 hover:bg-[#16443D] dark:hover:bg-[#11211C] border border-[#16443D] dark:border-[#1E332B] flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#229ED9]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-[#78B99D]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-[#F0B85C]" />
                  </div>
                  <PieChart className="w-3.5 h-3.5 text-emerald-200/70 dark:text-[#9BAAA1]" />
                </button>

                {/* Floating Rich Tooltip */}
                <div className="pointer-events-none absolute left-full ml-3 p-3 bg-[#091F1A] dark:bg-[#14211D] text-white text-xs font-semibold rounded-xl shadow-2xl border border-[#1E4D43] dark:border-[#2B4237] whitespace-nowrap opacity-0 -translate-x-1 group-hover/chan:opacity-100 group-hover/chan:translate-x-0 transition-all duration-150 z-50 flex flex-col gap-1.5 min-w-[200px]">
                  <div className="flex items-center justify-between border-b border-[#1E4D43]/60 dark:border-[#26372F] pb-1.5">
                    <span className="text-[11px] font-bold text-emerald-300 dark:text-[#78B99D] uppercase tracking-wider">
                      Attribution Channels
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">100% Total</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] pt-0.5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-[#229ED9] shrink-0" />
                        Telegram Mini-Apps
                      </span>
                      <span className="font-mono font-bold text-blue-300">62%</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        In-Store POS (Maps)
                      </span>
                      <span className="font-mono font-bold text-emerald-300">24%</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                        Direct Promo Codes
                      </span>
                      <span className="font-mono font-bold text-amber-300">14%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-8 h-px bg-[#1B4B42]/50 dark:bg-[#1E332B]/50 mx-auto my-1.5" />
            </div>
          ) : (
            <div className="space-y-1.5">
              <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-emerald-200/60 dark:text-[#9BAAA1]">
                Attribution Channels
              </span>

              <div className="space-y-1.5 pt-0.5 px-1">
                {/* Channel 1: Telegram Mini-Apps */}
                <div className="p-2 rounded-xl bg-[#0C2722]/60 dark:bg-[#060D0B]/70 border border-[#16443D]/60 dark:border-[#1E332B]/60 space-y-1.5 cursor-default">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#229ED9] shrink-0" />
                      <span className="text-[#C5DCD6] dark:text-[#C0CCC4] font-medium">Telegram Mini-Apps</span>
                    </div>
                    <span className="text-[11px] text-blue-300 dark:text-[#93C5FD] font-mono font-bold">
                      62%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#16443D]/50 dark:bg-[#101C18] overflow-hidden">
                    <div
                      style={{ width: "62%" }}
                      className="h-full bg-[#229ED9] rounded-full transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Channel 2: In-Store POS (Maps) */}
                <div className="p-2 rounded-xl bg-[#0C2722]/60 dark:bg-[#060D0B]/70 border border-[#16443D]/60 dark:border-[#1E332B]/60 space-y-1.5 cursor-default">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-[#78B99D] shrink-0" />
                      <span className="text-[#C5DCD6] dark:text-[#C0CCC4] font-medium">In-Store POS (Maps)</span>
                    </div>
                    <span className="text-[11px] text-emerald-300 dark:text-[#78B99D] font-mono font-bold">
                      24%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#16443D]/50 dark:bg-[#101C18] overflow-hidden">
                    <div
                      style={{ width: "24%" }}
                      className="h-full bg-emerald-400 dark:bg-[#78B99D] rounded-full transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Channel 3: Direct Promo Codes */}
                <div className="p-2 rounded-xl bg-[#0C2722]/60 dark:bg-[#060D0B]/70 border border-[#16443D]/60 dark:border-[#1E332B]/60 space-y-1.5 cursor-default">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 dark:bg-[#F0B85C] shrink-0" />
                      <span className="text-[#C5DCD6] dark:text-[#C0CCC4] font-medium">Direct Promo Codes</span>
                    </div>
                    <span className="text-[11px] text-amber-300 dark:text-[#F0B85C] font-mono font-bold">
                      14%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#16443D]/50 dark:bg-[#101C18] overflow-hidden">
                    <div
                      style={{ width: "14%" }}
                      className="h-full bg-amber-400 dark:bg-[#F0B85C] rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Governance & Support Section */}
          <div className={`space-y-1 ${isCollapsed ? "w-full flex flex-col items-center" : ""}`}>
            {!isCollapsed && (
              <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-emerald-200/60 dark:text-[#9BAAA1]">
                Governance &amp; Support
              </span>
            )}

            <nav className={`space-y-1 pt-1 ${isCollapsed ? "flex flex-col items-center w-full space-y-1.5" : ""}`}>
              {/* Report Discrepancy Button */}
              <div className={isCollapsed ? "relative group/gov flex items-center justify-center w-full" : "w-full"}>
                <button
                  type="button"
                  onClick={() => {
                    onOpenReportModal();
                    onCloseMobile();
                  }}
                  aria-label="Report Discrepancy"
                  className={`flex items-center text-[#C5DCD6] dark:text-[#9BAAA1] hover:bg-[#16443D] dark:hover:bg-[#11211C] hover:text-white dark:hover:text-white transition-all cursor-pointer ${
                    isCollapsed
                      ? "w-10 h-10 rounded-xl justify-center relative hover:scale-105"
                      : "w-full justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left"
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2.5"}`}>
                    <LifeBuoy className="w-4 h-4 text-amber-400 dark:text-[#F0B85C] shrink-0" />
                    {!isCollapsed && <span>Report Discrepancy</span>}
                  </div>
                </button>
                {isCollapsed && (
                  <div className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-[#091F1A] dark:bg-[#14211D] text-white text-xs font-semibold rounded-lg shadow-xl border border-[#1E4D43] dark:border-[#2B4237] whitespace-nowrap opacity-0 -translate-x-1 group-hover/gov:opacity-100 group-hover/gov:translate-x-0 transition-all duration-150 z-50 flex items-center gap-1.5">
                    <span>Report Discrepancy</span>
                  </div>
                )}
              </div>

              {/* Privacy & Retention Audit Link */}
              <div className={isCollapsed ? "relative group/gov flex items-center justify-center w-full" : "w-full"}>
                <Link
                  href="/privacy"
                  aria-label="Privacy & Data Audit"
                  className={`flex items-center text-[#C5DCD6] dark:text-[#9BAAA1] hover:bg-[#16443D] dark:hover:bg-[#11211C] hover:text-white dark:hover:text-white transition-all ${
                    isCollapsed
                      ? "w-10 h-10 rounded-xl justify-center relative hover:scale-105"
                      : "w-full justify-between px-3 py-2 rounded-xl text-xs font-semibold"
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2.5"}`}>
                    <Shield className="w-4 h-4 text-emerald-200/60 dark:text-[#9BAAA1] shrink-0" />
                    {!isCollapsed && <span>Privacy &amp; Data Audit</span>}
                  </div>
                </Link>
                {isCollapsed && (
                  <div className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-[#091F1A] dark:bg-[#14211D] text-white text-xs font-semibold rounded-lg shadow-xl border border-[#1E4D43] dark:border-[#2B4237] whitespace-nowrap opacity-0 -translate-x-1 group-hover/gov:opacity-100 group-hover/gov:translate-x-0 transition-all duration-150 z-50 flex items-center gap-1.5">
                    <span>Privacy &amp; Retention Audit</span>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>

        {/* Bottom: Payment Gateway Status, Profile & Utility Suite */}
        <div className={`border-t border-[#1B4B42] dark:border-[#1E332B] bg-[#0B2520] dark:bg-[#050A08] transition-colors ${
          isCollapsed ? "p-2.5 flex flex-col items-center gap-2" : "p-3 space-y-2.5"
        }`}>
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2.5 w-full">
              {/* Collapsed Creator Profile Button */}
              <div className="relative group/bot flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleNavClick("payouts", "#payouts")}
                  aria-label={`${creator.name} (Creator Profile & Wallet)`}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1C554C] to-[#0D2B26] dark:from-[#18332A] dark:to-[#0D1714] border border-[#2B7366] dark:border-[#28493D] text-white flex items-center justify-center font-bold text-sm shadow-xs hover:border-emerald-400 hover:scale-105 transition-all cursor-pointer relative"
                >
                  <span>{creator.name.charAt(0).toUpperCase()}</span>
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#0B2520] dark:border-[#050A08]" />
                  </span>
                </button>

                {/* Floating Profile Tooltip */}
                <div className="pointer-events-none absolute left-full ml-3 p-2.5 bg-[#091F1A] dark:bg-[#14211D] text-white text-xs font-semibold rounded-xl shadow-2xl border border-[#1E4D43] dark:border-[#2B4237] whitespace-nowrap opacity-0 -translate-x-1 group-hover/bot:opacity-100 group-hover/bot:translate-x-0 transition-all duration-150 z-50 flex flex-col gap-1 min-w-[180px]">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>{creator.name}</span>
                    <span className="text-[10px] text-amber-300 dark:text-[#F0B85C] font-mono px-1 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">Tier 1</span>
                  </div>
                  <div className="text-[11px] text-emerald-300 dark:text-[#83D1A5] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Telebirr Linked</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal border-t border-[#1E4D43]/60 dark:border-[#26372F] pt-1 mt-0.5 font-mono">
                    {formatETB(estimatedCommissionETB > 0 ? estimatedCommissionETB : 0)} Available
                  </div>
                </div>
              </div>

              {/* Utility Row: Theme Toggle & Sign Out */}
              <div className="flex flex-col items-center gap-1.5 w-full">
                <div className="relative group/bot flex items-center justify-center">
                  <ThemeToggle
                    size="sm"
                    className="!w-9 !h-9 !bg-[#16443D] dark:!bg-[#11211C] !border-[#225C52] dark:!border-[#20362E] !text-emerald-100 dark:!text-[#9BAAA1] hover:!bg-[#1C554C] dark:hover:!bg-[#18332A] rounded-xl flex items-center justify-center shadow-xs cursor-pointer"
                  />
                  <div className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-[#091F1A] dark:bg-[#14211D] text-white text-[11px] font-semibold rounded-lg shadow-xl border border-[#1E4D43] dark:border-[#2B4237] whitespace-nowrap opacity-0 -translate-x-1 group-hover/bot:opacity-100 group-hover/bot:translate-x-0 transition-all duration-150 z-50">
                    Switch Theme
                  </div>
                </div>

                <form action="/api/auth/logout" method="POST" className="w-full flex justify-center">
                  <div className="relative group/bot flex items-center justify-center">
                    <button
                      type="submit"
                      aria-label="Sign Out"
                      className="w-9 h-9 flex items-center justify-center rounded-xl text-emerald-200/60 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                    <div className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-[#091F1A] dark:bg-[#14211D] text-rose-300 text-[11px] font-semibold rounded-lg shadow-xl border border-rose-900/60 whitespace-nowrap opacity-0 -translate-x-1 group-hover/bot:opacity-100 group-hover/bot:translate-x-0 transition-all duration-150 z-50">
                      Sign Out
                    </div>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <>
              {/* Interactive Telebirr Payout Status Card: Matching BrandSidebar Payment Gateway */}
              <button
                type="button"
                onClick={() => handleNavClick("payouts", "#payouts")}
                className="w-full bg-[#163E3A]/80 dark:bg-[#101F1C]/80 rounded-xl p-2.5 flex items-center justify-between border border-[#225C52]/60 dark:border-[#20362E] transition-all hover:bg-[#1C4E49] cursor-pointer shadow-2xs h-11 text-left group/gateway"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-[#83D1A5] animate-pulse shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium text-slate-200 group-hover/gateway:text-white block truncate">
                      Telebirr &amp; CBE Birr
                    </span>
                    <span className="text-[10px] text-emerald-300 dark:text-[#83D1A5] font-mono block truncate">
                      {formatETB(estimatedCommissionETB > 0 ? estimatedCommissionETB : 0)} Available
                    </span>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 dark:text-[#83D1A5] bg-emerald-950/80 dark:bg-[#193629] px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                  Linked
                </span>
              </button>

              {/* Creator Profile, Language Toggle, Themed ThemeToggle & Sign Out */}
              <div className="flex items-center justify-between px-1.5 pt-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 dark:bg-[#78B99D] text-white dark:text-[#0D2119] font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {creator.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-white block truncate leading-tight">
                      {creator.name}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-[#9BAAA1] block truncate mt-0.5">
                      Creator Partner
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={onToggleLang}
                    className="px-2 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#163E3A] rounded-lg border border-[#225C52]/60 transition-colors cursor-pointer"
                    title="Toggle Amharic / English"
                  >
                    {lang === "en" ? "አማ / EN" : "EN / አማ"}
                  </button>
                  <ThemeToggle
                    size="sm"
                    className="!bg-[#163E3A] hover:!bg-[#1C4E49] !border-[#225C52] !text-emerald-100 rounded-lg"
                  />
                  <form action="/api/auth/logout" method="POST" className="inline-flex">
                    <button
                      type="submit"
                      aria-label="Sign Out"
                      title="Sign Out"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#163E3A] transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
