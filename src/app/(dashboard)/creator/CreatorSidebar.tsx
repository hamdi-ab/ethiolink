"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { formatETB } from "@/lib/sales";
import {
  Sparkles,
  CheckCircle2,
  LayoutDashboard,
  Receipt,
  QrCode,
  Wallet,
  LifeBuoy,
  LogOut,
  X,
  Star,
  Clock,
} from "lucide-react";

export interface CreatorSidebarProps {
  creator: {
    id: string;
    name: string;
    phone?: string | null;
    telegramUsername?: string | null;
  };
  activeTab: "overview" | "campaigns" | "links" | "payouts";
  onSelectTab: (tab: "overview" | "campaigns" | "links" | "payouts") => void;
  campaignCount: number;
  estimatedCommissionETB: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenReportModal: () => void;
  lang: "en" | "am";
  onToggleLang: () => void;
}

export function CreatorSidebar({
  creator,
  activeTab,
  onSelectTab,
  campaignCount,
  estimatedCommissionETB,
  isMobileOpen,
  onCloseMobile,
  onOpenReportModal,
  lang,
  onToggleLang,
}: CreatorSidebarProps) {
  const navItems = [
    {
      id: "overview" as const,
      label: "Overview & Earnings",
      icon: LayoutDashboard,
      href: "#overview",
    },
    {
      id: "campaigns" as const,
      label: "My Campaigns",
      icon: Receipt,
      href: "#campaigns",
      badge: `${campaignCount} Active`,
      badgeColor: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    },
    {
      id: "links" as const,
      label: "Tracking Deep Links & QR",
      icon: QrCode,
      href: "#links",
    },
    {
      id: "payouts" as const,
      label: "Telebirr & CBE Payouts",
      icon: Wallet,
      href: "#payouts",
    },
  ];

  const handleNavClick = (id: "overview" | "campaigns" | "links" | "payouts", href: string) => {
    onSelectTab(id);
    onCloseMobile();
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formattedPhone = creator.phone
    ? `${creator.phone.slice(0, 8)} *** ${creator.phone.slice(-2)}`
    : "+251 911 *** 67";

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Persistent Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#102F2B] dark:bg-[#071310] text-slate-200 w-[268px] flex flex-col justify-between border-r border-[#17443D] dark:border-[#132822] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
        aria-label="Creator Navigation"
      >
        <div className="p-5 flex flex-col gap-5 overflow-y-auto custom-scrollbar flex-1">
          {/* Logo & Portal Badge */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-black text-xl text-white tracking-tight leading-none">
                  EthioLink
                </span>
                <span className="text-[10px] text-emerald-400 font-medium tracking-wide">
                  Attribution Mesh
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                Creator Portal
              </span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-emerald-950/50"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Creator Profile Card */}
          <div className="p-3.5 rounded-xl bg-emerald-950/50 dark:bg-[#0A1A15] border border-emerald-800/40 dark:border-[#1A3329] backdrop-blur-xs">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-bold text-base ring-2 ring-emerald-400 p-0.5 shadow-xs">
                  {creator.name.charAt(0)}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#102F2B] dark:border-[#071310] rounded-full animate-pulse" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-headline font-bold text-sm text-white truncate">
                    {creator.name}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </div>
                <span className="text-xs text-slate-300 dark:text-slate-400 truncate font-mono">
                  {creator.telegramUsername ? `@${creator.telegramUsername}` : "@ethio_lifestyle"}
                </span>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#D4AF37]/20 text-[#E8C55A] border border-[#D4AF37]/40">
                    <Star className="w-2.5 h-2.5 fill-[#D4AF37] text-[#D4AF37]" />
                    <span>Tier 1 Partner</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 px-3 uppercase">
              Attribution Core
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.id, item.href);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#17443D] dark:bg-[#132A24] text-white border-l-4 border-emerald-400 shadow-xs"
                      : "text-slate-300 dark:text-[#9BAAA1] hover:text-white hover:bg-emerald-950/40 dark:hover:bg-[#10231D]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  ) : null}
                </a>
              );
            })}

            {/* Support / Report Issue */}
            <button
              type="button"
              onClick={() => {
                onOpenReportModal();
                onCloseMobile();
              }}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-300 dark:text-[#9BAAA1] hover:text-white hover:bg-emerald-950/40 dark:hover:bg-[#10231D] text-xs font-medium transition-colors w-full text-left cursor-pointer"
            >
              <LifeBuoy className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Report Discrepancy</span>
            </button>
          </nav>

          {/* Telebirr Wallet Status Card */}
          <div className="mt-auto p-3.5 rounded-xl bg-gradient-to-br from-[#133A34] to-[#0D2623] dark:from-[#0E2621] dark:to-[#081714] border border-emerald-700/30 dark:border-[#1A3830] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
                <Wallet className="w-3.5 h-3.5" />
                <span>Telebirr Wallet</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Linked
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-mono">
              {formattedPhone}
            </div>
            <div className="pt-1.5 border-t border-emerald-800/40 dark:border-[#1A3830] flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Available:</span>
              <span className="font-mono font-bold text-white text-xs">
                {formatETB(estimatedCommissionETB > 0 ? estimatedCommissionETB : 8450)}
              </span>
            </div>
            <div className="text-[10px] text-emerald-300/80 flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Auto-payout: Mon 9:00 AM</span>
            </div>
          </div>
        </div>

        {/* Bottom Utility Controls */}
        <div className="p-4 border-t border-[#17443D] dark:border-[#132822] bg-[#0E2824] dark:bg-[#06100D] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleLang}
              className="px-2 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#16362C] dark:hover:bg-[#0D1F1A] rounded-lg border border-[#17443D] dark:border-[#132822] transition-colors cursor-pointer"
              title="Toggle Amharic / English"
            >
              {lang === "en" ? "አማ / EN" : "EN / አማ"}
            </button>
            <ThemeToggle />
          </div>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-1 text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#16362C] dark:hover:bg-[#0D1F1A] transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
