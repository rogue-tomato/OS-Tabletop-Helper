# Oathsworn canonical DB — validation report

> See [`oathswornHtmlExtraction.report.md`](oathswornHtmlExtraction.report.md)
> for the per-character HTML-extraction details (which images were found,
> which names were corrected, which abilities are new). This file is the
> *current* state of the canonical DB as a static snapshot. The same
> machine-readable report is produced at runtime in dev mode by
> `buildValidationReport()` / `formatValidationReport()` in
> [`oathswornCanonicalDb.ts`](oathswornCanonicalDb.ts) and printed to the
> browser console.

## Totals

| Metric | Count |
| --- | --- |
| Characters | 12 |
| Abilities total | 179 |
| Confirmed via card image (`needsVerification: false`) | 114 |
| Still `needsVerification: true` (PDF prose only) | 65 |
| Card image PNGs saved in `public/` | 114 |
| Cross-character ability-name duplicates | 13 |
| Duplicate ability ids | 0 |

## Per-character

| Character | slug | L1 | L2 | L5 | L10 | L15 | Total | Confirmed |
| --- | --- | --: | --: | --: | --: | --: | --: | --: |
| The Warden | `warden` | 6 | 2 | 2 | 2 | 2 | 14 | 12 |
| The Ursus Warbear | `ursus-warbear` | 5 | 2 | 2 | 2 | 2 | 13 | 8 |
| The Witch | `witch` | 11 | 3 | 2 | 3 | 3 | 22 | 14 |
| The Priest | `priest` | 6 | 2 | 2 | 2 | 2 | 14 | 8 |
| The A'Dendri Ranger | `adendri-ranger` | 6 | 2 | 2 | 2 | 2 | 14 | 10 |
| The Scar Tribe Exile | `scar-tribe-exile` | 5 | 2 | 2 | 2 | 2 | 13 | 12 |
| The Cur | `cur` | 6 | 2 | 2 | 2 | 2 | 14 | 6 |
| The Penitent | `penitent` | 6 | 2 | 2 | 2 | 2 | 14 | 8 |
| The Avi Harbinger | `avi-harbinger` | 6 | 2 | 2 | 2 | 2 | 14 | 8 |
| The Blade *(asset: Thracian Blade)* | `thracian-blade` | 6 | 2 | 2 | 2 | 2 | 14 | 12 |
| The Grove Maiden *(asset: A'Dendri Grove Maiden)* | `adendri-grove-maiden` | 6 | 2 | 2 | 2 | 2 | 14 | 6 |
| The Huntress | `huntress` | 6 | 3 | 4 | 3 | 3 | 19 | 10 |

## Cross-character ability-name duplicates *(intentional, separate ids)*

Per the user rules, abilities that share a name across characters are
duplicated as **separate** ability entries. The two entries are independent
— the UI must not link or share state between them.

| Ability name | Owning character slugs |
| --- | --- |
| Backstab | `avi-harbinger`, `cur` |
| Blessing | `penitent`, `priest` |
| Dodge | `avi-harbinger`, `cur` |
| Guard | `penitent`, `warden` |
| Intervention | `penitent`, `ursus-warbear`, `warden` |
| Leap Attack | `huntress`, `scar-tribe-exile` |
| Piercing Arrow | `adendri-ranger`, `huntress` |
| Reflection | `penitent`, `warden` |
| Shield Bash | `penitent`, `warden` |
| Swiftness | `cur`, `scar-tribe-exile` |
| Taunt | `penitent`, `warden` |
| Weapon Throw | `scar-tribe-exile`, `thracian-blade` |
| Zeal | `penitent`, `priest` |

## Hard cross-checks

- ✅ No Cur ability appears under Scar Tribe Exile (and vice versa).
- ✅ "Open Wound" remains the Scar Tribe Exile *special ability*, not an L1 card.
- ✅ Concealment / Backstab / Smoke Bomb / Nightshade remain Cur-only.
- ✅ Weapon Throw / Leap Attack remain Scar Tribe Exile L1; their Blade-L2 / Huntress-L2 duplicates have separate ids.
- ✅ Guard / Shield Bash / Taunt are duplicated under Warden + Penitent as separate entries.
- ✅ Reflection / Intervention / Zeal / Blessing duplicates use distinct character-scoped ids.

## Source page ranges

| Character | Pages |
| --- | --- |
| The Warden | 4–9 |
| The Ursus Warbear | 10–14 |
| The Witch | 15–22 |
| The Priest | 23–28 |
| The A'Dendri Ranger | 29–34 |
| The Scar Tribe Exile | 35–39 |
| The Cur | 40–45 |
| The Penitent | 46–50 |
| The Avi Harbinger | 51–55 |
| The Blade | 56–61 |
| The Grove Maiden | 62–69 |
| The Huntress | 70–77 |
