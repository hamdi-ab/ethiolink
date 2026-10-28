import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CampaignStatus } from "@prisma/client";
import { handleApiError } from "@/lib/api-errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES: CampaignStatus[] = ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "EXPIRED"];

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
      select: {
        id: true,
        promoCode: true,
        slug: true,
        startDate: true,
        endDate: true,
      },
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
      promoCode,
      slug,
    } = body;

    // PRD FR-009: promoCode and slug are permanent to protect tracking links and attribution history
    if (
      (promoCode !== undefined && promoCode !== existing.promoCode) ||
      (slug !== undefined && slug !== existing.slug)
    ) {
      return NextResponse.json(
        { error: "Promotion code and campaign URL slug are permanent and cannot be modified after creation" },
        { status: 400 }
      );
    }

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 3) {
        return NextResponse.json(
          { error: "Campaign name must be at least 3 characters" },
          { status: 400 }
        );
      }
    }

    let parsedStartDate: Date | null | undefined = undefined;
    if (startDate !== undefined) {
      if (startDate === null || startDate === "") {
        parsedStartDate = null;
      } else {
        const d = new Date(startDate);
        if (isNaN(d.getTime())) {
          return NextResponse.json({ error: "Invalid start date format" }, { status: 400 });
        }
        parsedStartDate = d;
      }
    }

    let parsedEndDate: Date | null | undefined = undefined;
    if (endDate !== undefined) {
      if (endDate === null || endDate === "") {
        parsedEndDate = null;
      } else {
        const d = new Date(endDate);
        if (isNaN(d.getTime())) {
          return NextResponse.json({ error: "Invalid end date format" }, { status: 400 });
        }
        parsedEndDate = d;
      }
    }

    const effectiveStart = parsedStartDate !== undefined ? parsedStartDate : existing.startDate;
    const effectiveEnd = parsedEndDate !== undefined ? parsedEndDate : existing.endDate;

    if (effectiveStart && effectiveEnd && effectiveEnd < effectiveStart) {
      return NextResponse.json(
        { error: "End date cannot be earlier than start date" },
        { status: 400 }
      );
    }

    const validatedStatus =
      typeof status === "string" && VALID_STATUSES.includes(status as CampaignStatus)
        ? (status as CampaignStatus)
        : undefined;

    const updated = await db.campaign.update({
      where: { id },
      data: {
        ...(typeof name === "string" && { name: name.trim() }),
        ...(description !== undefined && { description: typeof description === "string" && description.trim() ? description.trim() : null }),
        ...(validatedStatus && { status: validatedStatus }),
        ...(telegramUrl !== undefined && { telegramUrl: typeof telegramUrl === "string" && telegramUrl.trim() ? telegramUrl.trim() : null }),
        ...(phoneNumber !== undefined && { phoneNumber: typeof phoneNumber === "string" && phoneNumber.trim() ? phoneNumber.trim() : null }),
        ...(mapUrl !== undefined && { mapUrl: typeof mapUrl === "string" && mapUrl.trim() ? mapUrl.trim() : null }),
        ...(parsedStartDate !== undefined && { startDate: parsedStartDate }),
        ...(parsedEndDate !== undefined && { endDate: parsedEndDate }),
      },
    });

    return NextResponse.json({ status: "ok", campaign: updated });
  } catch (error) {
    return handleApiError(error, "Failed to update campaign");
  }
}
