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
} from "lucide-react";

export type AdminTab =
  | "overview"
  | "analytics"
  | "sales"
  | "campaigns"
  | "merchants"
  | "creators"
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
          badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
        },
      ],
    },
    {
      title: "Management & Rosters",
      items: [
        {
          id: "sales",
          label: "Sales Ledger",
          icon: Receipt,
          badge: counts.sales,
        },
        {
          id: "campaigns",
          label: "Active Campaigns",
          icon: Tag,
          badge: counts.campaigns,
        },
        {
          id: "merchants",
          label: "Registered Brands",
          icon: Store,
          badge: counts.merchants,
        },
        {
          id: "creators",
          label: "Creator Directory",
          icon: Users,
          badge: counts.creators,
        },
      ],
    },
    {
      title: "Infrastructure & Audit",
      items: [
        {
          id: "telemetry",
          label: "Event Telemetry",
          icon: Radio,
          badge: counts.events,
        },
        {
          id: "health",
          label: "System Health",
          icon: Server,
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
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-xs">
            EL
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-black text-base text-slate-900 dark:text-slate-100 tracking-tight">
                  Ethio<span className="text-emerald-600 dark:text-emerald-400">Link</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  OPS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                Admin Console
              </p>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Close mobile sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto sidebar-scroll py-4 px-3 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 font-headline">
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
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative cursor-pointer ${
                      isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 border border-transparent"
                    } ${isCollapsed ? "justify-center px-0" : ""}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
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
                                ? "bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-800 dark:text-emerald-200"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400")
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}

                    {/* Active Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-600 dark:bg-emerald-400 rounded-r-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Admin Profile & Footer Actions */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        {!isCollapsed ? (
          /* Expanded Mode: Integrated Profile Card & Aligned Toolbar */
          <div className="space-y-2.5">
            {/* User Profile Card with Embedded Sign Out */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 shrink-0 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center justify-center ring-2 ring-emerald-500/20 shadow-2xs">
                  {adminName.charAt(0).toUpperCase()}
                </div>
                <div className="truncate min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {adminName}
                    </span>
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Superadmin</span>
                  </div>
                </div>
              </div>

              {/* Integrated Sign Out Button */}
              <form action="/api/auth/logout" method="POST" className="shrink-0">
                <button
                  type="submit"
                  title="Sign out"
                  aria-label="Sign out"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Bottom Utilities Row: Theme Toggle + Sidebar Collapse */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <ThemeToggle size="sm" />
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Theme</span>
              </div>

              <button
                onClick={onToggleCollapse}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
                <span className="text-[11px]">Collapse</span>
              </button>
            </div>
          </div>
        ) : (
          /* Collapsed Mode: Uniform 36x36px Centered Action Stack */
          <div className="flex flex-col items-center gap-2 py-1">
            {/* User Avatar */}
            <div
              title={`${adminName} (Superadmin)`}
              className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center justify-center ring-2 ring-emerald-500/20 shadow-2xs cursor-default"
            >
              {adminName.charAt(0).toUpperCase()}
            </div>

            <div className="w-6 h-px bg-slate-200 dark:bg-slate-800 my-0.5" />

            {/* Theme Toggle (36x36px) */}
            <div className="flex items-center justify-center" title="Toggle theme">
              <ThemeToggle size="md" />
            </div>

            {/* Sign Out (36x36px) */}
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                title="Sign out"
                aria-label="Sign out"
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>

            {/* Expand Sidebar (36x36px) */}
            <button
              onClick={onToggleCollapse}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              className="hidden lg:flex w-9 h-9 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer"
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
          isCollapsed ? "w-[72px]" : "w-64"
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
