import test from "node:test";
import assert from "node:assert/strict";
import { isDatabaseConnectionError, handleApiError } from "../src/lib/api-errors.ts";
import { formatClientError } from "../src/lib/client-errors.ts";

test("isDatabaseConnectionError correctly detects database network/reachability errors", () => {
  // Prisma known request codes
  assert.equal(isDatabaseConnectionError({ code: "P1001", message: "Can't reach database server" }), true);
  assert.equal(isDatabaseConnectionError({ code: "P1002", message: "Database server timed out" }), true);
  assert.equal(isDatabaseConnectionError({ code: "P1008", message: "Operations timed out" }), true);
  assert.equal(isDatabaseConnectionError({ code: "P1017", message: "Server closed connection" }), true);
  assert.equal(isDatabaseConnectionError({ code: "ECONNREFUSED" }), true);
  assert.equal(isDatabaseConnectionError({ code: "ENOTFOUND" }), true);
  assert.equal(isDatabaseConnectionError({ code: "ETIMEDOUT" }), true);

  // DriverAdapter / message string detection
  assert.equal(isDatabaseConnectionError(new Error("driverAdapterError: DatabaseNotReachable")), true);
  assert.equal(isDatabaseConnectionError({ name: "DriverAdapterError", message: "Can't reach database server at ep-test.neon.tech" }), true);
  assert.equal(isDatabaseConnectionError({ name: "PrismaClientInitializationError", message: "Failed to connect" }), true);

  // Nested cause
  assert.equal(isDatabaseConnectionError({ message: "wrapper", cause: { code: "ECONNREFUSED" } }), true);

  // Non-connection errors should be false
  assert.equal(isDatabaseConnectionError(null), false);
  assert.equal(isDatabaseConnectionError(undefined), false);
  assert.equal(isDatabaseConnectionError(new Error("Invalid password")), false);
  assert.equal(isDatabaseConnectionError({ code: "P2002", message: "Unique constraint failed" }), false);
});

test("handleApiError returns HTTP 503 with DATABASE_UNREACHABLE code for connection failures", async () => {
  const p1001Error = {
    code: "P1001",
    message: "Can't reach database server at ep-plain-fog-arvao6qo.neon.tech",
  };

  const response = handleApiError(p1001Error, "Fallback error message");
  assert.equal(response.status, 503);

  const json = await response.json();
  assert.equal(json.code, "DATABASE_UNREACHABLE");
  assert.match(json.error, /Unable to reach database server/);
});

test("handleApiError returns HTTP 500 for general unexpected errors", async () => {
  const unexpectedError = new Error("Some internal business logic failure");

  const response = handleApiError(unexpectedError, "Fallback internal error");
  assert.equal(response.status, 500);

  const json = await response.json();
  assert.equal(json.code, "INTERNAL_SERVER_ERROR");
  assert.equal(json.error, "Fallback internal error");
});

test("formatClientError produces actionable, user-friendly messages for connection issues", () => {
  // Fetch failure when LAN cable is unplugged
  const fetchError = new TypeError("Failed to fetch");
  const resultFetch = formatClientError(fetchError);
  assert.match(resultFetch, /Unable to connect to the server/);
  assert.match(resultFetch, /network cable or Wi-Fi/);

  // Database unreachable error code
  const dbUnreachableError = new Error("Unable to reach database server. (DATABASE_UNREACHABLE)");
  const resultDb = formatClientError(dbUnreachableError);
  assert.match(resultDb, /Database server is currently unreachable/);

  // Standard custom error preserved
  const validationError = new Error("Invalid phone number or password");
  assert.equal(formatClientError(validationError), "Invalid phone number or password");

  // Fallback
  assert.equal(formatClientError(null, "Custom fallback"), "Custom fallback");
});
