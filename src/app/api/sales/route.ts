import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseAmountETB } from "@/lib/sales";
import { handleApiError } from "@/lib/api-errors";
import { Prisma } from "@prisma/client";
import { evaluateCampaignLifecycle } from "@/lib/lifecycle";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sales = await db.sale.findMany({
      where: {
        campaign: {
          brandId: session.brandId,
        },
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            promoCode: true,
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
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      status: "ok",
      sales: sales.map((s) => ({
        id: s.id,
        amountETB: s.amountETB.toNumber(),
        notes: s.notes,
        createdAt: s.createdAt.toISOString(),
        campaign: s.campaign,
        loggedBy: s.loggedBy,
      })),
    });
  } catch (error) {
    return handleApiError(error, "Failed to query sales");
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Both OWNER and STAFF can log in-store sales
  if (session.role !== "OWNER" && session.role !== "STAFF" && session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Only Brand Owners and Staff can log sales" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { amountETB, campaignId, promoCode, notes, override } = body;

    const parsedAmount = parseAmountETB(amountETB);
    if (parsedAmount === null) {
      return NextResponse.json(
        { error: "Valid positive amount in ETB is required (e.g. 1500.00)" },
        { status: 400 }
      );
    }

    if (!campaignId && !promoCode) {
      return NextResponse.json(
        { error: "Either campaignId or promoCode is required to attribute the sale" },
        { status: 400 }
      );
    }

    // Resolve active campaign belonging to this brand
    let campaign = null;
    if (typeof campaignId === "string" && campaignId.trim()) {
      campaign = await db.campaign.findFirst({
        where: {
          id: campaignId.trim(),
          brandId: session.brandId,
        },
        select: {
          id: true,
          name: true,
          promoCode: true,
          status: true,
          startDate: true,
          endDate: true,
        },
      });
    } else if (typeof promoCode === "string" && promoCode.trim()) {
      const normalizedPromo = promoCode.trim().toUpperCase();
      campaign = await db.campaign.findFirst({
        where: {
          brandId: session.brandId,
          promoCode: {
            equals: normalizedPromo,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
          promoCode: true,
          status: true,
          startDate: true,
          endDate: true,
        },
      });
    }

    if (!campaign) {
      return NextResponse.json(
        { error: "No active campaign found matching this ID or promo code" },
        { status: 404 }
      );
    }

    const lifecycle = evaluateCampaignLifecycle(campaign);
    if (!lifecycle.active) {
      const isOwnerOrAdmin = session.role === "OWNER" || session.role === "ADMIN";
      if (!override || !isOwnerOrAdmin) {
      return NextResponse.json(
        {
          error: `Cannot attribute sales to a ${lifecycle.effectiveStatus.toLowerCase()} campaign without merchant override`,
          effectiveStatus: lifecycle.effectiveStatus,
        },
        { status: 400 }
      );
    }

    }

    const trimmedNotes = typeof notes === "string" && notes.trim() ? notes.trim() : null;
    const effectiveNotes = !lifecycle.active
      ? (trimmedNotes ? `[OVERRIDE: ${lifecycle.effectiveStatus}] ${trimmedNotes}` : `[OVERRIDE: ${lifecycle.effectiveStatus}]`)
      : trimmedNotes;

    const sale = await db.sale.create({
      data: {
        campaignId: campaign.id,
        loggedById: session.userId,
        amountETB: new Prisma.Decimal(parsedAmount),
        notes: effectiveNotes,
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            promoCode: true,
          },
        },
        loggedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        sale: {
          id: sale.id,
          amountETB: sale.amountETB.toNumber(),
          notes: sale.notes,
          createdAt: sale.createdAt.toISOString(),
          campaign: sale.campaign,
          loggedBy: sale.loggedBy,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to record sale");
  }
}
