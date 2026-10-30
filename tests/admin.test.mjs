import test from "node:test";
import assert from "node:assert/strict";

process.env.NODE_ENV = "test";
import { NextRequest } from "next/server";
import { createSessionToken } from "../src/lib/auth.ts";
import {
  getSystemHealthDiagnostics,
  calculatePlatformTotals,
  calculatePlatformAnalytics,
} from "../src/lib/admin.ts";
import { GET as getAdminOverview } from "../src/app/api/admin/overview/route.ts";
import { GET as getAdminAudit } from "../src/app/api/admin/audit/route.ts";

test("getSystemHealthDiagnostics gathers runtime metrics and memory stats", async () => {
  const health = await getSystemHealthDiagnostics();

  assert.ok(health);
  assert.ok(["healthy", "degraded", "unreachable"].includes(health.status));
  assert.equal(typeof health.dbLatencyMs, "number");
  assert.ok(health.uptimeSeconds >= 0);
  assert.ok(health.nodeVersion.startsWith("v"));
  assert.ok(health.memory.heapUsedMB > 0);
  assert.ok(health.memory.heapTotalMB >= health.memory.heapUsedMB);
});

test("calculatePlatformTotals aggregates platform metrics with float-drift protection", () => {
  const brandCount = 5;
  const userCount = 12;
  const creatorCount = 8;
  const campaigns = [
    { status: "ACTIVE" },
    { status: "ACTIVE" },
    { status: "PAUSED" },
    { status: "COMPLETED" },
  ];
  const eventCount = 1450;
  const sales = [
    { amountETB: 4500.1 },
    { amountETB: 2499.9 },
    { amountETB: 3000.0 },
  ];

  const totals = calculatePlatformTotals(
    brandCount,
    userCount,
    creatorCount,
    campaigns,
    eventCount,
    sales
  );

  assert.equal(totals.totalBrands, 5);
  assert.equal(totals.totalUsers, 12);
  assert.equal(totals.totalCreators, 8);
  assert.equal(totals.totalCampaigns, 4);
  assert.equal(totals.activeCampaigns, 2);
  assert.equal(totals.totalEvents, 1450);
  assert.equal(totals.totalSalesCount, 3);
  assert.equal(
    totals.totalRevenueETB,
    10000.0,
    "4500.10 + 2499.90 + 3000.00 must sum exactly to 10000.00 ETB"
  );
});

test("calculatePlatformAnalytics handles empty event and sales streams safely", () => {
  const analytics = calculatePlatformAnalytics([], []);

  assert.equal(analytics.funnel.pageViews, 0);
  assert.equal(analytics.funnel.uniqueVisitors, 0);
  assert.equal(analytics.funnel.actionTaps, 0);
  assert.equal(analytics.funnel.recordedSales, 0);
  assert.equal(analytics.funnel.totalRevenueETB, 0);
  assert.equal(analytics.funnel.averageOrderValueETB, 0);
  assert.equal(analytics.funnel.visitToActionRate, 0);
  assert.equal(analytics.funnel.actionToSaleRate, 0);
  assert.equal(analytics.funnel.overallConversionRate, 0);
  assert.equal(analytics.funnel.channels.total, 0);
  assert.deepEqual(analytics.topCampaigns, []);
  assert.deepEqual(analytics.topCreators, []);
});

test("calculatePlatformAnalytics computes funnel rates, channel distribution, and top performers", () => {
  const mockEvents = [
    { eventType: "PAGE_VIEW", visitorId: "vis_1" },
    { eventType: "PAGE_VIEW", visitorId: "vis_1" }, // duplicate visitor
    { eventType: "PAGE_VIEW", visitorId: "vis_2" },
    { eventType: "PAGE_VIEW", visitorId: "vis_3" },
    { eventType: "PAGE_VIEW", visitorId: "vis_4" },
    { eventType: "ACTION_TAP", visitorId: "vis_1", metadata: { channel: "TELEGRAM" } },
    { eventType: "ACTION_TAP", visitorId: "vis_2", metadata: { channel: "PHONE" } },
    { eventType: "ACTION_TAP", visitorId: "vis_3", metadata: JSON.stringify({ channel: "MAP" }) },
    { eventType: "ACTION_TAP", visitorId: "vis_4", metadata: { channel: "PROMO_CODE" } },
  ];

  const mockSales = [
    {
      id: "sale_1",
      amountETB: 1200.5,
      campaignId: "camp_1",
      campaign: { id: "camp_1", name: "Tomoca Roast", promoCode: "TOMOCA", brand: { name: "Tomoca Coffee" } },
    },
    {
      id: "sale_2",
      amountETB: 800.5,
      campaignId: "camp_1",
      campaign: { id: "camp_1", name: "Tomoca Roast", promoCode: "TOMOCA", brand: { name: "Tomoca Coffee" } },
    },
    {
      id: "sale_3",
      amountETB: 1500.0,
      campaignId: "camp_2",
      campaign: { id: "camp_2", name: "Bole Leather Bag", promoCode: "BOLE", brand: { name: "Bole Leather" } },
    },
  ];

  const mockCreators = [
    {
      id: "cr_1",
      user: { name: "Helen Addis" },
      telegramUsername: "helen_addis",
      assignments: [{ campaignId: "camp_1" }],
    },
    {
      id: "cr_2",
      user: { name: "Abel Tech" },
      telegramUsername: "abel_tech",
      assignments: [{ campaignId: "camp_2" }],
    },
  ];

  const analytics = calculatePlatformAnalytics(mockEvents, mockSales, mockCreators);

  assert.equal(analytics.funnel.pageViews, 5);
  assert.equal(analytics.funnel.uniqueVisitors, 4);
  assert.equal(analytics.funnel.actionTaps, 4);
  assert.equal(analytics.funnel.recordedSales, 3);
  assert.equal(analytics.funnel.totalRevenueETB, 3501.0);
  assert.equal(analytics.funnel.averageOrderValueETB, 1167.0);

  // Conversion rates
  assert.equal(analytics.funnel.visitToActionRate, 100.0); // 4 actions / 4 unique visitors * 100
  assert.equal(analytics.funnel.actionToSaleRate, 75.0); // 3 sales / 4 actions * 100
  assert.equal(analytics.funnel.overallConversionRate, 75.0); // 3 sales / 4 visitors * 100

  // Channels
  assert.equal(analytics.funnel.channels.telegram, 1);
  assert.equal(analytics.funnel.channels.phone, 1);
  assert.equal(analytics.funnel.channels.map, 1);
  assert.equal(analytics.funnel.channels.promo, 1);
  assert.equal(analytics.funnel.channels.total, 4);

  // Top campaigns ranked by revenue
  assert.equal(analytics.topCampaigns.length, 2);
  assert.equal(analytics.topCampaigns[0].id, "camp_1"); // 1200.5 + 800.5 = 2001.0 ETB
  assert.equal(analytics.topCampaigns[0].revenueETB, 2001.0);
  assert.equal(analytics.topCampaigns[1].id, "camp_2"); // 1500.0 ETB

  // Top creators ranked by attributed revenue
  assert.equal(analytics.topCreators.length, 2);
  assert.equal(analytics.topCreators[0].name, "Helen Addis");
  assert.equal(analytics.topCreators[0].attributedRevenueETB, 2001.0);
  assert.equal(analytics.topCreators[1].name, "Abel Tech");
  assert.equal(analytics.topCreators[1].attributedRevenueETB, 1500.0);
});

test("calculatePlatformAnalytics processes Prisma schema EventTypes directly", () => {
  const schemaEvents = [
    { eventType: "PAGE_VIEW", visitorId: "u1" },
    { eventType: "PAGE_VIEW", visitorId: "u2" },
    { eventType: "TELEGRAM_CLICK", visitorId: "u1" },
    { eventType: "CALL_CLICK", visitorId: "u1" },
    { eventType: "MAP_CLICK", visitorId: "u2" },
    { eventType: "COPY_CODE", visitorId: "u2" },
  ];

  const analytics = calculatePlatformAnalytics(schemaEvents, []);

  assert.equal(analytics.funnel.pageViews, 2);
  assert.equal(analytics.funnel.uniqueVisitors, 2);
  assert.equal(analytics.funnel.actionTaps, 4);
  assert.equal(analytics.funnel.channels.telegram, 1);
  assert.equal(analytics.funnel.channels.phone, 1);
  assert.equal(analytics.funnel.channels.map, 1);
  assert.equal(analytics.funnel.channels.promo, 1);
  assert.equal(analytics.funnel.channels.total, 4);
  assert.equal(analytics.funnel.visitToActionRate, 200.0); // 4 actions / 2 visitors * 100
});

test("GET /api/admin/overview strictly enforces ADMIN role authorization", async () => {
  // 1. Unauthenticated request
  const reqUnauth = new NextRequest("http://localhost:3000/api/admin/overview");
  const resUnauth = await getAdminOverview(reqUnauth);
  assert.equal(resUnauth.status, 401, "Unauthenticated access must return 401");

  // 2. Staff role access forbidden
  const staffToken = createSessionToken({
    userId: "usr_staff_test",
    name: "Cashier Staff",
    phone: "0911223344",
    role: "STAFF",
    brandId: "brd_1",
  });
  const reqStaff = new NextRequest("http://localhost:3000/api/admin/overview", {
    headers: { Cookie: `ethiolink_session=${staffToken}` },
  });
  const resStaff = await getAdminOverview(reqStaff);
  assert.equal(resStaff.status, 403, "Staff role must be rejected with 403");

  // 3. Brand Owner role access forbidden
  const ownerToken = createSessionToken({
    userId: "usr_owner_test",
    name: "Brand Owner",
    phone: "0922334455",
    role: "OWNER",
    brandId: "brd_1",
  });
  const reqOwner = new NextRequest("http://localhost:3000/api/admin/overview", {
    headers: { Cookie: `ethiolink_session=${ownerToken}` },
  });
  const resOwner = await getAdminOverview(reqOwner);
  assert.equal(resOwner.status, 403, "Brand Owner role must be rejected with 403");

  // 4. Creator role access forbidden
  const creatorToken = createSessionToken({
    userId: "usr_creator_test",
    name: "Influencer",
    phone: "0933445566",
    role: "CREATOR",
  });
  const reqCreator = new NextRequest("http://localhost:3000/api/admin/overview", {
    headers: { Cookie: `ethiolink_session=${creatorToken}` },
  });
  const resCreator = await getAdminOverview(reqCreator);
  assert.equal(resCreator.status, 403, "Creator role must be rejected with 403");
});

test("GET /api/admin/audit strictly enforces ADMIN role authorization", async () => {
  // 1. Unauthenticated
  const reqUnauth = new NextRequest("http://localhost:3000/api/admin/audit");
  const resUnauth = await getAdminAudit(reqUnauth);
  assert.equal(resUnauth.status, 401);

  // 2. Staff rejected
  const staffToken = createSessionToken({
    userId: "usr_staff_audit",
    name: "Staff",
    phone: "0911000000",
    role: "STAFF",
  });
  const reqStaff = new NextRequest("http://localhost:3000/api/admin/audit", {
    headers: { Cookie: `ethiolink_session=${staffToken}` },
  });
  const resStaff = await getAdminAudit(reqStaff);
  assert.equal(resStaff.status, 403);
});
