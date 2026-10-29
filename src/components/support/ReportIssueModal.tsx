"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  LifeBuoy,
  Send,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { IssueCategory, IssuePriority } from "@prisma/client";
import { VALID_CATEGORIES, VALID_PRIORITIES, getIssueCategoryMeta } from "@/lib/issues";

export interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns?: Array<{ id: string; name: string; promoCode: string }>;
  defaultCampaignId?: string | null;
  defaultSaleId?: string | null;
  onSuccess?: () => void;
}

interface ReportIssueFormProps {
  onClose: () => void;
  campaigns: Array<{ id: string; name: string; promoCode: string }>;
  defaultCampaignId: string | null;
  defaultSaleId: string | null;
  onSuccess?: () => void;
}

function ReportIssueForm({
  onClose,
  campaigns,
  defaultCampaignId,
  defaultSaleId,
  onSuccess,
}: ReportIssueFormProps) {
  const [category, setCategory] = useState<IssueCategory>("ATTRIBUTION_DISCREPANCY");
  const [priority, setPriority] = useState<IssuePriority>("MEDIUM");
  const [campaignId, setCampaignId] = useState<string>(defaultCampaignId || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!title.trim() || title.trim().length < 3) {
      setError("Please provide a concise title (at least 3 characters).");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setError("Please explain the problem in detail (at least 10 characters).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/support/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          priority,
          campaignId: campaignId ? campaignId : null,
          saleId: defaultSaleId ? defaultSaleId : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.details?.[0] || "Failed to submit operational report");
      }

      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => !loading && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50 flex items-center justify-center shrink-0">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-slate-900 dark:text-slate-100">
                Report Operational Issue
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Submit campaign discrepancies or technical concerns directly to Ops
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="font-headline font-bold text-slate-900 dark:text-white text-base">
              Issue Submitted to Operations
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Your report has been logged in the admin operations console with ticket priority{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{priority}</span>. Our team will review the telemetry and audit trail.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Category Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Issue Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IssueCategory)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {VALID_CATEGORIES.map((cat) => {
                  const meta = getIssueCategoryMeta(cat);
                  return (
                    <option key={cat} value={cat}>
                      {meta.label} ({meta.amharic})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Campaign Selector (if campaigns provided) */}
            {campaigns.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Associated Campaign <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- No specific campaign --</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.promoCode})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Summary Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Telegram link returning error 404, or In-store purchase missing"
                maxLength={150}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Provide specific details: dates, amounts, device type, or unexpected behavior observed..."
                maxLength={2000}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Priority Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Urgency Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {VALID_PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                      priority === p
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-white shadow-2xs"
                        : "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Submit to Ops
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function ReportIssueModal(props: ReportIssueModalProps) {
  if (!props.isOpen) return null;

  return (
    <ReportIssueForm
      key={props.defaultCampaignId || "new"}
      onClose={props.onClose}
      campaigns={props.campaigns || []}
      defaultCampaignId={props.defaultCampaignId || null}
      defaultSaleId={props.defaultSaleId || null}
      onSuccess={props.onSuccess}
    />
  );
}
