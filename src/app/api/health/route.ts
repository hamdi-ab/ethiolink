import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  let dbStatus = "configured";
  try {
    // Attempt a light ping if database connection is available
    await db.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (error) {
    dbStatus = "unreachable_or_uninitialized";
  }

  return NextResponse.json({
    status: "ok",
    service: "ethiolink",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
    },
  });
}
