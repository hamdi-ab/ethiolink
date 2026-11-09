"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Sparkles,
  Tag,
  Link as LinkIcon,
  Send,
  Phone,
  MapPin,
  Calendar,
  UserPlus,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { formatClientError } from "@/lib/client-errors";
import { getBaseUrl } from "@/lib/config";

export interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (campaign?: unknown) => void;
}

export function CreateCampaignModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCampaignModalProps) {
  const [name, setName] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [creatorName, setCreatorName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdInviteUrl, setCreatedInviteUrl] = useState<string | null>(null);
  const [createdPublicUrl, setCreatedPublicUrl] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setName("");
        setPromoCode("");
        setSlug("");
        setDescription("");
        setTelegramUrl("");
        setPhoneNumber("");
        setMapUrl("");
        setStartDate("");
        setEndDate("");
        setCreatorName("");
        setError(null);
        setCreatedInviteUrl(null);
        setCreatedPublicUrl(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!name.trim() || name.trim().length < 3) {
      setError("Campaign name must be at least 3 characters.");
      return;
    }

    if (!promoCode.trim() || promoCode.trim().length < 2) {
      setError("Promo code must be at least 2 characters.");
      return;
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          promoCode: promoCode.trim().toUpperCase(),
          slug: slug.trim() ? slug.trim().toLowerCase() : undefined,
          description: description.trim() || undefined,
          telegramUrl: telegramUrl.trim() || undefined,
          phoneNumber: phoneNumber.trim() || undefined,
          mapUrl: mapUrl.trim() || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          creatorName: creatorName.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 503 || data?.code === "DATABASE_UNREACHABLE") {
          throw new Error(
            data?.error || "Unable to reach database. Please check your internet connection."
          );
        }
        throw new Error(data?.error || "Failed to create campaign");
      }

      const origin = getBaseUrl();
      const publicUrl = `${origin}/c/${data.campaign.slug}`;
      const inviteUrl = `${origin}${data.creatorInvite.url}`;

      setCreatedPublicUrl(publicUrl);
      setCreatedInviteUrl(inviteUrl);
      toast.success("Campaign launched successfully!");
      onSuccess?.(data.campaign);
    } catch (err: unknown) {
      setError(formatClientError(err, "Failed to create campaign. Please check your network."));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, isInvite: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isInvite) {
        setCopiedInvite(true);
        setTimeout(() => setCopiedInvite(false), 2000);
      } else {
        setCopiedPublic(true);
        setTimeout(() => setCopiedPublic(false), 2000);
      }
      toast.success(isInvite ? "Invite link copied" : "Landing page link copied");
    } catch {
      // Fallback
    }
  };

  const handleResetForAnother = () => {
    setName("");
    setPromoCode("");
    setSlug("");
    setDescription("");
    setTelegramUrl("");
    setPhoneNumber("");
    setMapUrl("");
    setStartDate("");
    setEndDate("");
    setCreatorName("");
    setError(null);
    setCreatedInviteUrl(null);
    setCreatedPublicUrl(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={() => !loading && onClose()}
      />

      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#14211D] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#26372F] overflow-hidden z-10 animate-in fade-in-50 zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#26372F] bg-slate-50/50 dark:bg-[#101C18]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-[#193629] text-emerald-600 dark:text-[#78B99D] border border-emerald-200/60 dark:border-[#264D3A] flex items-center justify-center shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-slate-900 dark:text-[#F1F5F1]">
                Launch Influencer Campaign
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#9BAAA1]">
                Configure promo codes, omnichannel touchpoints, and creator splits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-[#F1F5F1] hover:bg-slate-100 dark:hover:bg-[#1A2A24] transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {createdInviteUrl ? (
          <div className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-[#193629]/50 border border-emerald-200 dark:border-[#264D3A]">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-[#193629] text-emerald-600 dark:text-[#83D1A5] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-headline font-bold text-slate-900 dark:text-[#F1F5F1] text-sm">
                  Campaign Active &amp; Attribution Ready!
                </h4>
                <p className="text-xs text-emerald-800 dark:text-[#A4D8BD]">
                  Your campaign promo code is live for in-store checkout and online tracking.
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Customer Landing Page URL */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#101C18] border border-slate-200 dark:border-[#26372F] space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9BAAA1]">
                  Public Customer Landing Page
                </label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={createdPublicUrl || ""}
                    className="w-full bg-white dark:bg-[#0D1714] px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-[#26372F] text-slate-800 dark:text-[#F1F5F1] select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdPublicUrl || "", false)}
                    className="shrink-0 px-3 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-[#78B99D] dark:hover:bg-[#91C9AE] text-white dark:text-[#0D2119] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    {copiedPublic ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPublic ? "Copied" : "Copy"}</span>
                  </button>
                  {createdPublicUrl && (
                    <a
                      href={createdPublicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 p-2 text-slate-500 hover:text-slate-800 dark:text-[#9BAAA1] dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-[#1A2A24] transition-colors"
                      title="Open landing page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Creator Magic Invite Link */}
              <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-[#193629]/30 border border-emerald-200 dark:border-[#264D3A] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-[#83D1A5]">
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-[#78B99D]" />
                  <span>Creator Magic Invite Link (Passwordless)</span>
                </div>
                <p className="text-[11px] text-emerald-700/80 dark:text-[#A4D8BD]">
                  Share this link with your creator. They get direct instant access to their live performance dashboard.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={createdInviteUrl || ""}
                    className="w-full bg-white dark:bg-[#0D1714] px-3 py-2 text-xs font-mono rounded-lg border border-emerald-300 dark:border-[#264D3A] text-slate-800 dark:text-[#F1F5F1] select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdInviteUrl || "", true)}
                    className="shrink-0 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    {copiedInvite ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedInvite ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-[#26372F]">
              <button
                type="button"
                onClick={handleResetForAnother}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-[#C0CCC4] hover:bg-slate-100 dark:hover:bg-[#1A2A24] transition-colors cursor-pointer"
              >
                Create Another Campaign
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Done / View in Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Core Campaign Info */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9BAAA1] block">
                1. Campaign Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#C0CCC4]">
                    Campaign Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tomoca Bole Summer Promo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#101C18] border border-slate-300 dark:border-[#304239] rounded-xl text-xs text-slate-900 dark:text-[#F1F5F1] placeholder:text-slate-400 dark:placeholder:text-[#9BAAA1]/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#C0CCC4]">
                    Promo Code (In-Store / POS) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-[#9BAAA1] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. TOMOCA20"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#101C18] border border-slate-300 dark:border-[#304239] rounded-xl text-xs font-mono uppercase text-slate-900 dark:text-[#F1F5F1] placeholder:text-slate-400 dark:placeholder:text-[#9BAAA1]/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#C0CCC4]">
                    Custom URL Slug <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 dark:text-[#9BAAA1] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. bole-summer (auto-generated if empty)"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase())}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#101C18] border border-slate-300 dark:border-[#304239] rounded-xl text-xs font-mono text-slate-900 dark:text-[#F1F5F1] placeholder:text-slate-400 dark:placeholder:text-[#9BAAA1]/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#C0CCC4]">
                    Target Influencer Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <UserPlus className="w-3.5 h-3.5 text-slate-400 dark:text-[#9BAAA1] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. Mahlet Kebede"
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#101C18] border border-slate-300 dark:border-[#304239] rounded-xl text-xs text-slate-900 dark:text-[#F1F5F1] placeholder:text-slate-400 dark:placeholder:text-[#9BAAA1]/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-[#C0CCC4]">
                  Campaign Offer Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 20% discount on all espresso blends when presenting this code at Bole or Piassa branch."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#101C18] border border-slate-300 dark:border-[#304239] rounded-xl text-xs text-slate-900 dark:text-[#F1F5F1] placeholder:text-slate-400 dark:placeholder:text-[#9BAAA1]/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>

            {/* Omnichannel Touchpoints */}
            <div className="pt-3 border-t border-slate-100 dark:border-[#26372F] space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9BAAA1] block">
                2. Omnichannel Touchpoints (Ethiopian Retail)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#C0CCC4]">
                    Telegram Bot / Mini-App
                  </label>
                  <div className="relative">
                    <Send className="w-3.5 h-3.5 text-[#229ED9] absolute left-3 top-2.5" />
                    <input
                      type="url"
                      placeholder="https://t.me/tomoca_bot"
                      value={telegramUrl}
                      onChange={(e) => setTelegramUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#101C18] border border-slate-300 dark:border-[#304239] rounded-xl text-xs text-slate-900 dark:text-[#F1F5F1] placeholder:text-slate-400 dark:placeholder:text-[#9BAAA1]/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#C0CCC4]">
                    Direct Phone Hotline
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-amber-500 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      placeholder="+251911223344"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#101C18] border border-slate-300 dark:border-[#304239] rounded-xl text-xs text-slate-900 dark:text-[#F1F5F1] placeholder:text-slate-400 dark:placeholder:text-[#9BAAA1]/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#C0CCC4]">
                    Google Maps / In-Store URL
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      placeholder="https://maps.app.goo.gl/..."
                      value={mapUrl}
                      onChange={(e) => setMapUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#101C18] border border-slate-300 dark:border-[#304239] rounded-xl text-xs text-slate-900 dark:text-[#F1F5F1] placeholder:text-slate-400 dark:placeholder:text-[#9BAAA1]/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Duration */}
            <div className="pt-3 border-t border-slate-100 dark:border-[#26372F] space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9BAAA1] block">
                3. Lifecycle &amp; Schedule
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#C0CCC4]">
                    Start Date <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-[#9BAAA1] absolute left-3 top-2.5" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#101C18] border border-slate-300 dark:border-[#304239] rounded-xl text-xs text-slate-900 dark:text-[#F1F5F1] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#C0CCC4]">
                    End Date <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-[#9BAAA1] absolute left-3 top-2.5" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#101C18] border border-slate-300 dark:border-[#304239] rounded-xl text-xs text-slate-900 dark:text-[#F1F5F1] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-[#26372F] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#9BAAA1] hover:bg-slate-100 dark:hover:bg-[#1A2A24] transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Launching Campaign...
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Launch Campaign
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
