import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSystemHealthDiagnostics, calculatePlatformTotals } from "@/lib/admin";
import { AdminDashboardView } from "./AdminDashboardView";

async function AdminServerContent() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Non-admins must be routed to their respective role dashboards
  if (session.role !== "ADMIN") {
    if (session.role === "STAFF") {
      redirect("/brand/sales");
    } else if (session.role === "CREATOR") {
      redirect("/creator");
    } else {
      redirect("/brand");
    }
  }

  // Batch 1: Platform Overview & System Health Stats (7 items <= 10 tuple overload)
  const [
    brandCount,
    userCount,
    creatorCount,
    campaigns,
    eventCount,
    sales,
    health,
  ] = await Promise.all([
    db.brand.count(),
    db.user.count(),
    db.creator.count(),
    db.campaign.findMany({ select: { status: true } }),
    db.event.count(),
    db.sale.findMany({ select: { amountETB: true } }),
    getSystemHealthDiagnostics(),
  ]);

  // Batch 2: Audit Records & Event Streams (5 items <= 10 tuple overload)
  const [
    recentSales,
    recentCampaigns,
    recentBrands,
    recentCreators,
    recentEvents,
  ] = await Promise.all([
    db.sale.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            slug: true,
            promoCode: true,
            brand: { select: { id: true, name: true } },
          },
        },
        loggedBy: { select: { id: true, name: true, role: true } },
      },
    }),
    db.campaign.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        brand: { select: { id: true, name: true } },
        creators: {
          include: {
            creator: {
              include: { user: { select: { name: true } } },
            },
          },
        },
        _count: { select: { events: true, sales: true } },
      },
    }),
    db.brand.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        users: { select: { id: true, name: true, phone: true, role: true } },
        _count: { select: { campaigns: true } },
      },
    }),
    db.creator.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        assignments: {
          include: {
            campaign: { select: { id: true, name: true } },
          },
        },
      },
    }),
    db.event.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        campaign: {
          select: {
            name: true,
            slug: true,
            brand: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  const totals = calculatePlatformTotals(
    brandCount,
    userCount,
    creatorCount,
    campaigns,
    eventCount,
    sales
  );

  const formattedSales = recentSales.map((s) => ({
    id: s.id,
    amountETB:
      typeof s.amountETB === "object" && s.amountETB !== null && "toNumber" in s.amountETB
        ? s.amountETB.toNumber()
        : Number(s.amountETB),
    campaignName: s.campaign.name,
    campaignSlug: s.campaign.slug,
    promoCode: s.campaign.promoCode,
    brandName: s.campaign.brand.name,
    loggedByName: s.loggedBy?.name || "System POS",
    loggedByRole: s.loggedBy?.role || "STAFF",
    notes: s.notes,
    recordedAt: s.createdAt.toISOString(),
  }));

  const formattedCampaigns = recentCampaigns.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    promoCode: c.promoCode,
    status: c.status,
    brandName: c.brand.name,
    creators: c.creators.map((a) => a.creator.user.name),
    eventsCount: c._count.events,
    salesCount: c._count.sales,
    createdAt: c.createdAt.toISOString(),
  }));

  const formattedBrands = recentBrands.map((b) => ({
    id: b.id,
    name: b.name,
    ownerName: b.ownerName,
    phone: b.phone,
    campaignsCount: b._count.campaigns,
    staffCount: b.users.length,
    createdAt: b.createdAt.toISOString(),
  }));

  const formattedCreators = recentCreators.map((c) => ({
    id: c.id,
    name: c.user.name,
    phone: c.user.phone,
    telegramUsername: c.telegramUsername,
    assignedCampaigns: c.assignments.map((a) => a.campaign.name),
    createdAt: c.createdAt.toISOString(),
  }));

  const formattedEvents = recentEvents.map((e) => ({
    id: e.id,
    eventType: e.eventType,
    visitorId: e.visitorId,
    campaignName: e.campaign.name,
    campaignSlug: e.campaign.slug,
    brandName: e.campaign.brand.name,
    timestamp: e.createdAt.toISOString(),
  }));

  return (
    <AdminDashboardView
      adminName={session.name}
      stats={totals}
      health={health}
      audit={{
        sales: formattedSales,
        campaigns: formattedCampaigns,
        brands: formattedBrands,
        creators: formattedCreators,
        events: formattedEvents,
      }}
    />
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-black text-xl mb-4 animate-bounce">
            E
          </div>
          <div className="text-sm font-bold text-slate-700">Loading Admin Console...</div>
          <div className="text-xs text-slate-400 mt-1">
            Running system telemetry and database audit
          </div>
        </div>
      }
    >
      <AdminServerContent />
    </Suspense>
  );
}
