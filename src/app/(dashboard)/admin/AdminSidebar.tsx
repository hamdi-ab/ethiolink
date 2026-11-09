"use client";

import React from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  Tag,
  Store,
  Users,
  Radio,
  Server,
  LogOut,
  X,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  LifeBuoy,
  ChevronDown,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

export type AdminTab =
  | "overview"
  | "analytics"
  | "sales"
  | "campaigns"
  | "merchants"
  | "creators"
  | "issues"
  | "telemetry"
  | "health";

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  counts: {
    sales: number;
    campaigns: number;
    merchants: number;
    creators: number;
    events: number;
    issues?: number;
  };
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  adminName: string;
}

export function AdminSidebar({
  activeTab,
  onSelectTab,
  counts,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  adminName,
}: AdminSidebarProps) {
  const navSections: NavSection[] = [
    {
      title: "Platform Intelligence",
      items: [
        {
          id: "overview",
          label: "Executive Overview",
          icon: LayoutDashboard,
        },
        {
          id: "analytics",
          label: "Funnel & Intelligence",
          icon: TrendingUp,
          badge: "NEW",
          badgeColor: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
        },
      ],
    },
    {
      title: "Management & Rosters",
      items: [
        {
          id: "merchants",
          label: "Brands & Merchants",
          icon: Store,
          badge: counts.merchants,
        },
        {
          id: "creators",
          label: "Creator Directory",
          icon: Users,
          badge: counts.creators,
        },
        {
          id: "campaigns",
          label: "Active Campaigns",
          icon: Tag,
          badge: counts.campaigns,
        },
        {
          id: "sales",
          label: "Sales & Attribution",
          icon: Receipt,
          badge: counts.sales,
        },
        {
          id: "issues",
          label: "Reported Issues",
          icon: LifeBuoy,
          badge: counts.issues,
          badgeColor: counts.issues && counts.issues > 0 ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : undefined,
        },
      ],
    },
    {
      title: "Infrastructure & Audit",
      items: [
        {
          id: "health",
          label: "Platform Ops & Health",
          icon: Server,
        },
        {
          id: "telemetry",
          label: "Event Telemetry",
          icon: Radio,
          badge: counts.events,
        },
      ],
    },
  ];

  const handleItemClick = (id: AdminTab) => {
    onSelectTab(id);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#102F2B] text-slate-100 border-r border-[#1A332C] transition-all duration-300 select-none">
      {/* Brand Header */}
      <div className="h-[var(--navbar-height)] flex items-center justify-between px-4 border-b border-emerald-900/60 bg-[#0C2421]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-black text-base shadow-sm shadow-emerald-500/30">
            <Sparkles className="w-5 h-5 text-emerald-100" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-black text-base text-white tracking-tight">
                  Ethio<span className="text-emerald-400">Link</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  OPS
                </span>
              </div>
              <p className="text-[10px] text-emerald-300/70 font-semibold uppercase tracking-wider truncate">
                Attribution Engine
              </p>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-emerald-200/70 hover:text-white hover:bg-emerald-900/40"
          aria-label="Close mobile sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Workspace Quick-Select Pill (Matching Stitch Screen bd7550b6) */}
      {!isCollapsed && (
        <div className="px-3 pt-3">
          <div className="p-2 rounded-xl bg-[#0B1E1B] border border-emerald-900/60 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-900/60 border border-emerald-700/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="truncate min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  Sheba Artisan Coffee
                </div>
                <div className="text-[10px] text-emerald-300/70 truncate">
                  Bole Flagship • Addis Ababa
                </div>
              </div>
            </div>
            <div className="text-emerald-400/80 shrink-0">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto sidebar-scroll py-4 px-3 space-y-5">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-300/60 mb-1.5 font-headline">
                {section.title}
              </h3>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                      isActive
                        ? "bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 shadow-xs"
                        : "text-emerald-100/70 hover:text-white hover:bg-emerald-900/30 border border-transparent"
                    } ${isCollapsed ? "justify-center px-0" : ""}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-emerald-300"
                          : "text-emerald-300/60 group-hover:text-emerald-200"
                      }`}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        {item.badge !== undefined && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-md ${
                              item.badgeColor ||
                              (isActive
                                ? "bg-emerald-500/30 text-emerald-200"
                                : "bg-emerald-950/60 text-emerald-300/80 border border-emerald-900/50")
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}

                    {/* Active Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-400 rounded-r-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Admin Profile & Gateway Status Footer */}
      <div className="p-3 border-t border-emerald-900/60 bg-[#0C2421]">
        {!isCollapsed ? (
          <div className="space-y-2.5">
            {/* Gateway Active Status Indicator */}
            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#0B1E1B] border border-emerald-900/50 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-emerald-200">Telebirr &amp; CBE Birr</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                ACTIVE
              </span>
            </div>

            {/* User Profile Card with Sign Out */}
            <div className="p-2 rounded-xl bg-[#0B1E1B] border border-emerald-900/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 shrink-0 rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold flex items-center justify-center ring-2 ring-emerald-400/20">
                  {adminName.charAt(0).toUpperCase()}
                </div>
                <div className="truncate min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {adminName}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-300/70 font-mono">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Superadmin</span>
                  </div>
                </div>
              </div>

              {/* Sign Out Button */}
              <form action="/api/auth/logout" method="POST" className="shrink-0">
                <button
                  type="submit"
                  title="Sign out"
                  aria-label="Sign out"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-emerald-300/70 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Bottom Utilities Row */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <ThemeToggle size="sm" />
                <span className="text-[10px] font-medium text-emerald-300/70">Theme</span>
              </div>

              <button
                onClick={onToggleCollapse}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
                className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-emerald-300/70 hover:text-white hover:bg-emerald-900/40 transition-colors cursor-pointer"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
                <span className="text-[11px]">Collapse</span>
              </button>
            </div>
          </div>
        ) : (
          /* Collapsed Mode */
          <div className="flex flex-col items-center gap-2 py-1">
            <div
              title={`${adminName} (Superadmin)`}
              className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-mono text-xs font-bold flex items-center justify-center ring-2 ring-emerald-400/20 cursor-default"
            >
              {adminName.charAt(0).toUpperCase()}
            </div>

            <div className="w-6 h-px bg-emerald-900/60 my-0.5" />

            <div className="flex items-center justify-center" title="Toggle theme">
              <ThemeToggle size="sm" />
            </div>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                title="Sign out"
                aria-label="Sign out"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-emerald-300/70 hover:text-rose-400 hover:bg-rose-950/40 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>

            <button
              onClick={onToggleCollapse}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-emerald-300/70 hover:text-white hover:bg-emerald-900/40 transition-all cursor-pointer"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 h-screen sticky top-0 z-30 transition-all duration-300 ${
          isCollapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
