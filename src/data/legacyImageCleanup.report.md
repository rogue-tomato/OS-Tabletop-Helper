# Legacy image cleanup — dry-run audit

Captured 2026-05-03 against `public/characters/`. Goal: remove
`.png` / `.jpg` / `.jpeg` originals that the app no longer references,
since `vite build` copies all of `public/` verbatim into `dist/` and
inflates deploys.

## Inventory

| Category | Files | Total size | WebP equivalent |
|----------|-------|------------|-----------------|
| `art.{png,jpg,jpeg}`        | 12  | ≈21 MB | `art.webp` (full) + `art.medium.webp` (1200w) ✓ |
| `cover.jpg`                 | 12  | ≈11 MB | `cover.webp` (full) + `cover.thumb.webp` (400w) ✓ |
| `cards/**/*.png`            | 152 | ≈58 MB | `cards/**/*.webp` + `cards/**/*.thumb.webp` ✓     |
| **Total**                   | **176** | **≈90 MB** | All have webp replacements |

## References found

`grep -rn "\.(png|jpe?g)"` over `src/`, `public/`, `README.md`,
`SAVEPOINT.md`, scripts:

| Reference site                                    | Kind                       | Blocks delete? |
|---------------------------------------------------|----------------------------|----------------|
| `src/**/*.{ts,tsx,css}`                           | None — all migrated to webp | No            |
| `src/data/oathswornCanonicalDb.ts`                | Only `.webp` paths now     | No             |
| `src/data/characters.ts`                          | Only `.webp` paths now     | No             |
| `src/data/characterMetadata.ts`                   | Only docstrings (`.webp`)  | No             |
| `src/data/manualAbilityFillTemplate.ts`           | `.webp` paths              | No             |
| `src/index.css`, `src/main.tsx`                   | `forest-bg.webp`           | No             |
| `scripts/convert-to-webp.mjs`                     | Extension matching only    | No             |
| `README.md`                                       | Docs/cheat sheet (legacy)  | Updated in PART 6 → No |
| `SAVEPOINT.md`                                    | Historical session log     | Stale doc, ignore |
| `public/card-gallery.html`                        | **Hardcoded `art.{png,jpg}` and `cards/*.png`** | YES until updated |

## Action plan

The only actively-served reference is `public/card-gallery.html` (a
static QA gallery that is not part of the React app — it loads
hardcoded image paths via plain `<img>` tags). It links to **all 12
art + 152 card files**.

**Plan:** rewrite `card-gallery.html` to point at `.webp` (same files,
modern format — gallery keeps working), then delete all 176 originals.
This is safe because:

- Every original has a `.webp` sibling already on disk.
- The React app references only `.webp`.
- `manualAbilityFillTemplate` references only `.webp`.
- No data file references the originals.
- Gallery rewrite is mechanical (regex substitution), not a redesign.

## Per-file proposed action

| Pattern                                | Action  | Reason                                     |
|----------------------------------------|---------|--------------------------------------------|
| `public/characters/*/cover.jpg`        | delete  | Only ref'd in README docs (updated PART 6) |
| `public/characters/*/art.{jpg,jpeg,png}` | delete | Ref'd by gallery → switch gallery to webp first |
| `public/characters/**/cards/**/*.png` | delete  | Same — gallery rewrite then delete         |

Nothing in this list is part of the **manual placeholder workflow** —
that workflow already references `.webp` paths
(`manualAbilityFillTemplate.ts`).

## Estimated saving

≈90 MB removed from `public/characters/`. `dist/` shrinks by the same
amount (vite copies `public/` verbatim). For deploys to GitHub Pages /
Telegram Mini App this is a meaningful difference in cold-start
download.

## Final cleanup result (executed 2026-05-03)

| Step                                              | Outcome  |
|---------------------------------------------------|----------|
| `card-gallery.html` paths rewritten `.png/.jpg → .webp` | 126 substitutions |
| `find … -delete`                                  | 176 files removed |
| Remaining originals in `public/characters/`       | 0        |
| `public/characters/` size                         | **114 MB → 24 MB** (−90 MB) |
| `dist/` size after rebuild                        | **117 MB → 25 MB** (−92 MB) |
| Build status                                      | ✓ green (60 modules) |
| Files kept                                        | All `.webp` (every original had a webp twin) |
| Image references needing update                   | `card-gallery.html` (done), `README.md` (done in PART 6); `SAVEPOINT.md` mention of `forest-bg.jpg` is a historical session log, left alone |
| Manual placeholder workflow                       | Untouched — already runs on `.webp` paths |
