import { Suspense } from "react";
import { Metadata } from "next";
import { connection } from "next/server";
import { db } from "@/lib/db";
import {
  CampaignLanding,
  CampaignNotFound,
  CampaignData,
} from "@/components/campaign/CampaignLanding";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    await connection();
  } catch {
    // Ignore outside request scope (e.g. unit test runner)
  }

  const { slug } = await params;
  try {
    const campaign = await db.campaign.findUnique({
      where: { slug },
      include: {
        brand: true,
      },
    });

    if (!campaign || campaign.status !== "ACTIVE") {
      return {
        title: "Campaign Not Found | EthioLink",
        description: "This campaign is inactive or expired.",
      };
    }

    const promoDesc =
      campaign.description ||
      `Special promotion from ${campaign.brand.name}. Claim discount with promo code: ${campaign.promoCode}`;

    return {
      title: `${campaign.name} | ${campaign.brand.name} - EthioLink`,
      description: promoDesc,
      openGraph: {
        title: `${campaign.name} - ${campaign.brand.name}`,
        description: promoDesc,
        siteName: "EthioLink",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${campaign.name} - ${campaign.brand.name}`,
        description: promoDesc,
      },
    };
  } catch {
    return {
      title: "EthioLink Promotion",
    };
  }
}

function CampaignLoadingSkeleton() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 flex flex-col items-center px-4 py-6 sm:py-12 animate-pulse">
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <div className="w-24 h-6 bg-slate-200 rounded-full" />
        <div className="w-20 h-6 bg-slate-200 rounded-full" />
      </div>
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 flex flex-col items-center">
        <div className="w-28 h-6 bg-amber-100/70 rounded-full mb-4" />
        <div className="w-3/4 h-8 bg-slate-200 rounded-xl mb-3" />
        <div className="w-full h-4 bg-slate-100 rounded mb-2" />
        <div className="w-2/3 h-4 bg-slate-100 rounded mb-6" />
        <div className="w-full h-28 bg-emerald-50/70 border border-emerald-100 rounded-2xl mb-6" />
        <div className="w-full h-12 bg-slate-200 rounded-xl mb-3" />
        <div className="w-full h-12 bg-slate-200 rounded-xl" />
      </div>
    </main>
  );
}

async function CampaignView({ params }: PageProps) {
  try {
    await connection();
  } catch {
    // Ignore outside request scope (e.g. unit test runner)
  }

  const { slug } = await params;

  let campaign = null;
  try {
    campaign = await db.campaign.findUnique({
      where: { slug },
      include: {
        brand: {
          select: {
            name: true,
            ownerName: true,
          },
        },
        creators: {
          include: {
            creator: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to query campaign:", error);
    return <CampaignNotFound />;
  }

  if (!campaign || campaign.status !== "ACTIVE") {
    return <CampaignNotFound />;
  }

  const campaignData: CampaignData = {
    id: campaign.id,
    slug: campaign.slug,
    name: campaign.name,
    promoCode: campaign.promoCode,
    description: campaign.description,
    telegramUrl: campaign.telegramUrl,
    phoneNumber: campaign.phoneNumber,
    mapUrl: campaign.mapUrl,
    endDate: campaign.endDate ? campaign.endDate.toISOString() : null,
    brand: campaign.brand,
    creators: campaign.creators,
  };

  return <CampaignLanding campaign={campaignData} />;
}

export default function CampaignPage({ params }: PageProps) {
  return (
    <Suspense fallback={<CampaignLoadingSkeleton />}>
      <CampaignView params={params} />
    </Suspense>
  );
}
