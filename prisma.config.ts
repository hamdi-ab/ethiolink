import { defineConfig } from "prisma/config";

try {
  process.loadEnvFile?.(".env");
} catch {
  // Ignore if running where env is already in process.env
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
