import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SalesTerminal, ActiveCampaign, RecentSale } from "./SalesTerminal";

async function SalesView() {
  try { await connection(); } catch {}
  const session = await getSession();

  if (!session || !session.brandId) {
    redirect("/login");
  }

  let brandName = "Brand Console";
  let campaigns: ActiveCampaign[] = [];
  let sales: RecentSale[] = [];

  try {
    const brand = await db.brand.findUnique({
      where: { id: session.brandId },
      select: { name: true },
    });
    if (brand) brandName = brand.name;

    const dbCampaigns = await db.campaign.findMany({
      where: {
        brandId: session.brandId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        promoCode: true,
      },
      orderBy: { createdAt: "desc" },
    });
    campaigns = dbCampaigns;

    const dbSales = await db.sale.findMany({
      where: {
        campaign: {
          brandId: session.brandId,
        },
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            promoCode: true,
          },
        },
        loggedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    sales = dbSales.map((s) => ({
      id: s.id,
      amountETB: s.amountETB.toNumber(),
      notes: s.notes,
      createdAt: s.createdAt.toISOString(),
      campaign: s.campaign,
      loggedBy: s.loggedBy,
    }));
  } catch {
    // Database offline fallback
    campaigns = [];
    sales = [];
  }

  return (
    <SalesTerminal
      userName={session.name}
      userRole={session.role}
      brandName={brandName}
      initialCampaigns={campaigns}
      initialSales={sales}
    />
  );
}

export default function SalesLoggingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SalesView />
    </Suspense>
  );
}
