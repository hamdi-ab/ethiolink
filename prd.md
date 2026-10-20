# EthioLink — Product Requirements Document (PRD)

**Document Version:** 1.0  
**Product:** EthioLink  
**Document Status:** Draft for development planning  
**Initial Market:** Ethiopia  
**Product Type:** Web-based influencer campaign tracking and analytics platform  
**Primary Customer:** Local businesses and brands  
**MVP Development Estimate:** 6–8 weeks  
**Proposed Web Stack:** Next.js, PostgreSQL

---

## 1. Executive Summary

EthioLink is a platform that helps Ethiopian businesses measure the performance of influencer marketing campaigns.

Businesses frequently pay creators to promote their products through TikTok, Telegram, Instagram, and other channels. However, they often lack a reliable way to determine how much interest, how many sales, or how much revenue a particular creator generates.

EthioLink addresses this problem by providing campaign-specific tracking links, customer action tracking, manual sales recording, and performance reports in one place.

Rather than relying exclusively on followers, views, or assumptions, businesses can use measurable campaign data to evaluate their marketing investments.

### 1.1 Product Vision

Become the trusted source of influencer campaign performance intelligence in Ethiopia, enabling businesses to make better marketing decisions using measurable results.

### 1.2 MVP Mission

Help a business answer one fundamental question:

**Did this influencer campaign work?**

The first release will focus on collecting and presenting useful campaign performance data. Creator discovery, automated commission payments, and brokerage services are future possibilities, not MVP requirements.

### 1.3 Core Value Proposition

Before EthioLink:

“I paid an influencer to promote my business, but I don't know whether the promotion generated meaningful results.”

After EthioLink:

“I can see how many people visited the campaign page, contacted my business, used the promotion, and made purchases that I recorded.”

The distinction is important: EthioLink measures customer interest directly and records sales reported by the business. It must not represent manually reported sales as independently verified transactions.

---

## 2. Problem Statement

### 2.1 Current Problems

Businesses investing in influencer marketing may face several challenges:

1. **Limited attribution:** It is difficult to identify which influencer generated a particular sale.
2. **Fragmented customer journeys:** Customers may discover a product on social media, contact a seller through Telegram or a phone call, and purchase in person.
3. **Scattered reporting:** Campaign information is distributed across social platforms, messaging applications, phone conversations, and store records.
4. **Unclear return on investment:** Businesses may know the amount paid for a promotion but not the revenue attributable to it.
5. **Inconsistent reporting:** Sales and campaign outcomes may be recorded manually or forgotten altogether.
6. **Poor decision-making data:** Businesses have limited evidence for comparing campaigns and deciding where to spend their next marketing budget.

### 2.2 The Opportunity

EthioLink can provide a common measurement layer for influencer campaigns that direct customers toward messaging, phone calls, and physical businesses—not only conventional online checkout pages.

The first version should establish a dependable way to collect campaign activity and sales data before attempting to provide advanced recommendations.

### 2.3 Problem Validation Assumption

The existence and severity of these problems must be validated with Ethiopian business owners and creators.

The MVP should test whether businesses will:

- Create campaigns using EthioLink.
- Ask creators to distribute campaign-specific links.
- Record sales consistently.
- Return to use the platform for another campaign.

---

## 3. Product Goals and Non-Goals

### 3.1 Goals

The MVP must:

- Allow businesses to register and manage their accounts.
- Allow businesses to create influencer campaigns.
- Generate a unique public landing page for each campaign.
- Track landing-page visits and customer actions.
- Allow businesses to record campaign-associated sales.
- Present campaign performance in a business dashboard.
- Allow participating creators to view their assigned campaign performance.
- Provide basic administrative management.
- Validate whether businesses find the product useful enough to use repeatedly.

### 3.2 Non-Goals

The MVP will not include:

- A public influencer marketplace.
- Public creator discovery or search.
- AI-based creator matching.
- Public leaderboards or performance rankings.
- Wallets or escrow.
- Automated creator commission calculation and payouts.
- Payment processing.
- A Telegram bot.
- QR-code campaign tracking.
- An agency account type.
- Independently verified purchase tracking through merchant integrations.
- Automated campaign brokerage or influencer hiring.

These features may be evaluated after the core tracking workflow has demonstrated value.

---

## 4. Target Users and Roles

The MVP has three application roles: Brand, Creator, and Administrator. Only the Brand and Creator roles are customer-facing product roles; the Administrator role supports platform operations.

### 4.1 Brand / Business Owner

**Primary user and intended paying customer.**

Examples include:

- Clothing boutiques.
- Cosmetics shops.
- Restaurants and cafés.
- Electronics stores.
- Delivery businesses.

**Needs:**

- Understand whether a promotion generates customer interest.
- Associate campaigns with individual creators.
- Record sales associated with a campaign.
- Review campaign revenue and activity.
- Compare campaign outcomes over time.

**Primary success outcome:** The business can make a more informed decision about its next influencer campaign.

### 4.2 Creator / Influencer

Examples include creators active on TikTok, Telegram, Instagram, and other social platforms.

**Needs:**

- Access assigned campaigns.
- Obtain their campaign link and promotion details.
- Understand the performance of campaigns they participate in.
- See reported campaign sales and activity.

**Primary success outcome:** The creator can understand the reported results of their promotional work.

Creators are participants in the initial product, not its primary paying customers.

### 4.3 Administrator

The administrator manages platform operations and addresses basic account and data issues.

**Needs:**

- View registered businesses and creators.
- Inspect and manage campaigns.
- Review sales records.
- Investigate reported issues.
- Monitor basic platform usage.

Administrator permissions must be restricted to authorized personnel.

---

## 5. MVP Scope and Priorities

| Priority | Capability | Requirement |
|---|---|---|
| P0 | Authentication | Business and creator accounts |
| P0 | Campaign management | Create and manage campaigns |
| P0 | Campaign landing pages | Unique public campaign URLs |
| P0 | Event tracking | Visits and customer actions |
| P0 | Sales logging | Manual campaign sales entry |
| P0 | Business analytics | Campaign metrics and reports |
| P0 | Creator dashboard | Assigned campaign performance |
| P0 | Administration | Basic platform management |
| P1 | Campaign lifecycle | Start dates, end dates, and status management |
| P1 | Data export | Not required for initial launch |
| Future | Creator profiles | Campaign history and creator information |
| Future | Creator directory | Brand-only discovery |
| Future | Intelligence and brokerage | Recommendations and managed campaigns |

P0 items define the minimum product required to test the central value proposition. P1 items should be included only if they fit the development timeline without delaying the core workflow.

---

## 6. Core User Journeys

### 6.1 Business Journey

1. The business registers and signs in.
2. The business creates a campaign.
3. It assigns the campaign to a creator.
4. It configures a promotion code and available contact destinations.
5. EthioLink generates a unique campaign URL.
6. The business shares the URL with the creator.
7. The creator publishes or distributes the link.
8. Customers visit the public campaign page.
9. EthioLink records supported page visits and customer actions.
10. Customers contact the business or visit its store.
11. The business records relevant sales in EthioLink.
12. The business reviews campaign performance.

### 6.2 Creator Journey

1. The creator registers or receives access to an account.
2. The creator accesses assigned campaigns.
3. The creator retrieves the campaign link and promotion details.
4. The creator distributes the link through their social channels.
5. The creator signs in to review campaign performance.
6. The creator views recorded visits, customer actions, and reported sales.

### 6.3 Customer Journey

1. A customer encounters a creator's campaign link.
2. The customer opens the public campaign page.
3. The page displays the business, offer, promotion code, and available actions.
4. The customer copies the promotion code, opens Telegram, initiates a phone call, or opens the business location, depending on what the campaign supports.
5. The customer completes or abandons the intended action.

**Important:** The platform tracks supported actions, not every subsequent interaction or purchase. Opening Telegram does not prove that a conversation occurred, and tapping a phone number does not prove that a call was answered.

---

## 7. Functional Requirements

### 7.1 Authentication and Access Control

**FR-001 — Account registration**

The system shall allow users to register as either a Brand or a Creator.

Brand registration fields:

- Business name.
- Owner's full name.
- Phone number.
- Password.

Creator registration fields:

- Full name.
- Phone number.
- Telegram username (optional).

Email is not required in the initial registration flow.

**FR-002 — Authentication**

Users shall be able to sign in and sign out securely.

Passwords must be stored using an appropriate password-hashing mechanism, never as plaintext.

**FR-003 — Role-based access**

- Brands can access only the businesses and campaign records they are authorized to manage.
- Creators can access only campaigns assigned to them.
- Administrators can access management functions according to their privileges.
- Public campaign pages shall not require an account.

**FR-004 — Account isolation**

The backend shall enforce access permissions for every protected operation. Hiding a user interface element is not sufficient authorization.

**Open decision:** Whether a business may have multiple staff accounts is not defined for the MVP and should be decided before implementing account ownership.

### 7.2 Campaign Management

**FR-005 — Create campaign**

An authenticated brand shall be able to create a campaign containing:

- Campaign name.
- Assigned creator.
- Promotion code.
- Start date.
- End date.
- Telegram URL (optional).
- Business phone number (optional).
- Store map/location URL (optional).

The business and creator association must be stored with the campaign.

**FR-006 — Creator assignment**

A brand shall be able to select an existing creator or initiate a creator invitation flow.

The exact invitation and acceptance mechanism remains to be finalized.

**FR-007 — Campaign URL generation**

The system shall generate a unique, shareable public URL for each campaign.

Example:

`ethiolink.app/c/AB123`

The URL must not expose internal database identifiers or sensitive information.

**FR-008 — Campaign lifecycle**

Campaigns shall have a status and start/end dates.

The product must define how draft, active, completed, and paused campaigns behave. Campaign creation and reporting should not silently overwrite historical records.

**FR-009 — Campaign editing**

Authorized brands shall be able to edit permitted campaign fields. Changes to destinations, promotion codes, and dates must not corrupt historical campaign reporting.

### 7.3 Public Campaign Landing Page

**FR-010 — Public campaign access**

Customers shall be able to open campaign pages without registering or signing in.

**FR-011 — Campaign information**

The page shall display the information configured for the campaign, including:

- Business name and logo, if provided.
- Campaign offer or description.
- Promotion code.
- Relevant contact and location actions.

The final campaign content fields should be confirmed before implementation because the initial planning documents differ slightly on whether an explicit offer description is required.

**FR-012 — Customer actions**

The page shall support the following actions when the associated destination is available:

- Chat on Telegram.
- Call the business.
- Open the business location.
- Copy the promotion code.

Unavailable actions shall not be displayed as functional buttons.

**FR-013 — Promotion code copying**

Customers shall be able to copy the promotion code using a clear, accessible control.

A copy action should be recorded when the application can reliably detect it.

**FR-014 — Mobile usability**

Campaign pages must work on mobile browsers and remain usable on common smartphone screen sizes.

The initial experience should minimize friction for customers arriving from social-media applications.

### 7.4 Campaign Analytics and Event Tracking

**FR-015 — Page-view tracking**

The system shall record campaign landing-page visits.

Each event should include, where appropriate:

- Campaign ID.
- Event type.
- Timestamp.
- Anonymous visitor/session identifier.
- Relevant technical metadata required for processing and fraud prevention.

**FR-016 — Action tracking**

The system shall record supported customer actions:

- `page_view`
- `telegram_click`
- `call_click`
- `map_click`
- `copy_code`

Each event must be associated with the relevant campaign.

**FR-017 — Consistent event handling**

Event tracking must distinguish between an event being received and a destination being successfully reached.

For example, `telegram_click` means the customer activated the Telegram action. It does not prove that Telegram opened successfully or that a message was sent.

**FR-018 — Visitor counting**

The dashboard shall distinguish page-view events from unique visitors where the implementation can support reliable session-based identification.

The definition of a unique visitor must be documented. The system must not label raw page views as unique people.

**FR-019 — Duplicate and invalid events**

The system should use reasonable safeguards against duplicate events, automated traffic, and obvious abuse.

The MVP does not require sophisticated bot detection, but the limitations of the data must be understood.

**FR-020 — Analytics privacy**

Tracking shall collect only data needed for campaign reporting and platform operation.

The implementation must establish an appropriate retention policy and communicate relevant data practices to users. Sensitive customer information should not be collected unnecessarily.

### 7.5 Manual Sales Logging

**FR-021 — Record a sale**

An authorized brand shall be able to record a sale associated with a campaign.

Required field:

- Sale amount in ETB.

Optional field:

- Notes.

The campaign should be selected from the relevant campaign context where possible.

**FR-022 — Sales record**

Each sales record shall include:

- Sale ID.
- Campaign ID.
- Sale amount.
- User who recorded the sale.
- Creation timestamp.
- Optional notes.

**FR-023 — Sales validation**

The system shall reject invalid amounts and malformed input. The product must decide whether zero-value sales are allowed; negative amounts must not be treated as ordinary sales.

**FR-024 — Sale corrections**

The system should provide an authorized way to correct or remove erroneous entries, with an audit trail where practical.

Historical reports should reflect legitimate corrections without losing accountability.

**FR-025 — Attribution limitations**

Sales are manually attributed to campaigns by the business. EthioLink shall label them as reported or recorded sales rather than independently verified purchases.

The system must not claim that every recorded sale was caused by a creator.

### 7.6 Brand Dashboard and Reporting

**FR-026 — Dashboard overview**

The brand dashboard shall summarize its campaign activity, including:

- Active campaigns.
- Recorded sales.
- Reported revenue.
- Campaign performance summaries.

**FR-027 — Campaign list**

The dashboard shall show the business's campaigns and useful summary information, such as campaign name, creator, status, sales, and revenue.

**FR-028 — Campaign detail report**

Each campaign report shall display, where data is available:

- Landing-page visits.
- Unique visitors, according to the documented counting method.
- Telegram clicks.
- Call clicks.
- Map clicks.
- Promotion-code copy actions.
- Number of recorded sales.
- Total reported revenue.
- Sales-to-visitor ratio.

**FR-029 — Performance funnel**

The system shall present a simple progression from visits to customer actions to recorded sales.

The report must make clear that these are aggregate event counts, not necessarily a fully verified journey for each individual customer.

**FR-030 — Revenue calculation**

Campaign revenue shall equal the sum of eligible recorded sales for that campaign.

The platform shall not treat campaign revenue as business profit.

**FR-031 — Campaign comparison**

Brands should be able to review their campaign performance using consistent definitions and comparable reporting periods.

Advanced benchmarking across unrelated businesses is outside the MVP scope.

**FR-032 — Empty states**

Dashboards and reports shall explain when data is unavailable rather than displaying misleading zeros or fabricated examples.

### 7.7 Creator Dashboard

**FR-033 — Assigned campaigns**

Creators shall see the campaigns assigned to their accounts.

**FR-034 — Campaign performance**

Creators shall be able to view relevant campaign performance, including visits, customer actions, recorded sales, and reported revenue, subject to the business's sharing permissions.

**FR-035 — Recent activity**

The dashboard may display a recent activity list for campaign events or sales records, provided the information is available and access-controlled.

**FR-036 — No financial transactions**

The creator dashboard shall not include wallets, withdrawal functions, automated payouts, or payment balances.

Reported revenue is a campaign metric, not money owed to the creator.

### 7.8 Administration

**FR-037 — Account management**

Authorized administrators shall be able to view and manage business and creator accounts.

**FR-038 — Campaign management**

Administrators shall be able to inspect campaign records and resolve appropriate operational issues.

**FR-039 — Sales inspection**

Administrators shall be able to inspect recorded sales for support, auditing, and platform integrity purposes.

**FR-040 — Issue management**

The platform shall provide a basic way for administrators to review reported problems.

The precise issue-submission workflow remains to be decided.

**FR-041 — Platform statistics**

Administrators shall have access to basic usage statistics, such as registered accounts, campaigns, and recorded events.

**FR-042 — Administrative security**

Administrative access must be restricted, authenticated, and logged appropriately.

---

## 8. Business Rules and Metric Definitions

Consistent definitions are essential because campaign reports will influence marketing decisions.

### 8.1 Landing-Page Visits

The number of recorded `page_view` events for a campaign during the selected period.

Repeated visits may increase this count.

### 8.2 Unique Visitors

The number of distinct anonymous visitor/session identifiers observed for the campaign under the chosen identification policy.

This is an estimate of distinct visitors, not a verified count of individual people.

### 8.3 Customer Actions

Customer actions are recorded separately by type. A customer may perform more than one action, so action counts must not automatically be added together and presented as distinct leads.

### 8.4 Recorded Sales

The number of eligible sales entries associated with a campaign.

This metric reflects merchant-entered records, not independently verified transactions.

### 8.5 Reported Revenue

The sum of eligible sale amounts recorded against the campaign, expressed in Ethiopian birr (ETB).

### 8.6 Sales-to-Visitor Ratio

Where the visitor count is greater than zero:

Sales-to-visitor ratio = recorded sales ÷ unique visitors × 100%

The report must identify the sales count as merchant-reported and must not imply perfect person-level attribution.

### 8.7 Return on Investment

ROI is not a required MVP metric because campaign expenditure, product costs, and profit data have not been fully defined.

Revenue alone cannot establish profitability.

If ROI is introduced later, the required cost inputs, attribution rules, and calculation must be defined before implementation.

### 8.8 Data Integrity

Reports must be calculated from stored records, not hardcoded examples.

All dashboard figures must follow consistent date ranges, campaign ownership rules, and metric definitions.

---

## 9. Proposed Data Model

The following is the initial logical data model. It is intended to guide technical design, not prescribe a final database schema.

### 9.1 Brands

- `id`
- `name`
- `owner_name`
- `phone`
- `password_hash` or reference to an external authentication identity
- `created_at`
- `updated_at`

### 9.2 Creators

- `id`
- `name`
- `phone`
- `telegram_username` (nullable)
- `created_at`
- `updated_at`

### 9.3 Campaigns

- `id`
- `brand_id`
- `creator_id`
- `name`
- `promo_code`
- `telegram_url` (nullable)
- `phone_number` (nullable)
- `map_url` (nullable)
- `status`
- `start_date`
- `end_date`
- `created_at`
- `updated_at`

An offer description and public campaign slug may be required by the final design.

### 9.4 Events

- `id`
- `campaign_id`
- `event_type`
- `visitor_id` (nullable)
- `created_at`

Additional fields for event validation, consent handling, and deduplication may be needed.

### 9.5 Sales

- `id`
- `campaign_id`
- `amount`
- `notes` (nullable)
- `logged_by`
- `created_at`
- `updated_at`

If records can be corrected or deleted, the final model should support appropriate audit information.

### 9.6 Relationships

- One brand can own multiple campaigns.
- A creator can participate in multiple campaigns.
- A campaign belongs to one brand.
- A campaign is assigned to a creator in the initial model.
- A campaign can have multiple events.
- A campaign can have multiple recorded sales.
- Each sales record identifies the user who entered it.

**Schema decision:** The initial plan assumes one creator per campaign. If a single campaign must support multiple creators, the data model should introduce a campaign-participant relationship before implementation rather than attempting to work around the limitation later.

---

## 10. Non-Functional Requirements

### 10.1 Security

- Passwords must be securely hashed if managed by the application.
- Protected API operations must enforce role and resource-level authorization.
- Database credentials and secrets must not be exposed to client-side code.
- Input validation must be performed on the server.
- Public tracking endpoints must have reasonable abuse protections.
- Administrative operations must be access-controlled.

### 10.2 Performance

- Public campaign pages should load efficiently on typical mobile connections.
- Dashboard queries should remain responsive for ordinary MVP workloads.
- Event collection should not unnecessarily delay navigation to Telegram, phone, or map destinations.

Specific response-time targets and expected traffic volumes must be established during technical planning.

### 10.3 Reliability

- Campaign and sales records must be persisted reliably.
- Temporary event-tracking failures should not unnecessarily block customer actions.
- Database backups and a basic recovery procedure must be configured before production launch.

### 10.4 Usability and Accessibility

- The interface must be mobile-responsive.
- Forms must provide clear validation and error messages.
- Buttons and links must have understandable labels.
- Data tables and reports must remain usable on smaller screens.
- Empty, loading, success, and error states must be designed explicitly.

### 10.5 Maintainability

- Campaign logic, event tracking, reporting, and access control should be organized into clear application modules.
- Metric definitions should be centralized and documented.
- The system should support future expansion without requiring the MVP to implement future marketplace functionality.

### 10.6 Localization

The initial market is Ethiopia and monetary reporting uses ETB.

The exact language strategy, date format, timezone handling, and Amharic localization requirements must be decided before release. These requirements should not be assumed to be fully defined by the initial MVP scope.

---

## 11. Suggested Technical Architecture

This is a proposed implementation direction consistent with the MVP planning documents.

### 11.1 Application

**Next.js web application**

Provides:

- Public campaign pages.
- Brand dashboard.
- Creator dashboard.
- Administrative interface.
- Server-side application endpoints.

### 11.2 Database

**PostgreSQL**

Stores:

- Accounts and roles.
- Campaigns.
- Event records.
- Sales records.
- Relevant audit information.

### 11.3 Application Modules

1. Authentication and authorization.
2. Business and creator management.
3. Campaign management.
4. Public campaign rendering.
5. Event collection and processing.
6. Sales recording.
7. Analytics and reporting.
8. Administration.

### 11.4 Architecture Principles

- Enforce authorization on the server.
- Keep tracking and reporting definitions consistent.
- Use database constraints for essential data integrity.
- Separate public campaign access from protected dashboards.
- Avoid introducing microservices unless a demonstrated need emerges.
- Keep the deployment and operational model manageable for a small development team.

The precise hosting provider, authentication implementation, deployment setup, and database access strategy remain technical decisions for the implementation phase.

---

## 12. Success Metrics and MVP Validation

The MVP is successful only if it demonstrates real value to businesses—not simply because the software is completed.

### 12.1 Initial Validation Targets

| Metric | Initial Target |
|---|---:|
| Businesses creating campaigns | 10 |
| Sales records logged | 100+ |
| Businesses returning for another campaign | Track and evaluate |
| Creators using assigned campaign links | Track |
| Businesses consistently recording sales | Track |

These are initial targets from the MVP planning material, not validated market benchmarks.

### 12.2 Primary Success Metric

**Business repeat-campaign rate.**

The strongest initial signal is whether businesses return to use EthioLink for subsequent campaigns after experiencing the reporting workflow.

The team must define a measurement period and what qualifies as a repeat campaign before evaluating this metric.

### 12.3 Validation Questions

1. Will businesses create campaigns?
2. Will creators distribute campaign tracking links?
3. Will businesses record sales consistently?
4. Can businesses understand the resulting reports?
5. Will businesses run another campaign using EthioLink?

### 12.4 Learning Before Expansion

The team should collect qualitative feedback from businesses and creators during the pilot.

If businesses value the reports but do not record sales, the next iteration should investigate the sales-recording workflow before investing in more advanced analytics.

If businesses record sales but do not return, the team should investigate whether the data changes their decisions or is worth paying for.

---

## 13. Monetization Strategy

### 13.1 Initial Principle

The business model should prioritize the needs and willingness to pay of local businesses because they are the intended paying customers.

The MVP should establish whether businesses will pay for campaign measurement before committing to a complex monetization model.

### 13.2 Pricing Decisions Still Open

The following have not yet been established:

- Free trial or free usage limits.
- Monthly subscription pricing.
- Per-campaign pricing.
- Paid analytics or reporting tiers.
- Campaign or event limits.
- Billing and payment collection mechanisms.

These should be evaluated through interviews and pilot usage rather than treated as finalized product requirements.

### 13.3 Future Commercial Opportunity

If the tracking product generates reliable and useful data, EthioLink could expand into:

1. Campaign tracking.
2. Creator performance intelligence.
3. A brand-facing creator directory.
4. Creator recommendations and matching.
5. Managed influencer campaigns or brokerage.

These are strategic expansion possibilities, not commitments for the first release.

---

## 14. MVP Exclusions and Scope Protection

The following features must not delay the first release:

- Creator marketplace.
- Public creator ranking.
- Automated matching.
- Wallets and escrow.
- Automated payouts.
- Payment processing.
- Advanced AI recommendations.
- Cross-business performance benchmarks.
- Telegram bots.
- QR-code tracking.
- Automated purchase verification.

A new feature should enter the MVP only if it is necessary to test the core hypothesis or remove a significant obstacle to the primary user journey.

---

## 15. Proposed Development Plan

The following is an indicative 6–8 week plan from the MVP planning material. It is not a guaranteed delivery schedule.

### Week 1 — Requirements and Foundation

- Finalize user journeys and metric definitions.
- Confirm the data model.
- Establish the project structure.
- Configure the database and authentication.
- Define authorization rules.

**Deliverable:** Working application foundation and approved implementation scope.

### Week 2 — Campaign Management

- Implement brand account workflows.
- Build campaign creation and editing.
- Implement creator assignment.
- Generate unique campaign URLs.

**Deliverable:** A brand can create and manage a campaign.

### Week 3 — Public Campaign Pages

- Implement public campaign pages.
- Display promotion codes and business information.
- Implement Telegram, call, map, and copy-code actions.
- Ensure mobile responsiveness.

**Deliverable:** A customer can open a campaign page and use its supported actions.

### Week 4 — Tracking and Sales

- Implement event collection.
- Record page views and customer actions.
- Implement manual sales entry.
- Validate event and sales persistence.

**Deliverable:** Campaign activity and reported sales are recorded.

### Week 5 — Analytics and Creator Dashboard

- Implement campaign reporting.
- Calculate revenue and sales metrics.
- Build the brand dashboard.
- Build assigned-campaign views for creators.

**Deliverable:** Both primary user roles can access relevant campaign information.

### Week 6 — Administration and Quality

- Implement basic administration.
- Test access controls and data isolation.
- Validate calculations and campaign lifecycle behavior.
- Improve loading, error, and empty states.

**Deliverable:** A testable end-to-end MVP.

### Weeks 7–8 — Pilot and Refinement

If required:

- Conduct usability testing.
- Pilot with a small group of businesses and creators.
- Fix issues discovered during real usage.
- Verify backups and production configuration.
- Measure initial adoption and reporting consistency.

**Deliverable:** A pilot-ready release with initial feedback.

---

## 16. Acceptance Criteria

The MVP is ready for pilot testing when the following conditions are met.

### Authentication and Permissions

- [ ] A business can register and sign in.
- [ ] A creator can register and sign in.
- [ ] Unauthorized users cannot access protected campaign or sales records.
- [ ] Administrative functions are restricted to authorized administrators.

### Campaigns

- [ ] A business can create a campaign with the required fields.
- [ ] A campaign receives a unique public URL.
- [ ] The assigned creator can access the campaign.
- [ ] Campaign status and dates are persisted correctly.

### Public Pages and Tracking

- [ ] A customer can open a campaign page without an account.
- [ ] Configured customer actions work and record the appropriate event.
- [ ] Unconfigured actions are not presented as functional.
- [ ] Tracking failures do not unnecessarily prevent customers from using available destinations.

### Sales and Reporting

- [ ] A business can record a sale against a campaign.
- [ ] Invalid sales amounts are rejected.
- [ ] Reported revenue equals the sum of eligible recorded sales.
- [ ] Dashboard metrics are calculated from stored records.
- [ ] Reports distinguish visits, visitor estimates, actions, and recorded sales.
- [ ] Sales are not represented as independently verified transactions.

### Creator and Administration

- [ ] Creators can view their assigned campaign performance.
- [ ] Creators cannot access unauthorized campaigns.
- [ ] Administrators can inspect and manage the records needed for basic operations.

### Production Readiness

- [ ] Essential authorization and business logic have automated tests.
- [ ] Production secrets are not exposed.
- [ ] Database backups are configured.
- [ ] Privacy and data-retention practices are documented.
- [ ] The application has been tested on common mobile browsers.

---

## 17. Risks and Mitigations

### Risk 1 — Inconsistent Sales Reporting

**Problem:** Businesses may forget to log sales or may enter incorrect amounts.

**Mitigation:** Make sales entry straightforward, provide clear campaign context, and gather feedback during the pilot. Treat merchant-entered figures as reported data.

### Risk 2 — Attribution Accuracy

**Problem:** A customer may see a campaign but purchase through another channel without using the tracking link or promotion code.

**Mitigation:** Clearly communicate that campaign tracking measures observed activity and recorded sales. Avoid claiming perfect attribution.

### Risk 3 — Trust and Manipulation

**Problem:** A business or creator may dispute campaign performance figures or the attribution of sales.

**Mitigation:** Keep source records, identify who entered sales, support appropriate corrections, and document metric definitions. Do not imply independent verification where none exists.

### Risk 4 — Low Adoption

**Problem:** Businesses may not find enough value in the dashboard to adopt another tool.

**Mitigation:** Validate the workflow with real businesses before expanding the product. Prioritize the features that help them make decisions.

### Risk 5 — Two-Sided Adoption

**Problem:** The platform depends on businesses creating campaigns and creators distributing links.

**Mitigation:** Start with a manageable pilot and a clear business-led workflow instead of building a public marketplace before demand is established.

### Risk 6 — Premature Feature Expansion

**Problem:** Building discovery, rankings, payments, or advanced analytics too early could delay validation.

**Mitigation:** Enforce the MVP exclusions and use actual pilot feedback to prioritize later releases.

---

## 18. Open Questions Requiring Decisions

These decisions should be resolved before the relevant features are implemented.

1. **Campaign participation:** Can a campaign include multiple creators, or is it strictly one creator per campaign?
2. **Creator invitations:** Does the business invite a creator by phone number, username, or shareable invitation link?
3. **Campaign content:** Is an offer description required, and can businesses upload a logo?
4. **Campaign lifecycle:** Can campaigns be paused, extended, or edited after launch?
5. **Visitor identification:** What session duration and privacy rules define a unique visitor?
6. **Sales corrections:** Can businesses edit or delete sales, and what audit history is required?
7. **Creator visibility:** Which sales and revenue details may a creator see?
8. **Business ownership:** Can a business have multiple staff accounts?
9. **Localization:** Which languages are required for the initial release?
10. **Hosting and authentication:** Which production services will be used?
11. **Monetization:** What pricing model should be tested with the pilot businesses?
12. **Data retention:** How long should event records and account data be retained?
13. **Campaign offer attribution:** How should a sale be recorded when a customer does not use the campaign's promotion code?
14. **Reporting periods:** Which date ranges and comparison options are necessary for the first release?

Unresolved questions should be tracked explicitly rather than silently converted into assumptions.

---

## 19. Post-MVP Roadmap

### Release 1.1 — Reporting Improvements

Potential additions:

- Telegram notifications.
- Downloadable campaign reports.
- Improved campaign summaries.

### Release 1.2 — Creator Profiles

Potential additions:

- Creator campaign history.
- Historical campaign performance.
- Creator categories and profile information.

### Release 2.0 — Creator Intelligence

Potential additions:

- Brand-facing creator directory.
- Performance comparisons.
- Category-level performance analysis.
- Evidence-based creator recommendations, subject to sufficient reliable data.

### Release 3.0 — Brokerage and Managed Campaigns

Potential additions:

- Creator matching.
- Campaign management services.
- Managed influencer partnerships.

Each release should depend on evidence that the previous stage provides meaningful value.

---

## 20. Final Product Principle

EthioLink should not begin by trying to become every kind of influencer platform at once.

The first job is to help a business connect a creator's promotion to observable customer interest and recorded sales, then present those results clearly enough to inform the business's next decision.

The long-term opportunity is to build trusted creator performance intelligence for the Ethiopian market. The MVP earns the right to pursue that opportunity by producing useful data, encouraging repeat usage, and being honest about what its measurements can—and cannot—prove.

**The first milestone is not a marketplace launch. It is proving that businesses will use EthioLink to measure campaigns and come back to measure the next one.**