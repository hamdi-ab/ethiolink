import { CampaignAnalyticsItem, FunnelMetrics } from "./analytics";

export type CampaignComparisonSortField =
  | "revenue"
  | "conversionRate"
  | "clickThroughRate"
  | "salesCount"
  | "pageViews"
  | "aov";

export type SortOrder = "asc" | "desc";

export interface CohortBenchmarks {
  topConvertingCampaign: CampaignAnalyticsItem | null;
  revenueLeader: CampaignAnalyticsItem | null;
  highestAovCampaign: CampaignAnalyticsItem | null;
  highestCtrCampaign: CampaignAnalyticsItem | null;
  averageConversionRate: number;
  averageClickThroughRate: number;
  averageAovETB: number;
  totalRevenueETB: number;
  totalSalesCount: number;
  totalClicks: number;
  totalPageViews: number;
  totalCampaigns: number;
}

export interface MetricComparisonItem {
  key: string;
  label: string;
  unit: "currency" | "percentage" | "count";
  valA: number;
  valB: number;
  diff: number;
  pctDiff: number; // percentage change from B to A: ((valA - valB) / valB) * 100
  leader: "A" | "B" | "TIE";
}

export interface CampaignHeadToHeadComparison {
  campaignA: CampaignAnalyticsItem;
  campaignB: CampaignAnalyticsItem;
  metrics: MetricComparisonItem[];
  channelsA: { telegramPct: number; callPct: number; mapPct: number; copyPct: number };
  channelsB: { telegramPct: number; callPct: number; mapPct: number; copyPct: number };
}

/**
 * Calculates channel breakdown percentages for a campaign or summary.
 * Protects against division by zero and guarantees non-negative integers summing up to 100%.
 */
export function getChannelBreakdown(metrics: FunnelMetrics): {
  telegramPct: number;
  callPct: number;
  mapPct: number;
  copyPct: number;
} {
  const total = metrics.totalClicks;
  if (!total || total <= 0) {
    return { telegramPct: 0, callPct: 0, mapPct: 0, copyPct: 0 };
  }

  const telegramPct = Math.round((metrics.telegramClicks / total) * 100);
  const callPct = Math.round((metrics.callClicks / total) * 100);
  const mapPct = Math.round((metrics.mapClicks / total) * 100);
  const copyPct = Math.max(0, 100 - telegramPct - callPct - mapPct);

  return { telegramPct, callPct, mapPct, copyPct };
}

/**
 * Pure function to sort campaigns by performance metrics.
 */
export function sortCampaigns(
  campaigns: CampaignAnalyticsItem[],
  field: CampaignComparisonSortField = "revenue",
  order: SortOrder = "desc"
): CampaignAnalyticsItem[] {
  const sorted = [...campaigns];

  sorted.sort((a, b) => {
    let valA = 0;
    let valB = 0;

    switch (field) {
      case "revenue":
        valA = a.totalRevenueETB;
        valB = b.totalRevenueETB;
        break;
      case "conversionRate":
        valA = a.salesConversionRate;
        valB = b.salesConversionRate;
        break;
      case "clickThroughRate":
        valA = a.clickThroughRate;
        valB = b.clickThroughRate;
        break;
      case "salesCount":
        valA = a.salesCount;
        valB = b.salesCount;
        break;
      case "pageViews":
        valA = a.pageViews;
        valB = b.pageViews;
        break;
      case "aov":
        valA = a.aovETB;
        valB = b.aovETB;
        break;
    }

    if (valA === valB) {
      return a.campaignName.localeCompare(b.campaignName);
    }

    return order === "desc" ? valB - valA : valA - valB;
  });

  return sorted;
}

/**
 * Pure calculation function for multi-campaign cohort benchmarking (PRD FR-031).
 * Identifies top-performing campaigns and portfolio efficiency benchmarks.
 */
export function calculateCohortBenchmarks(
  campaigns: CampaignAnalyticsItem[]
): CohortBenchmarks {
  if (!campaigns || campaigns.length === 0) {
    return {
      topConvertingCampaign: null,
      revenueLeader: null,
      highestAovCampaign: null,
      highestCtrCampaign: null,
      averageConversionRate: 0,
      averageClickThroughRate: 0,
      averageAovETB: 0,
      totalRevenueETB: 0,
      totalSalesCount: 0,
      totalClicks: 0,
      totalPageViews: 0,
      totalCampaigns: 0,
    };
  }

  let topConverting = campaigns[0];
  let revenueLeader = campaigns[0];
  let highestAov = campaigns[0];
  let highestCtr = campaigns[0];

  let sumCvr = 0;
  let sumCtr = 0;
  let sumAov = 0;
  let totalRevenueCents = 0;
  let totalSales = 0;
  let totalClicks = 0;
  let totalViews = 0;

  for (const c of campaigns) {
    if (c.salesConversionRate > topConverting.salesConversionRate) {
      topConverting = c;
    }
    if (c.totalRevenueETB > revenueLeader.totalRevenueETB) {
      revenueLeader = c;
    }
    if (c.aovETB > highestAov.aovETB) {
      highestAov = c;
    }
    if (c.clickThroughRate > highestCtr.clickThroughRate) {
      highestCtr = c;
    }

    sumCvr += c.salesConversionRate;
    sumCtr += c.clickThroughRate;
    sumAov += c.aovETB;
    totalRevenueCents += Math.round(c.totalRevenueETB * 100);
    totalSales += c.salesCount;
    totalClicks += c.totalClicks;
    totalViews += c.pageViews;
  }

  const count = campaigns.length;
  const averageConversionRate = Math.round((sumCvr / count) * 10) / 10;
  const averageClickThroughRate = Math.round((sumCtr / count) * 10) / 10;
  const averageAovETB = Math.round((sumAov / count) * 100) / 100;
  const totalRevenueETB = totalRevenueCents / 100;

  return {
    topConvertingCampaign: topConverting,
    revenueLeader,
    highestAovCampaign: highestAov,
    highestCtrCampaign: highestCtr,
    averageConversionRate,
    averageClickThroughRate,
    averageAovETB,
    totalRevenueETB,
    totalSalesCount: totalSales,
    totalClicks,
    totalPageViews: totalViews,
    totalCampaigns: count,
  };
}

/**
 * Computes side-by-side metric comparison between two campaigns.
 */
export function compareTwoCampaigns(
  campaignA: CampaignAnalyticsItem,
  campaignB: CampaignAnalyticsItem
): CampaignHeadToHeadComparison {
  const metricConfigs: Array<{
    key: string;
    label: string;
    unit: "currency" | "percentage" | "count";
    getter: (c: CampaignAnalyticsItem) => number;
  }> = [
    { key: "pageViews", label: "Page Views", unit: "count", getter: (c) => c.pageViews },
    { key: "uniqueVisitors", label: "Unique Visitors", unit: "count", getter: (c) => c.uniqueVisitors },
    { key: "totalClicks", label: "Action Intent Clicks", unit: "count", getter: (c) => c.totalClicks },
    { key: "clickThroughRate", label: "Click-Through Rate (CTR)", unit: "percentage", getter: (c) => c.clickThroughRate },
    { key: "salesCount", label: "In-Store Redemptions", unit: "count", getter: (c) => c.salesCount },
    { key: "salesConversionRate", label: "Sales Conversion Rate (CVR)", unit: "percentage", getter: (c) => c.salesConversionRate },
    { key: "totalRevenueETB", label: "Attributed Gross Sales", unit: "currency", getter: (c) => c.totalRevenueETB },
    { key: "aovETB", label: "Average Order Value (AOV)", unit: "currency", getter: (c) => c.aovETB },
  ];

  const metrics: MetricComparisonItem[] = metricConfigs.map((cfg) => {
    const valA = cfg.getter(campaignA);
    const valB = cfg.getter(campaignB);
    const diff = Math.round((valA - valB) * 100) / 100;

    let pctDiff = 0;
    if (valB > 0) {
      pctDiff = Math.round(((valA - valB) / valB) * 1000) / 10;
    } else if (valA > 0) {
      pctDiff = 100;
    }

    let leader: "A" | "B" | "TIE" = "TIE";
    if (valA > valB) leader = "A";
    else if (valB > valA) leader = "B";

    return {
      key: cfg.key,
      label: cfg.label,
      unit: cfg.unit,
      valA,
      valB,
      diff,
      pctDiff,
      leader,
    };
  });

  const channelsA = getChannelBreakdown(campaignA);
  const channelsB = getChannelBreakdown(campaignB);

  return {
    campaignA,
    campaignB,
    metrics,
    channelsA,
    channelsB,
  };
}
