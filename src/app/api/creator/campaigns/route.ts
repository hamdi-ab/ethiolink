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
