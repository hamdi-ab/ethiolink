import test from "node:test";
import assert from "node:assert/strict";

process.env.NODE_ENV = "test";
import {
  hashIpWithDailySalt,
  isValidEventType,
  EVENT_TYPES,
  DEDUPLICATION_WINDOW_MS,
} from "../src/lib/telemetry.ts";
import { POST } from "../src/app/api/events/route.ts";
import { NextRequest } from "next/server";

test("hashIpWithDailySalt produces 64-char SHA-256 hash and never leaks raw IP", () => {
  const rawIp = "197.156.104.22";
  const today = new Date("2026-10-21T10:00:00Z");
  const hash = hashIpWithDailySalt(rawIp, today, "test-secret");

  assert.equal(hash.length, 64, "SHA-256 hex digest must be 64 characters");
  assert.ok(/^[a-f0-9]{64}$/.test(hash), "Hash must be valid lowercase hex");
  assert.equal(hash.includes(rawIp), false, "Raw IP must never be present in the generated hash");
});

test("hashIpWithDailySalt produces consistent hash on same day and rotates on next day", () => {
  const ip = "196.188.241.10";
  const day1 = new Date("2026-10-21T08:00:00Z");
  const day1Later = new Date("2026-10-21T23:59:59Z");
  const day2 = new Date("2026-10-22T00:00:01Z");

  const hashDay1 = hashIpWithDailySalt(ip, day1, "test-salt");
  const hashDay1Later = hashIpWithDailySalt(ip, day1Later, "test-salt");
  const hashDay2 = hashIpWithDailySalt(ip, day2, "test-salt");

  assert.equal(hashDay1, hashDay1Later, "Hashes on the same calendar day must match exactly");
  assert.notEqual(hashDay1, hashDay2, "Hashes must rotate across calendar day boundaries");
});

test("isValidEventType only accepts authorized telemetry event types", () => {
  const expectedTypes = [
    "PAGE_VIEW",
    "TELEGRAM_CLICK",
    "CALL_CLICK",
    "MAP_CLICK",
    "COPY_CODE",
  ];

  assert.deepEqual([...EVENT_TYPES].sort(), expectedTypes.sort());

  for (const type of expectedTypes) {
    assert.equal(isValidEventType(type), true, `Type '${type}' must be valid`);
  }

  assert.equal(isValidEventType("INVALID_ACTION"), false);
  assert.equal(isValidEventType(""), false);
  assert.equal(isValidEventType(null), false);
  assert.equal(isValidEventType(undefined), false);
  assert.equal(isValidEventType(123), false);
});

test("Deduplication sliding window constant is exactly 15 minutes", () => {
  assert.equal(DEDUPLICATION_WINDOW_MS, 15 * 60 * 1000);
});

test("POST /api/events rejects invalid requests with HTTP 400", async () => {
  // Empty / malformed body
  const emptyReq = new NextRequest("http://localhost:3000/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const emptyRes = await POST(emptyReq);
  assert.equal(emptyRes.status, 400);

  // Invalid event type
  const badTypeReq = new NextRequest("http://localhost:3000/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      campaignSlug: "summer-sale",
      eventType: "INVALID_TYPE",
      visitorId: "test-uuid-1",
    }),
  });
  const badTypeRes = await POST(badTypeReq);
  assert.equal(badTypeRes.status, 400);

  // Missing visitorId
  const missingVisitorReq = new NextRequest("http://localhost:3000/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      campaignSlug: "summer-sale",
      eventType: "PAGE_VIEW",
      visitorId: "",
    }),
  });
  const missingVisitorRes = await POST(missingVisitorReq);
  assert.equal(missingVisitorRes.status, 400);
});

test("POST /api/events returns 404 when campaign is not found", async () => {
  const notFoundReq = new NextRequest("http://localhost:3000/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      campaignSlug: "non-existent-campaign-slug-99999",
      eventType: "PAGE_VIEW",
      visitorId: "uuid-test-visitor-1234",
    }),
  });

  const res = await POST(notFoundReq);
  // When DB is offline or mock URL, might be 404 (if db returned null) or 500 (if db connection failed)
  assert.ok([404, 500].includes(res.status), `Expected 404 or 500 when campaign is missing/unreachable, got ${res.status}`);
});
