import crypto from "crypto";
import { getTelemetrySalt, TELEMETRY_DEDUP_WINDOW_MS } from "@/lib/config";

export const EVENT_TYPES = [
  "PAGE_VIEW",
  "TELEGRAM_CLICK",
  "CALL_CLICK",
  "MAP_CLICK",
  "COPY_CODE",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export function isValidEventType(type: unknown): type is EventType {
  return typeof type === "string" && EVENT_TYPES.includes(type as EventType);
}

/**
 * Generates a privacy-preserving SHA-256 hash using a rolling daily salt.
 * Ensures raw IP addresses are NEVER stored in the database.
 */
export function hashIpWithDailySalt(
  ip: string,
  date: Date = new Date(),
  secret: string = getTelemetrySalt()
): string {
  const dayKey = date.toISOString().slice(0, 10); // YYYY-MM-DD
  const normalizedIp = ip?.trim() || "127.0.0.1";
  return crypto
    .createHmac("sha256", secret)
    .update(`${dayKey}:${normalizedIp}`)
    .digest("hex");
}

export const DEDUPLICATION_WINDOW_MS = TELEMETRY_DEDUP_WINDOW_MS;
