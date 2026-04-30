# Oathsworn — HTML extraction report

This pass replaced PDF-only extraction with **per-section card-image
extraction** from the SingleFile HTML capture of the BoardGameGeek thread
(`Oathsworn Player Character Summary - Updated 10_22_25 ｜ BoardGameGeek
(4_30_2026 6：54：02 PM).html`, 102 MB, single line, 191 embedded data URIs of
which 62 are character-section PNGs).

Generated 2026-04-30.

## How the extraction was done

1. Found byte offsets of every character heading inside the HTML (single line).
2. Extracted every `data:image/png;base64,…` URI to a separate base64 file
   along with its byte offset, then decoded all 62 PNGs.
3. Mapped each PNG offset to the most-recent preceding character section
   header to get an authoritative *image → character* mapping (no guessing).
4. Each PNG is **two cards side-by-side** at 679×516. Cropped each into
   left/right halves at the midpoint, saving the result into
   `public/characters/<slug>/cards/[level-N/]NN_<slugified_name>.png`.
5. Read every card title via cropped+upscaled views of the title plate to
   confirm the literal text on each card.
6. Updated `src/data/oathswornCanonicalDb.ts`:
   - flipped `needsVerification: false` only for abilities whose card name
     and ownership are **both** confirmed via the HTML card image;
   - kept `needsVerification: true` for abilities whose names come from PDF
     prose only (no image to corroborate spelling or ownership);
   - corrected two name spellings (`Multishot` → `Multi Shot`,
     `Exploding Spores` → `Exploding Spore` per literal card title);
   - added eight new abilities discovered from the card images
     (Penitent ×2, Blade ×6).

The app UI was not changed. The thin adapter
`src/data/characters.ts` continues to feed `level1Abilities` to
`CardsTab` so the new image filenames render automatically.

## Image inventory

| PNGs in section | Character | Levels covered | Slug |
| --: | --- | --- | --- |
| 6 | The Warden | L1 (×3 pairs), L5, L10, L15 | `warden` |
| 4 | The Ursus Warbear | L2, L5, L10, L15 *(no L1 images)* | `ursus-warbear` |
| 8 | The Witch | special-art + L1 (×5 pairs) + L2 + L5 | `witch` |
| 4 | The Priest | L1, L2, L10, L15 | `priest` |
| 5 | The A'Dendri Ranger | L1 (×3 pairs), L5, L10 | `adendri-ranger` |
| 6 | The Scar Tribe Exile | L1 (×2 pairs), L2, L5, L10, L15 | `scar-tribe-exile` |
| 3 | The Cur | L1, L5, L10 | `cur` |
| 4 | The Penitent | L1 (×3 pairs), L2 | `penitent` |
| 4 | The Avi Harbinger | L1, L5, L10, L15 | `avi-harbinger` |
| 6 | The Blade | L1 (×3 pairs), L2, L5, L15 | `thracian-blade` |
| 3 | The Grove Maiden | L2, L5, L10 *(no L1 images)* | `adendri-grove-maiden` |
| 5 | The Huntress | L1 (×3 pairs), L5, L10 | `huntress` |
| **58** | **(out of 62 PNGs total — 4 are unrelated UI icons)** | | |

Every card-image PNG was split into 2 cards → **114 individual card images**
saved into the `public/characters/<slug>/cards/[level-N/]` folders.

## What changed vs the previous (PDF-only) DB

### Newly added abilities (×8)

| Character | Level | Ability | Source |
| --- | --: | --- | --- |
| The Penitent | 1 | **Revenge** | HTML card image (paired with Guard at cooldown 1) |
| The Penitent | 1 | **Intercession** | HTML card image (paired with Sweep at cooldown 2) |
| The Blade | 1 | **Charging Boar** | HTML card image; PDF intro also names it as the example star-icon card |
| The Blade | 1 | **Winnowing Strike** | HTML card image |
| The Blade | 1 | **Mules Regard** | HTML card image (rendered without an apostrophe on the title plate) |
| The Blade | 2 | **Master Parry** | HTML card image (the previously-unnamed L2 "circumvent damage" card) |
| The Blade | 15 | **Perfect Form** | HTML card image (L15 was empty before) |
| The Blade | 15 | **Blade Call** | HTML card image (L15 was empty before) |

### Name corrections

| Old | New | Reason |
| --- | --- | --- |
| `Multishot` | `Multi Shot` | Card title is rendered as two words on the Ranger L1 card |
| `Exploding Spores` | `Exploding Spore` | Card title is singular on the Grove Maiden L5 card |

### `needsVerification` flips

114 of 179 abilities are now `needsVerification: false` (confirmed via card
image). 65 remain `needsVerification: true` (PDF prose only, no image yet).

### Per-character L1 names (current state)

- **The Warden** — Claimed Ground, Guard, Chain Drag, Arcing Strike, Shield Bash, Taunt
- **The Ursus Warbear** — Feral Roar, Swipe, Ironhide, Toss, Challenge *(prose only)*
- **The Witch** — Elemental Suffusion, Kinetic Reflection, Ice Spike, Encapsulate, Comet, Chain Lightning, Fireflies, Incineration Wave, Fireball, Flaming Whip, Lash Out *(Lash Out = prose only)*
- **The Priest** — Righteous Advance, Pillar and Path, Desperate Prayer, Prayer of Protection, Fend, Weight of Glory *(only the cooldown-2 pair has card images)*
- **The A'Dendri Ranger** — Longshot, Ricochet, Quickshot, Thread the Needle, Child of the Forest, Multi Shot
- **The Scar Tribe Exile** — Weapon Throw, Leap Attack, Reap, Roaring Charge, Death from Above *(Death from Above = prose only)*
- **The Cur** — Concealment, Backstab, Low Blow, Throwing Daggers, Smoke Bomb, Nightshade *(only Low Blow + Throwing Daggers have card images)*
- **The Penitent** — Guard, **Revenge**, Sweep, **Intercession**, Shield Bash, Taunt *(all six confirmed via card images)*
- **The Avi Harbinger** — Backstab, Prophetic Fulfilment, Foreshadowing, Prescient Strike, Deadeye Shot, One Soul *(only Deadeye Shot + One Soul have card images)*
- **The Blade** — **Charging Boar**, Roll, **Winnowing Strike**, Somersault, **Mules Regard**, Cleaving Slide *(all six confirmed via card images — was 3 before)*
- **The Grove Maiden** — Raise Sentinel, Volley, Thundering Giant, Life Bloom, Nature's Fury, Thorns *(prose only)*
- **The Huntress** — Rile and Rake, Hunter's Call, Swoop, Clamp On, Hinder, Flight of Feathers

## Specific known checks

| Check | Result |
| --- | --- |
| Warden L1 card "Measured Blow" present if visually confirmed | **Not present.** "Measured Blow" appears nowhere in the HTML — neither in the prose nor as a card image. Per rule 8, the slot stays empty rather than being added on guesswork. |
| Ursus Warbear missing L1 cards from card images | **Still missing.** The HTML has zero L1 card images for Ursus; all L1 names remain prose-only. |
| Scar Tribe Exile missing L1 cards from card images | **Partially recovered.** 4 L1 cards have card images (Weapon Throw, Leap Attack, Reap, Roaring Charge). Death from Above is still prose-only; the cooldown-3 "headbutt" card has no readable name and stays omitted. |
| Penitent missing L1 cards from card images | **Recovered.** All 6 L1 cards now confirmed via images, including two that were never in the prose: Revenge and Intercession. |
| Blade / Thracian Blade sparse section recovery | **Recovered.** L1 went from 3 named cards to 6; L2 added Master Parry; L15 went from empty to 2 (Perfect Form, Blade Call). |
| Witch expanded L1 starting choices preserved correctly | **Yes.** 10 of 11 L1 cards have card images (3 basic ★ except Lash Out + 4 ice + 4 fire). Lash Out stays as `needsVerification: true`. The L2/L5 partial coverage (Glacial Shield, Firewall, Lightning Rod, Fireworm) is also confirmed. |

## Card ownership cross-checks

| Hard rule | Result |
| --- | --- |
| No Cur card appears in the Scar Tribe Exile folder | ✅ Pass |
| No Scar Tribe Exile card appears in the Cur folder | ✅ Pass |
| Open Wound stays as the Scar Tribe Exile *special ability*, never an L1 card | ✅ Pass |
| Concealment, Backstab, Smoke Bomb, Nightshade stay under Cur only | ✅ Pass |
| Weapon Throw + Leap Attack stay under Scar Tribe Exile L1; Weapon Throw also under Blade L2 (separate id); Leap Attack also under Huntress L2 (separate id) | ✅ Pass |
| Guard / Shield Bash / Taunt are duplicated under Warden + Penitent as separate ability ids | ✅ Pass |
| Reflection is duplicated under Warden L5 + Penitent L15 as separate ability ids | ✅ Pass |
| Intervention is duplicated under Warden L10 + Ursus L10 + Penitent L10 as separate ability ids | ✅ Pass |
| Backstab is duplicated under Cur L1 + Avi Harbinger L1 as separate ability ids | ✅ Pass |
| Dodge is duplicated under Cur L2 + Avi Harbinger L10 as separate ability ids | ✅ Pass |
| Swiftness is duplicated under Cur L5 + Scar Tribe Exile L5 as separate ability ids | ✅ Pass |
| Piercing Arrow is duplicated under Ranger L5 + Huntress L10 as separate ability ids | ✅ Pass |

## Abilities still `needsVerification: true` (no image yet, name from PDF prose only)

Listed in the order they appear in the canonical DB. These should be the
next round's targets — either by finding a card image (e.g. via the upgraded
abilities PDF the previous seed referenced) or by manual transcription.

### The Warden — 2 of 14
- L2: As One!, Stand Fast!

### The Ursus Warbear — 5 of 13
- L1: Feral Roar, Swipe, Ironhide, Toss, Challenge

### The Witch — 8 of 22
- L1: Lash Out
- L2: Telekinesis
- L10: Supernova, Hoarfrost, Elemental Weapon
- L15: Fire Storm, Lightning Storm, Telekine Implosion

### The Priest — 6 of 14
- L1: Righteous Advance, Pillar and Path, Fend, Weight of Glory
- L5: Blessing, Transfiguration

### The A'Dendri Ranger — 4 of 14
- L2: Amber Daggers, Disarming Shot
- L15: Hail of Arrows, Poison Tipped Arrow

### The Scar Tribe Exile — 1 of 13
- L1: Death from Above

### The Cur — 8 of 14
- L1: Concealment, Backstab, Smoke Bomb, Nightshade
- L2: Blind, Dodge
- L15: Shadowrun, Amber Bomb

### The Penitent — 6 of 14
- L5: Death Wish, Blessing
- L10: Zeal, Intervention
- L15: Reflection, Righteous Strike

### The Avi Harbinger — 6 of 14
- L1: Backstab, Prophetic Fulfilment, Foreshadowing, Prescient Strike
- L2: Quill Throw, Wingslam

### The Blade — 2 of 14
- L10: Nightfall, Blade Dance

### The Grove Maiden — 8 of 14
- L1: Raise Sentinel, Volley, Thundering Giant, Life Bloom, Nature's Fury, Thorns
- L15: Grove Song, Needle Storm

### The Huntress — 9 of 19
- L2: Leap Attack, Whistling Arrow, Spike Trap
- L5: Under the Wing, Amber Satchel Charge
- L10: Eye Gouge
- L15: Falcon Strike, Tandem Strike, Death Dive

## Summary

| Metric | Before this pass | After this pass |
| --: | --: | --: |
| Total abilities in canonical DB | 171 | 179 |
| `needsVerification: false` (confirmed) | 0 | 114 |
| Card images saved into `public/` | 0 | 114 |
| New abilities discovered from card images | 0 | 8 |
| Name spelling corrections from card images | 0 | 2 |
| Hard cross-character ownership violations | 0 | 0 |
