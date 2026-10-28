import test from "node:test";
import assert from "node:assert/strict";
import { calculateFunnelMetrics } from "../src/lib/analytics.ts";
import { calculatePlatformTotals, calculatePlatformAnalytics } from "../src/lib/admin.ts";
import { generateAuditCSV } from "../src/lib/reports.ts";
import { createSessionToken } from "../src/lib/auth.ts";
import { PATCH as voidSale } from "../src/app/api/sales/[id]/route.ts";
import { NextRequest } from "next/server";

test("calculateFunnelMetrics excludes voided sales from revenue, counts, CTR, and AOV", () => {
  const events = [
    { eventType: "PAGE_VIEW", visitorId: "v1" },
    { eventType: "PAGE_VIEW", visitorId: "v2" },
    { eventType: "TELEGRAM_CLICK", visitorId: "v1" },
    { eventType: "COPY_CODE", visitorId: "v2" },
  ];

  const sales = [
    { amountETB: 1200, isVoided: false },
    { amountETB: 800, isVoided: true }, // Should be excluded from revenue and count
    { amountETB: 600, isVoided: false },
  ];

  const metrics = calculateFunnelMetrics(events, sales);

  // Active sales count is 2 (1200 + 600), voided 800 is skipped
  assert.equal(metrics.salesCount, 2);
  assert.equal(metrics.totalRevenueETB, 1800);
  assert.equal(metrics.aovETB, 900); // 1800 / 2
  assert.equal(metrics.salesConversionRate, 100); // 2 sales / 2 page views = 100%

  // When all sales are voided
  const allVoidedSales = [
    { amountETB: 500, isVoided: true },
    { amountETB: 1500, isVoided: true },
  ];
  const voidMetrics = calculateFunnelMetrics(events, allVoidedSales);
  assert.equal(voidMetrics.salesCount, 0);
  assert.equal(voidMetrics.totalRevenueETB, 0);
  assert.equal(voidMetrics.aovETB, 0);
  assert.equal(voidMetrics.salesConversionRate, 0);
});

test("calculatePlatformTotals excludes voided transactions from gross revenue and sales counts", () => {
  const campaigns = [{ status: "ACTIVE" }, { status: "PAUSED" }];
  const sales = [
    { amountETB: 5000, isVoided: false },
    { amountETB: 3000, isVoided: true },
    { amountETB: 2000, isVoided: false },
  ];

  const totals = calculatePlatformTotals(3, 10, 5, campaigns, 100, sales);

  assert.equal(totals.totalSalesCount, 2, "Only non-voided sales must be counted");
  assert.equal(totals.totalRevenueETB, 7000, "Voided amounts must not be added to total revenue");
});

test("calculatePlatformAnalytics excludes voided transactions from conversions and leaderboards", () => {
  const events = [
    { eventType: "PAGE_VIEW", visitorId: "vis-1" },
    { eventType: "TELEGRAM_CLICK", visitorId: "vis-1" },
  ];

  const sales = [
    {
      id: "sale-1",
      amountETB: 1500,
      campaignId: "c1",
      isVoided: false,
      campaign: { id: "c1", name: "Bole Launch", promoCode: "BOLE20", brand: { name: "Roasters" } },
    },
    {
      id: "sale-2",
      amountETB: 9999,
      campaignId: "c1",
      isVoided: true, // Should be ignored
      campaign: { id: "c1", name: "Bole Launch", promoCode: "BOLE20", brand: { name: "Roasters" } },
    },
  ];

  const creators = [
    {
      id: "cr-1",
      user: { name: "Abebe" },
      assignments: [{ campaignId: "c1" }],
    },
  ];

  const analytics = calculatePlatformAnalytics(events, sales, creators);

  assert.equal(analytics.funnel.recordedSales, 1);
  assert.equal(analytics.funnel.totalRevenueETB, 1500);
  assert.equal(analytics.topCampaigns[0].revenueETB, 1500);
  assert.equal(analytics.topCampaigns[0].salesCount, 1);
  assert.equal(analytics.topCreators[0].attributedRevenueETB, 1500);
});

test("generateAuditCSV formats void status and reasons into audit ledger rows", () => {
  const entries = [
    {
      timestamp: "2026-10-28T09:00:00.000Z",
      recordType: "SALE",
      campaignName: "Meskel Fest",
      promoCode: "MESKEL50",
      channelOrAction: "IN_STORE_REDEMPTION",
      visitorOrReceiptId: "REC-1001",
      amountETB: 2500,
      staffName: "Tewodros Cashier",
      notes: "Telebirr transaction",
      isVoided: false,
    },
    {
      timestamp: "2026-10-28T09:15:00.000Z",
      recordType: "SALE",
      campaignName: "Meskel Fest",
      promoCode: "MESKEL50",
      channelOrAction: "IN_STORE_REDEMPTION",
      visitorOrReceiptId: "REC-1002",
      amountETB: 1800,
      staffName: "Tewodros Cashier",
      notes: "Cash payment",
      isVoided: true,
      voidReason: "Customer returned defective packaging",
    },
  ];

  const csv = generateAuditCSV("Tomoca Coffee", entries, new Date("2026-10-28T10:00:00Z"));

  // Verify headers include void columns
  assert.match(csv, /Void Status,Void Reason/);
  // Verify valid sale row has VALID
  assert.match(csv, /REC-1001,2500.00,Tewodros Cashier,Telebirr transaction,VALID,/);
  // Verify voided sale row has VOIDED and the reason
  assert.match(csv, /REC-1002,1800.00,Tewodros Cashier,Cash payment,VOIDED,Customer returned defective packaging/);
});

test("PATCH /api/sales/[id] enforces authentication and strict role authorization", async () => {
  const routeParams = { params: Promise.resolve({ id: "sale_123" }) };

  // 1. Unauthenticated request
  const unauthReq = new NextRequest("http://localhost:3000/api/sales/sale_123", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason: "Customer return" }),
  });
  const unauthRes = await voidSale(unauthReq, routeParams);
  assert.equal(unauthRes.status, 401, "Unauthenticated request must be rejected with 401");

  // 2. Staff user attempting to void a transaction (Staff tampering protection)
  const staffToken = createSessionToken({
    userId: "usr_staff",
    name: "Cashier",
    phone: "0911112233",
    role: "STAFF",
    brandId: "brd_1",
  });
  const staffReq = new NextRequest("http://localhost:3000/api/sales/sale_123", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: `ethiolink_session=${staffToken}`,
    },
    body: JSON.stringify({ reason: "Cashier keying error" }),
  });
  const staffRes = await voidSale(staffReq, routeParams);
  assert.equal(staffRes.status, 403, "Staff role must be prohibited from voiding sales (403)");

  // 3. Creator user attempting to void a transaction
  const creatorToken = createSessionToken({
    userId: "usr_creator",
    name: "Influencer",
    phone: "0922334455",
    role: "CREATOR",
    brandId: "brd_1",
  });
  const creatorReq = new NextRequest("http://localhost:3000/api/sales/sale_123", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: `ethiolink_session=${creatorToken}`,
    },
    body: JSON.stringify({ reason: "Creator dispute" }),
  });
  const creatorRes = await voidSale(creatorReq, routeParams);
  assert.equal(creatorRes.status, 403, "Creator role must be prohibited from voiding sales (403)");
});

test("PATCH /api/sales/[id] validates required void reason", async () => {
  const ownerToken = createSessionToken({
    userId: "usr_owner",
    name: "Brand Owner",
    phone: "0911001122",
    role: "OWNER",
    brandId: "brd_1",
  });
  const routeParams = { params: Promise.resolve({ id: "sale_123" }) };

  // Missing reason
  const noReasonReq = new NextRequest("http://localhost:3000/api/sales/sale_123", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: `ethiolink_session=${ownerToken}`,
    },
    body: JSON.stringify({}),
  });
  const noReasonRes = await voidSale(noReasonReq, routeParams);
  assert.equal(noReasonRes.status, 400);

  // Short reason (< 3 chars)
  const shortReasonReq = new NextRequest("http://localhost:3000/api/sales/sale_123", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: `ethiolink_session=${ownerToken}`,
    },
    body: JSON.stringify({ reason: "no" }),
  });
  const shortReasonRes = await voidSale(shortReasonReq, routeParams);
  assert.equal(shortReasonRes.status, 400);
});
