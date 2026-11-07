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
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F7F8F5] dark:bg-[#07120F] text-slate-900 dark:text-slate-100 flex flex-col font-body selection:bg-emerald-100 dark:selection:bg-emerald-900/50 selection:text-emerald-900 dark:selection:text-emerald-200 transition-colors duration-200">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0E1D19]/95 backdrop-blur-md border-b border-[#E5E7EB] dark:border-[#1A332C] transition-colors duration-200">
        <div className="navbar-shell layout-container px-[var(--page-px)]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-[#102F2B] text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-emerald-200" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-black text-xl text-slate-900 dark:text-white tracking-tight leading-none">
                Ethio<span className="text-emerald-600 dark:text-emerald-400">Link</span>
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-extrabold tracking-wider uppercase mt-0.5">
                የኢትዮጵያ የግብይት መድረክ
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600 dark:text-slate-300">
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

          <div className="flex items-center gap-3">
            <ThemeToggle size="sm" />
            <Link
              href="/login"
              className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-xl transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-sm shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent pointer-events-none rounded-full blur-3xl -z-10" />

        <div className="layout-container px-[var(--page-px)] text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-[#0E231D] border border-emerald-200/90 dark:border-[#1F453A] text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-6 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>OMNICHANNEL INFLUENCER ATTRIBUTION PLATFORM FOR ETHIOPIA</span>
          </div>

          <h1 className="font-headline text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Measure Real Sales From Influencer Campaigns.{" "}
            <span className="text-amber-600 dark:text-amber-400 block sm:inline">
              Not Just Vanity Clicks.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Connect Telegram channels, TikTok, and Instagram creator campaigns directly to physical retail branch checkouts,
            phone orders, and Telebirr / CBE Birr settlements across Addis Ababa.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-headline font-bold text-base shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
            >
              <span>Register Your Brand</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login?from=/brand/sales"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-[#0E1D19] hover:bg-slate-50 dark:hover:bg-[#142923] text-slate-800 dark:text-slate-200 font-headline font-bold text-base border border-slate-200 dark:border-[#1A332C] shadow-2xs active:scale-95 transition-all"
            >
              <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>In-Store POS Terminal</span>
            </Link>

            <Link
              href="/c/demo-promo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-amber-50 dark:bg-[#1C1608] hover:bg-amber-100 dark:hover:bg-[#281F0B] text-amber-900 dark:text-amber-300 font-headline font-bold text-base border border-amber-200/80 dark:border-amber-800/80 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>View Campaign Demo</span>
            </Link>
          </div>

          {/* Trust badge row */}
          <div className="mt-6 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Trusted by roasteries, fashion houses &amp; retail chains in Bole, Kazanchis, and Sarbet</span>
          </div>
        </div>
      </section>

      {/* Architecture Flow & Interactive Demo Showcase Card */}
      <section id="demo" className="py-12 bg-white dark:bg-[#0E1D19] border-y border-slate-200 dark:border-[#1A332C] transition-colors duration-200">
        <div className="layout-container px-[var(--page-px)]">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#F7F8F5] dark:bg-[#07120F] border border-slate-200 dark:border-[#1F453A] rounded-3xl p-6 sm:p-10 shadow-xs">
            {/* Left Column: How Attribution Works in Addis Ababa */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-[#0E231D] text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-[#1F453A] text-xs font-extrabold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>ARCHITECTURE FLOW</span>
              </div>

              <div>
                <h2 className="font-headline text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  How Attribution Works in Addis Ababa
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Bridge the gap between virtual social views and high-street cash registers. No guesswork, no vanity metrics.
                </p>
              </div>

              {/* 3 Step List */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                    1
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      Creator Distributes Custom Token
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Creator posts trackable Telegram bot deep-link or voucher code{" "}
                      <code className="bg-emerald-50 dark:bg-[#0E231D] text-emerald-700 dark:text-emerald-400 px-1 py-0.5 rounded font-mono font-bold text-[11px]">
                        ETHIO20
                      </code>{" "}
                      across TikTok and Telegram channels.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                    2
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      Customer Orders or Visits Retail Branch
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Follower orders immediately via integrated Telegram mini-bot, or visits the storefront at{" "}
                      <strong>Bole Medhanialem branch</strong> showing the campaign pass.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                    3
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      Instant POS Verification &amp; Payout
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Cashier inputs code on EthioLink terminal or confirms Telebirr/CBE payment. A verified 10% commission is credited directly to the creator&apos;s ledger.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-second latency badge */}
              <div className="pt-3 border-t border-slate-200 dark:border-[#1A332C] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Sub-second POS transaction sync</span>
                </span>
                <span className="font-mono">API Latency: 42ms</span>
              </div>
            </div>

            {/* Right Column: Realistic Campaign Landing Voucher Preview */}
            <div className="lg:col-span-5 bg-white dark:bg-[#0E1D19] border-2 border-dashed border-emerald-400 dark:border-emerald-600 rounded-2xl p-5 shadow-xs flex flex-col items-center text-center">
              <div className="w-full flex items-center justify-between mb-3 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                    SA
                  </div>
                  <div>
                    <div className="font-headline font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                      <span>Sheba Artisan Coffee</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Bole Medhanialem Mall, Ground Fl.
                    </div>
                  </div>
                </div>
                <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  ACTIVE DEAL
                </span>
              </div>

              <div className="w-full bg-slate-50 dark:bg-[#12221E] rounded-xl p-3 mb-3 text-left border border-slate-100 dark:border-[#1F453A]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Verified Offer:
                  </span>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                    20% OFF
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  Signature Yirgacheffe Single-Origin Pourover &amp; Roasted Beans Package
                </div>
              </div>

              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 dark:text-emerald-400 mb-1">
                INFLUENCER REDEMPTION CODE
              </span>

              {/* Code Box */}
              <div className="w-full bg-slate-50 dark:bg-[#07120F] border border-emerald-300 dark:border-[#1F453A] rounded-xl py-2 px-3 mb-3 flex items-center justify-between">
                <span className="font-mono font-black text-2xl tracking-widest text-emerald-700 dark:text-emerald-400">
                  ETHIO20
                </span>
                <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-1 rounded-md flex items-center gap-1">
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </span>
              </div>

              {/* Actions */}
              <div className="w-full space-y-2 mb-3">
                <Link
                  href="/c/demo-promo"
                  className="w-full bg-[#229ED9] hover:bg-[#1C88BD] text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Order via Telegram Bot (@shebacoffee)</span>
                </Link>

                <Link
                  href="/brand/sales"
                  className="w-full bg-slate-100 dark:bg-[#182C26] hover:bg-slate-200 dark:hover:bg-[#203a32] text-slate-800 dark:text-slate-200 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 dark:border-[#1F453A] transition-colors"
                >
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Simulate Cashier Terminal Scan</span>
                </Link>
              </div>

              <div className="w-full pt-2 border-t border-slate-100 dark:border-[#1F453A] flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>✓ Direct Telebirr &amp; CBE Settlement</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">10% Commission</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Up Metrics Strip */}
      <section className="py-12 bg-[#F7F8F5] dark:bg-[#07120F] border-b border-slate-200 dark:border-[#1A332C] transition-colors duration-200">
        <div className="layout-container px-[var(--page-px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1D19] border border-slate-200/80 dark:border-[#1A332C] shadow-2xs">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-headline text-xl font-black text-slate-900 dark:text-white">
                  100%
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-200">
                Measurable Attribution
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                No cookie reliance; tied directly to unique customer codes &amp; POS scans.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1D19] border border-slate-200/80 dark:border-[#1A332C] shadow-2xs">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span className="font-headline text-xl font-black text-emerald-600 dark:text-emerald-400">
                  ETB Native
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-200">
                Currency Precision
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                Automatic payouts routing into Telebirr, CBE Birr, and Awash bank accounts.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1D19] border border-slate-200/80 dark:border-[#1A332C] shadow-2xs">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="font-headline text-xl font-black text-slate-900 dark:text-white">
                  አማርኛ &amp; EN
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-200">
                Bilingual Workflow
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                Engineered natively for both fast-paced retail baristas and executive marketing boards.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1D19] border border-slate-200/80 dark:border-[#1A332C] shadow-2xs">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-headline text-xl font-black text-emerald-600 dark:text-emerald-400">
                  0 Fake Clicks
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-200">
                Strict Anti-Fraud
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                Only tendered receipts and verified mobile transfers earn influencer royalties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Omnichannel Attribution Triangle (Core Pillars) */}
      <section id="pillars" className="py-16 sm:py-24 bg-white dark:bg-[#0E1D19] transition-colors duration-200">
        <div className="layout-container px-[var(--page-px)]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-[#0E231D] text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-[#1F453A] text-xs font-extrabold uppercase tracking-wider mb-3">
              <span>ENGINEERED FOR ETHIOPIAN COMMERCE</span>
            </div>
            <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              The Omnichannel Attribution Triangle
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
              Bridging the unique realities of Telegram shopping culture, foot traffic across Addis Ababa shopping centres, and mobile wallet reconciliation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-[#F7F8F5] dark:bg-[#07120F] border border-slate-200/80 dark:border-[#1A332C] flex flex-col justify-between shadow-2xs">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#229ED9] flex items-center justify-center mb-5 border border-sky-100 dark:border-sky-900/50">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Telegram &amp; Social Traffic
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Track engagement from high-reach Ethiopian creator partners, review branch-by-branch revenues, and export tax &amp; withholding-ready audit logs.
                </p>

                {/* Mini Code Receipt */}
                <div className="mt-4 p-3 rounded-xl bg-white dark:bg-[#0E1D19] border border-slate-200 dark:border-[#1A332C] font-mono text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>t.me/ethio_bot?start=aff_sheba</span>
                    <span className="text-emerald-600 font-bold">200 OK</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Channel:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">@TasteAddis</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Attributed:</span>
                    <span className="font-bold text-emerald-600">18,450.00 ETB</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#1A332C] text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero-friction social funnels</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-[#F7F8F5] dark:bg-[#07120F] border border-slate-200/80 dark:border-[#1A332C] flex flex-col justify-between shadow-2xs">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 border border-amber-100 dark:border-amber-900/50">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-white mb-2">
                  In-Store Sales Attribution
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Equip retail staff at your physical stores with ultra-fast web POS verification. Prevent voucher abuse and duplicate code exploitation.
                </p>

                {/* Mini POS Receipt */}
                <div className="mt-4 p-3 rounded-xl bg-white dark:bg-[#0E1D19] border border-slate-200 dark:border-[#1A332C] font-mono text-[11px] space-y-1">
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                    <span>✓ Branch POS #04 Verified</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Receipt Ref:</span>
                    <span className="text-slate-700 dark:text-slate-300">#ETB-99381</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gross Order:</span>
                    <span className="font-bold text-slate-900 dark:text-white">2,450.00 ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Creator Payout:</span>
                    <span className="font-bold text-emerald-600">245.00 ETB</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#1A332C] text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Instant promo code matching</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-[#F7F8F5] dark:bg-[#07120F] border border-slate-200/80 dark:border-[#1A332C] flex flex-col justify-between shadow-2xs">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-[#0E231D] text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 border border-emerald-100 dark:border-[#1F453A]">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Creator &amp; Brand Dashboards
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Radical transparency: Brand executives review verifiable ROAS and creator payout obligations, while creators request 1-tap Telebirr payouts.
                </p>

                {/* Mini Dashboard Metrics */}
                <div className="mt-4 p-3 rounded-xl bg-white dark:bg-[#0E1D19] border border-slate-200 dark:border-[#1A332C] font-mono text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Live ROAS Metric:</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 dark:bg-[#0E231D] px-1.5 py-0.5 rounded">
                      10.2x
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Unsettled Commissions:</span>
                    <span className="font-bold text-slate-900 dark:text-white">4,120.00 ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Telebirr Ready:</span>
                    <span className="font-bold text-emerald-600">98% Verified</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#1A332C] text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Real-time conversion reporting</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Portals for Every Stakeholder */}
      <section id="portals" className="py-16 sm:py-24 bg-[#F7F8F5] dark:bg-[#07120F] border-t border-slate-200 dark:border-[#1A332C] transition-colors duration-200">
        <div className="layout-container px-[var(--page-px)]">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-headline text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Unified Portals for Every Stakeholder
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Tailored interfaces designed specifically for brand management, shop floor operators, and social creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Brand Owners */}
            <div className="bg-white dark:bg-[#0E1D19] p-6 rounded-2xl border border-slate-200/80 dark:border-[#1A332C] shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-[#0E231D] text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-200 dark:border-[#1F453A]">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-[#182C26] px-2 py-0.5 rounded">
                    Enterprise
                  </span>
                </div>

                <h4 className="font-headline font-bold text-slate-900 dark:text-white text-base">
                  For Brand Owners &amp; Merchants
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 mb-4">
                  Launch attribution campaigns across unlimited creator partners, review branch-by-branch revenues, and export tax &amp; withholding-ready audit logs.
                </p>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Multi-branch revenue tracking (Bole, Kazanchis, Piassa)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Automated commission settlement with CBE &amp; Telebirr</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Anti-fraud redemption velocity safeguards</span>
                  </div>
                </div>
              </div>

              <Link
                href="/login?from=/brand"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition-colors"
              >
                <span>Open Merchant Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* In-Store Staff */}
            <div className="bg-white dark:bg-[#0E1D19] p-6 rounded-2xl border border-slate-200/80 dark:border-[#1A332C] shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold border border-amber-200 dark:border-amber-800">
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-[#182C26] px-2 py-0.5 rounded">
                    POS Terminal
                  </span>
                </div>

                <h4 className="font-headline font-bold text-slate-900 dark:text-white text-base">
                  For In-Store Retail Staff
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 mb-4">
                  Lightning-fast cashier web application built for touchscreens and smartphones. Validate creator coupons and record cash/Telebirr tickets in under 2 seconds.
                </p>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-600" />
                    <span>Single-click barcode &amp; alphanumeric validation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-600" />
                    <span>Intuitive Amharic (አማርኛ) cashier interface</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-600" />
                    <span>Works offline during local network flickers</span>
                  </div>
                </div>
              </div>

              <Link
                href="/login?from=/brand/sales"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
              >
                <span>Explore POS Interface</span>
                <Store className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Creators & Influencers */}
            <div className="bg-white dark:bg-[#0E1D19] p-6 rounded-2xl border border-slate-200/80 dark:border-[#1A332C] shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-[#0E231D] text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold border border-teal-200 dark:border-[#1F453A]">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-[#182C26] px-2 py-0.5 rounded">
                    Influencer
                  </span>
                </div>

                <h4 className="font-headline font-bold text-slate-900 dark:text-white text-base">
                  For Creators &amp; Influencers
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 mb-4">
                  Generate dynamic referral codes, monitor clicks and completed store visits in real time, and request transparent commission payouts directly to your Telebirr wallet.
                </p>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                    <span>Live push notifications for physical retail conversions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                    <span>Guaranteed minimum commission contracts</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                    <span>Zero delay instant Telebirr cashout threshold</span>
                  </div>
                </div>
              </div>

              <Link
                href="/login?from=/creator"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition-colors"
              >
                <span>Access Creator Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* High-Impact Deep Evergreen Conversion Banner */}
      <section className="bg-gradient-to-br from-[#102F2B] via-[#0E231D] to-[#07120F] text-white py-16 border-t border-[#1A332C]">
        <div className="layout-container px-[var(--page-px)] text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-4 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>READY FOR Q3 CAMPAIGNS IN ADDIS ABABA</span>
          </div>

          <h2 className="font-headline text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto">
            Ready to stop guessing your influencer marketing ROI?
          </h2>

          <p className="mt-4 text-emerald-100/80 max-w-xl mx-auto text-sm sm:text-base">
            Join leading Addis Ababa brands and top creators driving verified omnichannel commerce today. Setup takes under 15 minutes.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-headline font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <span>Start Free Merchant Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-headline font-bold text-sm border border-white/20 transition-all cursor-pointer"
            >
              <span>Schedule Live Walkthrough</span>
            </Link>
          </div>

          <div className="mt-6 text-xs text-emerald-200/60 flex items-center justify-center gap-4 flex-wrap">
            <span>✓ No upfront hardware needed</span>
            <span>•</span>
            <span>Works with existing Telebirr &amp; CBE merchant accounts</span>
            <span>•</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Comprehensive Footer */}
      <footer className="bg-white dark:bg-[#07120F] border-t border-slate-200 dark:border-[#1A332C] py-12 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
        <div className="layout-container px-[var(--page-px)] grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                EL
              </div>
              <span className="font-headline font-bold text-slate-900 dark:text-white text-base">EthioLink</span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-400 font-semibold">
              የኢትዮጵያ የመጀመሪያው የኦምኒቻናል የግብይት ማረጋገጫ መድረክ
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              <strong>Addis Ababa Headquarters:</strong><br />
              Bole Sub-City, Next to Edna Mall,<br />
              Addis Ababa, Ethiopia.
            </p>
          </div>

          {/* Col 2: Products */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Products
            </span>
            <div className="flex flex-col space-y-1.5 text-[11px]">
              <Link href="/login?from=/brand" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Merchant Hub
              </Link>
              <Link href="/login?from=/creator" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Creator Portal
              </Link>
              <Link href="/login?from=/brand/sales" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                In-Store POS Terminal
              </Link>
              <Link href="/c/demo-promo" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Live Campaign Showcase
              </Link>
              <Link href="/api/health" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Telegram Bot SDK
              </Link>
            </div>
          </div>

          {/* Col 3: Compliance & Trust */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Compliance &amp; Trust
            </span>
            <div className="flex flex-col space-y-1.5 text-[11px]">
              <span className="text-slate-600 dark:text-slate-400">Verified Attribution Guarantee</span>
              <span className="text-slate-600 dark:text-slate-400">Tax &amp; TIN Withholding</span>
              <Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-slate-600 dark:text-slate-400">Merchant Service Agreement</span>
            </div>
          </div>

          {/* Col 4: Support */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Support &amp; Community
            </span>
            <div className="flex flex-col space-y-1.5 text-[11px]">
              <a href="https://t.me/ethiolink_support" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Telegram Support
              </a>
              <span className="text-slate-600 dark:text-slate-400">Developer Documentation</span>
              <span className="text-slate-600 dark:text-slate-400">Bole Merchant Concierge</span>
              <span className="text-slate-600 dark:text-slate-400 font-mono">Call: +251 11 667 8900</span>
            </div>
          </div>
        </div>

        <div className="layout-container px-[var(--page-px)] pt-6 border-t border-slate-200 dark:border-[#1A332C] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 dark:text-slate-500">
          <p>© 2026 EthioLink attribution platform. Bole, Addis Ababa, Ethiopia.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/privacy" className="hover:underline">Terms of Service</Link>
            <a href="https://t.me/ethiolink_support" target="_blank" rel="noopener noreferrer" className="hover:underline">Telegram Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
