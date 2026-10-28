import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E Configuration for EthioLink
 * Tests real browser user interactions across Desktop & Mobile viewports
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 90 * 1000,
  expect: {
    timeout: 20 * 1000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: process.platform === "win32"
      ? "npm.cmd run start -- -p 3000"
      : "npm run start -- -p 3000",
    url: "http://127.0.0.1:3000/api/health",
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
