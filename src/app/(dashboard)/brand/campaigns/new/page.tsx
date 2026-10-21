"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Tag,
  Send,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  Link as LinkIcon,
  Check,
  Copy,
  AlertCircle,
  UserPlus,
} from "lucide-react";

export default function NewCampaignPage() {
  const router = useRouter();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          promoCode,
          slug: slug || undefined,
          description: description || undefined,
          telegramUrl: telegramUrl || undefined,
          phoneNumber: phoneNumber || undefined,
          mapUrl: mapUrl || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          creatorName: creatorName || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create campaign");
      }

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setCreatedPublicUrl(`${origin}/c/${data.campaign.slug}`);
      setCreatedInviteUrl(`${origin}${data.creatorInvite.url}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
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
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link
            href="/brand"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Create Influencer Campaign</h1>
            <p className="text-xs text-slate-500">Configure promo code, customer touchpoints, and creator invite</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {createdInviteUrl ? (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-emerald-600" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">Campaign Launched Successfully!</h2>
              <p className="text-sm text-slate-500 mt-1">
                Your campaign is active and attribution links are ready.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {/* Public URL Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Public Customer Landing Page
                </label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={createdPublicUrl || ""}
                    className="w-full bg-white px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 text-slate-700 select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(createdPublicUrl || "", false)}
                    className="shrink-0 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    {copiedPublic ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPublic ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Creator Magic Invite URL Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Creator Magic Invite Link (No Password Wall)</span>
                </div>
                <p className="text-xs text-emerald-700/80 mb-2">
                  Send this link to your influencer. They can access their real-time performance dashboard directly.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={createdInviteUrl || ""}
                    className="w-full bg-white px-3 py-2 text-xs font-mono rounded-lg border border-emerald-300 text-slate-700 select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(createdInviteUrl || "", true)}
                    className="shrink-0 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    {copiedInvite ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedInvite ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={() => router.push("/brand")}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-all"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => {
                  setCreatedInviteUrl(null);
                  setName("");
                  setPromoCode("");
                  setSlug("");
                  setDescription("");
                  setTelegramUrl("");
                  setPhoneNumber("");
                  setMapUrl("");
                  setCreatorName("");
                }}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs rounded-xl transition-all"
              >
                Create Another Campaign
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Campaign Core Info */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Core Information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Campaign Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tikus Buna Summer Special"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Promo Code (In-Store / Online) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. TIKUS20"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custom Slug (optional)
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. tikus-summer (leave blank to auto-generate)"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Offer Description
                </label>
                <textarea
                  rows={2}
                  placeholder="20% off all specialty espresso blends when you present this code."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                />
              </div>
            </div>

            {/* Customer Touchpoints */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Customer Direct Touchpoints
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telegram Direct URL
                  </label>
                  <div className="relative">
                    <Send className="w-4 h-4 text-[#229ED9] absolute left-3.5 top-3" />
                    <input
                      type="url"
                      placeholder="https://t.me/yourbusiness"
                      value={telegramUrl}
                      onChange={(e) => setTelegramUrl(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Direct Call Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      placeholder="+251911223344"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Maps URL
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
                    <input
                      type="url"
                      placeholder="https://maps.app.goo.gl/..."
                      value={mapUrl}
                      onChange={(e) => setMapUrl(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Magic Invite & Duration */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Influencer & Duration
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Creator Name (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mahlet Kebede"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Link
                href="/brand"
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs rounded-xl transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? "Creating Campaign..." : "Launch Campaign"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
