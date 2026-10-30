"use client";

import React, { useState } from "react";
import { X, UserPlus, Copy, Check, Loader2, Link as LinkIcon } from "lucide-react";
import { getBaseUrl } from "@/lib/config";

export interface InviteCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    id: string;
    name: string;
  };
}

export function InviteCampaignModal({
  isOpen,
  onClose,
  campaign,
}: InviteCampaignModalProps) {
  const [creatorName, setCreatorName] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setInviteUrl(null);

    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorName: creatorName.trim() || undefined }),
      });

      const data = (await res.json().catch(() => null)) as {
        inviteUrl?: string;
        error?: string;
      } | null;

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to generate invite link");
      }

      const base = getBaseUrl();
      setInviteUrl(`${base}${data?.inviteUrl ?? ""}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleClose = () => {
    setCreatorName("");
    setInviteUrl(null);
    setError(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-headline text-slate-900 dark:text-slate-100">
                Invite Creator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {campaign.name}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Generate a magic invite link for a creator to join this campaign.
            The link is valid for <span className="font-semibold text-slate-700 dark:text-slate-300">30 days</span>.
          </p>

          {/* Optional creator name */}
          <div className="space-y-1.5">
            <label
              htmlFor="creator-name"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide"
            >
              Creator name <span className="font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <input
              id="creator-name"
              type="text"
              placeholder="e.g. Abebe Bikila"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              disabled={isGenerating}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all disabled:opacity-60"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">{error}</p>
          )}

          {/* Generated invite URL */}
          {inviteUrl && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Invite link
              </p>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5">
                <LinkIcon className="w-4 h-4 shrink-0 text-violet-500" />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-mono truncate flex-1">
                  {inviteUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors cursor-pointer"
                  aria-label="Copy invite link"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Share this link directly with the creator. They will be prompted to register or sign in as a creator for this campaign.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
            >
              {inviteUrl ? "Done" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-60 rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating…
                </>
              ) : inviteUrl ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  Regenerate
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Generate Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
