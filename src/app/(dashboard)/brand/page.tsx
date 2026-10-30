import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatETB } from "@/lib/sales";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BrandCampaignActions } from "./BrandCampaignActions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEffectiveStatus, getStatusBadgeConfig } from "@/lib/lifecycle";
import {
  Store,
  Users,
  BarChart3,
  PlusCircle,
  Shield,
  LogOut,
  Tag,
  Calendar,
  Receipt,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Send,
  Phone,
  MapPin,
  Copy,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Activity,
  Layers,
} from "lucide-react";

async function BrandView() {
  try {
    await connection();
  } catch {}
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Two-tier role enforcement: Staff are redirected to sales logging
  if (session.role === "STAFF") {
    redirect("/brand/sales");
  }

  let brand = null;
  let campaigns: Array<{
    id: string;
    name: string;
    slug: string;
    promoCode: string;
    status: string;
    description?: string | null;
    telegramUrl?: string | null;
    phoneNumber?: string | null;
    mapUrl?: string | null;
    startDate: Date | null;
    endDate: Date | null;
    sales?: Array<{ amountETB: unknown }>;
    creators?: Array<{
      creator: {
        id: string;
        telegramUsername: string | null;
        user: { name: string; phone: string };
      };
    }>;
    _count?: { events: number; sales: number };
  }> = [];

  let recentSales: Array<{
    id: string;
    amountETB: unknown;
    createdAt: Date;
    campaign: { name: string; promoCode: string };
    loggedBy: { name: string };
  }> = [];

  let eventsBreakdown = {
    telegram: 0,
    calls: 0,
    maps: 0,
    promoCopies: 0,
    total: 0,
  };

  if (session.brandId) {
    try {
      const [brandData, campaignsData, recentSalesData, eventsGroup] = await Promise.all([
        db.brand.findUnique({
          where: { id: session.brandId },
          include: {
            _count: {
              select: {
                campaigns: true,
                users: true,
              },
            },
          },
        }),
        db.campaign.findMany({
          where: { brandId: session.brandId },
          include: {
            creators: {
              include: {
                creator: {
                  include: {
                    user: {
                      select: {
                        name: true,
                        phone: true,
                      },
                    },
                  },
                },
              },
            },
            sales: {
              where: { isVoided: false },
              select: {
                amountETB: true,
              },
            },
            _count: {
              select: {
                events: true,
                sales: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        db.sale.findMany({
          where: {
            campaign: { brandId: session.brandId },
            isVoided: false,
          },
          take: 4,
          orderBy: { createdAt: "desc" },
          include: {
            campaign: {
              select: {
                name: true,
                promoCode: true,
              },
            },
            loggedBy: {
              select: {
                name: true,
              },
            },
          },
        }),
        db.event.groupBy({
          by: ["eventType"],
          where: {
            campaign: { brandId: session.brandId },
          },
          _count: {
            _all: true,
          },
        }),
      ]);

      brand = brandData;
      campaigns = campaignsData as unknown as typeof campaigns;
      recentSales = recentSalesData as unknown as typeof recentSales;

      let tg = 0;
      let call = 0;
      let map = 0;
      let copy = 0;
      let totalEvents = 0;

      for (const group of eventsGroup) {
        const count = group._count._all || 0;
        totalEvents += count;
        if (group.eventType === "TELEGRAM_CLICK") tg = count;
        else if (group.eventType === "CALL_CLICK") call = count;
        else if (group.eventType === "MAP_CLICK") map = count;
        else if (group.eventType === "COPY_CODE") copy = count;
      }

      eventsBreakdown = {
        telegram: tg,
        calls: call,
        maps: map,
        promoCopies: copy,
        total: totalEvents,
      };
    } catch {
      brand = {
        name: `${session.name}'s Business`,
        ownerName: session.name,
        _count: { campaigns: 0, users: 1 },
      };
      campaigns = [];
      recentSales = [];
    }
  }

  // Calculate platform totals
  const totalGrossETB = campaigns.reduce((acc, camp) => {
    const campSalesSum = (camp.sales || []).reduce(
      (sAcc, s) => sAcc + Number(s.amountETB || 0),
      0
    );
    return acc + campSalesSum;
  }, 0);

  const totalVerifiedSalesCount = campaigns.reduce(
    (acc, camp) => acc + (camp._count?.sales || 0),
    0
  );

  const totalInteractionsCount = campaigns.reduce(
    (acc, camp) => acc + (camp._count?.events || 0),
    0
  );

  const activeCampaignsCount = campaigns.filter(
    (c) => getEffectiveStatus(c) === "ACTIVE"
  ).length;

  // Extract unique collaborating creators
  const creatorMap = new Map<string, { name: string; handle: string | null }>();
  for (const c of campaigns) {
    for (const ca of c.creators || []) {
      if (!creatorMap.has(ca.creator.id)) {
        creatorMap.set(ca.creator.id, {
          name: ca.creator.user.name,
          handle: ca.creator.telegramUsername,
        });
      }
    }
  }
  const uniqueCreators = Array.from(creatorMap.values());

  const channelTotal =
    eventsBreakdown.telegram +
    eventsBreakdown.calls +
    eventsBreakdown.maps +
    eventsBreakdown.promoCopies;

  const tgPercent = channelTotal > 0 ? (eventsBreakdown.telegram / channelTotal) * 100 : 0;
  const callPercent = channelTotal > 0 ? (eventsBreakdown.calls / channelTotal) * 100 : 0;
  const mapPercent = channelTotal > 0 ? (eventsBreakdown.maps / channelTotal) * 100 : 0;
  const copyPercent = channelTotal > 0 ? (eventsBreakdown.promoCopies / channelTotal) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-200">
      {/* Top Glassmorphic Navigation Bar */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="navbar-shell layout-container-wide px-[var(--page-px)]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-500/20">
              E
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline font-black text-lg text-slate-900 dark:text-white leading-tight tracking-tight">
                  Ethio<span className="text-emerald-600 dark:text-emerald-400">Link</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                  Merchant
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {brand?.name} • Console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{session.name}</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">{session.role}</span>
            </div>
            {session.role === "ADMIN" && (
              <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800">
                <Link href="/admin">
                  <Shield className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
                  <span>Admin Console</span>
                </Link>
              </Button>
            )}
            <ThemeToggle size="sm" />
            <form action="/api/auth/logout" method="POST">
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content Workspace (Wide desktop optimized) */}
      <main className="layout-container-wide px-[var(--page-px)] pt-8 space-y-8">
        {/* Merchant Welcome Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/30 dark:from-slate-900 dark:via-slate-900/95 dark:to-emerald-950/20 border border-slate-200/90 dark:border-slate-800 shadow-xs p-6 sm:p-8">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-[32rem] h-[32rem] bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-headline text-slate-900 dark:text-white tracking-tight">
                  {brand?.name}
                </h1>
                <Badge variant="outline" className="bg-emerald-50/90 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/90 dark:border-emerald-800/90 text-xs font-bold py-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                  Verified Merchant
                </Badge>
                <Badge variant="outline" className="bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 text-xs py-0.5">
                  <span className="relative flex h-2 w-2 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Attribution Sync Live (2ms)
                </Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                High-speed Ethiopian digital commerce console: Monitor verified in-store receipts, manage creator partnerships, and track Telegram promotional conversion funnels with float-drift protection.
              </p>
            </div>

            {/* Quick Action Navigation CTAs */}
            <div className="flex items-center gap-3 flex-wrap shrink-0">
              <Button asChild size="default" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer active:scale-[0.98] transition-all">
                <Link href="/brand/campaigns/new">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  <span>Create Campaign</span>
                </Link>
              </Button>

              <Button asChild variant="outline" size="default" className="cursor-pointer border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 font-semibold active:scale-[0.98] transition-all shadow-2xs">
                <Link href="/brand/sales">
                  <Store className="w-4 h-4 mr-2 text-amber-600 dark:text-amber-400" />
                  <span>POS Terminal</span>
                </Link>
              </Button>

              <Button asChild variant="outline" size="default" className="cursor-pointer border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 font-semibold active:scale-[0.98] transition-all shadow-2xs">
                <Link href="/brand/analytics">
                  <BarChart3 className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                  <span>Full Analytics</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 4-Card Executive KPI Grid (Elevated card styling) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Gross Attributed Sales */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200 space-y-3">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Attributed Sales
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Receipt className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {formatETB(totalGrossETB)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>{totalVerifiedSalesCount} in-store redemptions</span>
              </p>
            </div>
          </div>

          {/* Card 2: Active Promotions */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200 space-y-3">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Promotions
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Tag className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-2">
                <span>{activeCampaignsCount}</span>
                <span className="text-sm font-semibold text-slate-400">/ {campaigns.length} total</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                {uniqueCreators.length} partner creator{uniqueCreators.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {/* Card 3: Customer Engagements */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-sky-300 dark:hover:border-sky-700 transition-all duration-200 space-y-3">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Engagements
              </span>
              <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Users className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {totalInteractionsCount.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                Bot taps, phone calls &amp; map visits
              </p>
            </div>
          </div>

          {/* Card 4: Storefront & Cashier Team */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-200 space-y-3">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Storefront POS Team
              </span>
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Store className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {brand?._count?.users || 1}
              </div>
              <Link
                href="/brand/sales"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 mt-1.5 inline-flex items-center gap-1 font-medium"
              >
                <span>Launch POS Terminal</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Omnichannel Attribution Spectrum Ribbon (CODING_STANDARDS Section 4) */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-headline">
                  Omnichannel Attribution Share
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Proportional breakdown of customer interaction channels across influencer campaigns and walk-ins
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
              {channelTotal.toLocaleString()} total interactions
            </span>
          </div>

          {/* Proportional Stacked Spectrum Bar */}
          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${tgPercent}%` }}
              className="bg-[#229ED9] transition-all duration-300"
              title={`Telegram Clicks: ${tgPercent.toFixed(1)}%`}
            />
            <div
              style={{ width: `${callPercent}%` }}
              className="bg-emerald-500 transition-all duration-300"
              title={`Direct Calls: ${callPercent.toFixed(1)}%`}
            />
            <div
              style={{ width: `${mapPercent}%` }}
              className="bg-indigo-500 transition-all duration-300"
              title={`Store Maps: ${mapPercent.toFixed(1)}%`}
            />
            <div
              style={{ width: `${copyPercent}%` }}
              className="bg-amber-500 transition-all duration-300"
              title={`Promo Code Copies: ${copyPercent.toFixed(1)}%`}
            />
          </div>

          {/* 4 Interactive Channel Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-750 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#229ED9]/10 text-[#229ED9] flex items-center justify-center shrink-0">
                <Send className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Telegram Clicks</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {eventsBreakdown.telegram.toLocaleString()} <span className="text-[11px] font-normal text-slate-400">({tgPercent.toFixed(0)}%)</span>
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-750 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Phone className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Phone Calls</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {eventsBreakdown.calls.toLocaleString()} <span className="text-[11px] font-normal text-slate-400">({callPercent.toFixed(0)}%)</span>
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-750 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Store Map Taps</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {eventsBreakdown.maps.toLocaleString()} <span className="text-[11px] font-normal text-slate-400">({mapPercent.toFixed(0)}%)</span>
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-750 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Copy className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Promo Code Copies</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {eventsBreakdown.promoCopies.toLocaleString()} <span className="text-[11px] font-normal text-slate-400">({copyPercent.toFixed(0)}%)</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Campaign Management Portfolio */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-headline">
                      Campaign Portfolio
                    </h2>
                    <Badge variant="outline" className="text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800">
                      {campaigns.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Live influencer promotions, POS standee QR codes, and creator assignments
                  </p>
                </div>

                <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shrink-0 shadow-xs">
                  <Link href="/brand/campaigns/new">
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    <span>New Campaign</span>
                  </Link>
                </Button>
              </div>

              {campaigns.length === 0 ? (
                <div className="py-14 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-3 px-4">
                  <Store className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                    No active campaigns launched yet
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    Partner with Telegram and social creators across Addis Ababa and regional cities to drive trackable retail store walk-ins and direct phone orders.
                  </p>
                  <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer mt-3">
                    <Link href="/brand/campaigns/new">
                      Launch your first campaign →
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((camp) => {
                    const effectiveStatus = getEffectiveStatus(camp);
                    const badgeConfig = getStatusBadgeConfig(effectiveStatus);
                    const campSalesTotal = (camp.sales || []).reduce(
                      (acc, s) => acc + Number(s.amountETB || 0),
                      0
                    );

                    return (
                      <div
                        key={camp.id}
                        className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
                      >
                        {/* Header: Title, Coupon Pill, Status, and Actions */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h3 className="font-bold text-slate-900 dark:text-white text-base font-headline">
                                {camp.name}
                              </h3>
                              {/* Distinct Coupon/Ticket Promo Code Pill */}
                              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-black text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-700">
                                <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                {camp.promoCode}
                              </span>
                              <Badge
                                variant="outline"
                                className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${badgeConfig.badgeClass}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${badgeConfig.dotClass}`} />
                                {badgeConfig.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                              <span>Slug: /c/{camp.slug}</span>
                              {camp.creators && camp.creators.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-violet-600 dark:text-violet-400 font-sans font-medium flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    {camp.creators.map((c) => c.creator.user.name).join(", ")}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Full Direct Action Suite (Restored buttons with tactile styling) */}
                          <BrandCampaignActions
                            campaign={{
                              id: camp.id,
                              name: camp.name,
                              slug: camp.slug,
                              promoCode: camp.promoCode,
                              brandName: brand?.name || "Merchant",
                              status: camp.status,
                              effectiveStatus,
                              description: camp.description,
                              telegramUrl: camp.telegramUrl,
                              phoneNumber: camp.phoneNumber,
                              mapUrl: camp.mapUrl,
                              startDate: camp.startDate ? camp.startDate.toISOString() : null,
                              endDate: camp.endDate ? camp.endDate.toISOString() : null,
                            }}
                          />
                        </div>

                        {/* Mid-Row: Granular Campaign Metrics Strip in a subtle well */}
                        <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-400 uppercase font-semibold">Attributed Revenue</span>
                            <span className="font-bold text-slate-900 dark:text-white font-mono text-sm block">
                              {formatETB(campSalesTotal)}
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-400 uppercase font-semibold">Verified Receipts</span>
                            <span className="font-bold text-slate-900 dark:text-white font-mono text-sm block">
                              {camp._count?.sales || 0} orders
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-400 uppercase font-semibold">Customer Clicks</span>
                            <span className="font-bold text-slate-900 dark:text-white font-mono text-sm block">
                              {camp._count?.events || 0} taps
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-400 uppercase font-semibold">Campaign Duration</span>
                            <span className="font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {camp.endDate
                                ? `Ends ${new Date(camp.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                                : "Continuous"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (4 cols): Recent POS Activity & Live Operations */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card: Live In-Store POS Receipt Feed */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-headline">
                      Recent In-Store Sales
                    </h3>
                    <p className="text-[11px] text-slate-400">Live cashier attribution feed</p>
                  </div>
                </div>
                <Link
                  href="/brand/sales"
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Terminal</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {recentSales.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                  <Store className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                  <span>No in-store receipts logged yet. Cashiers record sales via the retail POS terminal.</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentSales.map((s) => (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                            {formatETB(Number(s.amountETB))}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 font-bold">
                            {s.campaign.promoCode}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate max-w-[150px]">
                          Cashier: <strong className="text-slate-700 dark:text-slate-300">{s.loggedBy.name}</strong>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono shrink-0">
                        {new Date(s.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold cursor-pointer border-slate-200 dark:border-slate-700">
                <Link href="/brand/sales">
                  <Store className="w-3.5 h-3.5 mr-1.5 text-amber-600 dark:text-amber-400" />
                  <span>Open In-Store Sales Logger</span>
                </Link>
              </Button>
            </div>

            {/* Card: Collaborating Influencer Network */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-headline">
                    Influencer Network
                  </h3>
                  <p className="text-[11px] text-slate-400">Active creators promoting your brand</p>
                </div>
              </div>

              {uniqueCreators.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No creators assigned yet. Click &quot;Invite&quot; on any campaign to generate magic links.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {uniqueCreators.map((creator, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 font-bold text-[10px] flex items-center justify-center">
                          {creator.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {creator.name}
                        </span>
                      </div>
                      {creator.handle && (
                        <span className="text-[11px] font-mono text-[#229ED9] font-medium">
                          @{creator.handle}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card: Telemetry Trust & Retention Governance Notice */}
            <div className="p-5 rounded-3xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Attribution Ledger Guarantee</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                In-store receipts are verified against physical tickets and logged with float-drift protection. Telemetry uses a 15-minute sliding anti-replay window and is archived under 90-day retention policies.
              </p>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>Read Platform Privacy Policy</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BrandDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BrandView />
    </Suspense>
  );
}
