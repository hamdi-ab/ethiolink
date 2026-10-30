import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BrandCampaignActions } from "./BrandCampaignActions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEffectiveStatus, getStatusBadgeConfig } from "@/lib/lifecycle";
import {
  Store,
  Users,
  BarChart3,
  PlusCircle,
  Shield,
  LogOut,
  Tag,
  Calendar,
} from "lucide-react";

async function BrandView() {
  try { await connection(); } catch {}
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Two-tier role enforcement: Staff are redirected to sales logging
  if (session.role === "STAFF") {
    redirect("/brand/sales");
  }

  let brand = null;
  let campaigns: Array<{
    id: string;
    name: string;
    slug: string;
    promoCode: string;
    status: string;
    description?: string | null;
    telegramUrl?: string | null;
    phoneNumber?: string | null;
    mapUrl?: string | null;
    startDate: Date | null;
    endDate: Date | null;
    _count?: { events: number; sales: number };
  }> = [];

  if (session.brandId) {
    try {
      brand = await db.brand.findUnique({
        where: { id: session.brandId },
        include: {
          _count: {
            select: {
              campaigns: true,
              users: true,
            },
          },
        },
      });

      campaigns = await db.campaign.findMany({
        where: { brandId: session.brandId },
        include: {
          creators: {
            include: {
              creator: {
                include: {
                  user: {
                    select: {
                      name: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              events: true,
              sales: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      brand = {
        name: `${session.name}'s Business`,
        ownerName: session.name,
        _count: { campaigns: 0, users: 1 },
      };
      campaigns = [];
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors duration-200">
      {/* Brand Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="navbar-shell layout-container px-[var(--page-px)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-600/20">
              E
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline font-black text-lg text-slate-900 dark:text-white leading-tight">
                  Ethio<span className="text-emerald-600 dark:text-emerald-400">Link</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Merchant
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {brand?.name} • Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{session.name}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">{session.role}</span>
            </div>
            {session.role === "ADMIN" && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 rounded-xl transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Admin Console</span>
              </Link>
            )}
            <ThemeToggle size="sm" />
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="layout-container px-[var(--page-px)] pt-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Campaigns</span>
              <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{brand?._count?.campaigns || 0}</div>
            <Link
              href="/brand/analytics"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 mt-3"
            >
              View Full Analytics Funnel →
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Staff Members</span>
              <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{brand?._count?.users || 1}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">In-Store Attribution</span>
              <Store className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <Link
              href="/brand/sales"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 mt-2"
            >
              Open In-Store Sales Logger →
            </Link>
          </div>
        </div>

        {/* Campaign List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Campaign Management</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Oversee your Ethiopian influencer promotions and attribution links</p>
            </div>
            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-xs">
              <Link href="/brand/campaigns/new">
                <PlusCircle className="w-4 h-4" />
                <span>Create Campaign</span>
              </Link>
            </Button>
          </div>

          {campaigns.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-center">
              <Store className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No active campaigns yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                Ready to collaborate with Telegram or TikTok creators? Launch your first campaign to generate attribution links.
              </p>
              <Link
                href="/brand/campaigns/new"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                Launch your first campaign →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {campaigns.map((camp) => {
                const effectiveStatus = getEffectiveStatus(camp);
                const badgeConfig = getStatusBadgeConfig(effectiveStatus);

                return (
                  <div key={camp.id} className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{camp.name}</h3>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                          <Tag className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          {camp.promoCode}
                        </span>
                        <Badge
                          variant="outline"
                          className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${badgeConfig.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badgeConfig.dotClass}`} />
                          {badgeConfig.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span>Slug: /{camp.slug}</span>
                        <span>•</span>
                        <span>{camp._count?.events || 0} customer events</span>
                        <span>•</span>
                        <span>{camp._count?.sales || 0} sales</span>
                        {camp.endDate && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                              <Calendar className="w-3 h-3" />
                              Ends {new Date(camp.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <BrandCampaignActions
                      campaign={{
                        id: camp.id,
                        name: camp.name,
                        slug: camp.slug,
                        promoCode: camp.promoCode,
                        brandName: brand?.name || "Merchant",
                        status: camp.status,
                        effectiveStatus,
                        description: camp.description,
                        telegramUrl: camp.telegramUrl,
                        phoneNumber: camp.phoneNumber,
                        mapUrl: camp.mapUrl,
                        startDate: camp.startDate ? camp.startDate.toISOString() : null,
                        endDate: camp.endDate ? camp.endDate.toISOString() : null,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Attribution Limitations & Data Governance Notice (PRD FR-020 / FR-025) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <p>
            Reported revenue represents merchant-logged in-store transactions. Raw customer interaction telemetry is systematically purged after 90 days.
          </p>
          <Link
            href="/privacy"
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline shrink-0"
          >
            Privacy &amp; Data Practices &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function BrandDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BrandView />
    </Suspense>
  );
}
