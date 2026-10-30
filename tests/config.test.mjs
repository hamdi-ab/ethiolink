import { test } from "node:test";
import assert from "node:assert";
import { getBaseUrl, getAuthSecret, getTelemetrySalt, APP_NAME, DEFAULT_CURRENCY, DEFAULT_RETENTION_DAYS } from "../src/lib/config.js";
import { formatETB } from "../src/lib/sales.js";

test("config: getBaseUrl resolves default localhost fallback when no env or headers provided", () => {
  const originalEnv = { ...process.env };
  delete process.env.NEXT_PUBLIC_APP_URL;
  delete process.env.APP_URL;
  delete process.env.VERCEL_URL;

  try {
    const url = getBaseUrl();
    assert.strictEqual(url, "http://localhost:3000");
  } finally {
    process.env = originalEnv;
  }
});

test("config: getBaseUrl prioritizes NEXT_PUBLIC_APP_URL when present", () => {
  const originalEnv = { ...process.env };
  process.env.NEXT_PUBLIC_APP_URL = "https://ethiolink.et/";

  try {
    const url = getBaseUrl();
    assert.strictEqual(url, "https://ethiolink.et");
  } finally {
    process.env = originalEnv;
  }
});

test("config: getBaseUrl extracts host and proto from request headers", () => {
  const originalEnv = { ...process.env };
  delete process.env.NEXT_PUBLIC_APP_URL;
  delete process.env.APP_URL;
  delete process.env.VERCEL_URL;

  try {
    const headers = new Map([
      ["host", "app.ethiolink.et"],
      ["x-forwarded-proto", "https"],
    ]);
    const url = getBaseUrl(headers);
    assert.strictEqual(url, "https://app.ethiolink.et");
  } finally {
    process.env = originalEnv;
  }
});

test("config: getAuthSecret returns secret string without throwing", () => {
  const secret = getAuthSecret();
  assert.ok(typeof secret === "string" && secret.length > 0);
});

test("config: getTelemetrySalt returns salt string without throwing", () => {
  const salt = getTelemetrySalt();
  assert.ok(typeof salt === "string" && salt.length > 0);
});

test("config: exports expected app constants and default retention days", () => {
  assert.ok(typeof APP_NAME === "string" && APP_NAME.length > 0);
  assert.strictEqual(DEFAULT_RETENTION_DAYS, 90);
});

test("config: formatETB formats currency using DEFAULT_CURRENCY token", () => {
  const formatted = formatETB(1500.5);
  assert.strictEqual(formatted, `1,500.50 ${DEFAULT_CURRENCY}`);
});
