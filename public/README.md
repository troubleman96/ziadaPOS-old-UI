# `public/` — Static Assets

Everything in this directory is served as-is at the root URL (`/`). Files here are not processed by Next.js's build pipeline.

---

## Contents

```
public/
├── ziada.PNG           ← Master app logo — source of truth for all icon sizes
├── sw.js               ← PWA service worker
└── icons/              ← Generated PWA icon set (9 sizes)
    ├── icon-48x48.png
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
```

---

## `ziada.PNG` — Master Logo

The official Ziada brand logo. White price-tag shape with "ziada." wordmark on a deep indigo background.

| Property | Value |
|---|---|
| Dimensions | 6250 × 6250 px |
| Format | PNG |
| URL | `/ziada.PNG` |

**This is the source of truth for all icon derivations.** The 9 PWA icons in `public/icons/` were generated from this file using `sharp`:

```js
const sharp = require('sharp');
const sizes = [48, 72, 96, 128, 144, 152, 192, 384, 512];
await Promise.all(
  sizes.map(s =>
    sharp('public/ziada.PNG')
      .resize(s, s)
      .png()
      .toFile(`public/icons/icon-${s}x${s}.png`)
  )
);
```

**Where it is used:**

| Surface | URL | Size |
|---|---|---|
| Landing page nav logo | `/ziada.PNG` | 26×26 (CSS scaled) |
| Footer logo | `/ziada.PNG` | 26×26 (CSS scaled) |
| Open Graph image (WhatsApp, Telegram, Slack link preview) | `/ziada.PNG` | 1200×1200 declared |
| Twitter card image | `/ziada.PNG` | 1200×1200 declared |

The OG/Twitter URLs resolve to `https://www.ziadapos.com/ziada.PNG` because `metadataBase` in `app/layout.tsx` is set to the production domain.

**Regenerating icons** after updating the logo:

```bash
node -e "
const sharp = require('sharp');
const sizes = [48, 72, 96, 128, 144, 152, 192, 384, 512];
Promise.all(sizes.map(s =>
  sharp('public/ziada.PNG')
    .resize(s, s)
    .png()
    .toFile('public/icons/icon-' + s + 'x' + s + '.png')
));
"
```

---

## `sw.js` — Service Worker

The PWA service worker implementing a cache-first offline strategy.

**Registered in:** `app/layout.tsx` via inline script in `<head>`:
```html
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js');
    });
  }
</script>
```

### Cache name

`ziada-pos-v1`

Increment this string when deploying breaking changes to force cache invalidation on all clients.

### Precached URLs (installed on first load)

```js
const PRECACHE = [
  '/',
  '/dashboard',
  '/pos',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/ziada.PNG',
];
```

These are fetched and stored in the cache during the service worker `install` event. They will be served from cache even when the user is offline.

### Fetch strategy (cache-first with network update)

For every `GET` request:
1. Check cache — if found, return cached response immediately
2. In parallel, fetch from network — if successful, update the cache entry
3. If cache miss and network fails — let the browser handle the error

```
Request → Cache hit? → Return cached response
                   ↓ (also runs in background)
              Network fetch → Update cache
        ↓ Cache miss
   Network fetch → Store in cache → Return response
              ↓ Network fail
         Return undefined (browser shows error)
```

Only `GET` requests are intercepted. `POST`, `PUT`, `DELETE` etc. pass through directly.

### Cache lifecycle

On `activate`:
- Old caches (any key ≠ `ziada-pos-v1`) are deleted
- `clients.claim()` is called so the new service worker takes control immediately

---

## `icons/` — PWA Icon Set

9 PNG files generated from `ziada.PNG` for PWA installation:

| File | Size | Use case |
|---|---|---|
| `icon-48x48.png` | 48×48 | Small favicon, browser shortcuts |
| `icon-72x72.png` | 72×72 | Legacy Android homescreen |
| `icon-96x96.png` | 96×96 | Standard Android homescreen, manifest shortcut icons |
| `icon-128x128.png` | 128×128 | Chrome Web Store, desktop PWA |
| `icon-144x144.png` | 144×144 | Windows Metro tile (`msapplication-TileImage`) |
| `icon-152x152.png` | 152×152 | iPad 2 / iPad mini Apple touch icon |
| `icon-192x192.png` | 192×192 | Standard Android PWA install icon (maskable) |
| `icon-384x384.png` | 384×384 | High-DPI Android |
| `icon-512x512.png` | 512×512 | Chrome PWA splash screen + install prompt (maskable) |

**Referenced in:**

1. `app/manifest.ts` — all 9 listed under `icons[]`
2. `app/layout.tsx` — `icons.icon[]` (browser tab), `icons.apple[]` (Apple touch), `msapplication-TileImage`

The 192px and 512px icons are declared as `purpose: 'maskable'` in the manifest, meaning they are safe to render inside the OS's adaptive icon shape (rounded square on Android, etc.). The full square image is used (no transparent padding needed because the logo fills the entire canvas).

---

## Adding new assets

Place any static asset (images, fonts, documents) directly in `public/` and reference it with an absolute path from the root:

```tsx
// In JSX:
<img src="/my-image.png" alt="..." />

// In CSS:
background-image: url('/my-image.png');
```

Assets in `public/` are served with long-lived cache headers by Vercel. Do not put sensitive files here — everything is publicly accessible.

**For icons specifically:** add them to `components/icons.tsx` as SVG components rather than PNG files. Only use image files for photographic content, logos, and app icons.
