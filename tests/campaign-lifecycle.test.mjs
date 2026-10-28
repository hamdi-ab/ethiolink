import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateCampaignLifecycle,
  isCampaignActive,
  getEffectiveStatus,
  getStatusBadgeConfig,
} from "../src/lib/lifecycle.ts";
import { translations } from "../src/lib/translations.ts";
import { createSessionToken } from "../src/lib/auth.ts";
import { PATCH as updateCampaign } from "../src/app/api/campaigns/[id]/route.ts";
import { POST as createSale } from "../src/app/api/sales/route.ts";
import { NextRequest } from "next/server";

test("evaluateCampaignLifecycle correctly evaluates explicit statuses", () => {
  const now = new Date("2026-10-28T12:00:00Z");

  // Active
  const activeRes = evaluateCampaignLifecycle({ status: "ACTIVE" }, now);
  assert.equal(activeRes.active, true);
  assert.equal(activeRes.effectiveStatus, "ACTIVE");

  // Paused
  const pausedRes = evaluateCampaignLifecycle({ status: "PAUSED" }, now);
  assert.equal(pausedRes.active, false);
  assert.equal(pausedRes.effectiveStatus, "PAUSED");
  assert.equal(pausedRes.reason, "PAUSED");

  // Completed
  const completedRes = evaluateCampaignLifecycle({ status: "COMPLETED" }, now);
  assert.equal(completedRes.active, false);
  assert.equal(completedRes.effectiveStatus, "COMPLETED");

  // Expired
  const expiredRes = evaluateCampaignLifecycle({ status: "EXPIRED" }, now);
  assert.equal(expiredRes.active, false);
  assert.equal(expiredRes.effectiveStatus, "EXPIRED");

  // Draft
  const draftRes = evaluateCampaignLifecycle({ status: "DRAFT" }, now);
  assert.equal(draftRes.active, false);
  assert.equal(draftRes.effectiveStatus, "DRAFT");
});

test("evaluateCampaignLifecycle correctly evaluates temporal boundaries", () => {
  const now = new Date("2026-10-28T12:00:00Z");

  // Start date in the future
  const futureStart = evaluateCampaignLifecycle(
    {
      status: "ACTIVE",
      startDate: new Date("2026-11-01T00:00:00Z"),
    },
    now
  );
  assert.equal(futureStart.active, false);
  assert.equal(futureStart.effectiveStatus, "DRAFT");
  assert.equal(futureStart.reason, "NOT_STARTED");

  // End date in the past
  const pastEnd = evaluateCampaignLifecycle(
    {
      status: "ACTIVE",
      endDate: new Date("2026-10-20T00:00:00Z"),
    },
    now
  );
  assert.equal(pastEnd.active, false);
  assert.equal(pastEnd.effectiveStatus, "EXPIRED");
  assert.equal(pastEnd.reason, "EXPIRED");

  // Active within valid window
  const inWindow = evaluateCampaignLifecycle(
    {
      status: "ACTIVE",
      startDate: new Date("2026-10-01T00:00:00Z"),
      endDate: new Date("2026-10-31T23:59:59Z"),
    },
    now
  );
  assert.equal(inWindow.active, true);
  assert.equal(inWindow.effectiveStatus, "ACTIVE");
});

test("isCampaignActive and getEffectiveStatus utility functions return expected values", () => {
  const now = new Date("2026-10-28T12:00:00Z");

  assert.equal(isCampaignActive({ status: "ACTIVE" }, now), true);
  assert.equal(isCampaignActive({ status: "PAUSED" }, now), false);
  assert.equal(
    isCampaignActive({ status: "ACTIVE", endDate: "2026-10-01T00:00:00Z" }, now),
    false
  );

  assert.equal(getEffectiveStatus({ status: "ACTIVE" }, now), "ACTIVE");
  assert.equal(getEffectiveStatus({ status: "PAUSED" }, now), "PAUSED");
  assert.equal(
    getEffectiveStatus({ status: "ACTIVE", endDate: "2026-10-01T00:00:00Z" }, now),
    "EXPIRED"
  );
});

test("getStatusBadgeConfig returns valid styling tokens across all lifecycle states", () => {
  const statuses = ["ACTIVE", "PAUSED", "EXPIRED", "COMPLETED", "DRAFT"];

  for (const st of statuses) {
    const config = getStatusBadgeConfig(st);
    assert.ok(config.label, `Label required for ${st}`);
    assert.ok(config.badgeClass.includes("border"), `Badge border required for ${st}`);
    assert.ok(config.dotClass.includes("bg-"), `Dot class required for ${st}`);
  }
});

test("Translations contain all bilingual keys for campaign conclusion and pauses", () => {
  for (const lang of ["en", "am"]) {
    const dict = translations[lang];
    assert.ok(dict.concludedTitle, `concludedTitle required in ${lang}`);
    assert.ok(dict.concludedDesc, `concludedDesc required in ${lang}`);
    assert.ok(dict.pausedTitle, `pausedTitle required in ${lang}`);
    assert.ok(dict.pausedDesc, `pausedDesc required in ${lang}`);
    assert.ok(dict.contactStore, `contactStore required in ${lang}`);
  }
});

test("PATCH /api/campaigns/[id] rejects unauthorized non-owner status updates", async () => {
  const staffToken = createSessionToken({
    userId: "usr_staff",
    name: "Staff Person",
    phone: "0911000000",
    role: "STAFF",
    brandId: "brd_1",
  });

  const req = new NextRequest("http://localhost:3000/api/campaigns/cmp_test", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: `ethiolink_session=${staffToken}`,
    },
    body: JSON.stringify({ status: "PAUSED" }),
  });

  const res = await updateCampaign(req, {
    params: Promise.resolve({ id: "cmp_test" }),
  });

  assert.equal(res.status, 403, "Staff must be forbidden from editing campaign status");
});

test("POST /api/sales rejects creator role attempting sales override", async () => {
  const creatorToken = createSessionToken({
    userId: "usr_creator",
    name: "Creator Person",
    phone: "0922000000",
    role: "CREATOR",
    brandId: "brd_1",
  });

  const req = new NextRequest("http://localhost:3000/api/sales", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `ethiolink_session=${creatorToken}`,
    },
    body: JSON.stringify({
      amountETB: 1200,
      campaignId: "cmp_1",
      override: true,
    }),
  });

  const res = await createSale(req);
  assert.equal(res.status, 403, "Creators cannot log sales or perform overrides");
});
