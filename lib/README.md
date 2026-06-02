# `lib/` — Data Layer & Utilities

This directory contains all mock data (typed TypeScript constants) and formatting utility functions. There is no API client, no fetch wrapper, and no ORM — data is imported directly from `lib/data.ts`.

---

## Table of Contents

- [data.ts — Mock Data](#datats--mock-data)
  - [Products](#products)
  - [Inventory](#inventory)
  - [POS Products](#pos-products)
  - [Transactions](#transactions)
  - [Credits & Customers](#credits--customers)
  - [Stores](#stores)
  - [Notes](#notes)
  - [Color Schemes](#color-schemes)
- [utils.ts — Formatting Helpers](#utilsts--formatting-helpers)
- [Migrating to a Real Backend](#migrating-to-a-real-backend)

---

## `data.ts` — Mock Data

All application data lives here as typed TypeScript constants. Data is deterministic — the same values render on every load.

---

### Products

#### `PRODUCTS_SIMPLE`

Lightweight product list used in transaction seeding.

```ts
interface ProductSimple {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
}
```

12 products. Used internally by the `TRANSACTIONS` generator.

---

### Inventory

#### `InventoryProduct` (interface)

Full product record as stored in inventory:

```ts
interface InventoryProduct {
  id: string;         // 'p1' ... 'p18'
  sku: string;        // 'UNGA-001', 'SAB-002', etc.
  name: string;       // Swahili product name
  cat: string;        // 'Grocery' | 'Household' | 'Beverage' | 'Cosmetics' | 'Bakery' | 'Snacks'
  price: number;      // selling price in TZS
  cost: number;       // purchase/cost price in TZS
  stock: number;      // current units on hand
  min: number;        // reorder point (stock bar turns amber/red below this)
  max: number;        // maximum stock level (stock bar scale)
  unit: string;       // 'bag' | 'pcs' | 'btl' | 'pack' | 'jerry' | 'tub'
  supplier: string;   // supplier name
  barcode: string;    // EAN-13 barcode
  color: string;      // colour palette key: 'indigo' | 'amber' | 'rose' | 'lime' | 'emerald' | 'violet' | 'cyan'
  active: boolean;    // whether the product is listed
  weeklySold: number; // average units sold per week (used in low-stock projection)
  lastRestock: string; // human-readable date string 'May 18, 2026'
}
```

#### `INVENTORY`

18 products. Full inventory dataset used by `/inventory`, `/inventory/[id]`, low-stock calculations.

| ID | Name | Category | Price | Stock |
|---|---|---|---|---|
| p1 | Unga wa Sembe 10kg | Grocery | TZS 28,500 | 42 |
| p2 | Sabuni ya OMO 1kg | Household | TZS 6,200 | 3 ← critical |
| p3 | Mafuta ya Cooking 5L | Grocery | TZS 34,000 | 24 |
| p4 | Sukari 2kg | Grocery | TZS 7,000 | 60 |
| p5 | Chai Bora 500g | Beverage | TZS 4,800 | 5 ← low |
| p6 | Mchele Pishori 5kg | Grocery | TZS 22,000 | 33 |
| p7 | Lotion Nivea 400ml | Cosmetics | TZS 12,500 | 18 |
| p8 | Soda Coca-Cola 500ml | Beverage | TZS 1,500 | 120 |
| p9 | Mkate Bumi 600g | Bakery | TZS 2,200 | 22 |
| p10 | Sabuni ya Geisha | Household | TZS 1,200 | 88 |
| p11 | Mafuta Cooking 1L | Grocery | TZS 8,500 | 12 ← low |
| p12 | Maziwa Fresh 500ml | Beverage | TZS 1,800 | 46 |
| p13 | Biskuti Glucose 90g | Snacks | TZS 800 | 200 |
| p14 | Yogurt 250ml | Beverage | TZS 2,500 | 30 |
| p15 | Mafuta Blue Band 1kg | Grocery | TZS 9,500 | 14 |
| p16 | Choco Cake 500g | Bakery | TZS 4,500 | 8 |
| p17 | Bar Soap Imperial | Household | TZS 950 | 110 |
| p18 | Toothpaste Colgate | Cosmetics | TZS 3,500 | 28 |

#### `CATEGORIES`

```ts
const CATEGORIES: { id: string; name: string; count: number }[]
```

7 entries: `all` (18), `Grocery` (6), `Household` (3), `Beverage` (4), `Cosmetics` (2), `Bakery` (2), `Snacks` (1).

---

### POS Products

#### `POS_CATEGORIES`

Category list for the POS category filter pills. Same 7 categories with counts matching the full catalogue (including hypothetical items beyond the 18 seeded).

#### `POS_PRODUCTS`

Simplified product list for the POS product grid. Same 18 products but only the fields needed for the grid:

```ts
interface POSProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  cat: string;
  sku: string;
  color: string;
}
```

---

### Transactions

#### `TxnLine` (interface)

```ts
interface TxnLine {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  qty: number;
}
```

#### `Customer` (interface)

```ts
interface Customer {
  name: string;
  phone: string | null;
  id?: string;          // present for named customers, absent for walk-ins
}
```

#### `Transaction` (interface)

```ts
interface Transaction {
  id: string;           // 'TXN-2043', 'TXN-2042', etc.
  ts: Date;             // timestamp of the transaction
  lines: TxnLine[];     // purchased items
  subtotal: number;
  discountPct: number;  // 0 or 5 (percent)
  discount: number;     // computed amount
  tax: number;          // 18% VAT on (subtotal - discount)
  total: number;        // net total (taxable + tax)
  cost: number;         // total cost of goods
  profit: number;       // total - cost - tax
  customer: Customer;
  method: string;       // 'Cash' | 'M-Pesa' | 'Tigo Pesa' | 'Bank' | 'Credit'
  status: string;       // 'paid' | 'credit' | 'refunded'
  cashier: string;      // 'Hamisi M.' | 'Amani M.' | 'Pendo K.'
  till: string;         // 'Till #1' | 'Till #2' | 'Till #3'
  store: string;        // 'Duka Kuu — Kariakoo'
  reference: string | null; // M-Pesa reference code if method === 'M-Pesa'
}
```

#### `TRANSACTIONS`

48 seeded transactions generated by an IIFE using `seeded(n)` (deterministic PRNG). They span roughly 2 days before May 24, 2026 at 11-minute intervals. Transaction IDs run from `TXN-2043` (most recent) down to `TXN-1996`.

**Seeding logic:**
- Each transaction gets 1–5 random line items from `PRODUCTS_SIMPLE`
- ~15% chance of 5% discount
- ~20% chance of Credit payment for named customers
- ~4% chance of refund status
- M-Pesa transactions have a 6-character reference code

Named customers who appear in transactions: Fatuma Ally, Juma Kifupi, Asha Mwinyi, Hassan Bakari, Mariam Said. All others are Walk-in.

---

### Credits & Customers

#### `CreditCustomer` (interface)

The most complex type in the data model:

```ts
interface CreditCustomer {
  id: string;             // 'C-1041', 'C-1038', etc.
  name: string;
  avatarHue: number;      // HSL hue for avatar gradient (0–360)
  phone: string;
  since: string;          // 'Mar 2024' — when they became a customer
  visits: number;         // total visit count
  totalSpent: number;     // lifetime spend in TZS
  status: 'overdue' | 'due-soon' | 'current';
  dueDays: number;        // positive = days until due, negative = days overdue

  tabs: Array<{
    id: string;           // TXN reference
    date: Date;
    amount: number;
    items: number;
    cashier: string;
    till: string;
    lines: Array<{ name: string; qty: number; price: number }>;
  }>;

  payments: Array<{
    date: Date;
    amount: number;
    method: string;       // 'Cash' | 'M-Pesa' | 'Bank'
    ref?: string;         // payment reference
    cashier: string;
    note: string | null;
  }>;

  messages: Array<{
    date: Date;
    kind: string;         // 'whatsapp' | 'call'
    direction: 'in' | 'out';
    body: string;
    who: string;          // staff name or 'auto-reminder'
  }>;

  notes: Array<{
    date: Date;
    by: string;           // staff name
    body: string;
  }>;

  _balance?: number;      // computed: sum(tabs) - sum(payments)
}
```

#### `CREDIT_CUSTOMERS`

5 credit customers with varying statuses:

| ID | Name | Status | Balance | Days |
|---|---|---|---|---|
| C-1041 | Juma Kifupi | due-soon | TZS 64,200 | 6 days left |
| C-1038 | Fatuma Ally | overdue | TZS 32,500 | 6 days over |
| C-1029 | Hassan Bakari | current | TZS 116,000 | 19 days left |
| C-1015 | Asha Mwinyi | overdue | TZS 28,800 | 14 days over |
| C-1003 | Mariam Said | due-soon | TZS 18,500 | 2 days left |

Balances are computed after import:
```ts
CREDIT_CUSTOMERS.forEach(c => {
  c._balance = c.tabs.reduce((s, t) => s + t.amount, 0)
             - c.payments.reduce((s, p) => s + p.amount, 0);
});
```

#### `CREDIT_TOTALS`

Aggregates computed from `CREDIT_CUSTOMERS`:

```ts
const CREDIT_TOTALS: {
  outstanding: number;   // total outstanding balance
  overdue: number;       // balance from overdue customers
  dueSoon: number;       // balance from due-soon customers
  current: number;       // balance from current customers
  recovered: number;     // total payments received
}
```

#### `AGING_BUCKETS`

5 aging buckets for the credit aging chart:

```ts
const AGING_BUCKETS: Array<{
  label: string;          // 'Current', '1–7 days', etc.
  range: string;
  amount: number;         // total balance in this bucket
  color: string;          // CSS color for the bar
}>
```

Buckets: Current (0d), 1–7d, 8–30d, 31–60d, 60+d. Amounts are computed from `CREDIT_CUSTOMERS.dueDays`.

---

### Stores

#### `Store` (interface)

```ts
interface Store {
  id: string;             // 'kariakoo' | 'kinondoni' | 'ilala'
  name: string;           // full name: 'Duka Kuu — Kariakoo'
  shortName: string;      // 'Kariakoo', 'Kinondoni', 'Ilala'
  badge: string | null;   // 'HQ' for main store, null for branches
  active: boolean;        // whether this is the primary/HQ store
  status: 'open' | 'closed';
  statusLabel: string;    // 'Open' | 'Closed'
  statusNote: string;     // '3 tills active', 'opens 8:00 AM'
  todayRevenue: number;
  todayTxns: number;
  staffOnDuty: number;
  period: string;         // 'Today' | 'Yesterday'
  address: string;        // 'Msimbazi St, Kariakoo, Dar es Salaam'
  manager: string;
  phone: string;
  color: string;          // hex color for charts and map pins
  weekData: number[];     // 7 daily revenue values (Mon–Sun, 0 = no data yet)
}
```

#### `STORES`

3 stores:

| ID | Name | Status | Revenue | Manager |
|---|---|---|---|---|
| kariakoo | Duka Kuu — Kariakoo | Open | TZS 1.84M | Hamisi Mwakapaga |
| kinondoni | Kinondoni Branch | Open | TZS 980K | Amani Msongo |
| ilala | Ilala Outlet | Closed | TZS 620K | Pendo Kilimba |

This data is shared between:
- `app/stores/page.tsx` — store list page
- `components/sidenav.tsx` — `StoreSwitcher` dropdown
- `components/app-shell.tsx` — `StoreContext` validation

---

### Notes

#### `Note` (interface)

```ts
interface Note {
  id: string;
  title: string;
  content: string;
  date: string;         // 'Today', 'Yesterday', '2d ago', '5d ago', '1w ago'
  tags: string[];       // e.g. ['Suppliers', 'Staff', 'Marketing', 'Ideas']
}
```

#### `NOTES`

5 notebook entries covering:
1. Supplier price review — Bakhresa flour price increase
2. Staff schedule — November shift plan
3. Marketing ideas Q4 — loyalty promos, WhatsApp VIP group
4. Mwanza branch — January 2026 opening checklist
5. Customer complaint — stale bread incident, resolution

---

### Color Schemes

#### `COLOR_SCHEMES`

7 named palettes for product thumbnail backgrounds. Each has `bg` (10% opacity background) and `fg` (text/icon colour):

| Key | Background | Foreground |
|---|---|---|
| `indigo` | `rgba(99,102,241,0.10)` | `#a5a8ff` |
| `amber` | `rgba(251,191,36,0.10)` | `#fcd34d` |
| `rose` | `rgba(251,113,133,0.10)` | `#fda4af` |
| `lime` | `rgba(132,204,22,0.10)` | `#bef264` |
| `emerald` | `rgba(16,185,129,0.10)` | `#6ee7b7` |
| `violet` | `rgba(167,139,250,0.10)` | `#c4b5fd` |
| `cyan` | `rgba(34,211,238,0.10)` | `#67e8f9` |

**Usage:**
```tsx
const scheme = COLOR_SCHEMES[product.color] ?? COLOR_SCHEMES.indigo;
<div style={{ background: scheme.bg, color: scheme.fg }}>
  {product.name[0]}
</div>
```

---

## `utils.ts` — Formatting Helpers

All formatting helpers for money, dates, and random data.

### `fmt(n: number): string`

Formats a number as Tanzanian Shilling with thousands separators.

```ts
fmt(1234567)  // → 'TZS 1,234,567'
fmt(6200)     // → 'TZS 6,200'
fmt(0)        // → 'TZS 0'
```

Implementation uses `Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 })`.

**Always use this for displaying money.** Never format TZS manually.

---

### `fmtShort(n: number): string`

Compact format for large numbers in KPI cards.

```ts
fmtShort(1240000)   // → 'TZS 1.24M'
fmtShort(980000)    // → 'TZS 980K'
fmtShort(42000)     // → 'TZS 42K'
fmtShort(800)       // → 'TZS 800'
```

Thresholds:
- ≥ 1,000,000 → `M` suffix (2 decimal places)
- ≥ 1,000 → `K` suffix (1 decimal place, or no decimal if whole number)
- < 1,000 → plain `TZS N`

---

### `fmtTime(d: Date): string`

Formats a `Date` as `HH:MM` using locale `en-GB`.

```ts
fmtTime(new Date(2026, 4, 24, 14, 32))  // → '14:32'
fmtTime(new Date(2026, 4, 24, 8, 5))    // → '08:05'
```

---

### `fmtDate(d: Date): string`

Formats a `Date` as `D Month YYYY`.

```ts
fmtDate(new Date(2026, 4, 24))  // → '24 May 2026'
fmtDate(new Date(2026, 0, 1))   // → '1 Jan 2026'
```

Uses `Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })`.

---

### `fmtDT(d: Date): string`

Formats a `Date` as `Weekday, D Month · HH:MM`.

```ts
fmtDT(new Date(2026, 4, 24, 14, 32))  // → 'Sat, 24 May · 14:32'
```

Used in transaction receipts and detail pages.

---

### `seeded(n: number): number`

Deterministic pseudo-random number generator returning a value in `[0, 1)`. Uses a simple hash of `n` — same input always produces the same output.

```ts
seeded(0)    // → 0.6180339887...  (always the same)
seeded(1)    // → 0.2360679774...  (always the same)
seeded(42)   // → 0.7177978870...  (always the same)
```

Used in `TRANSACTIONS` generator to produce consistent mock data without a random seed library.

**Do not use for cryptography or real randomness.**

---

## Migrating to a Real Backend

When a real backend is ready, the migration path for each data export:

| Current export | Migration |
|---|---|
| `INVENTORY` | Replace with `async function fetchInventory(): Promise<InventoryProduct[]>` — call `/api/inventory` |
| `TRANSACTIONS` | Replace with paginated fetch — `/api/transactions?page=1&limit=50` |
| `CREDIT_CUSTOMERS` | Replace with `/api/credits` + per-customer `/api/credits/[id]` |
| `STORES` | Replace with `/api/stores` — keep the `Store` interface |
| `NOTES` | Replace with `/api/notes` |

When switching to server-side data fetching:
1. Remove `'use client'` from page files
2. Make page components `async` functions
3. Add `loading.tsx` files for Suspense boundaries
4. Add `error.tsx` files for error boundaries

The `Store` interface and `COLOR_SCHEMES` will remain in `lib/data.ts` as they are UI config, not backend data.
