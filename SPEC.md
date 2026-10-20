# Technical Specification: EthioLink MVP

**Document:** `SPEC.md`  
**Target Project:** EthioLink (`C:\Users\tmp\new\ethiolink`)  
**Status:** Approved for Implementation (Post-Grilling)  
**Parent PRD:** [`prd.md`](./prd.md)  
**Stack:** Next.js (App Router, TypeScript), PostgreSQL, Prisma ORM, Tailwind CSS, Shadcn UI, Auth.js / Secure Sessions

---

## 1. Problem Statement

Ethiopian businesses regularly pay social media influencers and creators (across TikTok, Telegram, Instagram, etc.) to promote products, but operate with near-zero visibility into whether those promotions produce meaningful commercial results. 

Customer journeys in Ethiopia are fragmented: buyers discover an offer on social media, but complete transactions offline through direct phone calls, Telegram messaging, or in-person boutique visits. Traditional e-commerce conversion tracking (which requires standard credit-card payment gateways) fails completely in this environment. As a result, businesses cannot attribute foot traffic or sales to specific creators, have no data to guide marketing spend, and creators cannot prove the actual value they deliver.

---

## 2. Solution

EthioLink provides a lightweight, measurable attribution and analytics layer designed specifically for the Ethiopian commerce ecosystem:

1. **Unique Campaign Landing Pages (`ethiolink.app/c/[slug]`):** Mobile-optimized, ultra-fast landing pages featuring the merchant's offer, promo code, and actionable touchpoints (Telegram redirect, phone call dialer, map location).
2. **Real-Time Customer Action Telemetry:** High-precision tracking of page views, unique visitors, promo-code copy actions, Telegram redirects, phone taps, and map clicks with automated deduplication.
3. **Manual Sales Logging in ETB:** A simple in-store interface enabling brand owners and store staff (cashiers) to record sales attributable to a campaign promo code.
4. **Role-Tailored Dashboards:**
   - **Brand Dashboard:** High-level overview of active campaigns, visitor funnels, recorded sales, and reported revenue.
   - **Creator Portal:** Zero-password magic-link portal allowing creators to view their real-time performance and attribution.
   - **Admin Console:** Basic platform health, audit trail, and user management.

---

## 3. User Stories

### Brand Owner & Staff
1. As a brand owner, I want to register my business with a business name, owner name, phone number, and password, so that I have a secure account to manage my promotions.
2. As a brand owner, I want to create a new campaign with a campaign name, promotion code, start/end dates, Telegram URL, phone number, and store map location, so that I can launch promotional initiatives.
3. As a brand owner, I want the system to generate a unique shareable campaign URL (`/c/[slug]`), so that I can hand it to my hired influencer.
4. As a brand owner, I want to invite staff members (e.g. shop cashiers) with restricted access, so that they can log sales without viewing full business analytics or modifying campaigns.
5. As a brand owner or staff member, I want to record a completed sale in Ethiopian Birr (ETB) with optional notes against a campaign, so that customer purchases are attributed to the right promotion.
6. As a brand owner, I want to see an aggregated funnel of page views, unique visitors, customer action clicks (Telegram, call, map, copy), recorded sales, and total ETB revenue, so that I can evaluate marketing return.
7. As a brand owner, I want to view a side-by-side comparison of past and active campaigns, so that I can determine which creator drove higher performance.
8. As a brand owner, I want to edit campaign details (destination URLs, dates, promo codes) without corrupting existing historical analytics, so that I can adjust active promotions safely.

### Creator / Influencer
9. As a creator, I want to receive a secure tokenized magic invite link from a brand, so that I can access my campaign details without undergoing a friction-heavy password registration process.
10. As a creator, I want to verify my phone number or Telegram handle upon first access, so that my creator profile is linked to my assigned campaigns.
11. As a creator, I want to view my unique promotional link and copyable campaign assets, so that I can post them in my TikTok bio, Telegram channel, or Instagram stories.
12. As a creator, I want to see real-time performance metrics (visits, action clicks, recorded sales, reported revenue) for campaigns assigned to me, so that I can prove the commercial value of my audience.
13. As a creator, I want to see clear disclosures that reported revenue is a merchant-recorded metric and not a wallet balance or payout guarantee, so that expectations remain transparent.

### End Customer
14. As an end customer, I want to tap an influencer's link and instantly load a fast, mobile-friendly landing page without being prompted to log in or install an app.
15. As an end customer, I want to toggle between Amharic and English on the campaign page, so that I can read the offer in my preferred language.
16. As an end customer, I want to tap "Copy Code" to copy the merchant's discount code to my clipboard, so that I can present it when ordering.
17. As an end customer, I want to tap "Chat on Telegram" to automatically open a direct chat with the merchant with the campaign code pre-filled, so that I can inquire effortlessly.
18. As an end customer, I want to tap "Call Now" or "View Location" to call the shop or get Google Maps directions, so that I can purchase in person.

### Platform Administrator
19. As an administrator, I want to inspect registered brands, creators, campaigns, and event logs, so that I can audit platform activity and troubleshoot merchant issues.
20. As an administrator, I want to view platform-wide summary metrics (total accounts, total events, total ETB logged), so that I can track platform growth.

---

## 4. Implementation Decisions

### 4.1 Architecture & Directory Structure
The application will be built as a unified Next.js 15+ App Router application with modular domain seams:

```text
ethiolink/
├── prisma/
│   └── schema.prisma         # Data models and relations
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login, registration, invite claim routes
│   │   ├── (dashboard)/      # Brand, creator, and admin protected dashboards
│   │   │   ├── brand/
│   │   │   ├── creator/
│   │   │   └── admin/
│   │   ├── c/[slug]/         # Public campaign landing page
│   │   └── api/              # Telemetry, sales logging, and resource APIs
│   ├── components/           # UI primitives (Tailwind + Radix/Shadcn)
│   ├── lib/
│   │   ├── auth/             # Session management & role guards
│   │   ├── telemetry/        # Event ingestion, deduplication & hashing
│   │   └── db.ts             # Prisma client singleton
│   └── types/                # Core domain types
```

### 4.2 Data Model (PostgreSQL via Prisma)

```prisma
enum UserRole {
  OWNER
  STAFF
  CREATOR
  ADMIN
}

enum CampaignStatus {
  DRAFT
  ACTIVE
  PAUSED
  COMPLETED
}

enum EventType {
  PAGE_VIEW
  TELEGRAM_CLICK
  CALL_CLICK
  MAP_CLICK
  COPY_CODE
}

model Brand {
  id          String     @id @default(cuid())
  name        String
  ownerName   String
  phone       String     @unique
  passwordHash String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  users       User[]
  campaigns   Campaign[]
}

model User {
  id           String      @id @default(cuid())
  brandId      String?
  brand        Brand?      @relation(fields: [brandId], references: [id])
  name         String
  phone        String      @unique
  role         UserRole    @default(STAFF)
  passwordHash String?
  magicToken   String?     @unique
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  loggedSales  Sale[]
  creators     Creator?
}

model Creator {
  id               String               @id @default(cuid())
  userId           String               @unique
  user             User                 @relation(fields: [userId], references: [id])
  telegramUsername String?
  createdAt        DateTime             @default(now())
  updatedAt        DateTime             @updatedAt
  assignments      CampaignAssignment[]
}

model Campaign {
  id          String               @id @default(cuid())
  brandId     String
  brand       Brand                @relation(fields: [brandId], references: [id])
  slug        String               @unique
  name        String
  promoCode   String
  description String?
  telegramUrl String?
  phoneNumber String?
  mapUrl      String?
  status      CampaignStatus       @default(ACTIVE)
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime             @default(now())
  updatedAt   DateTime             @updatedAt
  creators    CampaignAssignment[]
  events      Event[]
  sales       Sale[]
}

model CampaignAssignment {
  id         String   @id @default(cuid())
  campaignId String
  creatorId  String
  campaign   Campaign @relation(fields: [campaignId], references: [id])
  creator    Creator  @relation(fields: [creatorId], references: [id])
  assignedAt DateTime @default(now())

  @@unique([campaignId, creatorId])
}

model Event {
  id         String    @id @default(cuid())
  campaignId String
  campaign   Campaign  @relation(fields: [campaignId], references: [id])
  eventType  EventType
  visitorId  String    // Client session UUID
  ipHash     String    // Daily-salted hash for rate limiting & deduplication
  createdAt  DateTime  @default(now())

  @@index([campaignId, eventType, createdAt])
}

model Sale {
  id         String   @id @default(cuid())
  campaignId String
  campaign   Campaign @relation(fields: [campaignId], references: [id])
  loggedById String
  loggedBy   User     @relation(fields: [loggedById], references: [id])
  amountETB  Decimal  @db.Decimal(12, 2)
  notes      String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([campaignId, createdAt])
}
```

### 4.3 Telemetry & Deduplication Pipeline
- **Visitor Identifier:** Client generated anonymous UUID in persistent localStorage/cookie.
- **Deduplication Guard:** Double-clicks on the same action (e.g. repeated Telegram taps) within a **15-minute sliding window** from the same visitor/campaign pair are marked as duplicate and not tallied into unique action metrics.
- **Privacy Assurance:** IP addresses are salted with a rolling daily secret and hashed with SHA-256 before storage; raw IPs are never persisted.

---

## 5. Testing Decisions

All automated tests must follow the **Independent Oracle Principle** defined in [`AGENTS.md`](../AGENTS.md):
- **Observable Behavior Testing:** Test public HTTP endpoints, API contracts, and user interactions. Never assert AST structures, regex matches on source code, or mock-only trivial passes.
- **Seams Under Test:**
  1. `Auth Seam`: Verification of role-based route protection (Owner vs Staff vs Creator vs Public).
  2. `Telemetry Ingestion Seam`: Posting valid and invalid events to `/api/events`, asserting storage and deduplication behavior.
  3. `Sales Logging Seam`: Executing sale entry with decimal validation, role permissions, and attribution summation.
  4. `Analytics Aggregation Seam`: Verifying that recorded sales sum accurately into reported revenue in ETB without floating point inaccuracies.

---

## 6. Out of Scope (Strict MVP Non-Goals)

1. Automated creator payouts, commission splits, or escrow wallets.
2. In-app payment processing (Telebirr/CBE Birr merchant checkout APIs).
3. Public influencer discovery marketplace or ranking directory.
4. Native mobile apps (iOS / Android APKs); mobile web first.
5. Automated Telegram bot integration.

---

## 7. Next Step: Implementation Tickets

This specification is ready for breakdown into discrete, implementable tickets via **`/to-tickets`** and **`tasks-axi`**.
