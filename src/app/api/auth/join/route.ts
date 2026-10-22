import { NextRequest, NextResponse } from "next/server";
import { verifyCreatorInviteToken } from "@/lib/invites";
import { db } from "@/lib/db";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const { token, name, phone, telegramUsername } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invitation token is required" },
        { status: 400 }
      );
    }

    const payload = verifyCreatorInviteToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "This invitation link is invalid or has expired" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const normalizedPhone = phone.trim();
    const normalizedName = name.trim();
    const cleanTelegram =
      typeof telegramUsername === "string" && telegramUsername.trim()
        ? telegramUsername.trim().replace(/^@/, "")
        : null;

    // Verify target campaign exists
    const campaign = await db.campaign.findUnique({
      where: { id: payload.campaignId },
      select: { id: true, brandId: true },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "The campaign associated with this invitation does not exist" },
        { status: 404 }
      );
    }

    // Upsert or retrieve User
    let user = await db.user.findUnique({
      where: { phone: normalizedPhone },
      include: { creator: true },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          name: normalizedName,
          phone: normalizedPhone,
          role: "CREATOR",
          creator: {
            create: {
              telegramUsername: cleanTelegram,
            },
          },
        },
        include: { creator: true },
      });
    } else {
      // If user exists but does not have a creator profile, create one
      if (!user.creator) {
        await db.creator.create({
          data: {
            userId: user.id,
            telegramUsername: cleanTelegram,
          },
        });
      } else if (cleanTelegram && !user.creator.telegramUsername) {
        await db.creator.update({
          where: { id: user.creator.id },
          data: { telegramUsername: cleanTelegram },
        });
      }
    }

    // Retrieve the creator profile ID
    const creator = await db.creator.findUnique({
      where: { userId: user.id },
    });

    if (!creator) {
      return NextResponse.json(
        { error: "Failed to initialize creator profile" },
        { status: 500 }
      );
    }

    // Link campaign to creator via CampaignAssignment
    await db.campaignAssignment.upsert({
      where: {
        campaignId_creatorId: {
          campaignId: payload.campaignId,
          creatorId: creator.id,
        },
      },
      create: {
        campaignId: payload.campaignId,
        creatorId: creator.id,
      },
      update: {},
    });

    // Create session token with CREATOR role
    const sessionToken = createSessionToken({
      userId: user.id,
      name: user.name,
      phone: user.phone,
      role: "CREATOR",
      brandId: user.brandId ?? null,
    });

    const response = NextResponse.json(
      {
        status: "ok",
        message: "Invitation accepted successfully",
        redirectUrl: "/creator",
        creator: {
          id: creator.id,
          name: user.name,
          phone: user.phone,
          telegramUsername: cleanTelegram ?? creator.telegramUsername,
        },
      },
      { status: 200 }
    );

    setSessionCookie(response, sessionToken);
    return response;
  } catch (error) {
    console.error("Creator join error:", error);
    return NextResponse.json(
      { error: "Internal server error completing onboarding" },
      { status: 500 }
    );
  }
}
