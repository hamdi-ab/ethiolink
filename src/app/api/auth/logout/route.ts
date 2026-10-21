import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({
    status: "ok",
    message: "Logged out successfully",
  });
  clearSessionCookie(response);
  return response;
}
