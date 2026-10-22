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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-body antialiased flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top App Bar Header */}
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/80 shadow-xs">
        <div className="w-full max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-headline font-black text-xl tracking-tight flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              EL
            </div>
            <span className="text-slate-900">
              Ethio<span className="text-emerald-600">Link</span>
            </span>
          </Link>

          {/* Bilingual Language Switcher Pill */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200">
            <button
              onClick={() => setLang("am")}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                lang === "am"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              አማ
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                lang === "en"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Main Campaign Container */}
      <main className="w-full max-w-md mx-auto px-4 pt-4 pb-12 flex-1 flex flex-col gap-5">
        {/* Creator Attribution Badge */}
        {primaryCreator && (
          <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 rounded-xl px-3.5 py-2.5 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm border-2 border-emerald-400">
                {primaryCreator.user.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-headline font-bold text-xs text-slate-900">
                    {primaryCreator.user.name}
                  </span>
                  {primaryCreator.telegramUsername && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      (@{primaryCreator.telegramUsername})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.creatorTag}</span>
                </div>
              </div>
            </div>
            <div className="bg-white/90 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-800 tracking-wider">
              VERIFIED
            </div>
          </div>
        )}

        {/* Featured Campaign Hero Card */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
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
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {campaign.brand.name}
              </span>
              <span className="text-xs font-medium text-slate-500">Official Merchant</span>
            </div>

            <h1 className="font-headline font-black text-2xl text-slate-900 tracking-tight leading-tight">
              {campaign.name}
            </h1>

            {campaign.description && (
              <p className="font-body text-sm text-slate-600 leading-relaxed">
                {campaign.description}
              </p>
            )}

            {/* Campaign Validity if provided */}
            {campaign.endDate && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {t.validUntil} {new Date(campaign.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Promo Code Voucher Card */}
        <section className="border-2 border-dashed border-emerald-400 bg-emerald-50/50 rounded-2xl p-5 text-center flex flex-col items-center gap-3 relative shadow-xs">
          <div className="space-y-0.5">
            <span className="font-headline text-xs font-bold uppercase tracking-widest text-emerald-800">
              {t.promoCodeLabel}
            </span>
            <h2 className="font-headline font-extrabold text-lg text-slate-900">
              {campaign.brand.name} Special Promotion
            </h2>
          </div>

          {/* High-Impact Code Display */}
          <div className="w-full bg-white border border-emerald-300 rounded-xl py-3 px-4 shadow-inner flex items-center justify-center">
            <span className="font-mono font-black text-2xl sm:text-3xl tracking-widest text-emerald-700 select-all">
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

          <p className="text-[12px] font-medium text-emerald-800 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Use online or present this code at in-store checkout</span>
          </p>
        </section>

        {/* Omnichannel Conversion Channels */}
        <div className="flex items-center justify-between px-1 pt-1">
          <h3 className="font-headline font-bold text-sm text-slate-800 uppercase tracking-wider">
            Redeem &amp; Order Options
          </h3>
          <span className="text-xs text-slate-500 font-medium">3 Direct Paths</span>
        </div>

        <div className="flex flex-col gap-3">
          {/* 1. Telegram Deep Link Channel */}
          {campaign.telegramUrl ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-blue-400 transition-colors flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-headline font-bold text-slate-900 text-sm">
                      Telegram Channel &amp; Bot
                    </h4>
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-200">
                      Instant
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Direct chat ordering with Telebirr / CBE Birr support
                  </p>
                </div>
              </div>
              <a
                href={campaign.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sendTelemetry(campaign.slug, "TELEGRAM_CLICK")}
                className="w-full h-12 bg-[#229ED9] hover:bg-[#1d8bc0] active:scale-[0.98] transition-all rounded-xl text-white font-headline font-bold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{t.telegramBtn}</span>
              </a>
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
                <span>Telebirr</span>
                <span>•</span>
                <span>CBE Birr</span>
                <span>•</span>
                <span>Cash on Delivery</span>
              </div>
            </div>
          ) : null}

          {/* 2. Direct Phone Call */}
          {campaign.phoneNumber ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-emerald-300 transition-colors flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-headline font-bold text-slate-900 text-sm">
                      Call Store Direct
                    </h4>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                      Voice Order
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Speak directly with store staff and reserve items
                  </p>
                </div>
              </div>
              <a
                href={`tel:${campaign.phoneNumber}`}
                onClick={() => sendTelemetry(campaign.slug, "CALL_CLICK")}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all rounded-xl text-white font-headline font-bold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>
                  {t.callBtn} ({campaign.phoneNumber})
                </span>
              </a>
            </div>
          ) : null}

          {/* 3. Physical Store Location */}
          {campaign.mapUrl ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-colors flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-headline font-bold text-slate-900 text-sm">
                      Visit Retail Store
                    </h4>
                    <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200">
                      In-Person
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Redeem promo code at physical checkout register
                  </p>
                </div>
              </div>
              <a
                href={campaign.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sendTelemetry(campaign.slug, "MAP_CLICK")}
                className="w-full h-12 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 active:scale-[0.98] transition-all rounded-xl font-headline font-bold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{t.mapBtn}</span>
              </a>
            </div>
          ) : null}
        </div>

        {/* Security & Provenance Footer */}
        <footer className="mt-6 pt-6 border-t border-slate-200/80 text-center flex flex-col items-center gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified by EthioLink Attribution Engine</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {t.poweredBy} • Addis Ababa, Ethiopia
          </p>
        </footer>
      </main>
    </div>
  );
}

export function CampaignNotFound() {
  const [lang, setLang] = useState<Language>("am");
  const t = translations[lang];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md flex justify-end mb-4">
        <button
          type="button"
          data-testid="lang-toggle"
          onClick={() => setLang(lang === "en" ? "am" : "en")}
          className="flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full px-3 py-1.5 shadow-xs transition-all cursor-pointer"
        >
          <span>{lang === "en" ? "አማርኛ" : "English"}</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xs p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="font-headline text-2xl font-black text-slate-900 mb-2">
          {t.notFoundTitle}
        </h1>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {t.notFoundDesc}
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-xs"
        >
          {t.backHome}
        </Link>
      </div>

      <footer className="mt-8 text-xs text-slate-400">
        <span>{t.poweredBy}</span>
      </footer>
    </main>
  );
}
