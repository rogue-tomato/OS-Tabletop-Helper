// Per-character presentation metadata.
//
// Edit this file (no code changes needed) to:
//   - point a character to a dedicated cover/thumbnail image
//   - override the hero image's mobile or desktop focal point
//   - add hidden search tags
//
// Defaults are applied automatically by the adapter, so a character only
// needs an entry here when something diverges from the default.

export type CharacterMetadata = {
  /** Short name shown only on the list-page tile (e.g. "Ranger"
   *  instead of "A'Dendri Ranger"). The detail page keeps the full
   *  `displayName`. Falls back to `displayName` if absent. */
  listName?: string;
  /** Official "Complexity" rating from the rulebook (1–5 stars). */
  complexity?: 1 | 2 | 3 | 4 | 5;
  /** Path under `public/` for the list-page thumbnail. The adapter
   *  defaults this to `characters/<slug>/cover.webp`; if no such file
   *  exists in `public/`, the UI gracefully falls back to `art`. */
  listImage?: string;
  /** CSS `object-position` for the hero on narrow screens. Defaults to
   *  "25% center" — biases the crop toward the left of the artwork so
   *  the character figure stays visible on phones. */
  heroObjectPositionMobile?: string;
  /** CSS `object-position` for the hero on wide screens. Defaults to
   *  "center center". */
  heroObjectPositionDesktop?: string;
  /** Optional explicit mobile-cropped hero variant (portrait-friendly).
   *  CharacterPage uses this on narrow viewports if set; otherwise it
   *  falls back to `heroArtDesktop`, then to the regular `art` field
   *  (resized to a medium-resolution variant for fast paint). */
  heroArtMobile?: string;
  /** Optional explicit desktop hero variant (wide/landscape framing).
   *  CharacterPage uses this on wide viewports if set; otherwise the
   *  default medium variant of `art` is used. */
  heroArtDesktop?: string;
  /** Optional explicit full-resolution variant shown when the user
   *  taps the hero to open the lightbox. Falls back to
   *  `heroArtDesktop`, then to `art`. */
  heroArtFull?: string;
  /** Hidden search tags. Free-form lowercase strings — added to the
   *  search haystack so users can find a character by themes/synonyms
   *  that aren't in the visible role/playstyle text. */
  searchTags?: string[];
};

// Default focal points. Override per-character in `metadata` below.
export const HERO_DEFAULT_MOBILE = '25% center';
export const HERO_DEFAULT_DESKTOP = 'center center';

export const metadata: Record<string, CharacterMetadata> = {
  warden: {
    listName: 'Warden',
    complexity: 3,
    heroArtMobile: 'characters/warden/art.mobile.webp',
    searchTags: ['inquisitor', 'tank', 'shield', 'chain', 'taunt'],
  },
  'ursus-warbear': {
    listName: 'Warbear',
    complexity: 3,
    heroArtMobile: 'characters/ursus-warbear/art.mobile.webp',
    searchTags: ['warbear', 'beast', 'predator', 'apex'],
  },
  witch: {
    listName: 'Witch',
    complexity: 5,
    heroArtMobile: 'characters/witch/art.mobile.webp',
    searchTags: ['sorcery', 'mage', 'caster', 'fire', 'ice', 'lightning', 'spell', 'aoe'],
  },
  priest: {
    listName: 'Priest',
    complexity: 2,
    heroArtMobile: 'characters/priest/art.mobile.webp',
    searchTags: ['cleric', 'healer', 'monk', 'faith', 'hammer', 'support'],
  },
  'adendri-ranger': {
    listName: 'Ranger',
    complexity: 1,
    heroArtMobile: 'characters/adendri-ranger/art.mobile.webp',
    searchTags: ['archer', 'sniper', 'woodland', 'ranged'],
  },
  'scar-tribe-exile': {
    listName: 'Exile',
    complexity: 1,
    // The Exile's artwork composition centers the figure differently —
    // keep the default centered crop instead of biasing left.
    heroObjectPositionMobile: 'center center',
    heroArtMobile: 'characters/scar-tribe-exile/art.mobile.webp',
    searchTags: ['barbarian', 'tribal', 'berserker', 'rage', 'crit'],
  },
  cur: {
    listName: 'Cur',
    complexity: 3,
    heroArtMobile: 'characters/cur/art.mobile.webp',
    searchTags: ['assassin', 'thief', 'rogue', 'shadow', 'poison', 'sneak'],
  },
  penitent: {
    listName: 'Penitent',
    complexity: 3,
    heroArtMobile: 'characters/penitent/art.mobile.webp',
    searchTags: ['holy', 'crusader', 'paladin', 'sacrifice'],
  },
  'avi-harbinger': {
    listName: 'Harbinger',
    complexity: 4,
    heroArtMobile: 'characters/avi-harbinger/art.mobile.webp',
    searchTags: ['avian', 'oracle', 'fate', 'predict', 'foresight'],
  },
  'thracian-blade': {
    listName: 'Blade',
    complexity: 3,
    heroArtMobile: 'characters/thracian-blade/art.mobile.webp',
    searchTags: ['gladiator', 'arena', 'duelist', 'parry', 'sword'],
  },
  'adendri-grove-maiden': {
    listName: 'Grove Maiden',
    complexity: 5,
    heroArtMobile: 'characters/adendri-grove-maiden/art.mobile.webp',
    searchTags: ['summoner', 'wychwood', 'sentinel', 'guardian', 'turret'],
  },
  huntress: {
    listName: 'Huntress',
    complexity: 5,
    heroArtMobile: 'characters/huntress/art.mobile.webp',
    searchTags: ['noble', 'falconer', 'falcon', 'trap', 'archery'],
  },
};
