import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  calculateFunnelMetrics,
  type FunnelMetrics,
  type CampaignAnalyticsResponse,
} from "@/lib/analytics";

export type { CampaignAnalyticsResponse, FunnelMetrics };

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Financial and funnel analytics are strictly restricted to Brand Owners and Admins
  if (session.role !== "OWNER" && session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Access denied. Brand analytics is restricted to business owners." },
      { status: 403 }
    );
  }

  try {
    const campaigns = await db.campaign.findMany({
      where: { brandId: session.brandId },
      include: {
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

    // Aggregate all brand events and sales across all campaigns
    const allEvents = campaigns.flatMap((c) => c.events);
    const allSales = campaigns.flatMap((c) => c.sales);

    const brandSummary = calculateFunnelMetrics(allEvents, allSales);

    // Compute individual campaign funnel items
    const campaignAnalytics: CampaignAnalyticsResponse[] = campaigns.map((camp) => {
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

    return NextResponse.json({
      status: "ok",
      summary: brandSummary,
      campaigns: campaignAnalytics,
    });
  } catch (error) {
    console.error("Failed to generate analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
