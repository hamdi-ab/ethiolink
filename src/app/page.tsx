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
  Smartphone,
  CreditCard,
  MapPin,
  Clock,
  Compass,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F7F8F5] dark:bg-[#07120F] text-slate-900 dark:text-slate-100 flex flex-col font-body selection:bg-emerald-100 dark:selection:bg-emerald-900/50 selection:text-emerald-900 dark:selection:text-emerald-200 transition-colors duration-200">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0E1D19]/90 backdrop-blur-md border-b border-[#E5E7EB] dark:border-[#1A332C] transition-colors duration-200">
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

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Pillars
            </a>
            <a href="#demo" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Interactive Demo
            </a>
            <a href="#solutions" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Portals
            </a>
            <Link href="/c/demo-promo" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
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
            <span>Omnichannel Influencer Attribution Platform for Ethiopia</span>
          </div>

          <h1 className="font-headline text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-[1.14]">
            Measure Real Sales From Influencer Campaigns.
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Connect Telegram channels, TikTok creators, and Instagram stories directly to in-store branch visits,
            direct phone orders, and instant Telebirr &amp; CBE Birr settlements with zero cookie reliance.
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

          {/* Social Proof Counters */}
          <div className="mt-14 pt-10 border-t border-slate-200 dark:border-[#1A332C] max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-3 rounded-2xl bg-white/60 dark:bg-[#0E1D19]/60 border border-slate-200/60 dark:border-[#1A332C]/60">
              <div className="font-headline text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                100%
              </div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                Measurable Attribution
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white/60 dark:bg-[#0E1D19]/60 border border-slate-200/60 dark:border-[#1A332C]/60">
              <div className="font-headline text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                ETB
              </div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                Native Currency Precision
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white/60 dark:bg-[#0E1D19]/60 border border-slate-200/60 dark:border-[#1A332C]/60">
              <div className="font-headline text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Bilingual
              </div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                አማርኛ &amp; English
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white/60 dark:bg-[#0E1D19]/60 border border-slate-200/60 dark:border-[#1A332C]/60">
              <div className="font-headline text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                0 Bot Clicks
              </div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                Hashed Salt Telemetry
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Campaign Showcase Card (Hero Feature) */}
      <section id="demo" className="py-12 bg-white dark:bg-[#0E1D19] border-y border-slate-200 dark:border-[#1A332C] transition-colors duration-200">
        <div className="layout-container px-[var(--page-px)]">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 bg-slate-50 dark:bg-[#07120F] border border-slate-200 dark:border-[#1F453A] rounded-3xl p-6 sm:p-10 shadow-xs">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-[#0E231D] text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-[#1F453A] text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Customer Experience</span>
              </div>
              <h2 className="font-headline text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Frictionless Campaign Landing Pages
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                When shoppers tap an influencer&apos;s link on Telegram or TikTok, they land on a clean, lightning-fast mobile voucher page designed for Ethiopian shopping habits — no account creation, no password friction.
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>One-tap Telegram Bot ordering with Telebirr / CBE payment notes</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>Direct phone line calling for roasteries, cafes, and custom orders</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>In-store redemption with Bole &amp; Kazanchis store Google Maps routing</span>
                </div>
              </div>
              <div className="pt-4">
                <Link
                  href="/c/demo-promo"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  <span>Experience Interactive Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Visual Voucher Mockup Card */}
            <div className="w-full md:w-80 flex-shrink-0 bg-white dark:bg-[#12221E] border-2 border-dashed border-emerald-400 dark:border-emerald-600 rounded-2xl p-5 shadow-xs flex flex-col items-center text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
                PROMO VOUCHER
              </span>
              <h3 className="font-headline font-black text-base text-slate-900 dark:text-white mt-1">
                Sheba Artisan Coffee
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Special Spring Roast (500g)
              </p>

              <div className="w-full bg-slate-50 dark:bg-[#07120F] border border-emerald-300 dark:border-[#1F453A] rounded-xl py-2.5 px-3 mb-3">
                <span className="font-mono font-black text-2xl tracking-widest text-emerald-700 dark:text-emerald-400">
                  ETHIO20
                </span>
              </div>

              <div className="w-full bg-[#229ED9] text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-xs mb-2">
                <Send className="w-3.5 h-3.5" />
                <span>Order via Telegram</span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-[#182C26] text-slate-800 dark:text-slate-200 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 dark:border-[#1F453A]">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bole Medhanialem Store</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Grid */}
      <section id="features" className="py-16 sm:py-24 bg-[#F7F8F5] dark:bg-[#07120F] transition-colors duration-200">
        <div className="layout-container px-[var(--page-px)]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Engineered for Ethiopian Commerce
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
              Unlike generic analytics tools built only for web checkout carts, EthioLink bridges
              the local channels that actually drive revenue in Addis Ababa and beyond.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0E1D19] border border-slate-200/80 dark:border-[#1A332C] flex flex-col justify-between shadow-2xs">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#229ED9] flex items-center justify-center mb-5 border border-sky-100 dark:border-sky-900/50">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Telegram &amp; Social Traffic
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Route traffic directly to merchant Telegram accounts with one-tap deep links while recording unique visitor provenance without cookie degradation.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#1A332C] text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero-friction social funnels</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#0E1D19] border border-slate-200/80 dark:border-[#1A332C] flex flex-col justify-between shadow-2xs">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 border border-amber-100 dark:border-amber-900/50">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-white mb-2">
                  In-Store Sales Attribution
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Equip branch cashiers and store staff with a streamlined terminal to attribute physical purchases to creators in seconds with Bole and Kazanchis branch filters.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#1A332C] text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Instant promo code matching</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#0E1D19] border border-slate-200/80 dark:border-[#1A332C] flex flex-col justify-between shadow-2xs">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-[#0E231D] text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 border border-emerald-100 dark:border-[#1F453A]">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Creator &amp; Brand Dashboards
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Transparent metrics showing conversion rates, revenue in ETB, and ROI, eliminating disputes over influencer value with Telebirr &amp; CBE Birr wallets.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#1A332C] text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Real-time conversion reporting</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles & Solutions Section */}
      <section id="solutions" className="py-16 sm:py-24 bg-white dark:bg-[#0E1D19] border-t border-slate-200 dark:border-[#1A332C] transition-colors duration-200">
        <div className="layout-container px-[var(--page-px)]">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-headline text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              One Unified Platform For All Roles
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Access the specialized portal tailored for your Ethiopian business workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 dark:bg-[#07120F] p-6 rounded-2xl border border-slate-200 dark:border-[#1A332C] shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-[#0E231D] text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-200 dark:border-[#1F453A]">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-slate-900 dark:text-white text-base">Brand Owners</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Campaign Management</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  Create new campaigns, invite Telegram &amp; TikTok creators, monitor live click telemetry, and calculate marketing return on investment.
                </p>
              </div>
              <Link
                href="/login?from=/brand"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white dark:bg-[#12221E] hover:bg-emerald-50 dark:hover:bg-[#142923] text-slate-900 dark:text-slate-100 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold text-xs border border-slate-200 dark:border-[#1F453A] transition-colors"
              >
                <span>Owner Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-slate-50 dark:bg-[#07120F] p-6 rounded-2xl border border-slate-200 dark:border-[#1A332C] shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold border border-amber-200 dark:border-amber-800">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-slate-900 dark:text-white text-base">In-Store Staff</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">POS Sales Terminal</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  Fast, keyboard-optimized sales logger designed for shop cashiers to record walk-in purchases with creator promo codes.
                </p>
              </div>
              <Link
                href="/login?from=/brand/sales"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white dark:bg-[#12221E] hover:bg-amber-50 dark:hover:bg-[#1C1608] text-slate-900 dark:text-slate-100 hover:text-amber-700 dark:hover:text-amber-300 font-bold text-xs border border-slate-200 dark:border-[#1F453A] transition-colors"
              >
                <span>Sales Terminal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-slate-50 dark:bg-[#07120F] p-6 rounded-2xl border border-slate-200 dark:border-[#1A332C] shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-[#0E231D] text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold border border-teal-200 dark:border-[#1F453A]">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-slate-900 dark:text-white text-base">Creators &amp; Influencers</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Performance Tracking</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  Access your personalized attribution links, monitor incoming traffic, and track verified sales without sharing confidential store margins.
                </p>
              </div>
              <Link
                href="/login?from=/creator"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white dark:bg-[#12221E] hover:bg-teal-50 dark:hover:bg-[#142923] text-slate-900 dark:text-slate-100 hover:text-teal-700 dark:hover:text-teal-300 font-bold text-xs border border-slate-200 dark:border-[#1F453A] transition-colors"
              >
                <span>Creator Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="bg-gradient-to-br from-[#102F2B] via-[#0E231D] to-[#07120F] text-white py-16 border-t border-[#1A332C]">
        <div className="layout-container px-[var(--page-px)] text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-4 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Attribution Protocol</span>
          </div>
          <h2 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to stop guessing your influencer marketing ROI?
          </h2>
          <p className="mt-4 text-emerald-100/80 max-w-xl mx-auto text-sm sm:text-base">
            Join forward-thinking businesses in Addis Ababa measuring their campaign success with measurable sales attribution.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-headline font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-headline font-bold text-sm border border-white/20 transition-all cursor-pointer"
            >
              <span>Sign In to Existing Account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#07120F] border-t border-slate-200 dark:border-[#1A332C] py-10 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
        <div className="layout-container px-[var(--page-px)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              E
            </div>
            <span className="font-headline font-bold text-slate-900 dark:text-white text-sm">EthioLink</span>
            <span className="text-slate-400 dark:text-slate-600">|</span>
            <span>Addis Ababa, Ethiopia</span>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            <Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Privacy &amp; Data Practices
            </Link>
            <Link href="/api/health" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              System Health
            </Link>
            <Link href="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Merchant Login
            </Link>
            <Link href="/register" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Register Brand
            </Link>
          </div>

          <p className="text-slate-400 dark:text-slate-500">
            &copy; 2026 EthioLink Attribution Engine. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
