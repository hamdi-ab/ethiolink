import { PrismaClient, UserRole, CampaignStatus, EventType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

try {
  process.loadEnvFile?.(".env");
} catch {
  // Ignore if env is already loaded
}

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/ethiolink?schema=public";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting EthioLink database seeding...");

  // Clean existing records in reverse dependency order
  console.log("🧹 Clearing old records...");
  await prisma.sale.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.campaignAssignment.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.creator.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.brand.deleteMany({});

  const defaultPassword = await bcrypt.hash("EthioLink2026!", 10);

  // 1. Create System Admin
  console.log("👤 Creating System Admin...");
  await prisma.user.create({
    data: {
      name: "EthioLink Administrator",
      phone: "+251911000001",
      role: UserRole.ADMIN,
      passwordHash: defaultPassword,
    },
  });

  // 2. Create Brands & Owners
  console.log("🏢 Creating Brands & Owners...");
  const tomocaBrand = await prisma.brand.create({
    data: {
      name: "Tomoca Coffee",
      ownerName: "Dawit Kebede",
      phone: "+251911111111",
      passwordHash: defaultPassword,
    },
  });

  const tomocaOwner = await prisma.user.create({
    data: {
      brandId: tomocaBrand.id,
      name: "Dawit Kebede",
      phone: "+251911111111",
      role: UserRole.OWNER,
      passwordHash: defaultPassword,
    },
  });

  const tomocaStaff = await prisma.user.create({
    data: {
      brandId: tomocaBrand.id,
      name: "Almaz Tadesse (Bole Branch POS)",
      phone: "+251922222222",
      role: UserRole.STAFF,
      passwordHash: defaultPassword,
    },
  });

  const boleLeatherBrand = await prisma.brand.create({
    data: {
      name: "Bole Craft Leather",
      ownerName: "Solomon Haile",
      phone: "+251911333333",
      passwordHash: defaultPassword,
    },
  });

  const boleOwner = await prisma.user.create({
    data: {
      brandId: boleLeatherBrand.id,
      name: "Solomon Haile",
      phone: "+251911333333",
      role: UserRole.OWNER,
      passwordHash: defaultPassword,
    },
  });

  // 3. Create Influencer Creators
  console.log("📱 Creating Creators...");
  const creatorUser1 = await prisma.user.create({
    data: {
      name: "Helen Lifestyle & Food",
      phone: "+251933333333",
      role: UserRole.CREATOR,
      passwordHash: defaultPassword,
    },
  });

  const creator1 = await prisma.creator.create({
    data: {
      userId: creatorUser1.id,
      telegramUsername: "helen_addis_lifestyle",
    },
  });

  const creatorUser2 = await prisma.user.create({
    data: {
      name: "Yonas Tech & Culture",
      phone: "+251944444444",
      role: UserRole.CREATOR,
      passwordHash: defaultPassword,
    },
  });

  const creator2 = await prisma.creator.create({
    data: {
      userId: creatorUser2.id,
      telegramUsername: "yonas_ethio_reviews",
    },
  });

  // 4. Create Active Campaigns
  console.log("🎯 Creating Campaigns...");
  const tomocaCampaign = await prisma.campaign.create({
    data: {
      brandId: tomocaBrand.id,
      slug: "tomoca-special-roast",
      name: "Tomoca Special Ethiopian Roast 2026",
      promoCode: "TOMOCA20",
      description: "Experience authentic Ethiopian coffee heritage with 20% off your first bag at our Bole & Piassa branches or on Telegram.",
      telegramUrl: "https://t.me/tomocacoffee_bot",
      phoneNumber: "+251911111111",
      mapUrl: "https://maps.google.com/?q=Tomoca+Coffee+Addis+Ababa",
      status: CampaignStatus.ACTIVE,
      startDate: new Date("2026-10-01"),
      endDate: new Date("2026-11-30"),
    },
  });

  const leatherCampaign = await prisma.campaign.create({
    data: {
      brandId: boleLeatherBrand.id,
      slug: "bole-leather-fall-collection",
      name: "Bole Leather Handcrafted Bags",
      promoCode: "BOLE15",
      description: "Premium genuine Ethiopian highland leather laptop bags and accessories with 15% promotional discount.",
      telegramUrl: "https://t.me/boleleather_orders",
      phoneNumber: "+251911333333",
      mapUrl: "https://maps.google.com/?q=Bole+Medhanialem+Addis+Ababa",
      status: CampaignStatus.ACTIVE,
      startDate: new Date("2026-10-10"),
      endDate: new Date("2026-12-15"),
    },
  });

  // 5. Assign Creators to Campaigns
  console.log("🔗 Assigning Creators to Campaigns...");
  await prisma.campaignAssignment.create({
    data: {
      campaignId: tomocaCampaign.id,
      creatorId: creator1.id,
    },
  });

  await prisma.campaignAssignment.create({
    data: {
      campaignId: leatherCampaign.id,
      creatorId: creator2.id,
    },
  });

  // 6. Generate Telemetry Events (Simulating real traffic from Telegram & Socials)
  console.log("📊 Generating Telemetry Events...");
  const eventsData = [];
  const now = Date.now();

  // Tomoca events: 120 page views, 45 promo code copies, 30 telegram clicks, 15 phone taps, 10 map views
  for (let i = 0; i < 120; i++) {
    const timeOffset = Math.floor(Math.random() * 14 * 24 * 3600 * 1000); // past 14 days
    const visitorId = `vis_tomoca_${i % 40}`; // 40 unique visitors
    eventsData.push({
      campaignId: tomocaCampaign.id,
      eventType: EventType.PAGE_VIEW,
      visitorId,
      ipHash: `hash_ip_${i % 30}`,
      createdAt: new Date(now - timeOffset),
    });

    if (i < 45) {
      eventsData.push({
        campaignId: tomocaCampaign.id,
        eventType: EventType.COPY_CODE,
        visitorId,
        ipHash: `hash_ip_${i % 30}`,
        createdAt: new Date(now - timeOffset + 3000),
      });
    }

    if (i < 30) {
      eventsData.push({
        campaignId: tomocaCampaign.id,
        eventType: EventType.TELEGRAM_CLICK,
        visitorId,
        ipHash: `hash_ip_${i % 30}`,
        createdAt: new Date(now - timeOffset + 8000),
      });
    }

    if (i < 15) {
      eventsData.push({
        campaignId: tomocaCampaign.id,
        eventType: EventType.CALL_CLICK,
        visitorId,
        ipHash: `hash_ip_${i % 30}`,
        createdAt: new Date(now - timeOffset + 12000),
      });
    }

    if (i < 10) {
      eventsData.push({
        campaignId: tomocaCampaign.id,
        eventType: EventType.MAP_CLICK,
        visitorId,
        ipHash: `hash_ip_${i % 30}`,
        createdAt: new Date(now - timeOffset + 15000),
      });
    }
  }

  await prisma.event.createMany({
    data: eventsData,
  });

  // 7. Generate In-Store POS & Telegram Sales
  console.log("💰 Recording Attributed Sales...");
  const sales = [
    {
      campaignId: tomocaCampaign.id,
      loggedById: tomocaStaff.id,
      amountETB: "650.00",
      notes: "Promo code TOMOCA20 used at Bole branch for 2x 500g whole bean bags.",
      createdAt: new Date(now - 7 * 24 * 3600 * 1000),
    },
    {
      campaignId: tomocaCampaign.id,
      loggedById: tomocaStaff.id,
      amountETB: "1300.00",
      notes: "Customer mentioned Helen's Telegram post; bought coffee gift set.",
      createdAt: new Date(now - 5 * 24 * 3600 * 1000),
    },
    {
      campaignId: tomocaCampaign.id,
      loggedById: tomocaOwner.id,
      amountETB: "3200.00",
      notes: "Corporate tasting order placed via Telegram direct link.",
      createdAt: new Date(now - 3 * 24 * 3600 * 1000),
    },
    {
      campaignId: tomocaCampaign.id,
      loggedById: tomocaStaff.id,
      amountETB: "980.00",
      notes: "Walk-in customer at Piassa with TOMOCA20 coupon.",
      createdAt: new Date(now - 1 * 24 * 3600 * 1000),
    },
    {
      campaignId: leatherCampaign.id,
      loggedById: boleOwner.id,
      amountETB: "4500.00",
      notes: "Handcrafted executive leather messenger bag ordered via Telegram promo BOLE15.",
      createdAt: new Date(now - 2 * 24 * 3600 * 1000),
    },
    {
      campaignId: leatherCampaign.id,
      loggedById: boleOwner.id,
      amountETB: "1850.00",
      notes: "Slim leather wallet and passport holder set.",
      createdAt: new Date(now - 12 * 3600 * 1000),
    },
  ];

  for (const s of sales) {
    await prisma.sale.create({
      data: s,
    });
  }

  console.log("\n✅ Database Seeding Complete!");
  console.log("==================================================");
  console.log("Demo Accounts (Password for all: EthioLink2026!):");
  console.log("  • Admin:    +251911000001 (Full Platform Oversight)");
  console.log("  • Brand:    +251911111111 (Tomoca Coffee Owner)");
  console.log("  • Staff:    +251922222222 (Bole Branch POS Cashier)");
  console.log("  • Creator:  +251933333333 (Helen Lifestyle @helen_addis_lifestyle)");
  console.log("Demo Campaign Routes:");
  console.log("  • http://localhost:3000/c/tomoca-special-roast");
  console.log("  • http://localhost:3000/c/bole-leather-fall-collection");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
