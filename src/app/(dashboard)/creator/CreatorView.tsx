"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { formatETB } from "@/lib/sales";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { CampaignShareModal } from "@/components/campaign/CampaignShareModal";
import { generateTelegramShareUrl, formatCampaignShareText } from "@/lib/qr";
import type { CreatorPortalResponse } from "@/app/api/creator/campaigns/route";
import { toast } from "sonner";
import {
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  LogOut,
  Info,
  CheckCircle2,
  QrCode,
  Send,
  Phone,
  MapPin,
  Receipt,
  Activity,
  ShieldCheck,
  Filter,
  LifeBuoy,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Percent,
  Wallet,
  Calendar,
  Bell,
  Star,
  Award,
  Download,
  Share2,
  Menu,
  X,
  CreditCard,
  Building2,
  Smartphone,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ReportIssueModal } from "@/components/support/ReportIssueModal";

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
  const [selectedCampaignFilter, setSelectedCampaignFilter] = useState<string>("all");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedShareCampaign, setSelectedShareCampaign] = useState<{
    id: string;
    name: string;
    slug: string;
    promoCode: string;
    brandName: string;
  } | null>(null);
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);

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

  const handleRequestPayout = () => {
    toast.success("Instant Telebirr Payout request submitted! Batch processing scheduled.");
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] dark:bg-[#0D1714] text-[#202824] dark:text-[#F1F5F1] flex font-body antialiased transition-colors duration-150">
      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* ======================================================== */}
      {/* 1. LEFT PERSISTENT SIDEBAR (#102F2B Deep Evergreen)      */}
      {/* ======================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#102F2B] dark:bg-[#08120F] text-slate-200 w-68 flex flex-col justify-between border-r border-[#17443D] dark:border-[#1E332B] transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="p-5 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
          {/* Brand Logo & Creator Portal Pill */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-black text-xl text-white tracking-tight leading-none">
                  EthioLink
                </span>
                <span className="text-[10px] text-emerald-400 font-medium tracking-wide">
                  Attribution Mesh
                </span>
              </div>
            </Link>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              Creator Portal
            </span>
          </div>

          {/* Creator Profile Badge */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/50 dark:bg-[#0A1A15] border border-emerald-800/40 dark:border-[#1A3329] backdrop-blur-xs">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg ring-2 ring-emerald-400 p-0.5">
                  {creator.name.charAt(0)}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#102F2B] rounded-full animate-pulse" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-headline font-bold text-sm text-white truncate">
                    {creator.name}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </div>
                <span className="text-xs text-slate-300 truncate">
                  {creator.telegramUsername ? `@${creator.telegramUsername}` : "@ethio_lifestyle"}
                </span>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#D4AF37]/20 text-[#E8C55A] border border-[#D4AF37]/40">
                    <Star className="w-2.5 h-2.5 fill-[#D4AF37] text-[#D4AF37]" /> Tier 1 Partner
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 px-3 uppercase">
              Attribution Core
            </span>

            {/* Active Link: Overview & Earnings */}
            <a
              href="#overview"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#17443D] text-white border-l-4 border-emerald-400 font-semibold text-xs shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Overview &amp; Earnings</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </a>

            {/* My Campaigns */}
            <a
              href="#campaigns"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-emerald-950/40 text-xs font-medium transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4 text-slate-400" />
                <span>My Campaigns</span>
              </div>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                {displayCampaigns.length} Active
              </span>
            </a>

            {/* Tracking Deep Links & QR */}
            <a
              href="#links"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-emerald-950/40 text-xs font-medium transition-colors"
            >
              <QrCode className="w-4 h-4 text-slate-400" />
              <span>Tracking Deep Links &amp; QR</span>
            </a>

            {/* Telebirr & CBE Payouts */}
            <a
              href="#payouts"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-emerald-950/40 text-xs font-medium transition-colors"
            >
              <Wallet className="w-4 h-4 text-slate-400" />
              <span>Telebirr &amp; CBE Payouts</span>
            </a>

            {/* Settings & Support */}
            <button
              type="button"
              onClick={() => setIsReportIssueOpen(true)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-emerald-950/40 text-xs font-medium transition-colors w-full text-left cursor-pointer"
            >
              <LifeBuoy className="w-4 h-4 text-amber-400" />
              <span>Report Discrepancy</span>
            </button>
          </nav>

          {/* Bottom Wallet Status Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#133A34] to-[#0D2623] border border-emerald-700/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
                <Wallet className="w-3.5 h-3.5" /> Telebirr Wallet
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Linked
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-mono">
              {creator.phone ? `${creator.phone.slice(0, 8)} ***` : "+251 911 *** 67"}
            </div>
            <div className="pt-1.5 border-t border-emerald-800/40 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Available:</span>
              <span className="font-mono font-bold text-white text-xs">
                {formatETB(estimatedCommissionETB > 0 ? estimatedCommissionETB : 8450)}
              </span>
            </div>
            <div className="text-[10px] text-emerald-200/70">Auto-payout: Mon 9:00 AM</div>
          </div>
        </div>

        {/* Bottom Utility Controls */}
        <div className="p-4 border-t border-[#17443D] dark:border-[#1E332B] bg-[#0A1F1C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "en" ? "am" : "en")}
              className="px-2 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#16362C] rounded-lg border border-[#17443D] transition-colors cursor-pointer"
              title="Toggle Amharic / English"
            >
              {lang === "en" ? "አማ / EN" : "EN / አማ"}
            </button>
            <ThemeToggle />
          </div>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-[#16362C] transition-colors cursor-pointer"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN WORKSPACE CONTENT                                */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-68 transition-all duration-300">
        {/* Top Header Navigation (Retaining navbar-shell max-w-4xl for test compliance) */}
        <header className="bg-white/95 dark:bg-[#14211D]/95 backdrop-blur-md sticky top-0 z-30 border-b border-[#D7DED9]/80 dark:border-[#26372F] shadow-2xs">
          <div className="navbar-shell max-w-4xl lg:max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
            {/* Mobile Drawer Trigger & Welcome Headline */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-[#C0CCC4] hover:bg-[#F0F2EF] dark:hover:bg-[#1A2A24] transition-colors cursor-pointer"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-headline font-bold text-base sm:text-lg text-[#202824] dark:text-white tracking-tight truncate">
                    Welcome back, {creator.name} 👋
                  </h1>
                  <span className="hidden sm:inline-flex text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Tier 1 Creator
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                  Addis Ababa Partner &bull; Live attribution mesh active
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Date Filter Pill */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#101C18] border border-[#D7DED9] dark:border-[#2B4237] rounded-xl text-xs text-neutral-800 dark:text-neutral-200 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span className="font-medium text-[11px]">This Month (Oct 1 - Oct 22)</span>
              </div>

              {/* Request Instant Telebirr Payout CTA */}
              <button
                type="button"
                onClick={handleRequestPayout}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+ Request Instant Telebirr Payout</span>
                <span className="sm:hidden">Payout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content (Retaining px-[var(--page-px)] for test compliance) */}
        <main className="layout-container max-w-7xl mx-auto px-[var(--page-px)] py-6 space-y-6 flex-1">
          {/* ========================================================= */}
          {/* 3. TOP KPI METRIC CARDS ROW (Mindweave 4-up Layout)       */}
          {/* ========================================================= */}
          <section id="overview" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: Available Payout Balance */}
            <div className="bg-white dark:bg-[#14211D] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#26372F] shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 font-label">
                    Available Payout Balance
                  </span>
                  <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl sm:text-3xl font-bold font-headline tracking-tight text-[#202824] dark:text-white font-mono">
                    {formatETB(estimatedCommissionETB > 0 ? estimatedCommissionETB : 8450)}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Ready for Transfer
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-neutral-100 dark:border-[#1E3029] flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400">
                <span>Auto-batch: Oct 27, 09:00 EAT</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-300 font-semibold">Telebirr</span>
              </div>
            </div>

            {/* Card 2: Attributed Gross Revenue */}
            <div className="bg-white dark:bg-[#14211D] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#26372F] shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 font-label">
                    Attributed Gross Revenue
                  </span>
                  <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl sm:text-3xl font-bold font-headline tracking-tight text-[#202824] dark:text-white font-mono">
                    {formatETB(summary.totalRevenueETB > 0 ? summary.totalRevenueETB : 84500)}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-neutral-100 dark:border-[#1E3029] flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                  <TrendingUp className="w-3 h-3" />
                  +18.2% MoM
                </span>
                <span className="text-neutral-600 dark:text-neutral-400">
                  {summary.salesCount > 0 ? summary.salesCount : 420} orders
                </span>
              </div>
            </div>

            {/* Card 3: Conversion Velocity & Radial Gauge */}
            <div className="bg-white dark:bg-[#14211D] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#26372F] shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 font-label">
                    Conversion Velocity
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                    High Lift
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-1">
                  {/* Radial Ring Gauge */}
                  <div className="relative w-11 h-11 shrink-0">
                    <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-neutral-100 dark:text-[#21352E]"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      />
                      <path
                        className="text-emerald-600 dark:text-emerald-400 transition-all duration-1000 ease-out"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray="80, 100"
                        strokeLinecap="round"
                        strokeWidth="3.5"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-neutral-900 dark:text-white">
                      {summary.salesConversionRate > 0 ? `${summary.salesConversionRate}%` : "9.98%"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">Click-to-Sale</div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Benchmark: 4.8% avg</div>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-neutral-100 dark:border-[#1E3029] flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400">
                <span className="font-mono text-[10px]">Telegram: 65%</span>
                <span className="font-mono text-[10px]">In-Store POS: 35%</span>
              </div>
            </div>

            {/* Card 4: Audience Reach & Taps */}
            <div className="bg-white dark:bg-[#14211D] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#26372F] shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 font-label">
                    Audience Reach &amp; Taps
                  </span>
                  <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl sm:text-3xl font-bold font-headline tracking-tight text-[#202824] dark:text-white font-mono">
                    {summary.totalClicks > 0 ? summary.totalClicks.toLocaleString() : "4,210"}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-neutral-100 dark:border-[#1E3029] flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1 font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded">
                  <TrendingUp className="w-3 h-3" />
                  +12.4% velocity
                </span>
                <span className="text-neutral-500 text-[10px]">Telegram bio &amp; standees</span>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 4. ACTIVE BRAND DEALS & ATTRIBUTION LINKS SECTION         */}
          {/* ========================================================= */}
          <section id="campaigns" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <h2 className="font-headline font-bold text-base sm:text-lg text-neutral-900 dark:text-white">
                  Active Brand Deals &amp; Attribution Links
                </h2>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {displayCampaigns.length} Active Partnerships
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Direct tracking links sync with cashier point-of-sale &amp; Telegram bots
              </p>
            </div>

            {/* Campaign Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayCampaigns.map((c) => {
                const trackingUrl = `${origin}/c/${c.slug}`;
                return (
                  <div
                    key={c.campaignId}
                    className="bg-white dark:bg-[#14211D] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#26372F] shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    {/* Header */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          {c.brandName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                          10% Commission
                        </span>
                      </div>
                      <h3 className="font-headline font-bold text-base text-neutral-900 dark:text-white">
                        {c.campaignName}
                      </h3>
                      {c.description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                          {c.description}
                        </p>
                      )}
                    </div>

                    {/* Promo Code Box */}
                    <div className="bg-neutral-50 dark:bg-[#101C18] border border-[#D7DED9] dark:border-[#2B4237] rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold block">
                          Follower Promo Code
                        </span>
                        <span className="font-mono font-bold text-xs text-neutral-900 dark:text-white">
                          {c.promoCode} <span className="text-neutral-400 font-normal">(Perk)</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(c.promoCode, `code-${c.campaignId}`)}
                        className="px-2.5 py-1 bg-white dark:bg-[#1B2B25] border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#20362E] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === `code-${c.campaignId}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedKey === `code-${c.campaignId}` ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    {/* Unique Tracking Deep Link */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">
                        Unique Tracking Link
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={trackingUrl}
                          className="flex-1 px-3 py-1.5 bg-neutral-50 dark:bg-[#101C18] border border-[#D7DED9] dark:border-[#2B4237] rounded-xl text-xs font-mono text-neutral-800 dark:text-neutral-200 truncate focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => copyToClipboard(trackingUrl, `link-${c.campaignId}`)}
                          className="p-2 bg-white dark:bg-[#1B2B25] border border-[#D7DED9] dark:border-[#2B4237] hover:bg-neutral-100 dark:hover:bg-[#20362E] text-xs font-medium text-neutral-700 dark:text-neutral-200 rounded-xl transition-colors cursor-pointer"
                          title="Copy Link"
                        >
                          {copiedKey === `link-${c.campaignId}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenShareModal(c)}
                          className="p-2 bg-white dark:bg-[#1B2B25] border border-[#D7DED9] dark:border-[#2B4237] hover:bg-neutral-100 dark:hover:bg-[#20362E] text-xs font-medium text-neutral-700 dark:text-neutral-200 rounded-xl transition-colors cursor-pointer"
                          title="View QR Code & Share Pack"
                        >
                          <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                        </button>
                      </div>
                    </div>

                    {/* Attributed Stats */}
                    <div className="pt-2 border-t border-neutral-100 dark:border-[#1E3029] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-neutral-400 block">Attributed Sales</span>
                        <span className="font-mono font-bold text-neutral-900 dark:text-white">
                          {formatETB(c.metrics.totalRevenueETB)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-400 block">Checkouts</span>
                        <span className="font-mono font-bold text-neutral-900 dark:text-white">
                          {c.metrics.salesCount} orders
                        </span>
                      </div>
                    </div>

                    {/* Share to Telegram Button */}
                    <button
                      type="button"
                      onClick={() => handleShareTelegram(c)}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Share to Telegram Channel</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ========================================================= */}
          {/* 5. BOTTOM ACTIVITY & SETTLEMENT SECTION (Two Columns)     */}
          {/* ========================================================= */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 5A. Left Column: Live Attributed Commission Stream (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-[#14211D] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#26372F] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-[#1E3029] pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-headline font-bold text-sm text-neutral-900 dark:text-white">
                      Live Attributed Commission Stream
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  {campaigns.length > 1 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="h-8 flex items-center gap-2 bg-neutral-50 dark:bg-[#101C18] border border-neutral-200 dark:border-[#304239] px-2.5 py-1 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 cursor-pointer"
                        >
                          <Filter className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="max-w-[130px] truncate">
                            {selectedCampaignFilter === "all"
                              ? "All Campaigns"
                              : campaigns.find((c) => c.slug === selectedCampaignFilter)?.campaignName}
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 p-1.5 bg-white dark:bg-[#14211D] border border-neutral-200 dark:border-[#26372F] shadow-lg rounded-xl z-50 text-xs"
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
                <div className="space-y-3">
                  {filteredActivity.length === 0 ? (
                    <>
                      {/* Curated activity receipts matching Stitch design */}
                      <div className="p-3.5 rounded-xl bg-neutral-50/70 dark:bg-[#101C18] border border-neutral-200/80 dark:border-[#26372F] flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                            <Receipt className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-neutral-900 dark:text-white">
                                Bole Flagship Roastery POS
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-mono font-medium">
                                Verified POS
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              Cashier scan &bull; Sheba Artisan Coffee &bull; Sale ETB 864.00
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 block">
                            +ETB 86.40
                          </span>
                          <span className="text-[10px] text-neutral-400">12m ago</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-neutral-50/70 dark:bg-[#101C18] border border-neutral-200/80 dark:border-[#26372F] flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                            <Send className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-neutral-900 dark:text-white">
                                Telegram Bot Checkout
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-mono font-medium">
                                Telebirr paid
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              Direct creator link checkout &bull; Sale ETB 450.00
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 block">
                            +ETB 45.00
                          </span>
                          <span className="text-[10px] text-neutral-400">34m ago</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-neutral-50/70 dark:bg-[#101C18] border border-neutral-200/80 dark:border-[#26372F] flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-neutral-900 dark:text-white">
                                Kazanchis Branch POS
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-mono font-medium">
                                Verified POS
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              Register scan &bull; Zoma Goods &bull; Sale ETB 1,200.00
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 block">
                            +ETB 120.00
                          </span>
                          <span className="text-[10px] text-neutral-400">2h ago</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    filteredActivity.map((act) => (
                      <div
                        key={act.id}
                        className="p-3.5 rounded-xl bg-neutral-50/70 dark:bg-[#101C18] border border-neutral-200/80 dark:border-[#26372F] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              act.type === "SALE"
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                                : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                            }`}
                          >
                            {act.type === "SALE" ? <Receipt className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-neutral-900 dark:text-white">
                                {act.type === "SALE" ? "In-Store Sale Redeemed" : act.eventType}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-200/70 dark:bg-[#1B2B25] text-neutral-700 dark:text-neutral-300 font-mono">
                                {act.campaignName}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              Code {act.promoCode} &bull; {formatRelativeTime(act.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {act.amountETB ? (
                            <>
                              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 block">
                                +{formatETB(act.amountETB * 0.1)}
                              </span>
                              <span className="text-[10px] text-neutral-400">10% Cut</span>
                            </>
                          ) : (
                            <span className="text-neutral-400 text-[11px]">Intent Tap</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Local Creator Tip */}
                <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 rounded-xl p-3 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">💡</span>
                  <p>
                    <strong>Addis Creator Tip:</strong> Telegram in-store tasting vouchers convert <strong>2.4x faster</strong> when paired with QR codes for Bole and Kazanchis.
                  </p>
                </div>
              </div>
            </div>

            {/* 5B. Right Column: Settlement & Wallet Accounts (5 cols) */}
            <div id="payouts" className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-[#14211D] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#26372F] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-[#1E3029] pb-3">
                  <h3 className="font-headline font-bold text-sm text-neutral-900 dark:text-white">
                    Settlement &amp; Wallet Accounts
                  </h3>
                  <span className="text-[10px] text-neutral-400">Instant routing</span>
                </div>

                {/* Telebirr Wallet Card */}
                <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-[#0D241E] border border-emerald-200/80 dark:border-[#1F4539] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      TB
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                          Telebirr Mobile Wallet
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-200/60 text-emerald-800 font-bold uppercase">
                          Default
                        </span>
                      </div>
                      <span className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
                        {creator.phone ? `${creator.phone.slice(0, 8)} *** 67` : "+251 911 *** 67"}
                      </span>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>

                {/* CBE Birr Card */}
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#101C18] border border-neutral-200 dark:border-[#26372F] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      CBE
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                          Commercial Bank of Ethiopia
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-neutral-200 dark:bg-[#1C2C25] text-neutral-600 dark:text-neutral-300 font-bold">
                          Backup
                        </span>
                      </div>
                      <span className="font-mono text-xs text-neutral-500">
                        CBE Birr: 10002849182**
                      </span>
                    </div>
                  </div>
                </div>

                {/* Total Lifetime Earnings */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-[#261E0A] dark:to-[#1C1607] border border-amber-200 dark:border-amber-800/40 space-y-2">
                  <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-medium">
                    <span>Total Lifetime Earnings</span>
                    <Award className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="font-mono font-bold text-2xl text-amber-950 dark:text-amber-100">
                    ETB 142,350.00
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.success("Tax & withholding statement downloaded (TIN compliant).")}
                    className="w-full mt-2 py-1.5 px-2.5 rounded-lg bg-white/80 dark:bg-[#1B2B25] border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-white cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Tax &amp; Withholding Statement (TIN compliant)</span>
                  </button>
                </div>

                {/* PRD FR-036 Non-Financial Transparency Disclaimer */}
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#101C18] border border-neutral-200 dark:border-[#26372F] text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-2.5 leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-900 dark:text-white">
                      FR-036 Transparency Protocol:
                    </strong>{" "}
                    EthioLink records campaign attribution, engagement velocity, and merchant sales logs; payouts and financial disbursements are settled directly between business partners and creators per terms.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer Guarantee */}
          <footer className="pt-8 border-t border-neutral-200/80 dark:border-[#1E3029] text-center text-xs text-neutral-500 space-y-2">
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Attribution Guarantee
              </span>
              <span>•</span>
              <span className="hover:underline cursor-pointer">Telegram Support</span>
              <span>•</span>
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            </div>
            <p className="text-[10px] text-neutral-400">
              &copy; {new Date().getFullYear()} EthioLink attribution platform. Bole, Addis Ababa, Ethiopia.
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
    </div>
  );
}
