"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { formatETB } from "@/lib/sales";
import { formatClientError } from "@/lib/client-errors";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { toast } from "sonner";
import {
  Store,
  Tag,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  LogOut,
  Receipt,
  QrCode,
  CreditCard,
  ShieldCheck,
  Check,
  Ban,
  X,
  ShoppingBasket,
  Coffee,
  Plus,
  Minus,
  Trash2,
  Radio,
  Printer,
  Lock,
  LockOpen,
  DollarSign,
  Send,
  FileText,
  BadgePercent,
  CheckCircle,
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

export interface SalesTerminalProps {
  userName: string;
  userRole: string;
  brandName: string;
  initialCampaigns: ActiveCampaign[];
  initialSales: RecentSale[];
  embedded?: boolean;
  onSaleLogged?: (sale: RecentSale) => void;
  onSaleVoided?: (saleId: string, reason: string) => void;
  onNavigateTab?: (tab: "overview" | "sales" | "analytics" | "privacy") => void;
}

interface CartItem {
  id: string;
  name: string;
  detail: string;
  unitPriceETB: number;
  quantity: number;
  icon: "coffee" | "retail" | "brew";
}

const QUICK_CATALOG: Array<Omit<CartItem, "quantity">> = [
  {
    id: "item-sidama",
    name: "Sidama Reserve Whole Bean (250g)",
    detail: "Unit Price: 450.00 ETB • Retail Packaged",
    unitPriceETB: 450,
    icon: "coffee",
  },
  {
    id: "item-yirgacheffe",
    name: "Yirgacheffe Single-Origin Pour-over",
    detail: "Barista Brewed • Medium Roast",
    unitPriceETB: 180,
    icon: "brew",
  },
  {
    id: "item-harar",
    name: "Harar Dark Roast Blend (500g)",
    detail: "Unit Price: 620.00 ETB • Signature Bag",
    unitPriceETB: 620,
    icon: "retail",
  },
  {
    id: "item-guji",
    name: "Guji Cold Brew Bottle (330ml)",
    detail: "Nitro Infused • Ready to Drink",
    unitPriceETB: 150,
    icon: "brew",
  },
];

export function SalesTerminal({
  userName,
  userRole,
  brandName,
  initialCampaigns,
  initialSales,
  embedded = false,
  onSaleLogged,
  onSaleVoided,
}: SalesTerminalProps) {
  const isOwner = userRole === "OWNER";
  const canVoid = userRole === "OWNER" || userRole === "ADMIN";

  // Shift & Register Metadata
  const [ticketNumber, setTicketNumber] = useState(10843);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [receiptModalSale, setReceiptModalSale] = useState<RecentSale | null>(null);

  // Cart State (Pre-populated matching Stitch design b24e0911)
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "item-sidama",
      name: "Sidama Reserve Whole Bean (250g)",
      detail: "Unit Price: 450.00 ETB • Retail Packaged",
      unitPriceETB: 450,
      quantity: 2,
      icon: "coffee",
    },
    {
      id: "item-yirgacheffe",
      name: "Yirgacheffe Single-Origin Pour-over",
      detail: "Barista Brewed • Medium Roast",
      unitPriceETB: 180,
      quantity: 1,
      icon: "brew",
    },
  ]);

  // Fast custom numeric entry
  const [amountInput, setAmountInput] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState(
    initialCampaigns[0]?.id || ""
  );
  const [customPromoCode, setCustomPromoCode] = useState("ETHIO20");
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "cbe" | "cash">("telebirr");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLoggedSale, setLastLoggedSale] = useState<RecentSale | null>(null);
  const [salesList, setSalesList] = useState<RecentSale[]>(initialSales);

  // Void Modal State
  const [voidModalSale, setVoidModalSale] = useState<RecentSale | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [voidSubmitting, setVoidSubmitting] = useState(false);
  const [voidError, setVoidError] = useState<string | null>(null);

  // Active Campaign and Influencer Matching
  const matchedCampaign = useMemo(() => {
    if (customPromoCode.trim()) {
      const match = initialCampaigns.find(
        (c) => c.promoCode.toLowerCase() === customPromoCode.trim().toLowerCase()
      );
      if (match) return match;
    }
    return initialCampaigns.find((c) => c.id === selectedCampaignId) || initialCampaigns[0];
  }, [customPromoCode, selectedCampaignId, initialCampaigns]);

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    const itemsTotal = cartItems.reduce(
      (sum, item) => sum + item.unitPriceETB * item.quantity,
      0
    );
    const custom = parseFloat(amountInput) || 0;
    return itemsTotal + custom;
  }, [cartItems, amountInput]);

  // 20% partner promo discount applied when valid code is entered
  const discountRate = customPromoCode.trim() ? 0.2 : 0;
  const discountETB = Math.round(cartSubtotal * discountRate * 100) / 100;
  const finalAmountDue = Math.max(0, Math.round((cartSubtotal - discountETB) * 100) / 100);
  const vatIncludedETB = Math.round((finalAmountDue * (15 / 115)) * 100) / 100;
  const creatorCommissionETB = Math.round(finalAmountDue * 0.1 * 100) / 100;

  // Cart Handlers
  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddToCart = (catalogItem: Omit<CartItem, "quantity">) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === catalogItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === catalogItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...catalogItem, quantity: 1 }];
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
    setAmountInput("");
  };

  const handleAddPreset = (delta: number) => {
    const current = parseFloat(amountInput) || 0;
    setAmountInput(String(Math.round((current + delta) * 100) / 100));
  };

  const handleKeypadPress = (val: string) => {
    if (val === "CLR") {
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

  // Transaction Submission
  const handleSubmitSale = async () => {
    if (finalAmountDue <= 0) {
      setError("Please add items to cart or enter a valid tender amount");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const lineSummary = cartItems
        .map((i) => `${i.quantity}x ${i.name}`)
        .join(", ");
      const combinedNotes = [
        `${paymentMethod.toUpperCase()} POS`,
        `Ticket #${ticketNumber}`,
        lineSummary,
        notes.trim(),
      ]
        .filter(Boolean)
        .join(" • ");

      const payload: {
        amountETB: string;
        campaignId?: string;
        promoCode?: string;
        notes?: string;
      } = {
        amountETB: String(finalAmountDue),
        notes: combinedNotes,
      };

      if (customPromoCode.trim()) {
        payload.promoCode = customPromoCode.trim().toUpperCase();
      } else if (matchedCampaign) {
        payload.campaignId = matchedCampaign.id;
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
      setTicketNumber((prev) => prev + 1);

      if (onSaleLogged) {
        onSaleLogged(recorded);
      }

      // Reset cart and custom inputs
      setCartItems([]);
      setAmountInput("");
      setNotes("");
    } catch (err: unknown) {
      setError(formatClientError(err, "Failed to record sale. Please check your network."));
    } finally {
      setLoading(false);
    }
  };

  // Void Handler
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

      if (onSaleVoided) {
        onSaleVoided(voidModalSale.id, voidReason.trim());
      }

      setVoidModalSale(null);
      setVoidReason("");
    } catch (err: unknown) {
      setVoidError(formatClientError(err, "Failed to void transaction."));
    } finally {
      setVoidSubmitting(false);
    }
  };

  const totalETBToday = salesList
    .filter((s) => !s.isVoided)
    .reduce((sum, s) => sum + s.amountETB, 0);

  // -------------------------------------------------------------
  // POS Workspace Content (Embedded or Standalone)
  // -------------------------------------------------------------
  const terminalContent = (
    <div className="space-y-4">
      {/* Shift Overview Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1D19] border border-slate-200 dark:border-[#1A332C] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <Receipt className="w-4 h-4 shrink-0" />
            <span className="font-bold">Register #01</span>
          </div>
          <span className="text-slate-600 dark:text-[#9BAAA1]">
            {isOwner
              ? "Retail POS Terminal • Attribute in-store orders to active influencer campaigns"
              : `Active Shift • Cashier: ${userName}`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="font-bold text-slate-900 dark:text-white font-mono text-xs sm:text-sm bg-slate-50 dark:bg-[#081512] px-3 py-1 rounded-xl border border-slate-200 dark:border-[#1A332C]">
            Shift Total:{" "}
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
              {formatETB(totalETBToday)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsShiftModalOpen(true)}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-[#132722] dark:hover:bg-[#1A332C] text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Shift Summary
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {lastLoggedSale && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-headline font-bold text-sm text-emerald-950 dark:text-white">
                Transaction Attributed &amp; Logged: {formatETB(lastLoggedSale.amountETB)}
              </div>
              <div className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                Campaign: <strong>{lastLoggedSale.campaign.name}</strong> • Promo Code:{" "}
                <span className="font-mono font-bold">{lastLoggedSale.campaign.promoCode}</span>
                {lastLoggedSale.notes && ` • ${lastLoggedSale.notes}`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setReceiptModalSale(lastLoggedSale)}
              className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              Print Receipt
            </button>
            <button
              type="button"
              onClick={() => setLastLoggedSale(null)}
              className="text-xs text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2-COLUMN LANDSCAPE POS WORKSPACE (7 cols vs 5 cols)       */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Active Cart, Menu Items & Fast Tender (7 cols) */}
        <section className="lg:col-span-7 bg-white dark:bg-[#0E1D19] rounded-2xl border border-slate-200 dark:border-[#1A332C] shadow-xs flex flex-col overflow-hidden">
          {/* Cart Header */}
          <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-[#081512] border-b border-slate-200 dark:border-[#1A332C] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="font-headline font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <ShoppingBasket className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Ticket #{ticketNumber}</span>
              </span>
              <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {cartItems.reduce((sum, i) => sum + i.quantity, 0)} Items
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleClearCart()}
                className="h-8 px-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-[#1A332C] hover:border-rose-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cart</span>
              </button>
            </div>
          </div>

          {/* Quick Menu Catalog Bar */}
          <div className="p-3 bg-slate-50/40 dark:bg-[#081512]/60 border-b border-slate-200 dark:border-[#1A332C] overflow-x-auto">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-[#9BAAA1] shrink-0 font-label">
                Quick Menu:
              </span>
              {QUICK_CATALOG.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleAddToCart(cat)}
                  className="px-2.5 py-1 bg-white dark:bg-[#132722] hover:bg-emerald-50 dark:hover:bg-[#1A332C] hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-200 dark:border-[#1A332C] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs active:scale-95"
                >
                  <Plus className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{cat.name.split(" ")[0]} ({cat.unitPriceETB} ETB)</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cart Items List */}
          <div className="p-4 space-y-3 min-h-[180px] max-h-[300px] overflow-y-auto custom-scrollbar">
            {cartItems.length === 0 ? (
              <div className="py-10 text-center text-slate-400 dark:text-[#9BAAA1] space-y-2">
                <ShoppingBasket className="w-8 h-8 mx-auto stroke-1" />
                <p className="text-xs">Cart is empty. Tap quick items above or enter amount below.</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50/70 dark:bg-[#081512] hover:bg-slate-50 dark:hover:bg-[#10231D] border border-slate-200 dark:border-[#1A332C] rounded-xl flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
                      <Coffee className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-headline font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-[#9BAAA1] truncate">
                        {item.detail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Qty Stepper */}
                    <div className="flex items-center bg-white dark:bg-[#132722] border border-slate-200 dark:border-[#1A332C] rounded-lg p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1A332C] rounded-md transition-all active:scale-90 cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-headline font-bold text-xs text-slate-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1A332C] rounded-md transition-all active:scale-90 cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right min-w-[80px]">
                      <span className="font-headline font-bold text-sm text-slate-900 dark:text-white font-mono">
                        {formatETB(item.unitPriceETB * item.quantity)}
                      </span>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="w-7 h-7 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Remove item"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Gross Subtotal Banner */}
          <div className="px-5 py-3 bg-slate-50 dark:bg-[#081512] border-t border-b border-slate-200 dark:border-[#1A332C] flex items-center justify-between shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9BAAA1] font-label">
              Cart Gross Subtotal
            </span>
            <span className="font-headline font-bold text-base sm:text-lg text-slate-900 dark:text-white font-mono">
              {formatETB(cartSubtotal)}
            </span>
          </div>

          {/* Quick Cash Presets & Tactile Matrix */}
          <div className="p-4 bg-white dark:bg-[#0E1D19] space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-[#9BAAA1]">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Quick Cash Tender Presets</span>
              </span>
              <span className="text-slate-400 text-[11px]">Touch to auto-tender</span>
            </div>

            {/* Fast Presets */}
            <div className="grid grid-cols-5 gap-1.5">
              {[100, 250, 500, 1000, 2500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="h-10 bg-slate-50 dark:bg-[#081512] hover:bg-emerald-50 dark:hover:bg-[#132722] hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-[#1A332C] rounded-xl font-headline font-bold text-xs text-slate-800 dark:text-slate-200 transition-all active:scale-95 cursor-pointer shadow-2xs"
                >
                  +{preset}
                </button>
              ))}
            </div>

            {/* Tactile Keypad */}
            <div className="grid grid-cols-6 gap-1.5 pt-1">
              {["1", "2", "3", "4", "5"].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(digit)}
                  className="h-10 bg-slate-50 dark:bg-[#081512] hover:bg-slate-100 dark:hover:bg-[#132722] border border-slate-200 dark:border-[#1A332C] rounded-lg font-mono font-bold text-sm text-slate-800 dark:text-slate-100 active:scale-95 transition-all cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleKeypadPress("⌫")}
                className="h-10 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg font-bold text-xs active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                title="Backspace"
              >
                ⌫
              </button>

              {["6", "7", "8", "9", "0"].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(digit)}
                  className="h-10 bg-slate-50 dark:bg-[#081512] hover:bg-slate-100 dark:hover:bg-[#132722] border border-slate-200 dark:border-[#1A332C] rounded-lg font-mono font-bold text-sm text-slate-800 dark:text-slate-100 active:scale-95 transition-all cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleKeypadPress("CLR")}
                className="h-10 bg-slate-100 dark:bg-[#132722] hover:bg-slate-200 dark:hover:bg-[#1A332C] border border-slate-300 dark:border-[#1A332C] rounded-lg font-bold text-xs text-slate-700 dark:text-slate-300 active:scale-95 transition-all cursor-pointer"
              >
                CLR
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Attribution, Order Ledger & Dynamic Tender (5 cols) */}
        <section className="lg:col-span-5 bg-white dark:bg-[#0E1D19] rounded-2xl border border-slate-200 dark:border-[#1A332C] shadow-xs flex flex-col overflow-hidden space-y-4 p-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Influencer Promo Code Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-headline font-bold text-slate-700 dark:text-[#9BAAA1] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Creator Attribution &amp; Promo Code</span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Online Validation
              </span>
            </label>

            <div className="relative flex items-center">
              <Tag className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={customPromoCode}
                onChange={(e) => setCustomPromoCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE (e.g. ETHIO20)..."
                className="w-full h-11 pl-9 pr-24 uppercase font-mono font-bold text-sm tracking-wider text-slate-900 dark:text-white bg-slate-50 dark:bg-[#081512] border border-slate-300 dark:border-[#1A332C] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-[#0E1D19] transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  if (customPromoCode) {
                    toast.success(`Promo code ${customPromoCode} verified!`);
                  }
                }}
                className="absolute right-1.5 h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-headline font-bold flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Verified</span>
              </button>
            </div>
          </div>

          {/* Verified Creator Attribution Card (Bento Milestone) */}
          {matchedCampaign && (
            <div className="bg-emerald-50/70 dark:bg-[#0D241E] border border-emerald-300 dark:border-[#1F4539] rounded-xl p-3.5 relative overflow-hidden shadow-2xs">
              <div className="relative space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-headline font-bold text-xs sm:text-sm text-emerald-950 dark:text-white truncate">
                      CODE VERIFIED: {matchedCampaign.name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 font-mono">
                    <Send className="w-3 h-3" />
                    <span>{matchedCampaign.promoCode}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200/60 dark:border-[#1F4539] text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-[#9BAAA1] block text-[10px] uppercase font-label">
                      Customer Perk
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      20% Partner Discount
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 dark:text-[#9BAAA1] block text-[10px] uppercase font-label">
                      Creator Attribution
                    </span>
                    <span className="font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 inline-block font-mono">
                      10% Commission ({formatETB(creatorCommissionETB)})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Summary Ledger */}
          <div className="bg-slate-50 dark:bg-[#081512] rounded-xl p-4 border border-slate-200 dark:border-[#1A332C] space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600 dark:text-[#9BAAA1]">
              <span>Gross Subtotal</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {formatETB(cartSubtotal)}
              </span>
            </div>

            {discountETB > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <BadgePercent className="w-3.5 h-3.5" />
                  <span>Partner Promo Discount ({customPromoCode} - 20%)</span>
                </span>
                <span className="font-headline font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded font-mono">
                  -{formatETB(discountETB)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span>Value Added Tax (VAT 15%)</span>
              <span className="font-medium font-mono text-slate-600 dark:text-slate-300">
                Included ({formatETB(vatIncludedETB)})
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-[#1A332C] flex justify-between items-baseline">
              <div>
                <span className="font-headline font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-[#9BAAA1] block">
                  Final Amount Due
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Attribution Ledger Ready
                </span>
              </div>
              <div className="text-right">
                <span className="font-headline font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight font-mono">
                  {formatETB(finalAmountDue)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-headline font-bold text-slate-700 dark:text-[#9BAAA1] uppercase tracking-wider block">
              Select Tender Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Option 1: Telebirr QR */}
              <button
                type="button"
                onClick={() => setPaymentMethod("telebirr")}
                className={`h-16 p-2 rounded-xl border-2 flex flex-col items-center justify-center font-bold transition-all shadow-2xs relative cursor-pointer ${
                  paymentMethod === "telebirr"
                    ? "border-emerald-600 bg-emerald-50/60 dark:bg-[#0D241E] text-emerald-950 dark:text-emerald-300"
                    : "border-slate-200 dark:border-[#1A332C] bg-slate-50 dark:bg-[#081512] text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                }`}
              >
                {paymentMethod === "telebirr" && (
                  <div className="absolute top-1.5 right-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                  </div>
                )}
                <QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-headline mt-1">Telebirr QR</span>
              </button>

              {/* Option 2: CBE Birr */}
              <button
                type="button"
                onClick={() => setPaymentMethod("cbe")}
                className={`h-16 p-2 rounded-xl border flex flex-col items-center justify-center font-semibold transition-all cursor-pointer ${
                  paymentMethod === "cbe"
                    ? "border-2 border-emerald-600 bg-emerald-50/60 dark:bg-[#0D241E] text-emerald-950 dark:text-emerald-300"
                    : "border-slate-200 dark:border-[#1A332C] bg-slate-50 dark:bg-[#081512] text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                }`}
              >
                <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-headline mt-1">CBE Birr</span>
              </button>

              {/* Option 3: Cash */}
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`h-16 p-2 rounded-xl border flex flex-col items-center justify-center font-semibold transition-all cursor-pointer ${
                  paymentMethod === "cash"
                    ? "border-2 border-emerald-600 bg-emerald-50/60 dark:bg-[#0D241E] text-emerald-950 dark:text-emerald-300"
                    : "border-slate-200 dark:border-[#1A332C] bg-slate-50 dark:bg-[#081512] text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                }`}
              >
                <DollarSign className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="text-xs font-headline mt-1">Cash Received</span>
              </button>
            </div>
          </div>

          {/* Dynamic Payment Tender Sub-Panel (Telebirr QR) */}
          {paymentMethod === "telebirr" && (
            <div className="p-3.5 bg-slate-50 dark:bg-[#081512] rounded-xl border border-slate-200 dark:border-[#1A332C] flex items-center gap-3.5">
              <div className="w-16 h-16 p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-[#1A332C] shrink-0 flex items-center justify-center shadow-2xs">
                <svg className="w-13 h-13 text-slate-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h4v2h-4v-2zm-4 0h2v4h-2v-4zm2 4h2v4h-2v-4zm2 2h4v2h-4v-2zm0-4h2v2h-2v-2zm-4 4h2v2h-2v-2zM6 6h0v0h0V6zm12 0h0v0h0V6zM6 18h0v0h0V18z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Dynamic Merchant QR Live</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-[#9BAAA1] mt-0.5">
                  Customer scans with Telebirr SuperApp. Amount locked to{" "}
                  <strong className="text-emerald-700 dark:text-emerald-400 font-mono">
                    {formatETB(finalAmountDue)}
                  </strong>
                  .
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">Ref: TLB-ETL-{ticketNumber}</span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-semibold">
                    Auto-Detecting...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="button"
            disabled={loading || finalAmountDue <= 0}
            onClick={handleSubmitSale}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-headline font-bold text-base sm:text-lg rounded-xl shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6" />
                <span>Complete Transaction &amp; Attribute ({formatETB(finalAmountDue)})</span>
              </>
            )}
          </button>
        </section>
      </div>

      {/* ======================================================== */}
      {/* 3. RECENT SALES & AUDIT LEDGER SECTION                    */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-[#0E1D19] rounded-2xl border border-slate-200 dark:border-[#1A332C] shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#162C26]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-headline font-bold text-base text-slate-900 dark:text-white">
              Recent Store Attributions &amp; Shift Ledger
            </h3>
          </div>
          <span className="text-xs text-slate-400">{salesList.length} total logged sales</span>
        </div>

        {salesList.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No transactions recorded this shift yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {salesList.slice(0, 10).map((sale) => (
              <div
                key={sale.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                  sale.isVoided
                    ? "bg-slate-50/60 dark:bg-[#081512]/60 border-slate-200/60 dark:border-[#162C26] opacity-60"
                    : "bg-slate-50/70 dark:bg-[#081512] hover:bg-slate-50 dark:hover:bg-[#10231D] border-slate-200 dark:border-[#1A332C]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      sale.isVoided
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-500"
                        : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                    }`}
                  >
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-headline font-bold text-slate-900 dark:text-white">
                        {sale.campaign.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200/80 dark:bg-[#132722] text-slate-700 dark:text-slate-300 font-mono">
                        {sale.campaign.promoCode}
                      </span>
                      {sale.isVoided && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold uppercase">
                          Voided: {sale.voidReason}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-[#9BAAA1] mt-0.5 truncate">
                      Cashier: {sale.loggedBy.name} • {sale.notes || "In-store POS"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`font-headline font-bold text-sm font-mono block ${
                        sale.isVoided
                          ? "line-through text-slate-400"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {formatETB(sale.amountETB)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(sale.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setReceiptModalSale(sale)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#132722] rounded-lg transition-colors cursor-pointer"
                    title="View Receipt"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

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

      {/* ======================================================== */}
      {/* 4. MODALS: Void, Shift Summary & Printable Receipt        */}
      {/* ======================================================== */}

      {/* Void Confirmation Modal */}
      {voidModalSale && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="void-modal-title"
        >
          <div className="bg-white dark:bg-[#0E1D19] border border-slate-200 dark:border-[#1A332C] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
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
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-[#132722] transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#9BAAA1] leading-relaxed">
              Voiding this sale will exclude it from attributed store revenue, AOV, and creator conversion metrics while preserving it in the audit trail.
            </p>

            <div className="p-3.5 bg-slate-50 dark:bg-[#081512] rounded-xl border border-slate-200 dark:border-[#162C26] text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt / ID:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{voidModalSale.id.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Campaign:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {voidModalSale.campaign.name} ({voidModalSale.campaign.promoCode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {formatETB(voidModalSale.amountETB)}
                </span>
              </div>
            </div>

            {voidError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{voidError}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="void-reason"
                className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9BAAA1] mb-1.5 font-label"
              >
                Void Reason (Required)
              </label>
              <textarea
                id="void-reason"
                rows={3}
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="e.g. Customer returned items, cashier duplicate entry..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081512] border border-slate-300 dark:border-[#162C26] rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVoidModalSale(null)}
                disabled={voidSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#132722] rounded-xl transition-all cursor-pointer"
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

      {/* Shift Summary Report Modal */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0E1D19] border border-slate-200 dark:border-[#1A332C] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#162C26]">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="font-headline font-bold text-base text-slate-900 dark:text-white">
                  Cashier Shift Summary #104
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsShiftModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-[#081512] rounded-xl border border-slate-200 dark:border-[#162C26] space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Cashier:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Branch Register:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Bole Flagship #02</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Attributed Revenue:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                    {formatETB(totalETBToday)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Completed Orders:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {salesList.filter((s) => !s.isVoided).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Voided Transactions:</span>
                  <span className="font-bold text-rose-600 font-mono">
                    {salesList.filter((s) => s.isVoided).length}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsShiftModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {receiptModalSale && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0E1D19] border border-slate-200 dark:border-[#1A332C] rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
              <h3 className="font-headline font-black text-base text-slate-900 dark:text-white">
                {brandName}
              </h3>
              <p className="text-[11px] text-slate-500">Bole Flagship Store #02 • Addis Ababa</p>
              <p className="text-[10px] text-slate-400 font-mono">TIN: 0048291039 • VAT Reg: 2026-ET</p>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-600 dark:text-[#9BAAA1]">
                <span>Receipt: #{receiptModalSale.id.slice(-6)}</span>
                <span>{new Date(receiptModalSale.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-[#9BAAA1]">
                <span>Cashier: {receiptModalSale.loggedBy.name}</span>
                <span>Register 01</span>
              </div>
              <div className="py-2 border-t border-b border-dashed border-slate-300 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-white">
                <span>{receiptModalSale.campaign.name}</span>
                <span>{formatETB(receiptModalSale.amountETB)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 text-[11px]">
                <span>Attributed Promo Code</span>
                <span>{receiptModalSale.campaign.promoCode}</span>
              </div>
              <div className="flex justify-between font-extrabold text-base pt-2 text-slate-900 dark:text-white">
                <span>TOTAL PAID</span>
                <span>{formatETB(receiptModalSale.amountETB)}</span>
              </div>
            </div>

            <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-dashed border-slate-300 dark:border-slate-700">
              Thank you for shopping local with EthioLink!
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReceiptModalSale(null)}
                className="w-full py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // -------------------------------------------------------------
  // Embedded inside Brand Cockpit Tab
  // -------------------------------------------------------------
  if (embedded) {
    return terminalContent;
  }

  // -------------------------------------------------------------
  // Standalone Cashier POS Terminal Page (/brand/sales)
  // Preserving navbar-shell layout-container for tests/layout-tokens.test.mjs
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#06110E] text-slate-900 dark:text-slate-100 font-body antialiased flex flex-col selection:bg-emerald-100 selection:text-emerald-900 dark:selection:bg-emerald-950 dark:selection:text-emerald-200 transition-colors duration-150">
      {/* Top Shift Status Bar / Header (Shared Anchor Layout) */}
      <header className="bg-white dark:bg-[#0E1D19] border-b border-slate-200 dark:border-[#1A332C] sticky top-0 z-30 shadow-xs">
        <div className="navbar-shell layout-container px-[var(--page-px)] py-2.5 flex items-center justify-between gap-4">
          {/* Brand & Store Context */}
          <div className="flex items-center gap-3 min-w-0">
            {isOwner && (
              <Link
                href="/brand"
                className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#132722] rounded-xl transition-all shrink-0"
                title="Back to Brand Overview"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}

            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 shrink-0">
              <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-headline font-black text-base sm:text-lg text-emerald-700 dark:text-emerald-300 tracking-tight leading-none">
                EthioLink
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                POS 2.4
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-[#1A332C] hidden sm:block shrink-0" />

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 truncate">
                <span className="font-headline font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight truncate">
                  {brandName} — Bole Flagship #02
                </span>
                <span className="hidden md:inline-flex bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Register 01</span>
                </span>
              </div>
              <span className="font-body text-[11px] text-slate-500 dark:text-[#9BAAA1] truncate">
                Cashier: <strong>{userName}</strong> • Shift #104
              </span>
            </div>
          </div>

          {/* Realtime Sync & Utility Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Sync Indicator */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-[#081512] border border-slate-200 dark:border-[#1A332C] px-3 py-1.5 rounded-xl text-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-slate-700 dark:text-slate-300 text-[11px]">
                Sync Live <strong className="text-emerald-600 dark:text-emerald-400">(2ms)</strong>
              </span>
            </div>

            {/* Utility Buttons */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="h-9 px-2.5 sm:px-3 flex items-center gap-1.5 bg-slate-50 dark:bg-[#081512] hover:bg-slate-100 dark:hover:bg-[#132722] border border-slate-200 dark:border-[#1A332C] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer"
              title="Open Cash Drawer"
            >
              {isDrawerOpen ? (
                <LockOpen className="w-4 h-4 text-emerald-600" />
              ) : (
                <Lock className="w-4 h-4 text-slate-400" />
              )}
              <span className="hidden sm:inline">Drawer</span>
            </button>

            <button
              type="button"
              onClick={() => setIsShiftModalOpen(true)}
              className="h-9 px-2.5 sm:px-3 flex items-center gap-1.5 bg-slate-50 dark:bg-[#081512] hover:bg-slate-100 dark:hover:bg-[#132722] border border-slate-200 dark:border-[#1A332C] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer"
              title="Shift Summary Report"
            >
              <Receipt className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Shift</span>
            </button>

            <ThemeToggle />

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="h-9 w-9 flex items-center justify-center bg-slate-50 dark:bg-[#081512] hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 border border-slate-200 dark:border-[#1A332C] text-slate-600 dark:text-slate-400 rounded-xl transition-all active:scale-95 cursor-pointer"
                title="Lock & Exit Terminal"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Terminal Grid (Preserving <main className="layout-container) */}
      <main className="layout-container px-[var(--page-px)] py-5 space-y-4 flex-1">
        {terminalContent}
      </main>

      {/* Bottom Store Stream & Hardware Peripherals Bar (matching Stitch b24e0911) */}
      <footer className="bg-white dark:bg-[#0E1D19] border-t border-slate-200 dark:border-[#1A332C] shrink-0 px-4 py-2.5 z-20">
        <div className="layout-container px-[var(--page-px)] flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs">
          {/* Live Stream */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            <span className="font-headline font-bold text-slate-800 dark:text-white flex items-center gap-1.5 shrink-0 pr-2 border-r border-slate-200 dark:border-[#1A332C] text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Store Stream</span>
            </span>
            <div className="flex items-center gap-2 whitespace-nowrap overflow-x-auto text-[11px]">
              <div className="px-2.5 py-1 bg-slate-50 dark:bg-[#081512] border border-slate-200 dark:border-[#1A332C] rounded-lg text-slate-600 dark:text-[#9BAAA1] flex items-center gap-1.5 font-mono">
                <span className="font-bold text-slate-800 dark:text-slate-200">#10842</span>
                <span>• 450.00 ETB</span>
                <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold px-1 rounded text-[10px]">
                  ADDISFOODIE (Yared K.)
                </span>
                <span className="text-slate-400">Telebirr • 3m ago</span>
              </div>
              <div className="px-2.5 py-1 bg-slate-50 dark:bg-[#081512] border border-slate-200 dark:border-[#1A332C] rounded-lg text-slate-600 dark:text-[#9BAAA1] flex items-center gap-1.5 font-mono">
                <span className="font-bold text-slate-800 dark:text-slate-200">#10841</span>
                <span>• 680.00 ETB</span>
                <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold px-1 rounded text-[10px]">
                  ETHIO20 (Meron B.)
                </span>
                <span className="text-slate-400">CBE Birr • 8m ago</span>
              </div>
            </div>
          </div>

          {/* Hardware Peripherals Status */}
          <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-500 dark:text-[#9BAAA1]">
            <div className="flex items-center gap-1">
              <Printer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                POS Printer: <strong className="text-emerald-700 dark:text-emerald-400">Online</strong>
              </span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <div className="flex items-center gap-1">
              <LockOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                Drawer: <strong className="text-emerald-700 dark:text-emerald-400">Connected</strong>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
