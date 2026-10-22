import test from "node:test";
import assert from "node:assert/strict";
import { calculateFunnelMetrics } from "../src/lib/analytics.ts";
import { createSessionToken } from "../src/lib/auth.ts";
import { GET as getAnalytics } from "../src/app/api/analytics/route.ts";
import { NextRequest } from "next/server";

test("calculateFunnelMetrics handles empty event and sale streams safely", () => {
  const result = calculateFunnelMetrics([], []);

  assert.equal(result.pageViews, 0);
  assert.equal(result.uniqueVisitors, 0);
  assert.equal(result.totalClicks, 0);
  assert.equal(result.salesCount, 0);
  assert.equal(result.totalRevenueETB, 0);
  assert.equal(result.clickThroughRate, 0);
  assert.equal(result.salesConversionRate, 0);
  assert.equal(result.aovETB, 0);
});

test("calculateFunnelMetrics accurately counts unique visitors and action taps", () => {
  const mockEvents = [
    { eventType: "PAGE_VIEW", visitorId: "visitor-A" },
    { eventType: "PAGE_VIEW", visitorId: "visitor-B" },
    { eventType: "PAGE_VIEW", visitorId: "visitor-A" }, // Repeat visit
    { eventType: "PAGE_VIEW", visitorId: "visitor-C" },
    { eventType: "TELEGRAM_CLICK", visitorId: "visitor-A" },
    { eventType: "CALL_CLICK", visitorId: "visitor-B" },
    { eventType: "MAP_CLICK", visitorId: "visitor-B" },
    { eventType: "COPY_CODE", visitorId: "visitor-C" },
  ];

  const mockSales = [
    { amountETB: 450.5 },
    { amountETB: 549.5 },
  ];

  const result = calculateFunnelMetrics(mockEvents, mockSales);

  assert.equal(result.pageViews, 4, "Must have 4 page view events");
  assert.equal(result.uniqueVisitors, 3, "Must have 3 unique visitors (A, B, C)");
  assert.equal(result.telegramClicks, 1);
  assert.equal(result.callClicks, 1);
  assert.equal(result.mapClicks, 1);
  assert.equal(result.copyCodeClicks, 1);
  assert.equal(result.totalClicks, 4);
  assert.equal(result.salesCount, 2);
  assert.equal(result.totalRevenueETB, 1000.0, "Sum of 450.50 + 549.50 must be exactly 1000.00");
  assert.equal(result.aovETB, 500.0, "AOV must be 1000 / 2 = 500.00");
  assert.equal(result.clickThroughRate, 100.0, "4 clicks / 4 views = 100.0%");
  assert.equal(result.salesConversionRate, 50.0, "2 sales / 4 views = 50.0%");
});

test("calculateFunnelMetrics eliminates floating-point drift on decimal currency additions", () => {
  // Test standard JavaScript float error case: 0.1 + 0.2 !== 0.3
  const sales = [
    { amountETB: 0.1 },
    { amountETB: 0.2 },
    { amountETB: 199.99 },
    { amountETB: 0.01 },
  ];

  const result = calculateFunnelMetrics([], sales);
  assert.equal(result.totalRevenueETB, 200.3, "Must equal exactly 200.30 ETB without float rounding bugs");
});

test("GET /api/analytics requires authentication", async () => {
  const req = new NextRequest("http://localhost:3000/api/analytics");
  const res = await getAnalytics(req);
  assert.equal(res.status, 401);
});

test("GET /api/analytics rejects Staff members with 403 Forbidden", async () => {
  const staffToken = createSessionToken({
    userId: "usr_staff",
    name: "Cashier",
    phone: "0911000000",
    role: "STAFF",
    brandId: "brd_1",
  });

  const req = new NextRequest("http://localhost:3000/api/analytics", {
    headers: {
      Cookie: `ethiolink_session=${staffToken}`,
    },
  });

  const res = await getAnalytics(req);
  assert.equal(res.status, 403, "Staff must be strictly forbidden from business financial analytics");
});
