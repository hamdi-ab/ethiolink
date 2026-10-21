import test from "node:test";
import assert from "node:assert/strict";
import {
  slugify,
  createCreatorInviteToken,
  verifyCreatorInviteToken,
} from "../src/lib/invites.ts";
import { createSessionToken } from "../src/lib/auth.ts";
import { GET as getCampaigns, POST as createCampaign } from "../src/app/api/campaigns/route.ts";
import { PATCH as updateCampaign } from "../src/app/api/campaigns/[id]/route.ts";
import { POST as createInvite } from "../src/app/api/campaigns/[id]/invite/route.ts";
import { NextRequest } from "next/server";

test("slugify generates clean URL-safe slugs", () => {
  assert.equal(slugify("Bole Coffee Summer Sale"), "bole-coffee-summer-sale");
  assert.equal(slugify("Special Promo 2026!!! @Addis"), "special-promo-2026-addis");
  assert.equal(slugify("   Meskel   Holiday   "), "meskel-holiday");
  assert.ok(slugify("").startsWith("campaign-"));
});

test("createCreatorInviteToken creates signed token and verifyCreatorInviteToken decodes it", () => {
  const token = createCreatorInviteToken("cmp_123", "brd_456", "Helen Bedilu");
  assert.equal(token.split(".").length, 3, "Token must consist of header.body.signature");

  const verified = verifyCreatorInviteToken(token);
  assert.ok(verified, "Valid token must verify");
  assert.equal(verified.campaignId, "cmp_123");
  assert.equal(verified.brandId, "brd_456");
  assert.equal(verified.creatorName, "Helen Bedilu");
  assert.ok(verified.exp > Date.now());
});

test("verifyCreatorInviteToken rejects tampered and expired tokens", () => {
  const token = createCreatorInviteToken("cmp_123", "brd_456");
  const parts = token.split(".");

  // Tamper payload
  const tampered = `${parts[0]}.${Buffer.from(JSON.stringify({ campaignId: "cmp_999" })).toString("base64url")}.${parts[2]}`;
  assert.equal(verifyCreatorInviteToken(tampered), null);

  // Expired token
  const expired = createCreatorInviteToken("cmp_123", "brd_456", undefined, -1000);
  assert.equal(verifyCreatorInviteToken(expired), null);
});

test("GET /api/campaigns requires authentication", async () => {
  const req = new NextRequest("http://localhost:3000/api/campaigns");
  const res = await getCampaigns(req);
  assert.equal(res.status, 401);
});

test("POST /api/campaigns requires authentication and enforces Owner role", async () => {
  // No auth
  const unauthReq = new NextRequest("http://localhost:3000/api/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Promo", promoCode: "PROMO10" }),
  });
  const unauthRes = await createCampaign(unauthReq);
  assert.equal(unauthRes.status, 401);

  // Staff role trying to create campaign
  const staffToken = createSessionToken({
    userId: "usr_staff",
    name: "Staff Member",
    phone: "0922334455",
    role: "STAFF",
    brandId: "brd_1",
  });

  const staffReq = new NextRequest("http://localhost:3000/api/campaigns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `ethiolink_session=${staffToken}`,
    },
    body: JSON.stringify({ name: "Promo", promoCode: "PROMO10" }),
  });
  const staffRes = await createCampaign(staffReq);
  assert.equal(staffRes.status, 403, "Staff must be forbidden from creating campaigns");
});

test("POST /api/campaigns validates required name and promoCode", async () => {
  const ownerToken = createSessionToken({
    userId: "usr_owner",
    name: "Owner",
    phone: "0911223344",
    role: "OWNER",
    brandId: "brd_1",
  });

  // Missing name
  const missingNameReq = new NextRequest("http://localhost:3000/api/campaigns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `ethiolink_session=${ownerToken}`,
    },
    body: JSON.stringify({ promoCode: "CODE10" }),
  });
  const missingNameRes = await createCampaign(missingNameReq);
  assert.equal(missingNameRes.status, 400);

  // Missing promoCode
  const missingCodeReq = new NextRequest("http://localhost:3000/api/campaigns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `ethiolink_session=${ownerToken}`,
    },
    body: JSON.stringify({ name: "Summer Promo" }),
  });
  const missingCodeRes = await createCampaign(missingCodeReq);
  assert.equal(missingCodeRes.status, 400);
});

test("POST /api/campaigns/[id]/invite requires authentication", async () => {
  const req = new NextRequest("http://localhost:3000/api/campaigns/cmp_123/invite", {
    method: "POST",
  });
  const res = await createInvite(req, { params: Promise.resolve({ id: "cmp_123" }) });
  assert.equal(res.status, 401);
});

test("PATCH /api/campaigns/[id] requires authentication", async () => {
  const req = new NextRequest("http://localhost:3000/api/campaigns/cmp_123", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Updated Name" }),
  });
  const res = await updateCampaign(req, { params: Promise.resolve({ id: "cmp_123" }) });
  assert.equal(res.status, 401);
});
