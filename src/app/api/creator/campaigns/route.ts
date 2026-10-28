import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateFunnelMetrics, FunnelMetrics } from "@/lib/analytics";

export interface CreatorCampaignItem {
  campaignId: string;
  campaignName: string;
  slug: string;
  promoCode: string;
  description: string | null;
  status: string;
  brandName: string;
  brandId: string;
  assignedAt: string;
  metrics: FunnelMetrics;
}

export interface CreatorActivityItem {
  id: string;
  type: "EVENT" | "SALE";
  eventType?: string;
  campaignName: string;
  campaignSlug: string;
  promoCode: string;
  timestamp: string;
  amountETB?: number | null;
}

export interface CreatorPortalResponse {
  status: "ok";
  creator: {
    id: string;
    name: string;
    phone: string;
    telegramUsername: string | null;
  };
  summary: FunnelMetrics & {
    totalCampaigns: number;
  };
  campaigns: CreatorCampaignItem[];
  recentActivity: CreatorActivityItem[];
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Creator endpoints are strictly restricted to CREATOR and ADMIN roles
  if (session.role !== "CREATOR" && session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Access denied. Restricted to creator accounts." },
      { status: 403 }
    );
  }

  try {
    const creator = await db.creator.findUnique({
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

    if (!creator) {
      return NextResponse.json(
        { error: "Creator profile not found for current user" },
        { status: 404 }
      );
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

    const responseData: CreatorPortalResponse = {
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

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Failed to load creator campaigns:", error);
    return NextResponse.json(
      { error: "Internal server error fetching creator portal data" },
      { status: 500 }
    );
  }
}
