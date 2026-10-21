import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

test("Prisma schema contains all required domain models and enums", () => {
  const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
  assert.ok(fs.existsSync(schemaPath), "prisma/schema.prisma must exist");
  const schema = fs.readFileSync(schemaPath, "utf8");

  // Models
  assert.match(schema, /model Brand\s+\{/);
  assert.match(schema, /model User\s+\{/);
  assert.match(schema, /model Creator\s+\{/);
  assert.match(schema, /model Campaign\s+\{/);
  assert.match(schema, /model CampaignAssignment\s+\{/);
  assert.match(schema, /model Event\s+\{/);
  assert.match(schema, /model Sale\s+\{/);

  // Enums
  assert.match(schema, /enum UserRole\s+\{/);
  assert.match(schema, /enum CampaignStatus\s+\{/);
  assert.match(schema, /enum EventType\s+\{/);
});

test("Prisma Client exports all required model delegates", () => {
  const prisma = new PrismaClient({
    accelerateUrl: "https://accelerate.prisma.io/mock",
  });

  assert.ok(typeof prisma.brand !== "undefined", "brand delegate must exist");
  assert.ok(typeof prisma.user !== "undefined", "user delegate must exist");
  assert.ok(typeof prisma.creator !== "undefined", "creator delegate must exist");
  assert.ok(typeof prisma.campaign !== "undefined", "campaign delegate must exist");
  assert.ok(typeof prisma.campaignAssignment !== "undefined", "campaignAssignment delegate must exist");
  assert.ok(typeof prisma.event !== "undefined", "event delegate must exist");
  assert.ok(typeof prisma.sale !== "undefined", "sale delegate must exist");
});
