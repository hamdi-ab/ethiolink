import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCreatorInviteToken } from "@/lib/invites";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await getSession(req);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "OWNER" && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Only Brand Owners can generate invite links" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const creatorName = typeof body?.creatorName === "string" ? body.creatorName : undefined;

    // Verify campaign belongs to brand
    const campaign = await db.campaign.findFirst({
      where: {
        id,
        brandId: session.brandId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const token = createCreatorInviteToken(campaign.id, session.brandId, creatorName);

    return NextResponse.json(
      {
        status: "ok",
        inviteToken: token,
        inviteUrl: `/join?token=${token}`,
        campaignId: campaign.id,
        campaignName: campaign.name,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to generate creator invite:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
