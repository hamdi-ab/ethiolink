"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { formatClientError } from "@/lib/client-errors";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
  Phone,
  Send,
  AlertCircle,
  Loader2,
  Tag,
  Store,
} from "lucide-react";

interface CampaignPreview {
  id: string;
  name: string;
  slug: string;
  promoCode: string;
  status: string;
  brandName: string;
  brandId: string;
}

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(Boolean(token));
  const [campaignPreview, setCampaignPreview] = useState<CampaignPreview | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(
    token ? null : "Missing invitation token. Please check the link provided by your brand partner."
  );

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    async function fetchInvite() {
      try {
        const res = await fetch(`/api/auth/invite?token=${encodeURIComponent(token!)}`);
        const data = await res.json().catch(() => null);

        if (!isMounted) return;

        if (!res.ok || !data.valid) {
          setTokenError(data.error || "This invitation link is invalid or has expired.");
        } else {
          setCampaignPreview(data.campaign);
          if (data.creatorName) {
            setName(data.creatorName);
          }
        }
      } catch {
        if (isMounted) {
          setTokenError("Unable to verify invitation link. Please check your network connection.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingPreview(false);
        }
      }
    }

    fetchInvite();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!name.trim()) {
      setSubmitError("Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      setSubmitError("Please enter your phone number.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/auth/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: name.trim(),
          phone: phone.trim(),
          telegramUsername: telegramUsername.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 503 || data?.code === "DATABASE_UNREACHABLE") {
          throw new Error(
            data?.error || "Unable to reach database. Please check your internet connection."
          );
        }
        throw new Error(data?.error || "Failed to complete onboarding.");
      }

      router.push(data.redirectUrl || "/creator");
    } catch (err: unknown) {

      setSubmitError(formatClientError(err, "Something went wrong. Please check your network."));
      setIsSubmitting(false);
    }
  };

  if (isLoadingPreview) {
    return (
      <div className="bg-white py-12 px-6 rounded-3xl border border-slate-100 shadow-xl max-w-md w-full text-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-4" />
        <h2 className="text-base font-bold text-slate-800">Verifying Creator Invitation...</h2>
        <p className="text-xs text-slate-500 mt-1">Connecting to merchant campaign</p>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-100 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight mb-2">
          Invitation Expired or Invalid
        </h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          {tokenError}
        </p>
        <Link
          href="/"
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-sm"
        >
          <span>Return to Homepage</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-100 max-w-md w-full text-left">
      {/* Brand & Campaign Header Preview */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100/80 mb-6">
        <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
            <Store className="w-3 h-3 text-emerald-600" />
            <span className="truncate">{campaignPreview?.brandName}</span>
          </div>
          <h2 className="text-sm font-black text-slate-900 truncate">
            {campaignPreview?.name}
          </h2>
          <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 mt-1">
            <Tag className="w-2.5 h-2.5" />
            <span>Code: {campaignPreview?.promoCode}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-lg font-black text-slate-900 tracking-tight">
          Join Campaign & Access Portal
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete your creator profile to retrieve your personal tracking link and live performance analytics.
        </p>
      </div>

      {submitError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Your Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Helen Bedilu"
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 text-xs font-medium pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Phone Number (Ethiopia)
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0911223344"
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 text-xs font-medium pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Used as your unique sign-in identifier.
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Telegram Username <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Send className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value)}
              placeholder="e.g. @helen_creator"
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 text-xs font-medium pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Activating Creator Portal...</span>
              </>
            ) : (
              <>
                <span>Accept & Open Creator Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Verified Magic-Link Onboarding</span>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/20">
            E
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">EthioLink</span>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="bg-white py-12 px-6 rounded-3xl border border-slate-100 shadow-xl max-w-md w-full text-center animate-pulse">
            <div className="w-12 h-12 bg-slate-200 rounded-2xl mx-auto mb-4" />
            <div className="w-48 h-6 bg-slate-200 rounded mx-auto mb-2" />
            <div className="w-64 h-4 bg-slate-100 rounded mx-auto mb-6" />
          </div>
        }
      >
        <JoinContent />
      </Suspense>
    </div>
  );
}
