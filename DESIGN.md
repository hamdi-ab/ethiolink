# EthioLink — Design System

> **Product:** EthioLink  
> **Document:** `design.md`  
> **Status:** Initial design direction for MVP  
> **Audience:** Product, design, and engineering

---

## 1. Product design philosophy

EthioLink is a creator campaign performance platform for the Ethiopian market. Its first job is to help a business answer:

**“Did this influencer campaign work?”**

The design should make campaign activity understandable and commercially useful. It should feel like a dependable business tool—not a social network, influencer leaderboard, or generic analytics template.

### Product principles

1. **Business-first, creator-friendly.** The brand/business experience receives the deepest information architecture because businesses are the paying customer. The creator experience stays focused and lightweight.
2. **Clarity before decoration.** Make visits, intent actions, sales, revenue, and conversion understandable at a glance.
3. **Trust through transparency.** Label what is measured, what is manually entered, and what is estimated. Never imply that a click is a verified lead or that a manually logged sale was independently verified.
4. **Local by default.** Support ETB formatting, phone-number-led workflows, Telegram, calls, map directions, and mobile-first browsing.
5. **Progressive disclosure.** Show the essential result first; put supporting detail one level deeper.
6. **Calm, not sterile.** Use warm surfaces, restrained color, purposeful typography, and small moments of personality. Avoid both a cold enterprise template and a loud creator-economy aesthetic.

### MVP scope reflected in the UI

Design for these current capabilities:
- Brand and creator accounts
- Campaign creation and management
- Campaign landing pages with offer/promo code and contact actions
- Tracking page visits and Telegram, call, map, and promo-code actions
- Manual sales logging
- Campaign and account-level reporting
- A basic internal admin area

Do **not** design MVP navigation or prominent empty states around future concepts such as a creator marketplace, public creator discovery, leaderboards, AI matching, wallets, escrow, or commission payouts.

---

## 2. Brand personality

| Attribute | Direction |
|---|---|
| Overall feel | Warm, capable, modern, grounded |
| Trust | Clear labels, consistent patterns, honest metrics |
| Energy | Confident and optimistic, never loud |
| Local relevance | Practical workflows for how Ethiopian businesses communicate and sell |
| Visual character | Editorial warmth with precise data presentation |

### Brand keywords

**Connected · Credible · Practical · Human · Insightful**

Avoid:
- Neon gradients and excessive glassmorphism
- Overused blue-purple SaaS gradients
- Huge decorative charts with little meaning
- Excessive rounded cards on every element
- Influencer-style engagement counters as the main visual language
- Flags, maps, or cultural motifs used as decoration without product meaning

---

## 3. Color system

### Core palette

The proposed identity pairs a deep evergreen with warm ivory and a restrained amber accent. Evergreen communicates reliability and growth; ivory keeps the interface approachable; amber draws attention to important actions and highlights without making the product feel promotional.

| Token | Hex | Usage |
|---|---|---|
| `brand-950` | `#102F2B` | Deep brand background, dark navigation |
| `brand-900` | `#17443D` | Primary brand surface |
| `brand-800` | `#205B50` | Hover/active brand states |
| `brand-700` | `#287362` | Primary buttons and key chart series |
| `brand-100` | `#DCEDE6` | Soft brand background |
| `brand-50` | `#F0F6F2` | Subtle brand tint |
| `accent-500` | `#E6A23C` | Primary accent, highlights, selected markers |
| `accent-100` | `#FAEED8` | Accent surface |
| `coral-500` | `#D96F5D` | Secondary highlight, carefully used |
| `coral-100` | `#F8E7E2` | Soft coral surface |

### Neutral palette

| Token | Hex | Usage |
|---|---|---|
| `neutral-950` | `#202824` | Main text |
| `neutral-800` | `#37423D` | Secondary headings |
| `neutral-700` | `#53605A` | Body secondary text |
| `neutral-600` | `#69756F` | Muted labels |
| `neutral-500` | `#87918B` | Placeholder and disabled text |
| `neutral-300` | `#D7DED9` | Borders and dividers |
| `neutral-200` | `#E7EBE7` | Subtle borders |
| `neutral-100` | `#F0F2EF` | Secondary surfaces |
| `neutral-50` | `#F7F8F5` | App background |
| `white` | `#FFFFFF` | Cards and input surfaces |

### Semantic colors

| Token | Hex | Meaning |
|---|---|---|
| `success-700` | `#28734F` | Completed, positive, active |
| `success-100` | `#E3F2E9` | Success background |
| `warning-700` | `#9A6417` | Attention, pending |
| `warning-100` | `#FBF0D9` | Warning background |
| `danger-700` | `#B8473D` | Destructive, failed |
| `danger-100` | `#F9E6E3` | Error background |
| `info-700` | `#356B91` | Informational state |
| `info-100` | `#E6F0F7` | Informational background |

### Color usage rules

- Use evergreen for the primary action and active navigation—not for every icon or heading.
- Use amber sparingly for a key highlight, selected chart point, or important attention cue.
- Use semantic colors only when they communicate status or meaning.
- Do not communicate status through color alone; pair color with text or an icon.
- Keep most dashboard surfaces neutral. Data should be the visual focus.
- Maintain readable contrast for text and controls. Avoid muted gray text on tinted backgrounds when it becomes difficult to read.

---

## 4. Typography

### Recommended typefaces

- **Headings and UI:** `Manrope` — distinctive but readable, with a confident product feel.
- **Body and controls:** `Inter` — highly legible for dense interfaces and forms.
- **Numeric/data emphasis:** `IBM Plex Mono` — optional for IDs, tracking codes, and selected tabular figures.

If loading multiple fonts is undesirable, use **Inter throughout** and reserve weight and size for hierarchy.

### Type scale

| Style | Size / line height | Weight | Usage |
|---|---:|---:|---|
| Display | 36 / 44 px | 700 | Rare page-level statement |
| H1 | 30 / 38 px | 700 | Main page title |
| H2 | 22 / 30 px | 650 | Section title |
| H3 | 18 / 26 px | 600 | Card or panel title |
| Body | 14 / 22 px | 400 | Default interface text |
| Body strong | 14 / 22 px | 600 | Emphasis and table values |
| Small | 12 / 18 px | 400 | Helper text, metadata |
| Label | 12 / 16 px | 600 | Form labels and table headers |
| Metric | 30 / 36 px | 700 | KPI values |

Use sentence case for page titles, buttons, and navigation. Avoid all-caps labels except for short, low-emphasis overlines.

### Numeric presentation

- Use tabular numerals for dashboard metrics so values do not jump in width.
- Format currency as **ETB 54,300** or **54,300 ETB** consistently throughout the product. Pick one convention and apply it everywhere; recommended UI convention: `ETB 54,300`.
- Use readable separators for large values: `12,450`, not `12450`.
- Show the date range beside performance summaries so the reporting period is never ambiguous.

---

## 5. Layout and spacing

### Grid

- Desktop dashboard: 12-column content grid.
- Main content max width: 1440 px.
- Desktop sidebar: 248 px expanded; 72 px collapsed.
- Main content horizontal padding: 32 px desktop, 24 px tablet, 16 px mobile.
- Use a consistent 8 px spacing rhythm.

### Spacing tokens

| Token | Value |
|---|---:|
| `space-1` | 4 px |
| `space-2` | 8 px |
| `space-3` | 12 px |
| `space-4` | 16 px |
| `space-5` | 20 px |
| `space-6` | 24 px |
| `space-8` | 32 px |
| `space-10` | 40 px |
| `space-12` | 48 px |
| `space-16` | 64 px |

### Shape and elevation

| Token | Value | Usage |
|---|---:|---|
| `radius-sm` | 6 px | Small controls, badges |
| `radius-md` | 10 px | Inputs, buttons |
| `radius-lg` | 14 px | Cards and panels |
| `radius-xl` | 20 px | Landing-page feature surfaces |
| `radius-full` | 999 px | Pills and avatars |
| `shadow-sm` | `0 1px 2px rgba(16,47,43,.06)` | Subtle card separation |
| `shadow-md` | `0 8px 24px rgba(16,47,43,.08)` | Popovers and elevated panels |

Prefer borders over shadows. Avoid nesting cards inside cards unless the hierarchy genuinely requires it.

---

## 6. Application shell and navigation

### Brand/business dashboard

Desktop:
- Left persistent sidebar with EthioLink mark and workspace/business name.
- Main content area with page title, contextual description, and one clear primary action.
- Top-right utility area for notifications/profile only when those features exist.
- Content organized into a small number of meaningful sections.

Suggested MVP navigation:
1. Overview
2. Campaigns
3. Sales
4. Reports
5. Settings

Do not add a “Discover creators” or “Marketplace” item in the MVP.

### Creator dashboard

Keep the creator navigation smaller:
1. Overview
2. Campaigns
3. Settings

Creator screens should emphasize active campaigns, visits/actions, sales recorded, and recent activity. Avoid exposing brand-only management tools.

### Mobile behavior

- Use a compact top bar and bottom navigation for the most important destinations.
- Tables should become stacked rows or horizontally scrollable only when necessary.
- Keep the primary action reachable without scrolling where practical.
- Forms should use a single column and full-width controls.
- Campaign landing pages must be especially fast and usable on mobile, since customers arrive from social platforms.

---

## 7. Core screen direction

### 7.1 Brand overview

**Purpose:** Give a business owner a quick, honest picture of campaign performance.

Recommended hierarchy:
1. Page title: “Overview” with reporting period.
2. Primary action: “Create campaign”.
3. KPI row:
   - Campaign visits
   - Intent actions
   - Sales recorded
   - Revenue recorded
4. Performance trend or campaign comparison.
5. Active campaigns table/list.
6. Recent sales activity.

Design notes:
- Make the revenue figure prominent but do not let it dominate the entire page.
- Each metric needs a clear label and, where useful, a short definition.
- Avoid fake precision or unsupported trend percentages.
- If no campaigns exist, replace charts with a useful first-campaign explanation and one primary CTA.

### 7.2 Campaign list

Show:
- Campaign name
- Creator
- Status
- Date range
- Visits
- Sales recorded
- Revenue recorded

Use clear status labels such as Draft, Active, Completed, and Paused only if those states are implemented. Provide search and simple filters when the list grows.

### 7.3 Create campaign

Use a focused, calm form. Group fields by task:

**Campaign details**
- Campaign name
- Offer or short description, if supported

**Creator**
- Select an existing creator or invite/add a creator

**Tracking and customer actions**
- Promo code
- Telegram link (optional)
- Business phone number (optional)
- Store/map link (optional)

**Schedule**
- Start date
- End date

Show required/optional status clearly. Explain what happens after saving: EthioLink creates a unique campaign link that the business can share with the creator.

Avoid a long multi-step wizard for a small form. Use sections on one page unless usability testing shows the form is too long.

### 7.4 Campaign detail and report

This is the most important analytical screen.

Recommended hierarchy:
1. Campaign name, creator, status, and date range.
2. Shareable tracking link with copy action.
3. Performance funnel:
   - Page visits
   - Intent actions
   - Sales recorded
4. Action breakdown:
   - Telegram clicks
   - Call clicks
   - Map clicks
   - Promo-code copies
5. Sales and revenue summary.
6. Sales log / recent activity.

Important language:
- Use **Visits** for landing-page views.
- Use **Actions** or **Intent actions** for Telegram, call, map, and promo-code interactions.
- Use **Sales recorded** for merchant-entered sales.
- Use **Revenue recorded** for the sum of logged sale amounts.

Do not call every action a “lead” unless the product has a clear lead definition. Do not call manually logged sales “verified sales” unless a verification process exists.

### 7.5 Add sale

The sale logging interaction must be quick enough for a busy shop owner.

Fields:
- Campaign (preselected when launched from a campaign)
- Promo code (pre-filled where possible)
- Sale amount
- Optional note

After saving, show a clear confirmation and update the campaign totals. Do not imply that EthioLink processed the customer's payment.

### 7.6 Creator overview

Show:
- Active campaigns
- Visits
- Intent actions
- Sales recorded
- Recent campaign activity

Keep the information useful and transparent. A creator should understand what the numbers represent and which campaign they belong to.

### 7.7 Public campaign landing page

This is a customer-facing page, not a dashboard.

Recommended layout:
1. Brand logo/name.
2. Campaign offer or short message.
3. Promo code in a visually distinct block with a copy button.
4. Clear actions: Chat on Telegram, Call business, Open map.
5. Optional store details.

Design priorities:
- Mobile-first, fast-loading, minimal distractions.
- No account creation or login requirement.
- Large tap targets and clear action labels.
- Track each supported action without delaying the customer's handoff to Telegram, phone, or maps.
- Do not add dashboard navigation or unnecessary platform marketing.

### 7.8 Admin

An internal operational interface, not a public-facing product showcase.

Keep it functional and restrained:
- Brands
- Creators
- Campaigns
- Sales
- Reported issues
- Usage statistics

Use tables, filters, detail drawers, and explicit confirmation for destructive actions. Restrict access appropriately.

---

---


## 8. Component rules

### Buttons

- **Primary:** evergreen fill, white text. One primary action per major screen area.
- **Secondary:** white or neutral surface with a visible border.
- **Tertiary:** text button for low-emphasis actions.
- **Destructive:** danger color, used only for destructive actions.
- Use verbs that describe the result: “Create campaign”, “Save sale”, “Copy link”.

Button height:
- Small: 32 px
- Default: 40 px
- Large: 48 px

### Inputs

- Labels remain visible above the field; do not rely on placeholders as labels.
- Use clear helper text for optional fields and expected formats.
- Error messages explain how to fix the issue.
- Preserve entered values after validation errors.
- Phone, URL, date, and amount fields should use suitable input types and validation.

### Cards

Use cards to group related information, not to wrap every element. KPI cards should have:
- A short label
- A prominent value
- Optional period/context
- Optional trend only when the comparison is real and defined

### Tables

- Clear column labels and consistent alignment.
- Right-align numeric values.
- Use tabular numerals for counts and currency.
- Keep row actions discoverable but visually quiet.
- On mobile, convert rows into compact stacked summaries where practical.

### Badges and statuses

Use small, low-emphasis badges. Always include text. Reserve strong colors for meaningful states such as active, completed, pending, or failed.

### Charts

- Prefer simple line, bar, and funnel visualizations.
- Use brand green as the primary series and amber as a secondary highlight.
- Avoid 3D charts, excessive gradients, and unnecessary legends.
- Include labels, units, and date ranges.
- Provide an empty state when there is insufficient data; never fabricate sample-looking metrics in a live account.

### Icons

Use one consistent outline icon family (for example, Lucide). Icons should support recognition, not replace labels in unfamiliar workflows. Avoid mixing filled and outline styles arbitrarily.

---

## 9. Data visualization and metric language

EthioLink's design depends on users understanding the difference between attention, intent, and sales.

| Stage | Metric | Meaning |
|---|---|---|
| Attention | Visits | Campaign landing-page visits |
| Intent | Telegram clicks | Visitors who opened the Telegram action |
| Intent | Call clicks | Visitors who tapped the call action |
| Intent | Map clicks | Visitors who opened the map action |
| Intent | Promo-code copies | Visitors who copied the code |
| Outcome | Sales recorded | Sales manually logged by the business |
| Outcome | Revenue recorded | Total amount of logged sales |

### Funnel guidance

A funnel can show:
**Visits → Intent actions → Sales recorded**

But do not imply that each action belongs to a unique person or that all actions are distinct users unless the analytics implementation supports that interpretation. A person may perform multiple actions.

### Conversion rate

If displayed, define the formula in the interface. A possible simple MVP definition is:

`Sales recorded ÷ Visits × 100`

Label it **Recorded sales / visits** or provide a tooltip explaining the calculation. Avoid presenting it as a universal industry-standard conversion rate.

### Trust and attribution

- State that sales are entered by the business.
- Avoid implying that a click proves a purchase.
- If attribution is based on a promo code or merchant selection, make that method clear.
- Use “recorded” until a real verification mechanism exists.

---

## 10. Content and localization

### Voice

Write like a helpful business tool: direct, calm, and plain-spoken.

Good:
- “Create campaign”
- “Copy tracking link”
- “Record a sale”
- “No campaigns yet”
- “Sales are entered by your business”

Avoid:
- “Unlock the power of influence”
- “Supercharge your growth”
- “Revolutionary creator ecosystem”
- Unexplained analytics jargon

### Localization requirements

The MVP targets Ethiopian businesses, so plan for:
- ETB currency display.
- Ethiopian phone-number formats, including validation that does not assume one exact user-entered format.
- Telegram links and phone-call actions.
- Store/map links.
- Future-ready localization for Amharic and other languages.

Do not hard-code English text into components. Use translation keys even if the first release ships in English.

For dates, choose one consistent display convention and make the reporting timezone explicit. Consider Ethiopian calendar support as a future localization decision rather than silently mixing calendar systems.

---

## 11. Responsive behavior

### Desktop (≥ 1024 px)
- Persistent sidebar.
- Multi-column KPI layout.
- Tables and side-by-side report panels.
- Keep content width controlled for readability.

### Tablet (768–1023 px)
- Collapsible sidebar.
- Two-column KPI layout.
- Reduce chart and table density.

### Mobile (< 768 px)
- Bottom navigation for core destinations.
- Single-column layout.
- Full-width primary actions.
- Stacked KPI cards or a two-column compact grid.
- Tables become cards/rows with the most important values first.
- Public campaign page receives the strongest mobile optimization.

Do not simply shrink desktop layouts. Reorder content around the task the user is trying to complete.

---

## 12. Accessibility and interaction

- Meet WCAG AA contrast for normal text and controls.
- Support keyboard navigation and visible focus states.
- Use semantic headings and form labels.
- Provide text labels for icon-only controls through accessible names.
- Do not use color alone to communicate status.
- Make interactive targets comfortably tappable (aim for at least 44 × 44 px on touch screens).
- Respect reduced-motion preferences.
- Use loading, success, empty, and error states consistently.
- Confirm destructive actions and make recovery possible where practical.

---

## 13. Motion

Motion should clarify state, not decorate the dashboard.

Use:
- 120–180 ms for hover/focus transitions.
- 180–240 ms for menus, dialogs, and drawers.
- Subtle number changes only when they help explain an update.
- Skeleton loading for data-heavy sections when appropriate.

Avoid:
- Animated charts that replay on every visit.
- Bouncy interactions.
- Large page transitions.
- Motion that delays navigation or customer actions.

---

## 14. Empty, loading, and error states

Every core screen needs all four states.

### Empty
Explain what is missing and provide the next useful action.
Example: “No campaigns yet. Create your first campaign to start measuring visits and sales.”

### Loading
Use skeletons that resemble the final layout. Avoid indefinite spinners for full pages.

### Error
Use plain language, preserve user input, and provide a retry path where possible.

### Success
Confirm the action and its consequence.
Example: “Sale recorded. Campaign totals have been updated.”

---


## 15. Dark mode — complementary theme

Dark mode is a first-class companion to the light theme, not a color-inverted afterthought. It should preserve EthioLink's warm, grounded identity while making long dashboard sessions comfortable. The dark theme uses deep green-charcoal surfaces rather than pure black, softened text rather than harsh white, and a brighter evergreen for primary actions.

### 16.1 Theme principles

1. **Same identity, different lighting.** Keep the evergreen/amber identity, typography, spacing, component shapes, and information hierarchy consistent across themes.
2. **Use layered surfaces.** Separate the app background, content surfaces, and elevated surfaces with subtle changes in tone. Do not rely on shadows alone.
3. **Avoid pure black and pure white.** Use green-tinted charcoal backgrounds and slightly softened near-white text.
4. **Protect data legibility.** Tables, chart labels, KPI values, status badges, and helper text must remain readable in both themes.
5. **Use bright brand color selectively.** The dark theme's primary green should be lighter than the light theme's button green so it remains legible against dark surfaces.
6. **Do not change meaning between themes.** Success, warning, danger, and information retain the same meaning and recognizable hue family.
7. **Do not make every surface a card.** Surface layering should be quiet; preserve the existing preference for whitespace, grouping, and restrained borders.

### 16.2 Dark theme semantic tokens

These are proposed starting values. Validate actual text/background combinations against WCAG AA before shipping.

| Token | Light theme | Dark theme | Usage |
|---|---|---|---|
| `color-bg` | `#F7F8F5` | `#0D1714` | App/page background |
| `color-surface` | `#FFFFFF` | `#14211D` | Cards, dialogs, main panels |
| `color-surface-subtle` | `#F7F8F5` | `#101C18` | Quiet inset areas |
| `color-surface-muted` | `#F0F2EF` | `#1A2A24` | Hover areas, table headers, secondary panels |
| `color-surface-raised` | `#FFFFFF` | `#1D3029` | Menus, popovers, raised panels |
| `color-text` | `#202824` | `#F1F5F1` | Main text |
| `color-text-secondary` | `#53605A` | `#C0CCC4` | Supporting text |
| `color-text-muted` | `#69756F` | `#9BAAA1` | Metadata and quiet labels |
| `color-border` | `#D7DED9` | `#304239` | Standard borders |
| `color-border-subtle` | `#E7EBE7` | `#26372F` | Dividers and subtle boundaries |
| `color-primary` | `#287362` | `#78B99D` | Primary buttons, active controls, key series |
| `color-primary-hover` | `#205B50` | `#91C9AE` | Primary hover state |
| `color-primary-pressed` | `#17443D` | `#5FA487` | Pressed state |
| `color-primary-on` | `#FFFFFF` | `#0D2119` | Text/icon on primary action |
| `color-accent` | `#E6A23C` | `#F0B85C` | Highlights and selected data points |
| `color-accent-surface` | `#FAEED8` | `#382B19` | Accent-tinted surface |
| `color-focus` | `#287362` | `#91C9AE` | Focus ring |

### 16.3 Dark semantic status colors

Use tinted backgrounds with readable foreground colors. Keep status text and icons visible; do not rely on a small colored dot alone.

| Status | Light foreground / background | Dark foreground / background |
|---|---|---|
| Success | `#28734F` / `#E3F2E9` | `#83D1A5` / `#193629` |
| Warning | `#9A6417` / `#FBF0D9` | `#F0C36F` / `#3A2D18` |
| Danger | `#B8473D` / `#F9E6E3` | `#F18B80` / `#3D211F` |
| Info | `#356B91` / `#E6F0F7` | `#8FC4E8` / `#1B3040` |

### 16.4 Component behavior in dark mode

**Navigation**
- The sidebar and mobile navigation use the same dark surface family as the app, with a subtle border separating them from content.
- Active navigation uses a restrained green-tinted surface and a clear text/icon state. Avoid a large saturated green block.
- Keep hover and selected states distinct; keyboard focus must remain visible.

**Cards and panels**
- Standard cards use `color-surface`; inset chart controls or grouped details may use `color-surface-subtle`.
- Use `color-border-subtle` for quiet separation and `color-border` for interactive boundaries.
- Avoid strong drop shadows on dark surfaces. Use a small elevation change in surface tone for popovers and menus.

**Buttons**
- Primary buttons use `color-primary` with `color-primary-on` text.
- Secondary buttons use a transparent or surface fill with a visible border.
- Tertiary actions remain text buttons with clear hover and focus states.
- Destructive actions use the danger semantic pair; do not use red for ordinary secondary actions.

**Inputs**
- Input backgrounds should be distinguishable from the surrounding surface.
- Borders must remain visible without making every field look heavy.
- Placeholder text is lower emphasis than entered text but must remain readable.
- Error, disabled, focus, and read-only states must be visually distinct.

**Tables**
- Use subtle row dividers, not bright grid lines.
- Table headers may use `color-surface-muted`.
- Hovered rows receive a restrained surface tint.
- Keep numeric columns aligned and tabular; do not dim important metrics to create visual softness.

**Badges**
- Use the dark status foreground/background pairs above.
- Keep badge text concise and always present.
- Do not use the same bright color for both a badge background and its text.

**Charts**
- Use the brighter dark-theme primary green for the main series and amber for a secondary highlight.
- Supporting series should use clearly distinguishable, color-blind-aware hues; avoid multiple similar greens.
- Grid lines and axes should be low-contrast but still visible.
- Tooltips use the raised surface, a clear border, and high-contrast text.
- Never encode a series only by color: include labels, legends, markers, or line styles.
- Keep chart colors consistent across visits, intent actions, sales recorded, and revenue recorded. Do not let a theme change alter metric meaning.

**Public campaign landing pages**
- The customer-facing campaign page may follow the visitor's system preference, but its offer and contact actions must remain high-contrast.
- Do not force the dashboard's saved theme preference onto a public visitor.
- Keep the landing page lightweight and avoid adding a theme control if it distracts from the campaign action.

### 16.5 Theme selection and persistence

- Offer **Light**, **Dark**, and **System** choices in account settings or the profile/preferences menu.
- Use **System** as the default for a first-time visitor unless product requirements later establish a different default.
- When set to System, follow the operating system/browser preference and update when that preference changes.
- Persist an explicit Light or Dark selection across sessions for that signed-in user. For signed-out public pages, use the visitor's system preference.
- Apply the theme before the main interface paints where the application architecture allows, to avoid a bright flash when opening in dark mode.
- Do not put a prominent theme toggle in the main navigation. A small, discoverable control in the profile/preferences area is sufficient.
- Ensure charts, maps, third-party widgets, dialogs, toasts, date pickers, and empty/loading/error states use the active theme too.

### 16.6 Dark mode quality checklist

- [ ] Main text and essential controls meet WCAG AA contrast against their actual surfaces.
- [ ] Muted labels remain readable; they are not simply made faint to look elegant.
- [ ] Borders distinguish controls and surfaces without creating a grid-heavy interface.
- [ ] Focus rings are visible on every interactive component.
- [ ] Hover, active, selected, disabled, error, and success states are all defined.
- [ ] Charts and tooltips remain understandable and consistent with the light theme.
- [ ] No component is left with a hard-coded light background or dark text.
- [ ] The theme preference survives navigation and reloads.
- [ ] System preference works when the user selects System.
- [ ] Public campaign pages remain readable and action-focused in either theme.

## 16. Suggested design tokens

Use semantic tokens in components. Components should reference `--color-bg`, `--color-surface`, `--color-text`, and similar role-based variables rather than hard-coding palette values. This is what makes the two themes complementary and maintainable.

The values below are initial proposals. Keep the raw brand palette available for brand assets and data visualization, but use semantic tokens for interface surfaces and text.

```css
/* Shared, theme-independent tokens */
:root {
  color-scheme: light dark;

  /* Brand palette */
  --palette-brand-950: #102F2B;
  --palette-brand-900: #17443D;
  --palette-brand-800: #205B50;
  --palette-brand-700: #287362;
  --palette-brand-100: #DCEDE6;
  --palette-brand-50: #F0F6F2;

  /* Accent palette */
  --palette-accent-500: #E6A23C;
  --palette-accent-100: #FAEED8;
  --palette-coral-500: #D96F5D;
  --palette-coral-100: #F8E7E2;

  /* Typography */
  --font-heading: "Manrope", "Inter", sans-serif;
  --font-body: "Inter", sans-serif;
  --font-mono: "IBM Plex Mono", monospace;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-full: 999px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}

/* Light theme */
:root,
[data-theme="light"] {
  color-scheme: light;

  --color-bg: #F7F8F5;
  --color-surface: #FFFFFF;
  --color-surface-subtle: #F7F8F5;
  --color-surface-muted: #F0F2EF;
  --color-surface-raised: #FFFFFF;

  --color-text: #202824;
  --color-text-secondary: #53605A;
  --color-text-muted: #69756F;

  --color-border: #D7DED9;
  --color-border-subtle: #E7EBE7;

  --color-primary: #287362;
  --color-primary-hover: #205B50;
  --color-primary-pressed: #17443D;
  --color-primary-on: #FFFFFF;

  --color-accent: #E6A23C;
  --color-accent-surface: #FAEED8;
  --color-focus: #287362;

  --color-success: #28734F;
  --color-success-bg: #E3F2E9;
  --color-warning: #9A6417;
  --color-warning-bg: #FBF0D9;
  --color-danger: #B8473D;
  --color-danger-bg: #F9E6E3;
  --color-info: #356B91;
  --color-info-bg: #E6F0F7;

  --shadow-sm: 0 1px 2px rgba(16, 47, 43, .06);
  --shadow-md: 0 8px 24px rgba(16, 47, 43, .08);
}

/* Dark theme */
[data-theme="dark"] {
  color-scheme: dark;

  --color-bg: #0D1714;
  --color-surface: #14211D;
  --color-surface-subtle: #101C18;
  --color-surface-muted: #1A2A24;
  --color-surface-raised: #1D3029;

  --color-text: #F1F5F1;
  --color-text-secondary: #C0CCC4;
  --color-text-muted: #9BAAA1;

  --color-border: #304239;
  --color-border-subtle: #26372F;

  --color-primary: #78B99D;
  --color-primary-hover: #91C9AE;
  --color-primary-pressed: #5FA487;
  --color-primary-on: #0D2119;

  --color-accent: #F0B85C;
  --color-accent-surface: #382B19;
  --color-focus: #91C9AE;

  --color-success: #83D1A5;
  --color-success-bg: #193629;
  --color-warning: #F0C36F;
  --color-warning-bg: #3A2D18;
  --color-danger: #F18B80;
  --color-danger-bg: #3D211F;
  --color-info: #8FC4E8;
  --color-info-bg: #1B3040;

  /* Shadows are deliberately restrained in dark mode. */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, .18);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, .24);
}

/* Example component usage */
body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.button-primary {
  background: var(--color-primary);
  color: var(--color-primary-on);
}

.button-primary:hover {
  background: var(--color-primary-hover);
}

:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

Implementation notes:
- Use a theme attribute such as `data-theme="light"` or `data-theme="dark"` on the document root.
- If using System mode, resolve the operating-system preference and apply the matching theme; do not create a third set of colors.
- Avoid hard-coded `#FFFFFF`, `#000000`, or palette colors inside individual components. Use semantic variables.
- For charts, define separate light/dark chart tokens and keep the same metric-to-color mapping in both themes.
- Test contrast using the final rendered foreground/background pairs, not by judging hex values independently.

---

## 17. Design acceptance checklist

Before a screen is considered ready, verify:

- [ ] It supports a real MVP workflow.
- [ ] The primary action is obvious.
- [ ] The hierarchy makes the most important information easiest to find.
- [ ] Metrics have clear definitions and reporting periods.
- [ ] Manual sales are not presented as independently verified.
- [ ] It works on a narrow mobile screen.
- [ ] Loading, empty, success, and error states are designed.
- [ ] Keyboard focus and text contrast are usable.
- [ ] It uses the shared tokens and component patterns.
- [ ] It avoids introducing future-scope features into the MVP.

---

## 18. What this document does not decide

These are deliberate product/design questions to validate rather than silently assume:

- Final EthioLink logo and wordmark.
- Whether the product should ship in English only or with Amharic at launch.
- Ethiopian calendar support and date-display conventions.
- Exact campaign lifecycle/status rules.
- Whether campaign offers need a dedicated field in the MVP data model.
- Whether reports need export/PDF in the first release.
- Exact theme preference UI placement and whether the first-run default should be System or Light. The proposed behavior is System by default with Light/Dark overrides.
- Final chart definitions once event tracking and attribution rules are implemented.

---

## 19. Source basis and design assumptions

This design direction is grounded in the EthioLink discussions and source documents:

- The product is positioned as a campaign performance and, over time, creator intelligence platform—not merely a link-in-bio tool.
- Local commerce behavior matters: Telegram, phone calls, DMs, Telebirr, and physical stores are part of the context.
- The MVP is business-first, with brands as paying customers and creators as participants.
- The core workflow is campaign creation → tracking link → customer actions → merchant-recorded sale → performance report.
- The MVP should focus on campaign management, tracking, sales logging, and reporting; marketplace, leaderboards, wallets, escrow, AI matching, and automated payouts are deferred.
- Trust is a major product risk. Merchant-entered sales must not be mislabeled as verified outcomes.

**The specific palette, typography, layout measurements, and component styling in this document are proposed design decisions**, not requirements stated in the source documents. They are a starting system to test in real screens and refine with user feedback.
