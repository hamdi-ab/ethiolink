"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { formatClientError } from "@/lib/client-errors";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
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
  Layers,
  ChevronRight,
  CheckCircle2,
  Lock,
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

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Normalize Ethiopian phone number
      let submittedPhone = phone.trim();
      if (/^9\d{8}$/.test(submittedPhone)) {
        submittedPhone = `0${submittedPhone}`;
      }
      if (/^\+?251(\d{9})$/.test(submittedPhone)) {
        const match = submittedPhone.match(/^\+?251(\d{9})$/);
        if (match) submittedPhone = `0${match[1]}`;
      }

      const res = await fetch("/api/auth/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: name.trim(),
          phone: submittedPhone,
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
      <div className="bg-white dark:bg-[#14211D] py-12 px-6 rounded-3xl border border-slate-200/80 dark:border-[#1E332B] shadow-lg max-w-md w-full text-center space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-600 dark:text-[#78B99D] animate-spin mx-auto" />
        <h2 className="text-base font-headline font-bold text-slate-800 dark:text-white">
          Verifying Creator Invitation...
        </h2>
        <p className="text-xs text-slate-500 dark:text-[#9BAAA1]">
          Connecting to merchant partner campaign node
        </p>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="bg-white dark:bg-[#14211D] py-8 px-6 shadow-xl rounded-3xl border border-slate-200/80 dark:border-[#1E332B] max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200/60 dark:border-rose-900/60">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-headline font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Invitation Expired or Invalid
        </h1>
        <p className="text-xs text-slate-500 dark:text-[#9BAAA1] mb-6 leading-relaxed">
          {tokenError}
        </p>
        <Link
          href="/"
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#10352F] hover:bg-[#16443D] text-white font-headline font-semibold text-xs transition-all shadow-sm"
        >
          <span>Return to Homepage</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#14211D] py-8 px-6 sm:px-8 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-3xl border border-slate-200/80 dark:border-[#1E332B] max-w-md w-full text-left transition-colors duration-200">
      {/* Brand & Campaign Header Preview */}
      <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#EAF5F0] dark:bg-[#11261E] border border-emerald-200/80 dark:border-[#1E4336] mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-[#10352F] text-white flex items-center justify-center shrink-0 shadow-sm border border-emerald-400/20">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 dark:text-[#78B99D]">
            <Store className="w-3.5 h-3.5 text-emerald-600 dark:text-[#78B99D]" />
            <span className="truncate">{campaignPreview?.brandName}</span>
          </div>
          <h2 className="text-sm font-headline font-bold text-slate-900 dark:text-white truncate">
            {campaignPreview?.name}
          </h2>
          <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 dark:text-[#78B99D] bg-white dark:bg-[#163327] px-2 py-0.5 rounded-md border border-emerald-200 dark:border-[#204938] mt-1">
            <Tag className="w-2.5 h-2.5" />
            <span>Promo Code: {campaignPreview?.promoCode}</span>
          </div>
        </div>
      </div>

      <div className="mb-6 space-y-1">
        <h1 className="text-xl font-headline font-extrabold text-slate-900 dark:text-white tracking-tight">
          Join Campaign &amp; Access Portal
        </h1>
        <p className="text-xs text-slate-500 dark:text-[#9BAAA1] leading-relaxed">
          Complete your creator profile to retrieve your personal tracking link and live Telebirr
          commission analytics.
        </p>
      </div>

      {submitError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 mb-4 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span className="font-medium">{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-headline font-bold uppercase tracking-wider text-slate-700 dark:text-[#C5DCD6] mb-1.5">
            Your Full Name
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#78887F]">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Helen Bedilu"
              className="w-full bg-white dark:bg-[#101C18] text-slate-900 dark:text-white text-sm font-medium pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E332B] focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-[#78887F] transition-colors"
            />
          </div>
        </div>

        {/* Ethiopian Phone Number */}
        <div>
          <label className="block text-xs font-headline font-bold uppercase tracking-wider text-slate-700 dark:text-[#C5DCD6] mb-1.5">
            Phone Number (Ethiopia)
          </label>
          <div className="relative flex rounded-xl shadow-xs">
            <div className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-200 dark:border-[#1E332B] bg-[#F1F4F1] dark:bg-[#0A1A15] text-slate-700 dark:text-[#C5DCD6] text-xs font-semibold gap-1.5 select-none">
              <span className="text-sm">🇪🇹</span>
              <span className="font-mono text-slate-800 dark:text-white">+251</span>
            </div>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0911 223 344"
              className="block w-full min-w-0 flex-1 rounded-none rounded-r-xl border border-slate-200 dark:border-[#1E332B] px-3.5 py-2.5 text-sm bg-white dark:bg-[#101C18] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#78887F] focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-wide transition-colors"
            />
          </div>
          <span className="text-[11px] text-slate-500 dark:text-[#9BAAA1] mt-1 block">
            Used as your unique sign-in identifier for creator payouts.
          </span>
        </div>

        {/* Telegram Username */}
        <div>
          <label className="block text-xs font-headline font-bold uppercase tracking-wider text-slate-700 dark:text-[#C5DCD6] mb-1.5">
            Telegram Username <span className="text-slate-400 dark:text-[#78887F] font-normal lowercase">(optional)</span>
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#78887F]">
              <Send className="w-4 h-4 text-blue-500" />
            </div>
            <input
              type="text"
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value)}
              placeholder="e.g. @helen_creator"
              className="w-full bg-white dark:bg-[#101C18] text-slate-900 dark:text-white text-sm font-medium pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E332B] focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-[#78887F] transition-colors"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#10352F] hover:bg-[#16443D] active:scale-[0.99] text-white font-headline font-bold text-sm tracking-wide shadow-md shadow-emerald-950/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Activating Creator Portal...</span>
              </>
            ) : (
              <>
                <span>Accept &amp; Open Creator Portal</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-[#1E332B] flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-[#9BAAA1]">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-[#78B99D]" />
        <span>Verified Magic-Link Onboarding · Telebirr Ready</span>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-[#F7F8F5] dark:bg-[#07120F] flex flex-col justify-center items-center px-4 py-12 relative transition-colors duration-200">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-[#10352F] text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-950/20 border border-emerald-400/20 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-headline font-black text-slate-900 dark:text-white tracking-tight">
            EthioLink
          </span>
        </Link>
        <p className="text-xs text-slate-500 dark:text-[#9BAAA1] mt-1 font-body">
          Influencer Campaign Invitation Gateway
        </p>
      </div>

      <Suspense
        fallback={
          <div className="bg-white dark:bg-[#14211D] py-12 px-6 rounded-3xl border border-slate-200/80 dark:border-[#1E332B] shadow-xl max-w-md w-full text-center animate-pulse space-y-4">
            <div className="w-12 h-12 bg-slate-100 dark:bg-[#101C18] rounded-2xl mx-auto mb-4" />
            <div className="w-48 h-6 bg-slate-100 dark:bg-[#101C18] rounded mx-auto mb-2" />
            <div className="w-64 h-4 bg-slate-100 dark:bg-[#101C18] rounded mx-auto mb-6" />
          </div>
        }
      >
        <JoinContent />
      </Suspense>
    </div>
  );
}
