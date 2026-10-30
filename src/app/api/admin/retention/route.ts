import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { handleApiError } from "@/lib/api-errors";
import { getRetentionStats, pruneExpiredEvents } from "@/lib/retention";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Access denied. Platform administrative privileges required." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get("days");
    const retentionDays = daysParam ? parseInt(daysParam, 10) : undefined;

    const stats = await getRetentionStats(retentionDays);
    return NextResponse.json({ stats });
  } catch (error) {
    return handleApiError(error, "GET /api/admin/retention");
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Access denied. Platform administrative privileges required." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const retentionDays = typeof body.retentionDays === "number" ? body.retentionDays : undefined;
    const dryRun = typeof body.dryRun === "boolean" ? body.dryRun : false;

    const result = await pruneExpiredEvents({
      eventRetentionDays: retentionDays,
      dryRun,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return handleApiError(error, "POST /api/admin/retention");
  }
}
