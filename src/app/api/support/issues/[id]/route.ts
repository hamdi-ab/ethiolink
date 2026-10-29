import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-errors";
import { VALID_STATUSES, VALID_PRIORITIES } from "@/lib/issues";
import { IssueStatus, IssuePriority } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Issue ID is required" }, { status: 400 });
  }

  try {
    const issue = await db.operationalIssue.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            role: true,
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
            slug: true,
            promoCode: true,
            brandId: true,
          },
        },
        sale: {
          select: {
            id: true,
            amountETB: true,
            createdAt: true,
            isVoided: true,
          },
        },
      },
    });

    if (!issue) {
      return NextResponse.json({ error: "Operational issue not found" }, { status: 404 });
    }

    // Role-based visibility check (PRD FR-003, FR-004)
    if (session.role === "ADMIN") {
      return NextResponse.json({ issue });
    }

    if (session.role === "OWNER" || session.role === "STAFF") {
      const isOwner = issue.userId === session.userId;
      const isBrandCampaign = issue.campaign && issue.campaign.brandId === session.brandId;
      if (!isOwner && !isBrandCampaign) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.json({ issue });
    }

    if (session.role === "CREATOR") {
      if (issue.userId !== session.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.json({ issue });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    return handleApiError(error, "GET /api/support/issues/[id]");
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // PRD FR-040 & FR-042: Administrative triage is strictly restricted to ADMIN
  if (session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Administrative privilege required to update operational issues" },
      { status: 403 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Issue ID is required" }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { status, priority, adminNotes } = body;
    const updateData: Record<string, unknown> = {};

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status as IssueStatus)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.status = status as IssueStatus;
      if (status === "RESOLVED") {
        updateData.resolvedAt = new Date();
      } else {
        updateData.resolvedAt = null;
      }
    }

    if (priority !== undefined) {
      if (!VALID_PRIORITIES.includes(priority as IssuePriority)) {
        return NextResponse.json(
          { error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.priority = priority as IssuePriority;
    }

    if (adminNotes !== undefined) {
      if (typeof adminNotes !== "string") {
        return NextResponse.json({ error: "adminNotes must be a string" }, { status: 400 });
      }
      updateData.adminNotes = adminNotes.trim();
    }

    const existing = await db.operationalIssue.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Operational issue not found" }, { status: 404 });
    }

    const updatedIssue = await db.operationalIssue.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            role: true,
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
            slug: true,
            promoCode: true,
          },
        },
        sale: {
          select: {
            id: true,
            amountETB: true,
            createdAt: true,
            isVoided: true,
          },
        },
      },
    });

    return NextResponse.json({ issue: updatedIssue });
  } catch (error) {
    return handleApiError(error, "PATCH /api/support/issues/[id]");
  }
}
