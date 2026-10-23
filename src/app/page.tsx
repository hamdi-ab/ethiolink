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
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/20">
              E
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-black text-xl text-slate-900 tracking-tight leading-none">
                EthioLink
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold tracking-wider uppercase mt-0.5">
                የኢትዮጵያ የግብይት መድረክ
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">
              How It Works
            </a>
            <a href="#solutions" className="hover:text-emerald-600 transition-colors">
              Solutions
            </a>
            <Link href="/c/demo-promo" className="hover:text-emerald-600 transition-colors">
              Live Demo
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-emerald-600 px-3.5 py-2 rounded-xl transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Omnichannel Influencer Attribution Platform for Ethiopia</span>
          </div>

          <h1 className="font-headline text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Measure Real Sales From Influencer Campaigns.
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Connect Telegram, TikTok, and Instagram marketing directly to in-store sales,
            direct phone calls, and branch visits with transparent ROI and Ge&apos;ez bilingual support.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-headline font-bold text-base shadow-sm transition-all"
            >
              <span>Register Your Brand</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-headline font-bold text-base border border-slate-200 shadow-2xs transition-all"
            >
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Merchant &amp; Staff Portal</span>
            </Link>

            <Link
              href="/c/demo-promo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-headline font-bold text-base border border-amber-200/80 transition-all"
            >
              <span>View Campaign Demo</span>
            </Link>
          </div>

          {/* Social Proof Counters */}
          <div className="mt-14 pt-10 border-t border-slate-200 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900">
                100%
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                Measurable Attribution
              </div>
            </div>
            <div>
              <div className="font-headline text-2xl sm:text-3xl font-extrabold text-emerald-600">
                ETB
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                Native Currency Accuracy
              </div>
            </div>
            <div>
              <div className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900">
                Bilingual
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                አማርኛ &amp; English
              </div>
            </div>
            <div>
              <div className="font-headline text-2xl sm:text-3xl font-extrabold text-emerald-600">
                0 Bot Clicks
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                Hashed IP Telemetry
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Grid */}
      <section id="features" className="py-16 sm:py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Ethiopian Commerce
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Unlike generic analytics tools built only for web checkout carts, EthioLink bridges
              the unique reality of local channels: Telegram chats, phone inquiries, and in-store redemptions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="font-headline text-lg font-bold text-slate-900 mb-2">
                  Telegram &amp; Social Traffic
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Route traffic directly to merchant Telegram accounts with one-tap deep links while recording unique visitor provenance.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero-friction social funnels</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="font-headline text-lg font-bold text-slate-900 mb-2">
                  In-Store Sales Attribution
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Equip branch cashiers and store staff with a streamlined terminal to attribute physical purchases to creators in seconds.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Instant promo code matching</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-5">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-headline text-lg font-bold text-slate-900 mb-2">
                  Creator &amp; Brand Dashboards
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Transparent metrics showing conversion rates, revenue in ETB, and ROI, eliminating disputes over influencer value.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-semibold text-teal-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Real-time conversion reporting</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles & Solutions Section */}
      <section id="solutions" className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-headline text-3xl font-extrabold text-slate-900 tracking-tight">
              One Unified Platform For All Roles
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Access the specialized portal tailored for your business workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-slate-900 text-base">Brand Owners</h4>
                  <p className="text-xs text-slate-500">Campaign Management</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Create new campaigns, invite Telegram &amp; TikTok creators, monitor live click telemetry, and calculate marketing return on investment.
              </p>
              <Link
                href="/login?from=/brand"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-900 hover:text-emerald-700 font-bold text-xs transition-colors"
              >
                <span>Owner Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-slate-900 text-base">In-Store Staff</h4>
                  <p className="text-xs text-slate-500">POS Sales Terminal</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Fast, keyboard-optimized sales logger designed for shop cashiers to record walk-in purchases with creator promo codes.
              </p>
              <Link
                href="/login?from=/brand/sales"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-900 hover:text-amber-700 font-bold text-xs transition-colors"
              >
                <span>Sales Terminal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-slate-900 text-base">Creators &amp; Influencers</h4>
                  <p className="text-xs text-slate-500">Performance Tracking</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Access your personalized attribution links, monitor incoming traffic, and track verified sales without sharing confidential store margins.
              </p>
              <Link
                href="/login?from=/creator"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-900 hover:text-teal-700 font-bold text-xs transition-colors"
              >
                <span>Creator Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to stop guessing your influencer marketing ROI?
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Join forward-thinking businesses in Addis Ababa measuring their campaign success with measurable attribution.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-headline font-bold text-sm shadow-sm transition-all"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-headline font-bold text-sm transition-all"
            >
              <span>Sign In to Existing Account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              E
            </div>
            <span className="font-headline font-bold text-slate-900 text-sm">EthioLink</span>
            <span className="text-slate-400">|</span>
            <span>Addis Ababa, Ethiopia</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/api/health" className="hover:text-emerald-600 transition-colors">
              System Health
            </Link>
            <Link href="/login" className="hover:text-emerald-600 transition-colors">
              Merchant Login
            </Link>
            <Link href="/register" className="hover:text-emerald-600 transition-colors">
              Register Brand
            </Link>
          </div>

          <p className="text-slate-400">
            &copy; 2026 EthioLink Attribution Engine. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
