import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const { phone, password } = body;

    if (!phone || typeof phone !== "string" || !password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Phone number and password are required" },
        { status: 400 }
      );
    }

    const normalizedPhone = phone.trim();

    // Query user by phone with brand relation
    const user = await db.user.findUnique({
      where: { phone: normalizedPhone },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    // Role verification (only OWNER and STAFF login through this portal)
    if (user.role !== "OWNER" && user.role !== "STAFF" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "This portal is reserved for Brand Owners and Staff members" },
        { status: 403 }
      );
    }

    // Issue session token
    const token = createSessionToken({
      userId: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      brandId: user.brandId,
    });

    const response = NextResponse.json(
      {
        status: "ok",
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          brandId: user.brandId,
          brandName: user.brand?.name ?? null,
        },
      },
      { status: 200 }
    );

    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error("Login authentication error:", error);
    return NextResponse.json(
      { error: "Internal server error during authentication" },
      { status: 500 }
    );
  }
}
