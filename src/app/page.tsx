"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Send,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  ShieldCheck,
  CreditCard,
  MapPin,
  Clock,
  Compass,
  Check,
  Copy,
  ExternalLink,
  Zap,
  PlayCircle,
  QrCode,
  Wallet,
  Globe,
  Radio,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [isSimulatedRedeemed, setIsSimulatedRedeemed] = useState(false);

  const handleCopyCode = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText("ETHIO20");
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSimulateRedemption = () => {
    setIsSimulatedRedeemed((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] dark:bg-[#07120F] text-slate-900 dark:text-slate-100 flex flex-col font-body selection:bg-emerald-600 selection:text-white transition-colors duration-200">
      {/* 1. NAVIGATION HEADER (Preserving navbar-shell layout-container) */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#07120F]/90 backdrop-blur-md border-b border-[#E5E7EB] dark:border-[#1A332C] transition-colors duration-200">
        <div className="navbar-shell layout-container px-[var(--page-px)]">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-[#102F2B] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-150">
                <Sparkles className="w-5 h-5 text-emerald-200" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-black text-xl text-slate-900 dark:text-white tracking-tight leading-none">
                  Ethio<span className="text-emerald-600 dark:text-emerald-400">Link</span>
                </span>
                <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-extrabold tracking-wider uppercase mt-0.5">
                  የኢትዮጵያ ግብይት
                </span>
              </div>
            </Link>

            <div className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#102F2B] text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold tracking-wide">
              የኢትዮጵያ የግብይት መድረክ
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 font-headline text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#how-it-works" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Architecture
            </a>
            <a href="#demo" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Interactive Demo
            </a>
            <a href="#pillars" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Pillars
            </a>
            <a href="#portals" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Portals
            </a>
            <Link
              href="/c/demo-promo"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400"
            >
              <span>Live Campaign</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </Link>
          </nav>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-3">
            <ThemeToggle size="sm" />

            <Link
              href="/c/demo-promo"
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#0E1D19] hover:bg-slate-200 dark:hover:bg-[#132722] text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-[#1A332C] transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>አማ / EN</span>
            </Link>

            <Link
              href="/login"
              className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-xl transition-all"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-emerald-900/30 hover:shadow-emerald-600/30 transition-all duration-150 active:scale-95 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-amber-500/5 to-transparent pointer-events-none rounded-full blur-3xl -z-10" />

        <div className="layout-container px-[var(--page-px)] text-center relative z-10">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0E1D19] border border-slate-200 dark:border-[#1A332C] text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-6 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>OMNICHANNEL INFLUENCER ATTRIBUTION PLATFORM FOR ETHIOPIA</span>
          </div>

          {/* Bold Display Headline with Gradient */}
          <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Measure Real Sales From Influencer Campaigns.{" "}
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 dark:from-emerald-400 dark:via-emerald-500 dark:to-amber-400">
              Not Just Vanity Clicks.
            </span>
          </h1>

          {/* Descriptive Subheadline */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-[#A7BFA8] max-w-3xl mx-auto leading-relaxed">
            Connect Telegram channels, TikTok, and Instagram creator campaigns directly to physical retail branch checkouts,
            phone orders, and Telebirr / CBE Birr settlements across Addis Ababa.
          </p>

          {/* 3 CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-headline font-bold text-base shadow-lg shadow-emerald-950/50 hover:shadow-emerald-600/30 transition-all active:scale-95"
            >
              <span>Register Your Brand</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login?from=/brand/sales"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-[#0E1D19] hover:bg-slate-50 dark:hover:bg-[#132722] text-slate-900 dark:text-slate-100 font-headline font-bold text-base border border-slate-200 dark:border-[#1A332C] shadow-2xs active:scale-95 transition-all"
            >
              <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>In-Store POS Terminal</span>
            </Link>

            <Link
              href="/c/demo-promo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-amber-50 dark:bg-[#1C1608] hover:bg-amber-100 dark:hover:bg-[#281F0B] text-amber-900 dark:text-amber-300 font-headline font-bold text-base border border-amber-200/80 dark:border-amber-800/80 active:scale-95 transition-all"
            >
              <PlayCircle className="w-4 h-4 text-amber-500" />
              <span>View Campaign Demo</span>
            </Link>
          </div>

          {/* Trust Badge Row */}
          <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Trusted by roasteries, fashion houses &amp; retail chains in Bole, Kazanchis, and Sarbet</span>
          </div>
        </div>
      </section>

      {/* 3. HERO FEATURE / INTERACTIVE DEMO SHOWCASE CARD */}
      <section id="demo" className="py-12 bg-white dark:bg-[#0E1D19] border-y border-slate-200 dark:border-[#1A332C] transition-colors duration-200">
        <div className="layout-container px-[var(--page-px)]">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#F7F8F5] dark:bg-[#07120F] border border-slate-200 dark:border-[#1A332C] rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden">
            {/* Left Column: How Attribution Works in Addis Ababa */}
            <div className="lg:col-span-7 space-y-5" id="how-it-works">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#102F2B] text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Architecture Flow</span>
              </div>

              <div>
                <h2 className="font-headline text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  How Attribution Works in Addis Ababa
                </h2>
                <p className="font-body text-xs sm:text-sm text-slate-600 dark:text-[#A7BFA8] mt-1 leading-relaxed">
                  Bridge the gap between virtual social views and high-street cash registers. No guesswork, no vanity metrics.
                </p>
              </div>

              {/* 3 Steps */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 dark:bg-[#102F2B] text-emerald-700 dark:text-emerald-300 font-headline font-bold text-sm flex items-center justify-center border border-emerald-200 dark:border-emerald-500/40">
                    1
                  </div>
                  <div>
                    <h3 className="font-headline font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                      Creator Distributes Custom Token
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-[#A7BFA8] mt-0.5 leading-relaxed">
                      Creator posts trackable Telegram bot deep-link or voucher code{" "}
                      <code className="px-2 py-0.5 rounded bg-white dark:bg-[#07120F] text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs border border-slate-200 dark:border-[#1A332C]">
                        ETHIO20
                      </code>{" "}
                      across TikTok and Telegram channels.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 dark:bg-[#102F2B] text-emerald-700 dark:text-emerald-300 font-headline font-bold text-sm flex items-center justify-center border border-emerald-200 dark:border-emerald-500/40">
                    2
                  </div>
                  <div>
                    <h3 className="font-headline font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                      Customer Orders or Visits Retail Branch
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-[#A7BFA8] mt-0.5 leading-relaxed">
                      Follower orders immediately via integrated Telegram mini-bot, or visits the storefront at{" "}
                      <span className="font-semibold text-slate-900 dark:text-slate-200">Bole Medhanialem branch</span> showing the campaign pass.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 dark:bg-[#102F2B] text-emerald-700 dark:text-emerald-300 font-headline font-bold text-sm flex items-center justify-center border border-emerald-200 dark:border-emerald-500/40">
                    3
                  </div>
                  <div>
                    <h3 className="font-headline font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                      Instant POS Verification &amp; Payout
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-[#A7BFA8] mt-0.5 leading-relaxed">
                      Cashier inputs the code on EthioLink terminal or confirms Telebirr/CBE payment. A verified 10% commission is credited directly to the creator&apos;s ledger.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-second latency badge */}
              <div className="pt-3 border-t border-slate-200 dark:border-[#1A332C] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Sub-second POS transaction sync</span>
                </span>
                <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">API Latency: 42ms</span>
              </div>
            </div>

            {/* Right Column: Interactive Live Campaign Card Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm bg-white dark:bg-[#0E1D19] rounded-2xl border border-slate-200 dark:border-[#1A332C] shadow-2xl p-6 space-y-4">
                {/* Store & Creator Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 text-[#D4AF37] border border-[#1A332C] flex items-center justify-center font-headline font-bold text-lg shadow-inner">
                      SA
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                        <span>Sheba Artisan Coffee</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>Bole Medhanialem Mall, Ground Fl.</span>
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-[#D4AF37] font-label text-[10px] font-extrabold border border-amber-200 dark:border-amber-600/40">
                    ACTIVE DEAL
                  </span>
                </div>

                {/* Campaign Hero Details */}
                <div className="bg-slate-50 dark:bg-[#07120F] rounded-xl p-3.5 border border-slate-100 dark:border-[#1A332C]">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-300 font-medium">Verified Offer:</span>
                    <span className="font-headline font-extrabold text-emerald-600 dark:text-emerald-400 text-base">20% OFF</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-[#A7BFA8] leading-snug">
                    Signature Yirgacheffe Single-Origin Pourover &amp; Roasted Beans Package.
                  </p>
                </div>

                {/* Voucher Code Box with Copy Interaction */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Influencer Redemption Code
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-[#07120F] border-2 border-dashed border-emerald-400 dark:border-emerald-500/50 rounded-xl p-3">
                    <span className="font-mono text-xl font-black tracking-widest text-emerald-700 dark:text-emerald-400">
                      ETHIO20
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-headline text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Action Buttons for Customer */}
                <div className="space-y-2 pt-1">
                  {/* Telegram Bot Direct Button */}
                  <a
                    href="https://t.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#229ED9] hover:bg-[#1C88BD] text-white font-headline text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Order via Telegram Bot (@shebacoffee)</span>
                  </a>

                  {/* Cashier Scan In-Store Simulation */}
                  <button
                    type="button"
                    onClick={handleSimulateRedemption}
                    className={`w-full flex items-center justify-center gap-2 font-headline text-xs font-semibold py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
                      isSimulatedRedeemed
                        ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-2 border-emerald-500 shadow-xs"
                        : "bg-slate-100 dark:bg-[#132722] hover:bg-slate-200 dark:hover:bg-[#1a3830] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#1A332C]"
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-500" />
                    <span>
                      {isSimulatedRedeemed
                        ? "✓ Verified at Cashier: 200 ETB Credited"
                        : "Simulate Cashier Terminal Scan"}
                    </span>
                  </button>
                </div>

                {/* Guaranteed Settlement Badge */}
                <div className="pt-2 border-t border-slate-100 dark:border-[#1A332C] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Wallet className="w-3 h-3 text-emerald-500" />
                    <span>Direct Telebirr &amp; CBE Settlement</span>
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">10% Commission</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SOCIAL PROOF / METRIC STRIP */}
      <section className="border-b border-slate-200 dark:border-[#1A332C] bg-[#F7F8F5] dark:bg-[#0E1D19] py-12 transition-colors duration-200">
        <div className="layout-container px-[var(--page-px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-[#07120F] border border-slate-200/80 dark:border-[#1A332C] shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-[#102F2B] text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="font-headline font-bold text-2xl text-slate-900 dark:text-white">100%</div>
                <div className="font-headline font-semibold text-slate-800 dark:text-slate-200 text-sm">Measurable Attribution</div>
                <p className="text-xs text-slate-500 dark:text-[#A7BFA8] mt-1 leading-snug">No cookie reliance; tied directly to unique customer codes &amp; POS scans.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-[#07120F] border border-slate-200/80 dark:border-[#1A332C] shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-amber-950/40 text-[#D4AF37] border border-amber-600/30 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="font-headline font-bold text-2xl text-slate-900 dark:text-white">ETB Native</div>
                <div className="font-headline font-semibold text-slate-800 dark:text-slate-200 text-sm">Currency Precision</div>
                <p className="text-xs text-slate-500 dark:text-[#A7BFA8] mt-1 leading-snug">Automatic payouts routing into Telebirr, CBE Birr, and Awash bank accounts.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-[#07120F] border border-slate-200/80 dark:border-[#1A332C] shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-blue-950/40 text-blue-400 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <div className="font-headline font-bold text-2xl text-slate-900 dark:text-white">አማርኛ &amp; EN</div>
                <div className="font-headline font-semibold text-slate-800 dark:text-slate-200 text-sm">Bilingual Workflow</div>
                <p className="text-xs text-slate-500 dark:text-[#A7BFA8] mt-1 leading-snug">Engineered natively for both fast-paced retail baristas and executive marketing boards.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-[#07120F] border border-slate-200/80 dark:border-[#1A332C] shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-[#132722] text-slate-200 border border-[#1A332C] flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="font-headline font-bold text-2xl text-slate-900 dark:text-white">0 Fake Clicks</div>
                <div className="font-headline font-semibold text-slate-800 dark:text-slate-200 text-sm">Strict Anti-Fraud</div>
                <p className="text-xs text-slate-500 dark:text-[#A7BFA8] mt-1 leading-snug">Only tendered receipts and verified mobile transfers earn influencer royalties.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CORE PILLARS GRID */}
      <section id="pillars" className="py-20 bg-white dark:bg-[#07120F] transition-colors duration-200">
        <div className="layout-container px-[var(--page-px)]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#102F2B] text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/30">
              Engineered for Ethiopian Commerce
            </div>
            <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
              The Omnichannel Attribution Triangle
            </h2>
            <p className="font-body text-slate-600 dark:text-[#A7BFA8] mt-3 text-base sm:text-lg">
              Bridging the unique realities of Telegram shopping culture, foot traffic across Addis Ababa shopping centres, and mobile wallet reconciliation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1: Telegram & Social Traffic */}
            <div className="bg-[#F7F8F5] dark:bg-[#0E1D19] rounded-2xl border border-slate-200 dark:border-[#1A332C] p-7 shadow-lg flex flex-col justify-between hover:border-emerald-600/50 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-950/40 text-blue-400 flex items-center justify-center mb-6 border border-blue-500/30">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="font-headline font-bold text-xl text-slate-900 dark:text-white mb-2">Telegram &amp; Social Traffic</h3>
                <p className="text-sm text-slate-600 dark:text-[#A7BFA8] leading-relaxed mb-6">
                  Track engagement from high-reach Ethiopian Telegram channels and TikTok live sessions through automated tracking tokens and bot webapps.
                </p>
              </div>

              {/* Mini UI Preview: Telegram Bot Order */}
              <div className="bg-white dark:bg-[#07120F] rounded-xl p-4 border border-slate-200 dark:border-[#1A332C] text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400 mb-2 pb-2 border-b border-slate-100 dark:border-[#1A332C]">
                  <span>t.me/ethio_bot?start=aff_sheba</span>
                  <span className="text-emerald-500 font-bold">200 OK</span>
                </div>
                <div className="space-y-1 text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Channel:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">@TasteAddis</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Token:</span>
                    <span className="text-blue-500 font-bold">TK-9842-BOLE</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold pt-1">
                    <span>Attributed:</span>
                    <span>18,450.00 ETB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 2: In-Store Sales Attribution */}
            <div className="bg-[#F7F8F5] dark:bg-[#0E1D19] rounded-2xl border border-slate-200 dark:border-[#1A332C] p-7 shadow-lg flex flex-col justify-between hover:border-emerald-600/50 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#102F2B] text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/30">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="font-headline font-bold text-xl text-slate-900 dark:text-white mb-2">In-Store Sales Attribution</h3>
                <p className="text-sm text-slate-600 dark:text-[#A7BFA8] leading-relaxed mb-6">
                  Equip retail staff at your physical stores with ultra-fast web POS verification. Prevent voucher abuse and duplicate code exploitation.
                </p>
              </div>

              {/* Mini UI Preview: POS Validation */}
              <div className="bg-white dark:bg-[#07120F] rounded-xl p-4 border border-slate-200 dark:border-[#1A332C] text-xs">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-[#1A332C]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="font-headline font-bold text-slate-900 dark:text-white">Branch POS #04 Verified</span>
                </div>
                <div className="space-y-1.5 font-mono text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Receipt Ref:</span>
                    <span>#ETB-99381</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gross Order:</span>
                    <span className="font-bold text-slate-900 dark:text-white">2,450.00 ETB</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Creator Payout:</span>
                    <span>245.00 ETB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 3: Creator & Brand Dashboards */}
            <div className="bg-[#F7F8F5] dark:bg-[#0E1D19] rounded-2xl border border-slate-200 dark:border-[#1A332C] p-7 shadow-lg flex flex-col justify-between hover:border-emerald-600/50 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-950/40 text-[#D4AF37] flex items-center justify-center mb-6 border border-amber-600/30">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-headline font-bold text-xl text-slate-900 dark:text-white mb-2">Creator &amp; Brand Dashboards</h3>
                <p className="text-sm text-slate-600 dark:text-[#A7BFA8] leading-relaxed mb-6">
                  Radical transparency: Brand executives review verifiable ROAS and creator payout obligations, while creators request 1-tap Telebirr payouts.
                </p>
              </div>

              {/* Mini UI Preview: Dashboard Summary */}
              <div className="bg-white dark:bg-[#07120F] rounded-xl p-4 border border-slate-200 dark:border-[#1A332C] text-xs">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-[#1A332C]">
                  <span className="font-headline font-semibold text-slate-700 dark:text-slate-300">Live ROAS Metric</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#102F2B] text-emerald-300 font-bold border border-emerald-500/30">10.2x</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Unsettled Commissions:</span>
                    <span className="font-bold text-slate-900 dark:text-white">4,120.00 ETB</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-[#132722] h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-emerald-500 h-full rounded-full w-4/5" />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span>Telebirr Ready</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">98% Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. UNIFIED PORTALS SECTION */}
      <section id="portals" className="py-20 bg-[#F7F8F5] dark:bg-[#07120F] border-t border-slate-200 dark:border-[#1A332C] transition-colors duration-200">
        <div className="layout-container px-[var(--page-px)]">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
              Unified Portals for Every Stakeholder
            </h2>
            <p className="font-body text-slate-600 dark:text-[#A7BFA8] mt-3 text-base">
              Tailored interfaces designed specifically for brand management, shop floor operators, and social creators.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Portal 1: Brand Owners & Merchants */}
            <div className="bg-white dark:bg-[#0E1D19] rounded-2xl border border-slate-200 dark:border-[#1A332C] p-8 shadow-lg flex flex-col justify-between hover:border-emerald-600/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="p-3 bg-[#102F2B] text-emerald-400 rounded-xl border border-emerald-500/30">
                    <BarChart3 className="w-6 h-6" />
                  </span>
                  <span className="font-mono text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-[#07120F] rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1A332C]">
                    Enterprise
                  </span>
                </div>
                <h3 className="font-headline font-bold text-xl text-slate-900 dark:text-white mb-2">For Brand Owners &amp; Merchants</h3>
                <p className="text-sm text-slate-600 dark:text-[#A7BFA8] mb-6 leading-relaxed">
                  Launch attribution campaigns across unlimited creator partners, review branch-by-branch revenues, and export tax &amp; withholding-ready audit logs.
                </p>
                <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-200 mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Multi-branch revenue tracking (Bole, Kazanchis, Piassa)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Automated commission settlement with CBE &amp; Telebirr</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Anti-fraud redemption velocity safeguards</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/login?from=/brand"
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-[#132722] dark:hover:bg-[#1b362f] text-white border border-slate-700 dark:border-[#1A332C] font-headline text-sm font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer"
              >
                <span>Open Merchant Console</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            {/* Portal 2: In-Store Retail Staff */}
            <div className="bg-white dark:bg-[#0E1D19] rounded-2xl border border-slate-200 dark:border-[#1A332C] p-8 shadow-lg flex flex-col justify-between hover:border-emerald-600/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="p-3 bg-blue-950/40 text-blue-400 rounded-xl border border-blue-500/30">
                    <Store className="w-6 h-6" />
                  </span>
                  <span className="font-mono text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-[#07120F] rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1A332C]">
                    POS Terminal
                  </span>
                </div>
                <h3 className="font-headline font-bold text-xl text-slate-900 dark:text-white mb-2">For In-Store Retail Staff</h3>
                <p className="text-sm text-slate-600 dark:text-[#A7BFA8] mb-6 leading-relaxed">
                  Lightning-fast cashier web application built for touchscreens and smartphones. Validate creator coupons and record cash/Telebirr tickets in under 2 seconds.
                </p>
                <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-200 mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Single-click barcode &amp; alphanumeric validation</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Intuitive Amharic (አማርኛ) cashier interface</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Works offline during local network flickers</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/login?from=/brand/sales"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-headline text-sm font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-950/50 transition-colors cursor-pointer"
              >
                <span>Explore POS Interface</span>
                <Store className="w-4 h-4" />
              </Link>
            </div>

            {/* Portal 3: Creators & Influencers */}
            <div className="bg-white dark:bg-[#0E1D19] rounded-2xl border border-slate-200 dark:border-[#1A332C] p-8 shadow-lg flex flex-col justify-between hover:border-emerald-600/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="p-3 bg-amber-950/40 text-[#D4AF37] rounded-xl border border-amber-600/30">
                    <Users className="w-6 h-6" />
                  </span>
                  <span className="font-mono text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-[#07120F] rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1A332C]">
                    Influencer
                  </span>
                </div>
                <h3 className="font-headline font-bold text-xl text-slate-900 dark:text-white mb-2">For Creators &amp; Influencers</h3>
                <p className="text-sm text-slate-600 dark:text-[#A7BFA8] mb-6 leading-relaxed">
                  Generate dynamic referral codes, monitor clicks and completed store visits in real time, and request transparent commission payouts directly to your Telebirr wallet.
                </p>
                <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-200 mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Live push notifications for physical retail conversions</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Guaranteed minimum commission contracts</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Zero delay instant Telebirr cashout threshold</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/login?from=/creator"
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-[#132722] dark:hover:bg-[#1b362f] text-white border border-slate-700 dark:border-[#1A332C] font-headline text-sm font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer"
              >
                <span>Access Creator Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HIGH-IMPACT DEEP EVERGREEN CONVERSION BANNER */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-[#0E1D19] rounded-3xl p-8 sm:p-14 lg:p-16 text-white relative overflow-hidden shadow-2xl border border-[#1A332C]">
          {/* Golden Ambient Glow Elements */}
          <div className="absolute -right-24 -top-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#102F2B] border border-emerald-600/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Ready For Q3 Campaigns in Addis Ababa</span>
            </div>

            <h2 className="font-headline font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
              Ready to stop guessing your influencer marketing ROI?
            </h2>

            <p className="font-body text-[#A7BFA8] text-base sm:text-lg leading-relaxed max-w-2xl">
              Join leading Addis Ababa brands and top creators driving verified omnichannel commerce today. Setup takes under 15 minutes.
            </p>

            {/* Dual Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-headline text-base font-bold px-7 py-4 rounded-xl shadow-lg shadow-emerald-950/60 transition-all active:scale-95"
              >
                <span>Start Free Merchant Trial</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#132722] hover:bg-[#1a3830] text-slate-200 border border-[#1A332C] font-headline text-base font-semibold px-6 py-4 rounded-xl transition-all"
              >
                <Clock className="w-5 h-5 text-amber-400" />
                <span>Schedule Live Walkthrough</span>
              </Link>
            </div>

            {/* Local Assurance */}
            <div className="pt-6 border-t border-[#1A332C] flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>No upfront hardware needed</span>
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>Works with existing Telebirr &amp; CBE merchant accounts</span>
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>Cancel anytime</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. COMPREHENSIVE FOOTER */}
      <footer className="bg-white dark:bg-[#07120F] border-t border-slate-200 dark:border-[#1A332C] py-14 transition-colors duration-200">
        <div className="layout-container px-[var(--page-px)]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-200 dark:border-[#1A332C]">
            {/* Brand Signature & Address */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-2 font-headline font-black text-xl text-emerald-600 dark:text-emerald-400 tracking-tight">
                <div className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                </div>
                <span>EthioLink</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal font-semibold">
                የኢትዮጵያ የግብይትና ተጽዕኖ ፈጣሪዎች የድጋፍ መድረክ።
              </p>
              <div className="text-xs text-slate-500 dark:text-[#A7BFA8] leading-relaxed font-body">
                <p className="font-semibold text-slate-800 dark:text-slate-300">Addis Ababa Headquarters</p>
                <p>Bole Sub-City, Next to Edna Mall,</p>
                <p>Addis Ababa, Ethiopia.</p>
              </div>
            </div>

            {/* Products */}
            <div className="space-y-3">
              <div className="font-headline font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">Products</div>
              <ul className="space-y-2 text-xs font-body text-slate-600 dark:text-slate-400">
                <li><Link className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" href="/login?from=/brand">Merchant Hub</Link></li>
                <li><Link className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" href="/login?from=/creator">Creator Portal</Link></li>
                <li><Link className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" href="/login?from=/brand/sales">In-Store POS Terminal</Link></li>
                <li><Link className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" href="/admin">Audit &amp; Tax Ledger</Link></li>
                <li><Link className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" href="/c/demo-promo">Telegram Bot SDK</Link></li>
              </ul>
            </div>

            {/* Compliance & Legal */}
            <div className="space-y-3">
              <div className="font-headline font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">Compliance &amp; Trust</div>
              <ul className="space-y-2 text-xs font-body text-slate-600 dark:text-slate-400">
                <li>
                  <Link className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1" href="/privacy">
                    <span>Verified Attribution Guarantee</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  </Link>
                </li>
                <li><span className="text-slate-500 dark:text-slate-500">Tax &amp; TIN Withholding</span></li>
                <li><Link className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" href="/privacy">Privacy Policy</Link></li>
                <li><span className="text-slate-500 dark:text-slate-500">Merchant Service Agreement</span></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-3">
              <div className="font-headline font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">Support &amp; Community</div>
              <ul className="space-y-2 text-xs font-body text-slate-600 dark:text-slate-400">
                <li>
                  <a className="hover:text-blue-500 transition-colors flex items-center gap-1.5 text-blue-500 font-medium" href="https://t.me/ethiolink_support" target="_blank" rel="noopener noreferrer">
                    <Send className="w-3 h-3" />
                    <span>Telegram Support</span>
                  </a>
                </li>
                <li><Link className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" href="/api/health">Developer Documentation</Link></li>
                <li><span className="text-slate-500 dark:text-slate-500">Bole Merchant Concierge</span></li>
                <li className="pt-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">Call: +251 11 667 8900</li>
              </ul>
            </div>
          </div>

          {/* Copyright & Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-body gap-4">
            <div>
              © 2026 EthioLink attribution platform. Bole, Addis Ababa, Ethiopia.
            </div>
            <div className="flex items-center gap-6">
              <Link className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" href="/privacy">Privacy Policy</Link>
              <Link className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" href="/privacy">Terms of Service</Link>
              <a className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" href="https://t.me/ethiolink_support" target="_blank" rel="noopener noreferrer">Telegram Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
