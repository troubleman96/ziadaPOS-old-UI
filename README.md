# Ziada POS

> **The operating system for your shop.**  
> POS, inventory, credit, analytics and an AI that actually knows your store — running on one calm, fast platform. Built in Tanzania, made for any counter.

Live at → **[ziadapos.com](https://www.ziadapos.com)**

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Design System](#design-system)
- [Data Layer](#data-layer)
- [State Management](#state-management)
- [PWA & Deployment](#pwa--deployment)
- [Route Inventory](#route-inventory)
- [Key Conventions](#key-conventions)
- [Currency & Locale](#currency--locale)

---

## Overview

Ziada POS is a full-featured retail management platform built for East African small-to-medium retail businesses (dukas). It covers the complete business workflow:

| Module | Description |
|---|---|
| **Point of Sale** | Fast transaction entry, mobile-first bottom-sheet cart, M-Pesa / Tigo Pesa / Bank / Cash / Credit |
| **Inventory** | Product catalogue, stock tracking, low-stock alerts, reorder management, table + grid toggle |
| **Credits** | Customer credit tabs, aging buckets (current / 1–7d / 8–30d / 31–60d / 60+d), WhatsApp reminders |
| **Analytics** | Revenue, profit, cashflow, customer retention — pure SVG charts, no chart library |
| **Transactions** | Full transaction history with receipts, refund tracking, status filtering |
| **Customers** | Directory with lifetime value, visit history, contact management |
| **Suppliers** | Supplier directory, order history, pricing negotiations |
| **Stores** | Multi-store management (Kariakoo HQ, Kinondoni, Ilala), per-location KPIs |
| **Staff** | Roster, shifts, permissions, POS PIN management, activity log |
| **AI (Ziada AI)** | Bilingual EN + Swahili AI assistant, restock nudges, dashboard insight cards |
| **Notebook** | Internal notes with tags, searchable staff memos |
| **Reports** | Pre-built report templates (daily sales, inventory aging, cashflow, credit) |
| **Settings** | Store profile, notifications, integrations, billing |
| **Profile** | User profile with personal info, security (password + POS PIN), active sessions |

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | [Next.js 16](https://nextjs.org) App Router | React 19, TypeScript 5 |
| Styling | Custom CSS design system | `app/globals.css` only — no Tailwind, no component library |
| Fonts | Geist + Geist Mono | Via `next/font/google` |
| Charts | Pure SVG math | No recharts, chart.js, D3 or similar |
| Icons | Custom SVG components | All in `components/icons.tsx` |
| Data | Local TypeScript constants | `lib/data.ts` — no backend API yet |
| State | React context (3 contexts) | Theme, active store, notifications |
| PWA | Native Next.js manifest + service worker | Installable on Android + iOS |
| Deployment | Vercel | Production at ziadapos.com |

---

## Project Structure

```
ziada-app/
├── README.md               ← You are here
├── CLAUDE.md               ← Codebase guidance for AI assistants
├── package.json            ← Dependencies: Next.js 16, React 19, TypeScript 5
├── tsconfig.json           ← TypeScript config, @/* path alias
├── next.config.ts          ← Next.js config (minimal)
│
├── app/                    ← Next.js App Router — all pages, layouts, global CSS
│   ├── layout.tsx          ← Root layout: fonts, PWA meta, theme init, SW registration
│   ├── manifest.ts         ← PWA manifest (name, icons, shortcuts, theme colour)
│   ├── globals.css         ← Complete design system: tokens, utilities, components
│   ├── page.tsx            ← Public landing page (ziadapos.com)
│   ├── dashboard/          ← KPI dashboard: sales, profit, tickets, credit
│   ├── pos/                ← Point of Sale: full-height product grid + cart
│   ├── inventory/          ← Product list, detail, add-product form
│   ├── transactions/       ← Transaction list + receipt detail
│   ├── customers/          ← Customer directory + detail + new-customer form
│   ├── credits/            ← Credit ledger + per-customer credit detail
│   ├── analytics/          ← Analytics shell + sub-pages (sales/products/cashflow/customers)
│   ├── stores/             ← Multi-store overview + store detail
│   ├── suppliers/          ← Supplier directory + detail
│   ├── staff/              ← Staff roster + member detail
│   ├── ai/                 ← Ziada AI chat interface
│   ├── notebook/           ← Internal notes
│   ├── profile/            ← User profile (info, security, activity)
│   ├── reports/            ← Reports hub
│   ├── settings/           ← Settings tabs
│   └── help/               ← Help & support
│
├── components/             ← Shared UI components (shell, nav, icons)
│   ├── app-shell.tsx       ← AppShell wrapper + ThemeContext + StoreContext + NotifContext
│   ├── sidenav.tsx         ← Left sidebar navigation with store switcher
│   ├── topbar.tsx          ← Header: breadcrumbs, search, three-dot menu
│   └── icons.tsx           ← 30+ named SVG icons, all 16×16 viewBox
│
├── lib/                    ← Data and utilities
│   ├── data.ts             ← All mock data: products, transactions, customers, stores
│   └── utils.ts            ← Formatters: fmt(), fmtShort(), fmtDate(), seeded()
│
└── public/                 ← Static assets
    ├── ziada.PNG           ← Master logo (6250×6250px)
    ├── sw.js               ← PWA service worker (cache-first)
    └── icons/              ← PWA icon set (48px → 512px, 9 sizes)
```

See the README in each folder for deeper documentation:
- [`app/README.md`](app/README.md) — every page and route
- [`components/README.md`](components/README.md) — component API and usage
- [`lib/README.md`](lib/README.md) — data schema and utility functions
- [`public/README.md`](public/README.md) — static assets

---

## Getting Started

### Prerequisites

- Node.js 20 LTS or higher
- npm 10+

### Install & run

```bash
git clone https://github.com/troubleman96/ziadaPOS-UI.git
cd ziadaPOS-UI
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- `/` → Public landing page
- `/dashboard` → App (start here after login)
- `/pos` → Point of Sale

### Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Development server on port 3000 with fast refresh |
| `npm run build` | Production build (outputs to `.next/`) |
| `npm run start` | Serve the production build |

### Type checking

```bash
npx tsc --noEmit
```

No test runner or linter is configured — TypeScript is the only static analysis tool.

---

## Architecture

### Page structure

Every page follows this pattern:

```tsx
'use client';

import { AppShell } from '../../components/app-shell';

export default function MyPage() {
  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'My Page' }]}
      actions={<button className="btn btn-primary">Action</button>}
    >
      {/* page content */}
    </AppShell>
  );
}
```

- All pages are client components (`'use client'`) — no RSC in page files
- `crumbs` renders breadcrumbs in the topbar
- `actions` renders into the topbar right slot (replaces the default "New sale" button)
- `full={true}` skips the padded `.body` wrapper — used for POS and other full-height layouts

### Responsive layout

The shell CSS handles the responsive layout automatically:

| Breakpoint | Behaviour |
|---|---|
| > 768px | Sidenav fixed left (248px), main content fills remaining width |
| ≤ 768px | Sidenav hidden (slides in as overlay via hamburger), topbar sticky |

Page content uses CSS grid variables (`--cols-4`, `--cols-detail`, etc.) that automatically collapse at breakpoints. No per-page media query work is needed for standard layouts.

### No server components in pages

All pages import `'use client'` and use React hooks. Server components appear only in `layout.tsx` and `manifest.ts` which are metadata/layout files.

---

## Design System

The complete design system lives in `app/globals.css`. It uses CSS custom properties (variables) for all tokens. See [`app/README.md`](app/README.md) for the full token reference.

**Core principle:** every visual decision is a CSS variable. Components use tokens like `var(--bg-2)`, `var(--accent)`, `var(--good)` rather than hard-coded colours. Light/dark themes work by overriding the same tokens under `html[data-theme="light"]`.

**Never add external styling libraries.** Do not introduce Tailwind, shadcn/ui, MUI, Ant Design, or similar. The design system is intentional and complete.

---

## Data Layer

No backend API exists. All data is defined as typed TypeScript constants in `lib/data.ts` and imported directly into pages.

Transaction data (48 records) is generated deterministically using a seeded PRNG (`seeded(n)` in `lib/utils.ts`), so the demo always shows realistic and consistent data across refreshes.

When a real backend is added, the migration path is:
1. Replace `lib/data.ts` exports with `async` data-fetching functions
2. Move page files to server components (remove `'use client'`)
3. Add loading/error states

See [`lib/README.md`](lib/README.md) for all exported types and constants.

---

## State Management

Three React contexts are mounted in `AppShell` and available app-wide:

| Context | Hook | Persisted | What it controls |
|---|---|---|---|
| `ThemeContext` | `useTheme()` | `localStorage: ziada-theme` | Dark / light mode toggle |
| `StoreContext` | `useStore()` | `localStorage: ziada-store` | Which store is currently active (affects breadcrumbs and data filtering) |
| `NotifContext` | `useNotifications()` | React state only | In-app notification list; `addNotification()` pushes items from anywhere (e.g. AI insight card on dismiss) |

No Redux, Zustand, Jotai, or other state management library is used. The three contexts cover all cross-page state needs.

---

## PWA & Deployment

Ziada POS installs as a full Progressive Web App on Android (Chrome) and iOS (Safari):

| PWA Feature | Implementation |
|---|---|
| Manifest | `app/manifest.ts` — `display: standalone`, starts at `/dashboard` |
| App name | "Ziada POS" (short: "Ziada") |
| Theme colour | `#4f46e5` (indigo — matches `--accent`) |
| Icons | 9 sizes (48 → 512px) in `public/icons/` — generated from `ziada.PNG` via `sharp` |
| Apple touch icon | `public/icons/icon-152x152.png` |
| Shortcuts | Long-press icon → jump to POS or Dashboard |
| Offline | Service worker at `public/sw.js` caches key routes on install |
| OG / Twitter | Full social metadata in `app/layout.tsx` with `metadataBase: https://www.ziadapos.com` |

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.ziadapos.com` | Base URL for absolute OG image URLs in social sharing metadata |

---

## Route Inventory

```
/                       Public landing page (marketing)
/dashboard              KPI dashboard — daily sales, profit, tickets, credit overview
/pos                    Point of Sale (full-height layout, mobile cart sheet)
/inventory              Product list: table/grid toggle, stock bars, low-stock filter
/inventory/[id]         Product detail: tabbed (info, stock, pricing, supplier, history)
/inventory/new          Add new product form
/transactions           Transaction history: filterable by date, customer, method
/transactions/[id]      Transaction receipt: line items, totals, payment proof, refund
/customers              Customer directory: LTV, last visit, contact
/customers/[id]         Customer detail: tabs, transaction history, tags
/customers/new          Add customer form
/credits                Credit ledger: aging buckets, overdue alerts, quick stats
/credits/[id]           Customer credit detail: tabs, payment history, message log
/analytics              Analytics overview: KPI strip + period selector
/analytics/sales        Revenue & transaction trends over time
/analytics/products     Best sellers, margin ranking, velocity
/analytics/customers    Cohort retention, repeat rate, CLV
/analytics/cashflow     Cash position, inflows/outflows by payment method
/stores                 Multi-store view: revenue, tills, staff on duty, map placeholder
/stores/[id]            Store detail: manager, contact, hours, performance
/suppliers              Supplier directory: contact, terms, last order
/suppliers/[id]         Supplier detail: orders, pricing history, notes
/staff                  Staff roster: names, roles, shifts, status
/staff/[id]             Staff detail: schedule, performance metrics, permissions, PIN
/ai                     Ziada AI: bilingual (EN/Swahili) chat, restock suggestions
/notebook               Internal notes: tagged, searchable, staff memos
/profile                User profile: personal info, security, active sessions, activity log
/reports                Reports hub: pre-built daily/weekly/monthly report templates
/settings               Settings: store profile, staff, notifications, integrations, billing
/help                   Help & support: FAQ, docs links, contact
```

---

## Key Conventions

### Code

1. `'use client'` at the top of every page file
2. Import data from `lib/data.ts`, never define data inline in pages
3. Import icons from `components/icons.tsx`, never write SVG inline in pages
4. Format all money with `fmt()` or `fmtShort()` from `lib/utils.ts`
5. Use `AppShell` for every page — never render bare HTML without the shell

### Styling

6. Use CSS tokens (`var(--bg-2)`, `var(--accent)`) — never hardcode colours
7. Use `--cols-*` grid vars for responsive grids
8. Wrap overflowing tables in `<div className="table-scroll">`
9. Use `className="form-grid-2"` for 2-column forms
10. Never introduce Tailwind, component libraries, or CSS modules for new pages

### Components

11. Add icons to `components/icons.tsx` before using them
12. Use `mobile-only` / `desktop-only` CSS classes to diverge layouts by screen size
13. Context hooks (`useTheme`, `useStore`, `useNotifications`) are available everywhere inside `AppShell`

### Git

14. Commit messages follow Conventional Commits: `feat(scope): description`
15. Run `npx tsc --noEmit` before pushing

---

## Currency & Locale

| Setting | Value |
|---|---|
| Currency | Tanzanian Shilling (TZS) |
| Short format | `TZS 1.2M` via `fmtShort()` |
| Full format | `TZS 1,234,567` via `fmt()` |
| Date format | `24 May 2026` (locale `en-GB`) |
| Language | English primary, Swahili product/customer names encouraged |

Product names, customer names, and supplier names should reflect the East African / Tanzanian retail context. Swahili product names are appropriate and encouraged (e.g. *Unga wa Sembe 10kg*, *Mafuta ya Cooking 5L*, *Sukari 2kg*).

---

*Built in Dar es Salaam · [CamelTech](https://cameltech.co) · 2026*
