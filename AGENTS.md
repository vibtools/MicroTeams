# AGENTS.md - Project Rules & Guidelines

These instructions and rules are strictly binding for all AI coding agents working on this project.

---

## 1. Clean, Compact & Small Size UI Design
- **Compact Spacing & Scale**: Design all UI components, cards, tables, inputs, and modals with small, dense, clean, and space-efficient layouts (e.g. `text-[11px]`, `text-[12px]`, compact padding `p-2` to `p-4`, tight gaps).
- **Zero Clutter**: Avoid unnecessary padding, oversized elements, full-sentence marketing filler, or large blank margins. Keep the interface sleek and high-density.

---

## 2. No Unnecessary Subtitles or Descriptions in Admin & User Panels
- **Clean Headers**: Admin and User panel pages and tabs must **NEVER** contain redundant subtitle descriptions, explanatory helper paragraphs, or verbose descriptive text under page headers and card titles.
- **Direct & Functional**: Keep headers strictly focused on the title and essential badges/counters (e.g., `<h3 className="...">Page Title</h3>` + count tags). Do not add `<p className="...">Manage your...</p>` style sub-descriptions unless explicitly requested.

---

## 3. Dark Theme Only
- **Palette**: The entire application (client dashboard, admin panel, leader interface, components) must be designed in a sophisticated dark theme.
- **Backgrounds & Borders**:
  - Backgrounds: Deep rich darks (`#0B0F17`, `#0E131F`, `#12171F`, `#161B22`, `#1C2128`).
  - Borders: Refined subtle contrast borders (`#21262D`, `#30363D`, `#374151`).
  - Text: High-contrast light text (`#E6EDF3`, `#C9D1D9`, `#8B949E`).
  - Accents: Precision cyan/sky (`#38BDF8`), emerald green (`#22C55E`), amber (`#F59E0B`), and crisp status indicators.

---

## 4. Typography & Font Weight Restrictions
- **Maximum Font Weight**: Font weights must **NEVER** exceed `500`.
  - Allowed weights: `font-light` (300), `font-normal` (400), `font-medium` (500).
  - **Forbidden**: Do not use `font-semibold` (600), `font-bold` (700), `font-extrabold` (800), or `font-black` (900).
- **Clean Hierarchy**: Establish visual contrast through typography pairing, text color shades, tracking, and sizing rather than heavy bold weights.

---

## 5. Groupwise Compact Sidebar Design
- **Structured Grouping**: Sidebars in both the Admin and User dashboards must be organized into logical, clean, groupwise categories (e.g., Core Operations, User Management, Financials, System & Infrastructure).
- **Compact & Modern**: Group headers must be clean, subtle, and compact with concise category labels, neatly aligned icons, active state indicators, and collapsible/tight spacing.

---

## 6. Strict Adherence to System & AI Instructions
- All instructions defined in the system prompt, AI instructions, security guidelines, and workspace guidelines must be rigorously and continuously followed on every task.
