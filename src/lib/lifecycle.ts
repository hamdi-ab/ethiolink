import { CampaignStatus } from "@prisma/client";

export type CampaignLifecycleStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "EXPIRED";

export interface LifecycleCandidate {
  status: CampaignStatus | string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}

export interface ActivityCheckResult {
  active: boolean;
  effectiveStatus: CampaignLifecycleStatus;
  reason?: "PAUSED" | "NOT_STARTED" | "EXPIRED" | "COMPLETED" | "DRAFT";
}

/**
 * Evaluates whether a campaign is currently active based on its explicit status
 * and start/end time window boundaries.
 */
export function evaluateCampaignLifecycle(
  campaign: LifecycleCandidate,
  now = new Date()
): ActivityCheckResult {
  const rawStatus = (campaign.status || "ACTIVE") as CampaignLifecycleStatus;

  // 1. Explicit terminal or paused statuses
  if (rawStatus === "PAUSED") {
    return { active: false, effectiveStatus: "PAUSED", reason: "PAUSED" };
  }
  if (rawStatus === "COMPLETED") {
    return { active: false, effectiveStatus: "COMPLETED", reason: "COMPLETED" };
  }
  if (rawStatus === "EXPIRED") {
    return { active: false, effectiveStatus: "EXPIRED", reason: "EXPIRED" };
  }
  if (rawStatus === "DRAFT") {
    return { active: false, effectiveStatus: "DRAFT", reason: "DRAFT" };
  }

  // 2. Start date window check
  if (campaign.startDate) {
    const start = new Date(campaign.startDate);
    if (!isNaN(start.getTime()) && now.getTime() < start.getTime()) {
      return { active: false, effectiveStatus: "DRAFT", reason: "NOT_STARTED" };
    }
  }

  // 3. End date window check
  if (campaign.endDate) {
    const end = new Date(campaign.endDate);
    if (!isNaN(end.getTime()) && now.getTime() > end.getTime()) {
      return { active: false, effectiveStatus: "EXPIRED", reason: "EXPIRED" };
    }
  }

  return { active: true, effectiveStatus: "ACTIVE" };
}

/**
 * Returns true if the campaign is currently running and accepting events/sales.
 */
export function isCampaignActive(
  campaign: LifecycleCandidate,
  now = new Date()
): boolean {
  return evaluateCampaignLifecycle(campaign, now).active;
}

/**
 * Returns the effective computed status of the campaign.
 */
export function getEffectiveStatus(
  campaign: LifecycleCandidate,
  now = new Date()
): CampaignLifecycleStatus {
  return evaluateCampaignLifecycle(campaign, now).effectiveStatus;
}

/**
 * Returns accessible styling tokens for status badges adhering to CODING_STANDARDS.md.
 */
export function getStatusBadgeConfig(effectiveStatus: CampaignLifecycleStatus | string) {
  switch (effectiveStatus) {
    case "ACTIVE":
      return {
        label: "ACTIVE",
        badgeClass:
          "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
        dotClass: "bg-emerald-500",
      };
    case "PAUSED":
      return {
        label: "PAUSED",
        badgeClass:
          "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
        dotClass: "bg-amber-500",
      };
    case "EXPIRED":
      return {
        label: "EXPIRED",
        badgeClass:
          "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800",
        dotClass: "bg-rose-500",
      };
    case "COMPLETED":
      return {
        label: "COMPLETED",
        badgeClass:
          "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
        dotClass: "bg-slate-400",
      };
    case "DRAFT":
    default:
      return {
        label: effectiveStatus,
        badgeClass:
          "bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800",
        dotClass: "bg-sky-500",
      };
  }
}
