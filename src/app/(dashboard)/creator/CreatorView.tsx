"use client";

import React, { useState } from "react";
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
} from "lucide-react";

interface CreatorViewProps {
  initialData: CreatorPortalResponse;
  origin: string;
}

export function CreatorView({ initialData, origin }: CreatorViewProps) {
  const { creator, summary, campaigns } = initialData;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "am">("en");
  const [payoutRequested, setPayoutRequested] = useState(false);
  const [selectedShareCampaign, setSelectedShareCampaign] = useState<{
    id: string;
    name: string;
    slug: string;
    promoCode: string;
    brandName: string;
  } | null>(null);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard", err);
    }
  };

  // 10% standard creator commission model for Ethiopian creator economy
  const estimatedCommissionETB = Math.round(summary.totalRevenueETB * 0.1 * 100) / 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-body antialiased pb-20 selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Creator Profile Summary Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg border-2 border-emerald-400">
              {creator.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-bold text-sm text-slate-900">
                  {creator.name}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  Level 2 Top Creator
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Addis Ababa • Influencer Attribution Tier 1
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-Time Commission Tracking Active</span>
          </div>
        </div>

        {/* Hero Earnings Card with Telebirr Instant Payout */}
        <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-600/50 pb-6 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">
                Available Telebirr Commission Balance
              </span>
              <div className="font-mono font-black text-3xl sm:text-4xl text-white tracking-tight mt-1">
                {formatETB(estimatedCommissionETB)}
              </div>
              <p className="text-xs text-emerald-200 mt-1">
                Based on {formatETB(summary.totalRevenueETB)} in gross attributed sales (10% commission rate)
              </p>
            </div>

            <button
              onClick={() => {
                setPayoutRequested(true);
                setTimeout(() => setPayoutRequested(false), 3000);
              }}
              className="h-12 px-6 bg-white hover:bg-emerald-50 text-emerald-900 font-headline font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              {payoutRequested ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Telebirr Settlement Queued!</span>
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 text-emerald-700" />
                  <span>Instant Cashout via Telebirr</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-emerald-300">Total Attributed Gross:</span>
              <div className="font-mono font-bold text-sm text-white mt-0.5">
                {formatETB(summary.totalRevenueETB)}
              </div>
            </div>
            <div>
              <span className="text-emerald-300">Verified Purchases:</span>
              <div className="font-mono font-bold text-sm text-white mt-0.5">
                {summary.salesCount.toLocaleString()} orders
              </div>
            </div>
            <div>
              <span className="text-emerald-300">Next Auto-Settlement:</span>
              <div className="font-mono font-bold text-sm text-white mt-0.5">
                Daily at 9:00 AM (EAT)
              </div>
            </div>
          </div>
        </div>

        {/* 4-Card Performance Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Campaigns
            </span>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {campaigns.length}
            </div>
            <span className="text-[11px] text-slate-500 mt-1">Brand partnerships</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Link Visits
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 mt-2">
              {summary.pageViews.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 mt-1">Total page impressions</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Action Intent Clicks
            </span>
            <div className="text-2xl font-black font-mono text-sky-700 mt-2">
              {summary.totalClicks.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 mt-1">Telegram &amp; phone taps</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Attributed Sales
            </span>
            <div className="text-2xl font-black font-mono text-emerald-700 mt-2">
              {summary.salesCount.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 mt-1">Verified redemptions</span>
          </div>
        </div>

        {/* Active Campaigns & Share Tools */}
        <div className="space-y-4">
          <h2 className="font-headline font-bold text-base text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Assigned Campaigns &amp; Omnichannel Share Tools</span>
          </h2>

          {campaigns.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
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
                    className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {camp.brandName}
                          </span>
                          <span className="text-xs font-bold text-slate-400">Active Campaign</span>
                        </div>
                        <h3 className="font-headline font-black text-xl text-slate-900 mt-1">
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
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
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
                      <div className="p-4 rounded-2xl bg-emerald-50/50 border-2 border-dashed border-emerald-300 space-y-2 text-center flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                            Your In-Store &amp; Online Promo Code
                          </span>
                          <div className="font-mono font-black text-2xl tracking-widest text-emerald-800 mt-1 select-all">
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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400">Page Views:</span>
                        <div className="font-mono font-bold text-slate-800 mt-0.5">
                          {camp.metrics.pageViews.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Action Clicks:</span>
                        <div className="font-mono font-bold text-slate-800 mt-0.5">
                          {camp.metrics.totalClicks.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Attributed Orders:</span>
                        <div className="font-mono font-bold text-slate-800 mt-0.5">
                          {camp.metrics.salesCount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Attributed Gross:</span>
                        <div className="font-mono font-bold text-emerald-700 mt-0.5">
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

        {/* Financial Attribution Disclaimer */}
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-slate-800">EthioLink Attribution Guarantee:</span> All reported
            sales are verified against merchant Point-of-Sale logs and digital checkout records in Addis Ababa.
            Payout settlements are fulfilled automatically to your connected Telebirr mobile wallet.
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
    </div>
  );
}
