import { NextRequest, NextResponse } from "next/server";
import { verifyCreatorInviteToken } from "@/lib/invites";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { valid: false, error: "Invitation token is required" },
      { status: 400 }
    );
  }

  const payload = verifyCreatorInviteToken(token);
  if (!payload) {
    return NextResponse.json(
      { valid: false, error: "This invitation link is invalid or has expired" },
      { status: 400 }
    );
  }

  try {
    const campaign = await db.campaign.findUnique({
      where: { id: payload.campaignId },
      select: {
        id: true,
        name: true,
        slug: true,
        promoCode: true,
        status: true,
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { valid: false, error: "Associated campaign was not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        slug: campaign.slug,
        promoCode: campaign.promoCode,
        status: campaign.status,
        brandName: campaign.brand.name,
        brandId: campaign.brand.id,
      },
      creatorName: payload.creatorName ?? null,
    });
  } catch (error) {
    console.error("Failed to verify invite token:", error);
    return NextResponse.json(
      { valid: false, error: "Internal server error resolving invitation" },
      { status: 500 }
    );
  }
}
