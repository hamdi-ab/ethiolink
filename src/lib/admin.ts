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

export interface ChannelBreakdown {
  telegram: number;
  phone: number;
  map: number;
  promo: number;
  total: number;
}

export interface PlatformFunnelMetrics {
  pageViews: number;
  uniqueVisitors: number;
  actionTaps: number;
  recordedSales: number;
  totalRevenueETB: number;
  averageOrderValueETB: number;
  visitToActionRate: number;
  actionToSaleRate: number;
  overallConversionRate: number;
  channels: ChannelBreakdown;
}

export interface TopCampaignItem {
  id: string;
  name: string;
  brandName: string;
  promoCode: string;
  salesCount: number;
  revenueETB: number;
}

export interface TopCreatorItem {
  id: string;
  name: string;
  telegramUsername: string | null;
  assignedCampaignsCount: number;
  attributedSalesCount: number;
  attributedRevenueETB: number;
}

export interface AdminAnalyticsData {
  funnel: PlatformFunnelMetrics;
  topCampaigns: TopCampaignItem[];
  topCreators: TopCreatorItem[];
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
    if (process.env.NODE_ENV !== "test") {
      console.error("Database health check ping failed:", error);
    }
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
  sales: Array<{ amountETB: number | { toNumber(): number } | string; isVoided?: boolean }>
): PlatformOverviewStats {
  const activeSales = sales.filter((s) => !s.isVoided);
  let totalCents = 0;

  for (const sale of activeSales) {
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
    totalSalesCount: activeSales.length,
    totalRevenueETB: totalCents / 100,
  };
}

/**
 * Computes deep funnel analytics, channel distribution, and performance leaderboards
 */
export function calculatePlatformAnalytics(
  events: Array<{ eventType: string; visitorId: string; metadata?: unknown }>,
  sales: Array<{
    id: string;
    amountETB: number | { toNumber(): number } | string;
    campaignId: string;
    isVoided?: boolean;
    campaign?: { id: string; name: string; promoCode: string; brand?: { name: string } | null } | null;
  }>,
  creators?: Array<{
    id: string;
    user?: { name: string } | null;
    telegramUsername?: string | null;
    assignments?: Array<{ campaignId: string }> | null;
  }>
): AdminAnalyticsData {
  let pageViews = 0;
  let actionTaps = 0;
  const uniqueVisitorsSet = new Set<string>();

  const channels: ChannelBreakdown = {
    telegram: 0,
    phone: 0,
    map: 0,
    promo: 0,
    total: 0,
  };

  for (const event of events) {
    if (event.visitorId) {
      uniqueVisitorsSet.add(event.visitorId);
    }

    if (event.eventType === "PAGE_VIEW") {
      pageViews++;
    } else if (
      event.eventType === "ACTION_TAP" ||
      event.eventType === "TELEGRAM_CLICK" ||
      event.eventType === "CALL_CLICK" ||
      event.eventType === "MAP_CLICK" ||
      event.eventType === "COPY_CODE"
    ) {
      actionTaps++;
      channels.total++;

      if (event.eventType === "TELEGRAM_CLICK") {
        channels.telegram++;
      } else if (event.eventType === "CALL_CLICK") {
        channels.phone++;
      } else if (event.eventType === "MAP_CLICK") {
        channels.map++;
      } else if (event.eventType === "COPY_CODE") {
        channels.promo++;
      } else {
        // Inspect metadata for channel identifier
        let metaObj: Record<string, unknown> | null = null;
        if (typeof event.metadata === "string") {
          try {
            metaObj = JSON.parse(event.metadata);
          } catch {}
        } else if (event.metadata && typeof event.metadata === "object") {
          metaObj = event.metadata as Record<string, unknown>;
        }

        const channelName = String(metaObj?.channel || metaObj?.action || "").toUpperCase();
        if (channelName.includes("TELEGRAM")) {
          channels.telegram++;
        } else if (channelName.includes("PHONE") || channelName.includes("CALL")) {
          channels.phone++;
        } else if (channelName.includes("MAP")) {
          channels.map++;
        } else if (channelName.includes("PROMO")) {
          channels.promo++;
        } else {
          channels.telegram++; // default fallback for telegram referral
        }
      }
    }
  }

  const uniqueVisitors = uniqueVisitorsSet.size;
  const activeSales = sales.filter((s) => !s.isVoided);
  let totalCents = 0;
  const campaignMap = new Map<string, {
    name: string;
    brandName: string;
    promoCode: string;
    salesCount: number;
    cents: number;
  }>();

  for (const sale of activeSales) {
    const rawVal =
      typeof sale.amountETB === "object" && sale.amountETB !== null && "toNumber" in sale.amountETB
        ? sale.amountETB.toNumber()
        : Number(sale.amountETB);

    const cents = Number.isFinite(rawVal) && rawVal > 0 ? Math.round(rawVal * 100) : 0;
    totalCents += cents;

    if (sale.campaignId) {
      const existing = campaignMap.get(sale.campaignId) || {
        name: sale.campaign?.name || "Campaign",
        brandName: sale.campaign?.brand?.name || "Merchant",
        promoCode: sale.campaign?.promoCode || "-",
        salesCount: 0,
        cents: 0,
      };
      existing.salesCount++;
      existing.cents += cents;
      campaignMap.set(sale.campaignId, existing);
    }
  }

  const recordedSales = activeSales.length;
  const totalRevenueETB = totalCents / 100;
  const averageOrderValueETB =
    recordedSales > 0 ? Math.round((totalRevenueETB / recordedSales) * 100) / 100 : 0;

  const visitToActionRate =
    uniqueVisitors > 0 ? Math.round((actionTaps / uniqueVisitors) * 1000) / 10 : 0;
  const actionToSaleRate =
    actionTaps > 0 ? Math.round((recordedSales / actionTaps) * 1000) / 10 : 0;
  const overallConversionRate =
    uniqueVisitors > 0 ? Math.round((recordedSales / uniqueVisitors) * 1000) / 10 : 0;

  // Top campaigns leaderboard
  const topCampaigns: TopCampaignItem[] = Array.from(campaignMap.entries())
    .map(([id, data]) => ({
      id,
      name: data.name,
      brandName: data.brandName,
      promoCode: data.promoCode,
      salesCount: data.salesCount,
      revenueETB: data.cents / 100,
    }))
    .sort((a, b) => b.revenueETB - a.revenueETB)
    .slice(0, 5);

  // Top creators leaderboard
  const topCreators: TopCreatorItem[] = (creators || []).map((c) => {
    const assignedIds = new Set((c.assignments || []).map((a) => a.campaignId));
    let attributedCount = 0;
    let attributedCents = 0;

    for (const [campId, cData] of campaignMap.entries()) {
      if (assignedIds.has(campId)) {
        attributedCount += cData.salesCount;
        attributedCents += cData.cents;
      }
    }

    return {
      id: c.id,
      name: c.user?.name || "Creator",
      telegramUsername: c.telegramUsername || null,
      assignedCampaignsCount: assignedIds.size,
      attributedSalesCount: attributedCount,
      attributedRevenueETB: attributedCents / 100,
    };
  })
  .sort((a, b) => b.attributedRevenueETB - a.attributedRevenueETB)
  .slice(0, 5);

  return {
    funnel: {
      pageViews,
      uniqueVisitors,
      actionTaps,
      recordedSales,
      totalRevenueETB,
      averageOrderValueETB,
      visitToActionRate,
      actionToSaleRate,
      overallConversionRate,
      channels,
    },
    topCampaigns,
    topCreators,
  };
}
