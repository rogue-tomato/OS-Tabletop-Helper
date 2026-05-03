# Image performance audit

Captured 2026-05-03 against `public/characters/`. Sizes from
`Get-ChildItem … | Group-Object` aggregate.

## On-disk variant inventory

| Variant         | Files | Total   | Avg/file | Used by                           |
|-----------------|-------|---------|----------|-----------------------------------|
| `art-full.webp` | 12    | 5.6 MB  | ~474 KB  | Lightbox (hero open full-screen)  |
| `art.medium.webp` | 12  | 1.2 MB  | ~104 KB  | CharacterPage hero                |
| `cover-full.webp` | 12  | 2.5 MB  | ~217 KB  | (currently unused)                |
| `cover.thumb.webp` | 12 | ~0.4 MB | ~33 KB   | HomePage list tile (CharacterCard)|
| Card original `*.webp` (152) | 152 | 7.5 MB | ~50 KB | CardLightbox (full-screen card)  |
| Card thumb `*.thumb.webp` (152) | 152 | 5.0 MB | ~33 KB | CardsTab grid + Search results    |

There are also legacy **`.png` / `.jpg` / `.jpeg` originals** still on disk
(48 files, ~30+ MB combined: `art.png` 4.6 MB, `art.jpg` 2.6 MB,
`cover.jpg` 1.0–1.3 MB, etc.). The TS data layer no longer references
them, but `vite build` still copies `public/` verbatim into `dist/`, so
deployed bundles are inflated by ~30 MB of dead weight. **Recommend
deleting** after one more visual sanity pass — kept for now as a manual
fallback safety net.

## Loading strategy by surface

### HomePage (`/`)

| Asset                         | Strategy                       |
|-------------------------------|--------------------------------|
| First N (≤6) cover thumbs     | `loading="eager"`, `decoding="async"` |
| Remaining cover thumbs        | `loading="lazy"`, `decoding="async"`  |
| Hero medium variants (12×)    | `<link rel="prefetch" as="image">` scheduled via `requestIdleCallback` after first paint |
| Card images (any character)   | NOT prefetched — would balloon initial load to ~5 MB |

### CharacterPage (`/character/:slug`)

| Asset                         | Strategy                       |
|-------------------------------|--------------------------------|
| Current hero medium           | `loading="eager"`, `decoding="sync"`, `<link rel="preload">` injected on mount |
| Current character revealed card thumbs | `<link rel="prefetch" as="image">` via `requestIdleCallback` |
| Current character full-size card images (lightbox sources) | Not prefetched — load only when lightbox opens (sole image then) |

### CardsTab grid

- Renders `cardImageThumb ?? thumbUrl(cardImage)` (~33 KB each).
- `loading="lazy"`, `decoding="async"`.
- Sealed levels render placeholders only — no image fetch.

### CardLightbox

- Renders `cardImageFull ?? cardImage` (~50 KB each).
- `loading="eager"` (lightbox is user-triggered).

### Background

- `public/forest-bg.webp` — single body backdrop, loaded by CSS
  `background-image`. Browser handles caching natively.

## Prefetch budget

| Page                   | Bytes prefetched on idle | Notes                          |
|------------------------|--------------------------|--------------------------------|
| HomePage (after idle)  | 12 × ~104 KB = ~1.2 MB   | All hero medium variants       |
| CharacterPage (after idle) | up to 7 × ~33 KB = ~230 KB | Only revealed levels for this character |

Compared to the previous pass, this cuts prefetch volume ~5–6× while
still warming the most likely next-click target.

## Dedup contract

`prefetchImageOnce(href, rel)` (in `src/lib/prefetch.ts`):

- Skips empty href.
- Tracks fired hrefs in a per-tab `Set` keyed by `${rel}:${href}`.
- Also looks up `<link rel="..." href="...">` already in `<head>`
  before injecting (so SSR / external code can't trigger duplicates).
- Returns the created link or `null`.

This lets HomePage and CharacterPage call the helper freely on every
mount without piling up dozens of identical hints.

## How to add a thumb/full split for a single card later

`Ability` now has two optional string fields:

```ts
type Ability = {
  ...
  cardImage: string;          // backward-compatible source (full)
  cardImageThumb?: string;    // grid render, ~400w webp
  cardImageFull?: string;     // lightbox render, full size
};
```

Resolver order:

- Grid (CardTile, SearchResults): `cardImageThumb ?? thumbUrl(cardImage)`
- Lightbox (CardLightbox): `cardImageFull ?? cardImage`

So the existing data with only `cardImage` keeps working unchanged. To
add an explicit thumb for a single card, drop a new file at e.g.
`public/characters/<slug>/cards/level-1/thumbs/01_guard.webp` and set
`cardImageThumb: 'characters/<slug>/cards/level-1/thumbs/01_guard.webp'`
in the canonical DB. Same pattern with `cardImageFull` for a custom
high-res master.

## Open follow-ups

1. **Delete legacy png/jpg originals** in `public/characters/` (~30 MB
   smaller deploys). User confirmation required — these are
   destructive.
2. Consider serving with `Cache-Control: immutable` once paths are
   content-hashed. GitHub Pages already sends long-lived cache headers
   on hashed bundle assets, but `public/` files get default headers.
3. The cold-cache 5-second pause observed in local Windows preview is
   almost certainly Defender / SmartScreen scanning fresh files. After
   first scan they're indexed. On real hosting (GitHub Pages, CDN)
   this stage doesn't exist.
