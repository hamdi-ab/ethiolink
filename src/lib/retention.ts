import { db } from "@/lib/db";

export interface RetentionPolicyConfig {
  eventRetentionDays: number; // Default 90 days for raw telemetry
  dryRun?: boolean;
}

export interface RetentionPruneResult {
  dryRun: boolean;
  retentionDays: number;
  cutoffDate: string;
  eligibleEventsCount: number;
  deletedCount: number;
  durationMs: number;
}

export const DEFAULT_RETENTION_DAYS = 90;

/**
 * Calculates cutoff date for telemetry retention.
 */
export function calculateRetentionCutoff(retentionDays: number = DEFAULT_RETENTION_DAYS, fromDate: Date = new Date()): Date {
  const days = Math.max(1, Math.min(365 * 5, retentionDays));
  const cutoff = new Date(fromDate.getTime() - days * 24 * 60 * 60 * 1000);
  return cutoff;
}

/**
 * Prunes expired telemetry event logs older than retentionDays.
 * Sales ledgers and campaign configurations are permanently preserved for accounting integrity.
 * PRD FR-020 & Section 10.3 compliance.
 */
export async function pruneExpiredEvents(
  config: Partial<RetentionPolicyConfig> = {}
): Promise<RetentionPruneResult> {
  const startTime = Date.now();
  const retentionDays = config.eventRetentionDays || DEFAULT_RETENTION_DAYS;
  const dryRun = config.dryRun ?? false;
  const cutoffDate = calculateRetentionCutoff(retentionDays);

  const eligibleCount = await db.event.count({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  let deletedCount = 0;
  if (!dryRun && eligibleCount > 0) {
    const res = await db.event.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
    deletedCount = res.count;
  }

  const durationMs = Date.now() - startTime;

  return {
    dryRun,
    retentionDays,
    cutoffDate: cutoffDate.toISOString(),
    eligibleEventsCount: eligibleCount,
    deletedCount: dryRun ? 0 : deletedCount,
    durationMs,
  };
}

/**
 * Gathers retention overview statistics across telemetry and transaction tables.
 */
export async function getRetentionStats(retentionDays: number = DEFAULT_RETENTION_DAYS) {
  const cutoffDate = calculateRetentionCutoff(retentionDays);

  const [totalEvents, expiredEvents, oldestEvent, totalSales] = await Promise.all([
    db.event.count(),
    db.event.count({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    }),
    db.event.findFirst({
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
    db.sale.count(),
  ]);

  return {
    retentionDays,
    cutoffDate: cutoffDate.toISOString(),
    totalEvents,
    expiredEvents,
    activeEvents: totalEvents - expiredEvents,
    oldestEventDate: oldestEvent ? oldestEvent.createdAt.toISOString() : null,
    totalPermanentSales: totalSales,
  };
}
