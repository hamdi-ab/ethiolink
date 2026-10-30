import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  calculateRetentionCutoff,
  DEFAULT_RETENTION_DAYS,
} from "../src/lib/retention.ts";
import { GET as getRetention, POST as postRetention } from "../src/app/api/admin/retention/route.ts";

test("calculateRetentionCutoff accurately calculates rolling threshold date", () => {
  const baseDate = new Date("2026-10-29T12:00:00Z");
  const cutoff90 = calculateRetentionCutoff(90, baseDate);

  // Expected: 90 days before baseDate
  const diffMs = baseDate.getTime() - cutoff90.getTime();
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  assert.equal(diffDays, 90);
  assert.equal(cutoff90.toISOString(), "2026-07-31T12:00:00.000Z");
});

test("calculateRetentionCutoff uses DEFAULT_RETENTION_DAYS when omitted", () => {
  const baseDate = new Date("2026-10-29T12:00:00Z");
  const cutoffDefault = calculateRetentionCutoff(undefined, baseDate);

  const diffMs = baseDate.getTime() - cutoffDefault.getTime();
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  assert.equal(diffDays, DEFAULT_RETENTION_DAYS);
});

test("calculateRetentionCutoff clamps out-of-bound day values safely", () => {
  const baseDate = new Date("2026-10-29T12:00:00Z");

  // Zero or negative clamped to 1 day minimum
  const cutoffMin = calculateRetentionCutoff(-10, baseDate);
  const diffMin = Math.round((baseDate.getTime() - cutoffMin.getTime()) / (24 * 60 * 60 * 1000));
  assert.equal(diffMin, 1);

  // Excessive value clamped to 5 years maximum
  const cutoffMax = calculateRetentionCutoff(10000, baseDate);
  const diffMax = Math.round((baseDate.getTime() - cutoffMax.getTime()) / (24 * 60 * 60 * 1000));
  assert.equal(diffMax, 365 * 5);
});

test("GET /api/admin/retention strictly enforces authentication", async () => {
  const req = new NextRequest("http://localhost:3000/api/admin/retention");
  const res = await getRetention(req);
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.error, "Unauthorized");
});

test("POST /api/admin/retention strictly enforces authentication", async () => {
  const req = new NextRequest("http://localhost:3000/api/admin/retention", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ retentionDays: 90, dryRun: true }),
  });
  const res = await postRetention(req);
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.error, "Unauthorized");
});
