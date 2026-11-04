export interface WeeklyVelocityBucket {
  label: string;
  dateRange: string;
  amountETB: number;
  count: number;
  percentage: number;
  isPeak: boolean;
}

export interface BranchHotspotItem {
  name: string;
  channelName: string;
  type: "store" | "telegram" | "phone";
  sharePercent: number;
  amountETB: number;
  salesCount: number;
}

export interface CreatorRosterItem {
  id: string;
  name: string;
  phone: string;
  telegramUsername: string | null;
  campaignsCount: number;
  campaignNames: string[];
}

export interface PeriodTrends {
  revenueTrendPercent: number | null;
  visitsTrendPercent: number | null;
  salesCountTrendPercent: number | null;
  weeklyVelocityPercent: number | null;
}

export interface SalesTimelinePoint {
  date: string;
  amountETB: number;
  cumulativeETB: number;
}

/**
 * Resolves the operational branch or channel from sale notes or campaign context.
 */
export function resolveSaleChannelAndBranch(
  notes?: string | null,
  campaignName?: string
): { branch: string; channel: "pos" | "telegram" | "phone" } {
  const noteLower = (notes || "").toLowerCase();
  const campLower = (campaignName || "").toLowerCase();

  if (noteLower.includes("piassa") || campLower.includes("piassa")) {
    return { branch: "Piassa Roastery POS", channel: "pos" };
  }
  if (noteLower.includes("telegram") || noteLower.includes("bot") || campLower.includes("telegram")) {
    return { branch: "Telegram Mini-App", channel: "telegram" };
  }
  if (noteLower.includes("phone") || noteLower.includes("call") || noteLower.includes("hotline")) {
    return { branch: "Direct Hotline Order", channel: "phone" };
  }
  if (noteLower.includes("kazanchis") || campLower.includes("kazanchis")) {
    return { branch: "Kazanchis Hub POS", channel: "pos" };
  }

  // Default to Bole Flagship POS for store attribution
  return { branch: "Bole Flagship POS", channel: "pos" };
}

/**
 * Calculates 5 sequential 7-day velocity buckets ending at baseDate (W1 to W5).
 */
export function calculateWeeklyVelocity(
  sales: Array<{ amountETB: number | string; createdAt: string | Date }>,
  baseDate: Date = new Date()
): WeeklyVelocityBucket[] {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const ONE_WEEK_MS = 7 * ONE_DAY_MS;
  const baseTime = baseDate.getTime();

  // Create 5 buckets: W1 (35-28d ago), W2 (28-21d ago), W3 (21-14d ago), W4 (14-7d ago), W5 (7d ago to now)
  const buckets: WeeklyVelocityBucket[] = [];

  for (let i = 4; i >= 0; i--) {
    const weekIndex = 4 - i; // 0 for W1, 4 for W5
    const weekStartMs = baseTime - (i + 1) * ONE_WEEK_MS;
    const weekEndMs = baseTime - i * ONE_WEEK_MS;

    const startDate = new Date(weekStartMs);
    const endDate = new Date(weekEndMs);

    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dateRange = `${fmt(startDate)} - ${fmt(endDate)}`;

    buckets.push({
      label: `W${weekIndex + 1}`,
      dateRange,
      amountETB: 0,
      count: 0,
      percentage: 0,
      isPeak: false,
    });
  }

  // Aggregate sales into buckets
  for (const sale of sales) {
    const saleTime = new Date(sale.createdAt).getTime();
    const amount = Number(sale.amountETB) || 0;

    for (let i = 0; i < 5; i++) {
      const weekIndexFromEnd = 4 - i;
      const weekStartMs = baseTime - (weekIndexFromEnd + 1) * ONE_WEEK_MS;
      const weekEndMs = baseTime - weekIndexFromEnd * ONE_WEEK_MS;

      if (saleTime >= weekStartMs && saleTime < weekEndMs) {
        buckets[i].amountETB += amount;
        buckets[i].count += 1;
        break;
      }
    }
  }

  const maxAmount = Math.max(...buckets.map((b) => b.amountETB), 0);

  for (const bucket of buckets) {
    if (maxAmount > 0) {
      bucket.percentage = Math.max(12, Math.round((bucket.amountETB / maxAmount) * 100));
      bucket.isPeak = bucket.amountETB === maxAmount && bucket.amountETB > 0;
    } else {
      bucket.percentage = 12; // Baseline stub so bars remain visually balanced
      bucket.isPeak = false;
    }
  }

  // If no single peak was found because all were 0, mark the last one as current
  if (maxAmount === 0 && buckets.length > 0) {
    buckets[buckets.length - 1].isPeak = true;
  }

  return buckets;
}

/**
 * Derives regional and channel hotspots from recorded sales notes and events.
 */
export function calculateBranchHotspots(
  sales: Array<{ amountETB: number | string; notes?: string | null }>,
  eventsBreakdown: { telegram: number; calls: number; maps: number; promoCopies: number; total: number }
): BranchHotspotItem[] {
  const branchMap = new Map<string, { amountETB: number; count: number; type: "store" | "telegram" | "phone" }>();

  // Initialize primary expected locations
  branchMap.set("Bole Flagship (Medhanialem)", { amountETB: 0, count: 0, type: "store" });
  branchMap.set("Piassa Roastery Hub", { amountETB: 0, count: 0, type: "store" });
  branchMap.set("Telegram Mini-App Channel", { amountETB: 0, count: 0, type: "telegram" });

  let totalSalesAmount = 0;

  for (const sale of sales) {
    const amt = Number(sale.amountETB) || 0;
    totalSalesAmount += amt;
    const note = (sale.notes || "").toLowerCase();

    if (note.includes("piassa")) {
      const curr = branchMap.get("Piassa Roastery Hub")!;
      curr.amountETB += amt;
      curr.count += 1;
    } else if (note.includes("telegram") || note.includes("bot")) {
      const curr = branchMap.get("Telegram Mini-App Channel")!;
      curr.amountETB += amt;
      curr.count += 1;
    } else {
      const curr = branchMap.get("Bole Flagship (Medhanialem)")!;
      curr.amountETB += amt;
      curr.count += 1;
    }
  }

  const result: BranchHotspotItem[] = [];

  for (const [name, data] of branchMap.entries()) {
    let sharePercent = 0;
    if (totalSalesAmount > 0) {
      sharePercent = Math.round((data.amountETB / totalSalesAmount) * 100);
    } else if (eventsBreakdown.total > 0) {
      // Fallback to event distribution if no sales yet
      if (data.type === "telegram") {
        sharePercent = Math.round((eventsBreakdown.telegram / eventsBreakdown.total) * 100);
      } else if (name.includes("Bole")) {
        sharePercent = Math.round((eventsBreakdown.maps / eventsBreakdown.total) * 100);
      } else {
        sharePercent = Math.round((eventsBreakdown.calls / eventsBreakdown.total) * 100);
      }
    } else {
      // Defaults when zero events and sales
      sharePercent = name.includes("Bole") ? 58 : name.includes("Telegram") ? 28 : 14;
    }

    result.push({
      name,
      channelName: data.type === "telegram" ? "Telegram Bot" : "In-Store POS",
      type: data.type,
      sharePercent: Math.max(5, sharePercent),
      amountETB: data.amountETB,
      salesCount: data.count,
    });
  }

  // Sort descending by share percentage
  return result.sort((a, b) => b.sharePercent - a.sharePercent);
}

/**
 * Builds SVG smooth Bezier curve coordinates for the Ad Spend vs Attributed Revenue chart.
 */
export function generateSalesCurvePaths(
  sales: Array<{ amountETB: number | string; createdAt: string | Date }>,
  width = 540
): {
  salesAreaPath: string;
  salesStrokePath: string;
  spendAreaPath: string;
  spendStrokePath: string;
  peakPoint: { x: number; y: number };
  maxETB: number;
} {
  const topPadding = 20;
  const bottomBaseline = 145;
  const availableHeight = bottomBaseline - topPadding;

  if (!sales || sales.length === 0) {
    // Gentle default curves for zero state
    return {
      salesAreaPath: `M 0 ${bottomBaseline} L ${width} ${bottomBaseline} L 0 ${bottomBaseline} Z`,
      salesStrokePath: `M 0 ${bottomBaseline} L ${width} ${bottomBaseline}`,
      spendAreaPath: `M 0 ${bottomBaseline} L ${width} ${bottomBaseline} L 0 ${bottomBaseline} Z`,
      spendStrokePath: `M 0 ${bottomBaseline} L ${width} ${bottomBaseline}`,
      peakPoint: { x: width, y: bottomBaseline },
      maxETB: 0,
    };
  }

  // Sort sales chronologically
  const sorted = [...sales].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  let cumulative = 0;
  const points: Array<{ x: number; y: number; amount: number }> = [];

  const firstTime = new Date(sorted[0].createdAt).getTime();
  const lastTime = new Date(sorted[sorted.length - 1].createdAt).getTime();
  const timeSpan = Math.max(lastTime - firstTime, 1);

  const totalAmount = sorted.reduce((sum, s) => sum + (Number(s.amountETB) || 0), 0);

  // Initial origin point
  points.push({ x: 0, y: bottomBaseline, amount: 0 });

  for (let i = 0; i < sorted.length; i++) {
    const sale = sorted[i];
    cumulative += Number(sale.amountETB) || 0;
    const saleTime = new Date(sale.createdAt).getTime();

    // Map time to X coordinate (margin 20 to width - 10)
    const normX = sorted.length === 1
      ? width * 0.75
      : 20 + ((saleTime - firstTime) / timeSpan) * (width - 40);

    // Map cumulative to Y coordinate (bottomBaseline down to topPadding)
    const normY = bottomBaseline - (cumulative / (totalAmount || 1)) * availableHeight;

    points.push({
      x: Math.round(normX),
      y: Math.round(Math.max(topPadding, normY)),
      amount: cumulative,
    });
  }

  // Ensure end point reaches right edge
  const lastP = points[points.length - 1];
  if (lastP.x < width) {
    points.push({ x: width, y: lastP.y, amount: totalAmount });
  }

  // Build SVG path with cubic bezier smoothing
  let strokePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX1 = prev.x + (curr.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (curr.x - prev.x) / 2;
    const cpY2 = curr.y;
    strokePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
  }

  const areaPath = `${strokePath} L ${width} 160 L 0 160 Z`;

  // Ad Spend guide line (e.g. baseline creator payout ~ 10% of revenue or modest budget)
  const spendPeakY = bottomBaseline - (availableHeight * 0.25);
  const spendStrokePath = `M 0 ${bottomBaseline} Q ${width * 0.5} ${bottomBaseline - 15}, ${width} ${spendPeakY}`;
  const spendAreaPath = `${spendStrokePath} L ${width} 160 L 0 160 Z`;

  const peakPoint = {
    x: points[points.length - 1].x,
    y: points[points.length - 1].y,
  };

  return {
    salesAreaPath: areaPath,
    salesStrokePath: strokePath,
    spendAreaPath,
    spendStrokePath,
    peakPoint,
    maxETB: totalAmount,
  };
}
