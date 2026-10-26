<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

## Architecture & Navigation Map

- **App Router Pages & Views:**
  - `src/app/` — Root layout, ThemeProvider, and public landing page
  - `src/app/(dashboard)/admin/` — Admin operations console, system diagnostics, and audit trail
  - `src/app/(dashboard)/brand/` — Brand merchant dashboard, analytics portal, and sales logging
  - `src/app/(dashboard)/creator/` — Creator performance and campaign attribution
  - `src/app/c/[slug]/` — Public omnichannel campaign landing page & OpenGraph dynamic generator
- **API Endpoints:**
  - `src/app/api/admin/` — Admin overview and audit queries (`ADMIN` role guard)
  - `src/app/api/analytics/` — Campaign aggregation and funnel conversion calculations
  - `src/app/api/events/` — Telemetry ingestion with IP hashing & 15-minute deduplication
  - `src/app/api/sales/` — Verified sales logging in ETB with float-drift protection
- **Domain & Database:**
  - `prisma/schema.prisma` — Single source of truth for Prisma schema, enums, and PostgreSQL models
  - `src/lib/` — Domain libraries (`admin.ts`, `analytics.ts`, `reports.ts`, `telemetry.ts`, `auth.ts`, `db.ts`)
- **Coding Standards:**
  - `CODING_STANDARDS.md` — UI/UX hierarchy, anti-slop rules, WCAG AA typography, and color tokens
- **Quality Gates & Tests:**
  - Unit Tests: `npm test` (`tsx --test tests/*.test.mjs`)
  - Typecheck: `npm run typecheck` (`tsc --noEmit`)
  - Lint: `npm run lint` (`eslint`)
  - E2E Tests: `npm run test:e2e` (`playwright test`)
