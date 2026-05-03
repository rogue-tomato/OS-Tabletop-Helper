# SAVEPOINT — pick up here in a fresh session

Last session ran out of tokens after the iron/silver/sage palette + forest
backdrop pass landed. Build is **green** and dev server was running on
http://localhost:5173/ when the session ended.

Below is everything the next assistant needs.

---

## Project context (read first)

- Repo: `C:\Git\OS Tabletop Helper` — private GitHub: `rogue-tomato/OS-Tabletop-Helper`
- Stack: Vite + React 18 + TS + Tailwind 3, HashRouter
- Communication is in **Russian** (English only for code identifiers / file paths / game terms — see `~/.claude/projects/C--Users-newze/memory/MEMORY.md`)
- PowerShell needs `$env:Path = "C:\Program Files\nodejs;" + $env:Path` prepended before `& "C:\Program Files\nodejs\npm.cmd" run …`
- Build with `npm.cmd run build` after every batch of changes
- Dev server: `npm.cmd run dev` (background it, the user opens it in Firefox)

### Key data files
- [`src/data/oathswornCanonicalDb.ts`](src/data/oathswornCanonicalDb.ts) — single source of truth for character/ability data
- [`src/data/characters.ts`](src/data/characters.ts) — adapter that legacy UI consumes; reshapes canonical DB
- [`src/data/characterMetadata.ts`](src/data/characterMetadata.ts) — search tags, hero focal points, list image overrides
- [`src/data/levelGates.ts`](src/data/levelGates.ts) — which Cards-tab levels are revealed vs locked
- [`src/data/manualAbilityFillTemplate.ts`](src/data/manualAbilityFillTemplate.ts) — manual-fill workflow (mostly inert now that 2nd-edition L1 cards are populated)

### Key UI files
- [`src/pages/HomePage.tsx`](src/pages/HomePage.tsx) — list/search page
- [`src/pages/CharacterPage.tsx`](src/pages/CharacterPage.tsx) — detail page (hero, tabs, lightbox)
- [`src/components/Layout.tsx`](src/components/Layout.tsx) — shared header (`title`, optional back button)
- [`src/components/Tabs.tsx`](src/components/Tabs.tsx) — Summary / Cards / Lore tab switcher
- [`src/components/SearchInput.tsx`](src/components/SearchInput.tsx) — search input UI
- [`src/components/CharacterCard.tsx`](src/components/CharacterCard.tsx) — list card tile
- [`src/components/SummaryTab.tsx`](src/components/SummaryTab.tsx) — Available Equipment / Special Ability / Playstyle (in this order)
- [`src/components/CardsTab.tsx`](src/components/CardsTab.tsx) — per-level card grid (cd 0 starter centered first row)
- [`src/components/LoreTab.tsx`](src/components/LoreTab.tsx) — lore text panel
- [`src/components/ArtLightbox.tsx`](src/components/ArtLightbox.tsx) — full-screen hero
- [`src/components/CardLightbox.tsx`](src/components/CardLightbox.tsx) — full-screen card

### Theme
- [`tailwind.config.js`](tailwind.config.js) — current palette is iron/silver/sage:
  - `bone` `#d8dde0`
  - `ember-400` `#c2d1cb` (silver-sage highlight)
  - `ember-500` `#85a09a`
  - `ember-600` `#4d5e58`
  - `ember-700` `#2c3833`
  - `ink-950..600` cool dark green-black
- [`src/index.css`](src/index.css) — body background uses `var(--forest-bg-url)` injected from [`src/main.tsx`](src/main.tsx) (so vite base is honoured); 72% black overlay on top.

---

## Pending tasks (in priority order user gave)

### 1. Color character names with a yellow-green tint

**Where to apply:**
- [`src/components/CharacterCard.tsx`](src/components/CharacterCard.tsx) — the `<h2>` with `text-ember-400` for the character name on each list tile
- [`src/pages/CharacterPage.tsx`](src/pages/CharacterPage.tsx) — the `<h2>` with `text-ember-400` for the hero name on the detail page

User's example colour from his marker doodle is roughly **yellow-green / olive-lime** — something like `#c8d97a` or `#b8c668`. Suggested:

```js
// tailwind.config.js — add to theme.extend.colors
'character-name': '#c8d97a',  // yellow-green for character names
```

Then in CharacterCard / CharacterPage swap `text-ember-400` (silver-sage)
on character titles for `text-character-name` (yellow-green).

Keep `text-ember-400` for OTHER headings (section headers, badges) so the
character name pops against the more muted accent palette.

### 2. Header height consistency

The Layout header heights between list and character page differ. The
[`Layout`](src/components/Layout.tsx) component renders the same header
shell, but content inside might be different sizes (or the back button
adds height). Inspect:

- [`src/components/Layout.tsx`](src/components/Layout.tsx) — single shared
  header, `py-3` padding currently
- The back button is a `tap-target` (≥44×44px), so when present it forces
  the header taller than text-only

**Fix:** make the header fixed-height (e.g. `min-h-[56px]` or whatever
matches the back-button case), so list and character page headers are the
same height. Remove conditional sizing.

### 3. Header text changes

Currently:
- List page: `<Layout title="Oathsworn Character Sheets">`
- Character page: `<Layout title={character.name} showBack>`

User wants:
- List page header text: **`Free Company Recruits`** (replace "Oathsworn Character Sheets")
- Character page header text: **`Back`** (replace the character name) — visible *next* to the back arrow / replacing the title slot

Edit:
- [`src/pages/HomePage.tsx`](src/pages/HomePage.tsx) — change Layout `title` prop
- [`src/pages/CharacterPage.tsx`](src/pages/CharacterPage.tsx) — change Layout `title` prop to a literal `"Back"` (same string regardless of character) — the back arrow already navigates `to="/"`, so "Back" reads as the action label

### 4. Header font

User said: don't change the font (keep `font-display` Cinzel), but make
it **bold**. Currently the header `<h1>` uses `font-display text-lg sm:text-xl` — add `font-bold` (or `!font-bold` if Cinzel needs the override).

Cinzel weights available in current import: `500, 600, 700`. Bold = 700.

Either:
- Add `font-bold` class to the `<h1>` in Layout.tsx
- OR ensure Tailwind's `font-bold` actually picks the 700 weight Cinzel
  loads (check the Google Fonts link in `index.html`)

### 5. In-page search on the character page

This is the most complex. User wants a search input on the character page
that matches across:
- Card names
- Card cooldown numbers (e.g. typing `2` finds cd-2 cards)
- Card Animus costs (e.g. typing `3` finds Animus-3 cards)
- Words inside Lore / Playstyle / Available Equipment / Special Ability text

Behaviour:
- When the query matches a CARD: highlight that card / scroll to it / pin
  matching cards at the top
- When the query matches a TEXT BLOCK (lore, playstyle, equipment, special
  ability): show those blocks on one page (i.e. switch out of tabs into a
  "search results" view) with the matched word **highlighted with a background**

**Implementation sketch:**
- Add a search input near the top of the CharacterPage detail (probably
  right under the hero, above the tabs row)
- Add a `searchQuery` state
- When `searchQuery` is empty → render normal Tabs view (current behaviour)
- When non-empty → render a "Results" view that aggregates:
  - Matching cards (CardTile rendered inline)
  - Matching text blocks (Special Ability, Available Equipment, Playstyle,
    Lore) with `<mark>` (or styled span) wrapping the matched substring
- Helper: `highlightMatch(text, query)` returns React nodes with the
  matched substring wrapped in a styled span (use `bg-ember-400/30` or
  similar)

Don't break the existing Tabs/Summary/Cards/Lore flow. The search input
just overrides the panel area when active.

### 6. Search input — square corners

[`src/components/SearchInput.tsx`](src/components/SearchInput.tsx)
currently uses `rounded-xl` on the input. Change to `rounded-none` (or
just remove) for sharp corners — to match the new "etched iron" look of
the cards.

### 7. Active tab colour

User drew a small olive/khaki rectangle as the suggested colour. Current
active tab is `from-ember-400 to-ember-500` = `#c2d1cb → #85a09a`
(silver-sage). User wants something closer to **olive / khaki / yellow-green**.

Suggested tweak to [`src/components/Tabs.tsx`](src/components/Tabs.tsx):

Either:
- Use the new `character-name` token from task 1 (yellow-green) for the
  active tab gradient
- OR add a separate `tab-active` token to tailwind config

Example:
```ts
// tailwind.config.js
colors: {
  'tab-active': {
    400: '#c8d97a',
    500: '#9eaf5a',
  },
}
```
```tsx
// Tabs.tsx
isActive
  ? 'bg-gradient-to-b from-tab-active-400 to-tab-active-500 text-ink-950 shadow-ember'
  : 'text-bone/70 hover:text-ember-400'
```

### 8. Lore tab font

User wants the Lore body text in a "not too italic" stylized font for
flavour but still readable. Suggestions:

- [`Crimson Pro`](https://fonts.google.com/specimen/Crimson+Pro) (italic) —
  oldstyle serif italic that reads great at body sizes
- [`EB Garamond`](https://fonts.google.com/specimen/EB+Garamond) (italic)
- [`Spectral`](https://fonts.google.com/specimen/Spectral) (italic)
- Or just `font-display` (Cinzel) at body size with `italic` (Cinzel
  Italic loads via the Google Fonts URL extension)

Recommended: add an `<link>` for one of those fonts in `index.html`,
declare a new `font-lore` family in `tailwind.config.js`, then apply it
in [`src/components/LoreTab.tsx`](src/components/LoreTab.tsx) to the
lore `<p>`.

```js
// tailwind.config.js
fontFamily: {
  display: ['"Cinzel"', 'serif'],
  body: ['"Inter"', 'system-ui', 'sans-serif'],
  lore: ['"Crimson Pro"', 'Georgia', 'serif'],
},
```

```html
<!-- index.html — extend the existing Google Fonts link -->
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Crimson+Pro:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
```

```tsx
// LoreTab.tsx
<p className="text-bone/90 text-[16px] leading-relaxed whitespace-pre-line font-lore italic">
  {character.lore}
</p>
```

---

## Recap of recently shipped (so the next session doesn't redo)

These already work — don't re-touch unless explicitly asked:

- ✅ 12 character L1 sets (7 each, 11 for Witch) populated from 2nd-edition card images
- ✅ Each ability has `cooldown` and `animusCost` (with `cost` override for variable "?" Animus cards)
- ✅ Display format: `"Cooldown N, Animus cost M"` (composed by adapter `formatCost` in `characters.ts`)
- ✅ `role` field updated for all 12 (e.g. "Tank / Control / Melee DPS") per user-supplied tags txt
- ✅ Lore + playstyle filled from docx for all 12
- ✅ List ordered alphabetically by displayName
- ✅ Forest BG (`public/forest-bg.jpg`) with CSS-var `--forest-bg-url` injected from main.tsx
- ✅ Iron/silver/sage palette in tailwind.config.js
- ✅ Cards tab: cd 0 starter centered alone in row 1, rest in 2-col grid
- ✅ Summary tab: Available Equipment / Special Ability / Playstyle (in this order)
- ✅ Character cards: square corners + L-shape silver-sage corner brackets
- ✅ Hero on detail page opens fullscreen ArtLightbox on tap
- ✅ Cards open CardLightbox with prev/next + swipe
- ✅ Mobile/desktop hero focal point via `heroObjectPositionMobile/Desktop`
- ✅ Bug fixes: tab-switch scroll-pin, scroll-to-top on slug change

## Build state

Last build:
```
✓ 55 modules transformed.
dist/assets/index-BCVBbX-K.css   22.84 kB │ gzip:  5.11 kB
dist/assets/index-NcHI4gdD.js   263.57 kB │ gzip: 85.20 kB
✓ built in 1.28s
```

After implementing the 8 tasks above, run `npm.cmd run build` once more
and confirm green.

## How to greet the next session

Tell them: "Take task list from `C:\Git\OS Tabletop Helper\SAVEPOINT.md`,
work through items 1–8 in order, run `npm.cmd run build` after each, ask
me before doing anything destructive."
