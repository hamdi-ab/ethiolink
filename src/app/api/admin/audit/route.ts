import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Strictly restricted to platform administrators
  if (session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Access denied. Platform administrative privileges required." },
      { status: 403 }
    );
  }

  try {
    const [recentSales, recentCampaigns, recentBrands, recentCreators, recentEvents] =
      await Promise.all([
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
                brand: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            loggedBy: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        }),

        db.campaign.findMany({
          take: 50,
          orderBy: { createdAt: "desc" },
          include: {
            brand: {
              select: {
                id: true,
                name: true,
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
            _count: {
              select: {
                events: true,
                sales: true,
              },
            },
          },
        }),

        db.brand.findMany({
          take: 50,
          orderBy: { createdAt: "desc" },
          include: {
            users: {
              select: {
                id: true,
                name: true,
                phone: true,
                role: true,
              },
            },
            _count: {
              select: {
                campaigns: true,
              },
            },
          },
        }),

        db.creator.findMany({
          take: 50,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
            assignments: {
              include: {
                campaign: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
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
                brand: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        }),
      ]);

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

    return NextResponse.json({
      status: "ok",
      sales: formattedSales,
      campaigns: formattedCampaigns,
      brands: formattedBrands,
      creators: formattedCreators,
      events: formattedEvents,
    });
  } catch (error) {
    console.error("Failed to generate admin audit log:", error);
    return NextResponse.json(
      { error: "Internal server error fetching admin audit records" },
      { status: 500 }
    );
  }
}
