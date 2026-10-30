import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/ethiolink?schema=public";

const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.pgPool = pool;

const adapter = new PrismaPg(pool);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : process.env.NODE_ENV === "test"
          ? []
          : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
