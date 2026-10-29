#!/usr/bin/env node

/**
 * EthioLink Telemetry Data Retention Engine (PRD FR-020 & Section 10.3)
 * Automatically prunes raw event logs older than configured threshold (default 90 days)
 * while permanently preserving sales records and campaign configurations.
 * 
 * Usage:
 *   node scripts/retention-cleanup.mjs
 *   node scripts/retention-cleanup.mjs --dry-run
 *   node scripts/retention-cleanup.mjs --days 60
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/ethiolink?schema=public";

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 10000,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const daysIndex = args.indexOf("--days");
  const days = daysIndex !== -1 && args[daysIndex + 1] ? parseInt(args[daysIndex + 1], 10) : 90;

  console.log(`[EthioLink Retention Engine] Initializing with ${days} days threshold (dryRun: ${dryRun})...`);

  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  console.log(`[EthioLink Retention Engine] Cutoff timestamp: ${cutoff.toISOString()}`);

  try {
    const eligibleCount = await prisma.event.count({
      where: { createdAt: { lt: cutoff } },
    });

    console.log(`[EthioLink Retention Engine] Found ${eligibleCount} expired telemetry events eligible for deletion.`);

    if (dryRun) {
      console.log(`[EthioLink Retention Engine] DRY RUN COMPLETE: 0 events deleted.`);
      process.exit(0);
    }

    if (eligibleCount > 0) {
      const deleteResult = await prisma.event.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });
      console.log(`[EthioLink Retention Engine] SUCCESS: Pruned ${deleteResult.count} expired telemetry records.`);
    } else {
      console.log(`[EthioLink Retention Engine] Zero expired records. No cleanup needed.`);
    }
  } catch (err) {
    console.error(`[EthioLink Retention Engine] ERROR during retention prune:`, err.message || err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Unhandled fatal exception in retention cleanup:", err);
  process.exit(1);
});
