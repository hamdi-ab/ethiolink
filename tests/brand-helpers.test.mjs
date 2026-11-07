import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateWeeklyVelocity,
  calculateBranchHotspots,
  resolveSaleChannelAndBranch,
  generateSalesCurvePaths,
} from "../src/app/(dashboard)/brand/brand-helpers.ts";

test("resolveSaleChannelAndBranch maps notes to distinct operational channels", () => {
  const r1 = resolveSaleChannelAndBranch("Customer ordered via Telegram bot link");
  assert.equal(r1.branch, "Telegram Mini-App");
  assert.equal(r1.channel, "telegram");

  const r2 = resolveSaleChannelAndBranch("Walk-in customer at Piassa branch with coupon");
  assert.equal(r2.branch, "Piassa Roastery POS");
  assert.equal(r2.channel, "pos");

  const r3 = resolveSaleChannelAndBranch("Direct phone delivery order from Bole");
  assert.equal(r3.branch, "Direct Hotline Order");
  assert.equal(r3.channel, "phone");

  const r4 = resolveSaleChannelAndBranch(null);
  assert.equal(r4.branch, "Bole Flagship POS");
  assert.equal(r4.channel, "pos");
});

test("calculateWeeklyVelocity safely handles empty sales stream", () => {
  const buckets = calculateWeeklyVelocity([]);
  assert.equal(buckets.length, 5);
  assert.equal(buckets[0].label, "W1");
  assert.equal(buckets[4].label, "W5");
  assert.equal(buckets[0].amountETB, 0);
  assert.equal(buckets[4].amountETB, 0);
  assert.equal(buckets[4].isPeak, true);
});

test("calculateWeeklyVelocity aggregates sales into 7-day chronological buckets", () => {
  const now = new Date("2026-11-04T12:00:00Z");
  const sales = [
    // Current week (W5: past 7 days)
    { amountETB: 1000, createdAt: new Date("2026-11-02T10:00:00Z") },
    { amountETB: 2000, createdAt: new Date("2026-11-01T10:00:00Z") },
    // Previous week (W4: 8-14 days ago)
    { amountETB: 500, createdAt: new Date("2026-10-25T10:00:00Z") },
    // 3 weeks ago (W3: 15-21 days ago)
    { amountETB: 1500, createdAt: new Date("2026-10-18T10:00:00Z") },
  ];

  const buckets = calculateWeeklyVelocity(sales, now);
  assert.equal(buckets.length, 5);

  // W5 should have 1000 + 2000 = 3000 (peak)
  assert.equal(buckets[4].amountETB, 3000);
  assert.equal(buckets[4].count, 2);
  assert.equal(buckets[4].isPeak, true);
  assert.equal(buckets[4].percentage, 100);

  // W4 should have 500
  assert.equal(buckets[3].amountETB, 500);
  assert.equal(buckets[3].count, 1);
  assert.equal(buckets[3].isPeak, false);

  // W3 should have 1500
  assert.equal(buckets[2].amountETB, 1500);
  assert.equal(buckets[2].count, 1);
});

test("calculateBranchHotspots derives percentage shares from sales notes", () => {
  const sales = [
    { amountETB: 1000, notes: "Bole Flagship store POS" },
    { amountETB: 3000, notes: "Telegram bot checkout" },
  ];
  const eventsBreakdown = { telegram: 30, calls: 10, maps: 10, promoCopies: 5, total: 55 };

  const hotspots = calculateBranchHotspots(sales, eventsBreakdown);
  assert.ok(hotspots.length >= 2);

  const telegramHotspot = hotspots.find((h) => h.type === "telegram");
  const boleHotspot = hotspots.find((h) => h.name.includes("Bole"));

  assert.ok(telegramHotspot);
  assert.ok(boleHotspot);
  assert.equal(telegramHotspot.sharePercent, 75); // 3000 / 4000
  assert.equal(boleHotspot.sharePercent, 25); // 1000 / 4000
});

test("generateSalesCurvePaths produces valid SVG coordinates", () => {
  const sales = [
    { amountETB: 500, createdAt: "2026-10-01T10:00:00Z" },
    { amountETB: 1500, createdAt: "2026-10-15T10:00:00Z" },
    { amountETB: 2000, createdAt: "2026-10-25T10:00:00Z" },
  ];

  const res = generateSalesCurvePaths(sales, 540, 160);
  assert.ok(res.salesStrokePath.startsWith("M"));
  assert.ok(res.salesStrokePath.includes("C"));
  assert.ok(res.salesAreaPath.includes("Z"));
  assert.equal(res.maxETB, 4000);
  assert.ok(res.peakPoint.x <= 540);
  assert.ok(res.peakPoint.y <= 160);
});
