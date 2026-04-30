# Oathsworn — Card Gallery Verification Report

Companion to the visual gallery at
[`/public/card-gallery.html`](../../public/card-gallery.html). Open it via
the dev server (`npm run dev` → `http://localhost:5173/card-gallery.html`)
or directly in a browser. This file is the text-only digest of the same
information.

Generated 2026-04-30 against `oathswornCanonicalDb.ts`.

## Universal observation

**Every character is missing the cooldown-0 starting card.** The PDF
prose describes it generically (*"Each class has one of these mandatory 0
cooldown cards…"*) but never names it for any character, and no card image
for it exists in the SingleFile HTML capture. Per rule 8 ("if the name is
unreadable, leave the slot out"), all twelve cooldown-0 slots are
intentionally empty.

The expected normal-character L1 hand is **7 cards**:

| Cooldown | Expected count | Notes |
| --: | --: | --- |
| 0 | 1 | Mandatory starter (currently missing for all 12 characters) |
| 1 | 2 | |
| 2 | 2 | |
| 3 | 2 | |

The Witch is the exception — her expanded starter pool is **11** abilities
(3 ★ basic non-element + 4 ice + 4 fire); in play she picks 4 elemental + 3
basic for a 7-card hand.

## Per-character L1 cooldown distribution

Symbols: ✅ matches expected, ⚠ short, 🚫 missing entirely.

| Character | cd0 | cd1 | cd2 | cd3 | L1 total | Verdict |
| --- | :-: | :-: | :-: | :-: | :-: | --- |
| The Warden | 🚫 0/1 | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 | 6/7 | Cooldown-0 slot empty |
| The Ursus Warbear | 🚫 0/1 | ✅ 2/2 | ✅ 2/2 | ⚠ 1/2 | 5/7 | Cooldown-0 + one cd-3 missing |
| The Witch | n/a | n/a | n/a | n/a | 11/11 | ✅ Full Witch pool |
| The Priest | 🚫 0/1 | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 | 6/7 | Cooldown-0 slot empty |
| The A'Dendri Ranger | 🚫 0/1 | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 | 6/7 | Cooldown-0 slot empty |
| The Scar Tribe Exile | 🚫 0/1 | ✅ 2/2 | ✅ 2/2 | ⚠ 1/2 | 5/7 | Cooldown-0 + one cd-3 missing |
| The Cur | 🚫 0/1 | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 | 6/7 | Cooldown-0 slot empty |
| The Penitent | 🚫 0/1 | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 | 6/7 | Cooldown-0 slot empty |
| The Avi Harbinger | 🚫 0/1 | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 | 6/7 | Cooldown-0 slot empty |
| The Blade | 🚫 0/1 | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 | 6/7 | Cooldown-0 slot empty |
| The Grove Maiden | 🚫 0/1 | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 | 6/7 | Cooldown-0 slot empty |
| The Huntress | 🚫 0/1 | ✅ 2/2 | ✅ 2/2 | ✅ 2/2 | 6/7 | Cooldown-0 slot empty |

## Specific inspections requested

### Warden L1 cooldown-0 card

- **Expected:** the cooldown-0 starter (third-party knowledge calls it
  "Measured Blow", but that name is **not** in the source).
- **Actual extracted Warden L1 image files:**
  - `01_claimed_ground.png` (cd 1)
  - `02_guard.png` (cd 1)
  - `03_chain_drag.png` (cd 2)
  - `04_arcing_strike.png` (cd 2)
  - `05_shield_bash.png` (cd 3)
  - `06_taunt.png` (cd 3)
  - 6 cards total — the cooldown-0 slot is empty.
- **Is the HTML section incomplete for Warden?** The Warden section
  contains 6 PNGs (3 L1 pairs + L5 + L10 + L15). The cooldown-0 card image
  is **not** posted in the BoardGameGeek thread for the Warden. There is
  also no L2 card image (As One!, Stand Fast!) — the Warden HTML coverage
  is L1 + L5 + L10 + L15 only.
- **Is "Measured Blow" referenced anywhere in the source?** No. A
  case-insensitive search of the HTML returns zero hits. Per rule 8, the
  slot stays empty.

### Penitent L1 cooldown-0 card

- **Actual extracted Penitent L1 image files:**
  - `01_guard.png` (cd 1)
  - `02_revenge.png` (cd 1) — *new this pass*
  - `03_sweep.png` (cd 2)
  - `04_intercession.png` (cd 2) — *new this pass*
  - `05_shield_bash.png` (cd 3)
  - `06_taunt.png` (cd 3)
  - 6 cards total — the cooldown-0 slot is empty.
- **HTML coverage:** 4 PNGs in the Penitent section: 3 L1 pairs (cd-1,
  cd-2, cd-3) + 1 L2 pair (Repel + Judgement). No L5 / L10 / L15 card
  images. The cooldown-0 card image is not posted.

### Blade L1 cooldown-0 card

- **Actual extracted Blade L1 image files:**
  - `01_charging_boar.png` (cd 1)
  - `02_roll.png` (cd 1)
  - `03_winnowing_strike.png` (cd 2)
  - `04_somersault.png` (cd 2)
  - `05_mules_regard.png` (cd 3)
  - `06_cleaving_slide.png` (cd 3)
  - 6 cards total — the cooldown-0 slot is empty.
- **HTML coverage:** 6 PNGs in the Blade section: 3 L1 pairs + L2 + L5 +
  L15. L10 (Nightfall, Blade Dance) has no card images and stays prose-only.
  The cooldown-0 card image is not posted.

### Ursus Warbear missing L1 cards

- **Actual extracted Ursus L1 image files:** none. The HTML section for
  Ursus Warbear has zero L1 card images — only L2/L5/L10/L15 are pictured
  on the BoardGameGeek thread.
- **L1 names in DB (PDF prose only):** Feral Roar (cd 1), Swipe (cd 1),
  Ironhide (cd 2), Toss (cd 2), Challenge (cd 3) — 5 cards.
- **What's missing:**
  - The cooldown-0 starter (universal).
  - The second cooldown-3 card. The PDF prose describes it as *"you can
    bite a foe about to attack her or another friendly character"* in
    lowercase, with no card name. Likely "Bite" but unconfirmed; per
    rule 8 the slot stays empty.

### Scar Tribe Exile missing L1 cards

- **Actual extracted Exile L1 image files:**
  - `01_weapon_throw.png` (cd 1)
  - `02_leap_attack.png` (cd 1)
  - `03_reap.png` (cd 2)
  - `04_roaring_charge.png` (cd 2)
  - 4 cards total. The cooldown-3 pair is split — Death from Above is
    named in PDF prose but no image, and the second cooldown-3 card has
    only lowercase narrative ("by headbutting an adjacent enemy").
- **What's missing:**
  - The cooldown-0 starter (universal).
  - The second cooldown-3 card (the headbutt-style interrupt).
- **HTML coverage:** 6 PNGs total — 2 L1 pairs (cd-1, cd-2) + L2 + L5 + L10
  + L15. The cooldown-3 L1 pair is **not** posted as a card image.

## Suggested next steps for filling gaps

The gaps fall into two clear groups:

1. **Universally missing cooldown-0 starters (12 cards).** These are not in
   the BoardGameGeek thread at all. To add them you'd need either:
   - a different PDF / image source (e.g. the upgraded abilities PDF the
     original seed referenced — pages 3-134 by character section), or
   - the actual physical cards / a publisher rulebook scan.
2. **Sporadic per-character gaps** that the BoardGameGeek thread author
   simply did not post. Notably:
   - Warden L2 (As One!, Stand Fast!),
   - Ursus all of L1,
   - Scar Tribe Exile cd-3 L1 pair,
   - Cur cd-1 L1 pair (Concealment, Backstab) + cd-3 L1 pair (Smoke Bomb,
     Nightshade) + L2 + L15,
   - Avi Harbinger cd-1 L1 pair + cd-2 L1 pair + L2,
   - Grove Maiden all of L1 + L15,
   - Witch L1 Lash Out + L2 Telekinesis + L10 + L15,
   - Priest cd-1 L1 pair + cd-3 L1 pair + L5,
   - Ranger L2 + L15,
   - Penitent L5 + L10 + L15,
   - Blade L10,
   - Huntress L2 + 2 cards of L5 + 1 card of L10 + L15.

Until any of those gaps are filled with confirmed names + images, the
corresponding entries should remain `needsVerification: true` in the
canonical DB.
