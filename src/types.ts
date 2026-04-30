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
  cardImage: string;
  needsVerification?: boolean;
  manualPlaceholder?: boolean;
};

export type Character = {
  id: string;
  name: string;
  slug: string;
  role: string;
  playstyle: string;
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
