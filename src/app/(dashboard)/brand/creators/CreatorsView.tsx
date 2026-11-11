"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { formatETB } from "@/lib/sales";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BrandSidebar } from "../BrandSidebar";
import { CreatorRosterItem } from "../brand-helpers";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Search,
  Download,
  Calendar,
  CheckCircle2,
  Check,
  Copy,
  ExternalLink,
  Send,
  QrCode,
  MapPin,
  TrendingUp,
  Percent,
  Plus,
  ShieldCheck,
  BadgeCheck,
  ChevronRight,
  ChevronDown,
  Menu,
  Wallet,
  X,
  BarChart3,
} from "lucide-react";

export interface CreatorDetailItem {
  id: string;
  name: string;
  handle: string;
  phone: string;
  tier: "Top Performer" | "Culinary Influencer" | "Tech & Hardware" | "Fashion & Beverage" | "Rising Creator" | "Standard Partner";
  status: "Active" | "Review Needed" | "Paused";
  locationAnchor: string;
  platforms: {
    telegram?: string;
    tiktok?: string;
    instagram?: string;
    youtube?: string;
  };
  promoCode: string;
  attributedSalesETB: number;
  recordedOrders: number;
  telegramClicks: number;
  conversionRatePercent: number;
  posScans: number;
  posBranch: string;
  commissionCutETB: number;
  commissionRatePercent: number;
  payoutStatus: "Ready" | "Verification Hold" | "Disbursed";
  payoutMethod: "Telebirr" | "CBE Birr";
  payoutWalletMasked: string;
  trackingLink: string;
  shopperPerkPercent: number;
  channelSplit: {
    telegramPercent: number;
    posPercent: number;
    directPercent: number;
  };
  campaignNames: string[];
}

export const DEFAULT_CREATORS: CreatorDetailItem[] = [
  {
    id: "ETH-8492",
    name: "Meron B.",
    handle: "@ethio_lifestyle",
    phone: "+251 91 123 4567",
    tier: "Top Performer",
    status: "Active",
    locationAnchor: "Bole Anchor Partner",
    platforms: {
      telegram: "74k",
      tiktok: "46k",
      instagram: "95k",
    },
    promoCode: "ETHIO20",
    attributedSalesETB: 84500,
    recordedOrders: 420,
    telegramClicks: 4210,
    conversionRatePercent: 10.0,
    posScans: 142,
    posBranch: "Bole Flagship POS",
    commissionCutETB: 8450,
    commissionRatePercent: 10.0,
    payoutStatus: "Ready",
    payoutMethod: "Telebirr",
    payoutWalletMasked: "+251 911 *** 67",
    trackingLink: "https://ethiolink.et/c/sheba-meron",
    shopperPerkPercent: 20,
    channelSplit: {
      telegramPercent: 68,
      posPercent: 24,
      directPercent: 8,
    },
    campaignNames: ["Sheba Artisan Coffee Spring Roasts", "Bole Flagship Special"],
  },
  {
    id: "ETH-3910",
    name: "Yared K.",
    handle: "@addisfoodie",
    phone: "+251 91 234 5678",
    tier: "Culinary Influencer",
    status: "Active",
    locationAnchor: "Kazanchis Hub",
    platforms: {
      telegram: "85k",
      instagram: "62k",
    },
    promoCode: "ADDIS20",
    attributedSalesETB: 62100,
    recordedOrders: 315,
    telegramClicks: 3450,
    conversionRatePercent: 9.1,
    posScans: 98,
    posBranch: "Kazanchis Hub POS",
    commissionCutETB: 6210,
    commissionRatePercent: 10.0,
    payoutStatus: "Ready",
    payoutMethod: "CBE Birr",
    payoutWalletMasked: "10002849182**",
    trackingLink: "https://ethiolink.et/c/sidama-reserve",
    shopperPerkPercent: 20,
    channelSplit: {
      telegramPercent: 72,
      posPercent: 20,
      directPercent: 8,
    },
    campaignNames: ["Sidama Reserve Beans Campaign"],
  },
  {
    id: "ETH-6712",
    name: "Dawit T.",
    handle: "@habesha_tech",
    phone: "+251 92 234 5678",
    tier: "Tech & Hardware",
    status: "Active",
    locationAnchor: "Bole Medhanialem",
    platforms: {
      youtube: "64k",
      telegram: "38k",
    },
    promoCode: "HABESHA15",
    attributedSalesETB: 54300,
    recordedOrders: 280,
    telegramClicks: 2890,
    conversionRatePercent: 9.7,
    posScans: 45,
    posBranch: "Bole Medhanialem Terminal",
    commissionCutETB: 5430,
    commissionRatePercent: 10.0,
    payoutStatus: "Ready",
    payoutMethod: "Telebirr",
    payoutWalletMasked: "+251 922 *** 14",
    trackingLink: "https://ethiolink.et/c/cold-brew-kit",
    shopperPerkPercent: 15,
    channelSplit: {
      telegramPercent: 60,
      posPercent: 28,
      directPercent: 12,
    },
    campaignNames: ["Cold Brew Kits & Hardware"],
  },
  {
    id: "ETH-5120",
    name: "Bethlehem G.",
    handle: "@sheba_vibes",
    phone: "+251 91 345 6789",
    tier: "Fashion & Beverage",
    status: "Active",
    locationAnchor: "Bole Roastery",
    platforms: {
      instagram: "51k",
      telegram: "24k",
      tiktok: "32k",
    },
    promoCode: "SHEBA10",
    attributedSalesETB: 44950,
    recordedOrders: 225,
    telegramClicks: 1940,
    conversionRatePercent: 8.6,
    posScans: 84,
    posBranch: "Bole Roastery POS",
    commissionCutETB: 4495,
    commissionRatePercent: 10.0,
    payoutStatus: "Ready",
    payoutMethod: "CBE Birr",
    payoutWalletMasked: "10003928174**",
    trackingLink: "https://ethiolink.et/c/sheba-rituals",
    shopperPerkPercent: 10,
    channelSplit: {
      telegramPercent: 55,
      posPercent: 35,
      directPercent: 10,
    },
    campaignNames: ["Morning Rituals with Sheba Beans"],
  },
  {
    id: "ETH-2209",
    name: "Selamawit A.",
    handle: "@addis_artisan",
    phone: "+251 91 398 7654",
    tier: "Rising Creator",
    status: "Review Needed",
    locationAnchor: "Bole Flagship",
    platforms: {
      telegram: "28k",
      tiktok: "19k",
    },
    promoCode: "ARTISAN15",
    attributedSalesETB: 28400,
    recordedOrders: 140,
    telegramClicks: 1120,
    conversionRatePercent: 8.2,
    posScans: 32,
    posBranch: "Bole Flagship POS",
    commissionCutETB: 2840,
    commissionRatePercent: 10.0,
    payoutStatus: "Verification Hold",
    payoutMethod: "Telebirr",
    payoutWalletMasked: "+251 913 *** 88",
    trackingLink: "https://ethiolink.et/c/handcrafted-pottery",
    shopperPerkPercent: 15,
    channelSplit: {
      telegramPercent: 70,
      posPercent: 22,
      directPercent: 8,
    },
    campaignNames: ["Handcrafted Pottery & Coffee Sets"],
  },
];

const PLATFORM_OPTIONS = [
  { value: "ALL", label: "All Platforms (Telegram, TikTok, IG, YT)" },
  { value: "TELEGRAM", label: "Telegram Channel / Bot" },
  { value: "TIKTOK", label: "TikTok Ethiopia" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "YOUTUBE", label: "YouTube" },
];

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses (Active, Review, Paused)" },
  { value: "ACTIVE", label: "Active Partner" },
  { value: "REVIEW", label: "Review Needed" },
  { value: "PAUSED", label: "Paused" },
];

const SORT_OPTIONS: Array<{ value: "revenue_desc" | "conv_desc" | "recent"; label: string }> = [
  { value: "revenue_desc", label: "Sort: Highest Revenue (ETB)" },
  { value: "conv_desc", label: "Sort: Highest Conversion %" },
  { value: "recent", label: "Sort: Most Recent" },
];

export interface CreatorsViewProps {
  brandName?: string;
  ownerName?: string;
  brandPhone?: string;
  role?: string;
  creators?: CreatorRosterItem[];
  campaigns?: Array<{ id: string; name: string; promoCode: string }>;
  embedded?: boolean;
  onNavigateTab?: (tab: "overview" | "sales" | "analytics" | "privacy" | "creators") => void;
}

export function CreatorsView({
  brandName = "Sheba Artisan Coffee",
  ownerName = "Abebe Bikila",
  brandPhone = "+251 91 123 4567",
  role = "OWNER",
  creators: initialRoster = [],
  campaigns = [],
  embedded = false,
  onNavigateTab,
}: CreatorsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortOption, setSortOption] = useState<"revenue_desc" | "conv_desc" | "recent">("revenue_desc");
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>("ETH-8492");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "am">("en");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Form state for inviting new creator
  const [newCreatorName, setNewCreatorName] = useState("");
  const [newCreatorPhone, setNewCreatorPhone] = useState("");
  const [newCreatorTelegram, setNewCreatorTelegram] = useState("");
  const [newCreatorCampaign, setNewCreatorCampaign] = useState(campaigns[0]?.name || "Sheba Artisan Coffee Spring Roasts");
  const [newCreatorPromo, setNewCreatorPromo] = useState("");
  const [newCreatorCommission, setNewCreatorCommission] = useState("10.0");

  // Merge database roster with rich details
  const allCreators = useMemo<CreatorDetailItem[]>(() => {
    if (!initialRoster || initialRoster.length === 0) {
      return DEFAULT_CREATORS;
    }
    // Enrich with database items if present
    const enriched = [...DEFAULT_CREATORS];
    initialRoster.forEach((dbItem, idx) => {
      if (!enriched.some((c) => c.name.toLowerCase() === dbItem.name.toLowerCase())) {
        enriched.push({
          id: `DB-${dbItem.id.slice(0, 6)}`,
          name: dbItem.name,
          handle: dbItem.telegramUsername ? `@${dbItem.telegramUsername}` : `@creator_${idx + 1}`,
          phone: dbItem.phone,
          tier: "Standard Partner",
          status: "Active",
          locationAnchor: "Addis Ababa",
          platforms: {
            telegram: dbItem.telegramUsername ? "Active" : undefined,
          },
          promoCode: `CODE${idx + 10}`,
          attributedSalesETB: 15000,
          recordedOrders: 65,
          telegramClicks: 650,
          conversionRatePercent: 10.0,
          posScans: 12,
          posBranch: "Bole Flagship POS",
          commissionCutETB: 1500,
          commissionRatePercent: 10.0,
          payoutStatus: "Ready",
          payoutMethod: "Telebirr",
          payoutWalletMasked: dbItem.phone.slice(0, 8) + "***",
          trackingLink: `https://ethiolink.et/c/partner-${dbItem.id.slice(0, 4)}`,
          shopperPerkPercent: 10,
          channelSplit: {
            telegramPercent: 65,
            posPercent: 25,
            directPercent: 10,
          },
          campaignNames: dbItem.campaignNames,
        });
      }
    });
    return enriched;
  }, [initialRoster]);

  // Filtered & sorted creators list
  const filteredCreators = useMemo(() => {
    return allCreators
      .filter((creator) => {
        const matchesQuery =
          creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          creator.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          creator.promoCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          creator.campaignNames.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesQuery) return false;

        if (platformFilter !== "ALL") {
          if (platformFilter === "TELEGRAM" && !creator.platforms.telegram) return false;
          if (platformFilter === "TIKTOK" && !creator.platforms.tiktok) return false;
          if (platformFilter === "INSTAGRAM" && !creator.platforms.instagram) return false;
          if (platformFilter === "YOUTUBE" && !creator.platforms.youtube) return false;
        }

        if (statusFilter !== "ALL") {
          if (statusFilter === "ACTIVE" && creator.status !== "Active") return false;
          if (statusFilter === "REVIEW" && creator.status !== "Review Needed") return false;
          if (statusFilter === "PAUSED" && creator.status !== "Paused") return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "revenue_desc") return b.attributedSalesETB - a.attributedSalesETB;
        if (sortOption === "conv_desc") return b.conversionRatePercent - a.conversionRatePercent;
        return a.id.localeCompare(b.id);
      });
  }, [allCreators, searchQuery, platformFilter, statusFilter, sortOption]);

  const selectedCreator = useMemo(() => {
    return allCreators.find((c) => c.id === selectedCreatorId) || filteredCreators[0] || allCreators[0];
  }, [allCreators, selectedCreatorId, filteredCreators]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Handle",
      "Status",
      "Tier",
      "Promo Code",
      "Attributed Sales (ETB)",
      "Recorded Orders",
      "Telegram Clicks",
      "Conversion Rate (%)",
      "POS Scans",
      "Commission Cut (ETB)",
      "Payout Method",
    ];
    const rows = filteredCreators.map((c) => [
      c.id,
      `"${c.name}"`,
      c.handle,
      c.status,
      `"${c.tier}"`,
      c.promoCode,
      c.attributedSalesETB,
      c.recordedOrders,
      c.telegramClicks,
      `${c.conversionRatePercent}%`,
      c.posScans,
      c.commissionCutETB,
      c.payoutMethod,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ethiolink-creators-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Creators ledger CSV exported");
  };

  const handleCreateCreatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCreatorName || !newCreatorPhone) {
      toast.error("Please provide both creator name and phone number");
      return;
    }
    toast.success(`Invite created for ${newCreatorName}! Tracking link generated.`);
    setIsInviteModalOpen(false);
    setNewCreatorName("");
    setNewCreatorPhone("");
    setNewCreatorTelegram("");
    setNewCreatorPromo("");
  };

  const content = (
    <div className="flex-1 flex flex-col min-w-0 w-full">
      {/* Top Header Navigation: Only rendered in Standalone Mode */}
      {!embedded ? (
        <header className="bg-white/95 dark:bg-[#14211D]/95 backdrop-blur-md sticky top-0 z-20 border-b border-[#D7DED9]/80 dark:border-[#26372F] shadow-2xs">
          <div className="navbar-shell layout-container-wide min-h-[var(--navbar-height)] px-[var(--page-px)] flex items-center justify-between gap-4 py-3">
            {/* Breadcrumb & Mesh Badge */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-[#C0CCC4] hover:bg-[#F0F2EF] dark:hover:bg-[#1A2A24] transition-colors cursor-pointer"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <nav className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                <span className="hover:text-neutral-900 dark:hover:text-white cursor-pointer transition-colors">
                  Affiliate Network
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                <span className="text-[#202824] dark:text-white font-bold font-headline text-sm">
                  Influencers &amp; Creators
                </span>
              </nav>
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Addis Active Mesh
              </span>
            </div>

            {/* Center Search Input */}
            <div className="hidden lg:flex items-center relative w-72 xl:w-80">
              <Search className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search creators, handle, or campaign..."
                className="w-full pl-9 pr-12 py-1.5 bg-[#F7F8F5] dark:bg-[#101C18] hover:bg-white dark:hover:bg-[#15231F] focus:bg-white dark:focus:bg-[#15231F] text-xs text-neutral-900 dark:text-white rounded-xl border border-[#D7DED9] dark:border-[#2B4237] focus:border-emerald-600 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-600 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
              <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 dark:text-neutral-500 bg-white dark:bg-[#1B2B25] border border-neutral-300 dark:border-neutral-700 rounded shadow-2xs">
                ⌘K
              </kbd>
            </div>

            {/* Right Utility Actions */}
            <div className="flex items-center gap-2.5">
              {/* Date Selector Pill */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#101C18] border border-[#D7DED9] dark:border-[#2B4237] hover:border-neutral-400 dark:hover:border-neutral-600 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 cursor-pointer transition-colors shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span className="font-medium text-[11px]">Last 30 Days</span>
              </div>

              {/* Language Switch */}
              <button
                onClick={() => setLang(lang === "en" ? "am" : "en")}
                className="px-2 py-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-neutral-100 dark:hover:bg-[#1A2A24] rounded-lg border border-[#D7DED9] dark:border-[#2B4237] transition-colors"
                title="Toggle Amharic / English"
              >
                {lang === "en" ? "አማ / EN" : "EN / አማ"}
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Export CSV */}
              <button
                onClick={handleExportCSV}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#101C18] border border-[#D7DED9] dark:border-[#2B4237] hover:bg-[#F0F2EF] dark:hover:bg-[#162721] rounded-xl text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
                <span>Export CSV</span>
              </button>

              {/* Primary CTA: Invite / Add Creator */}
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Invite / Add Creator</span>
              </button>
            </div>
          </div>
        </header>
      ) : (
        /* In Embedded Mode: Clean contextual toolbar that doesn't duplicate the dashboard header */
        <div className="flex flex-wrap items-center justify-between gap-3 pb-1 pt-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Addis Active Mesh · {allCreators.length} Influencer Partners
            </span>
            <span className="hidden sm:inline text-xs text-neutral-500 dark:text-neutral-400">
              10% Standard Commission · CBE &amp; Telebirr Instant Payouts
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#14211D] border border-[#D7DED9] dark:border-[#2B4237] hover:bg-[#F0F2EF] dark:hover:bg-[#1A2A24] rounded-xl text-xs font-semibold text-neutral-700 dark:text-[#C0CCC4] transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-neutral-500 dark:text-[#9BAAA1]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Invite / Add Creator</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className={`${embedded ? "w-full" : "layout-container-wide"} flex-1 py-4 sm:py-6 space-y-6`}>
        {/* ========================================================= */}
        {/* 1. KPI METRIC CARDS ROW (Mindweave Inspired 4-up Layout)  */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Active Creators */}
          <div className="bg-white dark:bg-[#14211D] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#26372F] shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 font-label">Active Creators</span>
                <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold font-headline tracking-tight text-[#202824] dark:text-white font-mono">
                  {allCreators.length}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  +4 onboarding
                </span>
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-100 dark:border-[#1E3029] flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                4 Ethiopian regions
              </span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">82% Retention</span>
            </div>
          </div>

          {/* Card 2: Attributed Sales (30D) */}
          <div className="bg-white dark:bg-[#14211D] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#26372F] shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 font-label">Attributed Sales (30D)</span>
                <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl lg:text-[26px] font-bold font-headline tracking-tight text-[#202824] dark:text-white font-mono">
                  {formatETB(1245850)}
                </span>
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-100 dark:border-[#1E3029] flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3" />
                +18.4% MoM
              </span>
              <span className="text-neutral-600 dark:text-neutral-400 font-mono">3,840 transactions</span>
            </div>
          </div>

          {/* Card 3: Conversion Velocity & Radial Gauge */}
          <div className="bg-white dark:bg-[#14211D] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#26372F] shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 font-label">Conversion Velocity</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                  Optimal
                </span>
              </div>
              <div className="flex items-center gap-3 mb-1">
                {/* Radial Gauge SVG */}
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
                      strokeDasharray="78, 100"
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-neutral-900 dark:text-white">
                    4.8%
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">Blended Rate</div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Benchmark: 3.5% avg</div>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-100 dark:border-[#1E3029] flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400">
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" /> Bot: 5.2%
              </span>
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" /> POS QR: 3.9%
              </span>
            </div>
          </div>

          {/* Card 4: Commission Accrued */}
          <div className="bg-white dark:bg-[#14211D] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#26372F] shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 font-label">Commission Accrued</span>
                <span className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl lg:text-[26px] font-bold font-headline tracking-tight text-[#202824] dark:text-white font-mono">
                  {formatETB(124580)}
                </span>
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-100 dark:border-[#1E3029] flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-medium border border-blue-200 dark:border-blue-800">
                  Telebirr
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-medium border border-purple-200 dark:border-purple-800">
                  CBE Birr
                </span>
              </div>
              <span className="text-neutral-500 dark:text-neutral-400 text-[10px]">Sched: Nov 1</span>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. MAIN TWO-COLUMN CONTENT AREA (Ledger + Deep Dive)      */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 2A. LEFT COLUMN: Directory Ledger & Toolbar (col-span-8) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Filter & Control Toolbar Card */}
            <div className="bg-white dark:bg-[#14211D] rounded-2xl p-4 border border-[#D7DED9]/90 dark:border-[#26372F] shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Search input */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter by handle, name or promo code..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white rounded-xl border border-[#D7DED9] dark:border-[#2B4237] focus:border-emerald-600 dark:focus:border-emerald-400 focus:ring-0 bg-neutral-50/60 dark:bg-[#101C18] placeholder:text-neutral-400"
                  />
                </div>

                {/* Custom Filter Dropdowns */}
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {/* Platform Selector Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="h-8.5 px-3 py-1.5 text-xs bg-neutral-50/80 dark:bg-[#101C18] border border-[#D7DED9] dark:border-[#2B4237] hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-xl text-neutral-800 dark:text-neutral-200 flex items-center gap-2 shadow-2xs font-medium cursor-pointer transition-all"
                      >
                        <span className="truncate max-w-[170px]">
                          {PLATFORM_OPTIONS.find((p) => p.value === platformFilter)?.label}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-64 p-1.5 bg-white dark:bg-[#14211D] border border-[#D7DED9] dark:border-[#26372F] shadow-lg rounded-xl z-50 text-xs"
                    >
                      {PLATFORM_OPTIONS.map((opt) => (
                        <DropdownMenuItem
                          key={opt.value}
                          onClick={() => setPlatformFilter(opt.value)}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#1A2A24]"
                        >
                          <span>{opt.label}</span>
                          {platformFilter === opt.value && (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Status Selector Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="h-8.5 px-3 py-1.5 text-xs bg-neutral-50/80 dark:bg-[#101C18] border border-[#D7DED9] dark:border-[#2B4237] hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-xl text-neutral-800 dark:text-neutral-200 flex items-center gap-2 shadow-2xs font-medium cursor-pointer transition-all"
                      >
                        <span className="truncate max-w-[150px]">
                          {STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-56 p-1.5 bg-white dark:bg-[#14211D] border border-[#D7DED9] dark:border-[#26372F] shadow-lg rounded-xl z-50 text-xs"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <DropdownMenuItem
                          key={opt.value}
                          onClick={() => setStatusFilter(opt.value)}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#1A2A24]"
                        >
                          <span>{opt.label}</span>
                          {statusFilter === opt.value && (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Sort Selector Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="h-8.5 px-3 py-1.5 text-xs bg-neutral-50/80 dark:bg-[#101C18] border border-[#D7DED9] dark:border-[#2B4237] hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-xl text-neutral-800 dark:text-neutral-200 flex items-center gap-2 shadow-2xs font-medium cursor-pointer transition-all"
                      >
                        <span className="truncate max-w-[160px]">
                          {SORT_OPTIONS.find((s) => s.value === sortOption)?.label}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-56 p-1.5 bg-white dark:bg-[#14211D] border border-[#D7DED9] dark:border-[#26372F] shadow-lg rounded-xl z-50 text-xs"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <DropdownMenuItem
                          key={opt.value}
                          onClick={() => setSortOption(opt.value)}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#1A2A24]"
                        >
                          <span>{opt.label}</span>
                          {sortOption === opt.value && (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Ledger Meta Counter */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-[#1E3029] text-xs text-neutral-600 dark:text-neutral-400">
                <span className="font-medium text-neutral-900 dark:text-white">
                  Active Creator Partnerships{" "}
                  <span className="text-neutral-500 font-normal">({filteredCreators.length} displayed)</span>
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-neutral-500">
                    Live POS Mesh: <strong className="text-neutral-800 dark:text-neutral-200 font-semibold">14 Active Terminals</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Creator Cards List */}
            <div className="space-y-3">
              {filteredCreators.length === 0 ? (
                <div className="bg-white dark:bg-[#14211D] rounded-2xl p-8 border border-dashed border-[#D7DED9] dark:border-[#26372F] text-center">
                  <Users className="w-8 h-8 text-neutral-400 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">No creators match your filters</p>
                  <p className="text-xs text-neutral-500 mt-1">Try resetting the search terms or platform criteria.</p>
                </div>
              ) : (
                filteredCreators.map((creator) => {
                  const isSelected = selectedCreator.id === creator.id;
                  return (
                    <article
                      key={creator.id}
                      onClick={() => setSelectedCreatorId(creator.id)}
                      className={`bg-white dark:bg-[#14211D] rounded-2xl p-5 border transition-all cursor-pointer relative shadow-xs hover:shadow-md ${
                        isSelected
                          ? "border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-500/20"
                          : "border-[#D7DED9]/90 dark:border-[#26372F] hover:border-neutral-400 dark:hover:border-neutral-600"
                      }`}
                    >
                      {/* Top Ribbons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              creator.tier === "Top Performer"
                                ? "bg-emerald-700 text-white shadow-2xs"
                                : "bg-neutral-100 dark:bg-[#1C2C25] text-neutral-800 dark:text-neutral-200"
                            }`}
                          >
                            {creator.tier}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 border ${
                              creator.status === "Active"
                                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                creator.status === "Active" ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                            />
                            {creator.status}
                          </span>
                          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                            {creator.locationAnchor}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-neutral-400 font-mono">ID: #{creator.id}</span>
                          {isSelected && (
                            <span
                              className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950"
                              title="Selected Creator"
                            />
                          )}
                        </div>
                      </div>

                      {/* Profile Main Row */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-[#1E3029]">
                        <div className="flex items-center gap-3.5">
                          {/* Initials Avatar */}
                          <div className="w-12 h-12 rounded-full ring-2 ring-emerald-500/30 overflow-hidden shrink-0 bg-emerald-100 dark:bg-[#16362C] flex items-center justify-center text-emerald-900 dark:text-emerald-200 font-bold font-headline text-lg">
                            {creator.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-headline font-bold text-base text-neutral-900 dark:text-white">
                                {creator.name}
                              </h3>
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                {creator.handle}
                              </span>
                              <BadgeCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            </div>
                            <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                              {creator.platforms.telegram && (
                                <span className="flex items-center gap-1 text-[#229ED9]">
                                  <Send className="w-3.5 h-3.5" />
                                  Telegram ({creator.platforms.telegram})
                                </span>
                              )}
                              {creator.platforms.tiktok && (
                                <span>TikTok ({creator.platforms.tiktok})</span>
                              )}
                              {creator.platforms.youtube && (
                                <span>YouTube ({creator.platforms.youtube})</span>
                              )}
                              <span>•</span>
                              <span className="text-neutral-500 font-mono">{creator.payoutWalletMasked}</span>
                            </div>
                          </div>
                        </div>

                        {/* Promo Code Pill with Copy */}
                        <div className="flex items-center gap-2 bg-neutral-50 dark:bg-[#101C18] border border-[#D7DED9] dark:border-[#2B4237] rounded-xl p-1.5 pl-3">
                          <div className="text-left">
                            <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-label block font-semibold">
                              Promo Code
                            </span>
                            <span className="font-mono font-bold text-xs text-neutral-900 dark:text-white tracking-wider">
                              {creator.promoCode}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(creator.promoCode, `code-${creator.id}`);
                            }}
                            className="p-1 rounded-lg text-neutral-500 hover:text-emerald-600 hover:bg-white dark:hover:bg-[#1A2A24] transition-colors cursor-pointer"
                            title="Copy Promo Code"
                          >
                            {copiedKey === `code-${creator.id}` ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3.5 text-xs">
                        <div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Attributed Sales</div>
                          <div className="font-bold text-neutral-950 dark:text-white font-mono text-sm mt-0.5">
                            {formatETB(creator.attributedSalesETB)}
                          </div>
                          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                            {creator.recordedOrders} recorded orders
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Telegram Clicks</div>
                          <div className="font-bold text-neutral-950 dark:text-white font-mono text-sm mt-0.5">
                            {creator.telegramClicks.toLocaleString()} clicks
                          </div>
                          <div className="text-[10px] text-neutral-600 dark:text-neutral-400">
                            {creator.conversionRatePercent}% conversion
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">In-Store POS Scans</div>
                          <div className="font-bold text-neutral-950 dark:text-white font-mono text-sm mt-0.5">
                            {creator.posScans} In-Store
                          </div>
                          <div className="text-[10px] text-neutral-600 dark:text-neutral-400 truncate">
                            {creator.posBranch}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Commission Cut</div>
                          <div className="font-bold text-emerald-700 dark:text-emerald-300 font-mono text-sm mt-0.5">
                            {formatETB(creator.commissionCutETB)}
                          </div>
                          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                            {creator.commissionRatePercent}% · {creator.payoutStatus}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2 text-xs text-neutral-600 dark:text-neutral-400">
              <span>Showing 1-{filteredCreators.length} of {allCreators.length} active creators</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled
                  className="px-2.5 py-1 rounded-lg border border-[#D7DED9] dark:border-[#2B4237] text-neutral-400 cursor-not-allowed text-xs"
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                >
                  1
                </button>
                <button
                  type="button"
                  disabled
                  className="px-2.5 py-1 rounded-lg border border-[#D7DED9] dark:border-[#2B4237] text-neutral-400 cursor-not-allowed text-xs"
                >
                  Next
                </button>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 2A-1. Omnichannel Attribution Performance & Benchmarks    */}
            {/* ========================================================= */}
            <div className="bg-white dark:bg-[#14211D] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#26372F] shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-[#1E3029]">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-headline font-bold text-sm text-neutral-900 dark:text-white">
                      Omnichannel Attribution Velocity &amp; Channel Benchmarks
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Cross-channel conversion velocity across Addis Ababa influencer touchpoints
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync (30D Mesh)
                </span>
              </div>

              {/* 3 Channel Benchmark Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Channel 1: Telegram Drops & Mini-App */}
                <div className="p-4 rounded-xl bg-neutral-50/70 dark:bg-[#101C18] border border-[#D7DED9]/70 dark:border-[#2B4237]/70 space-y-2.5 hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                      <Send className="w-3.5 h-3.5" />
                      Telegram Mini-App
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                      5.2% Conv
                    </span>
                  </div>
                  <div>
                    <div className="text-lg font-bold font-mono text-neutral-900 dark:text-white">
                      {formatETB(648842)}
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between mt-0.5">
                      <span>1,996 orders</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">+18.2% vs avg</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-neutral-200/60 dark:border-[#1E3029] text-[10px] text-neutral-400 flex justify-between">
                    <span>AOV: 325 ETB</span>
                    <span>15-min IP Dedup</span>
                  </div>
                </div>

                {/* Channel 2: In-Store Physical POS QR */}
                <div className="p-4 rounded-xl bg-neutral-50/70 dark:bg-[#101C18] border border-[#D7DED9]/70 dark:border-[#2B4237]/70 space-y-2.5 hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      <QrCode className="w-3.5 h-3.5" />
                      In-Store POS (QR)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                      3.9% Conv
                    </span>
                  </div>
                  <div>
                    <div className="text-lg font-bold font-mono text-neutral-900 dark:text-white">
                      {formatETB(436047)}
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between mt-0.5">
                      <span>1,344 orders</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">14 Active POS</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-neutral-200/60 dark:border-[#1E3029] text-[10px] text-neutral-400 flex justify-between">
                    <span>AOV: 324 ETB</span>
                    <span>Bole · Kazanchis</span>
                  </div>
                </div>

                {/* Channel 3: Direct Phone & Social Bio */}
                <div className="p-4 rounded-xl bg-neutral-50/70 dark:bg-[#101C18] border border-[#D7DED9]/70 dark:border-[#2B4237]/70 space-y-2.5 hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Direct Link &amp; Bio
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                      2.1% Conv
                    </span>
                  </div>
                  <div>
                    <div className="text-lg font-bold font-mono text-neutral-900 dark:text-white">
                      {formatETB(160961)}
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between mt-0.5">
                      <span>496 orders</span>
                      <span className="text-neutral-500">Steady volume</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-neutral-200/60 dark:border-[#1E3029] text-[10px] text-neutral-400 flex justify-between">
                    <span>AOV: 324 ETB</span>
                    <span>2-Way Normalized</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2B. RIGHT COLUMN: Selected Creator Deep Dive Panel (col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-[#14211D] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#26372F] shadow-xs space-y-5">
              {/* Creator Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-[#1E3029]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-[#16362C] flex items-center justify-center text-emerald-900 dark:text-emerald-200 font-bold font-headline text-base ring-2 ring-emerald-500/20">
                    {selectedCreator.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-headline font-bold text-sm text-neutral-900 dark:text-white">
                        {selectedCreator.name}
                      </h4>
                      <BadgeCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-xs text-neutral-500">{selectedCreator.handle}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Tier 1 Partner · Addis Anchor</p>
                  </div>
                </div>
                {selectedCreator.platforms.telegram && (
                  <a
                    href={`https://t.me/${selectedCreator.handle.replace("@", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl text-neutral-400 hover:text-blue-500 hover:bg-neutral-50 dark:hover:bg-[#1A2A24] transition-colors"
                    title="Open Telegram Profile"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Earned Commission Card */}
              <div className="bg-emerald-50/70 dark:bg-[#0D241E] border border-emerald-200/80 dark:border-[#1F4539] rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600 dark:text-emerald-200/80 font-medium">Earned Commission (30D)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                    {selectedCreator.commissionRatePercent}% Standard Rate
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-headline text-neutral-900 dark:text-white font-mono">
                    {formatETB(selectedCreator.commissionCutETB)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Ready for Payout
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  Auto-disbursement scheduled via {selectedCreator.payoutMethod} Gateway on Nov 1, 2026.
                </p>
              </div>

              {/* Unique Attribution Link */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider block font-label">
                  Unique Attribution Tracking Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={selectedCreator.trackingLink}
                    className="flex-1 px-3 py-1.5 bg-neutral-50 dark:bg-[#101C18] border border-[#D7DED9] dark:border-[#2B4237] rounded-xl text-xs font-mono text-neutral-800 dark:text-neutral-200 truncate focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedCreator.trackingLink, `link-${selectedCreator.id}`)}
                    className="px-3 py-1.5 bg-white dark:bg-[#1B2B25] border border-[#D7DED9] dark:border-[#2B4237] hover:bg-neutral-100 dark:hover:bg-[#20362E] text-xs font-medium text-neutral-800 dark:text-neutral-200 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copiedKey === `link-${selectedCreator.id}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-neutral-400">
                  Redirects to campaign Telegram bot with automated session token injection.
                </p>
              </div>

              {/* Retail Cashier Promo Voucher */}
              <div className="bg-neutral-50 dark:bg-[#101C18] border border-[#D7DED9] dark:border-[#2B4237] rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-white">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>Retail Cashier Promo Voucher</span>
                  </div>
                  <span className="font-mono font-bold text-xs bg-white dark:bg-[#1B2B25] px-2 py-0.5 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white">
                    {selectedCreator.promoCode}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-neutral-400 text-[10px] block">Customer Perk:</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {selectedCreator.shopperPerkPercent}% Shopper perk
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[10px] block">Creator Cut:</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {selectedCreator.commissionRatePercent}% Creator payout
                    </span>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-neutral-200/60 dark:border-[#1E3029] text-[10px] text-neutral-500 flex items-center justify-between">
                  <span>Settlement Wallet:</span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300">
                    {selectedCreator.payoutMethod} ({selectedCreator.payoutWalletMasked})
                  </span>
                </div>
              </div>

              {/* Attribution Channel Split Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    Attribution Channel Split
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {selectedCreator.recordedOrders} Total Orders
                  </span>
                </div>
                <div className="h-2 w-full bg-neutral-100 dark:bg-[#20362E] rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${selectedCreator.channelSplit.telegramPercent}%` }}
                    title={`Telegram: ${selectedCreator.channelSplit.telegramPercent}%`}
                  />
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${selectedCreator.channelSplit.posPercent}%` }}
                    title={`POS Scans: ${selectedCreator.channelSplit.posPercent}%`}
                  />
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${selectedCreator.channelSplit.directPercent}%` }}
                    title={`Direct Web: ${selectedCreator.channelSplit.directPercent}%`}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {selectedCreator.channelSplit.telegramPercent}% Telegram
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {selectedCreator.channelSplit.posPercent}% POS Scans
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {selectedCreator.channelSplit.directPercent}% Direct
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <a
                  href={`https://t.me/${selectedCreator.handle.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Message on Telegram ({selectedCreator.handle})</span>
                </a>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => toast.info(`Commission rate adjustment dialog opened for ${selectedCreator.name}`)}
                    className="py-1.5 px-3 rounded-xl border border-[#D7DED9] dark:border-[#2B4237] hover:bg-neutral-50 dark:hover:bg-[#1A2A24] text-neutral-800 dark:text-neutral-200 text-xs font-medium transition-colors cursor-pointer text-center"
                  >
                    Adjust Rate
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.warning(`Link paused for ${selectedCreator.name}`)}
                    className="py-1.5 px-3 rounded-xl border border-[#D7DED9] dark:border-[#2B4237] hover:bg-neutral-50 dark:hover:bg-[#1A2A24] text-neutral-800 dark:text-neutral-200 text-xs font-medium transition-colors cursor-pointer text-center"
                  >
                    Pause Link
                  </button>
                </div>
              </div>

              {/* Local Merchant Tip */}
              <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 rounded-xl p-3 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">💡</span>
                <p>
                  <strong>Merchant Tip:</strong> Creators driving Telegram sales convert <strong>3.2x faster</strong> when in-store physical tasting vouchers are paired with their unique QR codes.
                </p>
              </div>
            </div>

            {/* Live Creator Attribution Stream (Eliminates Right-Side Empty Void) */}
            <div className="bg-white dark:bg-[#14211D] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#26372F] shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-[#1E3029]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-neutral-900 dark:text-white">
                    Live Attribution Stream
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
                  4ms sync
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: "TX-9021",
                    creator: "Dawit T.",
                    handle: "@habesha_tech",
                    channel: "In-Store POS (QR)",
                    branch: "Bole Flagship",
                    amount: 2800,
                    cut: 280,
                    time: "2m ago",
                    payment: "Telebirr",
                  },
                  {
                    id: "TX-9018",
                    creator: "Meron B.",
                    handle: "@ethio_lifestyle",
                    channel: "Telegram Bot",
                    branch: "Delivery / Bot",
                    amount: 1450,
                    cut: 145,
                    time: "9m ago",
                    payment: "CBE Birr",
                  },
                  {
                    id: "TX-9014",
                    creator: "Bethlehem G.",
                    handle: "@sheba_vibes",
                    channel: "Retail Voucher",
                    branch: "Bole Roastery",
                    amount: 920,
                    cut: 92,
                    time: "18m ago",
                    payment: "Telebirr",
                  },
                  {
                    id: "TX-9009",
                    creator: "Selamawit A.",
                    handle: "@addis_artisan",
                    channel: "Direct Phone / Maps",
                    branch: "Kazanchis Hub",
                    amount: 3400,
                    cut: 340,
                    time: "31m ago",
                    payment: "Telebirr",
                  },
                ].map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-neutral-50/70 dark:bg-[#101C18] border border-[#D7DED9]/60 dark:border-[#2B4237]/60 flex items-center justify-between text-xs transition-colors hover:border-emerald-500/40"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-neutral-900 dark:text-white font-headline">
                          {tx.creator}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">{tx.handle}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                        <span>{tx.channel}</span>
                        <span>&bull;</span>
                        <span>{tx.branch}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className="font-bold font-mono text-neutral-900 dark:text-white text-xs block">
                        +{formatETB(tx.amount)}
                      </span>
                      <div className="flex items-center justify-end gap-1 text-[10px]">
                        <span className="text-emerald-700 dark:text-emerald-400 font-mono font-medium">
                          Cut: {formatETB(tx.cut)}
                        </span>
                        <span className="text-neutral-400">&bull; {tx.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settlement & Payout Schedule Module */}
            <div className="bg-white dark:bg-[#14211D] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#26372F] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-[#1E3029]">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-neutral-900 dark:text-white">
                    Commission Payout Schedule
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 font-medium">Nov 1, 2026 Cycle</span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">Total Accrued Payout</span>
                    <span className="text-lg font-bold font-mono font-headline text-neutral-900 dark:text-white">
                      {formatETB(124580)}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Calculated from verified in-store POS scans and Telegram bot voucher redemptions.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-neutral-100 dark:border-[#1E3029]">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-neutral-600 dark:text-neutral-400 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Telebirr Instant Payouts (68%)
                      </span>
                      <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                        {formatETB(84714.4)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 dark:bg-[#20362E] rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[68%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-neutral-600 dark:text-neutral-400 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        CBE Birr Corporate Direct (32%)
                      </span>
                      <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                        {formatETB(39865.6)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 dark:bg-[#20362E] rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 w-[32%]" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="w-full py-2 px-3 rounded-xl border border-[#D7DED9] dark:border-[#2B4237] hover:bg-neutral-50 dark:hover:bg-[#1A2A24] text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Export Payout Batch (CSV/TIN)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Regional Hotspots & Addis Commerce Attribution */}
            <div className="bg-white dark:bg-[#14211D] rounded-2xl p-5 border border-[#D7DED9]/90 dark:border-[#26372F] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-[#1E3029]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-neutral-900 dark:text-white">
                    Addis Regional Hotspots
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">3 Outlets</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-[#101C18] border border-[#D7DED9]/50 dark:border-[#2B4237]/50">
                  <div className="space-y-0.5">
                    <span className="font-bold font-headline text-neutral-900 dark:text-white block">
                      Bole Medhanialem Flagship
                    </span>
                    <span className="text-[10px] text-neutral-400">Telegram QR &bull; 14 Terminals</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">58% Share</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-[#101C18] border border-[#D7DED9]/50 dark:border-[#2B4237]/50">
                  <div className="space-y-0.5">
                    <span className="font-bold font-headline text-neutral-900 dark:text-white block">
                      Kazanchis Tech Corridor
                    </span>
                    <span className="text-[10px] text-neutral-400">Mini-App Deep Link &bull; 8 Terminals</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">24% Share</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-[#101C18] border border-[#D7DED9]/50 dark:border-[#2B4237]/50">
                  <div className="space-y-0.5">
                    <span className="font-bold font-headline text-neutral-900 dark:text-white block">
                      Piassa Heritage Roastery
                    </span>
                    <span className="text-[10px] text-neutral-400">Physical Tasting &bull; 6 Terminals</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">18% Share</span>
                </div>
              </div>

              {/* Regional Summary Footer for balanced baseline alignment */}
              <div className="pt-2.5 border-t border-neutral-100 dark:border-[#1E3029] flex items-center justify-between text-[11px] text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Total Regional Mesh
                </span>
                <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">28 Active Terminals</span>
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
            <span className="hover:underline cursor-pointer">Telegram Support Mesh</span>
            <span>•</span>
            <Link href="/privacy" className="hover:underline">Privacy Policy &amp; Telemetry</Link>
          </div>
          <p className="text-[10px] text-neutral-400">
            &copy; {new Date().getFullYear()} EthioLink creator attribution platform. Bole, Addis Ababa, Ethiopia.
          </p>
        </footer>
      </div>

      {/* Invite / Add Creator Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#14211D] border border-[#D7DED9] dark:border-[#26372F] rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-[#1E3029]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="font-headline font-bold text-base text-neutral-900 dark:text-white">
                  Invite &amp; Onboard Creator
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCreatorSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Creator Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCreatorName}
                  onChange={(e) => setNewCreatorName(e.target.value)}
                  placeholder="e.g. Meron Bekele"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#101C18] border border-[#D7DED9] dark:border-[#2B4237] rounded-xl text-neutral-900 dark:text-white focus:border-emerald-600 focus:ring-0"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Phone Number (Ethiopian format) *
                </label>
                <input
                  type="tel"
                  required
                  value={newCreatorPhone}
                  onChange={(e) => setNewCreatorPhone(e.target.value)}
                  placeholder="+251 91 123 4567"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#101C18] border border-[#D7DED9] dark:border-[#2B4237] rounded-xl text-neutral-900 dark:text-white focus:border-emerald-600 focus:ring-0 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Telegram Handle
                  </label>
                  <input
                    type="text"
                    value={newCreatorTelegram}
                    onChange={(e) => setNewCreatorTelegram(e.target.value)}
                    placeholder="@handle"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#101C18] border border-[#D7DED9] dark:border-[#2B4237] rounded-xl text-neutral-900 dark:text-white focus:border-emerald-600 focus:ring-0"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Custom Promo Code
                  </label>
                  <input
                    type="text"
                    value={newCreatorPromo}
                    onChange={(e) => setNewCreatorPromo(e.target.value.toUpperCase())}
                    placeholder="e.g. MERON15"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#101C18] border border-[#D7DED9] dark:border-[#2B4237] rounded-xl text-neutral-900 dark:text-white focus:border-emerald-600 focus:ring-0 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Assign Campaign
                  </label>
                  <div className="relative">
                    <select
                      value={newCreatorCampaign}
                      onChange={(e) => setNewCreatorCampaign(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 pr-9 bg-neutral-50 dark:bg-[#101C18] border border-[#D7DED9] dark:border-[#2B4237] rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:focus:ring-emerald-400 transition-colors cursor-pointer"
                    >
                      {campaigns.length > 0 ? (
                        campaigns.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))
                      ) : (
                        <option value="Sheba Artisan Coffee Spring Roasts">Sheba Artisan Coffee Spring Roasts</option>
                      )}
                    </select>
                    <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Commission (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newCreatorCommission}
                    onChange={(e) => setNewCreatorCommission(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#101C18] border border-[#D7DED9] dark:border-[#2B4237] rounded-xl text-neutral-900 dark:text-white focus:border-emerald-600 focus:ring-0 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-[#1E3029] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D7DED9] dark:border-[#2B4237] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#1A2A24] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-xs"
                >
                  Send Creator Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // If embedded in BrandDashboardView (SPA tab mode), return content directly
  if (embedded) {
    return content;
  }

  // Standalone page mode with BrandSidebar
  return (
    <div className="min-h-screen bg-[#F7F8F5] dark:bg-[#0D1714] text-[#202824] dark:text-[#F1F5F1] flex font-body antialiased transition-colors duration-150">
      {/* 1. Left SaaS Sidebar */}
      <BrandSidebar
        brandName={brandName}
        ownerName={ownerName}
        brandPhone={brandPhone}
        role={role}
        campaignCount={campaigns.length || 4}
        staffCount={0}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        creatorRoster={initialRoster}
        activeTab="creators"
        onTabChange={(tab) => {
          if (onNavigateTab) {
            onNavigateTab(tab);
          }
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* 2. Main Workspace */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
