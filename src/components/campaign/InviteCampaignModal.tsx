"use client";

import React, { useState } from "react";
import { UserPlus, Copy, Check, Loader2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { getBaseUrl } from "@/lib/config";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
      const fullUrl = `${base}${data?.inviteUrl ?? ""}`;
      setInviteUrl(fullUrl);
      toast.success("Magic invite link created");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Invite link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link to clipboard");
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-1.5 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold font-headline text-slate-900 dark:text-slate-100">
                Invite Creator
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                {campaign.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Generate a magic invite link for an influencer to join this campaign. The link is signed and active for <span className="font-semibold text-slate-700 dark:text-slate-300">30 days</span>.
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
              placeholder="e.g. Helen Lifestyle"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              disabled={isGenerating}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-60"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
          )}

          {/* Generated invite URL */}
          {inviteUrl && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Invite link
              </p>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5">
                <LinkIcon className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-mono truncate flex-1">
                  {inviteUrl}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleCopy}
                  className="shrink-0 cursor-pointer"
                  aria-label="Copy invite link"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Send this link to the creator. They will authenticate or register and be assigned to this campaign.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 cursor-pointer"
            >
              {inviteUrl ? "Done" : "Cancel"}
            </Button>
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Generating…
                </>
              ) : inviteUrl ? (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Regenerate
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Generate Link
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
