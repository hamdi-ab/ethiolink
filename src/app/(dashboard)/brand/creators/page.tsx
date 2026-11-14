import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreatorsView } from "./CreatorsView";
import { CreatorRosterItem } from "../brand-helpers";

async function CreatorsServerContent() {
  try {
    await connection();
  } catch {}
  const session = await getSession();

  if (!session || !session.brandId) {
    redirect("/login");
  }

  // Staff members are restricted to sales logging
  if (session.role === "STAFF") {
    redirect("/brand/sales");
  }

  let brandName = "Sheba Artisan Coffee";
  let brandPhone = "+251 91 123 4567";
  let ownerName = session.name || "Brand Merchant";
  let creatorRoster: CreatorRosterItem[] = [];
  let campaignsList: Array<{ id: string; name: string; promoCode: string }> = [];

  try {
    const brand = await db.brand.findUnique({
      where: { id: session.brandId },
      select: {
        id: true,
        name: true,
        users: {
          where: { role: "OWNER" },
          select: { name: true, phone: true },
          take: 1,
        },
      },
    });

    if (brand) {
      brandName = brand.name;
      if (brand.users[0]) {
        ownerName = brand.users[0].name;
        brandPhone = brand.users[0].phone;
      }
    }

    const campaigns = await db.campaign.findMany({
      where: { brandId: session.brandId },
      include: {
        creators: {
          include: {
            creator: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    campaignsList = campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      promoCode: c.promoCode,
    }));

    // Aggregate unique creators across campaigns
    const creatorMap = new Map<string, CreatorRosterItem>();
    for (const camp of campaigns) {
      for (const assignment of camp.creators) {
        const c = assignment.creator;
        if (!c || !c.user) continue;
        const existing = creatorMap.get(c.id);
        if (existing) {
          existing.campaignsCount += 1;
          if (!existing.campaignNames.includes(camp.name)) {
            existing.campaignNames.push(camp.name);
          }
        } else {
          creatorMap.set(c.id, {
            id: c.id,
            name: c.user.name,
            phone: c.user.phone,
            telegramUsername: c.telegramUsername,
            campaignsCount: 1,
            campaignNames: [camp.name],
          });
        }
      }
    }
    creatorRoster = Array.from(creatorMap.values());
  } catch (err) {
    console.error("Failed to load creators from DB:", err);
  }

  return (
    <CreatorsView
      brandName={brandName}
      ownerName={ownerName}
      brandPhone={brandPhone}
      role={session.role}
      creators={creatorRoster}
      campaigns={campaignsList}
    />
  );
}

export default function BrandCreatorsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F8F5] dark:bg-[#0D1714] flex flex-col items-center justify-center p-6">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-xs text-neutral-500 font-medium">Loading Creators &amp; Influencers...</p>
        </div>
      }
    >
      <CreatorsServerContent />
    </Suspense>
  );
}
