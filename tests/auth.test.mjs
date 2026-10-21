import test from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  isAuthorizedRole,
} from "../src/lib/auth.ts";
import { POST as registerHandler } from "../src/app/api/auth/register/route.ts";
import { POST as loginHandler } from "../src/app/api/auth/login/route.ts";
import { POST as logoutHandler } from "../src/app/api/auth/logout/route.ts";
import { GET as meHandler } from "../src/app/api/auth/me/route.ts";
import { NextRequest } from "next/server";

test("hashPassword and verifyPassword correctly handle hashing and verification", async () => {
  const password = "mySecretPassword123";
  const hash = await hashPassword(password);

  assert.ok(hash.startsWith("$2a$") || hash.startsWith("$2b$"), "Must produce valid bcrypt format");
  assert.equal(await verifyPassword(password, hash), true, "Correct password must verify to true");
  assert.equal(await verifyPassword("wrongPassword", hash), false, "Incorrect password must verify to false");
  assert.equal(await verifyPassword("", hash), false, "Empty password must verify to false");
});

test("createSessionToken creates tamper-resistant JWT and verifySessionToken parses it", () => {
  const payload = {
    userId: "usr_12345",
    name: "Abebe Kebede",
    phone: "0911223344",
    role: "OWNER",
    brandId: "brd_67890",
  };

  const token = createSessionToken(payload);
  assert.equal(token.split(".").length, 3, "Token must consist of header.body.signature");

  const verified = verifySessionToken(token);
  assert.ok(verified, "Valid token must verify successfully");
  assert.equal(verified.userId, payload.userId);
  assert.equal(verified.name, payload.name);
  assert.equal(verified.phone, payload.phone);
  assert.equal(verified.role, "OWNER");
  assert.equal(verified.brandId, payload.brandId);
  assert.ok(verified.exp > Date.now(), "Token expiration must be in the future");
});

test("verifySessionToken rejects tampered signatures and expired tokens", () => {
  const payload = {
    userId: "usr_attacker",
    name: "Malicious User",
    phone: "0999999999",
    role: "STAFF",
    brandId: "brd_victim",
  };

  const token = createSessionToken(payload);
  const parts = token.split(".");

  // Tamper with payload
  const tamperedBody = Buffer.from(
    JSON.stringify({ ...payload, role: "OWNER" })
  ).toString("base64url");
  const tamperedToken = `${parts[0]}.${tamperedBody}.${parts[2]}`;

  assert.equal(verifySessionToken(tamperedToken), null, "Tampered payload must be rejected");

  // Tamper with signature
  const brokenSigToken = `${parts[0]}.${parts[1]}.invalid_signature`;
  assert.equal(verifySessionToken(brokenSigToken), null, "Invalid signature must be rejected");

  // Expired token
  const expiredToken = createSessionToken(payload, -1000); // Expired 1 second ago
  assert.equal(verifySessionToken(expiredToken), null, "Expired token must be rejected");
});

test("isAuthorizedRole accurately checks two-tier role permissions", () => {
  assert.equal(isAuthorizedRole("OWNER", ["OWNER", "STAFF"]), true);
  assert.equal(isAuthorizedRole("STAFF", ["OWNER", "STAFF"]), true);
  assert.equal(isAuthorizedRole("STAFF", ["OWNER"]), false, "Staff must not have Owner-only authority");
  assert.equal(isAuthorizedRole("CREATOR", ["OWNER", "STAFF"]), false);
  assert.equal(isAuthorizedRole(undefined, ["OWNER"]), false);
});

test("POST /api/auth/register validates required fields and password length", async () => {
  // Empty body
  const emptyReq = new NextRequest("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const emptyRes = await registerHandler(emptyReq);
  assert.equal(emptyRes.status, 400);

  // Short password (<6 chars)
  const shortPassReq = new NextRequest("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      brandName: "Bole Bakery",
      ownerName: "Almaz",
      phone: "0911002233",
      password: "123",
    }),
  });
  const shortPassRes = await registerHandler(shortPassReq);
  assert.equal(shortPassRes.status, 400);
});

test("POST /api/auth/login validates required phone and password", async () => {
  const missingPassReq = new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: "0911002233",
    }),
  });
  const missingPassRes = await loginHandler(missingPassReq);
  assert.equal(missingPassRes.status, 400);
});

test("POST /api/auth/logout returns ok and clears cookie", async () => {
  const res = await logoutHandler();
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, "ok");

  const setCookie = res.headers.get("set-cookie");
  assert.ok(setCookie);
  assert.ok(setCookie.includes("ethiolink_session="));
  assert.ok(setCookie.includes("Max-Age=0"));
});

test("GET /api/auth/me returns 401 when no session cookie is present", async () => {
  const req = new NextRequest("http://localhost:3000/api/auth/me");
  const res = await meHandler(req);
  assert.equal(res.status, 401);
});
