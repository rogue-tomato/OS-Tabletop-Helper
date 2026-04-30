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
  /** Path under `public/` for the list-page thumbnail. The adapter
   *  defaults this to `characters/<slug>/cover.jpg`; if no such file
   *  exists in `public/`, the UI gracefully falls back to `art`. */
  listImage?: string;
  /** CSS `object-position` for the hero on narrow screens. Defaults to
   *  "25% center" — biases the crop toward the left of the artwork so
   *  the character figure stays visible on phones. */
  heroObjectPositionMobile?: string;
  /** CSS `object-position` for the hero on wide screens. Defaults to
   *  "center center". */
  heroObjectPositionDesktop?: string;
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
    searchTags: ['inquisitor', 'tank', 'shield', 'chain', 'taunt'],
  },
  'ursus-warbear': {
    searchTags: ['warbear', 'beast', 'predator', 'apex'],
  },
  witch: {
    searchTags: ['sorcery', 'mage', 'caster', 'fire', 'ice', 'lightning', 'spell', 'aoe'],
  },
  priest: {
    searchTags: ['cleric', 'healer', 'monk', 'faith', 'hammer', 'support'],
  },
  'adendri-ranger': {
    searchTags: ['archer', 'sniper', 'woodland', 'ranged'],
  },
  'scar-tribe-exile': {
    // The Exile's artwork composition centers the figure differently —
    // keep the default centered crop instead of biasing left.
    heroObjectPositionMobile: 'center center',
    searchTags: ['barbarian', 'tribal', 'berserker', 'rage', 'crit'],
  },
  cur: {
    searchTags: ['assassin', 'thief', 'rogue', 'shadow', 'poison', 'sneak'],
  },
  penitent: {
    searchTags: ['holy', 'crusader', 'paladin', 'sacrifice'],
  },
  'avi-harbinger': {
    searchTags: ['avian', 'oracle', 'fate', 'predict', 'foresight'],
  },
  'thracian-blade': {
    searchTags: ['gladiator', 'arena', 'duelist', 'parry', 'sword'],
  },
  'adendri-grove-maiden': {
    searchTags: ['summoner', 'wychwood', 'sentinel', 'guardian', 'turret'],
  },
  huntress: {
    searchTags: ['noble', 'falconer', 'falcon', 'trap', 'archery'],
  },
};
