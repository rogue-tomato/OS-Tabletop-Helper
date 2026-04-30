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
  specialAbility: SpecialAbility[];
  canEquip: string;
  abilities: Ability[];
  unlockedAbilities?: Ability[];
  uniqueMechanics?: string[];
  lore?: string;
};
