import test from "node:test";
import assert from "node:assert/strict";
import { parseAmountETB, formatETB } from "../src/lib/sales.ts";
import { createSessionToken } from "../src/lib/auth.ts";
import { GET as getSales, POST as createSale } from "../src/app/api/sales/route.ts";
import { NextRequest } from "next/server";

test("parseAmountETB correctly validates and parses positive currency amounts", () => {
  assert.equal(parseAmountETB(1500), 1500);
  assert.equal(parseAmountETB(1500.5), 1500.5);
  assert.equal(parseAmountETB(25.99), 25.99);
  assert.equal(parseAmountETB("1500"), 1500);
  assert.equal(parseAmountETB("1,500.50"), 1500.5);
  assert.equal(parseAmountETB("250.75"), 250.75);
});

test("parseAmountETB rejects invalid, negative, zero, or excessive precision inputs", () => {
  assert.equal(parseAmountETB(0), null);
  assert.equal(parseAmountETB(-100), null);
  assert.equal(parseAmountETB("-50.00"), null);
  assert.equal(parseAmountETB("abc"), null);
  assert.equal(parseAmountETB(""), null);
  assert.equal(parseAmountETB(null), null);
  assert.equal(parseAmountETB(undefined), null);
  assert.equal(parseAmountETB("150.999"), null, "More than 2 decimals must be rejected");
  assert.equal(parseAmountETB(200_000_000), null, "Amounts exceeding 100M must be rejected");
});

test("formatETB properly formats currency values in ETB", () => {
  assert.equal(formatETB(1500), "1,500.00 ETB");
  assert.equal(formatETB(1500.5), "1,500.50 ETB");
  assert.equal(formatETB("2500000"), "2,500,000.00 ETB");
  assert.equal(formatETB(0), "0.00 ETB");
  assert.equal(formatETB(null), "0.00 ETB");
  assert.equal(formatETB(undefined), "0.00 ETB");
});

test("GET /api/sales requires authentication", async () => {
  const req = new NextRequest("http://localhost:3000/api/sales");
  const res = await getSales(req);
  assert.equal(res.status, 401);
});

test("POST /api/sales requires authentication", async () => {
  const req = new NextRequest("http://localhost:3000/api/sales", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amountETB: 500, promoCode: "PROMO20" }),
  });
  const res = await createSale(req);
  assert.equal(res.status, 401);
});

test("POST /api/sales rejects creator role with 403 Forbidden", async () => {
  const creatorToken = createSessionToken({
    userId: "usr_creator",
    name: "Influencer",
    phone: "0911000000",
    role: "CREATOR",
    brandId: "brd_1",
  });

  const req = new NextRequest("http://localhost:3000/api/sales", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `ethiolink_session=${creatorToken}`,
    },
    body: JSON.stringify({ amountETB: 500, promoCode: "PROMO20" }),
  });
  const res = await createSale(req);
  assert.equal(res.status, 403, "Creators must not be authorized to log merchant sales");
});

test("POST /api/sales validates required amountETB and attribution identifiers", async () => {
  const staffToken = createSessionToken({
    userId: "usr_staff",
    name: "Cashier Almaz",
    phone: "0911223344",
    role: "STAFF",
    brandId: "brd_1",
  });

  // Invalid amount (0 or negative)
  const badAmountReq = new NextRequest("http://localhost:3000/api/sales", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `ethiolink_session=${staffToken}`,
    },
    body: JSON.stringify({ amountETB: -50, promoCode: "PROMO20" }),
  });
  const badAmountRes = await createSale(badAmountReq);
  assert.equal(badAmountRes.status, 400);

  // Missing both campaignId and promoCode
  const missingAttrReq = new NextRequest("http://localhost:3000/api/sales", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `ethiolink_session=${staffToken}`,
    },
    body: JSON.stringify({ amountETB: 500 }),
  });
  const missingAttrRes = await createSale(missingAttrReq);
  assert.equal(missingAttrRes.status, 400);
});
