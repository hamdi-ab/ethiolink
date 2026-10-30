"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  UserPlus,
  QrCode,
  Play,
  Pause,
  Loader2,
  Pencil,
  LifeBuoy,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

  const isActive = currentStatus === "ACTIVE";
  const isTerminal = currentStatus === "COMPLETED" || currentStatus === "EXPIRED";

  const handleToggleStatus = async () => {
    if (isToggling || isTerminal) return;
    const nextStatus = isActive ? "PAUSED" : "ACTIVE";
    setIsToggling(true);

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
      toast.success(
        nextStatus === "ACTIVE"
          ? `Campaign "${campaign.name}" resumed`
          : `Campaign "${campaign.name}" paused`
      );
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle status";
      toast.error(msg);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5 flex-wrap shrink-0">
        {/* Pause / Resume Lifecycle Toggle */}
        {!isTerminal && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            disabled={isToggling}
            className={`font-semibold cursor-pointer shadow-2xs text-xs h-8 px-2.5 rounded-xl ${
              isActive
                ? "bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80"
                : "bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80"
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
          </Button>
        )}

        {/* POS QR & Share */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsShareModalOpen(true)}
          className="text-xs h-8 px-2.5 font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border-emerald-200/80 dark:border-emerald-800/80 rounded-xl cursor-pointer shadow-2xs"
          title="Open POS QR Code & Telegram Sharing Suite"
        >
          <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>POS QR &amp; Share</span>
        </Button>

        {/* Preview Link */}
        <Button
          variant="outline"
          size="sm"
          asChild
          className="text-xs h-8 px-2.5 font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer shadow-2xs"
        >
          <Link href={`/c/${campaign.slug}`} target="_blank">
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Preview</span>
          </Link>
        </Button>

        {/* Edit Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsEditModalOpen(true)}
          className="text-xs h-8 px-2.5 font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer shadow-2xs"
          title="Edit Campaign Details & Destinations"
        >
          <Pencil className="w-3.5 h-3.5 text-slate-500" />
          <span>Edit</span>
        </Button>

        {/* Invite Creator Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsInviteModalOpen(true)}
          className="text-xs h-8 px-2.5 font-semibold text-violet-700 dark:text-violet-300 hover:text-violet-800 dark:hover:text-violet-200 bg-violet-50/70 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/60 border-violet-200/80 dark:border-violet-800/80 rounded-xl cursor-pointer shadow-2xs"
          title="Generate a signed magic invite link for an influencer"
        >
          <UserPlus className="w-3.5 h-3.5 text-violet-500" />
          <span>Invite</span>
        </Button>

        {/* Report Issue Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsReportModalOpen(true)}
          className="text-xs h-8 px-2 font-medium text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-xl cursor-pointer"
          title="Report Campaign Discrepancy or Link Downtime to Ops"
        >
          <LifeBuoy className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Report</span>
        </Button>
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
