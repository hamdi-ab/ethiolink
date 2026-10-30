import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateFunnelMetrics } from "@/lib/analytics";
import { getBaseUrl } from "@/lib/config";
import { CreatorView } from "./CreatorView";
import type {
  CreatorPortalResponse,
  CreatorCampaignItem,
  CreatorActivityItem,
} from "@/app/api/creator/campaigns/route";

async function CreatorServerContent() {
  try {
    await connection();
  } catch {}
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Staff members belong in the sales logging interface
  if (session.role === "STAFF") {
    redirect("/brand/sales");
  }

  // Brand owners belong in the brand management console
  if (session.role === "OWNER") {
    redirect("/brand");
  }

  let creator = await db.creator.findUnique({
    where: { userId: session.userId },
    include: {
      assignments: {
        include: {
          campaign: {
            include: {
              brand: {
                select: {
                  id: true,
                  name: true,
                },
              },
              events: {
                select: {
                  eventType: true,
                  visitorId: true,
                },
              },
              sales: {
                select: {
                  amountETB: true,
                  isVoided: true,
                },
              },
            },
          },
        },
        orderBy: { assignedAt: "desc" },
      },
    },
  });

  // Edge case self-healing: if a user with CREATOR role has no creator row yet
  if (!creator) {
    creator = await db.creator.create({
      data: {
        userId: session.userId,
      },
      include: {
        assignments: {
          include: {
            campaign: {
              include: {
                brand: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                events: {
                  select: {
                    eventType: true,
                    visitorId: true,
                  },
                },
                sales: {
                  select: {
                    amountETB: true,
                    isVoided: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  const campaigns = creator.assignments.map((a) => a.campaign);
  const allEvents = campaigns.flatMap((c) => c.events);
  const allSales = campaigns.flatMap((c) => c.sales);

  const overallFunnel = calculateFunnelMetrics(allEvents, allSales);

  const campaignItems: CreatorCampaignItem[] = creator.assignments.map((assignment) => {
    const camp = assignment.campaign;
    const metrics = calculateFunnelMetrics(camp.events, camp.sales);

    return {
      campaignId: camp.id,
      campaignName: camp.name,
      slug: camp.slug,
      promoCode: camp.promoCode,
      description: camp.description,
      status: camp.status,
      brandName: camp.brand.name,
      brandId: camp.brand.id,
      assignedAt: assignment.assignedAt.toISOString(),
      metrics,
    };
  });

  // Query recent audience activity across assigned campaigns (PRD FR-035)
  const campaignIds = creator.assignments.map((a) => a.campaignId);
  let recentActivity: CreatorActivityItem[] = [];

  if (campaignIds.length > 0) {
    const [recentEvents, recentSales] = await Promise.all([
      db.event.findMany({
        where: {
          campaignId: { in: campaignIds },
          eventType: { not: "PAGE_VIEW" },
        },
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          campaign: {
            select: {
              name: true,
              slug: true,
              promoCode: true,
            },
          },
        },
      }),
      db.sale.findMany({
        where: {
          campaignId: { in: campaignIds },
          isVoided: false,
        },
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          campaign: {
            select: {
              name: true,
              slug: true,
              promoCode: true,
            },
          },
        },
      }),
    ]);

    const eventItems: CreatorActivityItem[] = recentEvents.map((e) => ({
      id: e.id,
      type: "EVENT",
      eventType: e.eventType,
      campaignName: e.campaign.name,
      campaignSlug: e.campaign.slug,
      promoCode: e.campaign.promoCode,
      timestamp: e.createdAt.toISOString(),
    }));

    const saleItems: CreatorActivityItem[] = recentSales.map((s) => ({
      id: s.id,
      type: "SALE",
      campaignName: s.campaign.name,
      campaignSlug: s.campaign.slug,
      promoCode: s.campaign.promoCode,
      timestamp: s.createdAt.toISOString(),
      amountETB:
        typeof s.amountETB === "object" && s.amountETB !== null && "toNumber" in s.amountETB
          ? (s.amountETB as { toNumber(): number }).toNumber()
          : Number(s.amountETB),
    }));

    recentActivity = [...eventItems, ...saleItems]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);
  }

  const portalData: CreatorPortalResponse = {
    status: "ok",
    creator: {
      id: creator.id,
      name: session.name,
      phone: session.phone,
      telegramUsername: creator.telegramUsername,
    },
    summary: {
      ...overallFunnel,
      totalCampaigns: creator.assignments.length,
    },
    campaigns: campaignItems,
    recentActivity,
  };

  const headerList = await headers();
  const origin = getBaseUrl(headerList);

  return <CreatorView initialData={portalData} origin={origin} />;
}

export default function CreatorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-xs text-slate-500 font-medium">Loading Creator Portal...</p>
        </div>
      }
    >
      <CreatorServerContent />
    </Suspense>
  );
}
