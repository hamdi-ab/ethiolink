import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { handleApiError } from "@/lib/api-errors";

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

    // Support flexible Ethiopian phone matching (+2519..., 09..., 2519..., 9...)
    const phoneCandidates = new Set<string>([normalizedPhone]);
    const digitsOnly = normalizedPhone.replace(/\D/g, "");

    if (digitsOnly.length === 9 && (digitsOnly.startsWith("9") || digitsOnly.startsWith("7"))) {
      phoneCandidates.add(`0${digitsOnly}`);
      phoneCandidates.add(`+251${digitsOnly}`);
      phoneCandidates.add(`251${digitsOnly}`);
    } else if (digitsOnly.length === 10 && digitsOnly.startsWith("0")) {
      const nineDigits = digitsOnly.slice(1);
      phoneCandidates.add(digitsOnly);
      phoneCandidates.add(`+251${nineDigits}`);
      phoneCandidates.add(`251${nineDigits}`);
    } else if (digitsOnly.length === 12 && digitsOnly.startsWith("251")) {
      const nineDigits = digitsOnly.slice(3);
      phoneCandidates.add(`0${nineDigits}`);
      phoneCandidates.add(`+251${nineDigits}`);
      phoneCandidates.add(digitsOnly);
    }

    // Query user by phone candidates with brand relation
    const user = await db.user.findFirst({
      where: {
        phone: { in: Array.from(phoneCandidates) },
      },
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

    // Role-based redirect target
    let redirectUrl = "/brand";
    if (user.role === "STAFF") {
      redirectUrl = "/brand/sales";
    } else if (user.role === "CREATOR") {
      redirectUrl = "/creator";
    } else if (user.role === "ADMIN") {
      redirectUrl = "/admin";
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
        redirectUrl,
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
    return handleApiError(error, "Internal server error during authentication");
  }
}
