import test from "node:test";
import assert from "node:assert/strict";
import { GET } from "../src/app/api/health/route.ts";

test("Health check endpoint returns status 200 with service metadata", async () => {
  const response = await GET();
  assert.equal(response.status, 200);

  const data = await response.json();
  assert.equal(data.status, "ok");
  assert.equal(data.service, "ethiolink");
  assert.equal(data.version, "0.1.0");
  assert.ok(data.timestamp);
  assert.ok(data.database);
  assert.ok(["configured", "connected", "unreachable_or_uninitialized"].includes(data.database.status));
});
