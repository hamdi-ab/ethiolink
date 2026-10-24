import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Store,
  Users,
  BarChart3,
  PlusCircle,
  Shield,
  LogOut,
  ExternalLink,
  Tag,
  Share2,
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
        name: "My Brand",
        ownerName: session.name,
        _count: { campaigns: 0, users: 1 },
      };
      campaigns = [];
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Brand Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-600/20">
              E
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                {brand?.name || "Brand Console"}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{session.name}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <Shield className="w-3 h-3" />
                  Owner
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/brand/analytics"
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-3 py-2 rounded-xl transition-all"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Performance Funnel</span>
            </Link>

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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metric Cards Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Campaigns</span>
              <BarChart3 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{campaigns.length}</div>
            <Link
              href="/brand/analytics"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 mt-3"
            >
              View Full Analytics Funnel →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Staff Members</span>
              <Users className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{brand?._count?.users || 1}</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">In-Store Attribution</span>
              <Store className="w-4 h-4 text-amber-600" />
            </div>
            <Link
              href="/brand/sales"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 mt-2"
            >
              Open In-Store Sales Logger →
            </Link>
          </div>
        </div>

        {/* Campaign List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Campaign Management</h2>
              <p className="text-xs text-slate-500">Oversee your Ethiopian influencer promotions and attribution links</p>
            </div>
            <Link
              href="/brand/campaigns/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Campaign</span>
            </Link>
          </div>

          {campaigns.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-slate-100 rounded-xl text-center">
              <Store className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No active campaigns yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                Ready to collaborate with Telegram or TikTok creators? Launch your first campaign to generate attribution links.
              </p>
              <Link
                href="/brand/campaigns/new"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Launch your first campaign →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {campaigns.map((camp) => (
                <div key={camp.id} className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{camp.name}</h3>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Tag className="w-3 h-3 text-emerald-600" />
                        {camp.promoCode}
                      </span>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {camp.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Slug: /{camp.slug}</span>
                      <span>•</span>
                      <span>{camp._count?.events || 0} customer events</span>
                      <span>•</span>
                      <span>{camp._count?.sales || 0} sales</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/c/${camp.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Landing</span>
                    </Link>
                    <Link
                      href={`/brand/campaigns/new?reinvite=${camp.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Invite Creator</span>
                    </Link>
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

export default function BrandDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BrandView />
    </Suspense>
  );
}
