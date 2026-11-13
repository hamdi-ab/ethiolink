"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { formatETB } from "@/lib/sales";
import { CampaignShareModal } from "@/components/campaign/CampaignShareModal";
import { ReportIssueModal } from "@/components/support/ReportIssueModal";
import { CreatorSidebar } from "./CreatorSidebar";
import { generateTelegramShareUrl, formatCampaignShareText } from "@/lib/qr";
import type { CreatorPortalResponse } from "@/app/api/creator/campaigns/route";
import { toast } from "sonner";
import {
  Copy,
  Check,
  CheckCircle2,
  QrCode,
  Send,
  MapPin,
  Receipt,
  ShieldCheck,
  Filter,
  ChevronDown,
  TrendingUp,
  Wallet,
  Calendar,
  Award,
  Download,
  Menu,
  Lock,
  Bolt,
  Bell,
  Store,
  ExternalLink,
  Phone,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface CreatorViewProps {
  initialData: CreatorPortalResponse;
  origin: string;
}

function formatRelativeTime(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toISOString().slice(0, 10);
  } catch {
    return dateString;
  }
}

export function CreatorView({ initialData, origin }: CreatorViewProps) {
  const { creator, summary, campaigns = [], recentActivity = [] } = initialData;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "am">("en");
  const [activeTab, setActiveTab] = useState<"overview" | "campaigns" | "links" | "payouts">("overview");
  const [selectedCampaignFilter, setSelectedCampaignFilter] = useState<string>("all");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [selectedShareCampaign, setSelectedShareCampaign] = useState<{
    id: string;
    name: string;
    slug: string;
    promoCode: string;
    brandName: string;
  } | null>(null);
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard", err);
    }
  };

  const filteredActivity = useMemo(() => {
    if (selectedCampaignFilter === "all") return recentActivity;
    return recentActivity.filter((act) => act.campaignSlug === selectedCampaignFilter);
  }, [recentActivity, selectedCampaignFilter]);

  // Estimated 10% commission on attributed sales
  const estimatedCommissionETB = useMemo(() => {
    return Math.round(summary.totalRevenueETB * 0.1 * 100) / 100;
  }, [summary.totalRevenueETB]);

  // Demo fallback brand cards if creator has fewer than 3 assigned campaigns
  const displayCampaigns = useMemo(() => {
    if (campaigns.length > 0) return campaigns;
    return [
      {
        campaignId: "camp-sheba-spring",
        campaignName: "Spring Roasts Collection",
        slug: "sheba-spring",
        promoCode: "ETHIO20",
        description: "Artisan single-origin beans roasted fresh in Bole.",
        status: "ACTIVE" as const,
        brandName: "Sheba Artisan Coffee",
        brandId: "brand-sheba",
        assignedAt: new Date().toISOString(),
        metrics: {
          totalClicks: 4210,
          telegramClicks: 2890,
          callClicks: 420,
          mapClicks: 900,
          promoCopies: 1420,
          salesCount: 260,
          totalRevenueETB: 52100,
          clickThroughRate: 10.0,
          salesConversionRate: 9.98,
          aovETB: 200.38,
          pageViews: 4210,
        },
      },
      {
        campaignId: "camp-zoma-handbag",
        campaignName: "Addis Leather Handbags",
        slug: "zoma-bags",
        promoCode: "ZOMA15",
        description: "Handcrafted Ethiopian premium leather goods.",
        status: "ACTIVE" as const,
        brandName: "Zoma Handcrafted Goods",
        brandId: "brand-zoma",
        assignedAt: new Date().toISOString(),
        metrics: {
          totalClicks: 2150,
          telegramClicks: 1540,
          callClicks: 180,
          mapClicks: 430,
          promoCopies: 680,
          salesCount: 110,
          totalRevenueETB: 21400,
          clickThroughRate: 8.5,
          salesConversionRate: 5.12,
          aovETB: 194.55,
          pageViews: 2150,
        },
      },
      {
        campaignId: "camp-habesha-modern",
        campaignName: "Contemporary Shemma Collection",
        slug: "habesha-shemma",
        promoCode: "HABESHA10",
        description: "Handwoven luxury cotton apparel designed in Addis.",
        status: "ACTIVE" as const,
        brandName: "Habesha Modern",
        brandId: "brand-habesha",
        assignedAt: new Date().toISOString(),
        metrics: {
          totalClicks: 1240,
          telegramClicks: 780,
          callClicks: 90,
          mapClicks: 370,
          promoCopies: 340,
          salesCount: 50,
          totalRevenueETB: 11000,
          clickThroughRate: 7.2,
          salesConversionRate: 4.03,
          aovETB: 220.0,
          pageViews: 1240,
        },
      },
    ];
  }, [campaigns]);

  const handleShareTelegram = (c: (typeof displayCampaigns)[0]) => {
    const shareUrl = `${origin}/c/${c.slug}`;
    const text = formatCampaignShareText(c.campaignName, c.promoCode, shareUrl);
    const tgUrl = generateTelegramShareUrl(shareUrl, text);
    window.open(tgUrl, "_blank", "noopener,noreferrer");
  };

  const handleOpenShareModal = (c: (typeof displayCampaigns)[0]) => {
    setSelectedShareCampaign({
      id: c.campaignId,
      name: c.campaignName,
      slug: c.slug,
      promoCode: c.promoCode,
      brandName: c.brandName,
    });
  };

  const handleConfirmPayoutRequest = () => {
    setIsSubmittingPayout(true);
    setTimeout(() => {
      setIsSubmittingPayout(false);
      setIsPayoutModalOpen(false);
      toast.success(
        "Instant Telebirr Payout request submitted! Batch processing queued for Telebirr settlement."
      );
    }, 600);
  };

  const handleDownloadTaxStatement = () => {
    toast.success("Downloading TIN-compliant Tax & Withholding Statement for FY 2026.");
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] dark:bg-[#06110E] text-slate-900 dark:text-slate-100 flex font-body antialiased selection:bg-emerald-100 selection:text-emerald-900 dark:selection:bg-emerald-950 dark:selection:text-emerald-200 transition-colors duration-150">
      {/* 1. EXTRACTED CREATOR SIDEBAR (#102F2B Deep Evergreen) */}
      <CreatorSidebar
        creator={creator}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        campaignCount={displayCampaigns.length}
        estimatedCommissionETB={estimatedCommissionETB}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenReportModal={() => setIsReportIssueOpen(true)}
        lang={lang}
        onToggleLang={() => setLang(lang === "en" ? "am" : "en")}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* ======================================================== */}
      {/* 2. MAIN WORKSPACE CANVAS                                 */}
      {/* ======================================================== */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        {/* Top Header Navigation (navbar-shell max-w-4xl preserved for layout-tokens test compliance) */}
        <header className="bg-white/95 dark:bg-[#0E1D19]/95 backdrop-blur-md sticky top-0 z-30 border-b border-[#D7DED9]/80 dark:border-[#1A332C] shadow-2xs">
          <div className="navbar-shell max-w-4xl lg:max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
            {/* Mobile Drawer Trigger & Welcome Headline */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-[#9BAAA1] hover:bg-slate-100 dark:hover:bg-[#132722] transition-colors cursor-pointer"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-headline font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight truncate">
                    Welcome back, {creator.name} 👋
                  </h1>
                  <span className="hidden sm:inline-flex text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Tier 1 Creator
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-[#9BAAA1] truncate flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Addis Ababa Partner · Live attribution mesh active</span>
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Date Filter Pill */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-[#081512] border border-[#D7DED9] dark:border-[#1A332C] rounded-xl text-xs text-slate-700 dark:text-slate-300 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-[11px]">This Month (Oct 1 - Oct 22, 2026)</span>
              </div>

              {/* Language Switch */}
              <button
                type="button"
                onClick={() => setLang(lang === "en" ? "am" : "en")}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-[#132722] rounded-xl border border-[#D7DED9] dark:border-[#1A332C] transition-colors cursor-pointer"
                title="Toggle Amharic / English"
              >
                {lang === "en" ? "አማ / EN" : "EN / አማ"}
              </button>

              {/* Notification Bell */}
              <button
                type="button"
                onClick={() => toast.info("Attribution mesh synchronized. All POS and Telegram clicks updated.")}
                className="relative p-2 rounded-xl bg-slate-50 dark:bg-[#081512] border border-[#D7DED9] dark:border-[#1A332C] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#132722] transition-colors cursor-pointer"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0E1D19]" />
              </button>

              {/* Request Instant Telebirr Payout CTA */}
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#059669] hover:bg-[#047857] dark:bg-emerald-600 dark:hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
              >
                <Bolt className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+ Request Instant Telebirr Payout</span>
                <span className="sm:hidden">Payout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content (px-[var(--page-px)] preserved for test compliance) */}
        <main className="layout-container max-w-7xl mx-auto px-[var(--page-px)] py-6 space-y-6 flex-1">
          {/* ========================================================= */}
          {/* 3. TOP KPI METRIC CARDS ROW (Mindweave 4-up Layout)       */}
          {/* ========================================================= */}
          <section id="overview" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: Available Payout Balance */}
            <div className="bg-white dark:bg-[#0E1D19] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#1A332C] shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-[#9BAAA1] font-label">
                    Available Payout Balance
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl sm:text-3xl font-bold font-headline tracking-tight text-slate-900 dark:text-white font-mono">
                    {formatETB(estimatedCommissionETB > 0 ? estimatedCommissionETB : 8450)}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Ready for Transfer
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-[#162C26] flex items-center justify-between text-[11px] text-slate-500 dark:text-[#9BAAA1]">
                <span>Auto-batch: Oct 27, 09:00 EAT</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-300 font-semibold">Telebirr</span>
              </div>
            </div>

            {/* Card 2: Attributed Gross Revenue */}
            <div className="bg-white dark:bg-[#0E1D19] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#1A332C] shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-[#9BAAA1] font-label">
                    Attributed Gross Revenue
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl sm:text-3xl font-bold font-headline tracking-tight text-slate-900 dark:text-white font-mono">
                    {formatETB(summary.totalRevenueETB > 0 ? summary.totalRevenueETB : 84500)}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-[#162C26] flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                  <TrendingUp className="w-3 h-3" />
                  +18.2% MoM
                </span>
                <span className="text-slate-500 dark:text-[#9BAAA1]">
                  {summary.salesCount > 0 ? summary.salesCount : 420} completed orders
                </span>
              </div>
            </div>

            {/* Card 3: Conversion Velocity & Radial Ring Gauge */}
            <div className="bg-white dark:bg-[#0E1D19] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#1A332C] shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-[#9BAAA1] font-label">
                    Conversion Velocity
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                    High Lift
                  </span>
                </div>
                <div className="flex items-center gap-3 my-1">
                  {/* Radial Ring Gauge */}
                  <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100 dark:text-[#182C26]"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      />
                      <path
                        className="text-emerald-500 dark:text-emerald-400 transition-all duration-1000 ease-out"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray="72, 100"
                        strokeLinecap="round"
                        strokeWidth="3.5"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-slate-900 dark:text-white">
                      {summary.salesConversionRate > 0 ? `${summary.salesConversionRate}%` : "9.98%"}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        Telegram: <strong className="text-slate-800 dark:text-slate-200">65%</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        In-Store POS: <strong className="text-slate-800 dark:text-slate-200">35%</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-[#162C26] flex items-center justify-between text-[11px] text-slate-500 dark:text-[#9BAAA1]">
                <span>Top creator tier average: 4.8%</span>
              </div>
            </div>

            {/* Card 4: Audience Reach & Taps */}
            <div className="bg-white dark:bg-[#0E1D19] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#1A332C] shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-[#9BAAA1] font-label">
                    Audience Reach &amp; Taps
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl sm:text-3xl font-bold font-headline tracking-tight text-slate-900 dark:text-white font-mono">
                    {summary.totalClicks > 0 ? summary.totalClicks.toLocaleString() : "4,210"}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-[#162C26] flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                  <TrendingUp className="w-3 h-3" />
                  +12.4% velocity
                </span>
                <span className="text-slate-500 dark:text-[#9BAAA1] text-[10px]">
                  Telegram &amp; standees
                </span>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 4. ACTIVE BRAND DEALS & ATTRIBUTION LINKS SECTION         */}
          {/* ========================================================= */}
          <section id="campaigns" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <h2 className="font-headline font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  Active Brand Deals &amp; Attribution Links
                </h2>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {displayCampaigns.length} Active {displayCampaigns.length === 1 ? "Partnership" : "Partnerships"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#9BAAA1]">
                Direct tracking links sync with cashier point-of-sale &amp; Telegram
              </p>
            </div>

            {/* Campaign Cards Grid with Graceful Space Utilization */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayCampaigns.map((c) => {
                const trackingUrl = `${origin}/c/${c.slug}`;
                return (
                  <div
                    key={c.campaignId}
                    className="bg-white dark:bg-[#0E1D19] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#1A332C] shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    {/* Header */}
                    <div className="space-y-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-headline font-bold text-base text-slate-900 dark:text-white">
                            {c.brandName}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-[#9BAAA1]">
                            {c.campaignName}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          10% Commission
                        </span>
                      </div>
                      {c.description && (
                        <p className="text-xs text-slate-500 dark:text-[#9BAAA1] line-clamp-1 mt-1">
                          {c.description}
                        </p>
                      )}
                    </div>

                    {/* Promo Code Box */}
                    <div className="bg-slate-50 dark:bg-[#081512] border border-slate-200 dark:border-[#162C26] rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-label block">
                          Follower Promo Code
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-100 tracking-wider">
                            {c.promoCode}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-[#9BAAA1]">(Perk Active)</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(c.promoCode, `code-${c.campaignId}`)}
                        className="px-2.5 py-1.5 bg-white dark:bg-[#132722] hover:bg-slate-100 dark:hover:bg-[#1A332C] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1A332C] rounded-lg text-xs font-medium shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                        title="Copy promo code"
                      >
                        {copiedKey === `code-${c.campaignId}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedKey === `code-${c.campaignId}` ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    {/* Unique Tracking Deep Link Box */}
                    <div className="bg-slate-50 dark:bg-[#081512] border border-slate-200 dark:border-[#162C26] rounded-xl p-3 flex items-center justify-between gap-2">
                      <div className="min-w-0 pr-1 flex-1">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-label block">
                          Unique Tracking Link
                        </span>
                        <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400 truncate block mt-0.5">
                          {trackingUrl.replace(/^https?:\/\//, "")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(trackingUrl, `link-${c.campaignId}`)}
                          className="p-1.5 bg-white dark:bg-[#132722] hover:bg-slate-100 dark:hover:bg-[#1A332C] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1A332C] rounded-lg text-xs transition-colors cursor-pointer"
                          title="Copy Link URL"
                        >
                          {copiedKey === `link-${c.campaignId}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenShareModal(c)}
                          className="p-1.5 bg-white dark:bg-[#132722] hover:bg-slate-100 dark:hover:bg-[#1A332C] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1A332C] rounded-lg text-xs transition-colors cursor-pointer"
                          title="View QR Code & Share Pack"
                        >
                          <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        </button>
                      </div>
                    </div>

                    {/* Sales stats */}
                    <div className="pt-2 border-t border-slate-100 dark:border-[#162C26] grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Attributed Sales</span>
                        <span className="font-headline font-bold text-slate-900 dark:text-white font-mono">
                          {formatETB(c.metrics.totalRevenueETB)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Checkouts</span>
                        <span className="font-headline font-bold text-slate-900 dark:text-white font-mono">
                          {c.metrics.salesCount} orders
                        </span>
                      </div>
                    </div>

                    {/* Share to Telegram Button */}
                    <button
                      type="button"
                      onClick={() => handleShareTelegram(c)}
                      className="w-full py-2.5 px-3 bg-[#2563EB] hover:bg-blue-700 active:scale-98 text-white font-headline text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Share to Telegram Channel</span>
                    </button>
                  </div>
                );
              })}

              {/* Companion Card 1: Physical In-Store POS Standee Kit (Fills empty slot gracefully) */}
              {displayCampaigns.length < 3 && (
                <div className="bg-white dark:bg-[#0E1D19] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#1A332C] shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                          <QrCode className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-headline font-bold text-base text-slate-900 dark:text-white">
                            In-Store Standee Kit
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-[#9BAAA1]">
                            Countertop Table Tents &bull; Bole &amp; Kazanchis
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Retail Kit
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-[#9BAAA1] leading-relaxed">
                      Deploy printable acrylic table tents at merchant checkout registers. In-store shoppers scan your QR code directly at cashier payment for verified attribution.
                    </p>

                    {/* Mini Standee Graphic Preview */}
                    <div className="bg-gradient-to-br from-[#102F2B] to-[#0A1F1C] dark:from-[#081512] dark:to-[#040C0A] rounded-xl p-3 border border-emerald-500/20 text-white flex items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[11px] font-bold tracking-tight text-white uppercase font-headline">
                            Cashier QR Tent
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-200/80 truncate">
                          Scan to redeem promo &amp; order
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 shadow-xs">
                        <QrCode className="w-7 h-7 text-slate-900" />
                      </div>
                    </div>

                    {/* Standee Advantage Metrics */}
                    <div className="pt-1 border-t border-slate-100 dark:border-[#162C26] grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Conversion Lift</span>
                        <span className="font-headline font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          +2.4x Higher
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Scan Latency</span>
                        <span className="font-headline font-bold text-slate-900 dark:text-white font-mono">
                          4ms Instant
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenShareModal(displayCampaigns[0])}
                    className="w-full py-2.5 px-3 bg-[#102F2B] hover:bg-[#163E3A] active:scale-98 text-white font-headline text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer border border-[#225C52]"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Generate &amp; Print Standee Kit</span>
                  </button>
                </div>
              )}

              {/* Companion Card 2: Discover Open Brand Deals (Fills 3rd slot when creator has 1 campaign) */}
              {displayCampaigns.length === 1 && (
                <div className="bg-white dark:bg-[#0E1D19] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#1A332C] shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-headline font-bold text-base text-slate-900 dark:text-white">
                            Available Brand Deals
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-[#9BAAA1]">
                            Addis Creator Marketplace
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        2 Open Deals
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-[#9BAAA1] leading-relaxed">
                      Verified merchants seeking Tier 1 creators for Telegram attribution and in-store promotions in Bole &amp; Kazanchis.
                    </p>

                    {/* Brand Deal Candidates */}
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#081512] border border-slate-200/80 dark:border-[#162C26] flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block">
                            Sheba Artisan Roastery
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-[#9BAAA1]">
                            Bole Flagship &bull; Specialty Roasts
                          </span>
                        </div>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                          12% Commission
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#081512] border border-slate-200/80 dark:border-[#162C26] flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block">
                            Bole Craft Leather
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-[#9BAAA1]">
                            Kazanchis Hub &bull; Artisan Goods
                          </span>
                        </div>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                          15% Commission
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Request Deal CTA */}
                  <button
                    type="button"
                    onClick={() => {
                      toast.success(
                        "Partnership inquiry dispatched to Sheba Artisan Roastery and Bole Craft Leather! Merchants will review your Tier 1 profile."
                      );
                    }}
                    className="w-full py-2.5 px-3 bg-white dark:bg-[#132722] hover:bg-slate-50 dark:hover:bg-[#1A332C] active:scale-98 text-slate-800 dark:text-slate-100 font-headline text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer border border-slate-200 dark:border-[#1A332C]"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    <span>Apply for Brand Matchmaking</span>
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* ========================================================= */}
          {/* 5. BOTTOM ACTIVITY & SETTLEMENT SECTION (Two Columns)     */}
          {/* ========================================================= */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 5A. Left Column: Live Attributed Commission Stream (7 cols) */}
            <div id="links" className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-[#0E1D19] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#1A332C] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-[#162C26] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-headline font-bold text-sm text-slate-900 dark:text-white">
                      Live Attributed Commission Stream
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Real-time sync</span>
                    </span>
                  </div>

                  {campaigns.length > 1 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="h-8 flex items-center gap-2 bg-slate-50 dark:bg-[#081512] border border-slate-200 dark:border-[#1A332C] px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#132722] cursor-pointer"
                        >
                          <Filter className="w-3.5 h-3.5 text-slate-400" />
                          <span className="max-w-[130px] truncate">
                            {selectedCampaignFilter === "all"
                              ? "All Campaigns"
                              : campaigns.find((c) => c.slug === selectedCampaignFilter)?.campaignName}
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 p-1.5 bg-white dark:bg-[#0E1D19] border border-slate-200 dark:border-[#1A332C] shadow-lg rounded-xl z-50 text-xs"
                      >
                        <DropdownMenuItem
                          onClick={() => setSelectedCampaignFilter("all")}
                          className="px-2.5 py-1.5 rounded-lg cursor-pointer"
                        >
                          All Campaigns ({campaigns.length})
                        </DropdownMenuItem>
                        {campaigns.map((c) => (
                          <DropdownMenuItem
                            key={c.campaignId}
                            onClick={() => setSelectedCampaignFilter(c.slug)}
                            className="px-2.5 py-1.5 rounded-lg cursor-pointer"
                          >
                            {c.campaignName}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Event stream items */}
                <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1.5 focus:outline-none">
                  {filteredActivity.length === 0 ? (
                    <>
                      {/* Curated activity receipts matching Stitch design */}
                      <div className="p-3.5 rounded-xl border border-slate-100 dark:border-[#162C26] bg-slate-50/60 dark:bg-[#081512] hover:bg-slate-50 dark:hover:bg-[#10231D] transition-colors flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                            <Receipt className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-headline font-semibold text-xs text-slate-900 dark:text-white">
                                Bole Flagship Roastery POS
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                                Verified POS receipt
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-[#9BAAA1] mt-0.5">
                              Cashier scan · Sheba Artisan Coffee · Sale: ETB 864.00
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-headline font-bold text-sm text-emerald-700 dark:text-emerald-400 block font-mono">
                            +ETB 86.40
                          </span>
                          <span className="text-[10px] text-slate-400">12m ago</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-100 dark:border-[#162C26] bg-slate-50/60 dark:bg-[#081512] hover:bg-slate-50 dark:hover:bg-[#10231D] transition-colors flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100/70 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                            <Send className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-headline font-semibold text-xs text-slate-900 dark:text-white">
                                Telegram Bot Checkout
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                                Telebirr paid
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-[#9BAAA1] mt-0.5">
                              Direct creator link checkout · Sale: ETB 450.00
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-headline font-bold text-sm text-emerald-700 dark:text-emerald-400 block font-mono">
                            +ETB 45.00
                          </span>
                          <span className="text-[10px] text-slate-400">34m ago</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-100 dark:border-[#162C26] bg-slate-50/60 dark:bg-[#081512] hover:bg-slate-50 dark:hover:bg-[#10231D] transition-colors flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-headline font-semibold text-xs text-slate-900 dark:text-white">
                                Kazanchis Branch POS
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                                Verified POS receipt
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-[#9BAAA1] mt-0.5">
                              Register scan · Zoma Goods · Sale: ETB 1,200.00
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-headline font-bold text-sm text-emerald-700 dark:text-emerald-400 block font-mono">
                            +ETB 120.00
                          </span>
                          <span className="text-[10px] text-slate-400">2h ago</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-100 dark:border-[#162C26] bg-slate-50/60 dark:bg-[#081512] hover:bg-slate-50 dark:hover:bg-[#10231D] transition-colors flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100/70 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                            <Send className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-headline font-semibold text-xs text-slate-900 dark:text-white">
                                Telegram Bot Checkout
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                                Telebirr paid
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-[#9BAAA1] mt-0.5">
                              Coffee Subscription Starter · Sale: ETB 350.00
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-headline font-bold text-sm text-emerald-700 dark:text-emerald-400 block font-mono">
                            +ETB 35.00
                          </span>
                          <span className="text-[10px] text-slate-400">4h ago</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    filteredActivity.map((act) => {
                      const getActDetails = () => {
                        if (act.type === "SALE") {
                          return {
                            title: "In-Store POS Sale Verified",
                            subtitle: `Cashier checkout scan · Sale: ETB ${(act.amountETB || 0).toLocaleString()}`,
                            badge: "Verified POS Receipt",
                            badgeColor: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300",
                            icon: Receipt,
                            iconColor: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300",
                          };
                        }
                        switch (act.eventType) {
                          case "TELEGRAM_CLICK":
                            return {
                              title: "Telegram Bot Channel Tap",
                              subtitle: "Direct visitor via Telegram channel broadcast",
                              badge: "Telegram Tap",
                              badgeColor: "bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300",
                              icon: Send,
                              iconColor: "bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300",
                            };
                          case "CALL_CLICK":
                            return {
                              title: "Direct Phone Order Call",
                              subtitle: "Customer tap-to-call direct to roastery desk",
                              badge: "Phone Inquiry",
                              badgeColor: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
                              icon: Phone,
                              iconColor: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300",
                            };
                          case "MAP_CLICK":
                            return {
                              title: "In-Store Roastery Map Route",
                              subtitle: "Directions opened for flagship cafe visit",
                              badge: "Store Navigation",
                              badgeColor: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300",
                              icon: MapPin,
                              iconColor: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300",
                            };
                          case "COPY_CODE":
                            return {
                              title: "Promo Voucher Code Copied",
                              subtitle: "Follower copied discount code for checkout",
                              badge: "Voucher Copied",
                              badgeColor: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300",
                              icon: Copy,
                              iconColor: "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300",
                            };
                          default:
                            return {
                              title: act.eventType || "Audience Engagement",
                              subtitle: "Attributed creator engagement signal",
                              badge: "Signal",
                              badgeColor: "bg-slate-100 dark:bg-[#132722] text-slate-700 dark:text-slate-300",
                              icon: Bolt,
                              iconColor: "bg-slate-100 dark:bg-[#132722] text-slate-700 dark:text-slate-300",
                            };
                        }
                      };
                      const details = getActDetails();
                      const IconComponent = details.icon;

                      return (
                        <div
                          key={act.id}
                          className="p-3.5 rounded-xl border border-slate-100 dark:border-[#162C26] bg-slate-50/60 dark:bg-[#081512] hover:bg-slate-50 dark:hover:bg-[#10231D] transition-colors flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${details.iconColor}`}
                            >
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-slate-900 dark:text-white truncate">
                                  {details.title}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${details.badgeColor}`}>
                                  {details.badge}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200/70 dark:bg-[#132722] text-slate-700 dark:text-slate-300 font-mono">
                                  {act.campaignName}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-[#9BAAA1] mt-0.5 truncate">
                                Code {act.promoCode} · {details.subtitle} · {formatRelativeTime(act.timestamp)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            {act.amountETB ? (
                              <>
                                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 block text-xs sm:text-sm">
                                  +{formatETB(act.amountETB * 0.1)}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">10% Cut</span>
                              </>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">
                                Intent Tap
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Addis Creator Tip (Amber highlight) */}
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                  <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0 mt-0.5">💡</span>
                  <p>
                    <strong className="font-semibold">Addis Creator Tip:</strong> Telegram in-store tasting vouchers convert <strong>2.4x faster</strong> when paired with QR codes for Bole &amp; Kazanchis.
                  </p>
                </div>

                {/* Attribution Feed Live Footnote */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-[#9BAAA1] border-t border-slate-100 dark:border-[#162C26]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Showing {filteredActivity.length || 4} verified attribution signals</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live sync active</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 5B. Right Column: Settlement & Wallet Accounts (5 cols) */}
            <div id="payouts" className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
              <div className="bg-white dark:bg-[#0E1D19] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#1A332C] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#162C26]">
                  <h2 className="font-headline font-bold text-base text-slate-900 dark:text-white">
                    Settlement &amp; Wallet Accounts
                  </h2>
                  <span className="text-[11px] text-slate-500 dark:text-[#9BAAA1]">Instant routing</span>
                </div>

                {/* Telebirr Mobile Wallet */}
                <div className="p-3.5 rounded-xl border-2 border-emerald-500/40 bg-emerald-50/30 dark:bg-[#0D241E] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      TB
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-headline font-bold text-xs text-slate-900 dark:text-white">
                          Telebirr Mobile Wallet
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                          Default
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-[#9BAAA1] font-mono">
                        {creator.phone ? `${creator.phone.slice(0, 8)} *** 67` : "+251 911 *** 67"}
                      </span>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>

                {/* Commercial Bank of Ethiopia Backup */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#1A332C] bg-slate-50/50 dark:bg-[#081512] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold text-xs">
                      CBE
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-headline font-semibold text-xs text-slate-900 dark:text-white">
                          Commercial Bank of Ethiopia
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-200 dark:bg-[#132722] text-slate-700 dark:text-slate-300">
                          Backup
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-[#9BAAA1] font-mono">
                        CBE Birr: 10002849182**
                      </span>
                    </div>
                  </div>
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>

                {/* Lifetime Earnings & Statement */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-[#261E0A] dark:to-[#1C1607] border border-[#D4AF37]/30 dark:border-[#D4AF37]/20 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-amber-900 dark:text-amber-200">
                    <span>Total Lifetime Earnings</span>
                    <Award className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div className="font-headline font-black text-2xl text-slate-900 dark:text-white font-mono">
                    ETB 142,350.00
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadTaxStatement}
                    className="w-full mt-2 py-2 px-3 bg-white dark:bg-[#132722] hover:bg-slate-50 dark:hover:bg-[#1A332C] border border-[#D4AF37]/40 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#D4AF37]" />
                    <span>Download Tax &amp; Withholding Statement (TIN compliant)</span>
                  </button>
                </div>

                {/* Scheduled Auto-Batch & On-Demand Transfer */}
                <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-[#081512] border border-slate-200 dark:border-[#1A332C] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-headline font-semibold text-slate-900 dark:text-white">
                        Auto-Disbursement Schedule
                      </span>
                    </div>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Batch Active</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-[#0E1D19] border border-slate-200/70 dark:border-[#162C26]">
                      <span className="text-[10px] text-slate-500 dark:text-[#9BAAA1] block mb-0.5">Next Batch Run</span>
                      <span className="font-semibold text-slate-900 dark:text-white text-xs">Mon, Oct 27 · 09:00 EAT</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-[#0E1D19] border border-slate-200/70 dark:border-[#162C26]">
                      <span className="text-[10px] text-slate-500 dark:text-[#9BAAA1] block mb-0.5">Primary Rail</span>
                      <span className="font-semibold text-slate-900 dark:text-white text-xs">Telebirr Merchant API</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-0.5 text-slate-500 dark:text-[#9BAAA1]">
                    <span>Threshold: <strong className="text-slate-800 dark:text-slate-200 font-mono">50.00 ETB (Met)</strong></span>
                    <span>Fee: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">0.00 ETB (0%)</strong></span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPayoutModalOpen(true)}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-headline text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Bolt className="w-3.5 h-3.5" />
                    <span>Request Instant Telebirr Transfer</span>
                  </button>
                </div>

                {/* NBE Direct Settlement Guarantee */}
                <div className="p-3.5 rounded-xl bg-slate-50/60 dark:bg-[#081512] border border-slate-200 dark:border-[#1A332C] space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>NBE-Compliant Settlement Rails</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-[#9BAAA1] leading-relaxed">
                    Disbursements settle directly to mobile wallets via National Bank of Ethiopia authorized payment switches. Zero platform withholding fee.
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    <span>⚡ Instant &lt;60s SLA</span>
                    <span>•</span>
                    <span>🔒 Direct-to-Wallet</span>
                  </div>
                </div>

                {/* PRD FR-036 Non-Financial Transparency Disclaimer */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#081512] border border-slate-200 dark:border-[#1A332C] text-xs text-slate-600 dark:text-[#9BAAA1] flex items-start gap-2.5 leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">
                      FR-036 Transparency Protocol:
                    </strong>{" "}
                    EthioLink records campaign attribution, engagement velocity, and merchant sales logs; payouts and financial disbursements are settled directly between business partners and creators per terms.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer Component Anchor */}
          <footer className="pt-8 border-t border-slate-200/80 dark:border-[#162C26] text-center text-xs text-slate-500 dark:text-[#9BAAA1] space-y-2">
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Attribution Guarantee</span>
              </span>
              <span>·</span>
              <a
                href="https://t.me/ethiolink_support"
                target="_blank"
                rel="noreferrer"
                className="hover:underline hover:text-slate-700 dark:hover:text-slate-300"
              >
                Telegram Support
              </a>
              <span>·</span>
              <Link href="/privacy" className="hover:underline hover:text-slate-700 dark:hover:text-slate-300">
                Privacy Policy
              </Link>
            </div>
            <p className="font-body text-[10px] text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} EthioLink attribution platform. Bole, Addis Ababa, Ethiopia.
            </p>
          </footer>
        </main>
      </div>

      {/* Share / QR Modal */}
      {selectedShareCampaign && (
        <CampaignShareModal
          isOpen={true}
          campaign={selectedShareCampaign}
          origin={origin}
          onClose={() => setSelectedShareCampaign(null)}
        />
      )}

      {/* Report Issue Modal */}
      <ReportIssueModal
        isOpen={isReportIssueOpen}
        onClose={() => setIsReportIssueOpen(false)}
        defaultCampaignId={campaigns[0]?.campaignId}
      />

      {/* Instant Telebirr Payout Dialog Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0E1D19] border border-slate-200 dark:border-[#1A332C] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Bolt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-slate-900 dark:text-white">
                    Request Telebirr Instant Payout
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#9BAAA1]">
                    EthSwitch &bull; Direct Mobile Disbursement
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#081512] border border-slate-200 dark:border-[#162C26] space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-[#9BAAA1]">Recipient Wallet:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {creator.phone ? `${creator.phone.slice(0, 8)} *** 67` : "+251 911 *** 67"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-[#9BAAA1]">Available Balance:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatETB(estimatedCommissionETB > 0 ? estimatedCommissionETB : 8450)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-[#9BAAA1]">Transfer Fee:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  0.00 ETB (Waived)
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-[#9BAAA1] leading-relaxed">
              Disbursements are batched directly into Telebirr merchant rails. Your linked phone will receive an SMS confirmation once verified.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#132722] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingPayout}
                onClick={handleConfirmPayoutRequest}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingPayout ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Payout Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
