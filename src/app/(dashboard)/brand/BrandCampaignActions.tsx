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
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
      <div className="flex items-center gap-2 shrink-0">
        {/* Primary Action: POS QR & Share */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsShareModalOpen(true)}
          className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 border-emerald-200/80 dark:border-emerald-800/80 font-semibold cursor-pointer shadow-2xs"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>POS QR &amp; Share</span>
        </Button>

        {/* Secondary Action: Landing Preview Link */}
        <Button variant="ghost" size="sm" asChild className="cursor-pointer">
          <Link href={`/c/${campaign.slug}`} target="_blank">
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Preview</span>
          </Link>
        </Button>

        {/* Overflow Management Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`More actions for campaign ${campaign.name}`}
              className="cursor-pointer text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => setIsInviteModalOpen(true)}
              className="cursor-pointer"
            >
              <UserPlus className="w-4 h-4 mr-2 text-violet-500" />
              <span>Invite Creator</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setIsEditModalOpen(true)}
              className="cursor-pointer"
            >
              <Pencil className="w-4 h-4 mr-2 text-slate-500" />
              <span>Edit Campaign</span>
            </DropdownMenuItem>

            {!isTerminal && (
              <DropdownMenuItem
                onClick={handleToggleStatus}
                disabled={isToggling}
                className="cursor-pointer"
              >
                {isToggling ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-slate-400" />
                ) : isActive ? (
                  <Pause className="w-4 h-4 mr-2 text-amber-500" />
                ) : (
                  <Play className="w-4 h-4 mr-2 text-emerald-500" />
                )}
                <span>{isActive ? "Pause Campaign" : "Resume Campaign"}</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => setIsReportModalOpen(true)}
              className="cursor-pointer text-slate-600 dark:text-slate-400"
            >
              <LifeBuoy className="w-4 h-4 mr-2 text-amber-500" />
              <span>Report Issue</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
