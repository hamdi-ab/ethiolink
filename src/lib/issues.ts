import { IssueCategory, IssueStatus, IssuePriority } from "@prisma/client";

export interface IssueValidationResult {
  valid: boolean;
  errors: string[];
}

export interface IssuePayload {
  title: string;
  description: string;
  category: IssueCategory;
  priority?: IssuePriority;
  campaignId?: string | null;
  saleId?: string | null;
}

export const VALID_CATEGORIES: IssueCategory[] = [
  "CAMPAIGN_LINK_DOWN",
  "ATTRIBUTION_DISCREPANCY",
  "TRANSACTION_DISPUTE",
  "TECHNICAL_BUG",
  "GENERAL_INQUIRY",
];

export const VALID_STATUSES: IssueStatus[] = [
  "OPEN",
  "IN_REVIEW",
  "RESOLVED",
  "DISMISSED",
];

export const VALID_PRIORITIES: IssuePriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

/**
 * Validates issue creation payload according to PRD FR-040 standards.
 */
export function validateIssuePayload(payload: unknown): {
  valid: boolean;
  data?: IssuePayload;
  errors: string[];
} {
  const errors: string[] = [];

  if (!payload || typeof payload !== "object") {
    return { valid: false, errors: ["Invalid payload: object expected"] };
  }

  const p = payload as Partial<IssuePayload>;

  if (typeof p.title !== "string" || p.title.trim().length < 3 || p.title.trim().length > 150) {
    errors.push("Title must be between 3 and 150 characters");
  }

  if (typeof p.description !== "string" || p.description.trim().length < 10 || p.description.trim().length > 2000) {
    errors.push("Description must be between 10 and 2000 characters");
  }

  if (!p.category || !VALID_CATEGORIES.includes(p.category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(", ")}`);
  }

  let priority: IssuePriority = "MEDIUM";
  if (p.priority) {
    if (!VALID_PRIORITIES.includes(p.priority)) {
      errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(", ")}`);
    } else {
      priority = p.priority;
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      title: p.title!.trim(),
      description: p.description!.trim(),
      category: p.category!,
      priority,
      campaignId: typeof p.campaignId === "string" && p.campaignId.trim() ? p.campaignId.trim() : null,
      saleId: typeof p.saleId === "string" && p.saleId.trim() ? p.saleId.trim() : null,
    },
    errors: [],
  };
}

/**
 * Returns human-readable label and styling tokens for issue categories.
 */
export function getIssueCategoryMeta(category: IssueCategory) {
  switch (category) {
    case "ATTRIBUTION_DISCREPANCY":
      return {
        label: "Attribution Discrepancy",
        amharic: "የአስተዋፅኦ አለመጣጣም",
        badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
      };
    case "CAMPAIGN_LINK_DOWN":
      return {
        label: "Destination Link Down",
        amharic: "የዘመቻ ሊንክ ተቋርጧል",
        badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/50",
      };
    case "TRANSACTION_DISPUTE":
      return {
        label: "Transaction Dispute",
        amharic: "የሽያጭ አለመግባባት",
        badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-900/50",
      };
    case "TECHNICAL_BUG":
      return {
        label: "Technical Bug",
        amharic: "ቴክኒካዊ ችግር",
        badgeClass: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-900/50",
      };
    case "GENERAL_INQUIRY":
    default:
      return {
        label: "General Inquiry",
        amharic: "አጠቃላይ ጥያቄ",
        badgeClass: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      };
  }
}

/**
 * Returns styling tokens and labels for issue statuses.
 */
export function getIssueStatusMeta(status: IssueStatus) {
  switch (status) {
    case "OPEN":
      return {
        label: "Open",
        amharic: "ክፍት",
        badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
      };
    case "IN_REVIEW":
      return {
        label: "In Review",
        amharic: "በግምገማ ላይ",
        badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
      };
    case "RESOLVED":
      return {
        label: "Resolved",
        amharic: "ተፈትቷል",
        badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
      };
    case "DISMISSED":
      return {
        label: "Dismissed",
        amharic: "ውድቅ ተደርጓል",
        badgeClass: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
      };
  }
}

/**
 * Returns styling tokens and labels for issue priority levels.
 */
export function getIssuePriorityMeta(priority: IssuePriority) {
  switch (priority) {
    case "URGENT":
      return {
        label: "Urgent",
        badgeClass: "bg-red-600 text-white dark:bg-red-700",
      };
    case "HIGH":
      return {
        label: "High",
        badgeClass: "bg-orange-500 text-white dark:bg-orange-600",
      };
    case "MEDIUM":
      return {
        label: "Medium",
        badgeClass: "bg-amber-500 text-white dark:bg-amber-600",
      };
    case "LOW":
    default:
      return {
        label: "Low",
        badgeClass: "bg-slate-500 text-white dark:bg-slate-600",
      };
  }
}
