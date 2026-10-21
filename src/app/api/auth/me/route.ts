import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        brandId: true,
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User no longer exists" }, { status: 401 });
    }

    return NextResponse.json({
      status: "ok",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        brandId: user.brandId,
        brandName: user.brand?.name ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to fetch session user:", error);
    // Fallback to session payload if database is temporarily offline
    return NextResponse.json({
      status: "ok",
      user: {
        id: session.userId,
        name: session.name,
        phone: session.phone,
        role: session.role,
        brandId: session.brandId ?? null,
      },
    });
  }
}
