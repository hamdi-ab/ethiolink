"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatETB } from "@/lib/sales";
import type { CreatorPortalResponse, CreatorCampaignItem } from "@/app/api/creator/campaigns/route";
import {
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  LogOut,
  Send,
  Phone,
  MapPin,
  Tag,
  Store,
  Eye,
  MousePointerClick,
  ShoppingBag,
  Info,
} from "lucide-react";

interface CreatorViewProps {
  initialData: CreatorPortalResponse;
  origin: string;
}

export function CreatorView({ initialData, origin }: CreatorViewProps) {
  const { creator, summary, campaigns } = initialData;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-500/20">
              E
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Creator Portal
                </h1>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Influencer
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Welcome back, {creator.name} {creator.telegramUsername && `(@${creator.telegramUsername})`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* FR-036 Financial Disclaimer Banner */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Attribution Disclosure:</span> Attributed sales and gross ETB revenue
            reflect in-store and direct merchant transactions attributed to your promotional code. EthioLink
            provides performance intelligence; brand partnerships and compensation arrangements are managed
            directly with your brand merchant.
          </div>
        </div>

        {/* Global Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Campaigns</span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{summary.totalCampaigns}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Active brand partnerships</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Views</span>
              <Eye className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{summary.pageViews}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {summary.uniqueVisitors} unique visitors
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Action Clicks</span>
              <MousePointerClick className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{summary.totalClicks}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {summary.clickThroughRate}% Click-Through Rate
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Attributed Sales</span>
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{formatETB(summary.totalRevenueETB)}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {summary.salesCount} in-store purchases
            </span>
          </div>
        </div>

        {/* Assigned Campaigns Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Assigned Campaigns ({campaigns.length})
            </h2>
            <span className="text-xs text-slate-400">Live campaign tracking</span>
          </div>

          {campaigns.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No campaigns assigned yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                When an Ethiopian merchant invites you to promote their products, your active campaigns and tracking links will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {campaigns.map((camp: CreatorCampaignItem) => {
                const trackingUrl = `${origin}/c/${camp.slug}`;
                const copyLinkKey = `link-${camp.campaignId}`;
                const copyCodeKey = `code-${camp.campaignId}`;

                return (
                  <div
                    key={camp.campaignId}
                    className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow space-y-6"
                  >
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <Store className="w-3 h-3" />
                            {camp.brandName}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              camp.status === "ACTIVE"
                                ? "bg-emerald-100/70 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {camp.status}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                          {camp.campaignName}
                        </h3>
                        {camp.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{camp.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Link
                          href={`/c/${camp.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-all"
                        >
                          <span>Preview Page</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Promotion Assets (Link & Promo Code) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tracking URL */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Your Campaign Tracking Link
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={trackingUrl}
                            className="bg-white border border-slate-200 text-xs font-mono text-slate-700 rounded-xl px-3 py-2 w-full outline-none select-all"
                          />
                          <button
                            type="button"
                            onClick={() => copyToClipboard(trackingUrl, copyLinkKey)}
                            className="shrink-0 flex items-center gap-1 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-xl transition-all cursor-pointer"
                          >
                            {copiedKey === copyLinkKey ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Share this link on your TikTok bio, Telegram channel, or Instagram story.
                        </p>
                      </div>

                      {/* Promo Code */}
                      <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/80 block">
                          Assigned In-Store Promo Code
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="bg-white border border-emerald-200 text-sm font-mono font-black text-emerald-900 rounded-xl px-3 py-2 w-full tracking-wide">
                            {camp.promoCode}
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(camp.promoCode, copyCodeKey)}
                            className="shrink-0 flex items-center gap-1 text-xs font-bold text-emerald-900 bg-emerald-200/70 hover:bg-emerald-300 px-3 py-2 rounded-xl transition-all cursor-pointer"
                          >
                            {copiedKey === copyCodeKey ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-800" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-emerald-700/80">
                          Customers present this promo code at checkout to trigger attributed sales.
                        </p>
                      </div>
                    </div>

                    {/* Funnel & Conversion Stats */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Performance Metrics
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[11px] text-slate-400 block mb-0.5">Landing Views</span>
                          <span className="text-base font-black text-slate-800">
                            {camp.metrics.pageViews}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            ({camp.metrics.uniqueVisitors} unique)
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[11px] text-slate-400 block mb-0.5">Action Taps</span>
                          <span className="text-base font-black text-slate-800">
                            {camp.metrics.totalClicks}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                            {camp.metrics.clickThroughRate}% CTR
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[11px] text-slate-400 block mb-0.5">Attributed Sales</span>
                          <span className="text-base font-black text-slate-800">
                            {camp.metrics.salesCount}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                            {camp.metrics.salesConversionRate}% Conv.
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                          <span className="text-[11px] text-emerald-700/80 block mb-0.5">Reported Revenue</span>
                          <span className="text-base font-black text-emerald-900">
                            {formatETB(camp.metrics.totalRevenueETB)}
                          </span>
                          <span className="text-[10px] text-emerald-700/80 block mt-0.5">
                            AOV: {formatETB(camp.metrics.aovETB)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Touchpoint Breakdown */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-[11px] font-semibold text-slate-400 mr-1">
                          Touchpoints:
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-100">
                          <Send className="w-3 h-3 text-sky-600" />
                          <span>Telegram: {camp.metrics.telegramClicks}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>Calls: {camp.metrics.callClicks}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-100">
                          <MapPin className="w-3 h-3 text-amber-600" />
                          <span>Maps: {camp.metrics.mapClicks}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-100">
                          <Tag className="w-3 h-3 text-purple-600" />
                          <span>Code Copies: {camp.metrics.copyCodeClicks}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
