import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-errors";
import { validateIssuePayload, VALID_STATUSES, VALID_PRIORITIES } from "@/lib/issues";
import { IssueStatus, IssuePriority } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const priorityParam = searchParams.get("priority");

  const whereClause: Record<string, unknown> = {};

  if (statusParam && VALID_STATUSES.includes(statusParam as IssueStatus)) {
    whereClause.status = statusParam as IssueStatus;
  }

  if (priorityParam && VALID_PRIORITIES.includes(priorityParam as IssuePriority)) {
    whereClause.priority = priorityParam as IssuePriority;
  }

  try {
    // Role-based data scoping (PRD FR-003, FR-004, FR-040)
    if (session.role === "ADMIN") {
      // Admins inspect platform-wide operational issues
      const issues = await db.operationalIssue.findMany({
        where: whereClause,
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
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      });
      return NextResponse.json({ issues });
    }

    if (session.role === "OWNER" || session.role === "STAFF") {
      // Brands inspect their reported issues or campaign-related issues
      whereClause.OR = [
        { userId: session.userId },
        ...(session.brandId ? [{ campaign: { brandId: session.brandId } }] : []),
      ];

      const issues = await db.operationalIssue.findMany({
        where: whereClause,
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
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ issues });
    }

    if (session.role === "CREATOR") {
      // Creators inspect issues they have reported
      whereClause.userId = session.userId;

      const issues = await db.operationalIssue.findMany({
        where: whereClause,
        include: {
          campaign: {
            select: {
              id: true,
              name: true,
              slug: true,
              promoCode: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ issues });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    return handleApiError(error, "GET /api/support/issues");
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rawBody = await req.json().catch(() => null);
    const validation = validateIssuePayload(rawBody);

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    const { title, description, category, priority, campaignId, saleId } = validation.data;

    // Validate campaign linkage permissions
    if (campaignId) {
      const campaign = await db.campaign.findUnique({
        where: { id: campaignId },
        select: { id: true, brandId: true },
      });

      if (!campaign) {
        return NextResponse.json({ error: "Referenced campaign not found" }, { status: 404 });
      }

      if (session.role === "OWNER" || session.role === "STAFF") {
        if (campaign.brandId !== session.brandId) {
          return NextResponse.json({ error: "Unauthorized campaign reference" }, { status: 403 });
        }
      } else if (session.role === "CREATOR") {
        const creator = await db.creator.findUnique({
          where: { userId: session.userId },
          select: { id: true },
        });

        if (!creator) {
          return NextResponse.json({ error: "Creator profile not found" }, { status: 403 });
        }

        const assignment = await db.campaignAssignment.findUnique({
          where: {
            campaignId_creatorId: {
              campaignId,
              creatorId: creator.id,
            },
          },
        });

        if (!assignment) {
          return NextResponse.json(
            { error: "Creator is not assigned to the referenced campaign" },
            { status: 403 }
          );
        }
      }
    }

    // Validate sale linkage permissions
    if (saleId) {
      const sale = await db.sale.findUnique({
        where: { id: saleId },
        include: { campaign: { select: { brandId: true } } },
      });

      if (!sale) {
        return NextResponse.json({ error: "Referenced sale transaction not found" }, { status: 404 });
      }

      if ((session.role === "OWNER" || session.role === "STAFF") && sale.campaign.brandId !== session.brandId) {
        return NextResponse.json({ error: "Unauthorized sale reference" }, { status: 403 });
      }
    }

    // Persist operational issue
    const newIssue = await db.operationalIssue.create({
      data: {
        userId: session.userId,
        campaignId,
        saleId,
        category,
        priority,
        status: "OPEN",
        title,
        description,
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            slug: true,
            promoCode: true,
          },
        },
      },
    });

    return NextResponse.json({ issue: newIssue }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST /api/support/issues");
  }
}
