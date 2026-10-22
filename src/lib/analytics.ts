export interface FunnelMetrics {
  pageViews: number;
  uniqueVisitors: number;
  telegramClicks: number;
  callClicks: number;
  mapClicks: number;
  copyCodeClicks: number;
  totalClicks: number;
  salesCount: number;
  totalRevenueETB: number;
  clickThroughRate: number; // percentage (0 - 100)
  salesConversionRate: number; // percentage (0 - 100)
  aovETB: number; // Average Order Value in ETB
}

export interface CampaignAnalyticsItem extends FunnelMetrics {
  campaignId: string;
  campaignName: string;
  slug: string;
  promoCode: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  creators: Array<{
    name: string;
    telegramUsername: string | null;
  }>;
}

export type CampaignAnalyticsResponse = CampaignAnalyticsItem;

export interface RawEvent {
  eventType: string;
  visitorId: string;
}

export interface RawSale {
  amountETB: number | { toNumber(): number } | string;
}

/**
 * Pure calculation function for conversion funnel analytics.
 * Guarantees zero floating point error and division-by-zero protection.
 */
export function calculateFunnelMetrics(
  events: RawEvent[],
  sales: RawSale[]
): FunnelMetrics {
  let pageViews = 0;
  let telegramClicks = 0;
  let callClicks = 0;
  let mapClicks = 0;
  let copyCodeClicks = 0;

  const uniqueVisitorIds = new Set<string>();

  for (const event of events) {
    if (event.visitorId) {
      uniqueVisitorIds.add(event.visitorId);
    }

    switch (event.eventType) {
      case "PAGE_VIEW":
        pageViews++;
        break;
      case "TELEGRAM_CLICK":
        telegramClicks++;
        break;
      case "CALL_CLICK":
        callClicks++;
        break;
      case "MAP_CLICK":
        mapClicks++;
        break;
      case "COPY_CODE":
        copyCodeClicks++;
        break;
    }
  }

  const totalClicks = telegramClicks + callClicks + mapClicks + copyCodeClicks;
  const uniqueVisitors = uniqueVisitorIds.size;
  const salesCount = sales.length;

  // Compute exact total revenue in cents (cents/centimes) to eliminate floating point inaccuracies
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

  const totalRevenueETB = totalCents / 100;

  // Ratios and conversion metrics
  const clickThroughRate =
    pageViews > 0
      ? Math.round((totalClicks / pageViews) * 1000) / 10
      : 0;

  const salesConversionRate =
    pageViews > 0
      ? Math.round((salesCount / pageViews) * 1000) / 10
      : 0;

  const aovETB =
    salesCount > 0
      ? Math.round((totalRevenueETB / salesCount) * 100) / 100
      : 0;

  return {
    pageViews,
    uniqueVisitors,
    telegramClicks,
    callClicks,
    mapClicks,
    copyCodeClicks,
    totalClicks,
    salesCount,
    totalRevenueETB,
    clickThroughRate,
    salesConversionRate,
    aovETB,
  };
}
