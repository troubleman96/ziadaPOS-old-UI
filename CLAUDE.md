# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **IMPORTANT — Next.js version**: This project runs **Next.js 16** (React 19). APIs, conventions, and file structure differ from earlier versions. Read `node_modules/next/dist/docs/` before writing any Next.js-specific code and heed deprecation notices.

## Commands

```bash
npm run dev      # dev server on http://localhost:3000
npm run build    # production build
npm run start    # serve production build
```

No test runner, no linter config — TypeScript (`tsc --noEmit`) is the only static check available.

## Architecture

**Stack**: Next.js 16 App Router · React 19 · TypeScript · zero external UI libraries.

**Styling**: Single custom CSS design system in `app/globals.css` — no Tailwind, no CSS modules (except the legacy `page.module.css` stub). All visual tokens are CSS custom properties defined in `:root` and overridden in `html[data-theme="light"]`. Never introduce Tailwind or a component library.

**Design tokens** (all in `globals.css`):
- Color semantic vars: `--bg` / `--bg-2…4`, `--fg` / `--fg-2…4`, `--line` / `--line-2…3`, `--accent`, `--good`, `--warn`, `--bad`, `--info` (each with a `-soft` and `-line` variant).
- Layout vars: `--nav-w: 248px`, `--topbar-h: 56px`, `--cart-w: 380px`.
- Responsive grid vars (CSS-only, no JS): `--cols-4`, `--cols-3`, `--cols-2`, `--cols-detail`, `--cols-dash-wide`, `--cols-settings`, `--cols-receipt` — each overridden at 1100 / 900 / 540 / 380 px breakpoints.
- Typography: `--sans` (Geist), `--mono` (Geist Mono). Use `.mono` and `.tnum` utility classes.

**App shell** (`components/`):
- `AppShell` — wraps every page. Owns theme state (dark/light, persisted in `localStorage` as `ziada-theme`), mobile nav open/close state, and the `ThemeContext`. Pass `full={true}` for pages that need full-height custom layouts (POS); otherwise children render in a padded `.body` scroller.
- `Sidenav` — fixed left nav, slides in as overlay on mobile (`nav-open` class). Accepts `navOpen`/`onClose` from AppShell.
- `Topbar` — breadcrumbs (`crumbs` prop), optional right-side `actions` slot, hamburger button (mobile only, calls `onMenuToggle`).
- `Icons` — centralised SVG icon components. Add new icons here, never inline SVG in page files.

**Data layer** (`lib/`):
- `lib/data.ts` — all mock/seed data as typed TypeScript constants. Pages import from here; nothing fetches from an API yet.
- `lib/utils.ts` — formatting helpers: `fmt(n)` → `TZS 1,234,567`, `fmtShort(n)` → `TZS 1.2M`, `fmtTime`, `fmtDate`, `fmtDT`, `seeded(n)` (deterministic PRNG for sparklines).

**Page conventions**:
- Every page file starts with `'use client'` (all pages are interactive).
- Use `AppShell` with a `crumbs` array for every page.
- KPI stat grids: `style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12 }}`.
- Tables that can overflow on mobile: wrap in `<div className="table-scroll"><table …>`.
- Detail pages (master/detail layout): `style={{ display: 'grid', gridTemplateColumns: 'var(--cols-detail)', gap: 20 }}`.
- 2-col form grids: `className="form-grid-2"` (collapses to 1-col at 640 px).

**Responsive mobile pattern**:
- Mobile breakpoint is 768 px. The sidenav becomes a fixed overlay toggled by the `.hamburger` button in the topbar. AppShell + Sidenav + Topbar already wire this up — no per-page work needed.
- New pages only need to use the CSS grid vars and `.table-scroll` / `.form-grid-2` / `.detail-grid` utilities; the shell handles nav.

## Route inventory

```
/                   Dashboard
/pos                Point of Sale (full-height, cart slides in on mobile)
/inventory          Product list
/inventory/[id]     Product detail
/inventory/new      Add product
/transactions       Transaction list
/transactions/[id]  Transaction detail
/customers          Customer list
/customers/[id]     Customer detail
/customers/new      Add customer
/credits            Credit ledger
/credits/[id]       Customer credit detail
/stores             Store list
/stores/[id]        Store detail
/suppliers          Supplier list
/suppliers/[id]     Supplier detail
/analytics          Analytics shell (sub-pages: /sales /products /cashflow /customers)
/reports            Reports
/settings           Settings (tabbed: Store profile, Staff, Notifications, Integrations, Billing)
/ai                 AI assistant
/staff              Staff list
/notebook           Internal notebook
/help               Help
```

## Currency and locale

Always format money with `fmt()` or `fmtShort()` from `lib/utils.ts`. Currency is Tanzanian Shilling (TZS). Product names and supplier names should reflect the East African / Tanzanian retail context (Swahili product names are appropriate).
