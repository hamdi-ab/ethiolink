"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExternalLink, Share2, QrCode } from "lucide-react";
import { CampaignShareModal } from "@/components/campaign/CampaignShareModal";

export interface BrandCampaignActionsProps {
  campaign: {
    id: string;
    name: string;
    slug: string;
    promoCode: string;
    brandName: string;
    description?: string | null;
  };
}

export function BrandCampaignActions({ campaign }: BrandCampaignActionsProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/80 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
          title="Open POS QR Code & Telegram Sharing Suite"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>POS QR &amp; Share</span>
        </button>

        <Link
          href={`/c/${campaign.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Preview</span>
        </Link>

        <Link
          href={`/brand/campaigns/new?reinvite=${campaign.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Invite</span>
        </Link>
      </div>

      <CampaignShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        campaign={campaign}
      />
    </>
  );
}
