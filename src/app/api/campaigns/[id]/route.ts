import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CampaignStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES: CampaignStatus[] = ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED"];

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await getSession(req);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const campaign = await db.campaign.findFirst({
      where: {
        id,
        brandId: session.brandId,
      },
      include: {
        creators: {
          include: {
            creator: {
              include: {
                user: {
                  select: {
                    name: true,
                    phone: true,
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
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ status: "ok", campaign });
  } catch (error) {
    console.error("Failed to get campaign:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await getSession(req);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "OWNER" && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Only Brand Owners can edit campaigns" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Verify ownership
    const existing = await db.campaign.findFirst({
      where: { id, brandId: session.brandId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const {
      name,
      description,
      status,
      telegramUrl,
      phoneNumber,
      mapUrl,
      startDate,
      endDate,
    } = body;

    const validatedStatus =
      typeof status === "string" && VALID_STATUSES.includes(status as CampaignStatus)
        ? (status as CampaignStatus)
        : undefined;

    const updated = await db.campaign.update({
      where: { id },
      data: {
        ...(typeof name === "string" && { name: name.trim() }),
        ...(typeof description === "string" && { description: description.trim() }),
        ...(validatedStatus && { status: validatedStatus }),
        ...(typeof telegramUrl === "string" && { telegramUrl: telegramUrl.trim() }),
        ...(typeof phoneNumber === "string" && { phoneNumber: phoneNumber.trim() }),
        ...(typeof mapUrl === "string" && { mapUrl: mapUrl.trim() }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
    });

    return NextResponse.json({ status: "ok", campaign: updated });
  } catch (error) {
    console.error("Failed to update campaign:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
