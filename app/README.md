# `app/` — Next.js App Router Pages

This directory contains every page, layout, and global stylesheet for Ziada POS using the [Next.js App Router](https://nextjs.org/docs/app) convention.

---

## Table of Contents

- [File Conventions](#file-conventions)
- [Root Files](#root-files)
- [Design System (globals.css)](#design-system-globalscss)
- [Page Anatomy](#page-anatomy)
- [Route Reference](#route-reference)
- [Mobile Patterns](#mobile-patterns)
- [Adding a New Page](#adding-a-new-page)

---

## File Conventions

| File | Purpose |
|---|---|
| `layout.tsx` | Wraps the entire app — fonts, PWA metadata, theme initialiser, service worker script |
| `manifest.ts` | Generates `/manifest.webmanifest` — the PWA web manifest |
| `globals.css` | The complete design system: tokens, resets, utility classes, component styles |
| `page.tsx` | Public-facing landing page |
| `*/page.tsx` | Individual route pages |
| `*/[id]/page.tsx` | Dynamic detail pages |
| `*/_shared.tsx` | Shared sub-components scoped to a route group (e.g. `analytics/_shared.tsx`) |

---

## Root Files

### `layout.tsx`

The root layout mounts on every route. It:

- Loads **Geist** (sans-serif) and **Geist Mono** fonts via `next/font/google` and injects CSS variables `--font-geist` and `--font-geist-mono`
- Sets **PWA metadata**: `Viewport` (themeColor `#4f46e5`, `viewportFit: cover`), `Metadata` (title, description, manifest, icons, openGraph, twitter, appleWebApp)
- Injects an **inline theme script** into `<head>` that reads `localStorage['ziada-theme']` and sets `data-theme` on `<html>` *before* first paint — eliminates flash of wrong theme
- Registers the **service worker** (`/sw.js`) via an inline script
- Sets `<html lang="en" data-theme="dark" suppressHydrationWarning>`
- Applies font CSS variables to `<body>`

**Exports:** `metadata` (Next.js `Metadata`), `viewport` (Next.js `Viewport`), `RootLayout` (default)

### `manifest.ts`

Generates the PWA web manifest at `/manifest.webmanifest`. Key values:

| Property | Value |
|---|---|
| `name` | `Ziada POS` |
| `short_name` | `Ziada` |
| `display` | `standalone` |
| `start_url` | `/dashboard` |
| `background_color` | `#0f0f10` (dark bg) |
| `theme_color` | `#4f46e5` (accent indigo) |
| Icons | 9 sizes: 48, 72, 96, 128, 144, 152, 192, 384, 512px |
| Shortcuts | `Point of Sale → /pos`, `Dashboard → /dashboard` |

### `globals.css`

The entire visual design system. See [Design System](#design-system-globalscss) below.

---

## Design System (`globals.css`)

### Color tokens

All colours are CSS custom properties defined in `:root` and overridden in `html[data-theme="light"]`.

#### Background scale
```css
--bg        /* page background — darkest surface */
--bg-2      /* card / surface level */
--bg-3      /* slightly elevated (inputs, filter bars) */
--bg-4      /* highest elevation (tooltips, dropdowns) */
```

#### Foreground scale
```css
--fg        /* primary text — highest contrast */
--fg-2      /* secondary text */
--fg-3      /* muted / placeholder */
--fg-4      /* very muted / disabled */
```

#### Semantic colours (each has -soft and -line variants)
```css
--accent        /* brand indigo #4f46e5 */
--accent-soft   /* 8% opacity tint */
--accent-line   /* border tint */

--good          /* green — positive, active, in-stock */
--good-soft
--good-line

--warn          /* amber — caution, low stock, due-soon */
--warn-soft
--warn-line

--bad           /* rose — error, critical, overdue */
--bad-soft
--bad-line

--info          /* blue — informational */
--info-soft
--info-line
```

#### Border tokens
```css
--line      /* default border (subtle) */
--line-2    /* medium border */
--line-3    /* strong border */
```

#### Typography tokens
```css
--sans      /* Geist (loaded via next/font) */
--mono      /* Geist Mono (loaded via next/font) */
```

### Layout tokens

```css
--nav-w:    248px   /* sidenav width on desktop */
--topbar-h: 56px    /* topbar height */
--cart-w:   380px   /* POS cart panel width on desktop */
```

### Responsive grid tokens

These collapse at breakpoints (1100px / 900px / 540px / 380px):

| Token | Desktop | 900px | 540px |
|---|---|---|---|
| `--cols-4` | `repeat(4, 1fr)` | `repeat(2, 1fr)` | `repeat(2, 1fr)` |
| `--cols-3` | `repeat(3, 1fr)` | `repeat(2, 1fr)` | `1fr` |
| `--cols-2` | `repeat(2, 1fr)` | `repeat(2, 1fr)` | `1fr` |
| `--cols-detail` | `1fr 320px` | `1fr 280px` | `1fr` |
| `--cols-dash-wide` | `1fr 340px` | `1fr` | `1fr` |
| `--cols-settings` | `220px 1fr` | `1fr` | `1fr` |
| `--cols-receipt` | `1fr 340px` | `1fr` | `1fr` |

**Usage:**
```html
<div style="display: grid; grid-template-columns: var(--cols-4); gap: 12px;">
  <!-- 4-col KPI strip that collapses to 2-col on mobile -->
</div>
```

### Utility classes

#### Surfaces & cards
```css
.surface          /* card: border + bg-2 + border-radius */
.stat-card        /* KPI stat card: flex-col, label/value/sub pattern */
```

#### Buttons
```css
.btn              /* base button reset */
.btn-primary      /* filled accent button */
.btn-ghost        /* outline button */
.btn-soft         /* subtle filled button (bg-3) */
.icon-btn         /* square icon-only button */
```

#### Status pills & dots
```css
.pill             /* inline badge */
.pill.good        /* green badge */
.pill.warn        /* amber badge */
.pill.bad         /* red badge */
.pill.accent      /* accent badge */
.dot-s            /* small status dot (6×6px circle) */
```

#### Typography
```css
.mono             /* Geist Mono font */
.tnum             /* tabular number rendering (font-variant-numeric) */
.label            /* KPI card label (mono, small, muted) */
.value            /* KPI card value (large, bold) */
.sub              /* KPI card subtitle */
```

#### Tables
```css
.table            /* styled <table> with hover rows */
.table-scroll     /* overflow-x: auto wrapper */
.num              /* right-aligned number cell */
```

#### Forms
```css
.form-grid-2      /* 2-col form grid, collapses to 1-col at 640px */
```

#### Navigation
```css
.nav-item         /* sidenav link row */
.nav-item.active  /* active sidenav link */
.nav-icon         /* icon slot in nav item */
.nav-badge        /* pill badge on nav item */
.nav-section-label /* section header in sidenav */
```

#### Layout helpers
```css
.mobile-only      /* hidden on desktop, display: block on ≤768px */
.desktop-only     /* hidden on mobile, display: block on >768px */
.page-sec         /* hidden on mobile (secondary page actions) */
```

#### POS-specific
```css
.pos              /* POS grid: products + cart */
.products         /* products column */
.products-sticky  /* sticky search/filter header */
.products-scroll  /* scrollable product grid */
.product-grid     /* responsive product card grid */
.product-card     /* individual product card */
.product-thumb    /* product thumbnail block */
.qty-pill         /* cart quantity badge on product card */
.cart             /* cart panel (desktop fixed right) */
.cart-bottom-bar  /* mobile floating bottom bar */
.cart-sheet       /* mobile full-screen bottom sheet */
.cart-sheet-backdrop /* backdrop behind bottom sheet */
.pos-mobile-only  /* visible only on mobile in POS */
.pos-hide-mobile  /* hidden on mobile in POS */
```

---

## Page Anatomy

Every page file follows the same structure:

```tsx
'use client';

// 1. Imports — React, AppShell, Icons, lib helpers
import React, { useState } from 'react';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt } from '../../lib/utils';
import { SOME_DATA } from '../../lib/data';

// 2. Local types (if needed)
interface MyItem { id: string; name: string; }

// 3. Sub-components (defined before the page default export)
function ItemCard({ item }: { item: MyItem }) {
  return <div className="surface">...</div>;
}

// 4. Page default export
export default function MyPage() {
  const [state, setState] = useState(...);

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'My Page' }]}
      actions={<button className="btn btn-primary">{Icons.plus} Action</button>}
    >
      {/* KPI strip (4-col grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>
        <div className="surface stat-card">...</div>
      </div>

      {/* Main content */}
      <div className="surface">...</div>
    </AppShell>
  );
}
```

---

## Route Reference

### Dashboard — `/dashboard`

Main KPI overview page. Shows:
- 4 KPI cards: Today's Sales, Gross Profit, Tickets (transaction count), Outstanding Credit
- AI insight nudge card — auto-dismisses after 5 seconds, sends dismissed insight to notifications
- Sales-by-hour area chart (pure SVG)
- Payment mix donut chart
- Recent transactions table (desktop) / card list (mobile)
- Top products this week
- Low stock alerts with stock bars

**Key components:** `KPISpark`, `KPI`, `AINudge`, `SalesChart`, `PaymentMix`, `RecentTxn`, `TopProducts`, `LowStock`, `TodaySummary`

---

### Point of Sale — `/pos`

Full-height layout (`full={true}` on AppShell). Features:

**Desktop (> 768px):**
- Left: scrollable product grid with search, category filter pills, barcode scan button
- Right: sticky cart panel (380px) with customer chip, line items, discount stepper, VAT calculation, payment method selector, Complete Sale CTA

**Mobile (≤ 768px):**
- Full-screen product grid with search bar and icon-only cart button with count badge
- Floating bottom bar appears when cart has items — shows count, first product name preview, total, "View →" CTA
- Tapping bottom bar opens `MobileCartSheet` — a full-screen slide-up panel with clean cart UI

**Cart behaviour:**
- Products can be added by tapping cards (adds 1 unit per tap)
- Discount adjustable in 5% increments (desktop only)
- VAT calculated at 18% on (subtotal − discount)
- Payment methods: Cash, M-Pesa, Bank, Credit
- Trial banner (dismissable) shown above the POS grid

---

### Inventory — `/inventory`

Product catalogue with:
- 4 KPI stat cards (total SKU, inventory value, low stock count, out of stock count)
- AI restock nudge (appears when any product is below reorder point)
- Search/filter bar: text search, category pills, All/Low/Out status filter, table/grid view toggle
- **Desktop table view:** columns — checkbox, thumbnail, product name, SKU, category, cost, price, margin %, stock bar, status pill, actions menu
- **Desktop grid view:** card grid with coloured thumbnail, name, SKU, price, stock badge
- **Mobile list view (default):** compact horizontal rows — 44px thumbnail + name/SKU/category + price/margin/status
- **Mobile grid view:** 2-column compact grid with 72px image block

Stock bars show current stock vs min reorder point and max with colour coding (green → amber → red).

---

### Inventory Detail — `/inventory/[id]`

Master-detail layout. Left panel: product image thumb, key stats, quick actions (edit, duplicate, archive). Right: tabbed panels — Info (name, SKU, barcode, category, supplier), Stock (stock history, adjustment form), Pricing (cost, price, margin chart), Supplier (contact, lead time, last order), History (audit log of changes).

---

### Transactions — `/transactions`

Table of all transactions (48 seeded records). Columns: TXN ID (linked), customer, payment method, amount, status badge (paid/credit/refunded), time. Desktop shows full table; mobile shows card-list layout. Status filter and search by customer/ID.

---

### Credits — `/credits`

Accounts receivable overview:
- Aging bucket bar chart (Current / 1–7d / 8–30d / 31–60d / 60+d)
- Quick stats: total outstanding, overdue, due soon, recovered this month
- Customer list sorted by urgency — shows name, balance, days overdue, status pill
- Filter by status (all / overdue / due-soon / current)

---

### Credit Detail — `/credits/[id]`

Tabbed view for a single credit customer:
- **Overview:** balance, open tabs with line items, payment history with method/reference
- **Messages:** WhatsApp and call log (inbound/outbound) with timestamps
- **Notes:** staff notes with author and date
- Quick actions: Record payment, Send reminder, Call

---

### Analytics — `/analytics`

Shell with `AnalyticsNav` tab switcher. Sub-pages:
- **`/analytics/sales`** — revenue and transaction trend, daily/weekly/monthly area chart, payment method breakdown
- **`/analytics/products`** — best-selling products by revenue, margin ranking, weekly velocity bar chart
- **`/analytics/customers`** — cohort retention %, repeat customer rate, top customers by LTV
- **`/analytics/cashflow`** — cash position over time, inflow/outflow split, payment method pie

All charts are pure SVG — no chart library. The `_shared.tsx` file exports reusable `AreaChart`, `Donut`, and `MiniSpark` SVG components.

---

### Stores — `/stores`

Multi-store management. Shows 3 stores (Kariakoo HQ, Kinondoni Branch, Ilala Outlet):
- Store card: name + HQ badge, address, open/closed status, till count, today's revenue, transaction count, staff on duty, weekly sparkline
- Performance comparison table: weekly revenue, avg/day, transactions, avg ticket, revenue share bar
- Map placeholder (grid background with pin markers)

Data is shared from `lib/data.ts` (`STORES` export) — same data used by the sidenav store switcher.

---

### Staff — `/staff` and `/staff/[id]`

Staff roster and individual profiles. Hamisi Mwakapaga (Owner, s001) is the primary user account. Staff detail shows schedule, sales performance stats, permission toggles (refund / discount / view reports), POS PIN (masked).

---

### Profile — `/profile`

Three-tab page for the logged-in user (Hamisi Mwakapaga):
- **Personal info** — editable name, email, phone; read-only role, store, shift joined date; permission badges
- **Security** — change password form, POS PIN change, active sessions list (revoke button)
- **Activity log** — recent login, sale, refund, setting change events with device info

---

### Settings — `/settings`

Tabbed settings interface (sidebar nav on desktop, horizontal scrolling tabs on mobile):
- **Store profile** — name, address, TRA number, opening hours, logo
- **Staff** — staff management (invite, role assignment)
- **Notifications** — toggle email/SMS/WhatsApp alerts per event type
- **Integrations** — M-Pesa Daraja API, Tigo Pesa, bank POS terminal, accounting sync
- **Billing** — plan (PRO trial), usage, payment method

---

### AI — `/ai`

Bilingual chat interface (EN + Swahili). Placeholder for LLM integration. Shows:
- Suggested prompts (quick-action chips)
- Chat message list with user/AI bubbles
- AI responses can include embedded data tables and action buttons (e.g. "Draft restock order")
- Language auto-detection

---

## Mobile Patterns

All pages should handle ≤768px gracefully. Standard patterns:

### Responsive grids
Use `var(--cols-4)` etc. — these collapse automatically.

### Tables on mobile
```html
<div className="table-scroll">
  <table className="table">...</table>
</div>
```

### Diverged layouts
Some pages show completely different layouts on mobile vs desktop:
- Inventory: desktop table → mobile compact list rows
- Transactions: desktop table → mobile card list  
- Dashboard recent transactions: desktop table → mobile `RecentTxnMobile` card list
- POS: desktop side-by-side → mobile full-screen with bottom sheet cart

Use `.mobile-only` and `.desktop-only` to render different components at each breakpoint:
```tsx
<div className="desktop-only"><DesktopTable /></div>
<div className="mobile-only"><MobileList /></div>
```

### Page secondary actions
Wrap buttons that aren't essential on mobile in `className="page-sec"` — they are hidden on mobile automatically.

---

## Adding a New Page

1. Create `app/my-route/page.tsx`
2. Start with `'use client'`
3. Wrap content in `<AppShell crumbs={[...]}>`
4. Add the route to `CLAUDE.md`'s route inventory
5. Add a nav link in `components/sidenav.tsx` if it belongs in the sidebar
6. Import data from `lib/data.ts`, add new constants there if needed
7. Test at 430px viewport width before committing
