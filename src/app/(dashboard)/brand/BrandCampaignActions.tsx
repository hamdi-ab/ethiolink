"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, UserPlus, QrCode, Play, Pause, Loader2, Pencil, LifeBuoy } from "lucide-react";
import { CampaignShareModal } from "@/components/campaign/CampaignShareModal";
import { EditCampaignModal } from "@/components/campaign/EditCampaignModal";
import { InviteCampaignModal } from "@/components/campaign/InviteCampaignModal";
import { ReportIssueModal } from "@/components/support/ReportIssueModal";

export interface BrandCampaignActionsProps {
  campaign: {
    id: string;
    name: string;
    slug: string;
    promoCode: string;
    brandName: string;
    status: string;
    effectiveStatus?: string;
    description?: string | null;
    telegramUrl?: string | null;
    phoneNumber?: string | null;
    mapUrl?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  };
}

export function BrandCampaignActions({ campaign }: BrandCampaignActionsProps) {
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>(campaign.status);
  const [isToggling, setIsToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const isActive = currentStatus === "ACTIVE";
  const isTerminal = currentStatus === "COMPLETED" || currentStatus === "EXPIRED";

  const handleToggleStatus = async () => {
    if (isToggling || isTerminal) return;
    const nextStatus = isActive ? "PAUSED" : "ACTIVE";
    setIsToggling(true);
    setToggleError(null);

    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Failed to update campaign to ${nextStatus}`);
      }

      setCurrentStatus(nextStatus);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle status";
      setToggleError(msg);
      setTimeout(() => setToggleError(null), 4000);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="flex items-center gap-2 shrink-0">
          {/* Pause / Resume Lifecycle Toggle */}
          {!isTerminal && (
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={isToggling}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                isActive
                  ? "bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 focus-visible:ring-amber-500"
                  : "bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 focus-visible:ring-emerald-500"
              }`}
              title={isActive ? "Pause Campaign Telemetry & Public Promotion" : "Resume Campaign"}
            >
              {isToggling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isActive ? (
                <Pause className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              ) : (
                <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              )}
              <span>{isActive ? "Pause" : "Resume"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/80 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title="Open POS QR Code & Telegram Sharing Suite"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>POS QR &amp; Share</span>
          </button>

          <Link
            href={`/c/${campaign.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            title="Edit Campaign Details & Destinations"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            title="Generate a magic invite link for a creator"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            title="Report Campaign Discrepancy or Link Downtime to Ops"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-amber-500" />
            <span>Report</span>
          </button>
        </div>

        {toggleError && (
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            {toggleError}
          </span>
        )}
      </div>

      <InviteCampaignModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        campaign={{ id: campaign.id, name: campaign.name }}
      />

      <CampaignShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        campaign={campaign}
      />

      <EditCampaignModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        campaign={campaign}
      />

      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        campaigns={[{ id: campaign.id, name: campaign.name, promoCode: campaign.promoCode }]}
        defaultCampaignId={campaign.id}
      />
    </>
  );
}
