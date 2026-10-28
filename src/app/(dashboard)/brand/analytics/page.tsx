import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateFunnelMetrics, CampaignAnalyticsResponse } from "@/lib/analytics";
import { AuditLogEntry } from "@/lib/reports";
import { AnalyticsView } from "./AnalyticsView";

async function AnalyticsServerContent() {
  try { await connection(); } catch {}
  const session = await getSession();

  if (!session || !session.brandId) {
    redirect("/login");
  }

  // Staff members are prohibited from financial and campaign analytics
  if (session.role === "STAFF") {
    redirect("/brand/sales");
  }

  let brandName = "Brand Console";
  let campaigns: CampaignAnalyticsResponse[] = [];
  let summary = calculateFunnelMetrics([], []);
  let auditEntries: AuditLogEntry[] = [];

  try {
    const brand = await db.brand.findUnique({
      where: { id: session.brandId },
      select: { name: true },
    });
    if (brand) brandName = brand.name;

    const dbCampaigns = await db.campaign.findMany({
      where: { brandId: session.brandId },
      include: {
        events: {
          select: {
            eventType: true,
            visitorId: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        sales: {
          select: {
            id: true,
            amountETB: true,
            isVoided: true,
            voidReason: true,
            voidedAt: true,
            notes: true,
            createdAt: true,
            loggedBy: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
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
      },
      orderBy: { createdAt: "desc" },
    });

    const allEvents = dbCampaigns.flatMap((c) => c.events);
    const allSales = dbCampaigns.flatMap((c) => c.sales);

    summary = calculateFunnelMetrics(allEvents, allSales);

    campaigns = dbCampaigns.map((camp) => {
      const metrics = calculateFunnelMetrics(camp.events, camp.sales);
      return {
        ...metrics,
        campaignId: camp.id,
        campaignName: camp.name,
        slug: camp.slug,
        promoCode: camp.promoCode,
        status: camp.status,
        startDate: camp.startDate ? camp.startDate.toISOString() : null,
        endDate: camp.endDate ? camp.endDate.toISOString() : null,
        creators: camp.creators.map((a) => ({
          name: a.creator.user.name,
          telegramUsername: a.creator.telegramUsername,
        })),
      };
    });

    auditEntries = [
      ...dbCampaigns.flatMap((camp) =>
        camp.events.map((e) => ({
          timestamp: e.createdAt.toISOString(),
          recordType: "EVENT" as const,
          campaignName: camp.name,
          promoCode: camp.promoCode,
          channelOrAction: e.eventType,
          visitorOrReceiptId: e.visitorId,
          amountETB: null,
          staffName: null,
          notes: null,
        }))
      ),
      ...dbCampaigns.flatMap((camp) =>
        camp.sales.map((s) => ({
          timestamp: s.createdAt.toISOString(),
          recordType: "SALE" as const,
          campaignName: camp.name,
          promoCode: camp.promoCode,
          channelOrAction: "IN_STORE_REDEMPTION",
          visitorOrReceiptId: s.id,
          amountETB:
            typeof s.amountETB === "object" && s.amountETB !== null && "toNumber" in s.amountETB
              ? s.amountETB.toNumber()
              : Number(s.amountETB),
          staffName: s.loggedBy?.name || "Cashier",
          notes: s.notes || null,
          isVoided: s.isVoided,
          voidReason: s.voidReason,
        }))
      ),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error("Failed to load analytics page data:", error);
  }

  return (
    <AnalyticsView
      brandName={brandName}
      summary={summary}
      campaigns={campaigns}
      auditEntries={auditEntries}
    />
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AnalyticsServerContent />
    </Suspense>
  );
}
