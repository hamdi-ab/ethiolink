import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateCohortBenchmarks,
  sortCampaigns,
  compareTwoCampaigns,
  getChannelBreakdown,
} from "../src/lib/comparison.ts";
import { generateSummaryCSV, generateAuditCSV } from "../src/lib/reports.ts";
import { CampaignComparisonMatrix } from "../src/components/brand/CampaignComparisonMatrix.tsx";

const mockCampaigns = [
  {
    campaignId: "camp-bole",
    campaignName: "Bole Launch Special",
    slug: "bole-launch",
    promoCode: "BOLE20",
    status: "ACTIVE",
    startDate: "2026-10-01T00:00:00.000Z",
    endDate: null,
    pageViews: 1000,
    uniqueVisitors: 800,
    telegramClicks: 300,
    callClicks: 100,
    mapClicks: 50,
    copyCodeClicks: 50,
    totalClicks: 500, // 50% CTR
    salesCount: 40,
    totalRevenueETB: 120000, // AOV = 3000
    clickThroughRate: 50.0,
    salesConversionRate: 4.0, // Top CVR
    aovETB: 3000.0,
    creators: [{ name: "Abel Tesfaye", telegramUsername: "abel_eth" }],
  },
  {
    campaignId: "camp-arat-kilo",
    campaignName: "Arat Kilo Campus Blast",
    slug: "arat-kilo",
    promoCode: "STUDENT10",
    status: "ACTIVE",
    startDate: "2026-10-05T00:00:00.000Z",
    endDate: null,
    pageViews: 2500,
    uniqueVisitors: 1900,
    telegramClicks: 800,
    callClicks: 100,
    mapClicks: 50,
    copyCodeClicks: 150,
    totalClicks: 1100, // 44% CTR
    salesCount: 50,
    totalRevenueETB: 200000, // Top Revenue, AOV = 4000 (Top AOV)
    clickThroughRate: 44.0,
    salesConversionRate: 2.0,
    aovETB: 4000.0,
    creators: [{ name: "Sara Biruk", telegramUsername: null }],
  },
  {
    campaignId: "camp-piassa",
    campaignName: "Piassa Heritage Promo",
    slug: "piassa-heritage",
    promoCode: "PIASSA15",
    status: "ACTIVE",
    startDate: "2026-10-10T00:00:00.000Z",
    endDate: null,
    pageViews: 600,
    uniqueVisitors: 450,
    telegramClicks: 200,
    callClicks: 120,
    mapClicks: 40,
    copyCodeClicks: 20,
    totalClicks: 380,
    salesCount: 15,
    totalRevenueETB: 30000, // AOV = 2000
    clickThroughRate: 63.3, // Top CTR
    salesConversionRate: 2.5,
    aovETB: 2000.0,
    creators: [],
  },
];

test("calculateCohortBenchmarks identifies standout performers and cohort averages (PRD FR-031)", () => {
  const benchmarks = calculateCohortBenchmarks(mockCampaigns);

  // Top CVR
  assert.equal(benchmarks.topConvertingCampaign?.campaignId, "camp-bole");
  assert.equal(benchmarks.topConvertingCampaign?.salesConversionRate, 4.0);

  // Revenue Leader
  assert.equal(benchmarks.revenueLeader?.campaignId, "camp-arat-kilo");
  assert.equal(benchmarks.revenueLeader?.totalRevenueETB, 200000);

  // Highest AOV
  assert.equal(benchmarks.highestAovCampaign?.campaignId, "camp-arat-kilo");
  assert.equal(benchmarks.highestAovCampaign?.aovETB, 4000.0);

  // Highest CTR
  assert.equal(benchmarks.highestCtrCampaign?.campaignId, "camp-piassa");
  assert.equal(benchmarks.highestCtrCampaign?.clickThroughRate, 63.3);

  // Aggregated cohort totals
  assert.equal(benchmarks.totalCampaigns, 3);
  assert.equal(benchmarks.totalPageViews, 4100);
  assert.equal(benchmarks.totalClicks, 1980);
  assert.equal(benchmarks.totalSalesCount, 105);
  assert.equal(benchmarks.totalRevenueETB, 350000);

  // Cohort portfolio averages
  // CVR sum: 4.0 + 2.0 + 2.5 = 8.5 / 3 = 2.8%
  assert.equal(benchmarks.averageConversionRate, 2.8);
  // CTR sum: 50.0 + 44.0 + 63.3 = 157.3 / 3 = 52.4%
  assert.equal(benchmarks.averageClickThroughRate, 52.4);
  // AOV sum: 3000 + 4000 + 2000 = 9000 / 3 = 3000.0
  assert.equal(benchmarks.averageAovETB, 3000.0);
});

test("calculateCohortBenchmarks safely handles empty campaign cohorts", () => {
  const empty = calculateCohortBenchmarks([]);
  assert.equal(empty.totalCampaigns, 0);
  assert.equal(empty.topConvertingCampaign, null);
  assert.equal(empty.revenueLeader, null);
  assert.equal(empty.highestAovCampaign, null);
  assert.equal(empty.highestCtrCampaign, null);
  assert.equal(empty.totalRevenueETB, 0);
  assert.equal(empty.averageConversionRate, 0);
});

test("sortCampaigns sorts across multiple metrics with deterministic tie-breaking", () => {
  // Sort by revenue descending
  const byRevenueDesc = sortCampaigns(mockCampaigns, "revenue", "desc");
  assert.equal(byRevenueDesc[0].campaignId, "camp-arat-kilo"); // 200,000
  assert.equal(byRevenueDesc[1].campaignId, "camp-bole"); // 120,000
  assert.equal(byRevenueDesc[2].campaignId, "camp-piassa"); // 30,000

  // Sort by revenue ascending
  const byRevenueAsc = sortCampaigns(mockCampaigns, "revenue", "asc");
  assert.equal(byRevenueAsc[0].campaignId, "camp-piassa");
  assert.equal(byRevenueAsc[2].campaignId, "camp-arat-kilo");

  // Sort by CVR descending
  const byCvrDesc = sortCampaigns(mockCampaigns, "conversionRate", "desc");
  assert.equal(byCvrDesc[0].campaignId, "camp-bole"); // 4.0%
  assert.equal(byCvrDesc[1].campaignId, "camp-piassa"); // 2.5%
  assert.equal(byCvrDesc[2].campaignId, "camp-arat-kilo"); // 2.0%

  // Sort by CTR descending
  const byCtrDesc = sortCampaigns(mockCampaigns, "clickThroughRate", "desc");
  assert.equal(byCtrDesc[0].campaignId, "camp-piassa"); // 63.3%
  assert.equal(byCtrDesc[1].campaignId, "camp-bole"); // 50.0%
  assert.equal(byCtrDesc[2].campaignId, "camp-arat-kilo"); // 44.0%

  // Sort by orders descending
  const byOrdersDesc = sortCampaigns(mockCampaigns, "salesCount", "desc");
  assert.equal(byOrdersDesc[0].campaignId, "camp-arat-kilo"); // 50 orders

  // Sort by page views descending
  const byViewsDesc = sortCampaigns(mockCampaigns, "pageViews", "desc");
  assert.equal(byViewsDesc[0].campaignId, "camp-arat-kilo"); // 2500 views
});

test("compareTwoCampaigns computes detailed head-to-head metric differences and channel breakdowns", () => {
  const comparison = compareTwoCampaigns(mockCampaigns[0], mockCampaigns[1]);

  assert.equal(comparison.campaignA.campaignId, "camp-bole");
  assert.equal(comparison.campaignB.campaignId, "camp-arat-kilo");

  // Check metrics array
  const cvrMetric = comparison.metrics.find((m) => m.key === "salesConversionRate");
  assert.ok(cvrMetric);
  assert.equal(cvrMetric.valA, 4.0);
  assert.equal(cvrMetric.valB, 2.0);
  assert.equal(cvrMetric.diff, 2.0);
  assert.equal(cvrMetric.leader, "A");

  const revMetric = comparison.metrics.find((m) => m.key === "totalRevenueETB");
  assert.ok(revMetric);
  assert.equal(revMetric.valA, 120000);
  assert.equal(revMetric.valB, 200000);
  assert.equal(revMetric.diff, -80000);
  assert.equal(revMetric.leader, "B");

  // Check channel breakdown calculations
  assert.equal(comparison.channelsA.telegramPct, 60); // 300 / 500 = 60%
  assert.equal(comparison.channelsA.callPct, 20); // 100 / 500 = 20%
  assert.equal(comparison.channelsA.mapPct, 10); // 50 / 500 = 10%
  assert.equal(comparison.channelsA.copyPct, 10); // 50 / 500 = 10%
});

test("getChannelBreakdown handles zero total clicks safely without NaN", () => {
  const zeroMetrics = {
    pageViews: 100,
    uniqueVisitors: 50,
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

  const channels = getChannelBreakdown(zeroMetrics);
  assert.equal(channels.telegramPct, 0);
  assert.equal(channels.callPct, 0);
  assert.equal(channels.mapPct, 0);
  assert.equal(channels.copyPct, 0);
});

test("generateSummaryCSV includes explicit attribution methodology disclaimers (PRD FR-025 / FR-029 / FR-030)", () => {
  const summary = {
    pageViews: 4100,
    uniqueVisitors: 3150,
    telegramClicks: 1300,
    callClicks: 320,
    mapClicks: 140,
    copyCodeClicks: 220,
    totalClicks: 1980,
    salesCount: 105,
    totalRevenueETB: 350000.0,
    clickThroughRate: 48.3,
    salesConversionRate: 2.6,
    aovETB: 3333.33,
  };

  const csv = generateSummaryCSV("Bole Roasters", mockCampaigns, summary);

  // Check PRD FR-025 / FR-029 disclaimer lines
  assert.match(csv, /# Attribution Methodology & Limitations \(PRD FR-025 \/ FR-029\):/);
  assert.match(csv, /# - Sales reflect merchant-recorded in-store redemptions, not independently processed bank\/card transactions\./);
  assert.match(csv, /# - Event journeys represent aggregate touchpoints, not 100% deterministic individual consumer journeys\./);
  assert.match(csv, /# - Reported revenue equals gross recorded sales \(PRD FR-030\) and does not represent net merchant profit\./);
});

test("generateAuditCSV includes explicit attribution methodology disclaimers (PRD FR-025 / FR-029)", () => {
  const entries = [
    {
      timestamp: "2026-10-28 10:15:00 UTC",
      recordType: "SALE",
      campaignName: "Bole Launch Special",
      promoCode: "BOLE20",
      channelOrAction: "IN_STORE_POS",
      visitorOrReceiptId: "REC-9941",
      amountETB: 1500,
      staffName: "Tigist Haile",
      notes: "Cash payment",
      isVoided: false,
      voidReason: null,
    },
  ];

  const csv = generateAuditCSV("Bole Roasters", entries);

  assert.match(csv, /# Attribution Methodology & Limitations \(PRD FR-025 \/ FR-029\):/);
  assert.match(csv, /# - Audit entries represent timestamped telemetry actions and merchant-recorded in-store POS redemptions\./);
  assert.match(csv, /# - Telemetry touchpoints capture aggregate interaction intent, not exclusive single-touch causality\./);
});

test("CampaignComparisonMatrix component exports successfully for React client consumption", () => {
  assert.equal(typeof CampaignComparisonMatrix, "function");
});
