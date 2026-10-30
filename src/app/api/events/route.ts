import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  hashIpWithDailySalt,
  isValidEventType,
  DEDUPLICATION_WINDOW_MS,
} from "@/lib/telemetry";
import { evaluateCampaignLifecycle } from "@/lib/lifecycle";

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown> | null = null;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json") || contentType.includes("text/plain")) {
      const rawText = await req.text();
      try {
        body = JSON.parse(rawText) as Record<string, unknown>;
      } catch {
        return Response.json({ error: "Invalid JSON body" }, { status: 400 });
      }
    } else {
      body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    }

    if (!body || typeof body !== "object") {
      return Response.json({ error: "Missing request body" }, { status: 400 });
    }

    const { campaignSlug, campaignId, eventType, visitorId } = body;

    if (!eventType || !isValidEventType(eventType)) {
      return Response.json(
        {
          error:
            "Invalid or missing eventType. Supported types: PAGE_VIEW, TELEGRAM_CLICK, CALL_CLICK, MAP_CLICK, COPY_CODE",
        },
        { status: 400 }
      );
    }

    if (!visitorId || typeof visitorId !== "string" || visitorId.trim().length === 0) {
      return Response.json(
        { error: "Invalid or missing visitorId" },
        { status: 400 }
      );
    }

    // Resolve campaign by slug or id
    let targetCampaign = null;
    if (typeof campaignSlug === "string" && campaignSlug) {
      targetCampaign = await db.campaign.findUnique({
        where: { slug: campaignSlug },
        select: { id: true, status: true, startDate: true, endDate: true },
      });
    } else if (typeof campaignId === "string" && campaignId) {
      targetCampaign = await db.campaign.findUnique({
        where: { id: campaignId },
        select: { id: true, status: true, startDate: true, endDate: true },
      });
    }

    if (!targetCampaign) {
      return Response.json({ error: "Campaign not found" }, { status: 404 });
    }

    const lifecycle = evaluateCampaignLifecycle(targetCampaign);
    if (!lifecycle.active) {
      return Response.json(
        {
          status: "rejected",
          recorded: false,
          reason: `Campaign is ${lifecycle.effectiveStatus.toLowerCase()}`,
          effectiveStatus: lifecycle.effectiveStatus,
        },
        { status: 410 }
      );
    }

    // Extract IP and generate daily-salted SHA-256 hash
    const forwarded = req.headers.get("x-forwarded-for");
    const rawIp =
      (forwarded ? forwarded.split(",")[0].trim() : null) ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const ipHash = hashIpWithDailySalt(rawIp);

    // 15-minute sliding window deduplication check
    const slidingCutoff = new Date(Date.now() - DEDUPLICATION_WINDOW_MS);
    const existingRecentEvent = await db.event.findFirst({
      where: {
        campaignId: targetCampaign.id,
        eventType,
        visitorId,
        createdAt: {
          gte: slidingCutoff,
        },
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    if (existingRecentEvent) {
      return Response.json(
        {
          status: "deduplicated",
          recorded: false,
          reason: "Duplicate event detected within 15-minute sliding window",
          eventType,
        },
        { status: 200 }
      );
    }

    // Record verified event in database
    const event = await db.event.create({
      data: {
        campaignId: targetCampaign.id,
        eventType,
        visitorId,
        ipHash,
      },
      select: {
        id: true,
        eventType: true,
        createdAt: true,
      },
    });

    return Response.json(
      {
        status: "ok",
        recorded: true,
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.error("Telemetry ingestion failed:", error);
    }
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
