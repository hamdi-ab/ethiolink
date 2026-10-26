"use client";

import React, { useState, useId, useMemo } from "react";
import { generateQRCodeSVG, generateTelegramShareUrl, formatCampaignShareText } from "@/lib/qr";
import {
  X,
  Download,
  Printer,
  Send,
  Copy,
  Check,
  QrCode,
  Tag,
  Store,
  Sparkles,
} from "lucide-react";

export interface CampaignShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    id: string;
    name: string;
    slug: string;
    promoCode: string;
    brandName: string;
    description?: string | null;
  } | null;
  origin?: string;
}

export function CampaignShareModal({
  isOpen,
  onClose,
  campaign,
  origin,
}: CampaignShareModalProps) {
  const [lang, setLang] = useState<"en" | "am">("en");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const printId = useId();

  const baseUrl = origin || (typeof window !== "undefined" ? window.location.origin : "");
  const campaignUrl = campaign ? `${baseUrl}/c/${campaign.slug}` : "";

  // Generate SVG string for the QR code
  const qrSvgString = useMemo(() => {
    if (!campaignUrl) return "";
    return generateQRCodeSVG(campaignUrl, {
      pixelSize: 10,
      whiteColor: "#ffffff",
      blackColor: "#090d16",
    });
  }, [campaignUrl]);

  const telegramShareText = useMemo(() => {
    if (!campaign) return "";
    return formatCampaignShareText(campaign.name, campaign.brandName, campaign.promoCode, lang);
  }, [campaign, lang]);

  const telegramShareUrl = useMemo(() => {
    if (!campaignUrl || !telegramShareText) return "";
    return generateTelegramShareUrl(campaignUrl, telegramShareText);
  }, [campaignUrl, telegramShareText]);

  if (!isOpen || !campaign) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(campaignUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.error("Failed to copy link", e);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(campaign.promoCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (e) {
      console.error("Failed to copy code", e);
    }
  };

  const handleDownloadSVG = () => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${campaign.slug}-qr-code.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPNG = () => {
    if (!qrSvgString) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([qrSvgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1000, 1000);
      ctx.drawImage(img, 50, 50, 900, 900);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${campaign.slug}-qr-code.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    img.src = url;
  };

  const handlePrintStandee = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-headline text-slate-900 dark:text-slate-100">
                POS QR Code &amp; Distribution Suite
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {campaign.brandName} • {campaign.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Main Grid: QR Preview & Sharing Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left: Scannable Standee QR Card */}
            <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-center space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Point-of-Sale Scannable Code
              </span>

              {/* QR Frame with quiet zone */}
              <div
                className="w-48 h-48 bg-white p-3 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full select-none"
                dangerouslySetInnerHTML={{ __html: qrSvgString }}
              />

              {/* Promo Code Badge */}
              <div className="w-full">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-black bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>CODE: {campaign.promoCode}</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  Customers scan to open Telegram bot, phone dialer, or store maps
                </p>
              </div>

              {/* Export / Print Actions */}
              <div className="flex items-center gap-2 pt-1 w-full">
                <button
                  onClick={handleDownloadSVG}
                  className="flex-1 py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  title="Download vector SVG"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>SVG</span>
                </button>
                <button
                  onClick={handleDownloadPNG}
                  className="flex-1 py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  title="Download high-resolution PNG"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PNG</span>
                </button>
                <button
                  onClick={handlePrintStandee}
                  className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  title="Print acrylic counter standee"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Right: 1-Click Telegram & Link Distribution */}
            <div className="space-y-4">
              {/* Telegram Broadcast Card */}
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Telegram Distribution
                    </span>
                  </div>

                  {/* Language switch */}
                  <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-sky-200 dark:border-sky-800 text-[10px]">
                    <button
                      onClick={() => setLang("en")}
                      className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                        lang === "en"
                          ? "bg-sky-600 text-white"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setLang("am")}
                      className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                        lang === "am"
                          ? "bg-sky-600 text-white"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      አማ
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-sky-100 dark:border-sky-900/50">
                  &ldquo;{telegramShareText}&rdquo;
                </p>

                <a
                  href={telegramShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Share to Telegram Channel / Chat</span>
                </a>
              </div>

              {/* Direct Attribution URL Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Direct Tracking URL
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={campaignUrl}
                    className="flex-1 bg-white dark:bg-slate-900 text-xs font-mono px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
                    title="Copy URL"
                  >
                    {copiedLink ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Promo Code Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Promo Code
                  </span>
                  <div className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                    {campaign.promoCode}
                  </div>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  {copiedCode ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedCode ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Print Standee Layout: Rendered strictly during window.print() */}
      <div id={printId} className="hidden print:flex fixed inset-0 bg-white z-[9999] flex-col items-center justify-center p-8 text-slate-950 font-sans text-center">
        <div className="max-w-md w-full border-4 border-slate-900 rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-center gap-2">
            <Store className="w-6 h-6 text-emerald-700" />
            <span className="font-bold text-base tracking-wider uppercase">
              {campaign.brandName}
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-black text-slate-950 leading-tight">
              {campaign.name}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Scan with your phone camera or Telebirr to claim your discount
            </p>
          </div>

          <div
            className="w-64 h-64 mx-auto p-4 bg-white border-2 border-slate-300 rounded-2xl flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
            dangerouslySetInnerHTML={{ __html: qrSvgString }}
          />

          <div className="bg-slate-100 border-2 border-dashed border-slate-400 p-4 rounded-2xl space-y-1">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-500">
              Mention At Cashier / POS
            </span>
            <div className="font-mono text-3xl font-black tracking-widest text-emerald-800">
              {campaign.promoCode}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Telebirr • CBE Birr • In-Store POS</span>
            <span className="font-bold flex items-center gap-1 text-slate-700">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Powered by EthioLink
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
