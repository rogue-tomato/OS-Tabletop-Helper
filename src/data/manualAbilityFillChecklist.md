# Manual ability fill checklist

Fill in each cooldown-0 starter card below from a verified source. When you
finish an entry, mirror the values into either
`src/data/manualAbilityFillTemplate.ts` or
`src/data/manualAbilityFillTemplate.json` — the override loader picks
either up at runtime through the TS file (the JSON is a copy you can edit
outside the TypeScript world if it's easier).

How a single entry becomes "done":

1. **Card image** — drop the file at the path in `Card image path` below.
   That path maps 1:1 to the `fillCardImage` field in the template.
2. **Edit the template** (TS or JSON) — paste the values you've written
   into the matching `fill*` fields.
3. **Verify** — once the entry is reviewed against the source, set
   `verified: true` on the template entry. That is the *only* way
   `needsVerification` flips to `false` and the manual-placeholder badge
   disappears.
4. **Visual check** — open `public/card-gallery.html` and confirm the card
   now renders correctly under the character's Cooldown 0 group.

Source guidance:
- **Do not invent or guess card names.** If a name is unverifiable, leave
  the entry empty and the placeholder stays visible until you find it.
- **Do not move cards between characters.** The override loader will
  refuse the override unless `characterSlug` matches the existing
  ability's character.

---

## Warden

- [ ] Card name:
- [ ] Cooldown:
- [ ] Animus cost:
- [ ] Defense:
- [ ] Short summary:
- [ ] Full card text:
- [ ] Card image path: `public/characters/warden/cards/level-1/00_manual_cd0.png`
- [ ] Source / proof:
- [ ] Verified by me:
- Ability id (do not change): `warden-l1-cd0-starter-placeholder`

## Ursus Warbear

- [ ] Card name:
- [ ] Cooldown:
- [ ] Animus cost:
- [ ] Defense:
- [ ] Short summary:
- [ ] Full card text:
- [ ] Card image path: `public/characters/ursus-warbear/cards/level-1/00_manual_cd0.png`
- [ ] Source / proof:
- [ ] Verified by me:
- Ability id (do not change): `ursus-warbear-l1-cd0-starter-placeholder`

## Priest

- [ ] Card name:
- [ ] Cooldown:
- [ ] Animus cost:
- [ ] Defense:
- [ ] Short summary:
- [ ] Full card text:
- [ ] Card image path: `public/characters/priest/cards/level-1/00_manual_cd0.png`
- [ ] Source / proof:
- [ ] Verified by me:
- Ability id (do not change): `priest-l1-cd0-starter-placeholder`
- Hint: PDF prose says this card also lets the Priest transfer 1 HP to an adjacent character.

## A'Dendri Ranger

- [ ] Card name:
- [ ] Cooldown:
- [ ] Animus cost:
- [ ] Defense:
- [ ] Short summary:
- [ ] Full card text:
- [ ] Card image path: `public/characters/adendri-ranger/cards/level-1/00_manual_cd0.png`
- [ ] Source / proof:
- [ ] Verified by me:
- Ability id (do not change): `adendri-ranger-l1-cd0-starter-placeholder`

## Scar Tribe Exile

- [ ] Card name:
- [ ] Cooldown:
- [ ] Animus cost:
- [ ] Defense:
- [ ] Short summary:
- [ ] Full card text:
- [ ] Card image path: `public/characters/scar-tribe-exile/cards/level-1/00_manual_cd0.png`
- [ ] Source / proof:
- [ ] Verified by me:
- Ability id (do not change): `scar-tribe-exile-l1-cd0-starter-placeholder`

## Cur

- [ ] Card name:
- [ ] Cooldown:
- [ ] Animus cost:
- [ ] Defense:
- [ ] Short summary:
- [ ] Full card text:
- [ ] Card image path: `public/characters/cur/cards/level-1/00_manual_cd0.png`
- [ ] Source / proof:
- [ ] Verified by me:
- Ability id (do not change): `cur-l1-cd0-starter-placeholder`

## Penitent

- [ ] Card name:
- [ ] Cooldown:
- [ ] Animus cost:
- [ ] Defense:
- [ ] Short summary:
- [ ] Full card text:
- [ ] Card image path: `public/characters/penitent/cards/level-1/00_manual_cd0.png`
- [ ] Source / proof:
- [ ] Verified by me:
- Ability id (do not change): `penitent-l1-cd0-starter-placeholder`

## Avi Harbinger

- [ ] Card name:
- [ ] Cooldown:
- [ ] Animus cost:
- [ ] Defense:
- [ ] Short summary:
- [ ] Full card text:
- [ ] Card image path: `public/characters/avi-harbinger/cards/level-1/00_manual_cd0.png`
- [ ] Source / proof:
- [ ] Verified by me:
- Ability id (do not change): `avi-harbinger-l1-cd0-starter-placeholder`

## Thracian Blade

- [ ] Card name:
- [ ] Cooldown:
- [ ] Animus cost:
- [ ] Defense:
- [ ] Short summary:
- [ ] Full card text:
- [ ] Card image path: `public/characters/thracian-blade/cards/level-1/00_manual_cd0.png`
- [ ] Source / proof:
- [ ] Verified by me:
- Ability id (do not change): `thracian-blade-l1-cd0-starter-placeholder`

## A'Dendri Grove Maiden

- [ ] Card name:
- [ ] Cooldown:
- [ ] Animus cost:
- [ ] Defense:
- [ ] Short summary:
- [ ] Full card text:
- [ ] Card image path: `public/characters/adendri-grove-maiden/cards/level-1/00_manual_cd0.png`
- [ ] Source / proof:
- [ ] Verified by me:
- Ability id (do not change): `adendri-grove-maiden-l1-cd0-starter-placeholder`
- Hint: PDF prose says her 0-cooldown card also lets her place Sentinels and attack with them.

## Huntress

- [ ] Card name:
- [ ] Cooldown:
- [ ] Animus cost:
- [ ] Defense:
- [ ] Short summary:
- [ ] Full card text:
- [ ] Card image path: `public/characters/huntress/cards/level-1/00_manual_cd0.png`
- [ ] Source / proof:
- [ ] Verified by me:
- Ability id (do not change): `huntress-l1-cd0-starter-placeholder`
