import { NextRequest, NextResponse } from "next/server";

interface SimpleSession {
  userId: string;
  role: "OWNER" | "STAFF" | "CREATOR" | "ADMIN";
  brandId?: string | null;
  exp: number;
}

function parseSessionToken(token: string): SimpleSession | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode base64url payload
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(jsonPayload) as SimpleSession;
    if (Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect brand and admin routes
  if (pathname.startsWith("/brand") || pathname.startsWith("/admin")) {
    const token = req.cookies.get("ethiolink_session")?.value;
    const session = token ? parseSessionToken(token) : null;

    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based restrictions for Staff
    if (session.role === "STAFF") {
      // Staff are only permitted to access /brand/sales (in-store sales logging)
      if (!pathname.startsWith("/brand/sales")) {
        return NextResponse.redirect(new URL("/brand/sales", req.url));
      }
    }

    // Admin-only route guard
    if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/brand", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/brand/:path*", "/admin/:path*"],
};
