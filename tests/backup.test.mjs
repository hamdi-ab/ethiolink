import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { verifyBackupIntegrity } from "../scripts/restore-db.mjs";
import PrivacyPolicyPage from "../src/app/privacy/page.tsx";

test("verifyBackupIntegrity accurately verifies valid snapshot and manifest", () => {
  const tmpDir = path.resolve(process.cwd(), "test-tmp-backup");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const sampleData = {
    meta: { app: "EthioLink", version: "1.0", exportedAt: new Date().toISOString() },
    tables: {
      Brand: [{ id: "b1", name: "Bole Roasters" }],
      Campaign: [{ id: "c1", name: "Bole Launch" }],
      Sale: [{ id: "s1", amountETB: 450 }],
    },
  };

  const jsonStr = JSON.stringify(sampleData, null, 2);
  const hash = crypto.createHash("sha256").update(jsonStr, "utf8").digest("hex");

  const backupFile = path.join(tmpDir, "sample-backup.json");
  const manifestFile = path.join(tmpDir, "sample-backup.manifest.json");

  fs.writeFileSync(backupFile, jsonStr, "utf8");
  fs.writeFileSync(manifestFile, JSON.stringify({ sha256: hash, recordCounts: { Brand: 1, Campaign: 1, Sale: 1 } }, null, 2), "utf8");

  try {
    const result = verifyBackupIntegrity(backupFile, manifestFile);
    assert.equal(result.valid, true);
    assert.equal(result.sha256, hash);
    assert.equal(result.recordCounts.Brand, 1);
    assert.equal(result.recordCounts.Campaign, 1);
    assert.equal(result.recordCounts.Sale, 1);
  } finally {
    // Cleanup temporary files
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("verifyBackupIntegrity detects and rejects SHA-256 hash tampering", () => {
  const tmpDir = path.resolve(process.cwd(), "test-tmp-tamper");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const sampleData = {
    meta: { app: "EthioLink", version: "1.0" },
    tables: { Brand: [] },
  };

  const backupFile = path.join(tmpDir, "tampered-backup.json");
  const manifestFile = path.join(tmpDir, "tampered-backup.manifest.json");

  fs.writeFileSync(backupFile, JSON.stringify(sampleData), "utf8");
  fs.writeFileSync(manifestFile, JSON.stringify({ sha256: "0000000000000000000000000000000000000000000000000000000000000000" }), "utf8");

  try {
    assert.throws(() => {
      verifyBackupIntegrity(backupFile, manifestFile);
    }, /Integrity Check Failed/);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("verifyBackupIntegrity throws error when snapshot file is missing", () => {
  assert.throws(() => {
    verifyBackupIntegrity("non-existent-backup-file-999.json");
  }, /Backup file not found/);
});

test("PrivacyPolicyPage component exports successfully for React client consumption", () => {
  assert.ok(PrivacyPolicyPage !== null && typeof PrivacyPolicyPage !== "undefined");
});
