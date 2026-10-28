import test from "node:test";
import assert from "node:assert/strict";
import { createSessionToken } from "../src/lib/auth.ts";
import { PATCH as updateCampaign } from "../src/app/api/campaigns/[id]/route.ts";
import { NextRequest } from "next/server";
import { EditCampaignModal } from "../src/components/campaign/EditCampaignModal.tsx";

test("PATCH /api/campaigns/[id] strictly enforces authentication", async () => {
  const req = new NextRequest("http://localhost:3000/api/campaigns/cmp_123", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Updated Campaign" }),
  });
  const res = await updateCampaign(req, { params: Promise.resolve({ id: "cmp_123" }) });
  assert.equal(res.status, 401, "Unauthenticated PATCH requests must return 401 Unauthorized");
});

test("PATCH /api/campaigns/[id] strictly restricts editing to Brand Owners and Admins", async () => {
  const routeParams = { params: Promise.resolve({ id: "cmp_test_1" }) };

  // 1. Staff user attempting to edit campaign
  const staffToken = createSessionToken({
    userId: "usr_staff",
    name: "Staff Cashier",
    phone: "0911000001",
    role: "STAFF",
    brandId: "brd_1",
  });
  const staffReq = new NextRequest("http://localhost:3000/api/campaigns/cmp_test_1", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: `ethiolink_session=${staffToken}`,
    },
    body: JSON.stringify({ name: "Malicious Edit" }),
  });
  const staffRes = await updateCampaign(staffReq, routeParams);
  assert.equal(staffRes.status, 403, "Staff role must be prohibited from modifying campaigns (403)");

  // 2. Creator user attempting to edit campaign
  const creatorToken = createSessionToken({
    userId: "usr_creator",
    name: "Influencer",
    phone: "0911000002",
    role: "CREATOR",
    brandId: "brd_1",
  });
  const creatorReq = new NextRequest("http://localhost:3000/api/campaigns/cmp_test_1", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: `ethiolink_session=${creatorToken}`,
    },
    body: JSON.stringify({ name: "Creator Edit" }),
  });
  const creatorRes = await updateCampaign(creatorReq, routeParams);
  assert.equal(creatorRes.status, 403, "Creator role must be prohibited from modifying campaigns (403)");
});

test("PATCH /api/campaigns/[id] validates request body structure", async () => {
  const ownerToken = createSessionToken({
    userId: "usr_owner",
    name: "Brand Owner",
    phone: "0911000003",
    role: "OWNER",
    brandId: "brd_1",
  });
  const routeParams = { params: Promise.resolve({ id: "cmp_test_1" }) };

  const invalidJsonReq = new NextRequest("http://localhost:3000/api/campaigns/cmp_test_1", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: `ethiolink_session=${ownerToken}`,
    },
    body: "invalid{json",
  });
  const res = await updateCampaign(invalidJsonReq, routeParams);
  assert.equal(res.status, 400, "Malformed JSON body must return 400 Bad Request");
});

test("EditCampaignModal component exports successfully for React client consumption", () => {
  assert.equal(typeof EditCampaignModal, "function", "EditCampaignModal must be exported as a React component function");
});
