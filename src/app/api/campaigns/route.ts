import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify, createCreatorInviteToken } from "@/lib/invites";
import { handleApiError } from "@/lib/api-errors";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const campaigns = await db.campaign.findMany({
      where: { brandId: session.brandId },
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ status: "ok", campaigns });
  } catch (error) {
    return handleApiError(error, "Failed to list campaigns");
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "OWNER" && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Only Brand Owners can create campaigns" }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      name,
      promoCode,
      slug: customSlug,
      description,
      telegramUrl,
      phoneNumber,
      mapUrl,
      startDate,
      endDate,
      creatorName,
    } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });
    }

    if (!promoCode || typeof promoCode !== "string" || promoCode.trim().length === 0) {
      return NextResponse.json({ error: "Promo code is required" }, { status: 400 });
    }

    const normalizedPromo = promoCode.trim().toUpperCase();

    // Determine unique slug
    let targetSlug = customSlug ? slugify(customSlug) : slugify(name);
    const existingWithSlug = await db.campaign.findUnique({
      where: { slug: targetSlug },
      select: { id: true },
    });

    if (existingWithSlug) {
      targetSlug = `${targetSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const campaign = await db.campaign.create({
      data: {
        brandId: session.brandId,
        name: name.trim(),
        slug: targetSlug,
        promoCode: normalizedPromo,
        description: typeof description === "string" ? description.trim() : null,
        telegramUrl: typeof telegramUrl === "string" ? telegramUrl.trim() : null,
        phoneNumber: typeof phoneNumber === "string" ? phoneNumber.trim() : null,
        mapUrl: typeof mapUrl === "string" ? mapUrl.trim() : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: body.status === "DRAFT" || body.status === "PAUSED" ? body.status : "ACTIVE",
      },
      include: {
        brand: {
          select: {
            name: true,
          },
        },
      },
    });

    // Generate creator magic invite token
    const inviteToken = createCreatorInviteToken(
      campaign.id,
      session.brandId,
      typeof creatorName === "string" ? creatorName : undefined
    );

    return NextResponse.json(
      {
        status: "ok",
        campaign,
        creatorInvite: {
          token: inviteToken,
          url: `/join?token=${inviteToken}`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to create campaign");
  }
}
