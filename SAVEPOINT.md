# SAVEPOINT — pick up here in a fresh session

Last session ran out (image quota). Project is **live and shipping**:
https://rogue-tomato.github.io/OS-Tabletop-Helper/ — also runs as a
Telegram Mini App via `@os_tabletop_helper_bot` (BotFather → /newapp →
short name picked, see "Telegram" section below).

Latest commit on `main`: `86eae55` "Dismiss keyboard on Enter via
onKeyDown, not onSubmit". Build is **green**, gh-pages branch is up
to date.

---

## Project context (read first)

- Repo: `C:\Git\OS Tabletop Helper` — public GitHub:
  `rogue-tomato/OS-Tabletop-Helper`
- Live URL: https://rogue-tomato.github.io/OS-Tabletop-Helper/
- Stack: Vite 5 + React 18 + TypeScript + Tailwind 3, HashRouter
- Service Worker (`public/sw.js`) handles caching — second-load is
  instant; **bump `VERSION` in sw.js** when shipping breaking asset
  changes so users invalidate their cache
- Communication is in **Russian** (English only for code identifiers
  / file paths / game terms — see
  `~/.claude/projects/C--Users-newze/memory/MEMORY.md`)

### Tooling notes (Windows specifics)
- Bash: prefix node bin with `PATH="/c/Program Files/nodejs:$PATH"`
- PowerShell: `$env:Path = "C:\Program Files\nodejs;" + $env:Path`
- **VITE_BASE on Bash gets eaten by MSYS** (`/OS-Tabletop-Helper/` →
  `C:/Program Files/Git/OS-Tabletop-Helper/`). Build through
  PowerShell or use `MSYS_NO_PATHCONV=1`.
- `dist/` sometimes stays locked by Defender / preview server —
  build into `dist-deploy/` instead (see Deploy cycle).

---

## Deploy cycle (full)

```powershell
# In PowerShell
Set-Location "C:\Git\OS Tabletop Helper"
$env:Path = "C:\Program Files\nodejs;" + $env:Path
$env:VITE_BASE = "/OS-Tabletop-Helper/"
& "C:\Program Files\nodejs\npm.cmd" exec -- vite build --outDir dist-deploy
```

Then in bash:
```bash
cd "C:/Git/OS Tabletop Helper"
git add -A && git commit -m "..."   # use HEREDOC for clean message
git push origin main
PATH="/c/Program Files/nodejs:$PATH" npm.cmd exec -- gh-pages -d dist-deploy
```

Live updates within ~30-60 s. SW invalidation requires a hard reload
(or close+reopen Mini App) on the user side unless `VERSION` bumped
in sw.js.

`dist-deploy/` is git-ignored. Don't commit it to main.

---

## Telegram Mini App

- Bot: `@os_tabletop_helper_bot`
- Web App URL configured in BotFather → `/newapp` → trailing `/`
  matters
- Menu Button: BotFather → `/mybots` → Bot Settings → Menu Button →
  same URL
- Hash routing means deep links like `/#/character/warden` work

---

## Architecture

### Data layer (canonical → adapter → UI)
- [`src/data/oathswornCanonicalDb.ts`](src/data/oathswornCanonicalDb.ts) — single source of truth: characters, abilities, lore, cooldown / animusCost, optional `cardImageThumb` / `cardImageFull`
- [`src/data/characters.ts`](src/data/characters.ts) — adapter, reshapes canonical DB to the legacy `Character` shape the UI consumes
- [`src/data/characterMetadata.ts`](src/data/characterMetadata.ts) — per-slug presentational overrides: `listName`, `complexity` (1-5), `searchTags`, `heroObjectPositionMobile/Desktop`, `heroArtMobile/Desktop/Full`
- [`src/data/levelGates.ts`](src/data/levelGates.ts) — `revealed` flag per level (1/2/5/10/15) + per-character overrides; **Level 2 is currently `hidden: true`** until the card-builder lands
- [`src/data/manualAbilityFillTemplate.ts`](src/data/manualAbilityFillTemplate.ts) — manual-fill workflow for the 11 cd-0 starters; mostly inert now

### Pages
- [`src/pages/HomePage.tsx`](src/pages/HomePage.tsx) — list + search + sort menu, eagerly preloads ALL hero variants and card thumbs on mount (throttled to 6 concurrent)
- [`src/pages/CharacterPage.tsx`](src/pages/CharacterPage.tsx) — hero (with `<picture>` for mobile/desktop split), Difficulty block, tabs OR search-results

### Components
- [`src/components/Layout.tsx`](src/components/Layout.tsx) — sticky header (no blur), `min-h-[60px]`, page padding `pb-[max(6rem,env(safe-area-inset-bottom))]` so ScrollToTop never overlaps the last tile
- [`src/components/CharacterCard.tsx`](src/components/CharacterCard.tsx) — list tile with stars top-center, hover-zoom INSIDE the tile
- [`src/components/CharacterList.tsx`](src/components/CharacterList.tsx) — grid; first 6 covers `loading="eager"`, rest lazy
- [`src/components/SearchInput.tsx`](src/components/SearchInput.tsx) — wrapped in `<form role="search">`; Enter dismiss handled in `onKeyDown` (not onSubmit, that caused iOS zoom)
- [`src/components/SortMenu.tsx`](src/components/SortMenu.tsx) — dropdown left of SearchInput, h-12 to match
- [`src/components/Tabs.tsx`](src/components/Tabs.tsx) — Summary/Cards/Lore; **no transitions, no hover** (mobile flicker)
- [`src/components/SummaryTab.tsx`](src/components/SummaryTab.tsx) — Available Equipment / Special Ability / Playstyle (Difficulty was moved out — now in CharacterPage above tabs)
- [`src/components/CardsTab.tsx`](src/components/CardsTab.tsx) — per-level grid, hides far sealed levels (only first sealed shown)
- [`src/components/SearchResults.tsx`](src/components/SearchResults.tsx) — char-page in-search results
- [`src/components/CardTile.tsx`](src/components/CardTile.tsx) — uses `cardImageThumb ?? thumbUrl(cardImage)`
- [`src/components/CardLightbox.tsx`](src/components/CardLightbox.tsx) — uses `cardImageFull ?? cardImage`; **multi-touch swipe ignored** (pinch-safe)
- [`src/components/ArtLightbox.tsx`](src/components/ArtLightbox.tsx) — full-screen hero, NO auto-rotate (let device handle orientation)
- [`src/components/ComplexityStars.tsx`](src/components/ComplexityStars.tsx) — 4-pointed `✦` filled + `✧` empty, always 5 slots, mobile size 26px / sm: 18px / hero 20px
- [`src/components/PlaceholderImage.tsx`](src/components/PlaceholderImage.tsx) — has loading state with overlay "Loading" label until `<img>` fires `onLoad`
- [`src/components/ScrollToTopButton.tsx`](src/components/ScrollToTopButton.tsx) — floating button bottom-right after 300px scroll

### Lib
- [`src/lib/assets.ts`](src/lib/assets.ts) — `assetUrl(path)`, `thumbUrl(path)` (→ `*.thumb.webp`), `mediumUrl(path)` (→ `*.medium.webp`)
- [`src/lib/prefetch.ts`](src/lib/prefetch.ts) — `prefetchImageOnce(href, rel)` (deduped link-hint), `preloadImageEager(href)` (real `<Image>`, **6-concurrent queue**), `scheduleIdle(cb)`

### Theme
- [`tailwind.config.js`](tailwind.config.js):
  - `accent: '#fbbf24'` (warm amber) — character names, section headers, ability/card titles, tile/hero stars
  - `tab-active.{400,500}: #fbbf24 → #ea580c` (gold→orange) — active tab gradient
  - `ember.{400-700}: #c2d1cb / #85a09a / #4d5e58 / #2c3833` — supporting silver-sage palette
  - `bone: #d8dde0` — body text
  - `ink.{600-950}` — dark backgrounds
- [`src/index.css`](src/index.css):
  - Body uses `.app-bg` div in [`src/App.tsx`](src/App.tsx) for backdrop (NOT body bg-image)
  - `.app-bg` size pinned in JS to `screen.width × screen.height`, transform-translate against Visual Viewport offsets so iOS keyboard can't shift it
  - 10% black overlay via `.app-bg::after`
  - `.section-header` provides the diamond bullet + amber underline used by all panel headings
  - Hover-zoom on character grid is gated by `@media (hover: hover) and (pointer: fine)` — never fires on touch
  - Panels use solid `bg-ink-900/{80,85,90}` (no backdrop-blur — caused mobile repaint thrash)

---

## Image pipeline

### Variants live under `public/characters/<slug>/`

| Variant                   | Width | Quality | Used by                      |
|---------------------------|-------|---------|------------------------------|
| `cover.webp`              | full  | 85      | (currently unused)           |
| `cover.thumb.webp`        | 400w  | 80      | List tile (CharacterCard)    |
| `art.webp`                | full  | source  | ArtLightbox (full art)       |
| `art.medium.webp`         | 1200w | 80      | CharacterPage hero (desktop variant in `<picture>`) |
| `art.mobile.webp`         | 1000w | 80      | CharacterPage hero (mobile variant in `<picture>`) — **manually authored**, portrait-cropped per-character |
| `art.full.webp`           | 2400w | 82      | (optional override for lightbox) |
| `cards/.../*.webp`        | full  | 85      | CardLightbox                 |
| `cards/.../*.thumb.webp`  | 600w  | 88      | CardTile grid                |

Originals (`.png` / `.jpg`) were deleted in commit `d460ab9` —
**don't re-add**, the gallery (`public/card-gallery.html`) and all
data references run on `.webp`.

### Background
- `public/forest-bg.jpg` (~973 KB, source-quality) — **JPEG, not webp**
- WebP re-encoding looked desaturated next to source; we ship the
  raw JPEG. Body's `--forest-bg-url` CSS variable points at it.

### Generation scripts (in `scripts/`)
- `convert-to-webp.mjs` — first-pass PNG/JPG → WebP (already run, all sources gone now, only useful if user adds a fresh raw)
- `generate-thumbnails.mjs` — walks `*.webp`, makes `*.thumb.webp` (600w q88). Skips `*.thumb`/`*.medium`/`*.mobile`/`*.desktop`/`*.full`
- `generate-hero-medium.mjs` — `art.webp` → `art.medium.webp` (1200w q80; constants are at top of file, user has tweaked them)
- `import-hero-variants.mjs` — drop folder workflow: put files in `_incoming/` (gitignored), they auto-import to `public/characters/<slug>/art.{mobile,desktop,full}.webp` and the script prints a `characterMetadata.ts` snippet to paste

---

## Service Worker (`public/sw.js`)

- `CACHE_NAME = 'oathsworn-helper-v1'` — bump version when bundle hashes / asset roster materially changes (forces purge on next visit)
- Cache-first for `.webp / .png / .css / .js / .woff2` etc.
- Stale-while-revalidate for the HTML shell
- Pruned in `activate`

User-side: hard reload or close+reopen Mini App to pick up a new
deploy unless VERSION bumped.

---

## Recent commits (newest first, most relevant)

- `86eae55` keyboard dismiss via onKeyDown
- `82a36e1` Visual Viewport translate to pin bg
- `715056c` JS-pin bg to screen size, drop blur from onSubmit
- `d392cd8` PlaceholderImage loading state, throttled preload, search form
- `2f4fee2` Difficulty above tabs, 10% bg dim, no auto-rotate in lightbox, sort+search h-12
- `95b1dfa` stars in Difficulty block, fixed bg div, mobile stars lift
- `ed7c59b` source JPEG bg, mobile-touch zoom kill, pinch-safe lightbox swipe
- `5a5795d` stars 4-pointed always-5, centered top
- `e1e4438` initial 5-pointed stars (later reverted)
- `f64f510` tabs flicker fix, panel blur removal
- `5c1d44e` sort menu, hi-res bg, Service Worker added
- `102ac78` complexity stars + listName fields
- `779ea2a` lighter backdrop, hide Level 2, narrow-mobile tab fixes
- `d460ab9` **big bang**: WebP migration + hero variants + image perf + UI polish

---

## Known good behaviour to preserve

- Hover zoom on character tile ONLY on real pointer devices
- Tabs have NO transition / NO hover (intentional — both caused
  mobile flicker / sticky touch hover)
- Pinch-zoom in CardLightbox does NOT swipe to next card
- ArtLightbox does NOT auto-rotate (device's own auto-rotate handles
  orientation; double-rotation bug if we layer our own)
- `.app-bg` is JS-sized; don't switch back to body `background-image`
  with `attachment: fixed` (caused mobile flicker)
- Service Worker registration is `try { register } catch {}` — older
  Telegram WebApp clients don't allow it; that's fine
- `manualAbilityFillTemplate.ts` already uses `.webp` paths; manual
  cd-0 workflow stays untouched

---

## Open / nice-to-have (not started)

1. **Card builder** — user wants a tool to add Level 2+ cards
   eventually; until then `levelGates.ts` keeps Level 2 hidden
2. **Bumping `sw.js` VERSION on every deploy** — currently we don't,
   so users have to hard-reload after asset changes. Could be an
   `npm run deploy:gh` wrapper that sed-bumps it
3. **Fewer card thumbs in flight on slow connections** — concurrency
   is hard-capped at 6 (HTTP/1.1 limit); HTTP/2 negotiation could
   reverse this but GH Pages already serves H/2

---

## How to greet the next session

> "Read `C:\Git\OS Tabletop Helper\SAVEPOINT.md` first. Project is
> live at https://rogue-tomato.github.io/OS-Tabletop-Helper/ — make
> changes, run the build/commit/push/gh-pages cycle from the SAVEPOINT
> 'Deploy cycle' section, ask before destructive ops."
