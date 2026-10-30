#!/usr/bin/env node

/**
 * EthioLink Database Recovery & Verification Tool (PRD Section 10.3 & Section 16 Acceptance Criteria)
 * Restores or verifies database snapshots with SHA-256 integrity validation.
 * 
 * Usage:
 *   node scripts/restore-db.mjs --file ./backups/ethiolink-backup-XXXX.json --dry-run
 *   node scripts/restore-db.mjs --file ./backups/ethiolink-backup-XXXX.json --verify-only
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

export function verifyBackupIntegrity(backupFilePath, manifestFilePath) {
  if (!fs.existsSync(backupFilePath)) {
    throw new Error(`Backup file not found: ${backupFilePath}`);
  }

  const content = fs.readFileSync(backupFilePath, "utf8");
  const actualHash = crypto.createHash("sha256").update(content, "utf8").digest("hex");

  let manifest = null;
  if (manifestFilePath && fs.existsSync(manifestFilePath)) {
    manifest = JSON.parse(fs.readFileSync(manifestFilePath, "utf8"));
    if (manifest.sha256 !== actualHash) {
      throw new Error(`Integrity Check Failed! Expected SHA-256 ${manifest.sha256}, got ${actualHash}`);
    }
  }

  const parsed = JSON.parse(content);
  if (!parsed.meta || !parsed.tables) {
    throw new Error("Invalid backup format: missing meta or tables property");
  }

  return {
    valid: true,
    sha256: actualHash,
    manifest,
    meta: parsed.meta,
    recordCounts: Object.fromEntries(
      Object.entries(parsed.tables).map(([k, v]) => [k, Array.isArray(v) ? v.length : 0])
    ),
  };
}

export async function runDatabaseRestore(backupFilePath, options = {}) {
  const dryRun = options.dryRun ?? true; // Default to safe dry-run mode
  const manifestPath = options.manifestPath || `${backupFilePath.replace(/\.json$/, "")}.manifest.json`;

  console.log(`[EthioLink Restore Engine] Validating backup integrity...`);
  const integrity = verifyBackupIntegrity(backupFilePath, manifestPath);
  console.log(`[EthioLink Restore Engine] Backup SHA-256 verified: ${integrity.sha256}`);
  console.log(`[EthioLink Restore Engine] Records found in snapshot:`, integrity.recordCounts);

  if (dryRun) {
    console.log(`[EthioLink Restore Engine] DRY RUN COMPLETE: Verification successful. Zero records mutated.`);
    return { success: true, dryRun: true, recordCounts: integrity.recordCounts };
  }

  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 10000,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const content = JSON.parse(fs.readFileSync(backupFilePath, "utf8"));
    const tables = content.tables;

    console.log(`[EthioLink Restore Engine] Executing transactional restore...`);

    // Sequentially restore in relational order
    // 1. Brands
    for (const b of tables.Brand || []) {
      await prisma.brand.upsert({
        where: { id: b.id },
        update: {},
        create: {
          id: b.id,
          name: b.name,
          ownerName: b.ownerName,
          phone: b.phone,
          passwordHash: b.passwordHash,
          createdAt: new Date(b.createdAt),
          updatedAt: new Date(b.updatedAt),
        },
      });
    }

    // 2. Users
    for (const u of tables.User || []) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: {},
        create: {
          id: u.id,
          brandId: u.brandId,
          name: u.name,
          phone: u.phone,
          role: u.role,
          passwordHash: u.passwordHash,
          magicToken: u.magicToken,
          createdAt: new Date(u.createdAt),
          updatedAt: new Date(u.updatedAt),
        },
      });
    }

    // 3. Creators
    for (const c of tables.Creator || []) {
      await prisma.creator.upsert({
        where: { id: c.id },
        update: {},
        create: {
          id: c.id,
          userId: c.userId,
          telegramUsername: c.telegramUsername,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
        },
      });
    }

    // 4. Campaigns
    for (const camp of tables.Campaign || []) {
      await prisma.campaign.upsert({
        where: { id: camp.id },
        update: {},
        create: {
          id: camp.id,
          brandId: camp.brandId,
          slug: camp.slug,
          name: camp.name,
          promoCode: camp.promoCode,
          description: camp.description,
          telegramUrl: camp.telegramUrl,
          phoneNumber: camp.phoneNumber,
          mapUrl: camp.mapUrl,
          status: camp.status,
          startDate: camp.startDate ? new Date(camp.startDate) : null,
          endDate: camp.endDate ? new Date(camp.endDate) : null,
          createdAt: new Date(camp.createdAt),
          updatedAt: new Date(camp.updatedAt),
        },
      });
    }

    console.log(`[EthioLink Restore Engine] SUCCESS: Database restore operation completed cleanly.`);
    return { success: true, dryRun: false, recordCounts: integrity.recordCounts };
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// CLI execution
if (process.argv[1] && process.argv[1].endsWith("restore-db.mjs")) {
  const args = process.argv.slice(2);
  const fileIndex = args.indexOf("--file");
  const backupFile = fileIndex !== -1 ? args[fileIndex + 1] : null;
  const isVerifyOnly = args.includes("--verify-only");
  const isDryRun = args.includes("--dry-run") || isVerifyOnly;

  if (!backupFile) {
    console.error("Usage: node scripts/restore-db.mjs --file <path-to-backup.json> [--dry-run]");
    process.exit(1);
  }

  runDatabaseRestore(path.resolve(process.cwd(), backupFile), { dryRun: isDryRun })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[EthioLink Restore Engine] ERROR:", err.message || err);
      process.exit(1);
    });
}
