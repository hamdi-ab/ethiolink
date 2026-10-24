import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateFunnelMetrics } from "@/lib/analytics";
import { CreatorView } from "./CreatorView";
import type { CreatorPortalResponse, CreatorCampaignItem } from "@/app/api/creator/campaigns/route";

async function CreatorServerContent() {
  try { await connection(); } catch {}
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Staff members belong in the sales logging interface
  if (session.role === "STAFF") {
    redirect("/brand/sales");
  }

  // Brand owners belong in the brand management console
  if (session.role === "OWNER") {
    redirect("/brand");
  }

  let creator = await db.creator.findUnique({
    where: { userId: session.userId },
    include: {
      assignments: {
        include: {
          campaign: {
            include: {
              brand: {
                select: {
                  id: true,
                  name: true,
                },
              },
              events: {
                select: {
                  eventType: true,
                  visitorId: true,
                },
              },
              sales: {
                select: {
                  amountETB: true,
                },
              },
            },
          },
        },
        orderBy: { assignedAt: "desc" },
      },
    },
  });

  // Edge case self-healing: if a user with CREATOR role has no creator row yet
  if (!creator) {
    creator = await db.creator.create({
      data: {
        userId: session.userId,
      },
      include: {
        assignments: {
          include: {
            campaign: {
              include: {
                brand: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                events: {
                  select: {
                    eventType: true,
                    visitorId: true,
                  },
                },
                sales: {
                  select: {
                    amountETB: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  const campaigns = creator.assignments.map((a) => a.campaign);
  const allEvents = campaigns.flatMap((c) => c.events);
  const allSales = campaigns.flatMap((c) => c.sales);

  const overallFunnel = calculateFunnelMetrics(allEvents, allSales);

  const campaignItems: CreatorCampaignItem[] = creator.assignments.map((assignment) => {
    const camp = assignment.campaign;
    const metrics = calculateFunnelMetrics(camp.events, camp.sales);

    return {
      campaignId: camp.id,
      campaignName: camp.name,
      slug: camp.slug,
      promoCode: camp.promoCode,
      description: camp.description,
      status: camp.status,
      brandName: camp.brand.name,
      brandId: camp.brand.id,
      assignedAt: assignment.assignedAt.toISOString(),
      metrics,
    };
  });

  const portalData: CreatorPortalResponse = {
    status: "ok",
    creator: {
      id: creator.id,
      name: session.name,
      phone: session.phone,
      telegramUsername: creator.telegramUsername,
    },
    summary: {
      ...overallFunnel,
      totalCampaigns: creator.assignments.length,
    },
    campaigns: campaignItems,
  };

  const headerList = await headers();
  const host = headerList.get("host") || "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  return <CreatorView initialData={portalData} origin={origin} />;
}

export default function CreatorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl mb-4 animate-bounce">
            E
          </div>
          <div className="text-sm font-bold text-slate-700">Loading Creator Portal...</div>
          <div className="text-xs text-slate-400 mt-1">Aggregating campaign analytics</div>
        </div>
      }
    >
      <CreatorServerContent />
    </Suspense>
  );
}
