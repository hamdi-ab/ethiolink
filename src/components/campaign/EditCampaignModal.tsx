"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Pencil,
  Lock,
  Send,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";
import { formatClientError } from "@/lib/client-errors";

export interface EditCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    id: string;
    name: string;
    slug: string;
    promoCode: string;
    brandName: string;
    status: string;
    description?: string | null;
    telegramUrl?: string | null;
    phoneNumber?: string | null;
    mapUrl?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  } | null;
}

interface EditCampaignFormProps {
  campaign: NonNullable<EditCampaignModalProps["campaign"]>;
  onClose: () => void;
}

function EditCampaignForm({ campaign, onClose }: EditCampaignFormProps) {
  const router = useRouter();

  const [name, setName] = useState(campaign.name || "");
  const [description, setDescription] = useState(campaign.description || "");
  const [telegramUrl, setTelegramUrl] = useState(campaign.telegramUrl || "");
  const [phoneNumber, setPhoneNumber] = useState(campaign.phoneNumber || "");
  const [mapUrl, setMapUrl] = useState(campaign.mapUrl || "");
  const [startDate, setStartDate] = useState(
    campaign.startDate ? campaign.startDate.split("T")[0] : ""
  );
  const [endDate, setEndDate] = useState(
    campaign.endDate ? campaign.endDate.split("T")[0] : ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!name.trim() || name.trim().length < 3) {
      setError("Campaign name must be at least 3 characters.");
      return;
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        telegramUrl: telegramUrl.trim() || null,
        phoneNumber: phoneNumber.trim() || null,
        mapUrl: mapUrl.trim() || null,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
      };

      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to update campaign");
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: unknown) {
      setError(formatClientError(err, "Failed to update campaign. Please check your network."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
            <Pencil className="w-4 h-4" />
          </div>
          <div>
            <h2
              id="edit-campaign-title"
              className="font-headline font-bold text-base text-slate-900 dark:text-white"
            >
              Edit Campaign Details
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update promotional copy, destination touchpoints, and schedule.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Immutable Attribution Banner (PRD FR-009) */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Attribution Identifiers (Permanent)</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
              FR-009 PROTECTED
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div>
              <span className="text-[11px] text-slate-500 block">Promo Code</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {campaign.promoCode}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Landing Slug</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                /c/{campaign.slug}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Promo codes and URL slugs cannot be modified after launch to preserve printed QR codes, influencer links, and historical sales redemptions.
          </p>
        </div>

        {/* Campaign Name */}
        <div>
          <label
            htmlFor="edit-camp-name"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
          >
            Campaign Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="edit-camp-name"
            type="text"
            required
            minLength={3}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Summer Sidama Launch"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="edit-camp-desc"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
          >
            Offer &amp; Promotion Description
          </label>
          <textarea
            id="edit-camp-desc"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Mention code BOLE20 for 20% off all beverage orders..."
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Customer Action Destinations */}
        <div className="space-y-3 pt-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <span>Customer Conversion Destinations</span>
          </h3>

          <div className="space-y-2.5">
            {/* Telegram Channel */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Send className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <input
                type="text"
                value={telegramUrl}
                onChange={(e) => setTelegramUrl(e.target.value)}
                placeholder="Telegram link (e.g. https://t.me/brandchannel)"
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Phone Number */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Contact Phone (e.g. +251 911 223 344)"
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Maps Location */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <input
                type="text"
                value={mapUrl}
                onChange={(e) => setMapUrl(e.target.value)}
                placeholder="Store Maps link (e.g. https://maps.google.com/?q=...)"
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Schedule Dates */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label
              htmlFor="edit-camp-start"
              className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
            >
              Start Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <input
                id="edit-camp-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-camp-end"
              className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
            >
              End Date (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <input
                id="edit-camp-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : success ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export function EditCampaignModal({
  isOpen,
  onClose,
  campaign,
}: EditCampaignModalProps) {
  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !campaign) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-campaign-title"
    >
      <EditCampaignForm key={campaign.id} campaign={campaign} onClose={onClose} />
    </div>
  );
}
