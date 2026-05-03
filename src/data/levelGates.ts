// Card progression gates.
//
// Each card-tab section (Level 1 / 2 / 5 / 10 / 15) is either revealed
// or locked. Level 1 is revealed by default; the higher levels are
// locked with a chapter-based message until the campaign progresses.
//
// To unlock a level globally, flip its `revealed` to `true` here. To
// unlock for a single character only, add an entry to
// `perCharacterOverrides` below.

export type CardLevel = 1 | 2 | 5 | 10 | 15;

export type LevelGate = {
  revealed: boolean;
  /** Shown as a banner when `revealed` is false. */
  lockedMessage?: string;
  /** When true, the level is omitted entirely from the Cards tab and
   *  search prefetch — neither the cards nor the "sealed" banner
   *  render. Use this for levels that are not yet authored (vs.
   *  `revealed: false`, which is the in-game progression gate). */
  hidden?: boolean;
};

export const defaultLevelGates: Record<CardLevel, LevelGate> = {
  1: { revealed: true },
  // Level 2 is hidden site-wide until the in-house card builder lands.
  // Flip `hidden: false` (and optionally `revealed: true`) when ready.
  2: { revealed: false, hidden: true, lockedMessage: 'Unlock Chapter II to view' },
  5: { revealed: false, lockedMessage: 'Unlock Chapter V to view' },
  10: { revealed: false, lockedMessage: 'Unlock Chapter X to view' },
  15: { revealed: false, lockedMessage: 'Unlock Chapter XV to view' },
};

/**
 * Per-character overrides. When present, the character's gate replaces
 * the default for that level only. Example:
 *
 *   export const perCharacterOverrides = {
 *     warden: { 2: { revealed: true } },
 *   };
 */
export const perCharacterOverrides: Record<
  string,
  Partial<Record<CardLevel, LevelGate>>
> = {};

export function getLevelGate(slug: string, level: CardLevel): LevelGate {
  return perCharacterOverrides[slug]?.[level] ?? defaultLevelGates[level];
}
