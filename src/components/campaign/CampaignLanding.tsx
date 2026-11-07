"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Language, translations } from "@/lib/translations";
import {
  Send,
  Phone,
  MapPin,
  Copy,
  Check,
  CheckCircle2,
  Calendar,
  Sparkles,
  AlertCircle,
  Clock,
  ShieldCheck,
  Store,
  Compass,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import type { CampaignLifecycleStatus } from "@/lib/lifecycle";

export interface CampaignData {
  id: string;
  slug: string;
  name: string;
  promoCode: string;
  description: string | null;
  telegramUrl: string | null;
  phoneNumber: string | null;
  mapUrl: string | null;
  endDate: string | null;
  brand: {
    name: string;
    ownerName: string;
  };
  creators: Array<{
    creator: {
      telegramUsername: string | null;
      user: {
        name: string;
      };
    };
  }>;
}

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let vid = localStorage.getItem("ethiolink_vid");
    if (!vid) {
      vid =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `vid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("ethiolink_vid", vid);
      document.cookie = `ethiolink_vid=${vid}; path=/; max-age=31536000; SameSite=Lax`;
    }
    return vid;
  } catch {
    return `vid_${Date.now()}`;
  }
}

export function sendTelemetry(slug: string, eventType: string) {
  const visitorId = getOrCreateVisitorId();
  if (!visitorId) return;

  const payload = JSON.stringify({
    campaignSlug: slug,
    eventType,
    visitorId,
  });

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/events", blob);
  } else if (typeof fetch !== "undefined") {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }
}

export function CampaignLanding({ campaign }: { campaign: CampaignData }) {
  const [lang, setLang] = useState<Language>("am"); // Default to Amharic for Ethiopian market
  const [copied, setCopied] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    sendTelemetry(campaign.slug, "PAGE_VIEW");
  }, [campaign.slug]);

  const handleCopyCode = async () => {
    sendTelemetry(campaign.slug, "COPY_CODE");
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(campaign.promoCode);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const primaryCreator = campaign.creators?.[0]?.creator;
  const creatorUsername = primaryCreator?.telegramUsername || "ethio_lifestyle";
  const creatorDisplayName = primaryCreator?.user?.name || "Meron B.";

  // Extract telegram handle clean
  const telegramHandle = campaign.telegramUrl
    ? campaign.telegramUrl.replace(/^https?:\/\/t\.me\//, "").replace(/^@/, "")
    : "shebacoffee";

  const effectivePhone = campaign.phoneNumber || "+251 911 234 567";
  const effectiveMapUrl =
    campaign.mapUrl || "https://maps.google.com/?q=Bole+Medhanialem+Addis+Ababa";

  return (
    <div className="min-h-screen bg-[#F7F8F5] dark:bg-[#07120F] text-slate-900 dark:text-slate-100 font-body antialiased flex flex-col selection:bg-emerald-100 dark:selection:bg-emerald-900/50 selection:text-emerald-900 dark:selection:text-emerald-200 transition-colors duration-200">
      {/* Top App Bar Header */}
      <header className="bg-white/95 dark:bg-[#0E1D19]/95 backdrop-blur-md sticky top-0 z-50 border-b border-[#E5E7EB] dark:border-[#1A332C] shadow-xs transition-colors duration-200">
        <div className="w-full max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-headline font-black text-xl tracking-tight flex items-center gap-2 active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-[#102F2B] text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-emerald-600/30">
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 dark:text-white leading-none font-headline font-black text-lg">
                Ethio<span className="text-emerald-600 dark:text-emerald-400">Link</span>
              </span>
              <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
                የኢትዮጵያ ግብይት
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" />
            {/* Bilingual Language Switcher Pill */}
            <div className="flex items-center bg-slate-100 dark:bg-[#142923] p-0.5 rounded-full border border-slate-200 dark:border-[#1E3B33]">
              <button
                type="button"
                onClick={() => setLang("am")}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  lang === "am"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                አማ
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  lang === "en"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Campaign Container */}
      <main className="w-full max-w-md mx-auto px-4 pt-4 pb-12 flex-1 flex flex-col gap-4">
        {/* Creator Attribution Badge */}
        <div className="flex items-center justify-between bg-emerald-50/90 dark:bg-[#0E231D] border border-emerald-200/90 dark:border-[#1F453A] rounded-2xl px-3.5 py-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-[#102F2B] text-white flex items-center justify-center font-bold text-sm border-2 border-emerald-400 shadow-xs relative">
              <span>{creatorDisplayName.charAt(0)}</span>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0E231D] flex items-center justify-center">
                <Check className="w-2 h-2 text-white stroke-[3]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-bold text-xs text-slate-900 dark:text-white">
                  @{creatorUsername}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  ({creatorDisplayName})
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t.officialPartner}</span>
              </div>
            </div>
          </div>
          <div className="bg-white/90 dark:bg-[#142923] border border-emerald-200 dark:border-[#1F453A] px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 tracking-wider">
            {t.activeBadge.toUpperCase()}
          </div>
        </div>

        {/* Featured Campaign Hero Card */}
        <section className="bg-white dark:bg-[#0E1D19] rounded-2xl border border-slate-200/80 dark:border-[#1A332C] shadow-xs overflow-hidden flex flex-col">
          {/* Urgency Partner Banner */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-4 py-2 flex items-center justify-between text-slate-950 font-bold text-xs">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-extrabold">
              <Sparkles className="w-3.5 h-3.5" />
              {t.specialOfferBanner}
            </span>
            <span className="flex items-center gap-1 text-[10px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold">
              <Clock className="w-3 h-3 text-amber-400" />
              {campaign.endDate ? `${t.validUntil} ${new Date(campaign.endDate).toLocaleDateString()}` : t.expiresIn}
            </span>
          </div>

          <div className="p-5 flex flex-col gap-3.5">
            {/* Origin & Location Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-[#142923] px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-[#1F453A]">
                <span>🇪🇹</span>
                <span>Single Origin • Sidama &amp; Yirgacheffe</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#182C26] px-2.5 py-0.5 rounded-full">
                Bole Roastery
              </span>
            </div>

            {/* Campaign Title & Merchant */}
            <div>
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-0.5">
                {campaign.brand.name}
              </div>
              <h1 className="font-headline font-black text-2xl text-slate-900 dark:text-white tracking-tight leading-tight">
                {campaign.name}
              </h1>
            </div>

            {/* Description */}
            <p className="font-body text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {campaign.description ||
                "Special Spring Roast • Whole Bean & Ground (500g). Handcrafted in Addis Ababa with authentic roasting heritage."}
            </p>

            {/* Tasting Profile Pills */}
            <div className="bg-slate-50 dark:bg-[#12221E] rounded-xl p-3 border border-slate-100 dark:border-[#1A332C]">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                TASTING PROFILE &amp; NOTES
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white dark:bg-[#182C26] text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Jasmine Blossom
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white dark:bg-[#182C26] text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Bergamot Zest
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white dark:bg-[#182C26] text-amber-800 dark:text-amber-400 border border-amber-200/70 dark:border-amber-800/60 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  Wild Highland Honey
                </span>
              </div>
            </div>

            {/* Price Block */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 line-through block">
                  1,250.00 ETB
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline font-black text-2xl text-slate-900 dark:text-white">
                    1,000.00
                  </span>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    ETB
                  </span>
                </div>
              </div>

              <div className="bg-emerald-600 text-white font-headline font-black text-xs px-3 py-1.5 rounded-xl shadow-xs tracking-wider">
                SAVE 250 ETB
              </div>
            </div>
          </div>
        </section>

        {/* Promo Code Voucher Card */}
        <section className="border-2 border-dashed border-emerald-500/70 dark:border-emerald-500/50 bg-emerald-50/40 dark:bg-[#0c1a17] rounded-2xl p-5 text-center flex flex-col items-center gap-3 relative shadow-2xs">
          <div className="space-y-0.5">
            <span className="font-headline text-[11px] font-extrabold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
              {t.exclusiveVoucher}
            </span>
            <h2 className="font-headline font-black text-lg text-slate-900 dark:text-white">
              {t.voucherSub}
            </h2>
          </div>

          {/* High-Impact Code Display */}
          <div className="w-full bg-white dark:bg-[#12221E] border border-emerald-300 dark:border-[#1F453A] rounded-xl py-3 px-4 shadow-2xs flex items-center justify-center">
            <span className="font-mono font-black text-2xl sm:text-3xl tracking-widest text-emerald-700 dark:text-emerald-400 select-all">
              {campaign.promoCode}
            </span>
          </div>

          {/* One-Click Copy Action Button (48px Min Target) */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all duration-150 rounded-xl text-white font-headline font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>{t.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>{t.copyCode}</span>
              </>
            )}
          </button>

          <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{t.useOnlineOrInStore}</span>
          </p>
        </section>

        {/* Action Callout Channels (Omnichannel) */}
        <section className="flex flex-col gap-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.redeemOptions}
            </span>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              {t.instantPaths}
            </span>
          </div>

          {/* Channel 1: Telegram Order Funnel */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1D19] border border-slate-200/80 dark:border-[#1A332C] shadow-xs flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-[#229ED9] flex items-center justify-center flex-shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-slate-900 dark:text-white text-sm">
                    {t.telegramTitle}
                  </h3>
                  <span className="bg-sky-50 dark:bg-sky-950/60 text-[#229ED9] text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                    {t.telegramBadge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {t.telegramDesc}
                </p>
                <div className="text-[11px] text-[#229ED9] font-medium mt-1">
                  Channel: @{telegramHandle}
                </div>
              </div>
            </div>

            <a
              href={campaign.telegramUrl || `https://t.me/${telegramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sendTelemetry(campaign.slug, "TELEGRAM_CLICK")}
              className="w-full h-12 bg-[#229ED9] hover:bg-[#1E8EC4] text-white active:scale-[0.98] transition-all rounded-xl font-headline font-bold text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Order via Telegram (@{telegramHandle})</span>
            </a>

            <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
              <span>✓</span>
              <span>{t.paymentMethods}</span>
            </div>
          </div>

          {/* Channel 2: Direct Phone Line */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1D19] border border-slate-200/80 dark:border-[#1A332C] shadow-xs flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-[#1F453A] text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-slate-900 dark:text-white text-sm">
                    {t.roasteryLine}
                  </h3>
                  <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-[#1F453A]">
                    {t.fastestBadge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {t.roasteryDesc}
                </p>
                <div className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {effectivePhone}
                </div>
              </div>
            </div>

            <a
              href={`tel:${effectivePhone}`}
              onClick={() => sendTelemetry(campaign.slug, "CALL_CLICK")}
              className="w-full h-12 bg-white dark:bg-[#12221E] hover:bg-slate-50 dark:hover:bg-[#182C26] text-slate-900 dark:text-white border border-slate-300 dark:border-[#1F453A] active:scale-[0.98] transition-all rounded-xl font-headline font-bold text-sm flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Call Store Direct ({effectivePhone})</span>
            </a>
          </div>

          {/* Channel 3: Map Store Location (POS Walk-in) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1D19] border border-slate-200/80 dark:border-[#1A332C] shadow-xs flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-slate-900 dark:text-white text-sm">
                    {campaign.brand.name} Bole Flagship
                  </h3>
                  <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-[#1F453A] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t.openToday}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {t.storeAddress}
                </p>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{t.storeHours}</span>
                </div>
              </div>
            </div>

            <a
              href={effectiveMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sendTelemetry(campaign.slug, "MAP_CLICK")}
              className="w-full h-12 bg-white dark:bg-[#12221E] hover:bg-slate-50 dark:hover:bg-[#182C26] text-slate-900 dark:text-white border border-slate-300 dark:border-[#1F453A] active:scale-[0.98] transition-all rounded-xl font-headline font-bold text-sm flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.getDirections}</span>
            </a>

            {/* In-Store Redemption Notice Box */}
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <span className="font-bold text-amber-600 dark:text-amber-400 text-sm leading-none mt-0.5">
                ⓘ
              </span>
              <div>
                <span className="font-bold">In-Store Redemption:</span>{" "}
                <span>
                  Present code <strong className="font-mono">{campaign.promoCode}</strong> to the cashier prior to billing to claim your discount.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 100% Verified Guarantee Card */}
        <section className="bg-emerald-50/60 dark:bg-[#0B1A17] border border-emerald-200/70 dark:border-[#1E3B33] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1 font-headline font-bold text-xs text-slate-900 dark:text-white">
              <span>{t.verifiedGuarantee}</span>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
              {t.verifiedGuaranteeDesc}
            </p>
          </div>
        </section>

        {/* Security & Provenance Footer */}
        <footer className="mt-4 pt-6 border-t border-slate-200/80 dark:border-[#1A332C] text-center flex flex-col items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EthioLink Attribution Platform</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2 flex-wrap">
            <span>Verified Attribution Guarantee</span>
            <span>•</span>
            <span>Telegram Support</span>
            <span>•</span>
            <Link
              href="/privacy"
              className="underline hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            © 2026 EthioLink attribution platform. Bole, Addis Ababa, Ethiopia.
          </p>
        </footer>
      </main>
    </div>
  );
}

export interface CampaignConcludedProps {
  campaign: {
    name: string;
    brand: {
      name: string;
      ownerName: string;
    };
    phoneNumber?: string | null;
    telegramUrl?: string | null;
  };
  effectiveStatus: CampaignLifecycleStatus | string;
}

export function CampaignConcluded({
  campaign,
  effectiveStatus,
}: CampaignConcludedProps) {
  const [lang, setLang] = useState<Language>("am");
  const t = translations[lang];
  const isPaused = effectiveStatus === "PAUSED";

  return (
    <div className="min-h-screen bg-[#F7F8F5] dark:bg-[#07120F] text-slate-900 dark:text-slate-100 flex flex-col items-center px-4 py-6 sm:py-12 transition-colors duration-200">
      <header className="w-full max-w-md flex justify-between items-center mb-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
            EL
          </div>
          <span className="font-headline font-black text-lg tracking-tight text-slate-900 dark:text-white">
            Ethio<span className="text-emerald-600 dark:text-emerald-400">Link</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle size="sm" />
          <button
            type="button"
            data-testid="lang-toggle"
            onClick={() => setLang(lang === "en" ? "am" : "en")}
            className="flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-[#12221E] hover:bg-slate-50 dark:hover:bg-[#182C26] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1F453A] rounded-full px-3 py-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <span>{lang === "en" ? "አማርኛ" : "English"}</span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-md bg-white dark:bg-[#0E1D19] border border-slate-200/80 dark:border-[#1A332C] rounded-3xl shadow-sm p-6 sm:p-8 flex flex-col items-center text-center">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${
            isPaused
              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
              : "bg-slate-100 dark:bg-[#142923] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#1F453A]"
          }`}
        >
          {isPaused ? (
            <Clock className="w-8 h-8 text-amber-500" />
          ) : (
            <Calendar className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          )}
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-[#142923] px-3 py-1 rounded-full border border-emerald-200 dark:border-[#1F453A] mb-2">
          {campaign.brand.name}
        </span>

        <h1 className="font-headline text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
          {campaign.name}
        </h1>

        <h2 className="font-headline text-sm font-bold text-amber-700 dark:text-amber-400 mb-2">
          {isPaused ? t.pausedTitle : t.concludedTitle}
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          {isPaused ? t.pausedDesc : t.concludedDesc}
        </p>

        {(campaign.phoneNumber || campaign.telegramUrl) && (
          <div className="w-full pt-4 border-t border-slate-100 dark:border-[#1A332C] mb-6 space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              {t.contactStore}
            </p>
            {campaign.phoneNumber && (
              <a
                href={`tel:${campaign.phoneNumber}`}
                className="w-full h-11 bg-slate-50 dark:bg-[#12221E] hover:bg-slate-100 dark:hover:bg-[#182C26] text-slate-900 dark:text-white border border-slate-200 dark:border-[#1F453A] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {t.callBtn}: {campaign.phoneNumber}
                </span>
              </a>
            )}
            {campaign.telegramUrl && (
              <a
                href={campaign.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 bg-slate-50 dark:bg-[#12221E] hover:bg-slate-100 dark:hover:bg-[#182C26] text-slate-900 dark:text-white border border-slate-200 dark:border-[#1F453A] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#229ED9]" />
                <span>{t.telegramBtn}</span>
              </a>
            )}
          </div>
        )}

        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs"
        >
          {t.backHome}
        </Link>
      </main>

      <footer className="mt-8 text-center flex flex-col items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified by EthioLink Attribution Engine</span>
        </div>
        <p className="text-[11px]">{t.poweredBy} • Addis Ababa, Ethiopia</p>
      </footer>
    </div>
  );
}

export function CampaignNotFound() {
  const [lang, setLang] = useState<Language>("am");
  const t = translations[lang];

  return (
    <main className="min-h-screen bg-[#F7F8F5] dark:bg-[#07120F] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-md flex justify-end items-center gap-2 mb-4">
        <ThemeToggle size="sm" />
        <button
          type="button"
          data-testid="lang-toggle"
          onClick={() => setLang(lang === "en" ? "am" : "en")}
          className="flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-[#12221E] hover:bg-slate-50 dark:hover:bg-[#182C26] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1F453A] rounded-full px-3 py-1.5 shadow-2xs transition-all cursor-pointer"
        >
          <span>{lang === "en" ? "አማርኛ" : "English"}</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-[#0E1D19] border border-slate-200/80 dark:border-[#1A332C] rounded-2xl shadow-xs p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="font-headline text-2xl font-black text-slate-900 dark:text-white mb-2">
          {t.notFoundTitle}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          {t.notFoundDesc}
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-xs"
        >
          {t.backHome}
        </Link>
      </div>

      <footer className="mt-8 text-xs text-slate-400 dark:text-slate-500">
        <span>{t.poweredBy}</span>
      </footer>
    </main>
  );
}
