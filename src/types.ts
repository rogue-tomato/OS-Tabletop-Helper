export type SpecialAbility = {
  title: string;
  text: string;
};

export type Ability = {
  id: string;
  name: string;
  level: number;
  cost?: string;
  summary: string;
  fullText?: string;
  /** Default card image. Used as the fallback for both grid and
   *  lightbox if the explicit thumb/full overrides aren't provided. */
  cardImage: string;
  /** Optional explicit ~400w thumbnail for the grid. If omitted,
   *  CardTile derives it via `thumbUrl(cardImage)`. */
  cardImageThumb?: string;
  /** Optional explicit full-resolution image for the lightbox. If
   *  omitted, CardLightbox falls back to `cardImage`. */
  cardImageFull?: string;
  needsVerification?: boolean;
  manualPlaceholder?: boolean;
};

export type Complexity = 1 | 2 | 3 | 4 | 5;

export type Character = {
  id: string;
  name: string;
  /** Short name shown only on the list-page tile. Falls back to
   *  `name` if undefined. The detail page always uses `name`. */
  listName?: string;
  slug: string;
  role: string;
  playstyle: string;
  /** Official "Complexity" rating from the rulebook (1–5 stars).
   *  Renders as a row of filled/empty stars on the list tile and the
   *  hero panel. */
  complexity?: Complexity;
  art: string;
  /** Optional dedicated cover/thumb for the character list. Falls back
   *  to `art` if undefined or if the file is missing. */
  listImage?: string;
  /** CSS object-position values applied to the hero art on the
   *  character page. Defaults are set in the data layer ("25% center"
   *  mobile, "center center" desktop). Configure per-character to fix
   *  awkward crops. */
  heroObjectPositionMobile?: string;
  heroObjectPositionDesktop?: string;
  /** Optional explicit mobile (portrait/cropped) hero variant for the
   *  character detail page. Falls back to `heroArtDesktop` then `art`. */
  heroArtMobile?: string;
  /** Optional explicit desktop (wide/landscape) hero variant. Falls
   *  back to `art`. */
  heroArtDesktop?: string;
  /** Optional explicit full-resolution variant for the fullscreen
   *  lightbox. Falls back to `heroArtDesktop` then `art`. */
  heroArtFull?: string;
  specialAbility: SpecialAbility[];
  canEquip: string;
  abilities: Ability[];
  unlockedAbilities?: Ability[];
  uniqueMechanics?: string[];
  lore?: string;
  /** Hidden tags used by the home-page search. The user does not see
   *  these — they widen what queries match. Free-form, lowercase
   *  strings (e.g. "bow", "tank", "shield"). */
  searchTags?: string[];
};
