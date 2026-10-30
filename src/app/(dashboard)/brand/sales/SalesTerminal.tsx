"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatETB } from "@/lib/sales";
import { formatClientError } from "@/lib/client-errors";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  Store,
  Tag,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  LogOut,
  Receipt,
  QrCode,
  CreditCard,
  Banknote,
  ShieldCheck,
  Check,
  Ban,
  X,

} from "lucide-react";

export interface ActiveCampaign {
  id: string;
  name: string;
  promoCode: string;
}

export interface RecentSale {
  id: string;
  amountETB: number;
  notes: string | null;
  createdAt: string;
  isVoided?: boolean;
  voidReason?: string | null;
  voidedAt?: string | null;
  voidedBy?: {
    id?: string;
    name?: string;
  } | null;
  campaign: {
    id: string;
    name: string;
    promoCode: string;
  };
  loggedBy: {
    id: string;
    name: string;
  };
}

interface SalesTerminalProps {
  userName: string;
  userRole: string;
  brandName: string;
  initialCampaigns: ActiveCampaign[];
  initialSales: RecentSale[];
}

export function SalesTerminal({
  userName,
  userRole,
  brandName,
  initialCampaigns,
  initialSales,
}: SalesTerminalProps) {
  const isOwner = userRole === "OWNER";
  const canVoid = userRole === "OWNER" || userRole === "ADMIN";
  const [voidModalSale, setVoidModalSale] = useState<RecentSale | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [voidSubmitting, setVoidSubmitting] = useState(false);
  const [voidError, setVoidError] = useState<string | null>(null);

  const handleConfirmVoid = async () => {
    if (!voidModalSale) return;
    if (!voidReason.trim() || voidReason.trim().length < 3) {
      setVoidError("A void reason of at least 3 characters is required");
      return;
    }

    setVoidSubmitting(true);
    setVoidError(null);

    try {
      const res = await fetch(`/api/sales/${voidModalSale.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: voidReason.trim() }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to void transaction");
      }

      setSalesList((prev) =>
        prev.map((s) =>
          s.id === voidModalSale.id
            ? {
                ...s,
                isVoided: true,
                voidReason: voidReason.trim(),
                voidedAt: new Date().toISOString(),
                voidedBy: { name: userName },
              }
            : s
        )
      );

      setVoidModalSale(null);
      setVoidReason("");
    } catch (err: unknown) {
      setVoidError(formatClientError(err, "Failed to void transaction."));
    } finally {
      setVoidSubmitting(false);
    }
  };

  const [amountInput, setAmountInput] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState(
    initialCampaigns[0]?.id || ""
  );
  const [customPromoCode, setCustomPromoCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "cbe" | "cash">("telebirr");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLoggedSale, setLastLoggedSale] = useState<RecentSale | null>(null);
  const [salesList, setSalesList] = useState<RecentSale[]>(initialSales);

  const handleAddPreset = (delta: number) => {
    const current = parseFloat(amountInput) || 0;
    setAmountInput(String(Math.round((current + delta) * 100) / 100));
  };

  const handleKeypadPress = (val: string) => {
    if (val === "C") {
      setAmountInput("");
    } else if (val === "⌫") {
      setAmountInput((prev) => prev.slice(0, -1));
    } else if (val === ".") {
      if (!amountInput.includes(".")) {
        setAmountInput((prev) => (prev ? `${prev}.` : "0."));
      }
    } else {
      setAmountInput((prev) => `${prev}${val}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: {
        amountETB: string;
        campaignId?: string;
        promoCode?: string;
        notes?: string;
      } = {
        amountETB: amountInput,
        notes: notes.trim()
          ? `${paymentMethod.toUpperCase()}: ${notes.trim()}`
          : `${paymentMethod.toUpperCase()} In-Store POS`,
      };

      if (customPromoCode.trim()) {
        payload.promoCode = customPromoCode.trim().toUpperCase();
      } else if (selectedCampaignId) {
        payload.campaignId = selectedCampaignId;
      }

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 503 || data?.code === "DATABASE_UNREACHABLE") {
          throw new Error(
            data?.error || "Unable to reach database. Please check your internet connection."
          );
        }
        throw new Error(data?.error || "Failed to record sale");
      }

      const recorded: RecentSale = data.sale;
      setLastLoggedSale(recorded);
      setSalesList((prev) => [recorded, ...prev]);

      // Reset form
      setAmountInput("");
      setNotes("");
      setCustomPromoCode("");
    } catch (err: unknown) {
      setError(formatClientError(err, "Failed to record sale. Please check your network."));
    } finally {
      setLoading(false);
    }
  };

  const totalETBToday = salesList
    .filter((s) => !s.isVoided)
    .reduce((sum, s) => sum + s.amountETB, 0);
  const activeSelectedCampaign = initialCampaigns.find((c) => c.id === selectedCampaignId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-body antialiased pb-16 selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-200">
      {/* Top Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="navbar-shell layout-container px-[var(--page-px)]">
          <div className="flex items-center gap-3">
            {isOwner && (
              <Link
                href="/brand"
                className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                title="Back to Brand Overview"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline font-bold text-base text-slate-900 dark:text-white leading-tight">
                  {brandName}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  POS TERMINAL
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Cashier: <strong className="text-slate-800 dark:text-slate-200">{userName}</strong></span>
                <span>•</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  EthioLink Sync Live (2ms)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Terminal Grid */}
      <main className="layout-container px-[var(--page-px)] py-6 space-y-6">
        {/* Today's Shift Summary Pill */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Receipt className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isOwner
                ? "Retail POS Terminal: Log and attribute in-store receipts to active influencer promo codes."
                : "Active Cashier Shift: In-store sales logging and promo code attribution enabled."}
            </span>
          </div>
          <div className="font-bold text-slate-900 font-mono text-sm bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
            Shift Total: <span className="text-emerald-700">{formatETB(totalETBToday)}</span>
          </div>
        </div>

        {/* Success Feedback Card */}
        {lastLoggedSale && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between shadow-xs animate-fadeIn">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm">
                  Attributed {formatETB(lastLoggedSale.amountETB)} Successfully
                </div>
                <div className="text-xs text-emerald-700 mt-0.5">
                  Attributed to{" "}
                  <strong className="font-semibold text-emerald-900">
                    {lastLoggedSale.campaign.name}
                  </strong>{" "}
                  (Promo Code:{" "}
                  <span className="font-mono font-bold text-emerald-800">
                    {lastLoggedSale.campaign.promoCode}
                  </span>
                  )
                  {lastLoggedSale.notes && ` • ${lastLoggedSale.notes}`}
                </div>
              </div>
            </div>
            <button
              onClick={() => setLastLoggedSale(null)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 2-Column POS Register Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Fast Tender & Amount Entry (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline font-bold text-base text-slate-900">
                  Sale Amount (ETB)
                </h2>
                <span className="text-xs font-semibold text-slate-400">Ethiopian Birr</span>
              </div>

              {/* Large Monospace Amount Display */}
              <div className="relative mb-4">
                <div className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 flex items-baseline justify-between focus-within:border-emerald-500 focus-within:bg-white transition-all">
                  <span className="font-mono font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
                    {amountInput ? amountInput : "0.00"}
                  </span>
                  <span className="font-headline font-bold text-emerald-700 text-lg">ETB</span>
                </div>
              </div>

              {/* Quick Increment Preset Chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[100, 250, 500, 1000, 2500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className="flex-1 min-w-[70px] py-2 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-xs font-bold font-mono transition-all active:scale-95 cursor-pointer shadow-2xs"
                  >
                    +{preset}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmountInput("")}
                  className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                >
                  Clear
                </button>
              </div>

              {/* Tactile Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((btn) => (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => handleKeypadPress(btn)}
                    className="h-12 sm:h-14 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 rounded-xl font-mono font-bold text-lg text-slate-800 border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes field */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Receipt Note / Cashier Reference (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Receipt #1042, 2x Whole Bean Sidama"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Right Column: Influencer Attribution & Payment Tender (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Influencer Attribution
                </h3>
                <Tag className="w-4 h-4 text-emerald-600" />
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Promo Code Input or Campaign Select */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Customer Promo Code (Instant Match)
                  </label>
                  <input
                    type="text"
                    value={customPromoCode}
                    onChange={(e) => setCustomPromoCode(e.target.value)}
                    placeholder="e.g. ETHIO20"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-sm tracking-wider uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Or Select Active Campaign
                  </label>
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => {
                      setSelectedCampaignId(e.target.value);
                      setCustomPromoCode("");
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {initialCampaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.promoCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Attribution Proof Banner */}
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Attribution Target:</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    {customPromoCode
                      ? `Promo Code: ${customPromoCode.toUpperCase()}`
                      : activeSelectedCampaign
                      ? `${activeSelectedCampaign.name} (Code: ${activeSelectedCampaign.promoCode})`
                      : "Direct Store Attribution"}
                  </p>
                </div>

                {/* Ethiopian Payment Method Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("telebirr")}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === "telebirr"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span>Telebirr</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cbe")}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === "cbe"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-purple-600" />
                      <span>CBE Birr</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === "cash"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-amber-600" />
                      <span>Cash</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Giant Submit CTA */}
            <button
              onClick={handleSubmit}
              disabled={loading || !amountInput || parseFloat(amountInput) <= 0}
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-headline font-bold text-base rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              {loading ? (
                <span>Recording Attribution...</span>
              ) : (
                <>
                  <Check className="w-5 h-5 stroke-[2.5]" />
                  <span>
                    Complete Sale ({amountInput ? formatETB(parseFloat(amountInput)) : "0.00 ETB"})
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Live Activity Stream */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Recent In-Store Attributions</span>
            </h3>
            <span className="text-xs text-slate-400">Last 20 Receipts</span>
          </div>

          {salesList.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No sales logged yet for this shift.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-x-auto">
              {salesList.map((sale) => (
                <div
                  key={sale.id}
                  className={`py-3 px-2 flex items-center justify-between text-xs transition-colors ${
                    sale.isVoided
                      ? "bg-rose-50/40 dark:bg-rose-950/20 opacity-75"
                      : "hover:bg-slate-50/80 dark:hover:bg-slate-900/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs font-mono ${
                        sale.isVoided
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400"
                          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      }`}
                    >
                      ETB
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {sale.campaign.name}
                        </span>
                        {sale.isVoided && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                            VOIDED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Code:{" "}
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {sale.campaign.promoCode}
                        </span>
                        {sale.notes && ` • ${sale.notes}`}
                        {sale.isVoided && sale.voidReason && (
                          <span className="text-rose-600 dark:text-rose-400 font-medium">
                            {" "}• Reason: {sale.voidReason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div
                        className={`font-mono font-black text-sm ${
                          sale.isVoided
                            ? "line-through text-slate-400 dark:text-slate-500"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {formatETB(sale.amountETB)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(sale.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {canVoid && !sale.isVoided && (
                      <button
                        type="button"
                        onClick={() => {
                          setVoidModalSale(sale);
                          setVoidReason("");
                          setVoidError(null);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Void Transaction"
                        aria-label={`Void sale ${sale.id}`}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Void Confirmation Modal */}
      {voidModalSale && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="void-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-5 h-5" />
                <h3 id="void-modal-title" className="font-headline font-bold text-base text-slate-900 dark:text-white">
                  Void In-Store Sale
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVoidModalSale(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Voiding this sale will exclude it from attributed store revenue, AOV, and creator conversion metrics while preserving it in the audit trail.
            </p>

            {/* Sale summary box */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Receipt / ID:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{voidModalSale.id.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Campaign:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{voidModalSale.campaign.name} ({voidModalSale.campaign.promoCode})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{formatETB(voidModalSale.amountETB)}</span>
              </div>
            </div>

            {voidError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{voidError}</span>
              </div>
            )}

            <div>
              <label htmlFor="void-reason" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Void Reason (Required)
              </label>
              <textarea
                id="void-reason"
                rows={3}
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="e.g. Customer returned coffee beans, cashier duplicate entry..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVoidModalSale(null)}
                disabled={voidSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVoid}
                disabled={voidSubmitting || voidReason.trim().length < 3}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                {voidSubmitting ? (
                  <span>Voiding...</span>
                ) : (
                  <>
                    <Ban className="w-3.5 h-3.5" />
                    <span>Confirm Void</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
