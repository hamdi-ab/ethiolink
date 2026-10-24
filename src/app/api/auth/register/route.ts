import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { handleApiError } from "@/lib/api-errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const { brandName, ownerName, phone, password } = body;

    if (!brandName || typeof brandName !== "string" || brandName.trim().length === 0) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    if (!ownerName || typeof ownerName !== "string" || ownerName.trim().length === 0) {
      return NextResponse.json({ error: "Owner name is required" }, { status: 400 });
    }

    if (!phone || typeof phone !== "string" || phone.trim().length < 9) {
      return NextResponse.json(
        { error: "Valid Ethiopian phone number is required (min 9 digits)" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const normalizedPhone = phone.trim();

    // Check if phone number is already registered
    const existingUser = await db.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this phone number already exists" },
        { status: 409 }
      );
    }

    const existingBrand = await db.brand.findUnique({
      where: { phone: normalizedPhone },
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: "A brand with this phone number already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create Brand and Owner User in a transaction
    const result = await db.$transaction(async (tx) => {
      const brand = await tx.brand.create({
        data: {
          name: brandName.trim(),
          ownerName: ownerName.trim(),
          phone: normalizedPhone,
          passwordHash,
        },
      });

      const user = await tx.user.create({
        data: {
          brandId: brand.id,
          name: ownerName.trim(),
          phone: normalizedPhone,
          role: "OWNER",
          passwordHash,
        },
      });

      return { brand, user };
    });

    // Create session token
    const token = createSessionToken({
      userId: result.user.id,
      name: result.user.name,
      phone: result.user.phone,
      role: "OWNER",
      brandId: result.brand.id,
    });

    const response = NextResponse.json(
      {
        status: "ok",
        user: {
          id: result.user.id,
          name: result.user.name,
          phone: result.user.phone,
          role: "OWNER",
          brandId: result.brand.id,
          brandName: result.brand.name,
        },
      },
      { status: 201 }
    );

    setSessionCookie(response, token);
    return response;
  } catch (error) {
    return handleApiError(error, "Failed to register brand");
  }
}
