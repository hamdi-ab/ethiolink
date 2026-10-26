# EthioLink Frontend & Architectural Standards

This document establishes the UI/UX quality bar, design system standards, and component hierarchy guidelines for EthioLink. All reviewer agents and contributors must enforce these standards.

---

## 1. Single-Layer Card Hierarchy (Anti-Slop Discipline)

- **Rule:** Never nest a bordered card inside another bordered card container. Double borders create visual mud and reduce legibility.
- **Pattern:**
  - Outer containers carry standard structure borders: `border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900`.
  - Inner step tiles, funnel stages, and breakdown elements must be flat and borderless:
    ```tsx
    // Correct: Borderless tint tile with subtle hover definition
    <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-750 transition-all">
      ...
    </div>
    ```

---

## 2. Micro-Copy & Badge Typography (WCAG AA Contrast)

- **Rule:** Hard floor for all metadata badges, status labels, and KPI section headers is `text-[11px]`.
- **Banned Classes:** Prohibit `text-[9px]` and `text-[10px]` on content and navigation labels.
- **Standard Header Treatment:**
  ```tsx
  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
    Section Title
  </span>
  ```
- **Contrast Requirement:** Subtitles and helper text must use `text-slate-600 dark:text-slate-300` minimum to maintain WCAG AA readability against `slate-50`/`slate-950` backgrounds.

---

## 3. Brand-Authentic Color Palettes

- **Platform Colors:**
  - Primary Action / Digital: Emerald (`emerald-600`, `emerald-500`)
  - Commerce / In-Store POS / Promo: Amber / Gold (`amber-600`, `amber-500`, `amber-400`)
  - Channel Indicators:
    - Telegram: Telegram Brand Blue (`#229ED9`)
    - Direct Call: Emerald (`text-emerald-600 dark:text-emerald-400`)
    - Map Directions: Indigo (`text-indigo-600 dark:text-indigo-400`)
    - Promo Code Copies: Amber (`text-amber-600 dark:text-amber-400`)
- **Prohibition:** Do not introduce off-domain palettes (e.g. arbitrary purples or magentas) for core platform interactions.

---

## 4. Aggregate Omnichannel Visual Distribution

- **Rule:** When presenting multi-channel attribution (Telegram clicks, phone calls, maps, promo copies), always include an aggregate horizontal proportional share bar directly above individual metric counters.
- **Format:**
  - Stacked flex bar (`h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex`).
  - Proportional segment widths (`style={{ width: `${percentage}%` }}`).
  - Accessible micro-legend displaying percentage shares.

---

## 5. Keyboard Navigation & Accessibility Rings

- **Rule:** All interactive `<button>`, `<a>`, `<select>`, and custom controls must define `focus-visible:` focus rings.
- **Standard Focus Ring:**
  ```tsx
  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
  ```
- Never suppress outline or focus styles without replacing them with `focus-visible:ring-2`.
