import test from "node:test";
import assert from "node:assert/strict";
import {
  escapeCSV,
  generateSummaryCSV,
  generateAuditCSV,
  formatReportTimestamp,
} from "../src/lib/reports.ts";

test("escapeCSV handles standard strings, special characters, and numbers", () => {
  assert.equal(escapeCSV("Addis Ababa"), "Addis Ababa");
  assert.equal(escapeCSV(1234.5), "1234.50");
  assert.equal(escapeCSV(0), "0.00");
  assert.equal(escapeCSV(null), "");
  assert.equal(escapeCSV(undefined), "");

  // Quotes and commas
  assert.equal(escapeCSV('Promo, "Summer" Edition'), '"Promo, ""Summer"" Edition"');
  // Newlines
  assert.equal(escapeCSV("Line 1\nLine 2"), '"Line 1\nLine 2"');
  assert.equal(escapeCSV("Line 1\r\nLine 2"), '"Line 1\r\nLine 2"');

  // Ge'ez / Amharic unicode preservation
  assert.equal(escapeCSV("የቦሌ ቅርንጫፍ ቅናሽ"), "የቦሌ ቅርንጫፍ ቅናሽ");
  assert.equal(escapeCSV('ልዩ "ቅናሽ", 20%'), '"ልዩ ""ቅናሽ"", 20%"');
});

test("generateSummaryCSV produces valid RFC 4180 CSV with executive headers", () => {
  const mockSummary = {
    pageViews: 1200,
    uniqueVisitors: 850,
    telegramClicks: 320,
    callClicks: 80,
    mapClicks: 40,
    copyCodeClicks: 60,
    totalClicks: 500,
    salesCount: 45,
    totalRevenueETB: 125000.5,
    clickThroughRate: 41.7,
    salesConversionRate: 3.8,
    aovETB: 2777.79,
  };

  const mockCampaigns = [
    {
      campaignId: "c1",
      campaignName: 'Bole Launch, "Special"',
      slug: "bole-launch",
      promoCode: "BOLE20",
      status: "ACTIVE",
      startDate: "2026-10-01T00:00:00.000Z",
      endDate: null,
      pageViews: 800,
      uniqueVisitors: 550,
      telegramClicks: 220,
      callClicks: 50,
      mapClicks: 30,
      copyCodeClicks: 40,
      totalClicks: 340,
      salesCount: 30,
      totalRevenueETB: 85000,
      clickThroughRate: 42.5,
      salesConversionRate: 3.75,
      aovETB: 2833.33,
      creators: [
        { name: "Abel Tesfaye", telegramUsername: "abel_eth" },
        { name: "Sara Biruk", telegramUsername: null },
      ],
    },
  ];

  const csv = generateSummaryCSV("Bole Roasters", mockCampaigns, mockSummary, new Date("2026-10-26T10:00:00Z"));

  // Check metadata banner
  assert.match(csv, /# Brand Executive Performance Report - Bole Roasters/);
  assert.match(csv, /# Total Attributed Revenue: ETB 125,000.50/);
  assert.match(csv, /# Total Verified Conversions: 45/);

  // Check CSV header
  assert.match(csv, /Campaign Name,Slug,Promo Code,Status,Views,Unique Visitors,Total Clicks,Telegram Clicks,Call Clicks,Map Clicks,Copy Code Clicks,Sales Count,Gross Revenue \(ETB\),AOV \(ETB\),Conversion Rate \(%\),Assigned Creators/);

  // Check campaign row with escaped quotes and commas
  assert.match(csv, /"Bole Launch, ""Special""",bole-launch,BOLE20,ACTIVE,800,550,340,220,50,30,40,30,85000.00,2833.33,3.75%,"Abel Tesfaye \(@abel_eth\), Sara Biruk"/);
});

test("generateSummaryCSV handles empty campaigns list safely", () => {
  const emptySummary = {
    pageViews: 0,
    uniqueVisitors: 0,
    telegramClicks: 0,
    callClicks: 0,
    mapClicks: 0,
    copyCodeClicks: 0,
    totalClicks: 0,
    salesCount: 0,
    totalRevenueETB: 0,
    clickThroughRate: 0,
    salesConversionRate: 0,
    aovETB: 0,
  };

  const csv = generateSummaryCSV("New Brand", [], emptySummary, new Date("2026-10-26T10:00:00Z"));
  assert.match(csv, /# Total Attributed Revenue: ETB 0.00/);
  assert.match(csv, /# Total Verified Conversions: 0/);
  assert.ok(csv.includes("Campaign Name,Slug,Promo Code"));
});

test("generateAuditCSV produces chronologically structured audit ledger", () => {
  const auditEntries = [
    {
      timestamp: "2026-10-26T09:15:00.000Z",
      recordType: "EVENT",
      campaignName: "Meskel Fest",
      promoCode: "MESKEL50",
      channelOrAction: "TELEGRAM_CLICK",
      visitorOrReceiptId: "vis-1234-uuid",
      amountETB: null,
      staffName: null,
      notes: "Referral from Telegram channel",
    },
    {
      timestamp: "2026-10-26T09:30:00.000Z",
      recordType: "SALE",
      campaignName: "Meskel Fest",
      promoCode: "MESKEL50",
      channelOrAction: "IN_STORE_REDEMPTION",
      visitorOrReceiptId: "REC-90812",
      amountETB: 3500.0,
      staffName: "Dawit Cashier",
      notes: "Cash payment, verified by manager",
    },
  ];

  const csv = generateAuditCSV("Bole Roasters", auditEntries, new Date("2026-10-26T10:00:00Z"));

  assert.match(csv, /# EthioLink Omnichannel Audit & Redemption Ledger - Bole Roasters/);
  assert.match(csv, /Timestamp,Record Type,Campaign Name,Promo Code,Channel \/ Action,Identifier \/ Receipt,Amount \(ETB\),Cashier \/ Staff,Notes/);
  assert.match(csv, /2026-10-26T09:15:00.000Z,EVENT,Meskel Fest,MESKEL50,TELEGRAM_CLICK,vis-1234-uuid,,,Referral from Telegram channel/);
  assert.match(csv, /2026-10-26T09:30:00.000Z,SALE,Meskel Fest,MESKEL50,IN_STORE_REDEMPTION,REC-90812,3500.00,Dawit Cashier,"Cash payment, verified by manager"/);
});

test("generateAuditCSV handles empty audit entries safely", () => {
  const csv = generateAuditCSV("Empty Brand", [], new Date("2026-10-26T10:00:00Z"));
  assert.match(csv, /# Total Records: 0/);
  assert.ok(csv.includes("Timestamp,Record Type,Campaign Name"));
});

test("formatReportTimestamp outputs formatted string or fallback", () => {
  const d = new Date("2026-10-26T12:30:00Z");
  const str = formatReportTimestamp(d);
  assert.ok(str.includes("2026"));
  assert.ok(str.includes("12:30"));
});
