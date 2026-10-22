import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { createSessionToken } from "../src/lib/auth.ts";
import {
  getSystemHealthDiagnostics,
  calculatePlatformTotals,
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
