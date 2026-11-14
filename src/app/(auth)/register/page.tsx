"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  User,
  Building,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Layers,
  MapPin,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Zap,
  BarChart3,
  Smartphone,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { formatClientError } from "@/lib/client-errors";

const ADDIS_BRANCH_PRESETS = [
  "Bole (Airport / Medhanialem)",
  "Kazanchis (CBD)",
  "Piassa (Arada)",
  "Sarbet / Old Airport",
  "Hawassa / Regional",
  "Online & Telegram Delivery",
];

export default function RegisterPage() {
  const router = useRouter();

  const [brandName, setBrandName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(ADDIS_BRANCH_PRESETS[0]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

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

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brandName.trim(),
          ownerName: ownerName.trim(),
          phone: submittedPhone,
          password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 503 || data?.code === "DATABASE_UNREACHABLE") {
          throw new Error(
            data?.error ||
              "Unable to reach the database server. Please check your internet or network connection."
          );
        }
        throw new Error(data?.error || "Failed to register brand workspace");
      }

      router.push("/brand");
      router.refresh();
    } catch (err: unknown) {
      setError(formatClientError(err, "Failed to register brand. Please check your network."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden flex flex-col lg:flex-row w-full bg-[#F7F8F5] dark:bg-[#07120F] text-slate-900 dark:text-[#F1F5F1] transition-colors duration-200">
      {/* LEFT PANEL: Merchant Growth & Addis Ababa Commerce Showcase */}
      <div className="lg:w-[50%] xl:w-[52%] bg-[#102F2B] dark:bg-[#071714] text-slate-100 flex flex-col justify-between p-6 sm:p-8 lg:p-8 xl:p-10 lg:py-6 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#1B4B42] dark:border-[#1E332B]">
        {/* Ambient Decorative Gradients */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#287362] opacity-25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-600 opacity-20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#287362_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        {/* Header Branding Strip */}
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Logo & Bilingual Identity */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-[#287362] flex items-center justify-center shadow-lg shadow-emerald-950/40 border border-emerald-400/20 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline font-black text-xl tracking-tight text-white">
                    EthioLink
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30">
                    Merchant Onboarding
                  </span>
                </div>
                <p className="text-[11px] font-body text-emerald-200/80">
                  የኢትዮጵያ የግብይት ማዕከል
                </p>
              </div>
            </Link>

            {/* Production Node Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#17443D]/80 border border-emerald-500/30 backdrop-blur-md shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-emerald-100 font-medium">
                Production Node · Bole, Addis Ababa
              </span>
            </div>
          </div>

          {/* Headline & Value Proposition */}
          <div className="pt-2 lg:pt-3 max-w-xl space-y-1.5">
            <h1 className="font-headline font-extrabold text-2xl sm:text-3xl lg:text-[28px] text-white tracking-tight leading-tight">
              Scale Your Ethiopian Brand with Verifiable Influencer ROI.
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-body">
              Launch trackable campaigns, eliminate attribution guesswork across Telegram and social
              media, and verify in-store sales at checkout counters in real time.
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="relative z-10 my-2 lg:my-auto space-y-2 sm:space-y-2.5">
          <div className="grid grid-cols-1 gap-2 sm:gap-2.5">
            {/* Feature 1 */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-[#17443D]/70 border border-emerald-400/20 backdrop-blur-md flex items-start gap-2.5 sm:gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/30 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-headline font-bold text-white">
                  Zero-Hardware Deployment
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                  Store cashiers log and verify promo codes on any smartphone or tablet without
                  expensive proprietary POS equipment.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-[#17443D]/70 border border-emerald-400/20 backdrop-blur-md flex items-start gap-2.5 sm:gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-headline font-bold text-white">
                  Telebirr &amp; CBE Birr Integrated
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                  Automated receipt pairing, instant payment reconciliation, and 4ms sync latency
                  for all transactions.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-[#17443D]/70 border border-emerald-400/20 backdrop-blur-md flex items-start gap-2.5 sm:gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-headline font-bold text-white">
                  2-Tier Merchant Governance
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                  Full analytics cockpit for Brand Owners, plus isolated fast cashier mode for
                  storefront sales staff.
                </p>
              </div>
            </div>
          </div>

          {/* Social Proof Quote Card */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#10352F]/90 border border-emerald-500/20 shadow-md">
            <p className="text-[11px] sm:text-xs text-emerald-200/90 italic font-body leading-relaxed">
              &ldquo;EthioLink eliminated coupon chaos across our Bole &amp; Kazanchis branches. We
              tracked 1,200+ attributed sales in our first month alone.&rdquo;
            </p>
            <div className="mt-1.5 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-300">
              <span className="font-semibold text-white">Sheba Artisan Coffee</span>
              <span className="font-mono text-emerald-400">Addis Ababa Retail Flagship</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-2.5 lg:pt-3 border-t border-emerald-900/60 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            <span>Trusted by 240+ retail businesses in Addis Ababa.</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-300/70 font-mono">
            ETHIOLINK·ET·MESH
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Registration Form & Branch Configuration */}
      <div className="lg:w-[50%] xl:w-[48%] bg-white dark:bg-[#0D1714] flex flex-col justify-between p-6 sm:p-8 lg:p-8 xl:p-10 lg:py-6 overflow-y-auto lg:overflow-hidden">
        {/* Top Action Bar */}
        <div className="w-full flex items-center justify-between pb-3 sm:pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-[#9BAAA1]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-[#78B99D]" />
            <span>Instant Workspace Provisioning</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-xl bg-[#F1F4F1] dark:bg-[#162922] text-slate-700 dark:text-[#C5DCD6] hover:bg-slate-200 dark:hover:bg-[#1E362D] transition-colors text-xs font-semibold flex items-center gap-1 border border-slate-200/80 dark:border-[#1E332B]"
            >
              <span>Sign In</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Main Registration Form */}
        <div className="max-w-md w-full mx-auto my-auto space-y-3.5 sm:space-y-4">
          <div className="space-y-1">
            <h2 className="font-headline font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
              Register Your Brand
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9BAAA1] font-body leading-relaxed">
              Create your brand workspace to launch campaigns, invite creators, and track POS sales.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
            {/* Brand / Business Name */}
            <div>
              <label
                htmlFor="brandName"
                className="block text-xs font-headline font-bold uppercase tracking-wider text-slate-700 dark:text-[#C5DCD6] mb-1"
              >
                Business / Brand Name
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#78887F]">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  id="brandName"
                  name="brandName"
                  type="text"
                  required
                  placeholder="e.g. Habesha Coffee Roasters"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#1E332B] text-sm bg-white dark:bg-[#14211D] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#78887F] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Owner Full Name */}
            <div>
              <label
                htmlFor="ownerName"
                className="block text-xs font-headline font-bold uppercase tracking-wider text-slate-700 dark:text-[#C5DCD6] mb-1"
              >
                Owner Full Name
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#78887F]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="ownerName"
                  name="ownerName"
                  type="text"
                  required
                  placeholder="e.g. Abebe Kebede"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#1E332B] text-sm bg-white dark:bg-[#14211D] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#78887F] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Phone Number with +251 prefix */}
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-headline font-bold uppercase tracking-wider text-slate-700 dark:text-[#C5DCD6] mb-1"
              >
                Owner Phone Number
              </label>
              <div className="relative flex rounded-xl shadow-xs">
                <div className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-[#1E332B] bg-[#F1F4F1] dark:bg-[#0A1A15] text-slate-700 dark:text-[#C5DCD6] text-xs font-semibold gap-1.5 select-none">
                  <span className="text-sm">🇪🇹</span>
                  <span className="font-mono text-slate-800 dark:text-white">+251</span>
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="0911 223 344"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full min-w-0 flex-1 rounded-none rounded-r-xl border border-slate-200 dark:border-[#1E332B] px-3.5 py-2 text-sm bg-white dark:bg-[#14211D] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#78887F] focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-wide transition-colors"
                />
              </div>
            </div>

            {/* Primary Branch Location District */}
            <div>
              <label
                htmlFor="selectedBranch"
                className="block text-xs font-headline font-bold uppercase tracking-wider text-slate-700 dark:text-[#C5DCD6] mb-1"
              >
                Primary Store District
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#78887F]">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-[#78B99D]" />
                </div>
                <select
                  id="selectedBranch"
                  name="selectedBranch"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="block w-full pl-10 pr-8 py-2 rounded-xl border border-slate-200 dark:border-[#1E332B] text-sm bg-white dark:bg-[#14211D] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer"
                >
                  {ADDIS_BRANCH_PRESETS.map((branch) => (
                    <option key={branch} value={branch} className="bg-white dark:bg-[#14211D] text-slate-900 dark:text-white">
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-headline font-bold uppercase tracking-wider text-slate-700 dark:text-[#C5DCD6] mb-1"
              >
                Account Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#78887F]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 dark:border-[#1E332B] text-sm bg-white dark:bg-[#14211D] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#78887F] focus:outline-none focus:ring-2 focus:ring-emerald-500 tracking-wider transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#9BAAA1] mt-0.5">
                Must be at least 6 characters. Used for owner console access.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="pt-1.5">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#10352F] hover:bg-[#16443D] active:scale-[0.99] text-white font-headline font-bold text-sm tracking-wide shadow-md shadow-emerald-950/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Provisioning Merchant Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Create Brand Account</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Links */}
          <div className="pt-2.5 border-t border-slate-100 dark:border-[#1E332B] space-y-1.5 text-center">
            <p className="text-xs text-slate-600 dark:text-[#9BAAA1]">
              Already registered?{" "}
              <Link
                href="/login"
                className="font-bold text-emerald-600 dark:text-[#78B99D] hover:underline"
              >
                Sign In to your workspace
              </Link>
            </p>
            <p className="text-xs text-slate-500 dark:text-[#78887F]">
              Are you an influencer?{" "}
              <Link
                href="/join"
                className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Redeem Creator Invite Code
              </Link>
            </p>
          </div>
        </div>

        {/* Legal & Compliance Footer */}
        <div className="pt-3 sm:pt-4 border-t border-slate-100 dark:border-[#1E332B] text-center space-y-1.5">
          <p className="text-[11px] text-slate-500 dark:text-[#9BAAA1] font-body">
            By creating an account, you agree to EthioLink&apos;s Terms of Service and Privacy Policy.
          </p>
          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 dark:text-[#78887F]">
            <Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-[#78B99D] transition-colors">
              Data Retention &amp; Privacy
            </Link>
            <span>·</span>
            <span>Addis Ababa, Ethiopia</span>
          </div>
        </div>
      </div>
    </div>
  );
}
