// Thin adapter: reshapes the canonical Oathsworn DB into the legacy
// `Character` shape consumed by the UI components.
//
// Source of truth lives in `oathswornCanonicalDb.ts`. Presentational
// metadata (search tags, hero focal points, list images) lives in
// `characterMetadata.ts`. Manual fill-ins (cooldown-0 starters etc.)
// live in `manualAbilityFillTemplate.ts`.
// Do NOT edit ability data in this file.

import type { Ability, Character } from '../types';
import {
  oathswornDb,
  type OathswornAbility,
  type OathswornCharacter,
} from './oathswornCanonicalDb';
import { manualAbilityFillTemplate } from './manualAbilityFillTemplate';
import { applyManualAbilityOverrides } from './applyManualAbilityOverrides';
import {
  metadata as characterMetadata,
  HERO_DEFAULT_MOBILE,
  HERO_DEFAULT_DESKTOP,
} from './characterMetadata';

const formatCost = (a: OathswornAbility): string | undefined => {
  // Free-form override wins (used for cards with "?" / variable Animus
  // costs that don't fit a single number).
  if (a.cost && a.cost.trim().length > 0) return a.cost;
  const parts: string[] = [];
  if (a.cooldown !== undefined && a.cooldown !== null) {
    parts.push(`Cooldown ${a.cooldown}`);
  }
  if (a.animusCost !== undefined && a.animusCost !== null) {
    parts.push(`Animus cost ${a.animusCost}`);
  }
  return parts.length > 0 ? parts.join(', ') : undefined;
};

const fallbackCardImage = (a: OathswornAbility): string => {
  if (a.cardImage && a.cardImage.length > 0) return a.cardImage;
  return `characters/${a.characterSlug}/cards/missing.webp`;
};

const toLegacyAbility = (a: OathswornAbility): Ability => ({
  id: a.id,
  name: a.name,
  level: a.level,
  cost: formatCost(a),
  summary: a.shortSummary,
  fullText: a.fullText,
  cardImage: fallbackCardImage(a),
  cardImageThumb: a.cardImageThumb,
  cardImageFull: a.cardImageFull,
  needsVerification: a.needsVerification,
  manualPlaceholder: a.manualPlaceholder,
});

const toLegacyCharacter = (c: OathswornCharacter): Character => {
  const meta = characterMetadata[c.slug] ?? {};
  return {
    id: c.id,
    name: c.displayName ?? c.name,
    slug: c.slug,
    role: c.role ?? '',
    playstyle: c.playstyle ?? '',
    art: c.art,
    // Inline canonical field wins; otherwise look at the metadata file;
    // otherwise default to `characters/<slug>/cover.webp`. The UI tries
    // this URL first and falls back to `art` automatically when missing.
    listImage:
      c.listImage ?? meta.listImage ?? `characters/${c.slug}/cover.webp`,
    heroObjectPositionMobile:
      c.heroObjectPositionMobile ??
      meta.heroObjectPositionMobile ??
      HERO_DEFAULT_MOBILE,
    heroObjectPositionDesktop:
      c.heroObjectPositionDesktop ??
      meta.heroObjectPositionDesktop ??
      HERO_DEFAULT_DESKTOP,
    heroArtMobile: meta.heroArtMobile,
    heroArtDesktop: meta.heroArtDesktop,
    heroArtFull: meta.heroArtFull,
    specialAbility: c.specialAbility,
    canEquip: c.canEquip,
    abilities: c.level1Abilities.map(toLegacyAbility),
    unlockedAbilities: [
      ...c.unlockedAbilities.level2,
      ...c.unlockedAbilities.level5,
      ...c.unlockedAbilities.level10,
      ...c.unlockedAbilities.level15,
    ].map(toLegacyAbility),
    lore: c.lore,
    searchTags: c.searchTags ?? meta.searchTags,
  };
};

const dbWithOverrides = applyManualAbilityOverrides(
  oathswornDb,
  manualAbilityFillTemplate,
);

export const characters: Character[] = dbWithOverrides.map(toLegacyCharacter);

export const findCharacter = (slug: string): Character | undefined =>
  characters.find((c) => c.slug === slug);
