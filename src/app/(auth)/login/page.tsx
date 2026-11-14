"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  Store,
  Receipt,
  AlertCircle,
  Eye,
  EyeOff,
  Layers,
  Send,
  Building,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { formatClientError } from "@/lib/client-errors";

type OperatingRole = "owner" | "cashier" | "admin";

interface RoleConfig {
  title: string;
  badge: string;
  description: string;
  buttonLabel: string;
  helperText: string;
  passwordLabel: string;
  defaultDestination: string;
}

const ROLE_CONFIGS: Record<OperatingRole, RoleConfig> = {
  owner: {
    title: "Brand Merchant Mode",
    badge: "Merchant Governance",
    description:
      "Manage marketing campaigns, monitor Telebirr & CBE settlement balances, and track creator attribution.",
    buttonLabel: "Sign in to Merchant Console",
    helperText: "Full Brand Governance Access",
    passwordLabel: "Account Password",
    defaultDestination: "/brand",
  },
  cashier: {
    title: "Cashier POS Terminal",
    badge: "In-Store Staff",
    description:
      "Rapid physical store cashier checkout, customer voucher redemption, and in-store sales attribution.",
    buttonLabel: "Launch Cashier POS Terminal",
    helperText: "Retail Storefront Node",
    passwordLabel: "Staff Password or Store PIN",
    defaultDestination: "/brand/sales",
  },
  admin: {
    title: "Superadmin Workspace",
    badge: "System Operations",
    description:
      "Infrastructure telemetry, payment gateway ledger reconciliation, and system health diagnostics.",
    buttonLabel: "Enter Superadmin Console",
    helperText: "Core Infrastructure Governance",
    passwordLabel: "Admin Password & Credentials",
    defaultDestination: "/admin",
  },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Detect role from URL query param (?role=cashier or ?from=/brand/sales)
  const initialFrom = searchParams.get("from") || "";
  const initialRoleParam = searchParams.get("role");

  const [activeRole, setActiveRole] = useState<OperatingRole>(() => {
    if (initialRoleParam === "cashier" || initialFrom.includes("sales")) return "cashier";
    if (initialRoleParam === "admin" || initialFrom.includes("admin")) return "admin";
    return "owner";
  });

  const [isEmailMode, setIsEmailMode] = useState(false);
  const [phone, setPhone] = useState("");
  const [emailOrTin, setEmailOrTin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = ROLE_CONFIGS[activeRole];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Normalize Ethiopian phone number
      let submittedPhone = phone.trim();
      if (!isEmailMode) {
        // If user typed 9 digits starting with 9, prepend 0
        if (/^9\d{8}$/.test(submittedPhone)) {
          submittedPhone = `0${submittedPhone}`;
        }
        // If user pasted +251 9... or 251 9..., convert to 09...
        if (/^\+?251(\d{9})$/.test(submittedPhone)) {
          const match = submittedPhone.match(/^\+?251(\d{9})$/);
          if (match) submittedPhone = `0${match[1]}`;
        }
      } else {
        submittedPhone = emailOrTin.trim();
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: submittedPhone, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 503 || data?.code === "DATABASE_UNREACHABLE") {
          throw new Error(
            data?.error ||
              "Unable to reach the database server. Please check your internet or network connection."
          );
        }
        throw new Error(data?.error || "Invalid credentials or unauthorized role access");
      }

      // Prioritize explicit redirectUrl or default destination for the active role
      const targetUrl =
        searchParams.get("from") || data.redirectUrl || config.defaultDestination;
      router.push(targetUrl);
      router.refresh();
    } catch (err: unknown) {
      setError(formatClientError(err, "Failed to sign in. Please verify your connection."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Switcher Segmented Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-headline uppercase tracking-wider text-slate-500 dark:text-[#9BAAA1] font-bold">
            Select Operating Role
          </label>
          <span className="text-[11px] text-emerald-600 dark:text-[#78B99D] font-medium font-mono">
            {config.helperText}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F1F4F1] dark:bg-[#11211C] rounded-2xl border border-slate-200/80 dark:border-[#1E332B]">
          {/* Brand Owner Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveRole("owner");
              setError(null);
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1 cursor-pointer ${
              activeRole === "owner"
                ? "bg-white dark:bg-[#18332A] text-[#10352F] dark:text-[#F1F5F1] shadow-xs border border-slate-200/80 dark:border-[#225C52]"
                : "text-slate-600 dark:text-[#9BAAA1] hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Store
              className={`w-4 h-4 ${
                activeRole === "owner"
                  ? "text-emerald-600 dark:text-[#78B99D]"
                  : "text-slate-400 dark:text-[#78887F]"
              }`}
            />
            <span className="font-headline">Brand Owner</span>
          </button>

          {/* Cashier POS Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveRole("cashier");
              setError(null);
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1 cursor-pointer ${
              activeRole === "cashier"
                ? "bg-white dark:bg-[#18332A] text-[#10352F] dark:text-[#F1F5F1] shadow-xs border border-slate-200/80 dark:border-[#225C52]"
                : "text-slate-600 dark:text-[#9BAAA1] hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Receipt
              className={`w-4 h-4 ${
                activeRole === "cashier"
                  ? "text-emerald-600 dark:text-[#78B99D]"
                  : "text-slate-400 dark:text-[#78887F]"
              }`}
            />
            <span className="font-headline">Cashier POS</span>
          </button>

          {/* Superadmin Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveRole("admin");
              setError(null);
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1 cursor-pointer ${
              activeRole === "admin"
                ? "bg-white dark:bg-[#18332A] text-[#10352F] dark:text-[#F1F5F1] shadow-xs border border-slate-200/80 dark:border-[#225C52]"
                : "text-slate-600 dark:text-[#9BAAA1] hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ShieldCheck
              className={`w-4 h-4 ${
                activeRole === "admin"
                  ? "text-emerald-600 dark:text-[#78B99D]"
                  : "text-slate-400 dark:text-[#78887F]"
              }`}
            />
            <span className="font-headline">Superadmin</span>
          </button>
        </div>
      </div>

      {/* Dynamic Role Context Card */}
      <div className="p-3.5 rounded-2xl bg-[#EAF5F0] dark:bg-[#11261E] border border-emerald-200/80 dark:border-[#1E4336] text-xs text-emerald-950 dark:text-[#C5DCD6] flex items-start gap-3 transition-all">
        <div className="w-7 h-7 rounded-lg bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-[#78B99D] flex items-center justify-center shrink-0 mt-0.5">
          {activeRole === "owner" && <Store className="w-4 h-4" />}
          {activeRole === "cashier" && <Receipt className="w-4 h-4" />}
          {activeRole === "admin" && <ShieldCheck className="w-4 h-4" />}
        </div>
        <div className="space-y-0.5">
          <div className="font-headline font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{config.title}</span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white dark:bg-[#163327] text-emerald-700 dark:text-[#78B99D] border border-emerald-300/50 dark:border-[#204938]">
              {config.badge}
            </span>
          </div>
          <p className="text-slate-600 dark:text-[#9BAAA1] leading-relaxed">
            {config.description}
          </p>
        </div>
      </div>

      {/* Error Callout */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Authentication Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Identity Input (Phone vs Email/TIN) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor={isEmailMode ? "emailOrTin" : "phone"}
              className="block text-xs font-headline font-bold uppercase tracking-wider text-slate-700 dark:text-[#C5DCD6]"
            >
              {isEmailMode ? "Business Email or TIN" : "Ethiopian Phone Number"}
            </label>
            <button
              type="button"
              onClick={() => setIsEmailMode(!isEmailMode)}
              className="text-xs text-emerald-600 dark:text-[#78B99D] hover:underline font-medium cursor-pointer"
            >
              {isEmailMode ? "Use Ethiopian Phone Number" : "Use Email / TIN"}
            </button>
          </div>

          {!isEmailMode ? (
            <div className="relative flex rounded-xl shadow-xs">
              <div className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-200 dark:border-[#1E332B] bg-[#F1F4F1] dark:bg-[#0A1A15] text-slate-700 dark:text-[#C5DCD6] text-xs font-semibold gap-1.5 select-none">
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
                className="block w-full min-w-0 flex-1 rounded-none rounded-r-xl border border-slate-200 dark:border-[#1E332B] px-3.5 py-2.5 text-sm bg-white dark:bg-[#14211D] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#78887F] focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-wide transition-colors"
              />
            </div>
          ) : (
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#78887F]">
                <Building className="w-4 h-4" />
              </div>
              <input
                id="emailOrTin"
                name="emailOrTin"
                type="text"
                required
                placeholder="merchant@brand.et or TIN: 0029348123"
                value={emailOrTin}
                onChange={(e) => setEmailOrTin(e.target.value)}
                className="block w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E332B] text-sm bg-white dark:bg-[#14211D] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#78887F] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Password / Staff PIN */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-headline font-bold uppercase tracking-wider text-slate-700 dark:text-[#C5DCD6]"
            >
              {config.passwordLabel}
            </label>
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-600 dark:text-[#78B99D] hover:underline font-medium"
            >
              Forgot password?
            </a>
          </div>

          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#78887F]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder={activeRole === "cashier" ? "Staff PIN or password" : "••••••••••••"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E332B] text-sm bg-white dark:bg-[#14211D] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#78887F] focus:outline-none focus:ring-2 focus:ring-emerald-500 tracking-wider transition-colors"
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

          {activeRole === "cashier" && (
            <p className="text-[11px] text-slate-500 dark:text-[#9BAAA1] mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Store cashiers can authenticate with their store staff PIN or login password.
            </p>
          )}
        </div>

        {/* Remember Device Preference */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-[#1E332B] dark:bg-[#0A1A15]"
            />
            <span className="text-xs text-slate-600 dark:text-[#9BAAA1] font-medium">
              Remember this device for 30 days
            </span>
          </label>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#10352F] hover:bg-[#16443D] active:scale-[0.99] text-white font-headline font-bold text-sm tracking-wide shadow-md shadow-emerald-950/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying Node Authentication...</span>
              </>
            ) : (
              <>
                <span>{config.buttonLabel}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Action Navigation Links */}
      <div className="space-y-2.5 pt-2">
        <Link
          href="/register"
          className="w-full p-3 rounded-xl border border-slate-200/80 dark:border-[#1E332B] bg-[#F7F8F5]/50 dark:bg-[#11211C]/60 hover:bg-emerald-50/50 dark:hover:bg-[#18332A] text-xs font-medium text-slate-700 dark:text-[#C5DCD6] flex items-center justify-between transition-colors group"
        >
          <span className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-[#78B99D] flex items-center justify-center">
              <Store className="w-3.5 h-3.5" />
            </div>
            <span>
              New to EthioLink?{" "}
              <strong className="text-slate-900 dark:text-white font-bold">
                Register Your Brand
              </strong>
            </span>
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-[#78B99D] transition-colors" />
        </Link>

        <Link
          href="/join"
          className="w-full p-3 rounded-xl border border-slate-200/80 dark:border-[#1E332B] bg-[#F7F8F5]/50 dark:bg-[#11211C]/60 hover:bg-blue-50/50 dark:hover:bg-[#122533] text-xs font-medium text-slate-700 dark:text-[#C5DCD6] flex items-center justify-between transition-colors group"
        >
          <span className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>
              Have a creator invite?{" "}
              <strong className="text-slate-900 dark:text-white font-bold">
                Redeem Creator Pass
              </strong>
            </span>
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-[#F7F8F5] dark:bg-[#07120F] text-slate-900 dark:text-[#F1F5F1] transition-colors duration-200">
      {/* LEFT PANEL: Brand & Addis Ababa Commerce Showcase (Desktop >= lg) */}
      <div className="lg:w-[50%] xl:w-[52%] bg-[#102F2B] dark:bg-[#071714] text-slate-100 flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#1B4B42] dark:border-[#1E332B]">
        {/* Ambient Decorative Gradients */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#287362] opacity-25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-600 opacity-20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#287362_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        {/* Header Branding Strip */}
        <div className="relative z-10 space-y-6">
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
                    v2.4
                  </span>
                </div>
                <p className="text-[11px] font-body text-emerald-200/80">
                  የኢትዮጵያ የግብይት ማዕከል
                </p>
              </div>
            </Link>

            {/* Production Node Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#17443D]/80 border border-emerald-500/30 backdrop-blur-md shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-emerald-100 font-medium">
                Production Node · Bole, Addis Ababa
              </span>
            </div>
          </div>

          {/* Headline & Value Proposition */}
          <div className="pt-4 lg:pt-8 max-w-xl space-y-3">
            <h1 className="font-headline font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
              The Omnichannel Attribution Mesh for Ethiopian Commerce.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-body">
              Seamlessly connecting Telegram social traffic, physical store checkouts in Bole &amp;
              Kazanchis, and real-time Telebirr &amp; CBE Birr settlement ledgers.
            </p>
          </div>
        </div>

        {/* Center Showcase: Live Metrics & Mesh Schematic */}
        <div className="relative z-10 my-8 space-y-5">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="bg-[#17443D]/70 border border-emerald-400/20 rounded-2xl p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs text-emerald-200/80 font-mono mb-1">
                <span>ACTIVE MERCHANTS</span>
                <Store className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-headline font-bold text-white tracking-tight">
                240+ Outlets
              </div>
              <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1.5 font-body">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Bole, Kazanchis, Piassa, Sarbet
              </p>
            </div>

            <div className="bg-[#17443D]/70 border border-emerald-400/20 rounded-2xl p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs text-emerald-200/80 font-mono mb-1">
                <span>30-DAY SETTLED VOLUME</span>
                <span className="text-xs font-bold text-[#D4AF37]">ETB</span>
              </div>
              <div className="text-2xl font-headline font-bold text-[#D4AF37] tracking-tight">
                ETB 4.8M+
              </div>
              <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1.5 font-body">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                99.98% successful verification
              </p>
            </div>
          </div>

          {/* Attribution Triangle Topology Schematic */}
          <div className="bg-[#10352F]/90 border border-emerald-500/20 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Real-Time Mesh Topology
              </span>
              <span className="text-[11px] text-slate-300 font-mono">Sync latency: 4ms</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-4 items-center">
              {/* Node 1: Telegram */}
              <div className="p-3 rounded-xl bg-[#17443D]/80 border border-blue-500/30 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center mb-1.5">
                  <Send className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white font-headline">Telegram Bot</span>
                <span className="text-[10px] text-slate-300 mt-0.5">Creator Deep Link</span>
              </div>

              {/* Dynamic Promo Arrow */}
              <div className="flex flex-col items-center justify-center text-emerald-400">
                <span className="text-[10px] font-mono uppercase text-emerald-300/80 mb-0.5">
                  Promo Token
                </span>
                <ArrowRight className="w-5 h-5 text-emerald-400" />
              </div>

              {/* Node 2: POS Cashier */}
              <div className="p-3 rounded-xl bg-[#17443D]/80 border border-emerald-500/30 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-600/30 text-emerald-300 flex items-center justify-center mb-1.5">
                  <Receipt className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white font-headline">POS Cashier</span>
                <span className="text-[10px] text-slate-300 mt-0.5">QR / Token Scanned</span>
              </div>
            </div>

            {/* Bottom Payout Settlement Strip */}
            <div className="mt-4 pt-3 border-t border-emerald-800/40 flex flex-wrap items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-200 text-[11px] font-medium">
                  Telebirr Instant QR &amp; CBE Birr Direct API
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300 font-medium text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant Merchant Payout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Footnote */}
        <div className="relative z-10 pt-4 border-t border-emerald-900/60 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            <span>Trusted by roasteries, fashion flagships, and specialty retail in Bole.</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-300/70 font-mono">
            ETHIOLINK·ET·MESH
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Authentication Card & Actions (Desktop >= lg) */}
      <div className="lg:w-[50%] xl:w-[48%] bg-white dark:bg-[#0D1714] flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto">
        {/* Top Action Bar */}
        <div className="w-full flex items-center justify-between pb-6 sm:pb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-[#9BAAA1]">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-[#78B99D]" />
            <span>End-to-End Encrypted Session</span>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#F1F4F1] dark:bg-[#162922] text-slate-700 dark:text-[#C5DCD6] hover:bg-slate-200 dark:hover:bg-[#1E362D] transition-colors text-xs font-semibold flex items-center gap-1.5 border border-slate-200/80 dark:border-[#1E332B]"
            >
              <Send className="w-3 h-3 text-blue-500" />
              <span>Telegram Helpdesk</span>
            </a>
            <ThemeToggle />
          </div>
        </div>

        {/* Main Authentication Card */}
        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          <div className="space-y-1.5">
            <h2 className="font-headline font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
              Merchant &amp; Staff Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9BAAA1] font-body leading-relaxed">
              Sign in to access your merchant console, cashier terminal, or administrative workspace.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="py-12 px-6 rounded-2xl border border-slate-200 dark:border-[#1E332B] shadow-xs text-center animate-pulse space-y-4">
                <div className="w-full h-10 bg-slate-100 dark:bg-[#14211D] rounded-xl" />
                <div className="w-full h-10 bg-slate-100 dark:bg-[#14211D] rounded-xl" />
                <div className="w-full h-12 bg-emerald-100 dark:bg-[#18332A] rounded-xl" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        {/* Legal & Security Compliance Footer */}
        <div className="pt-8 border-t border-slate-100 dark:border-[#1E332B] text-center space-y-2">
          <p className="text-[11px] text-slate-500 dark:text-[#9BAAA1] font-body">
            Secured with end-to-end 256-bit encryption · CBE &amp; Telebirr compliant · Bole Sub-City,
            Addis Ababa.
          </p>
          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 dark:text-[#78887F]">
            <Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-[#78B99D] transition-colors">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-[#78B99D] transition-colors">
              Attribution Guarantee
            </Link>
            <span>·</span>
            <span>Support: +251 91 123 4567</span>
          </div>
        </div>
      </div>
    </div>
  );
}
