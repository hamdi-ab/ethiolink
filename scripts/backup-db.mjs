#!/usr/bin/env node

/**
 * EthioLink Automated Database Backup Pipeline (PRD Section 10.3 & Section 16 Acceptance Criteria)
 * Generates point-in-time structured backups with SHA-256 integrity checksums and verification manifests.
 * 
 * Usage:
 *   node scripts/backup-db.mjs
 *   node scripts/backup-db.mjs --out-dir ./backups
 *   node scripts/backup-db.mjs --dry-run
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/ethiolink?schema=public";

export async function runDatabaseBackup(options = {}) {
  const dryRun = options.dryRun ?? false;
  const outDir = options.outDir || path.resolve(process.cwd(), "backups");

  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 10000,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log(`[EthioLink Backup Pipeline] Starting database snapshot... (dryRun: ${dryRun})`);

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `ethiolink-backup-${timestamp}.json`;
    const manifestName = `ethiolink-backup-${timestamp}.manifest.json`;

    // Extract all domain entities
    const [
      brands,
      users,
      creators,
      campaigns,
      assignments,
      events,
      sales,
      issues,
    ] = await Promise.all([
      prisma.brand.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.creator.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.campaign.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.campaignAssignment.findMany({ orderBy: { assignedAt: "asc" } }),
      prisma.event.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.sale.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.operationalIssue.findMany({ orderBy: { createdAt: "asc" } }),
    ]);

    const backupData = {
      meta: {
        app: "EthioLink",
        version: "1.0",
        schemaVersion: "2026-10-29",
        exportedAt: new Date().toISOString(),
      },
      tables: {
        Brand: brands,
        User: users,
        Creator: creators,
        Campaign: campaigns,
        CampaignAssignment: assignments,
        Event: events,
        Sale: sales,
        OperationalIssue: issues,
      },
    };

    const recordCounts = {
      Brand: brands.length,
      User: users.length,
      Creator: creators.length,
      Campaign: campaigns.length,
      CampaignAssignment: assignments.length,
      Event: events.length,
      Sale: sales.length,
      OperationalIssue: issues.length,
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const sha256 = crypto.createHash("sha256").update(jsonString, "utf8").digest("hex");

    const manifest = {
      app: "EthioLink",
      snapshotFile: filename,
      exportedAt: new Date().toISOString(),
      sha256,
      byteSize: Buffer.byteLength(jsonString, "utf8"),
      recordCounts,
      totalRecords: Object.values(recordCounts).reduce((a, b) => a + b, 0),
    };

    console.log(`[EthioLink Backup Pipeline] Extracted ${manifest.totalRecords} records across 8 tables.`);
    console.log(`[EthioLink Backup Pipeline] SHA-256 Checksum: ${sha256}`);

    if (!dryRun) {
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      const backupPath = path.join(outDir, filename);
      const manifestPath = path.join(outDir, manifestName);

      fs.writeFileSync(backupPath, jsonString, "utf8");
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
      console.log(`[EthioLink Backup Pipeline] Saved snapshot: ${backupPath}`);
      console.log(`[EthioLink Backup Pipeline] Saved manifest: ${manifestPath}`);
    } else {
      console.log(`[EthioLink Backup Pipeline] DRY RUN COMPLETE: Snapshot generated in memory, not written to disk.`);
    }

    return {
      success: true,
      manifest,
      filename: dryRun ? null : filename,
      dryRun,
    };
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// CLI execution
if (process.argv[1] && process.argv[1].endsWith("backup-db.mjs")) {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const outDirIndex = args.indexOf("--out-dir");
  const outDir = outDirIndex !== -1 && args[outDirIndex + 1] ? args[outDirIndex + 1] : undefined;

  runDatabaseBackup({ dryRun, outDir })
    .then(() => {
      console.log("[EthioLink Backup Pipeline] SUCCESS: Backup procedure complete.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[EthioLink Backup Pipeline] FATAL ERROR:", err);
      process.exit(1);
    });
}
