"use client";

import React, { useState } from "react";
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
  Shield,
  X,
  ChevronsUpDown,
  Layers,
  Send,
  Building,
  Activity,
  Zap,
  UserPlus,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { CreatorRosterItem } from "./brand-helpers";

export interface BrandSidebarProps {
  brandName: string;
  ownerName: string;
  brandPhone?: string;
  role: string;
  campaignCount: number;
  staffCount: number;
  staffList?: Array<{ id: string; name: string; phone: string; role: string }>;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenReportModal?: () => void;
  onOpenCreatorsModal?: () => void;
  eventsBreakdown?: {
    telegram: number;
    calls: number;
    maps: number;
    promoCopies: number;
    total: number;
  };
  creatorRoster?: CreatorRosterItem[];
  activeTab?: "overview" | "sales" | "analytics" | "privacy";
  onTabChange?: (tab: "overview" | "sales" | "analytics" | "privacy") => void;
}

export const BrandSidebar = React.memo(function BrandSidebar({
  brandName,
  ownerName,
  brandPhone,
  role,
  campaignCount,
  staffCount,
  staffList = [],
  isMobileOpen,
  onCloseMobile,
  onOpenReportModal,
  onOpenCreatorsModal,
  eventsBreakdown,
  creatorRoster = [],
  activeTab,
  onTabChange,
}: BrandSidebarProps) {
  const pathname = usePathname();

  const [isMerchantModalOpen, setIsMerchantModalOpen] = useState(false);
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [isLocalCreatorsModalOpen, setIsLocalCreatorsModalOpen] = useState(false);
  const [copiedCreatorId, setCopiedCreatorId] = useState<string | null>(null);

  const resolvedTab = activeTab || (pathname === "/brand/sales" ? "sales" : pathname === "/brand/analytics" ? "analytics" : pathname === "/privacy" ? "privacy" : "overview");
  const isOverview = resolvedTab === "overview";
  const isSales = resolvedTab === "sales";
  const isAnalytics = resolvedTab === "analytics";
  const isPrivacy = resolvedTab === "privacy";

  const handleNavClick = (tab: "overview" | "sales" | "analytics" | "privacy") => {
    if (onTabChange) {
      onTabChange(tab);
      onCloseMobile();
    }
  };

  // Calculate dynamic channel distribution
  const totalEvents = eventsBreakdown?.total || 0;
  const tgPercent =
    totalEvents > 0
      ? Math.round(((eventsBreakdown?.telegram || 0) / totalEvents) * 100)
      : 0;
  const mapPercent =
    totalEvents > 0
      ? Math.round(((eventsBreakdown?.maps || 0) / totalEvents) * 100)
      : 0;
  const callPercent =
    totalEvents > 0
      ? Math.round(((eventsBreakdown?.calls || 0) / totalEvents) * 100)
      : 0;

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCreatorId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedCreatorId(null), 2000);
  };

  const handleOpenCreators = () => {
    if (onOpenCreatorsModal) {
      onOpenCreatorsModal();
    } else {
      setIsLocalCreatorsModalOpen(true);
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container: The Dark Anchor — Deep Evergreen (#10352F) in Light / Midnight Pine (#08120F) in Dark */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#10352F] dark:bg-[#08120F] text-white border-r border-[#1B4B42] dark:border-[#1E332B] flex flex-col justify-between transition-colors duration-150 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Top: Brand Header */}
        <div className="p-3.5 pb-2">
          <div className="flex items-center justify-between px-1 pt-0.5">
            {onTabChange ? (
              <button
                type="button"
                onClick={() => handleNavClick("overview")}
                className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-[#78B99D] text-white dark:text-[#0D2119] flex items-center justify-center font-black text-base shadow-xs group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5 text-white dark:text-[#0D2119]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-headline font-bold text-lg text-white leading-none tracking-tight">
                    Ethio<span className="text-emerald-400 dark:text-[#78B99D]">Link</span>
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-300 dark:text-[#83D1A5] uppercase tracking-wider mt-0.5">
                    Attribution Engine
                  </span>
                </div>
              </button>
            ) : (
              <Link href="/brand" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-[#78B99D] text-white dark:text-[#0D2119] flex items-center justify-center font-black text-base shadow-xs group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5 text-white dark:text-[#0D2119]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-headline font-bold text-lg text-white leading-none tracking-tight">
                    Ethio<span className="text-emerald-400 dark:text-[#78B99D]">Link</span>
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-300 dark:text-[#83D1A5] uppercase tracking-wider mt-0.5">
                    Attribution Engine
                  </span>
                </div>
              </Link>
            )}

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-emerald-200/70 hover:text-white hover:bg-[#16443D] dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#142621] transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Middle Navigation Menus */}
        <div className="flex-1 overflow-y-auto px-3.5 py-1 space-y-5 sidebar-scroll">
          {/* Main Menu */}
          <div className="space-y-1">
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-emerald-200/60 dark:text-[#9BAAA1]">
              Cockpit Navigation
            </span>

            <nav className="space-y-1 pt-1">
              {onTabChange ? (
                <button
                  type="button"
                  onClick={() => handleNavClick("overview")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    isOverview
                      ? "bg-[#1C554C] dark:bg-[#18332A] text-white border border-emerald-400/30 dark:border-transparent shadow-xs font-bold"
                      : "text-[#C5DCD6] dark:text-[#9BAAA1] hover:bg-[#16443D] dark:hover:bg-[#11211C] hover:text-white dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutGrid
                      className={`w-4 h-4 ${
                        isOverview
                          ? "text-emerald-300 dark:text-[#78B99D]"
                          : "text-emerald-200/60 dark:text-[#9BAAA1]"
                      }`}
                    />
                    <span>Overview</span>
                  </div>
                  {campaignCount > 0 && (
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-md bg-[#0D2B26] dark:bg-[#060D0B] border border-emerald-500/40 dark:border-[#20362E] text-emerald-200 dark:text-[#78B99D]">
                      {campaignCount}
                    </span>
                  )}
                </button>
              ) : (
                <Link
                  href="/brand"
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isOverview
                      ? "bg-[#1C554C] dark:bg-[#18332A] text-white border border-emerald-400/30 dark:border-transparent shadow-xs font-bold"
                      : "text-[#C5DCD6] dark:text-[#9BAAA1] hover:bg-[#16443D] dark:hover:bg-[#11211C] hover:text-white dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutGrid
                      className={`w-4 h-4 ${
                        isOverview
                          ? "text-emerald-300 dark:text-[#78B99D]"
                          : "text-emerald-200/60 dark:text-[#9BAAA1]"
                      }`}
                    />
                    <span>Overview</span>
                  </div>
                  {campaignCount > 0 && (
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-md bg-[#0D2B26] dark:bg-[#060D0B] border border-emerald-500/40 dark:border-[#20362E] text-emerald-200 dark:text-[#78B99D]">
                      {campaignCount}
                    </span>
                  )}
                </Link>
              )}

              {onTabChange ? (
                <button
                  type="button"
                  onClick={() => handleNavClick("sales")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    isSales
                      ? "bg-[#1C554C] dark:bg-[#18332A] text-white border border-emerald-400/30 dark:border-transparent shadow-xs font-bold"
                      : "text-[#C5DCD6] dark:text-[#9BAAA1] hover:bg-[#16443D] dark:hover:bg-[#11211C] hover:text-white dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Store
                      className={`w-4 h-4 ${
                        isSales
                          ? "text-emerald-300 dark:text-[#78B99D]"
                          : "text-emerald-200/60 dark:text-[#9BAAA1]"
                      }`}
                    />
                    <span>Sales &amp; Attribution</span>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300 dark:text-[#83D1A5] bg-emerald-900/70 dark:bg-[#193629] px-1.5 py-0.5 rounded-full border border-emerald-500/40 dark:border-[#28493D]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-[#83D1A5] animate-pulse" />
                    POS
                  </span>
                </button>
              ) : (
                <Link
                  href="/brand/sales"
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isSales
                      ? "bg-[#1C554C] dark:bg-[#18332A] text-white border border-emerald-400/30 dark:border-transparent shadow-xs font-bold"
                      : "text-[#C5DCD6] dark:text-[#9BAAA1] hover:bg-[#16443D] dark:hover:bg-[#11211C] hover:text-white dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Store
                      className={`w-4 h-4 ${
                        isSales
                          ? "text-emerald-300 dark:text-[#78B99D]"
                          : "text-emerald-200/60 dark:text-[#9BAAA1]"
                      }`}
                    />
                    <span>Sales &amp; Attribution</span>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300 dark:text-[#83D1A5] bg-emerald-900/70 dark:bg-[#193629] px-1.5 py-0.5 rounded-full border border-emerald-500/40 dark:border-[#28493D]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-[#83D1A5] animate-pulse" />
                    POS
                  </span>
                </Link>
              )}

              {onTabChange ? (
                <button
                  type="button"
                  onClick={() => handleNavClick("analytics")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    isAnalytics
                      ? "bg-[#1C554C] dark:bg-[#18332A] text-white border border-emerald-400/30 dark:border-transparent shadow-xs font-bold"
                      : "text-[#C5DCD6] dark:text-[#9BAAA1] hover:bg-[#16443D] dark:hover:bg-[#11211C] hover:text-white dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp
                      className={`w-4 h-4 ${
                        isAnalytics
                          ? "text-emerald-300 dark:text-[#78B99D]"
                          : "text-emerald-200/60 dark:text-[#9BAAA1]"
                      }`}
                    />
                    <span>Reports &amp; Funnel</span>
                  </div>
                </button>
              ) : (
                <Link
                  href="/brand/analytics"
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isAnalytics
                      ? "bg-[#1C554C] dark:bg-[#18332A] text-white border border-emerald-400/30 dark:border-transparent shadow-xs font-bold"
                      : "text-[#C5DCD6] dark:text-[#9BAAA1] hover:bg-[#16443D] dark:hover:bg-[#11211C] hover:text-white dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp
                      className={`w-4 h-4 ${
                        isAnalytics
                          ? "text-emerald-300 dark:text-[#78B99D]"
                          : "text-emerald-200/60 dark:text-[#9BAAA1]"
                      }`}
                    />
                    <span>Reports &amp; Funnel</span>
                  </div>
                </Link>
              )}

              {/* Creators Directory: Opens interactive Creator Roster Modal */}
              <button
                type="button"
                onClick={handleOpenCreators}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#C5DCD6] dark:text-[#9BAAA1] hover:bg-[#16443D] dark:hover:bg-[#11211C] hover:text-white dark:hover:text-white transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-emerald-200/60 dark:text-[#9BAAA1]" />
                  <span>Creators Directory</span>
                </div>
                {creatorRoster.length > 0 && (
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-md bg-[#0D2B26] dark:bg-[#060D0B] border border-emerald-500/40 dark:border-[#20362E] text-emerald-200 dark:text-[#78B99D]">
                    {creatorRoster.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Dynamic Campaign Sectors & Channels */}
          <div className="space-y-1">
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-emerald-200/60 dark:text-[#9BAAA1]">
              Attribution Channels
            </span>

            <div className="space-y-0.5 pt-1">
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-[#C5DCD6] dark:text-[#9BAAA1] hover:bg-[#16443D]/70 dark:hover:bg-[#11211C]/70 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-[#78B99D]" />
                  <span>In-Store POS (Maps)</span>
                </div>
                <span className="text-[11px] text-emerald-200/70 dark:text-[#9BAAA1] font-mono font-bold">
                  {mapPercent}%
                </span>
              </div>

              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-[#C5DCD6] dark:text-[#9BAAA1] hover:bg-[#16443D]/70 dark:hover:bg-[#11211C]/70 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#229ED9]" />
                  <span>Telegram Bots</span>
                </div>
                <span className="text-[11px] text-emerald-200/70 dark:text-[#9BAAA1] font-mono font-bold">
                  {tgPercent}%
                </span>
              </div>

              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-[#C5DCD6] dark:text-[#9BAAA1] hover:bg-[#16443D]/70 dark:hover:bg-[#11211C]/70 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 dark:bg-[#F0B85C]" />
                  <span>Direct Phone Orders</span>
                </div>
                <span className="text-[11px] text-emerald-200/70 dark:text-[#9BAAA1] font-mono font-bold">
                  {callPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Support & Audit */}
          <div className="space-y-1">
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-emerald-200/60 dark:text-[#9BAAA1]">
              Governance &amp; Support
            </span>

            <nav className="space-y-1 pt-1">
              {onOpenReportModal && (
                <button
                  type="button"
                  onClick={onOpenReportModal}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#C5DCD6] dark:text-[#9BAAA1] hover:bg-[#16443D] dark:hover:bg-[#11211C] hover:text-white dark:hover:text-white transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <LifeBuoy className="w-4 h-4 text-amber-400 dark:text-[#F0B85C]" />
                    <span>Report Issue</span>
                  </div>
                </button>
              )}

              {onTabChange ? (
                <button
                  type="button"
                  onClick={() => handleNavClick("privacy")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    isPrivacy
                      ? "bg-[#1C554C] dark:bg-[#152B24] text-white shadow-xs"
                      : "text-[#C5DCD6] dark:text-[#9BAAA1] hover:bg-[#16443D] dark:hover:bg-[#11211C] hover:text-white dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className={`w-4 h-4 ${isPrivacy ? "text-emerald-300 dark:text-[#78B99D]" : "text-emerald-200/60 dark:text-[#9BAAA1]"}`} />
                    <span>Privacy &amp; Data Audit</span>
                  </div>
                  {isPrivacy && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-[#78B99D]" />
                  )}
                </button>
              ) : (
                <Link
                  href="/privacy"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#C5DCD6] dark:text-[#9BAAA1] hover:bg-[#16443D] dark:hover:bg-[#11211C] hover:text-white dark:hover:text-white transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-emerald-200/60 dark:text-[#9BAAA1]" />
                    <span>Privacy &amp; Data Audit</span>
                  </div>
                </Link>
              )}
            </nav>
          </div>
        </div>

        {/* Bottom: Payment Gateway Status, Merchant Switcher & Profile */}
        <div className="p-3 border-t border-[#1B4B42] dark:border-[#1E332B] bg-[#0B2520] dark:bg-[#050A08] space-y-2.5 transition-colors">
          {/* Interactive Merchant Account Switcher Card */}
          <button
            type="button"
            onClick={() => setIsMerchantModalOpen(true)}
            className="w-full bg-[#16443D] dark:bg-[#11211C] rounded-xl p-2.5 flex items-center justify-between border border-[#225C52] dark:border-[#20362E] transition-all hover:bg-[#1C554C] dark:hover:bg-[#18332A] cursor-pointer shadow-2xs h-12 text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 dark:text-[#F0B85C] flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {brandName}
                </p>
                <p className="text-[11px] text-emerald-200/70 dark:text-[#9BAAA1] truncate mt-0.5">
                  {staffCount > 0 ? `${staffCount} Staff` : "Merchant"} • Bole Flagship
                </p>
              </div>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-emerald-200/60 dark:text-[#9BAAA1] shrink-0" />
          </button>

          {/* Interactive Telebirr & CBE Birr Live Integration Card */}
          <button
            type="button"
            onClick={() => setIsGatewayModalOpen(true)}
            className="w-full bg-[#16443D] dark:bg-[#11211C] rounded-xl p-2.5 flex items-center justify-between border border-[#225C52] dark:border-[#20362E] transition-all hover:bg-[#1C554C] dark:hover:bg-[#18332A] cursor-pointer shadow-2xs h-12 text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 dark:text-[#83D1A5] flex items-center justify-center shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-[#83D1A5] animate-pulse" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  Telebirr &amp; CBE Birr
                </p>
                <p className="text-[11px] text-emerald-200/70 dark:text-[#9BAAA1] truncate mt-0.5">
                  Gateway Sync v2.4
                </p>
              </div>
            </div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-300 dark:text-[#83D1A5] bg-emerald-900/80 dark:bg-[#193629] px-2 py-0.5 rounded-md border border-emerald-500/40 dark:border-[#28493D] shrink-0">
              Active
            </span>
          </button>

          {/* User Profile & Theme Toggle Row */}
          <div className="flex items-center justify-between px-1 h-10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-emerald-600 dark:bg-[#78B99D] text-white dark:text-[#0D2119] font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {brandName.charAt(0)}
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-xs text-white block truncate leading-tight">
                  {ownerName}
                </span>
                <span className="text-[11px] text-emerald-200/60 dark:text-[#9BAAA1] block truncate mt-0.5">
                  {role === "OWNER" ? "Brand Merchant" : role}
                </span>
              </div>
            </div>

            <ThemeToggle
              size="sm"
              className="!bg-[#16443D] dark:!bg-[#11211C] !border-[#225C52] dark:!border-[#20362E] !text-emerald-100 dark:!text-[#9BAAA1] hover:!bg-[#1C554C] dark:hover:!bg-[#18332A] rounded-lg"
            />
          </div>

          {/* Sign Out Action Button */}
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full h-9 flex items-center justify-center gap-2 px-3 rounded-xl text-xs font-semibold text-[#C5DCD6] dark:text-[#9BAAA1] bg-[#16443D]/70 dark:bg-transparent hover:text-rose-300 hover:bg-rose-950/40 border border-[#225C52] dark:border-[#20362E] shadow-2xs transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* 1. Interactive Merchant Business Profile Modal */}
      {isMerchantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#14211D] border border-slate-200 dark:border-[#26372F] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-[#26372F] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-[#F0B85C] flex items-center justify-center font-bold">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-slate-900 dark:text-[#F1F5F1]">
                    Merchant Business Profile
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#9BAAA1]">
                    Verified store context &amp; branch details
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMerchantModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-[#F7F8F5] dark:bg-[#101C18] p-3.5 rounded-xl border border-slate-200/60 dark:border-[#26372F] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-[#9BAAA1]">Business Name</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-[#F1F5F1]">{brandName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-[#9BAAA1]">Registered Owner</span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-[#F1F5F1]">{ownerName}</span>
                </div>
                {brandPhone && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-[#9BAAA1]">Business Phone</span>
                    <span className="text-xs font-mono font-medium text-slate-700 dark:text-[#C0CCC4]">{brandPhone}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-[#9BAAA1]">Account Role</span>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-[#83D1A5] bg-emerald-100 dark:bg-[#193629] px-2 py-0.5 rounded-md">
                    {role}
                  </span>
                </div>
              </div>

              {/* Operating Branches */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#9BAAA1] block mb-2">
                  Operating POS Locations
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-[#1A2A24] border border-slate-200/50 dark:border-[#2B4036] text-xs">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-[#78B99D]" />
                      <span className="font-semibold text-slate-800 dark:text-[#F1F5F1]">Bole Flagship (Medhanialem)</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 dark:text-[#83D1A5] font-semibold bg-emerald-50 dark:bg-[#193629] px-2 py-0.5 rounded-md">
                      Primary Hub
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-[#1A2A24] border border-slate-200/50 dark:border-[#2B4036] text-xs">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-amber-500 dark:text-[#F0B85C]" />
                      <span className="font-semibold text-slate-800 dark:text-[#F1F5F1]">Piassa Roastery &amp; Cafe</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-[#9BAAA1]">Secondary Branch</span>
                  </div>
                </div>
              </div>

              {/* Team Staff Accounts */}
              {staffList.length > 0 && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#9BAAA1] block mb-2">
                    Authorized Cashiers ({staffList.length})
                  </span>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {staffList.map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#1A2A24] text-xs"
                      >
                        <span className="font-medium text-slate-700 dark:text-[#C0CCC4]">{staff.name}</span>
                        <span className="text-[11px] font-mono text-slate-400 dark:text-[#9BAAA1]">{staff.phone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#101C18] border-t border-slate-100 dark:border-[#26372F] flex items-center justify-between gap-3">
              {onTabChange ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMerchantModalOpen(false);
                    handleNavClick("sales");
                  }}
                  className="text-xs font-semibold text-emerald-700 dark:text-[#78B99D] hover:underline cursor-pointer"
                >
                  Go to POS Terminal →
                </button>
              ) : (
                <Link
                  href="/brand/sales"
                  onClick={() => setIsMerchantModalOpen(false)}
                  className="text-xs font-semibold text-emerald-700 dark:text-[#78B99D] hover:underline"
                >
                  Go to POS Terminal →
                </Link>
              )}
              <button
                type="button"
                onClick={() => setIsMerchantModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-[#20372E] dark:hover:bg-[#28493D] text-slate-800 dark:text-[#F1F5F1] text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Interactive Telebirr & CBE Birr Payment Rails Diagnostics Modal */}
      {isGatewayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#14211D] border border-slate-200 dark:border-[#26372F] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-[#26372F] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#83D1A5] flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-slate-900 dark:text-[#F1F5F1]">
                    Payment Gateway &amp; Rails
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#9BAAA1]">
                    EthioLink POS Gateway v2.4 Status
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGatewayModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F8F5] dark:bg-[#101C18] border border-slate-200/60 dark:border-[#26372F]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-[#F1F5F1] block">
                        Telebirr SuperApp QR
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-[#9BAAA1]">
                        Instant webhook &amp; receipt verification
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-[#83D1A5] bg-emerald-100 dark:bg-[#193629] px-2 py-0.5 rounded-md">
                    OPERATIONAL
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F8F5] dark:bg-[#101C18] border border-slate-200/60 dark:border-[#26372F]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-[#F1F5F1] block">
                        CBE Birr USSD &amp; Mobile
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-[#9BAAA1]">
                        Direct transaction reference matching
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-[#83D1A5] bg-emerald-100 dark:bg-[#193629] px-2 py-0.5 rounded-md">
                    LIVE INGEST
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F8F5] dark:bg-[#101C18] border border-slate-200/60 dark:border-[#26372F]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-[#F1F5F1] block">
                        Deduplication Sliding Window
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-[#9BAAA1]">
                        15-minute sliding window active
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-[#83D1A5] bg-emerald-100 dark:bg-[#193629] px-2 py-0.5 rounded-md">
                    15 MIN
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F8F5] dark:bg-[#101C18] border border-slate-200/60 dark:border-[#26372F]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-[#F1F5F1] block">
                        Float-Drift Protection
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-[#9BAAA1]">
                        RFC 4180 integer cents storage
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-[#83D1A5] bg-emerald-100 dark:bg-[#193629] px-2 py-0.5 rounded-md">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#101C18] border-t border-slate-100 dark:border-[#26372F] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  toast.success("Health check passed: All payment gateways operational (< 120ms latency)");
                }}
                className="text-xs font-semibold text-emerald-700 dark:text-[#78B99D] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Run Diagnostics Ping</span>
              </button>
              <button
                type="button"
                onClick={() => setIsGatewayModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-[#20372E] dark:hover:bg-[#28493D] text-slate-800 dark:text-[#F1F5F1] text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Interactive Brand Creators Roster Modal */}
      {isLocalCreatorsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#14211D] border border-slate-200 dark:border-[#26372F] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-[#26372F] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#83D1A5] flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-slate-900 dark:text-[#F1F5F1]">
                    Brand Creators Directory
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#9BAAA1]">
                    Assigned influencer roster &amp; Telegram attributions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLocalCreatorsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
              {creatorRoster.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <Users className="w-8 h-8 text-slate-300 dark:text-[#9BAAA1] mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-[#F1F5F1]">
                    No creators assigned yet
                  </p>
                  <p className="text-xs text-slate-500 dark:text-[#9BAAA1] max-w-xs mx-auto">
                    Invite creators to your campaigns from the campaign actions bar using signed magic links.
                  </p>
                </div>
              ) : (
                creatorRoster.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-[#F7F8F5] dark:bg-[#101C18] border border-slate-200/60 dark:border-[#26372F] flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 dark:bg-[#78B99D] text-white dark:text-[#0D2119] font-bold text-xs flex items-center justify-center shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-900 dark:text-[#F1F5F1] leading-tight">
                          {c.name}
                        </p>
                        {c.telegramUsername && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#229ED9] font-medium mt-0.5">
                            <Send className="w-2.5 h-2.5" />
                            @{c.telegramUsername}
                          </span>
                        )}
                        <p className="text-[11px] text-slate-400 dark:text-[#9BAAA1] font-mono mt-0.5">
                          {c.phone}
                        </p>

                        {c.campaignNames.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap mt-2">
                            {c.campaignNames.map((campName, i) => (
                              <span
                                key={i}
                                className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-[#1A2A24] border border-slate-200/60 dark:border-[#2B4036] text-slate-700 dark:text-[#C0CCC4]"
                              >
                                {campName}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyText(`Creator: ${c.name} (${c.telegramUsername ? `@${c.telegramUsername}` : c.phone})`, c.id)}
                      className="p-1.5 rounded-lg bg-white dark:bg-[#1A2A24] border border-slate-200/80 dark:border-[#2B4036] text-slate-600 dark:text-[#C0CCC4] hover:text-emerald-600 dark:hover:text-[#78B99D] transition-colors cursor-pointer"
                      title="Copy creator details"
                    >
                      {copiedCreatorId === c.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#101C18] border-t border-slate-100 dark:border-[#26372F] flex items-center justify-between">
              <Link
                href="/brand/campaigns/new"
                onClick={() => setIsLocalCreatorsModalOpen(false)}
                className="text-xs font-semibold text-emerald-700 dark:text-[#78B99D] hover:underline flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Launch Campaign with Creator Splits</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsLocalCreatorsModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-[#20372E] dark:hover:bg-[#28493D] text-slate-800 dark:text-[#F1F5F1] text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

BrandSidebar.displayName = "BrandSidebar";
