// Manual ability fill template.
//
// Edit the entries below to fill in cooldown-0 starter cards (and any
// other manually-filled abilities) without touching the generated DB.
// `applyManualAbilityOverrides` reads this list at runtime and replaces
// only the fields you populate, so empty strings = "do nothing".
//
// Rules baked into the override loader:
//   - An override is only applied to the ability whose `id` matches
//     `abilityId` AND whose `characterSlug` matches.
//   - A field is replaced only if its `fill*` counterpart is non-empty.
//   - The card stays `needsVerification: true` until you explicitly set
//     `verified: true` on the entry. The placeholder `manualPlaceholder`
//     flag is also lifted only when `verified: true`.
//   - New abilities are NEVER created automatically. Set
//     `createIfMissing: true` only if you really mean it (and remember
//     this can only target Level 1 — see applyManualAbilityOverrides.ts).
//
// To fill a card:
//   1. Drop the card image at `public/<fillCardImage>` (the path is
//      relative to /public, so leading "/" is fine).
//   2. Edit the relevant entry below. Populate the fields you know.
//   3. When the entry is fully verified against a real source, add
//      `verified: true` to flip `needsVerification` to false.

export type ManualAbilityFillEntry = {
  characterSlug: string;
  characterName: string;
  abilityId: string;
  currentName: string;
  fillName: string;
  fillCost: string;
  fillDefense: string;
  fillCooldown: 0 | 1 | 2 | 3;
  fillShortSummary: string;
  fillFullText: string;
  fillCardImage: string;
  notes: string;
  /** Set to `true` once the entry has been confirmed against a verified
   *  source. Flips `needsVerification` to `false` and clears the
   *  `manualPlaceholder` flag for that single ability. */
  verified?: boolean;
  /** When `true` and no ability with `abilityId` exists, create a new
   *  Level-1 ability with the fill values. Use sparingly. */
  createIfMissing?: boolean;
};

export const manualAbilityFillTemplate: ManualAbilityFillEntry[] = [
  {
    characterSlug: 'warden',
    characterName: 'Warden',
    abilityId: 'warden-l1-cd0-starter-placeholder',
    currentName: 'Cooldown 0 Starter Card',
    fillName: '',
    fillCost: '',
    fillDefense: '',
    fillCooldown: 0,
    fillShortSummary: '',
    fillFullText: '',
    fillCardImage: '/characters/warden/cards/level-1/00_manual_cd0.webp',
    notes: 'Fill manually from a verified source.',
  },
  {
    characterSlug: 'ursus-warbear',
    characterName: 'Ursus Warbear',
    abilityId: 'ursus-warbear-l1-cd0-starter-placeholder',
    currentName: 'Cooldown 0 Starter Card',
    fillName: '',
    fillCost: '',
    fillDefense: '',
    fillCooldown: 0,
    fillShortSummary: '',
    fillFullText: '',
    fillCardImage: '/characters/ursus-warbear/cards/level-1/00_manual_cd0.webp',
    notes: 'Fill manually from a verified source.',
  },
  {
    characterSlug: 'priest',
    characterName: 'Priest',
    abilityId: 'priest-l1-cd0-starter-placeholder',
    currentName: 'Cooldown 0 Starter Card',
    fillName: '',
    fillCost: '',
    fillDefense: '',
    fillCooldown: 0,
    fillShortSummary: '',
    fillFullText: '',
    fillCardImage: '/characters/priest/cards/level-1/00_manual_cd0.webp',
    notes:
      'Fill manually from a verified source. PDF prose mentions an extra adjacent HP-transfer option on this card.',
  },
  {
    characterSlug: 'adendri-ranger',
    characterName: "A'Dendri Ranger",
    abilityId: 'adendri-ranger-l1-cd0-starter-placeholder',
    currentName: 'Cooldown 0 Starter Card',
    fillName: '',
    fillCost: '',
    fillDefense: '',
    fillCooldown: 0,
    fillShortSummary: '',
    fillFullText: '',
    fillCardImage: '/characters/adendri-ranger/cards/level-1/00_manual_cd0.webp',
    notes: 'Fill manually from a verified source.',
  },
  {
    characterSlug: 'scar-tribe-exile',
    characterName: 'Scar Tribe Exile',
    abilityId: 'scar-tribe-exile-l1-cd0-starter-placeholder',
    currentName: 'Cooldown 0 Starter Card',
    fillName: '',
    fillCost: '',
    fillDefense: '',
    fillCooldown: 0,
    fillShortSummary: '',
    fillFullText: '',
    fillCardImage: '/characters/scar-tribe-exile/cards/level-1/00_manual_cd0.webp',
    notes: 'Fill manually from a verified source.',
  },
  {
    characterSlug: 'cur',
    characterName: 'Cur',
    abilityId: 'cur-l1-cd0-starter-placeholder',
    currentName: 'Cooldown 0 Starter Card',
    fillName: '',
    fillCost: '',
    fillDefense: '',
    fillCooldown: 0,
    fillShortSummary: '',
    fillFullText: '',
    fillCardImage: '/characters/cur/cards/level-1/00_manual_cd0.webp',
    notes: 'Fill manually from a verified source.',
  },
  {
    characterSlug: 'penitent',
    characterName: 'Penitent',
    abilityId: 'penitent-l1-cd0-starter-placeholder',
    currentName: 'Cooldown 0 Starter Card',
    fillName: '',
    fillCost: '',
    fillDefense: '',
    fillCooldown: 0,
    fillShortSummary: '',
    fillFullText: '',
    fillCardImage: '/characters/penitent/cards/level-1/00_manual_cd0.webp',
    notes: 'Fill manually from a verified source.',
  },
  {
    characterSlug: 'avi-harbinger',
    characterName: 'Avi Harbinger',
    abilityId: 'avi-harbinger-l1-cd0-starter-placeholder',
    currentName: 'Cooldown 0 Starter Card',
    fillName: '',
    fillCost: '',
    fillDefense: '',
    fillCooldown: 0,
    fillShortSummary: '',
    fillFullText: '',
    fillCardImage: '/characters/avi-harbinger/cards/level-1/00_manual_cd0.webp',
    notes: 'Fill manually from a verified source.',
  },
  {
    characterSlug: 'thracian-blade',
    characterName: 'Thracian Blade',
    abilityId: 'thracian-blade-l1-cd0-starter-placeholder',
    currentName: 'Cooldown 0 Starter Card',
    fillName: '',
    fillCost: '',
    fillDefense: '',
    fillCooldown: 0,
    fillShortSummary: '',
    fillFullText: '',
    fillCardImage: '/characters/thracian-blade/cards/level-1/00_manual_cd0.webp',
    notes: 'Fill manually from a verified source.',
  },
  {
    characterSlug: 'adendri-grove-maiden',
    characterName: "A'Dendri Grove Maiden",
    abilityId: 'adendri-grove-maiden-l1-cd0-starter-placeholder',
    currentName: 'Cooldown 0 Starter Card',
    fillName: '',
    fillCost: '',
    fillDefense: '',
    fillCooldown: 0,
    fillShortSummary: '',
    fillFullText: '',
    fillCardImage:
      '/characters/adendri-grove-maiden/cards/level-1/00_manual_cd0.webp',
    notes:
      'Fill manually from a verified source. PDF prose says the Grove Maiden\'s 0-cooldown card also lets her place Sentinels and attack with them.',
  },
  {
    characterSlug: 'huntress',
    characterName: 'Huntress',
    abilityId: 'huntress-l1-cd0-starter-placeholder',
    currentName: 'Cooldown 0 Starter Card',
    fillName: '',
    fillCost: '',
    fillDefense: '',
    fillCooldown: 0,
    fillShortSummary: '',
    fillFullText: '',
    fillCardImage: '/characters/huntress/cards/level-1/00_manual_cd0.webp',
    notes: 'Fill manually from a verified source.',
  },
];
