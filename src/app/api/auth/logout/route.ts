import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST(req?: NextRequest) {
  const isHtml = req?.headers?.get("accept")?.includes("text/html");

  const response = isHtml && req
    ? NextResponse.redirect(new URL("/login", req.url), { status: 303 })
    : NextResponse.json({
        status: "ok",
        message: "Logged out successfully",
      });

  clearSessionCookie(response);
  return response;
}

export async function GET(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", req.url), { status: 303 });
  clearSessionCookie(response);
  return response;
}
