import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.log("ℹ No DATABASE_URL configured. Skipping remote schema verification.");
  process.exit(0);
}

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 10000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function verify() {
  console.log("🔍 Verifying remote database schema alignment...");
  try {
    // 1. Connectivity check
    await prisma.$queryRaw`SELECT 1`;
    console.log("  ✔ Database connectivity established");

    // 2. Critical column existence check (prevent runtime column missing errors)
    const columns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Sale' AND column_name = 'isVoided'
    `;

    if (!Array.isArray(columns) || columns.length === 0) {
      console.error("  ❌ Column 'Sale.isVoided' is missing in the database! Run 'npx prisma db push' to synchronize.");
      process.exit(1);
    }
    console.log("  ✔ Column 'Sale.isVoided' verified in live database");

    console.log("🚀 Remote database schema verification passed successfully.");
  } catch (err) {
    console.error("  ❌ Schema verification error:", err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

verify();
