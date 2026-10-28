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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-body antialiased flex flex-col selection:bg-emerald-100 dark:selection:bg-emerald-900/50 selection:text-emerald-900 dark:selection:text-emerald-200 transition-colors duration-200">
      {/* Top App Bar Header */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
        <div className="w-full max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-headline font-black text-xl tracking-tight flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              EL
            </div>
            <span className="text-slate-900 dark:text-white">
              Ethio<span className="text-emerald-600 dark:text-emerald-400">Link</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" />
            {/* Bilingual Language Switcher Pill */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-full border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setLang("am")}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  lang === "am"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                አማ
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
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
      <main className="w-full max-w-md mx-auto px-4 pt-4 pb-12 flex-1 flex flex-col gap-5">
        {/* Creator Attribution Badge */}
        {primaryCreator && (
          <div className="flex items-center justify-between bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm border-2 border-emerald-400">
                {primaryCreator.user.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-headline font-bold text-xs text-slate-900 dark:text-white">
                    {primaryCreator.user.name}
                  </span>
                  {primaryCreator.telegramUsername && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      (@{primaryCreator.telegramUsername})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t.creatorTag}</span>
                </div>
              </div>
            </div>
            <div className="bg-white/90 dark:bg-slate-900/90 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-800 dark:text-emerald-300 tracking-wider">
              VERIFIED
            </div>
          </div>
        )}

        {/* Featured Campaign Hero Card */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
          {/* Urgency Partner Banner */}
          <div className="bg-amber-500 px-4 py-2 flex items-center justify-between text-slate-950 font-bold text-xs">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              {t.offerBadge}
            </span>
            <span className="flex items-center gap-1 text-[11px] bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full font-mono">
              <Clock className="w-3 h-3" />
              SPECIAL OFFER
            </span>
          </div>

          <div className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {campaign.brand.name}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Official Merchant</span>
            </div>

            <h1 className="font-headline font-black text-2xl text-slate-900 dark:text-white tracking-tight leading-tight">
              {campaign.name}
            </h1>

            {campaign.description && (
              <p className="font-body text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {campaign.description}
              </p>
            )}

            {/* Campaign Validity if provided */}
            {campaign.endDate && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 pt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {t.validUntil} {new Date(campaign.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Promo Code Voucher Card */}
        <section className="border-2 border-dashed border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-5 text-center flex flex-col items-center gap-3 relative shadow-xs">
          <div className="space-y-0.5">
            <span className="font-headline text-xs font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
              {t.promoCodeLabel}
            </span>
            <h2 className="font-headline font-extrabold text-lg text-slate-900 dark:text-white">
              {campaign.brand.name} Special Promotion
            </h2>
          </div>

          {/* High-Impact Code Display */}
          <div className="w-full bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-xl py-3 px-4 shadow-inner flex items-center justify-center">
            <span className="font-mono font-black text-2xl sm:text-3xl tracking-widest text-emerald-700 dark:text-emerald-400 select-all">
              {campaign.promoCode}
            </span>
          </div>

          {/* One-Click Copy Action Button (48px Min Target) */}
          <button
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
        </section>

        {/* Action Callout Channels (Omnichannel) */}
        <div className="flex flex-col gap-3 pt-1">
          {/* Channel 1: Telegram Order Funnel */}
          {campaign.telegramUrl ? (
            <a
              href={campaign.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sendTelemetry(campaign.slug, "TELEGRAM_CLICK")}
              className="w-full h-14 bg-[#229ED9] hover:bg-[#1E8EC4] text-white active:scale-[0.98] transition-all rounded-xl font-headline font-bold text-sm flex items-center justify-between px-5 shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Send className="w-4 h-4 text-white" />
                </div>
                <span>{t.telegramBtn}</span>
              </div>
              <span className="text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full">
                Chat &amp; Order
              </span>
            </a>
          ) : null}

          {/* Channel 2: Direct Phone Line */}
          {campaign.phoneNumber ? (
            <a
              href={`tel:${campaign.phoneNumber}`}
              onClick={() => sendTelemetry(campaign.slug, "CALL_CLICK")}
              className="w-full h-12 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 active:scale-[0.98] transition-all rounded-xl font-headline font-bold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                {t.callBtn} ({campaign.phoneNumber})
              </span>
            </a>
          ) : null}

          {/* Channel 3: Map Store Location (POS Walk-in) */}
          {campaign.mapUrl ? (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-headline font-bold text-slate-900 dark:text-white text-sm">
                      Visit Retail Store
                    </h4>
                    <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      In-Person
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Redeem promo code at physical checkout register
                  </p>
                </div>
              </div>
              <a
                href={campaign.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sendTelemetry(campaign.slug, "MAP_CLICK")}
                className="w-full h-12 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 active:scale-[0.98] transition-all rounded-xl font-headline font-bold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.mapBtn}</span>
              </a>
            </div>
          ) : null}
        </div>

        {/* Security & Provenance Footer */}
        <footer className="mt-6 pt-6 border-t border-slate-200/80 dark:border-slate-800 text-center flex flex-col items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified by EthioLink Attribution Engine</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {t.poweredBy} • Addis Ababa, Ethiopia
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center px-4 py-6 sm:py-12 transition-colors duration-200">
      <header className="w-full max-w-md flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="font-headline font-black text-lg tracking-tight text-slate-900 dark:text-white">
            Ethio<span className="text-emerald-600 dark:text-emerald-400">Link</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle size="sm" />
          <button
            type="button"
            data-testid="lang-toggle"
            onClick={() => setLang(lang === "en" ? "am" : "en")}
            className="flex items-center gap-1.5 text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <span>{lang === "en" ? "አማርኛ" : "English"}</span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm p-6 sm:p-8 flex flex-col items-center text-center">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${
            isPaused
              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
          }`}
        >
          {isPaused ? (
            <Clock className="w-8 h-8 text-amber-500" />
          ) : (
            <Calendar className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          )}
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 mb-2">
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
          <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800/80 mb-6 space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              {t.contactStore}
            </p>
            {campaign.phoneNumber && (
              <a
                href={`tel:${campaign.phoneNumber}`}
                className="w-full h-11 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.callBtn}: {campaign.phoneNumber}</span>
              </a>
            )}
            {campaign.telegramUrl && (
              <a
                href={campaign.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#229ED9]" />
                <span>{t.telegramBtn}</span>
              </a>
            )}
          </div>
        )}

        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition-all shadow-xs"
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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-md flex justify-end items-center gap-2 mb-4">
        <ThemeToggle size="sm" />
        <button
          type="button"
          data-testid="lang-toggle"
          onClick={() => setLang(lang === "en" ? "am" : "en")}
          className="flex items-center gap-1.5 text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1.5 shadow-xs transition-all cursor-pointer"
        >
          <span>{lang === "en" ? "አማርኛ" : "English"}</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-8 flex flex-col items-center text-center">
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
