"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Language, translations } from "@/lib/translations";
import {
  Send,
  Phone,
  MapPin,
  Copy,
  Check,
  Globe,
  Tag,
  Calendar,
  Sparkles,
  AlertCircle,
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

export function CampaignLanding({ campaign }: { campaign: CampaignData }) {
  const [lang, setLang] = useState<Language>("am"); // Default to Amharic for Ethiopian market
  const [copied, setCopied] = useState(false);

  const t = translations[lang];

  const handleCopyCode = async () => {
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
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 flex flex-col items-center px-4 py-6 sm:py-12">
      {/* Top Language Toggle & Brand Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-full px-3 py-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{campaign.brand.name}</span>
        </div>

        <button
          onClick={() => setLang(lang === "en" ? "am" : "en")}
          className="flex items-center gap-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full px-3 py-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
          aria-label="Toggle language"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span>{lang === "en" ? "አማርኛ" : "English"}</span>
        </button>
      </div>

      {/* Main Campaign Card */}
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Brand / Offer Badge */}
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200/60 rounded-full px-3 py-1 mb-4">
          <Tag className="w-3.5 h-3.5 text-amber-600" />
          {t.offerBadge}
        </span>

        {/* Campaign Title & Description */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
          {campaign.name}
        </h1>

        {campaign.description && (
          <p className="text-sm sm:text-base text-slate-600 mb-6 leading-relaxed">
            {campaign.description}
          </p>
        )}

        {/* Creator Attribution (if present) */}
        {primaryCreator && (
          <div className="text-xs text-slate-500 mb-6 flex items-center gap-1 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
            <span>{t.creatorTag}:</span>
            <span className="font-semibold text-slate-700">
              {primaryCreator.user.name}
              {primaryCreator.telegramUsername && ` (@${primaryCreator.telegramUsername})`}
            </span>
          </div>
        )}

        {/* Promo Code Box */}
        <div className="w-full bg-gradient-to-br from-emerald-50/80 to-teal-50/40 border-2 border-dashed border-emerald-300 rounded-2xl p-4 mb-6 relative overflow-hidden">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-800/80 mb-1">
            {t.promoCodeLabel}
          </p>
          <div className="font-mono text-2xl sm:text-3xl font-black text-emerald-950 tracking-wider mb-3 select-all">
            {campaign.promoCode}
          </div>

          <button
            onClick={handleCopyCode}
            className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
              copied
                ? "bg-emerald-600 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98]"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{t.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{t.copyCode}</span>
              </>
            )}
          </button>
        </div>

        {/* Touchpoint / Call-to-Action Buttons */}
        <div className="w-full space-y-3">
          {campaign.telegramUrl && (
            <a
              href={campaign.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 bg-[#229ED9] hover:bg-[#1e8cc0] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2.5 shadow-md shadow-sky-500/15 transition-all active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>{t.telegramBtn}</span>
            </a>
          )}

          {campaign.phoneNumber && (
            <a
              href={`tel:${campaign.phoneNumber}`}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2.5 shadow-md shadow-slate-900/15 transition-all active:scale-[0.98]"
            >
              <Phone className="w-4 h-4" />
              <span>{t.callBtn}</span>
            </a>
          )}

          {campaign.mapUrl && (
            <a
              href={campaign.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold text-sm rounded-xl flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-[0.98]"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{t.mapBtn}</span>
            </a>
          )}
        </div>

        {/* Expiry Note if applicable */}
        {campaign.endDate && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-6">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {t.validUntil} {new Date(campaign.endDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-8 text-xs text-slate-400 flex items-center gap-1">
        <span>{t.poweredBy}</span>
      </footer>
    </main>
  );
}

export function CampaignNotFound() {
  const [lang, setLang] = useState<Language>("am");
  const t = translations[lang];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md flex justify-end mb-4">
        <button
          onClick={() => setLang(lang === "en" ? "am" : "en")}
          className="flex items-center gap-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full px-3 py-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
          aria-label="Toggle language"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span>{lang === "en" ? "አማርኛ" : "English"}</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/60 p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{t.notFoundTitle}</h1>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">{t.notFoundDesc}</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all"
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
