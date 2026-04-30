// Apply manual ability fill overrides to the canonical Oathsworn DB.
//
// The function is intentionally conservative — it only changes a field
// when its `fill*` counterpart is non-empty, never moves abilities
// between characters, and never marks something verified unless the
// override entry explicitly says so. New abilities are created only when
// `createIfMissing: true` is set on the override and (for safety) only
// at Level 1, since that is the only level the entry's `fillCooldown`
// can describe.

import type {
  OathswornAbility,
  OathswornCharacter,
} from './oathswornCanonicalDb';
import type { ManualAbilityFillEntry } from './manualAbilityFillTemplate';

const isFilled = (s: string | undefined): s is string =>
  typeof s === 'string' && s.trim().length > 0;

const applyOverrideToAbility = (
  ability: OathswornAbility,
  override: ManualAbilityFillEntry,
): OathswornAbility => {
  // Hard ownership check. If the override targets a different character,
  // skip it — never reassign abilities across characters.
  if (override.characterSlug !== ability.characterSlug) return ability;

  const next: OathswornAbility = { ...ability };

  if (isFilled(override.fillName)) next.name = override.fillName;
  if (isFilled(override.fillShortSummary))
    next.shortSummary = override.fillShortSummary;
  if (isFilled(override.fillFullText)) next.fullText = override.fillFullText;
  if (isFilled(override.fillCost)) next.cost = override.fillCost;
  if (isFilled(override.fillDefense)) next.defense = override.fillDefense;
  if (isFilled(override.fillCardImage)) next.cardImage = override.fillCardImage;

  // `fillCooldown` is always present in the type, but we only adopt it
  // for Level-1 abilities (cooldown is per-round position which only
  // applies meaningfully there). For other levels, leave the existing
  // cooldown alone unless the user explicitly fills `fillCardImage` etc.
  if (next.level === 1) next.cooldown = override.fillCooldown;

  if (override.verified === true) {
    next.needsVerification = false;
    if (next.manualPlaceholder) next.manualPlaceholder = false;
  }

  return next;
};

const buildCreatedAbility = (
  override: ManualAbilityFillEntry,
): OathswornAbility => ({
  id: override.abilityId,
  characterSlug: override.characterSlug,
  name: isFilled(override.fillName) ? override.fillName : override.currentName,
  level: 1,
  cooldown: override.fillCooldown,
  cost: isFilled(override.fillCost) ? override.fillCost : undefined,
  defense: isFilled(override.fillDefense) ? override.fillDefense : undefined,
  cardImage: isFilled(override.fillCardImage)
    ? override.fillCardImage
    : undefined,
  shortSummary: isFilled(override.fillShortSummary)
    ? override.fillShortSummary
    : '',
  fullText: isFilled(override.fillFullText) ? override.fillFullText : undefined,
  needsVerification: override.verified !== true,
  manualPlaceholder: false,
});

/**
 * Returns a NEW db array with overrides applied. The original `db` is
 * not mutated.
 *
 * Behaviour:
 *  - Each override is matched by `abilityId` (and rejected if its
 *    `characterSlug` does not match the existing ability's owner).
 *  - Empty `fill*` strings are no-ops; the original value is kept.
 *  - `needsVerification` stays true unless the override sets
 *    `verified: true`. The `manualPlaceholder` flag is also cleared
 *    only when verified.
 *  - When `createIfMissing: true` is set on an override that does NOT
 *    match any existing ability, a new Level-1 ability is appended to
 *    that character's `level1Abilities`. Without that flag, unmatched
 *    overrides are silently ignored.
 */
export function applyManualAbilityOverrides(
  db: OathswornCharacter[],
  overrides: ManualAbilityFillEntry[],
): OathswornCharacter[] {
  if (!overrides || overrides.length === 0) return db;

  // Index overrides by abilityId for fast lookup.
  const byId = new Map<string, ManualAbilityFillEntry>();
  for (const o of overrides) byId.set(o.abilityId, o);

  // Track which override ids actually got matched so we can detect
  // unmatched `createIfMissing` candidates afterward.
  const matched = new Set<string>();

  const applyToList = (
    abilities: OathswornAbility[],
  ): OathswornAbility[] =>
    abilities.map((a) => {
      const o = byId.get(a.id);
      if (!o) return a;
      matched.add(o.abilityId);
      return applyOverrideToAbility(a, o);
    });

  const next = db.map((c) => {
    const charOverrides = overrides.filter((o) => o.characterSlug === c.slug);
    if (charOverrides.length === 0) return c;

    const updatedL1 = applyToList(c.level1Abilities);
    const updatedL2 = applyToList(c.unlockedAbilities.level2);
    const updatedL5 = applyToList(c.unlockedAbilities.level5);
    const updatedL10 = applyToList(c.unlockedAbilities.level10);
    const updatedL15 = applyToList(c.unlockedAbilities.level15);

    // createIfMissing: append new Level-1 abilities for overrides that
    // didn't match an existing id and explicitly opt in.
    const created: OathswornAbility[] = [];
    for (const o of charOverrides) {
      if (matched.has(o.abilityId)) continue;
      if (o.createIfMissing !== true) continue;
      // Avoid duplicate ids in the same character.
      const allIds = [
        ...updatedL1,
        ...updatedL2,
        ...updatedL5,
        ...updatedL10,
        ...updatedL15,
      ].map((a) => a.id);
      if (allIds.includes(o.abilityId)) continue;
      created.push(buildCreatedAbility(o));
      matched.add(o.abilityId);
    }

    return {
      ...c,
      level1Abilities:
        created.length > 0 ? [...updatedL1, ...created] : updatedL1,
      unlockedAbilities: {
        level2: updatedL2,
        level5: updatedL5,
        level10: updatedL10,
        level15: updatedL15,
      },
    };
  });

  return next;
}
