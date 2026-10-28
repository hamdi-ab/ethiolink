import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only Brand Owners (OWNER) and Admins (ADMIN) can void/correct sales
  // Staff (STAFF) and Creators (CREATOR) are strictly prohibited
  if (session.role !== "OWNER" && session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Only Brand Owners and Admins can void sales transactions" },
      { status: 403 }
    );
  }

  const { id } = await params;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Valid sale ID is required" }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { reason } = body;
    if (typeof reason !== "string" || reason.trim().length < 3) {
      return NextResponse.json(
        { error: "A valid void reason of at least 3 characters is required" },
        { status: 400 }
      );
    }

    // Query sale: must belong to the user's brand if not ADMIN
    const sale = await db.sale.findUnique({
      where: { id },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            promoCode: true,
            brandId: true,
          },
        },
      },
    });

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    if (session.role !== "ADMIN" && sale.campaign.brandId !== session.brandId) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    if (sale.isVoided) {
      return NextResponse.json(
        { error: "Sale is already voided" },
        { status: 400 }
      );
    }

    const updatedSale = await db.sale.update({
      where: { id },
      data: {
        isVoided: true,
        voidReason: reason.trim(),
        voidedAt: new Date(),
        voidedById: session.userId,
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
        voidedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      status: "ok",
      sale: {
        id: updatedSale.id,
        amountETB: updatedSale.amountETB.toNumber(),
        notes: updatedSale.notes,
        isVoided: updatedSale.isVoided,
        voidReason: updatedSale.voidReason,
        voidedAt: updatedSale.voidedAt ? updatedSale.voidedAt.toISOString() : null,
        campaign: updatedSale.campaign,
        loggedBy: updatedSale.loggedBy,
        voidedBy: updatedSale.voidedBy,
        createdAt: updatedSale.createdAt.toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error, "Failed to void sale transaction");
  }
}
