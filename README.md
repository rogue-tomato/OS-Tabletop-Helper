# Oathsworn Character Sheets

Mobile-first static character reference for the Oathsworn board game, designed
to run as a Telegram Mini App and as a regular GitHub Pages site.

* React 18 + Vite 5 + TypeScript
* Tailwind CSS, dark-fantasy theme
* Hash routing (works on GitHub Pages refresh, no 404 trick required)
* No backend, no external APIs, all assets are local in `public/`

## 1. Run locally

Requires Node 18+ and npm 9+.

```bash
npm install
npm run dev
```

Open the printed URL (default `http://localhost:5173/`) on your phone or in a
browser. To preview the production build:

```bash
npm run build
npm run preview
```

## 2. Adding art and ability cards

All character images live under `public/characters/<slug>/`. The slug must
match the `slug` field in [`src/data/characters.ts`](src/data/characters.ts).

```
public/
  characters/
    warden/
      art.jpg                # large hero image, used on the list and detail
      cards/
        01.png               # ability card images, in level1Abilities order
        02.png
        03.png
        04.png
        05.png
        06.png
        07.png
    priest/
      art.jpg
      cards/
        01.png
        ...
```

Rules:
* `art.<ext>` can be `.jpg`, `.jpeg`, or `.png`. The path is set explicitly per
  character in `characters.ts` so any extension is fine.
* Card images load from `cards/01.png`, `cards/02.png`, … in the same order
  as `level1Abilities`. Missing images automatically fall back to a placeholder
  panel — the app never crashes if files are absent.
* If you want to add lore for a character, set the `lore` string on that
  entry in `characters.ts`. Empty `lore` shows "No lore added yet.".

## 3. Production build

```bash
npm run build
```

Output goes to `dist/`. The build is a normal static site.

### Setting the base path for a project page

For a repo at `https://<user>.github.io/<repo>/` set the base path so all
assets resolve correctly. Either:

```bash
VITE_BASE=/oathsworn-app/ npm run build
```

…or edit the `BASE` constant at the top of [`vite.config.ts`](vite.config.ts).
Use `/` (the default) for a custom domain or for a user/organization root page.

## 4. Deploy to GitHub Pages

The simplest option is the included `gh-pages` workflow:

```bash
# one-time
git init
git remote add origin https://github.com/<user>/<repo>.git

# every deploy
VITE_BASE=/<repo>/ npm run build
npx gh-pages -d dist
```

Then in GitHub → repo → **Settings → Pages**, select branch `gh-pages`, root
folder `/`. The site goes live at `https://<user>.github.io/<repo>/`.

If you prefer GitHub Actions, add `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: VITE_BASE=/${{ github.event.repository.name }}/ npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Hash routing is used everywhere, so refreshing on a deep link such as
`https://<user>.github.io/<repo>/#/character/warden` works without any extra
configuration.

## 5. Telegram Mini App / Menu Button

1. Open `@BotFather` in Telegram and create or pick a bot.
2. `/newapp` → choose your bot → fill in name, description, photo.
3. When asked for the **Web App URL**, paste your GitHub Pages URL, e.g.
   `https://<user>.github.io/<repo>/`. (Trailing `/` matters.)
4. To make it open from the menu button:
   * `/mybots` → choose bot → **Bot Settings → Menu Button → Configure menu
     button**.
   * Set label, e.g. "Characters".
   * Paste the same URL.
5. Optional: `/setdomain` → register the GitHub Pages domain so users can be
   logged in seamlessly (not required — this app uses no auth).

The page already loads the Telegram WebApp script and calls `expand()` /
`setHeaderColor()` so it sits flush with the Telegram UI when opened as a
Mini App.

## Project structure

```
src/
  App.tsx                  # routes
  main.tsx                 # entry, HashRouter, Telegram WebApp init
  index.css                # Tailwind layers + theme tokens
  types.ts                 # Character / Ability / SpecialAbility types
  data/oathswornCanonicalDb.ts        # source-of-truth character/ability data
  data/characterMetadata.ts           # listImage, hero focal, search tags (per-slug)
  data/levelGates.ts                  # which card-tab levels are revealed
  data/manualAbilityFillTemplate.ts   # manual fill entries for missing cards
  data/applyManualAbilityOverrides.ts # the override loader
  data/characters.ts                  # legacy adapter; the UI imports from here
  lib/assets.ts            # asset URL helper that respects vite base
  components/
    Layout.tsx             # header + safe-area wrapper
    CharacterList.tsx
    CharacterCard.tsx
    SearchInput.tsx
    EmptyState.tsx
    Tabs.tsx
    SummaryTab.tsx
    CardsTab.tsx
    LoreTab.tsx
    ArtLightbox.tsx        # full-screen hero art view
    CardLightbox.tsx       # full-screen ability card view
    PlaceholderImage.tsx
  pages/
    HomePage.tsx
    CharacterPage.tsx
public/
  characters/<slug>/art.{jpg,jpeg,png}        # large hero
  characters/<slug>/cover.jpg                 # optional list thumbnail
  characters/<slug>/cards/<NN>_<slug>.png     # level-1 card images
  characters/<slug>/cards/level-{2,5,10,15}/<NN>_<slug>.png
  card-gallery.html        # static QA gallery for verifying card images
```

## Editing character data

`src/data/characters.ts` is the only place to add or correct character
information. Every ability has:

* `name` — display name (placeholder labels like "Ability slot A" are used
  where the canonical seed has not been verified yet)
* `level`, `cost` (`Cooldown N` derived from the seed's `cooldown` number)
* `summary`, optional `fullText`
* `cardImage` — relative path under `public/`
* `needsVerification` — when `true`, a small **TBD** badge appears next to the
  ability so reviewers can spot what still needs source verification

Important rule baked into the seed: never copy abilities between characters,
and do not invent rules text for unknown cards. Replace placeholder names and
clear `needsVerification` only after checking the actual board / card.

## How to manually fill missing cards

Cards that are not in any of the captured BoardGameGeek sources (most
notably the eleven cooldown-0 starters — one per non-Witch character) are
represented in the canonical DB as `manualPlaceholder: true` ability
objects. They render in the gallery as dashed gold "Manual placeholder —
needs source" tiles, with the suggested image path printed underneath. The
app keeps showing them so the gap stays visible — the override loader in
`src/data/applyManualAbilityOverrides.ts` is what replaces the placeholder
once you fill an entry.

To fill a single card:

1. **Drop the card image** at the path printed on the placeholder tile,
   e.g. `public/characters/warden/cards/level-1/00_manual_cd0.png`. The
   suggested paths come straight from `manualAbilityFillTemplate.ts`. If
   you want to use a different filename, change `fillCardImage` in the
   template to match (it can be any path relative to `public/`).
2. **Edit the template.** Open
   [`src/data/manualAbilityFillTemplate.ts`](src/data/manualAbilityFillTemplate.ts)
   (TypeScript) or
   [`src/data/manualAbilityFillTemplate.json`](src/data/manualAbilityFillTemplate.json)
   (JSON copy if you'd rather edit outside TS) and locate the entry whose
   `abilityId` matches the placeholder you're filling. The id format is
   `<slug>-l1-cd0-starter-placeholder`.
3. **Fill the fields.** Populate any combination of `fillName`,
   `fillCost`, `fillDefense`, `fillShortSummary`, `fillFullText`. Empty
   strings are no-ops — the loader keeps the existing value. Do not
   rename `abilityId` or change `characterSlug`; those are how the
   override is matched and the loader rejects mismatches as a safety
   measure against accidentally reassigning a card to the wrong character.
4. **Mark verified.** When you've checked the entry against a verified
   source, add `verified: true` to that entry. Only then does the
   override loader flip `needsVerification` to `false` and clear the
   `manualPlaceholder` flag for that ability.
5. **Run the app and open the gallery.** Start the dev server with
   `npm run dev` and open `http://localhost:5173/card-gallery.html`. The
   filled card should now render as a regular Cooldown 0 card. If it
   still shows the placeholder, double-check the image path and the
   `abilityId` match.

The matching markdown checklist is at
[`src/data/manualAbilityFillChecklist.md`](src/data/manualAbilityFillChecklist.md)
— every entry there has the corresponding ability id and image path
already filled in for you.

### Strict rules baked into the override loader

* Empty `fill*` fields are no-ops — never overwrite real data with empty
  strings.
* The override is only applied when **both** `abilityId` matches and
  `characterSlug` matches the existing ability's owner. If you mistype a
  slug, the override is silently ignored (no abilities cross characters).
* `needsVerification` only flips to `false` when `verified: true` is set
  explicitly. The `manualPlaceholder` flag is also cleared at that point.
* New abilities are never created automatically. Set `createIfMissing:
  true` on a template entry only if you're intentionally adding a brand
  new card; even then it's only safe at Level 1 (the type's
  `fillCooldown` is per-round position, not unlock level).
* Card names are never inferred. If you don't have a verified name,
  leave the entry empty — the placeholder stays visible until you do.

## Common content updates

These are the small files you'll touch most often as the campaign
progresses. None of them require touching React component code.

### List page thumbnails

A character can have a dedicated cover image used on the list page
(square-ish framing of the figure looks best). The adapter automatically
looks for `public/characters/<slug>/cover.jpg`:

* If you drop a `cover.jpg` into the slug folder, the list card will use
  it; the original `art.<ext>` keeps powering the full-screen hero.
* If no cover exists, the list card transparently falls back to `art`.
* To use a different filename or extension, set
  `listImage: 'characters/<slug>/<filename>'` in
  [`src/data/characterMetadata.ts`](src/data/characterMetadata.ts).

### Hero focal points (mobile / desktop)

Edit
[`src/data/characterMetadata.ts`](src/data/characterMetadata.ts) to
change how a character's hero crops:

```ts
'thracian-blade': {
  heroObjectPositionMobile: '40% center',
  heroObjectPositionDesktop: 'center center',
},
```

Defaults if you don't set anything: mobile `25% center` (biased toward
the left of the artwork so the figure stays visible on phones), desktop
`center center`. The Exile already opts out of the left bias because of
its specific composition.

### Search tags (hidden — not shown in UI)

Same metadata file:

```ts
warden: {
  searchTags: ['inquisitor', 'tank', 'shield', 'chain', 'taunt'],
},
```

These widen what the home-page search box matches. The visible search
haystack already includes name, role, playstyle, ability names, and
`canEquip` text — so "bow" already finds the Ranger and Huntress without
any tag, and "Taunt" already finds the Warden via the ability list.
`searchTags` is for synonyms that wouldn't otherwise match (e.g.
"summoner" → Grove Maiden, "noble" → Huntress).

### Unlocking card sections by chapter

Card-tab progression sections (Level 2 / 5 / 10 / 15) start sealed and
show a "Unlock Chapter II to view" banner. Edit
[`src/data/levelGates.ts`](src/data/levelGates.ts) to:

* unlock a level for **everyone** — flip `revealed: true` on the
  matching key in `defaultLevelGates`,
* unlock a level for **one character only** — add to
  `perCharacterOverrides`:

```ts
export const perCharacterOverrides = {
  warden: { 2: { revealed: true } },
};
```

You can also customise the locked-message string per level (e.g. switch
"Chapter II" wording when the campaign uses different chapter names).

### Adding real cards under a higher level

When you have card images for L2/5/10/15:

1. Drop the PNGs at
   `public/characters/<slug>/cards/level-<N>/<NN>_<slug>.png` (the
   adapter already auto-builds these paths from the canonical DB).
2. Confirm the ability's `cardImage` path matches in
   `oathswornCanonicalDb.ts` — for the abilities marked
   `cardImage: null` in the canonical DB, the adapter falls back to a
   non-existent placeholder file. Set the path explicitly when you have
   a real image.
3. Flip the matching gate in `levelGates.ts` to `revealed: true`.
