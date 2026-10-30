import { test } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("layout tokens: globals.css defines universal layout variables and utility classes", () => {
  const cssPath = path.join(rootDir, "src/app/globals.css");
  assert.ok(fs.existsSync(cssPath), "globals.css must exist");

  const css = fs.readFileSync(cssPath, "utf-8");

  // Core CSS custom properties
  assert.match(css, /--sidebar-width:\s*16rem;/, "Must declare --sidebar-width: 16rem");
  assert.match(css, /--sidebar-collapsed-width:\s*5rem;/, "Must declare --sidebar-collapsed-width: 5rem");
  assert.match(css, /--navbar-height:\s*4rem;/, "Must declare --navbar-height: 4rem");
  assert.match(css, /--page-px:\s*clamp\(1rem,\s*2\.5vw,\s*2rem\);/, "Must declare fluid --page-px");
  assert.match(css, /--container-max-w:\s*80rem;/, "Must declare --container-max-w: 80rem");
  assert.match(css, /--container-admin-max-w:\s*100rem;/, "Must declare --container-admin-max-w: 100rem");

  // Tailwind @theme mapping tokens
  assert.match(css, /--spacing-sidebar:\s*16rem;/, "Must map --spacing-sidebar");
  assert.match(css, /--spacing-sidebar-collapsed:\s*5rem;/, "Must map --spacing-sidebar-collapsed");
  assert.match(css, /--spacing-navbar:\s*4rem;/, "Must map --spacing-navbar");

  // Utility classes
  assert.match(css, /\.layout-container\s*\{/, "Must declare .layout-container utility class");
  assert.match(css, /\.layout-container-wide\s*\{/, "Must declare .layout-container-wide utility class");
  assert.match(css, /\.navbar-shell\s*\{/, "Must declare .navbar-shell utility class");
});

test("layout tokens: admin views consume universal layout tokens", () => {
  const sidebarPath = path.join(rootDir, "src/app/(dashboard)/admin/AdminSidebar.tsx");
  const dashboardPath = path.join(rootDir, "src/app/(dashboard)/admin/AdminDashboardView.tsx");

  const sidebarContent = fs.readFileSync(sidebarPath, "utf-8");
  const dashboardContent = fs.readFileSync(dashboardPath, "utf-8");

  assert.match(sidebarContent, /var\(--sidebar-width\)/, "AdminSidebar must use --sidebar-width");
  assert.match(sidebarContent, /var\(--sidebar-collapsed-width\)/, "AdminSidebar must use --sidebar-collapsed-width");
  assert.match(sidebarContent, /var\(--navbar-height\)/, "AdminSidebar header must use --navbar-height");

  assert.match(dashboardContent, /navbar-shell/, "AdminDashboardView top bar must use navbar-shell");
  assert.match(dashboardContent, /layout-container-wide/, "AdminDashboardView must use layout-container-wide");
});

test("layout tokens: merchant, brand, and marketing views consume universal layout classes", () => {
  const homePath = path.join(rootDir, "src/app/page.tsx");
  const brandPath = path.join(rootDir, "src/app/(dashboard)/brand/page.tsx");
  const analyticsPath = path.join(rootDir, "src/app/(dashboard)/brand/analytics/AnalyticsView.tsx");
  const salesPath = path.join(rootDir, "src/app/(dashboard)/brand/sales/SalesTerminal.tsx");
  const creatorPath = path.join(rootDir, "src/app/(dashboard)/creator/CreatorView.tsx");
  const privacyPath = path.join(rootDir, "src/app/privacy/page.tsx");

  const homeContent = fs.readFileSync(homePath, "utf-8");
  const brandContent = fs.readFileSync(brandPath, "utf-8");
  const analyticsContent = fs.readFileSync(analyticsPath, "utf-8");
  const salesContent = fs.readFileSync(salesPath, "utf-8");
  const creatorContent = fs.readFileSync(creatorPath, "utf-8");
  const privacyContent = fs.readFileSync(privacyPath, "utf-8");

  assert.match(homeContent, /navbar-shell\s+layout-container/, "Home page header must use navbar-shell and layout-container");
  assert.match(brandContent, /navbar-shell\s+layout-container/, "Brand dashboard header must use navbar-shell and layout-container");
  assert.match(brandContent, /<main className="layout-container/, "Brand dashboard main must use layout-container");

  assert.match(analyticsContent, /layout-container min-h-\[var\(--navbar-height\)\]/, "Analytics header must consume tokens");
  assert.match(analyticsContent, /<main className="layout-container/, "Analytics main must use layout-container");

  assert.match(salesPath ? salesContent : "", /navbar-shell\s+layout-container/, "SalesTerminal header must use navbar-shell and layout-container");
  assert.match(salesContent, /<main className="layout-container/, "SalesTerminal main must use layout-container");

  assert.match(creatorContent, /navbar-shell max-w-4xl/, "Creator header must use navbar-shell");
  assert.match(creatorContent, /px-\[var\(--page-px\)\]/, "Creator main must use fluid page-px token");

  assert.match(privacyContent, /navbar-shell max-w-4xl/, "Privacy header must use navbar-shell");
  assert.match(privacyContent, /px-\[var\(--page-px\)\]/, "Privacy main must use fluid page-px token");
});
