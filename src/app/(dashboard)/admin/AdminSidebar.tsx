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
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  LifeBuoy,
  Layers,
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
      title: "Cockpit Navigation",
      items: [
        {
          id: "overview",
          label: "Executive Overview",
          icon: LayoutDashboard,
        },
        {
          id: "analytics",
          label: "Reports & Funnel",
          icon: TrendingUp,
          badge: "LIVE",
          badgeColor:
            "bg-[#0D2B26] dark:bg-[#060D0B] border border-emerald-500/40 dark:border-[#20362E] text-emerald-200 dark:text-[#78B99D]",
        },
      ],
    },
    {
      title: "Directory & Rosters",
      items: [
        {
          id: "merchants",
          label: "Brands & Workspaces",
          icon: Store,
          badge: counts.merchants,
        },
        {
          id: "creators",
          label: "Creators Directory",
          icon: Users,
          badge: counts.creators,
        },
        {
          id: "campaigns",
          label: "Active Campaigns",
          icon: Tag,
          badge: counts.campaigns,
        },
      ],
    },
    {
      title: "Operations & Audit",
      items: [
        {
          id: "sales",
          label: "Attributed Sales",
          icon: Receipt,
          badge: counts.sales,
        },
        {
          id: "issues",
          label: "Reported Issues",
          icon: LifeBuoy,
          badge: counts.issues,
          badgeColor:
            counts.issues && counts.issues > 0
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : undefined,
        },
        {
          id: "health",
          label: "Platform Ops & Health",
          icon: Server,
        },
        {
          id: "telemetry",
          label: "Raw Telemetry Stream",
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
    <div className="flex flex-col h-full bg-[#10352F] dark:bg-[#08120F] text-white border-r border-[#1B4B42] dark:border-[#1E332B] transition-all duration-300 select-none">
      {/* Brand Header */}
      <div className="h-[var(--navbar-height)] flex items-center justify-between px-3.5 border-b border-[#1B4B42] dark:border-[#1E332B] bg-[#0C2722]/90 dark:bg-[#050A08]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-[#10352F] dark:from-[#78B99D] dark:to-[#0D2119] text-white dark:text-[#0D2119] flex items-center justify-center font-black text-base shadow-xs shrink-0 border border-emerald-400/20 dark:border-transparent">
            <Layers className="w-5 h-5 text-white dark:text-[#0D2119]" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-bold text-lg text-white leading-none tracking-tight">
                  Ethio<span className="text-emerald-400 dark:text-[#78B99D]">Link</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold bg-emerald-500/20 text-emerald-300 dark:text-[#78B99D] border border-emerald-500/30">
                  OPS
                </span>
              </div>
              <p className="text-[11px] font-semibold text-emerald-300 dark:text-[#83D1A5] uppercase tracking-wider mt-0.5 truncate">
                Attribution Engine
              </p>
            </div>
          )}
        </div>

        {/* Desktop Collapse / Expand Toggle */}
        <div className="hidden lg:flex items-center">
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-1.5 rounded-lg text-emerald-200/70 hover:text-white hover:bg-[#16443D] dark:text-[#9BAAA1] dark:hover:text-white dark:hover:bg-[#142621] transition-colors cursor-pointer"
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-emerald-200/70 hover:text-white hover:bg-[#16443D] dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#142621]"
          aria-label="Close mobile sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Global Platform Scope Indicator */}
      {!isCollapsed ? (
        <div className="px-3 pt-3">
          <div className="w-full bg-[#16443D]/80 dark:bg-[#11211C] rounded-xl p-2.5 flex items-center justify-between border border-[#225C52]/70 dark:border-[#20362E] shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 dark:text-[#78B99D] flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Globe className="w-4 h-4" />
              </div>
              <div className="truncate min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight flex items-center gap-1.5">
                  <span>Platform Scope</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </p>
                <p className="text-[11px] text-emerald-200/70 dark:text-[#9BAAA1] truncate mt-0.5 font-mono">
                  All Workspaces
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 dark:text-[#78B99D] bg-[#0D2B26] dark:bg-[#060D0B] px-1.5 py-0.5 rounded border border-emerald-500/30">
              Global
            </span>
          </div>
        </div>
      ) : (
        <div className="pt-2 flex justify-center w-full">
          <div
            title="Global Platform Scope (All Workspaces)"
            className="w-10 h-10 rounded-xl bg-[#16443D] dark:bg-[#11211C] text-emerald-300 dark:text-[#78B99D] flex items-center justify-center border border-[#225C52] dark:border-[#20362E] shadow-2xs"
          >
            <Globe className="w-5 h-5" />
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto sidebar-scroll py-3 px-3 space-y-4">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-emerald-200/60 dark:text-[#9BAAA1] mb-1 font-headline">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center transition-all group relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                      isCollapsed
                        ? "w-10 h-10 rounded-xl justify-center relative hover:scale-105 mx-auto"
                        : "justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left"
                    } ${
                      isActive
                        ? "bg-[#1C554C] dark:bg-[#18332A] text-white border border-emerald-400/30 dark:border-[#28493D] shadow-xs font-bold"
                        : "text-[#C5DCD6] dark:text-[#9BAAA1] hover:bg-[#16443D] dark:hover:bg-[#11211C] hover:text-white dark:hover:text-white border border-transparent"
                    }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2.5"}`}>
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? "text-emerald-300 dark:text-[#78B99D]"
                            : "text-emerald-200/60 dark:text-[#9BAAA1]"
                        }`}
                      />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 text-[11px] font-mono font-bold rounded-md ${
                          item.badgeColor ||
                          "bg-[#0D2B26] dark:bg-[#060D0B] border border-emerald-500/40 dark:border-[#20362E] text-emerald-200 dark:text-[#78B99D]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Active Left Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-emerald-400 dark:bg-[#78B99D] shadow-xs" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Admin Profile & Footer Utility */}
      <div className="border-t border-[#1B4B42] dark:border-[#1E332B] bg-[#0B2520] dark:bg-[#050A08] p-3">
        {!isCollapsed ? (
          <div className="flex items-center justify-between px-1 h-10">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 dark:bg-[#78B99D] text-white dark:text-[#0D2119] font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-xs text-white block truncate leading-tight">
                  {adminName}
                </span>
                <span className="text-[10px] text-emerald-300 dark:text-[#78B99D] block truncate mt-0.5 font-medium">
                  Superadmin &bull; Root
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <ThemeToggle
                size="sm"
                className="!bg-[#16443D] dark:!bg-[#11211C] !border-[#225C52] dark:!border-[#20362E] !text-emerald-100 dark:!text-[#9BAAA1] hover:!bg-[#1C554C] dark:hover:!bg-[#18332A] rounded-lg"
              />
              <form action="/api/auth/logout" method="POST" className="inline-flex">
                <button
                  type="submit"
                  aria-label="Sign Out"
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Collapsed Mode */
          <div className="flex flex-col items-center gap-2 py-1">
            <div
              title={`${adminName} (Superadmin)`}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1C554C] to-[#0D2B26] dark:from-[#18332A] dark:to-[#0D1714] border border-[#2B7366] dark:border-[#28493D] text-white font-bold text-xs flex items-center justify-center ring-2 ring-emerald-400/20 cursor-default"
            >
              {adminName.charAt(0).toUpperCase()}
            </div>

            <div className="w-6 h-px bg-[#1B4B42]/60 dark:bg-[#1E332B]/60 my-0.5" />

            <ThemeToggle
              size="sm"
              className="!w-9 !h-9 !bg-[#16443D] dark:!bg-[#11211C] !border-[#225C52] dark:!border-[#20362E] !text-emerald-100 dark:!text-[#9BAAA1] rounded-xl flex items-center justify-center shadow-xs cursor-pointer"
            />

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                title="Sign out"
                aria-label="Sign out"
                className="w-9 h-9 flex items-center justify-center rounded-xl text-emerald-200/60 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
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
