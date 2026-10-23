import { test, expect } from "@playwright/test";

test.describe("EthioLink Platform E2E Suite", () => {
  test("Homepage renders EthioLink value proposition, navigation, and role CTA routes", async ({ page }) => {
    await page.goto("/");

    // Verify Brand title and Ge'ez subtitle
    await expect(page.locator("header")).toContainText("EthioLink");
    await expect(page.locator("header")).toContainText("የኢትዮጵያ የግብይት መድረክ");

    // Verify Hero headline
    const heroHeading = page.locator("h1");
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText("Measure Real Sales From Influencer Campaigns");

    // Verify Primary CTAs
    const registerCta = page.getByRole("link", { name: /Register Your Brand/i });
    const portalCta = page.getByRole("link", { name: /Merchant & Staff Portal/i });
    await expect(registerCta).toBeVisible();
    await expect(portalCta).toBeVisible();

    // Verify navigation to Merchant portal
    await portalCta.click();
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole("heading", { name: /Merchant & Staff Portal/i })).toBeVisible();
  });

  test("Health check endpoint returns status 200 with runtime diagnostics", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("ethiolink");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("version");
    expect(body).toHaveProperty("database");
  });

  test("Non-existent campaign slug renders localized CampaignNotFound fallback", async ({ page }) => {
    await page.goto("/c/unknown-campaign-slug-404");

    // Expect the not-found view to render with localized heading
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText(/ዘመቻው አልተገኘም|Campaign Not Found/);

    // Verify Return to Home CTA button
    const backBtn = page.getByRole("link", { name: /ወደ መነሻ ገጽ ይመለሱ|Go to Homepage/i });
    await expect(backBtn).toBeVisible();
    await expect(backBtn).toHaveAttribute("href", "/");
  });

  test("Bilingual language switch toggles English and Amharic locales", async ({ page }) => {
    await page.goto("/c/unknown-campaign-slug-404");

    // Initially in Amharic ('ዘመቻው አልተገኘም'), toggle button says 'English'
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText("ዘመቻው አልተገኘም");

    const toggleBtn = page.getByTestId("lang-toggle");
    await expect(toggleBtn).toBeVisible();
    await expect(toggleBtn).toHaveText("English");

    // Switch to English with retry assertion to cleanly accommodate client hydration
    await expect(async () => {
      await toggleBtn.click();
      await expect(heading).toHaveText("Campaign Not Found");
    }).toPass({ timeout: 10000 });
    await expect(toggleBtn).toHaveText("አማርኛ");

    // Switch back to Amharic
    await expect(async () => {
      await toggleBtn.click();
      await expect(heading).toHaveText("ዘመቻው አልተገኘም");
    }).toPass({ timeout: 10000 });
    await expect(toggleBtn).toHaveText("English");
  });

  test("Authentication views render expected input fields and action buttons", async ({ page }) => {
    // Navigate to Login page
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Merchant & Staff Portal/i })).toBeVisible();

    // Verify phone input and password input
    const phoneInput = page.locator('input#phone[type="tel"]');
    const passwordInput = page.locator('input#password[type="password"]');

    await expect(phoneInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Verify Sign In submit button
    const submitBtn = page.getByRole("button", { name: /Sign In/i });
    await expect(submitBtn).toBeVisible();

    // Verify registration link navigation
    const registerLink = page.getByRole("link", { name: /Register your Brand/i });
    await expect(registerLink).toBeVisible();
    await registerLink.click();
    await expect(page).toHaveURL(/.*register/);
  });
});
