"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatETB } from "@/lib/sales";
import {
  Store,
  Tag,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  LogOut,
  Receipt,
  Plus,
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

  const [amountInput, setAmountInput] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState(
    initialCampaigns[0]?.id || ""
  );
  const [customPromoCode, setCustomPromoCode] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLoggedSale, setLastLoggedSale] = useState<RecentSale | null>(null);
  const [salesList, setSalesList] = useState<RecentSale[]>(initialSales);

  const handleAddPreset = (delta: number) => {
    const current = parseFloat(amountInput) || 0;
    setAmountInput(String(Math.round((current + delta) * 100) / 100));
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
        notes: notes.trim() || undefined,
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to record sale");
      }

      const recorded: RecentSale = data.sale;
      setLastLoggedSale(recorded);
      setSalesList((prev) => [recorded, ...prev]);

      // Reset form
      setAmountInput("");
      setNotes("");
      setCustomPromoCode("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to record sale";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const totalETBToday = salesList.reduce((sum, s) => sum + s.amountETB, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {isOwner && (
              <Link
                href="/brand"
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                title="Back to Brand Overview"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-600/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                {brandName}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{userName}</span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full border text-[11px] ${
                    isOwner
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                      : "text-teal-700 bg-teal-50 border-teal-200"
                  }`}
                >
                  {userRole}
                </span>
              </div>
            </div>
          </div>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </form>
        </div>
      </header>

      {/* Main Terminal View */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Role Scope Notice */}
        <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100 text-teal-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              {isOwner
                ? "In-Store Sales Mode: Log customer purchases in Ethiopian Birr attributed to influencer campaigns."
                : "Staff Shift Active: In-store sales logging and promo code attribution enabled."}
            </span>
          </div>
          <div className="font-bold text-teal-900 font-mono">
            Total Today: {formatETB(totalETBToday)}
          </div>
        </div>

        {/* Success Feedback Card */}
        {lastLoggedSale && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between shadow-sm animate-fadeIn">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm">
                  Recorded {formatETB(lastLoggedSale.amountETB)} Successfully
                </div>
                <div className="text-xs text-emerald-700 mt-0.5">
                  Attributed to{" "}
                  <span className="font-semibold">
                    {lastLoggedSale.campaign.name}
                  </span>{" "}
                  (Code:{" "}
                  <span className="font-mono font-bold">
                    {lastLoggedSale.campaign.promoCode}
                  </span>
                  )
                  {lastLoggedSale.notes && ` • "${lastLoggedSale.notes}"`}
                </div>
              </div>
            </div>
            <button
              onClick={() => setLastLoggedSale(null)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Sales Logging Entry Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>Log Customer Purchase</span>
          </h2>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ETB Amount Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Sale Amount in Ethiopian Birr (ETB) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 font-bold text-lg select-none">
                  ETB
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full pl-18 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-black font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                />
              </div>

              {/* Quick Add Presets */}
              <div className="flex flex-wrap gap-2 mt-3">
                {[100, 250, 500, 1000, 2000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
                  >
                    <Plus className="w-3 h-3 text-slate-500" />
                    <span>{preset} ETB</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmountInput("")}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-medium ml-auto"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Campaign / Promo Code Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Active Campaign
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => {
                      setSelectedCampaignId(e.target.value);
                      setCustomPromoCode("");
                    }}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                  >
                    {initialCampaigns.map((camp) => (
                      <option key={camp.id} value={camp.id}>
                        {camp.name} ({camp.promoCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Or Enter Customer Promo Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. MESKEL25"
                  value={customPromoCode}
                  onChange={(e) => setCustomPromoCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
                />
              </div>
            </div>

            {/* Notes / Receipt Reference */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Receipt # / Cashier Notes (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Receipt #4812, Table 3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
              />
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading || (!amountInput && !parseFloat(amountInput))}
              className="w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-lg shadow-teal-600/20 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Recording Sale...</span>
              ) : (
                <span>
                  Record Sale of{" "}
                  {amountInput ? formatETB(parseFloat(amountInput)) : "0.00 ETB"}
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Shift Transactions History */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Recent In-Store Transactions</span>
            </h3>
            <span className="text-xs text-slate-500">
              {salesList.length} total logged
            </span>
          </div>

          {salesList.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No sales logged yet for this shift.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {salesList.map((sale) => (
                <div
                  key={sale.id}
                  className="py-3 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm font-mono">
                        {formatETB(sale.amountETB)}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {sale.campaign.promoCode}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] flex items-center gap-2">
                      <span>{sale.campaign.name}</span>
                      <span>•</span>
                      <span>Logged by {sale.loggedBy.name}</span>
                      {sale.notes && (
                        <>
                          <span>•</span>
                          <span className="italic">&ldquo;{sale.notes}&rdquo;</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-slate-400 text-[11px]">
                    {new Date(sale.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
