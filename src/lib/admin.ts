import { db } from "@/lib/db";

export interface SystemHealthMetrics {
  status: "healthy" | "degraded" | "unreachable";
  dbLatencyMs: number;
  dbStatus: string;
  nodeVersion: string;
  platform: string;
  uptimeSeconds: number;
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  };
  timestamp: string;
}

export interface PlatformOverviewStats {
  totalBrands: number;
  totalUsers: number;
  totalCreators: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalEvents: number;
  totalSalesCount: number;
  totalRevenueETB: number;
}

/**
 * Gathers system runtime diagnostics, database connectivity, and latency
 */
export async function getSystemHealthDiagnostics(): Promise<SystemHealthMetrics> {
  const startTime = performance.now();
  let dbStatus = "connected";
  let status: "healthy" | "degraded" | "unreachable" = "healthy";

  try {
    await db.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error("Database health check ping failed:", error);
    dbStatus = "unreachable";
    status = "degraded";
  }

  const dbLatencyMs = Math.round((performance.now() - startTime) * 100) / 100;
  const mem = process.memoryUsage();

  return {
    status,
    dbLatencyMs,
    dbStatus,
    nodeVersion: process.version,
    platform: process.platform,
    uptimeSeconds: Math.floor(process.uptime()),
    memory: {
      heapUsedMB: Math.round((mem.heapUsed / (1024 * 1024)) * 100) / 100,
      heapTotalMB: Math.round((mem.heapTotal / (1024 * 1024)) * 100) / 100,
      rssMB: Math.round((mem.rss / (1024 * 1024)) * 100) / 100,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Calculates platform-wide summary metrics with exact integer-cent summation
 */
export function calculatePlatformTotals(
  brandCount: number,
  userCount: number,
  creatorCount: number,
  campaigns: Array<{ status: string }>,
  eventCount: number,
  sales: Array<{ amountETB: number | { toNumber(): number } | string }>
): PlatformOverviewStats {
  let totalCents = 0;

  for (const sale of sales) {
    const rawVal =
      typeof sale.amountETB === "object" && sale.amountETB !== null && "toNumber" in sale.amountETB
        ? sale.amountETB.toNumber()
        : Number(sale.amountETB);

    if (Number.isFinite(rawVal) && rawVal > 0) {
      totalCents += Math.round(rawVal * 100);
    }
  }

  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE").length;

  return {
    totalBrands: brandCount,
    totalUsers: userCount,
    totalCreators: creatorCount,
    totalCampaigns: campaigns.length,
    activeCampaigns,
    totalEvents: eventCount,
    totalSalesCount: sales.length,
    totalRevenueETB: totalCents / 100,
  };
}
