import { FunnelMetrics, CampaignAnalyticsItem } from "./analytics";

export interface AuditLogEntry {
  timestamp: string;
  recordType: "EVENT" | "SALE";
  campaignName: string;
  promoCode: string;
  channelOrAction: string;
  visitorOrReceiptId: string;
  amountETB?: number | null;
  staffName?: string | null;
  notes?: string | null;
}

/**
 * Escapes a single CSV field value according to RFC 4180 rules.
 * Numbers are formatted to 2 decimal places by default.
 */
export function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) {
    return "";
  }

  if (typeof val === "number") {
    return val.toFixed(2);
  }

  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Formats a report timestamp into a clean, deterministic human-readable ISO string.
 */
export function formatReportTimestamp(date: Date = new Date()): string {
  return date.toISOString().replace("T", " ").substring(0, 19) + " UTC";
}

/**
 * Generates an executive summary performance CSV with metadata banners and campaign metrics.
 */
export function generateSummaryCSV(
  brandName: string,
  campaigns: CampaignAnalyticsItem[],
  summary: FunnelMetrics,
  generatedAt: Date = new Date()
): string {
  const formattedRevenue = summary.totalRevenueETB.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const banner = [
    `# Brand Executive Performance Report - ${brandName}`,
    `# Generated At: ${formatReportTimestamp(generatedAt)}`,
    `# Total Attributed Revenue: ETB ${formattedRevenue}`,
    `# Total Verified Conversions: ${summary.salesCount}`,
    `# Funnel Efficiency: ${summary.salesConversionRate}%`,
    "#",
  ].join("\n");

  const headers = [
    "Campaign Name",
    "Slug",
    "Promo Code",
    "Status",
    "Views",
    "Unique Visitors",
    "Total Clicks",
    "Telegram Clicks",
    "Call Clicks",
    "Map Clicks",
    "Copy Code Clicks",
    "Sales Count",
    "Gross Revenue (ETB)",
    "AOV (ETB)",
    "Conversion Rate (%)",
    "Assigned Creators",
  ].join(",");

  const rows = campaigns.map((camp) => {
    const creatorList =
      camp.creators && camp.creators.length > 0
        ? camp.creators
            .map((c) => (c.telegramUsername ? `${c.name} (@${c.telegramUsername})` : c.name))
            .join(", ")
        : "None assigned";

    return [
      escapeCSV(camp.campaignName),
      escapeCSV(camp.slug),
      escapeCSV(camp.promoCode),
      escapeCSV(camp.status),
      escapeCSV(String(camp.pageViews)),
      escapeCSV(String(camp.uniqueVisitors)),
      escapeCSV(String(camp.totalClicks)),
      escapeCSV(String(camp.telegramClicks)),
      escapeCSV(String(camp.callClicks)),
      escapeCSV(String(camp.mapClicks)),
      escapeCSV(String(camp.copyCodeClicks)),
      escapeCSV(String(camp.salesCount)),
      escapeCSV(camp.totalRevenueETB),
      escapeCSV(camp.aovETB),
      escapeCSV(`${camp.salesConversionRate}%`),
      escapeCSV(creatorList),
    ].join(",");
  });

  return [banner, headers, ...rows].join("\n");
}

/**
 * Generates an audit ledger CSV containing chronological events and verified POS redemptions.
 */
export function generateAuditCSV(
  brandName: string,
  entries: AuditLogEntry[],
  generatedAt: Date = new Date()
): string {
  const banner = [
    `# EthioLink Omnichannel Audit & Redemption Ledger - ${brandName}`,
    `# Generated At: ${formatReportTimestamp(generatedAt)}`,
    `# Total Records: ${entries.length}`,
    "#",
  ].join("\n");

  const headers = [
    "Timestamp",
    "Record Type",
    "Campaign Name",
    "Promo Code",
    "Channel / Action",
    "Identifier / Receipt",
    "Amount (ETB)",
    "Cashier / Staff",
    "Notes",
  ].join(",");

  const rows = entries.map((entry) => {
    return [
      escapeCSV(entry.timestamp),
      escapeCSV(entry.recordType),
      escapeCSV(entry.campaignName),
      escapeCSV(entry.promoCode),
      escapeCSV(entry.channelOrAction),
      escapeCSV(entry.visitorOrReceiptId),
      entry.amountETB !== null && entry.amountETB !== undefined ? escapeCSV(entry.amountETB) : "",
      escapeCSV(entry.staffName || ""),
      escapeCSV(entry.notes || ""),
    ].join(",");
  });

  return [banner, headers, ...rows].join("\n");
}

/**
 * Client-side browser download trigger using Blob URL.
 */
export function downloadCSV(filename: string, content: string): void {
  if (typeof window === "undefined") return;

  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
