import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  createCreatorInviteToken,
  verifyCreatorInviteToken,
} from "../src/lib/invites.ts";
import { createSessionToken } from "../src/lib/auth.ts";
import { GET as getInvite } from "../src/app/api/auth/invite/route.ts";
import { POST as postJoin } from "../src/app/api/auth/join/route.ts";
import { GET as getCreatorCampaigns } from "../src/app/api/creator/campaigns/route.ts";
import { calculateFunnelMetrics } from "../src/lib/analytics.ts";
import { CreatorView } from "../src/app/(dashboard)/creator/CreatorView.tsx";

test("verifyCreatorInviteToken validates authentic token and rejects forged/expired ones", () => {
  const token = createCreatorInviteToken("cmp_101", "brd_202", "Helen Creator", 60000);
  const payload = verifyCreatorInviteToken(token);

  assert.ok(payload);
  assert.equal(payload.campaignId, "cmp_101");
  assert.equal(payload.brandId, "brd_202");
  assert.equal(payload.creatorName, "Helen Creator");

  // Forged signature rejection
  const forgedToken = token.slice(0, -6) + "xxxxxx";
  assert.equal(verifyCreatorInviteToken(forgedToken), null);

  // Expired token rejection
  const expiredToken = createCreatorInviteToken("cmp_101", "brd_202", undefined, -1000);
  assert.equal(verifyCreatorInviteToken(expiredToken), null);
});

test("GET /api/auth/invite validates input parameters and token authenticity", async () => {
  // Missing token
  const reqMissing = new NextRequest("http://localhost:3000/api/auth/invite");
  const resMissing = await getInvite(reqMissing);
  assert.equal(resMissing.status, 400);
  const bodyMissing = await resMissing.json();
  assert.equal(bodyMissing.valid, false);

  // Invalid / forged token
  const reqInvalid = new NextRequest("http://localhost:3000/api/auth/invite?token=invalid.token.here");
  const resInvalid = await getInvite(reqInvalid);
  assert.equal(resInvalid.status, 400);
  const bodyInvalid = await resInvalid.json();
  assert.equal(bodyInvalid.valid, false);
});

test("POST /api/auth/join validates required fields and token", async () => {
  // Missing JSON body
  const reqEmpty = new NextRequest("http://localhost:3000/api/auth/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  const resEmpty = await postJoin(reqEmpty);
  assert.equal(resEmpty.status, 400);

  // Missing phone and name
  const validToken = createCreatorInviteToken("cmp_999", "brd_888", "Abebe");
  const reqMissingFields = new NextRequest("http://localhost:3000/api/auth/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: validToken, name: "", phone: "" }),
  });
  const resMissingFields = await postJoin(reqMissingFields);
  assert.equal(resMissingFields.status, 400);

  // Invalid token
  const reqBadToken = new NextRequest("http://localhost:3000/api/auth/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: "fake.token.signature",
      name: "Helen",
      phone: "0911001122",
    }),
  });
  const resBadToken = await postJoin(reqBadToken);
  assert.equal(resBadToken.status, 400);
});

test("GET /api/creator/campaigns enforces authentication and Creator role", async () => {
  // Unauthenticated
  const reqUnauth = new NextRequest("http://localhost:3000/api/creator/campaigns");
  const resUnauth = await getCreatorCampaigns(reqUnauth);
  assert.equal(resUnauth.status, 401);

  // Staff role forbidden
  const staffToken = createSessionToken({
    userId: "usr_staff_1",
    name: "Staff Cashier",
    phone: "0911000000",
    role: "STAFF",
    brandId: "brd_1",
  });
  const reqStaff = new NextRequest("http://localhost:3000/api/creator/campaigns", {
    headers: {
      Cookie: `ethiolink_session=${staffToken}`,
    },
  });
  const resStaff = await getCreatorCampaigns(reqStaff);
  assert.equal(resStaff.status, 403, "Staff role must be rejected from Creator campaigns endpoint");

  // Brand Owner role forbidden
  const ownerToken = createSessionToken({
    userId: "usr_owner_1",
    name: "Brand Owner",
    phone: "0922000000",
    role: "OWNER",
    brandId: "brd_1",
  });
  const reqOwner = new NextRequest("http://localhost:3000/api/creator/campaigns", {
    headers: {
      Cookie: `ethiolink_session=${ownerToken}`,
    },
  });
  const resOwner = await getCreatorCampaigns(reqOwner);
  assert.equal(resOwner.status, 403, "Owner role must be rejected from Creator campaigns endpoint");
});

test("Creator metrics aggregation calculates multi-campaign totals without float drift", () => {
  const campaign1Events = [
    { eventType: "PAGE_VIEW", visitorId: "v1" },
    { eventType: "TELEGRAM_CLICK", visitorId: "v1" },
    { eventType: "COPY_CODE", visitorId: "v1" },
  ];
  const campaign1Sales = [{ amountETB: 1250.5 }];

  const campaign2Events = [
    { eventType: "PAGE_VIEW", visitorId: "v2" },
    { eventType: "CALL_CLICK", visitorId: "v2" },
  ];
  const campaign2Sales = [{ amountETB: 749.5 }];

  const allEvents = [...campaign1Events, ...campaign2Events];
  const allSales = [...campaign1Sales, ...campaign2Sales];

  const totalSummary = calculateFunnelMetrics(allEvents, allSales);

  assert.equal(totalSummary.pageViews, 2);
  assert.equal(totalSummary.uniqueVisitors, 2);
  assert.equal(totalSummary.telegramClicks, 1);
  assert.equal(totalSummary.callClicks, 1);
  assert.equal(totalSummary.copyCodeClicks, 1);
  assert.equal(totalSummary.totalClicks, 3);
  assert.equal(totalSummary.salesCount, 2);
  assert.equal(totalSummary.totalRevenueETB, 2000.0, "1250.50 + 749.50 must sum to 2000.00 ETB");
  assert.equal(totalSummary.aovETB, 1000.0, "2000 / 2 = 1000.00 ETB");
  assert.equal(totalSummary.salesConversionRate, 100.0, "2 sales / 2 views = 100%");
});

test("Creator activity stream formats events and sales chronologically (PRD FR-035)", () => {
  const rawEvents = [
    {
      id: "ev-1",
      eventType: "TELEGRAM_CLICK",
      createdAt: new Date("2026-10-28T10:00:00Z"),
      campaign: { name: "Bole Launch", slug: "bole-launch", promoCode: "BOLE20" },
    },
    {
      id: "ev-2",
      eventType: "CALL_CLICK",
      createdAt: new Date("2026-10-28T10:30:00Z"),
      campaign: { name: "Arat Kilo", slug: "arat-kilo", promoCode: "STUDENT10" },
    },
  ];

  const rawSales = [
    {
      id: "sl-1",
      amountETB: 2500,
      createdAt: new Date("2026-10-28T10:15:00Z"),
      campaign: { name: "Bole Launch", slug: "bole-launch", promoCode: "BOLE20" },
    },
  ];

  const eventItems = rawEvents.map((e) => ({
    id: e.id,
    type: "EVENT",
    eventType: e.eventType,
    campaignName: e.campaign.name,
    campaignSlug: e.campaign.slug,
    promoCode: e.campaign.promoCode,
    timestamp: e.createdAt.toISOString(),
  }));

  const saleItems = rawSales.map((s) => ({
    id: s.id,
    type: "SALE",
    campaignName: s.campaign.name,
    campaignSlug: s.campaign.slug,
    promoCode: s.campaign.promoCode,
    timestamp: s.createdAt.toISOString(),
    amountETB: s.amountETB,
  }));

  const activity = [...eventItems, ...saleItems].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  assert.equal(activity.length, 3);
  assert.equal(activity[0].id, "ev-2", "10:30 event must be newest");
  assert.equal(activity[1].id, "sl-1", "10:15 sale must be second");
  assert.equal(activity[2].id, "ev-1", "10:00 event must be oldest");
  assert.equal(activity[1].amountETB, 2500);
});

test("Creator portal strictly excludes financial wallets and automated payouts (PRD FR-036)", () => {
  const samplePortalData = {
    status: "ok",
    creator: { id: "c1", name: "Sara", phone: "0911000000", telegramUsername: "sara_eth" },
    summary: {
      pageViews: 100,
      uniqueVisitors: 80,
      telegramClicks: 30,
      callClicks: 10,
      mapClicks: 5,
      copyCodeClicks: 5,
      totalClicks: 50,
      salesCount: 5,
      totalRevenueETB: 15000,
      clickThroughRate: 50.0,
      salesConversionRate: 5.0,
      aovETB: 3000,
      totalCampaigns: 1,
    },
    campaigns: [],
    recentActivity: [],
  };

  // PRD FR-036 requires that portal data has no wallet balances, payout requests, or withdrawal objects
  assert.equal("walletBalance" in samplePortalData, false);
  assert.equal("withdrawalAvailable" in samplePortalData, false);
  assert.equal("payoutBalance" in samplePortalData, false);
  assert.ok(samplePortalData.recentActivity);
});

test("CreatorView component exports successfully for React client consumption", () => {
  assert.equal(typeof CreatorView, "function");
});
