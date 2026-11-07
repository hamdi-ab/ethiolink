"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  LifeBuoy,
  Send,
  Loader2,
  Check,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { IssueCategory, IssuePriority } from "@prisma/client";
import { VALID_CATEGORIES, VALID_PRIORITIES, getIssueCategoryMeta } from "@/lib/issues";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
      <div className="relative w-full max-w-lg bg-white dark:bg-[#14211D] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#26372F] overflow-hidden z-10 animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#26372F] bg-slate-50/50 dark:bg-[#101C18]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50 flex items-center justify-center shrink-0">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-slate-900 dark:text-[#F1F5F1]">
                Report Operational Issue
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#9BAAA1]">
                Submit campaign discrepancies or technical concerns directly to Ops
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-[#F1F5F1] hover:bg-slate-100 dark:hover:bg-[#1A2A24] transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-[#193629] text-emerald-600 dark:text-[#83D1A5] flex items-center justify-center mx-auto border border-emerald-200 dark:border-[#26372F]">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="font-headline font-bold text-slate-900 dark:text-[#F1F5F1] text-base">
              Issue Submitted to Operations
            </h4>
            <p className="text-xs text-slate-500 dark:text-[#9BAAA1] max-w-sm mx-auto">
              Your report has been logged in the admin operations console with ticket priority{" "}
              <span className="font-semibold text-slate-700 dark:text-[#C0CCC4]">{priority}</span>. Our team will review the telemetry and audit trail.
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#C0CCC4]">
                Issue Category <span className="text-rose-500">*</span>
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-full h-10 flex items-center justify-between px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#101C18] border border-slate-300 dark:border-[#304239] text-slate-900 dark:text-[#F1F5F1] shadow-2xs hover:bg-slate-100 dark:hover:bg-[#1A2A24] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                  >
                    <span className="font-medium truncate">
                      {getIssueCategoryMeta(category).label} ({getIssueCategoryMeta(category).amharic})
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400 dark:text-[#9BAAA1] shrink-0 ml-2" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-80 max-h-72 overflow-y-auto p-1.5 bg-white dark:bg-[#14211D] border border-slate-200 dark:border-[#26372F] shadow-xl rounded-xl z-50 text-xs"
                >
                  <DropdownMenuLabel className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9BAAA1]">
                    Select Issue Category
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-[#26372F]" />
                  {VALID_CATEGORIES.map((cat) => {
                    const meta = getIssueCategoryMeta(cat);
                    const isSelected = category === cat;
                    return (
                      <DropdownMenuItem
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          isSelected
                            ? "bg-emerald-50 dark:bg-[#193629] text-emerald-800 dark:text-[#83D1A5] font-semibold"
                            : "text-slate-700 dark:text-[#C0CCC4] hover:bg-slate-50 dark:hover:bg-[#1A2A24]"
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-[#F1F5F1]">
                            {meta.label}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-[#9BAAA1]">
                            {meta.amharic}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-[#78B99D] shrink-0" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Campaign Selector (if campaigns provided) */}
            {campaigns.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-[#C0CCC4]">
                  Associated Campaign <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="w-full h-10 flex items-center justify-between px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#101C18] border border-slate-300 dark:border-[#304239] text-slate-900 dark:text-[#F1F5F1] shadow-2xs hover:bg-slate-100 dark:hover:bg-[#1A2A24] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                    >
                      <span className="font-medium truncate">
                        {campaignId
                          ? campaigns.find((c) => c.id === campaignId)
                            ? `${campaigns.find((c) => c.id === campaignId)?.name} (${campaigns.find((c) => c.id === campaignId)?.promoCode})`
                            : "Select Campaign"
                          : "No specific campaign"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400 dark:text-[#9BAAA1] shrink-0 ml-2" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-80 max-h-72 overflow-y-auto p-1.5 bg-white dark:bg-[#14211D] border border-slate-200 dark:border-[#26372F] shadow-xl rounded-xl z-50 text-xs"
                  >
                    <DropdownMenuLabel className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9BAAA1]">
                      Associated Campaign
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-[#26372F]" />
                    <DropdownMenuItem
                      onClick={() => setCampaignId("")}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                        campaignId === ""
                          ? "bg-emerald-50 dark:bg-[#193629] text-emerald-800 dark:text-[#83D1A5] font-semibold"
                          : "text-slate-700 dark:text-[#C0CCC4] hover:bg-slate-50 dark:hover:bg-[#1A2A24]"
                      }`}
                    >
                      <span className="text-slate-500 dark:text-[#9BAAA1]">No specific campaign</span>
                      {campaignId === "" && (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-[#78B99D] shrink-0" />
                      )}
                    </DropdownMenuItem>
                    {campaigns.map((c) => {
                      const isSelected = campaignId === c.id;
                      return (
                        <DropdownMenuItem
                          key={c.id}
                          onClick={() => setCampaignId(c.id)}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                            isSelected
                              ? "bg-emerald-50 dark:bg-[#193629] text-emerald-800 dark:text-[#83D1A5] font-semibold"
                              : "text-slate-700 dark:text-[#C0CCC4] hover:bg-slate-50 dark:hover:bg-[#1A2A24]"
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="font-semibold text-slate-900 dark:text-[#F1F5F1] truncate">
                              {c.name}
                            </div>
                            <div className="text-[10px] text-emerald-700 dark:text-[#78B99D] font-mono">
                              {c.promoCode}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-emerald-600 dark:text-[#78B99D] shrink-0" />
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#C0CCC4]">
                Summary Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Telegram link returning error 404, or In-store purchase missing"
                maxLength={150}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#101C18] border border-slate-300 dark:border-[#304239] text-slate-900 dark:text-[#F1F5F1] placeholder:text-slate-400 dark:placeholder:text-[#9BAAA1]/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#C0CCC4]">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Provide specific details: dates, amounts, device type, or unexpected behavior observed..."
                maxLength={2000}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#101C18] border border-slate-300 dark:border-[#304239] text-slate-900 dark:text-[#F1F5F1] placeholder:text-slate-400 dark:placeholder:text-[#9BAAA1]/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Priority Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#C0CCC4]">
                Urgency Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {VALID_PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                      priority === p
                        ? "bg-slate-900 text-white dark:bg-[#78B99D] dark:text-[#0D1714] border-slate-900 dark:border-[#78B99D] shadow-2xs font-semibold"
                        : "bg-slate-50 dark:bg-[#101C18] text-slate-600 dark:text-[#C0CCC4] border-slate-200 dark:border-[#304239] hover:bg-slate-100 dark:hover:bg-[#1A2A24]"
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
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#9BAAA1] hover:bg-slate-100 dark:hover:bg-[#1A2A24] transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
