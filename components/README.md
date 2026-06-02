# `components/` — Shared UI Components

All reusable UI components that are used across multiple pages. This directory contains the app shell (layout wrapper + context providers), navigation components, and the icon library.

**Rule:** every component here is a client component (`'use client'`). No server components live in this folder.

---

## Table of Contents

- [app-shell.tsx](#app-shelltsx)
- [sidenav.tsx](#sidenavtsx)
- [topbar.tsx](#topbartsx)
- [icons.tsx](#iconstsx)

---

## `app-shell.tsx`

The outermost wrapper for every authenticated page. Provides three React contexts, renders the sidenav and topbar, and manages theme + store selection state.

### Exports

| Export | Type | Description |
|---|---|---|
| `AppShell` | Component | Page wrapper — renders sidenav, topbar, body |
| `useTheme()` | Hook | Access / toggle dark–light theme |
| `useStore()` | Hook | Access / switch the active store |
| `useNotifications()` | Hook | Read notification list, push new notifications |
| `AppNotification` | Interface | Shape of a notification item |

### `AppShell` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | required | Page content |
| `crumbs` | `{ label: string; href?: string }[]` | `[]` | Breadcrumbs rendered in the topbar |
| `actions` | `ReactNode` | New Sale button | Content for the topbar right slot |
| `search` | `boolean` | `true` | Show/hide the search bar in the topbar |
| `full` | `boolean` | `false` | Skip the `.body` padded wrapper — use for POS and full-height layouts |

### `useTheme()` return value

```ts
{
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}
```

Theme is persisted to `localStorage` under key `ziada-theme`. An inline `<script>` in `app/layout.tsx` restores it before paint.

### `useStore()` return value

```ts
{
  activeStoreId: string;          // e.g. 'kariakoo', 'kinondoni', 'ilala'
  setActiveStoreId: (id: string) => void;
}
```

Store selection is persisted to `localStorage` under key `ziada-store`. Valid store IDs come from `STORES` in `lib/data.ts`.

### `useNotifications()` return value

```ts
{
  notifications: AppNotification[];
  addNotification: (n: AppNotification) => void;
}
```

`AppNotification` interface:

```ts
interface AppNotification {
  id: string;
  icon: string;        // emoji or symbol: '⚠', '✓', '!', '✦'
  color: string;       // CSS colour string: 'var(--warn)', 'var(--good)', etc.
  title: string;       // short title
  sub: string;         // subtitle / detail line
  time: string;        // human-readable: '5m ago', 'Just now', '2d ago'
  unread: boolean;     // drives unread badge count in topbar
}
```

The notification list starts with 4 pre-seeded items. `addNotification()` prepends to the array. The AI insight card calls this on dismiss so the insight appears in the `⋮` menu.

### Context hierarchy

```
<NotifContext.Provider>
  <StoreContext.Provider>
    <ThemeContext.Provider>
      <div class="mobile-nav-overlay" />
      <div class="app">
        <Sidenav />
        <div class="main">
          <Topbar />
          {full ? children : <div class="body">{children}</div>}
        </div>
      </div>
    </ThemeContext.Provider>
  </StoreContext.Provider>
</NotifContext.Provider>
```

### Usage example

```tsx
'use client';
import { AppShell, useTheme, useStore, useNotifications } from '../../components/app-shell';

// In a page:
export default function MyPage() {
  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'My Page' }]}
      actions={<button className="btn btn-primary">Save</button>}
    >
      <PageContent />
    </AppShell>
  );
}

// In a child component inside AppShell:
function PageContent() {
  const { theme, toggleTheme } = useTheme();
  const { activeStoreId } = useStore();
  const { addNotification } = useNotifications();
  // ...
}
```

---

## `sidenav.tsx`

Fixed left navigation panel. 248px wide on desktop, slides in as a full-height overlay on mobile (`nav-open` CSS class toggled by AppShell).

### Exports

| Export | Type | Description |
|---|---|---|
| `Sidenav` | Component | The full sidebar |

### `Sidenav` props

| Prop | Type | Description |
|---|---|---|
| `navOpen` | `boolean` | Whether the mobile overlay is open |
| `onClose` | `() => void` | Called when the nav should close (route change, backdrop tap, × button) |

### Internal structure

```
<aside class="sidenav [nav-open]">
  <StoreSwitcher onClose={onClose} />       ← first element (store card + dropdown)
  <div class="sidenav-scroll">              ← scrollable nav links
    OPERATE section
      Dashboard, Point of Sale, Transactions, Inventory, Credits
    INSIGHTS section
      Analytics, Reports, Ziada AI
    DIRECTORY section
      Customers, Suppliers, Stores
    TOOLS section
      Staff, Notebook
    SYSTEM section
      Settings, Help & support
  </div>
  <NavFooter />                             ← AI credit usage bar
</aside>
```

### `StoreSwitcher`

Interactive store selector at the top of the sidenav. Reads from `StoreContext`. On click, opens a dropdown listing all stores from `STORES` (lib/data.ts) with:
- Coloured 26px icon with store initial
- Store short name + HQ badge if applicable
- Status dot (green = open, amber = closed)
- Street address preview
- Checkmark on active store
- "Manage stores →" link to `/stores`

Store selection calls `setActiveStoreId()` from `StoreContext` and persists to `localStorage`.

The mobile `×` close button (`sidenav-close`) is embedded inside the `StoreSwitcher` card. It stops propagation so tapping it closes the nav without toggling the dropdown.

### `NavItem`

Renders a single navigation link:

```tsx
<NavItem
  icon={Icons.inventory}
  label="Inventory"
  href="/inventory"
  badge={{ color: 'var(--warn)' }}    // dot badge (amber dot = low stock alert)
  active={pathname.startsWith('/inventory')}
  onClick={onClose}
/>
```

Badge types:
- `string` → renders a pill badge (e.g. `"14"` for credits count, `"NEW"` for AI, `"⌘N"` for POS shortcut)
- `{ color: string }` → renders a small coloured dot (used for low-stock indicator on Inventory)
- `null` / `undefined` → no badge

### `NavFooter`

Displays the AI credits usage widget at the bottom of the sidebar:
- Label: `AI CREDITS · MAY`
- Progress bar (current: 2,418 / 5,000 = 48%)
- Links: `View usage`, `Upgrade`

### Auto-close on navigation

The sidenav uses a `useRef` + `useEffect` to watch `usePathname()`. When the pathname changes, `onClose()` is called automatically — so navigating to a page always closes the mobile overlay.

---

## `topbar.tsx`

Sticky top header bar rendered inside every `AppShell` page.

### Exports

| Export | Type | Description |
|---|---|---|
| `Topbar` | Component | The full header bar |

### `Topbar` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `crumbs` | `{ label: string; href?: string }[]` | default crumbs | Breadcrumb trail |
| `actions` | `ReactNode` | New Sale button | Right-side topbar slot |
| `search` | `boolean` | `true` | Show search bar |
| `onMenuToggle` | `() => void` | — | Called when hamburger is tapped (wired from AppShell) |

### Layout (left to right)

```
[☰ hamburger (mobile only)]  [breadcrumbs]  [flex spacer]  [search bar]  [Ask Ziada AI]  [actions slot]  [⋮ three-dot menu]
```

Elements hidden on mobile (`page-sec` class): search bar, Ask Ziada AI button.
Elements shown only on mobile: hamburger (`.hamburger` CSS class, `display: none` on desktop).

### Breadcrumbs

```tsx
crumbs={[
  { label: 'ziada', href: '/' },
  { label: 'Duka Kuu', href: '#' },
  { label: 'Inventory' },   // no href = current page (rendered with .here class)
]}
```

Separators (`/`) are injected automatically between crumbs.

### `ThreeDotMenu` (⋮)

Dropdown menu containing three sections:

**Appearance**
- Sun/moon icon + "Switch to light/dark mode" — calls `toggleTheme()` from `useTheme()`

**Notifications**
- Expandable inline panel showing `notifications` from `useNotifications()`
- Each notification row: coloured icon bubble, title, subtitle, relative time
- Unread badge on the `⋮` trigger button when `unread > 0`
- "View all notifications" link
- Sub-panel collapses/expands within the dropdown (separate state `notifOpen`)

**Profile**
- Avatar (HM gradient), name (Hamisi Mwakapaga), role (Owner · admin)
- Entire row links to `/profile` with chevron → indicator
- Log out button (red, calls `onClose()` — placeholder, no auth yet)

The menu closes when clicking outside (mousedown listener on document, cleared on unmount).

### Mock notifications (initial data)

Notifications start seeded in `app-shell.tsx` (`INITIAL_NOTIFICATIONS`):
1. Low stock: Sabuni ya OMO — 3 units left (unread)
2. Payment received: Juma Kifupi paid TZS 20,000 (unread)
3. Credit overdue: Asha Mwinyi TZS 28,800 (unread)
4. Sale completed: TXN-2043 TZS 84,200 (read)

New notifications can be pushed from any component using `addNotification()` from `useNotifications()`.

---

## `icons.tsx`

Centralised SVG icon system. All icons are 16×16 `viewBox`, stroke-based, using `currentColor`.

### Exports

| Export | Type | Description |
|---|---|---|
| `Icon` | Component | Low-level SVG wrapper |
| `Icons` | Object | Named icon map |
| `IconName` | Type | Union of all icon keys |

### `Icon` component props

| Prop | Type | Default | Description |
|---|---|---|---|
| `d` | `ReactNode` | required | SVG path(s) / shapes inside the `<g>` |
| `size` | `number` | `16` | Width and height in px |
| `stroke` | `number` | `1.5` | Stroke width |
| `fill` | `string` | `'none'` | Fill attribute on outer `<svg>` |

### Complete icon reference

| Key | Visual | Used in |
|---|---|---|
| `dashboard` | 4-quadrant grid | Sidenav |
| `pos` | Monitor with receipt | Sidenav |
| `txn` | Two arrows (swap) | Sidenav |
| `inventory` | 3D box | Sidenav |
| `credit` | Credit card | Sidenav |
| `analytics` | Bar chart ascending | Sidenav |
| `reports` | Document with lines | Sidenav |
| `customers` | Two people silhouettes | Sidenav |
| `suppliers` | Delivery truck | Sidenav |
| `ai` | Sparkle star | Sidenav, AI nudge |
| `settings` | Gear / cog | Sidenav, topbar menu |
| `help` | Circle question mark | Sidenav |
| `store` | Shop front | Sidenav, store switcher |
| `staff` | Two person icons | Sidenav |
| `notebook` | Book with lines | Sidenav |
| `search` | Magnifying glass | Topbar, inventory filter |
| `bell` | Notification bell | Topbar menu |
| `plus` | Plus / add | Buttons, topbar CTA |
| `chevDown` | Chevron ↓ | Store switcher, dropdowns |
| `chevRight` | Chevron → | Breadcrumbs, links |
| `arrowUpRight` | Arrow ↗ | Positive KPI delta |
| `arrowDownRight` | Arrow ↘ | Negative KPI delta |
| `sparkles` | Sparkle / AI icon | AI nudge, Ziada AI section |
| `filter` | Funnel | Filter buttons |
| `download` | Download arrow | Export buttons |
| `command` | ⌘ Command | Keyboard shortcut hints |
| `close` | × Cross | Modals, drawers |
| `check` | ✓ Checkmark | Success states, confirm |
| `edit` | Pencil | Edit actions |
| `trash` | Bin | Delete actions |
| `grid` | 2×2 squares | Grid view toggle |
| `list` | Lines with dots | List view toggle |
| `warning` | Triangle ! | Warning states |
| `receipt` | Receipt with zigzag | Transaction receipts |
| `package` | Box with lines | Package / inventory |
| `dotsVertical` | ⋮ Three dots | Three-dot menu trigger |
| `sun` | Sun with rays | Light mode toggle |
| `moon` | Crescent moon | Dark mode toggle |
| `logout` | Door with arrow | Log out action |

### Adding a new icon

1. Open `components/icons.tsx`
2. Add an entry to the `Icons` object:
   ```tsx
   myIcon: (
     <Icon d={<>
       <path d="M..." />
       <circle cx="8" cy="8" r="3" />
     </>} />
   ),
   ```
3. Use `Icons.myIcon` anywhere in the app — TypeScript will enforce the key via `IconName`

**Never write SVG inline in page files.** Always add to this file first.
