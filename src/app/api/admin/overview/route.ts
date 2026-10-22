import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getSystemHealthDiagnostics,
  calculatePlatformTotals,
  type PlatformOverviewStats,
  type SystemHealthMetrics,
} from "@/lib/admin";

export interface AdminOverviewResponse {
  status: "ok";
  admin: {
    userId: string;
    name: string;
    role: string;
  };
  platform: PlatformOverviewStats;
  health: SystemHealthMetrics;
}

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
    const [brandCount, userCount, creatorCount, campaigns, eventCount, sales, health] =
      await Promise.all([
        db.brand.count(),
        db.user.count(),
        db.creator.count(),
        db.campaign.findMany({ select: { status: true } }),
        db.event.count(),
        db.sale.findMany({ select: { amountETB: true } }),
        getSystemHealthDiagnostics(),
      ]);

    const totals = calculatePlatformTotals(
      brandCount,
      userCount,
      creatorCount,
      campaigns,
      eventCount,
      sales
    );

    const responseData: AdminOverviewResponse = {
      status: "ok",
      admin: {
        userId: session.userId,
        name: session.name,
        role: session.role,
      },
      platform: totals,
      health,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Failed to generate admin overview:", error);
    return NextResponse.json(
      { error: "Internal server error fetching admin overview" },
      { status: 500 }
    );
  }
}
