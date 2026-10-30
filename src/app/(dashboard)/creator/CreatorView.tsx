"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { formatETB } from "@/lib/sales";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { CampaignShareModal } from "@/components/campaign/CampaignShareModal";
import { generateTelegramShareUrl, formatCampaignShareText } from "@/lib/qr";
import type { CreatorPortalResponse } from "@/app/api/creator/campaigns/route";
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
} from "lucide-react";
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
  const { creator, summary, campaigns, recentActivity = [] } = initialData;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "am">("en");
  const [selectedCampaignFilter, setSelectedCampaignFilter] = useState<string>("all");
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
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard", err);
    }
  };

  const filteredActivity = useMemo(() => {
    if (selectedCampaignFilter === "all") return recentActivity;
    return recentActivity.filter((act) => act.campaignSlug === selectedCampaignFilter);
  }, [recentActivity, selectedCampaignFilter]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-body antialiased pb-20 selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="navbar-shell max-w-4xl mx-auto gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-xs"
            >
              EL
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline font-bold text-base text-slate-900 dark:text-white tracking-tight">
                  Creator Portal
                </h1>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Verified Partner
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {creator.name} {creator.telegramUsername && `(@${creator.telegramUsername})`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setLang("am")}
                className={`px-2.5 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${
                  lang === "am" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                አማ
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-2.5 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${
                  lang === "en" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                EN
              </button>
            </div>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-[var(--page-px)] py-6 space-y-6">
        {/* Creator Profile Summary Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg border-2 border-emerald-400">
              {creator.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-bold text-sm text-slate-900 dark:text-white">
                  {creator.name}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  Verified Influencer
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Addis Ababa &bull; Promotional Attribution Partner
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-Time Campaign Attribution Active</span>
          </div>
        </div>

        {/* Promotional Attribution Impact Hero Card (PRD FR-034 & FR-036) */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden space-y-6">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-emerald-700/50 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                Promotional Attribution Impact
              </span>
              <div className="font-mono font-black text-3xl sm:text-4xl text-white tracking-tight mt-1">
                {formatETB(summary.totalRevenueETB)}
              </div>
              <p className="text-xs text-emerald-200 mt-1">
                Driven across {summary.salesCount} verified in-store redemptions &amp; {campaigns.length} assigned campaigns
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 px-3 py-1.5 rounded-xl">
                <span>{summary.salesConversionRate}% Blended CVR</span>
              </div>
              <button
                type="button"
                onClick={() => setIsReportIssueOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer shadow-2xs"
                title="Report Campaign Discrepancy or Link Downtime to Ops"
              >
                <LifeBuoy className="w-3.5 h-3.5 text-amber-300" />
                <span>Report Discrepancy</span>
              </button>
            </div>
          </div>

          {/* PRD FR-036 Non-Financial Policy Transparency Box */}
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700/40 text-xs text-emerald-200 flex items-start gap-2.5 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Attribution Transparency (PRD FR-036):</strong> EthioLink measures marketing attribution and in-store customer engagement for brand partners. In-app wallets, simulated balances, and automated withdrawals are excluded. Commercial partner compensation and creator payouts are handled directly by business partners per off-platform agreements.
            </div>
          </div>

          {/* 4 Impact Dimensions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-emerald-300">In-Store Orders:</span>
              <div className="font-mono font-bold text-base text-white mt-0.5">
                {summary.salesCount.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-emerald-300">Average Order (AOV):</span>
              <div className="font-mono font-bold text-base text-white mt-0.5">
                {formatETB(summary.aovETB)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-emerald-300">Action Intent Taps:</span>
              <div className="font-mono font-bold text-base text-white mt-0.5">
                {summary.totalClicks.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-emerald-300">Audience CTR:</span>
              <div className="font-mono font-bold text-base text-white mt-0.5">
                {summary.clickThroughRate}%
              </div>
            </div>
          </div>
        </div>

        {/* 4-Card Performance Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Active Campaigns
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {campaigns.length}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Brand partnerships</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Link Visits
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-2">
              {summary.pageViews.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Total page impressions</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Action Intent Clicks
            </span>
            <div className="text-2xl font-black font-mono text-sky-700 dark:text-sky-400 mt-2">
              {summary.totalClicks.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Telegram &amp; phone taps</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Attributed Sales
            </span>
            <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-2">
              {summary.salesCount.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Verified redemptions</span>
          </div>
        </div>

        {/* PRD FR-035: Recent Audience Activity & Redemptions Feed */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="font-headline font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Recent Audience Activity &amp; Redemptions</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time chronological stream of customer actions attributed to your campaign links and promo codes
              </p>
            </div>

            {campaigns.length > 1 && (
              <div className="flex items-center gap-2 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedCampaignFilter}
                  onChange={(e) => setSelectedCampaignFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="all">All Campaigns ({campaigns.length})</option>
                  {campaigns.map((c) => (
                    <option key={c.campaignId} value={c.slug}>
                      {c.campaignName} ({c.promoCode})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {filteredActivity.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
                <Activity className="w-5 h-5" />
              </div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                No audience activity recorded yet.
              </p>
              <p className="max-w-md mx-auto text-[11px]">
                Share your promo code and campaign link with your Telegram or social media audience to start generating tracked actions.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredActivity.map((act) => {
                const isSale = act.type === "SALE";
                return (
                  <div
                    key={act.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isSale ? (
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                          <Receipt className="w-4 h-4" />
                        </div>
                      ) : act.eventType === "TELEGRAM_CLICK" ? (
                        <div className="w-8 h-8 rounded-xl bg-[#229ED9]/10 text-[#229ED9] flex items-center justify-center">
                          <Send className="w-4 h-4" />
                        </div>
                      ) : act.eventType === "CALL_CLICK" ? (
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                          <Phone className="w-4 h-4" />
                        </div>
                      ) : act.eventType === "MAP_CLICK" ? (
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
                          <MapPin className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                          <Copy className="w-4 h-4" />
                        </div>
                      )}

                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {isSale ? (
                            <span>In-Store Redemption ({formatETB(act.amountETB || 0)})</span>
                          ) : act.eventType === "TELEGRAM_CLICK" ? (
                            <span>Telegram Channel Tap</span>
                          ) : act.eventType === "CALL_CLICK" ? (
                            <span>Direct Store Call</span>
                          ) : act.eventType === "MAP_CLICK" ? (
                            <span>Store Directions View</span>
                          ) : (
                            <span>Promo Code Copied</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{act.campaignName}</span>
                          <span>&bull;</span>
                          <span className="font-mono text-emerald-700 dark:text-emerald-400">{act.promoCode}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                      {formatRelativeTime(act.timestamp)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Campaigns & Share Tools */}
        <div className="space-y-4">
          <h2 className="font-headline font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Assigned Campaigns &amp; Omnichannel Share Tools</span>
          </h2>

          {campaigns.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
              You are not currently assigned to any active brand campaigns. Ask your merchant partner for an invite link.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {campaigns.map((camp) => {
                const landingUrl = `${origin}/c/${camp.slug}`;
                const isCopiedLink = copiedKey === `link-${camp.campaignId}`;
                const isCopiedCode = copiedKey === `code-${camp.campaignId}`;

                return (
                  <div
                    key={camp.campaignId}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            {camp.brandName}
                          </span>
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Active Campaign</span>
                        </div>
                        <h3 className="font-headline font-black text-xl text-slate-900 dark:text-white mt-1">
                          {camp.campaignName}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setSelectedShareCampaign({
                              id: camp.campaignId,
                              name: camp.campaignName,
                              slug: camp.slug,
                              promoCode: camp.promoCode,
                              brandName: camp.brandName,
                            })
                          }
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
                        >
                          <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>POS QR &amp; Share</span>
                        </button>
                        <Link
                          href={`/c/${camp.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800"
                        >
                          <span>Preview</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Share Cards: Tracking Link & Promo Code */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tracking Link Card */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Your Direct Attribution Link
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={landingUrl}
                            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
                          />
                          <button
                            onClick={() => copyToClipboard(landingUrl, `link-${camp.campaignId}`)}
                            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all cursor-pointer shadow-xs"
                            title="Copy link"
                          >
                            {isCopiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <a
                            href={generateTelegramShareUrl(
                              landingUrl,
                              formatCampaignShareText(camp.campaignName, camp.brandName, camp.promoCode, lang)
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center"
                            title="Share to Telegram channel"
                          >
                            <Send className="w-4 h-4" />
                          </a>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Share this link in your Instagram bio, TikTok, or Telegram channel
                        </p>
                      </div>

                      {/* Promo Code Card */}
                      <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-dashed border-emerald-300 dark:border-emerald-800 space-y-2 text-center flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                            Your In-Store &amp; Online Promo Code
                          </span>
                          <div className="font-mono font-black text-2xl tracking-widest text-emerald-800 dark:text-emerald-300 mt-1 select-all">
                            {camp.promoCode}
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(camp.promoCode, `code-${camp.campaignId}`)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          {isCopiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopiedCode ? "Copied!" : "Copy Code"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Campaign Performance Summary Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400">Page Views:</span>
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {camp.metrics.pageViews.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Action Clicks:</span>
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {camp.metrics.totalClicks.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Attributed Orders:</span>
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {camp.metrics.salesCount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Attributed Gross:</span>
                        <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                          {formatETB(camp.metrics.totalRevenueETB)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Attribution Limitations & Methodology Transparency (PRD FR-025 / FR-029 / FR-036) */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs flex items-start gap-3 transition-colors">
          <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              EthioLink Attribution &amp; Verification Notice (PRD FR-025 / FR-029 / FR-036):
            </span>
            <p>
              Reported sales and campaign metrics reflect merchant-recorded in-store redemptions and digital checkout logs attributed to your promo code and campaign links. Funnel metrics represent aggregate promotional engagement rather than individual bank-cleared transactions. Payouts and commercial agreements are fulfilled directly by merchant partners off-platform.{" "}
              <Link href="/privacy" className="underline hover:text-emerald-600 dark:hover:text-emerald-400 font-medium">
                Learn more about our Data Retention &amp; Privacy Practices &rarr;
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* POS QR Code & Telegram Sharing Suite Modal */}
      <CampaignShareModal
        isOpen={!!selectedShareCampaign}
        onClose={() => setSelectedShareCampaign(null)}
        campaign={selectedShareCampaign}
        origin={origin}
      />

      {/* Operational Issue & Discrepancy Reporting Modal (PRD FR-040) */}
      <ReportIssueModal
        isOpen={isReportIssueOpen}
        onClose={() => setIsReportIssueOpen(false)}
        campaigns={campaigns.map((c) => ({
          id: c.campaignId,
          name: c.campaignName,
          promoCode: c.promoCode,
        }))}
      />
    </div>
  );
}
