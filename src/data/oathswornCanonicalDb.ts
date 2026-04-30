// Canonical Oathsworn character/ability database.
//
// Sources of truth (in priority order):
//   1. SingleFile HTML capture of the BoardGameGeek thread (for card images
//      and any text/name visible on the cards themselves).
//   2. PDF print of the same thread (for the surrounding prose).
//
// Strict rules baked into this file:
//   - Every ability lives ONLY inside the character's HTML/PDF section.
//   - When a card image is visible in the HTML, the ability uses the title
//     literally rendered on the card and `needsVerification` is set to false.
//   - When only the surrounding prose names the ability (no card image), the
//     ability stays `needsVerification: true` until the card image is found.
//   - Ability names that are NOT visible on a card AND only appear in
//     lowercase narrative ("you can bite", "by headbutting…") are
//     intentionally omitted. Slot count will fall short — this is by design.
//   - The mandatory cooldown-0 starting card is unnamed everywhere in the
//     captured material, so it is intentionally omitted from
//     `level1Abilities`. Validation reports each character as 1 short of 7.
//   - Where an ability name appears for several characters (Backstab, Dodge,
//     Swiftness, Weapon Throw, Leap Attack, Guard, Shield Bash, Taunt,
//     Reflection, Intervention, Zeal, Blessing, Piercing Arrow), it is
//     duplicated as a SEPARATE ability id under each owning character. The
//     two entries are independent — do not link them at runtime.
//   - `fullText` (the full printed rules text on each card) is still left
//     undefined. The card body text is small and not transcribed yet —
//     setting it would risk inventing text. `needsVerification: false` here
//     therefore means *the name + character ownership are confirmed*; the
//     full printed rules text is still a TODO.

export type OathswornAbility = {
  id: string;
  characterSlug: string;
  name: string;
  level: 0 | 1 | 2 | 5 | 10 | 15;
  cooldown?: 0 | 1 | 2 | 3;
  cost?: string;
  defense?: string;
  cardImage?: string;
  shortSummary: string;
  fullText?: string;
  sourcePage?: number;
  sourcePageRange?: [number, number];
  needsVerification: boolean;
  /** True when the slot exists as a known gap (e.g. unnamed cooldown-0
   *  starter) and is waiting on a manually-filled override entry. */
  manualPlaceholder?: boolean;
};

export type OathswornCharacter = {
  id: string;
  slug: string;
  /** Official PDF name, e.g. "The Blade", "The Grove Maiden". */
  name: string;
  /** Friendlier name used for the asset folder / app UI, e.g. "Thracian Blade". */
  displayName?: string;
  role?: string;
  playstyle?: string;
  art: string;
  specialAbility: { title: string; text: string }[];
  canEquip: string;
  lore?: string;
  level1Abilities: OathswornAbility[];
  unlockedAbilities: {
    level2: OathswornAbility[];
    level5: OathswornAbility[];
    level10: OathswornAbility[];
    level15: OathswornAbility[];
  };
};

const idSlug = (raw: string): string =>
  raw
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const fileSlug = (raw: string): string =>
  raw
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

type AbilityInput = {
  name: string;
  level: 0 | 1 | 2 | 5 | 10 | 15;
  cooldown?: 0 | 1 | 2 | 3;
  shortSummary: string;
  /** When false, the card image is present in the HTML capture and the name
   *  + character ownership are verified. Defaults to true. */
  needsVerification?: boolean;
  fullText?: string;
  /** Override the auto-generated cardImage path. Used when no actual image
   *  file exists on disk (set to undefined to omit). */
  cardImage?: string | null;
  /** Per-level position in the saved card filename (1-based). When omitted
   *  the array index is used. */
  positionInLevel?: number;
};

const buildAbility = (
  slug: string,
  pageRange: [number, number],
  level: 0 | 1 | 2 | 5 | 10 | 15,
  input: AbilityInput,
  arrayIndex: number,
): OathswornAbility => {
  const pos = input.positionInLevel ?? arrayIndex + 1;
  const filename = `${String(pos).padStart(2, '0')}_${fileSlug(input.name)}.png`;
  const defaultPath =
    level === 1
      ? `characters/${slug}/cards/${filename}`
      : `characters/${slug}/cards/level-${level}/${filename}`;
  const cardImage =
    input.cardImage === null ? undefined : input.cardImage ?? defaultPath;
  return {
    id: `${slug}-l${level}-${idSlug(input.name)}`,
    characterSlug: slug,
    name: input.name,
    level,
    cooldown: input.cooldown,
    cardImage,
    shortSummary: input.shortSummary,
    fullText: input.fullText,
    sourcePageRange: pageRange,
    needsVerification: input.needsVerification ?? true,
  };
};

const buildLevel1 = (
  slug: string,
  pageRange: [number, number],
  inputs: Omit<AbilityInput, 'level'>[],
): OathswornAbility[] =>
  inputs.map((input, i) => buildAbility(slug, pageRange, 1, { ...input, level: 1 }, i));

/**
 * Cooldown-0 starter placeholder for the 11 non-Witch characters.
 *
 * The cooldown-0 mandatory starter is described generically in the BGG
 * thread but never named for any character; no card image was posted
 * either. Instead of guessing or omitting silently, we surface the gap
 * as an explicit placeholder ability with `manualPlaceholder: true`.
 *
 * The Witch is excluded — her starter pool is 11 abilities chosen from
 * 3 ★ basic + 4 ice + 4 fire, with no single mandatory cooldown-0 card.
 *
 * To fill this in later, edit
 * `src/data/manualAbilityFillTemplate.ts` (or the JSON mirror); the
 * adapter applies overrides automatically. Do NOT edit this placeholder
 * directly with a guessed name.
 */
const buildCd0Placeholder = (
  slug: string,
  pageRange: [number, number],
): OathswornAbility => ({
  id: `${slug}-l1-cd0-starter-placeholder`,
  characterSlug: slug,
  name: 'Cooldown 0 Starter Card',
  level: 1,
  cooldown: 0,
  cost: '',
  defense: '',
  cardImage: '',
  shortSummary:
    'Missing from current BGG HTML/PDF source. Fill manually from a verified card image/source.',
  fullText: '',
  sourcePage: undefined,
  sourcePageRange: pageRange,
  needsVerification: true,
  manualPlaceholder: true,
});

const buildUnlocked = (
  slug: string,
  pageRange: [number, number],
  level: 2 | 5 | 10 | 15,
  inputs: Omit<AbilityInput, 'level'>[],
): OathswornAbility[] =>
  inputs.map((input, i) => buildAbility(slug, pageRange, level, { ...input, level }, i));

// =====================================================================
//                          THE WARDEN
// Confirmed in HTML images (PNG #1-#6): all 6 L1 cards + L5/L10/L15 pairs.
// `Measured Blow` (the cooldown-0 card from third-party knowledge) is NOT
// present in the HTML — neither as text nor as a card image — so it is
// deliberately omitted per rule 8 ("if the name is unreadable, leave the
// slot out").
// =====================================================================
const wardenRange: [number, number] = [4, 9];
const warden: OathswornCharacter = {
  id: 'warden',
  slug: 'warden',
  name: 'The Warden',
  displayName: 'Warden',
  role: 'Tank / Control',
  playstyle:
    'Heavy-armour shield-and-chain defender who guards allies, drags enemies, forces targeting, and controls the team battleflow.',
  art: 'characters/warden/art.jpg',
  specialAbility: [
    { title: 'Discipline', text: 'Once per round, Battleflow one card once.' },
    {
      title: 'The Mantle',
      text: "You may make yourself and any amount of adjacent characters immune to any of your Witch's abilities.",
    },
  ],
  canEquip:
    'All Armor, Shields. All 1-Hand and 2-Hand weapons except Daggers, Staffs, and Bows.',
  level1Abilities: [
    buildCd0Placeholder('warden', wardenRange),
    ...buildLevel1('warden', wardenRange, [
    {
      name: 'Claimed Ground',
      cooldown: 1,
      shortSummary:
        'Mob-clearing defensive/control card; rewards standing near enemies and holding ground. Combos with the defense token from Arcing Strike.',
      needsVerification: false,
    },
    {
      name: 'Guard',
      cooldown: 1,
      shortSummary:
        'Interrupt/lifesaver: close distance to a threatened ally for free and protect them with plate and shield.',
      needsVerification: false,
    },
    {
      name: 'Chain Drag',
      cooldown: 2,
      shortSummary:
        'Drag an enemy into range, into obstacles, or into other enemies; strong battlefield-control utility.',
      needsVerification: false,
    },
    {
      name: 'Arcing Strike',
      cooldown: 2,
      shortSummary:
        'Multi-target attack that puts out crowd damage; combos with Claimed Ground via the defense token it generates.',
      needsVerification: false,
    },
    {
      name: 'Shield Bash',
      cooldown: 3,
      shortSummary:
        'Shield attack with guaranteed Knockback 3; useful for collisions, halved-knockback large monsters, and space control.',
      needsVerification: false,
    },
    {
      name: 'Taunt',
      cooldown: 3,
      shortSummary:
        'Forces an enemy/Stage Card to target the Warden instead of another character. Core tank tool with a cheap attack option.',
      needsVerification: false,
    },
  ])],
  unlockedAbilities: {
    level2: buildUnlocked('warden', wardenRange, 2, [
      {
        name: 'As One!',
        shortSummary:
          'Lets an adjacent friendly character battleflow one card; team battleflow control.',
        cardImage: null,
      },
      {
        name: 'Stand Fast!',
        shortSummary:
          'Cheap ally support / defense effect that also battleflows cooldown 2 — combos with Discipline to recycle big cards.',
        cardImage: null,
      },
    ]),
    level5: buildUnlocked('warden', wardenRange, 5, [
      {
        name: 'Reflection',
        shortSummary:
          'Take heavy damage and send it right back at the enemy; high single-target output.',
        needsVerification: false,
      },
      {
        name: 'Final Verdict',
        shortSummary:
          'Single-target finisher that capitalises on enemies that have already taken wounds; mind the overkill on locations.',
        needsVerification: false,
      },
    ]),
    level10: buildUnlocked('warden', wardenRange, 10, [
      {
        name: 'Chained',
        shortSummary:
          "1 Animus: move 3 and reduce the enemy's defense. Battleflow benefit similar to Stand Fast! when timed correctly.",
        needsVerification: false,
      },
      {
        name: 'Intervention',
        shortSummary:
          'Take an attack yourself and reposition both you and your target. Combines with Taunt and Guard for granular damage control.',
        needsVerification: false,
      },
    ]),
    level15: buildUnlocked('warden', wardenRange, 15, [
      {
        name: 'Heart Seeker',
        shortSummary:
          'Exploits the divisional defense rule: any reduction makes a big difference. Line up correctly to gain the full advantage.',
        needsVerification: false,
      },
      {
        name: 'Hold the Line!',
        shortSummary:
          'One of the most powerful defensive abilities in the game: protects you and surrounding allies from incoming damage.',
        needsVerification: false,
      },
    ]),
  },
};

// =====================================================================
//                       THE URSUS WARBEAR
// HTML images cover L2/L5/L10/L15 only. L1 cards are described in the prose
// but no card images were posted, so they remain `needsVerification: true`.
// =====================================================================
const ursusRange: [number, number] = [10, 14];
const ursus: OathswornCharacter = {
  id: 'ursus-warbear',
  slug: 'ursus-warbear',
  name: 'The Ursus Warbear',
  displayName: 'Ursus Warbear',
  role: 'Tank / Damage Dealer',
  playstyle:
    'Huge melee bruiser; high durability and big weapons with knockback, throws, and primal empowerment.',
  art: 'characters/ursus-warbear/art.jpg',
  specialAbility: [
    {
      title: 'Apex Predator',
      text: 'You gain two 2x Empower Tokens at the start of every encounter.',
    },
    {
      title: 'Endurance',
      text: 'Your thick hide and great bulk make your ability cards grant more defense than usual.',
    },
  ],
  canEquip:
    'All Armor, All 1-Hand and 2-Hand Weapons except Daggers, Staffs, and Bows.',
  level1Abilities: [
    buildCd0Placeholder('ursus-warbear', ursusRange),
    ...buildLevel1('ursus-warbear', ursusRange, [
    {
      name: 'Feral Roar',
      cooldown: 1,
      shortSummary:
        'Movement / inspiration opener: move yourself 4 for 3 Animus with a friend, or distribute Empowered x3 tokens to allies.',
      cardImage: null,
    },
    {
      name: 'Swipe',
      cooldown: 1,
      shortSummary:
        'Cleave-style melee attack — hits multiple enemies, gaining +1 damage per additional target. Excellent in council fights.',
      cardImage: null,
    },
    {
      name: 'Ironhide',
      cooldown: 2,
      shortSummary:
        'Cheap 1-Animus engine card on cooldown 2: defense token or 2 movement, plus battleflow on cooldown 2 to cycle big 3s.',
      cardImage: null,
    },
    {
      name: 'Toss',
      cooldown: 2,
      shortSummary:
        'Pick an enemy up and throw them into a second who stumbles into a third — strong mob/council clear if positioned well.',
      cardImage: null,
    },
    {
      name: 'Challenge',
      cooldown: 3,
      shortSummary:
        'Tanking tool: deliberately take a blow for an ally / claim enemy attention. Saves lives in high-difficulty play.',
      cardImage: null,
    },
  ])],
  unlockedAbilities: {
    level2: buildUnlocked('ursus-warbear', ursusRange, 2, [
      {
        name: 'Batter',
        shortSummary:
          'One of the biggest knockbacks in the game, attached to an attack. Especially valuable vs giant monsters (halved knockback).',
        needsVerification: false,
      },
      {
        name: 'Primal Rage',
        shortSummary:
          'Two quick attacks; the determination rule applies to one missed attack, giving a near-guaranteed value floor.',
        needsVerification: false,
      },
    ]),
    level5: buildUnlocked('ursus-warbear', ursusRange, 5, [
      {
        name: 'Rend',
        shortSummary:
          'Bleed attack with a nested mechanic: first use is a normal attack, repeated uses ramp the bleed damage. Combos with team bleed.',
        needsVerification: false,
      },
      {
        name: 'Topple',
        shortSummary:
          'Charge a tree and push it onto a monster. High requirements but possibly the highest damage in the game with redraws.',
        needsVerification: false,
      },
    ]),
    level10: buildUnlocked('ursus-warbear', ursusRange, 10, [
      {
        name: 'Intervention',
        shortSummary:
          'Tanking utility: move a targeted ally beyond an AoE, or dive out of range yourself to save someone else.',
        needsVerification: false,
      },
      {
        name: 'Feeding Frenzy',
        shortSummary:
          'Trade a full round of bloodshed to feed on enemies and regain HP — rare healing in a grim-dark game.',
        needsVerification: false,
      },
    ]),
    level15: buildUnlocked('ursus-warbear', ursusRange, 15, [
      {
        name: 'Great Feat',
        shortSummary:
          'Push your luck: the more blanks you draw, the more redraws you gain. Legendary single-attack potential.',
        needsVerification: false,
      },
      {
        name: 'Warpath',
        shortSummary:
          'Charge in a straight line and attack everything you meet. Animus-efficient mass attack — mind your comrades in the line.',
        needsVerification: false,
      },
    ]),
  },
};

// =====================================================================
//                            THE WITCH
// HTML images cover 10 of 11 L1 cards (Lash Out missing) + 2 of 3 L2
// (Telekinesis missing) + 2 L5. L10/L15 cards are prose-only.
// =====================================================================
const witchRange: [number, number] = [15, 22];
const witch: OathswornCharacter = {
  id: 'witch',
  slug: 'witch',
  name: 'The Witch',
  displayName: 'Witch',
  role: 'Elemental Caster / Area Control',
  playstyle:
    'Complex elemental caster; places, spreads, and consumes Fire/Ice tiles to power spells. 22-card expanded deck.',
  art: 'characters/witch/art.png',
  specialAbility: [
    {
      title: 'Element Tiles',
      text:
        'Once per round, place an Ice or Fire tile within range 3 or spread an existing Ice or Fire tile to 2 adjacent hexes within range 3. These tiles cannot be placed underneath characters. To cast some spells, you must consume these tiles, removing them; you can only consume hexes within range 3.',
    },
  ],
  canEquip: 'Cloth Armor, Staffs, and Daggers.',
  level1Abilities: buildLevel1('witch', witchRange, [
    {
      name: 'Elemental Suffusion',
      shortSummary:
        'Basic non-element starter (★). Bolsters your supply of elemental tiles; enables high-cost hybrid builds in late game.',
      needsVerification: false,
    },
    {
      name: 'Kinetic Reflection',
      shortSummary:
        'Basic non-element starter (★). Make space and punish enemies that try to push you around — knock them into minions.',
      needsVerification: false,
    },
    {
      name: 'Ice Spike',
      shortSummary:
        'Starting Ice card. Big damage if you close distance and line it up across multiple hexes; staff-extended range helps.',
      needsVerification: false,
    },
    {
      name: 'Encapsulate',
      shortSummary:
        'Starting Ice card. Has a skill curve; if you bait enemies into your trap, one of the most Animus-efficient abilities in the game.',
      needsVerification: false,
    },
    {
      name: 'Comet',
      cooldown: 3,
      shortSummary:
        'Big-3 Ice card. Predictive single-target damage that scales with surrounding Water tiles; aim for breakpoints.',
      needsVerification: false,
    },
    {
      name: 'Chain Lightning',
      cooldown: 3,
      shortSummary:
        "Big-3 Ice card. Decimates single and multi-target situations; the Warden's mantle lets the chain bounce back even with one enemy.",
      needsVerification: false,
    },
    {
      name: 'Fireflies',
      shortSummary:
        'Starting Fire card. All-round multi/single-target damage that ignores enemy defense and benefits from blank draws.',
      needsVerification: false,
    },
    {
      name: 'Incineration Wave',
      shortSummary:
        'Starting Fire card. With extra fire tiles you can cover the map in cleansing flame — watch your teammates.',
      needsVerification: false,
    },
    {
      name: 'Fireball',
      cooldown: 3,
      shortSummary:
        'Big-3 Fire card. +1 Damage per additional hex covered after the first; great on large monsters with side-minions.',
      needsVerification: false,
    },
    {
      name: 'Flaming Whip',
      cooldown: 3,
      shortSummary:
        'Big-3 Fire card. High efficiency; pulls fleeing enemies back to your melee allies, saving up to 6 movement Animus.',
      needsVerification: false,
    },
    {
      name: 'Lash Out',
      shortSummary:
        'Basic non-element starter (★). Named in PDF prose but no card image is in the HTML capture.',
      cardImage: null,
    },
  ]),
  unlockedAbilities: {
    level2: buildUnlocked('witch', witchRange, 2, [
      {
        name: 'Glacial Shield',
        shortSummary:
          'Trade your Water tiles to take a heavy blow with shield-tier defense; can pivot the Witch into a tank role briefly.',
        needsVerification: false,
      },
      {
        name: 'Firewall',
        shortSummary:
          'Draw a line in the sand: pain for anyone crossing it, and a way to generate Fire tiles for your big spenders.',
        needsVerification: false,
      },
      {
        name: 'Telekinesis',
        shortSummary:
          'Throw enemies, allies, or yourself. Bring redraws — placement matters. (PDF prose; not in HTML images.)',
        cardImage: null,
      },
    ]),
    level5: buildUnlocked('witch', witchRange, 5, [
      {
        name: 'Lightning Rod',
        shortSummary:
          'Hugely powerful single-target spell, but lightning is unpredictable — watch nearby allies. Strong Water-tile opener.',
        needsVerification: false,
      },
      {
        name: 'Fireworm',
        shortSummary:
          'Effectively unlimited range; line up explosive landings by placing fire tiles in its path. Strong opener.',
        needsVerification: false,
      },
    ]),
    level10: buildUnlocked('witch', witchRange, 10, [
      {
        name: 'Supernova',
        shortSummary:
          'Most damaging multi-target spell in the game — dangerous to teammates. Bring a Warden to mantle the AoE.',
        cardImage: null,
      },
      {
        name: 'Hoarfrost',
        shortSummary:
          'Cooldown-1 constant damage with multi-target potential at a Water cost; placement is key for max efficiency.',
        cardImage: null,
      },
      {
        name: 'Elemental Weapon',
        shortSummary:
          "Playstyle-defining: empower an ally's big attack with elemental damage. High output, hurts everyone involved.",
        cardImage: null,
      },
    ]),
    level15: buildUnlocked('witch', witchRange, 15, [
      {
        name: 'Fire Storm',
        shortSummary:
          'AoE attack that covers a wide area but is more concentrated and dangerous to friends. +1 Damage per extra hex on a large enemy.',
        cardImage: null,
      },
      {
        name: 'Lightning Storm',
        shortSummary:
          'AoE attack with theoretical max 8 targets at infinite range. +1 Damage per extra hex on a large enemy. (Name verify — paired with Fire Storm in PDF prose.)',
        cardImage: null,
      },
      {
        name: 'Telekine Implosion',
        shortSummary:
          'Forced bundle: throws all targets together, preferably into one another for collision damage. Sets up the Free Company.',
        cardImage: null,
      },
    ]),
  },
};

// =====================================================================
//                           THE PRIEST
// HTML covers 2 of 6 L1 (Desperate Prayer, Prayer of Protection) + L2 +
// L10 + L15. L5 (Blessing, Transfiguration) is prose-only.
// =====================================================================
const priestRange: [number, number] = [23, 28];
const priest: OathswornCharacter = {
  id: 'priest',
  slug: 'priest',
  name: 'The Priest',
  displayName: 'Priest',
  role: 'Healer / Bruiser / Off-Tank',
  playstyle:
    'Plate-wearing battle-cleric who heals and protects allies at personal HP cost while still hitting hard with hammer and prayer.',
  art: 'characters/priest/art.jpg',
  specialAbility: [
    {
      title: "The Faithful's Vitality",
      text: 'If you have 3 HP or less, gain 1 HP at the start of each refresh phase.',
    },
  ],
  canEquip: 'All Armor. All 1-Hand and 2-Hand Maces, Staffs, and Polearms.',
  level1Abilities: [
    buildCd0Placeholder('priest', priestRange),
    ...buildLevel1('priest', priestRange, [
    {
      name: 'Righteous Advance',
      cooldown: 1,
      shortSummary:
        'Mobility opener that keeps movement cost low and sets up bigger plays across the field.',
      cardImage: null,
    },
    {
      name: 'Pillar and Path',
      cooldown: 1,
      shortSummary:
        'Self-buff: press for damage with a Redraw token, or bank future defense via a Defense token.',
      cardImage: null,
    },
    {
      name: 'Desperate Prayer',
      cooldown: 2,
      shortSummary:
        'Ranged heal with a difficulty check (white cards) scaled by target HP. Costs 1 of your HP; can move up to 2-3 HP onto a near-dead ally.',
      needsVerification: false,
      positionInLevel: 3,
    },
    {
      name: 'Prayer of Protection',
      cooldown: 2,
      shortSummary:
        'Preventative defense buff for an ally; effectively halves incoming damage when they have nothing left to defend with.',
      needsVerification: false,
      positionInLevel: 4,
    },
    {
      name: 'Fend',
      cooldown: 3,
      shortSummary:
        'Life-saving defense for an adjacent ally — no HP cost. Buddy up to use it on friends.',
      cardImage: null,
    },
    {
      name: 'Weight of Glory',
      cooldown: 3,
      shortSummary:
        'Knockback attack: deals extra damage by colliding the target, repositions enemies, and grants a Defense token.',
      cardImage: null,
    },
  ])],
  unlockedAbilities: {
    level2: buildUnlocked('priest', priestRange, 2, [
      {
        name: 'Lay On Hands',
        shortSummary:
          'Adjacent stronger sister of Desperate Prayer: half the Animus, double the redraws — but you must be next to the target.',
        needsVerification: false,
      },
      {
        name: 'Martyr',
        shortSummary:
          'Taunt that forces an enemy to attack the Priest — combines with self-regen and stacked defense tokens for a tank pivot.',
        needsVerification: false,
      },
    ]),
    level5: buildUnlocked('priest', priestRange, 5, [
      {
        name: 'Blessing',
        shortSummary:
          'Cheap way to hand out Redraw, Empowered x3, or Defense tokens to a Free Company member.',
        cardImage: null,
      },
      {
        name: 'Transfiguration',
        shortSummary:
          'Crowd deterrent / guaranteed removal: a moment of radiance scatters minions back into the shadows.',
        cardImage: null,
      },
    ]),
    level10: buildUnlocked('priest', priestRange, 10, [
      {
        name: 'Zeal',
        shortSummary:
          'Single-target damage that gauges how many cards to draw to hit a duplicate — push-your-luck attack.',
        needsVerification: false,
      },
      {
        name: 'Sanctify',
        shortSummary:
          'Area-of-effect Knockback with Empowered x3. Devastating output, but almost certainly costs 1 HP.',
        needsVerification: false,
      },
    ]),
    level15: buildUnlocked('priest', priestRange, 15, [
      {
        name: 'Holy Warrior',
        shortSummary:
          'Heavy draw-based attack: when you can handle 10+ Might cards, this card swings encounters by itself.',
        needsVerification: false,
      },
      {
        name: 'Vitality Aura',
        shortSummary:
          'Late-game mass heal that can pull the whole Free Company out of a hole when conditions align.',
        needsVerification: false,
      },
    ]),
  },
};

// =====================================================================
//                       THE A'DENDRI RANGER
// All 6 L1 cards visible in HTML (note: card title shows "MULTI SHOT"
// as two words). L2 + L15 are prose-only.
// =====================================================================
const rangerRange: [number, number] = [29, 34];
const ranger: OathswornCharacter = {
  id: 'adendri-ranger',
  slug: 'adendri-ranger',
  name: "The A'Dendri Ranger",
  displayName: "A'Dendri Ranger",
  role: 'Ranged Damage / Glass Cannon',
  playstyle:
    'Bow specialist focused on positioning, target selection, specialised arrowheads, and staying out of melee.',
  art: 'characters/adendri-ranger/art.jpg',
  specialAbility: [
    {
      title: 'Tree Running',
      text:
        'If you are adjacent to an obstacle, you may spend 3 animus to move up to 7 to another hex that is adjacent to an obstacle. Obstacles and other characters do not block this movement and you do not count as moving through intervening hexes.',
    },
  ],
  canEquip: 'Cloth and Leather Armor, Bows.',
  level1Abilities: [
    buildCd0Placeholder('adendri-ranger', rangerRange),
    ...buildLevel1('adendri-ranger', rangerRange, [
    {
      name: 'Longshot',
      cooldown: 1,
      shortSummary:
        'Big-damage opener for round 1; combos with Tree Running and bow range-extension Animus to shoot from perfect positions.',
      needsVerification: false,
    },
    {
      name: 'Ricochet',
      cooldown: 1,
      shortSummary:
        'Two modes: hard single-target attack, or push-your-luck multi-target. Animus-efficient when the draw lands right.',
      needsVerification: false,
    },
    {
      name: 'Quickshot',
      cooldown: 2,
      shortSummary:
        'Cheap Move 2 + Battleflow on cooldown 2; cycles your big 3-cooldown cards back into hand quickly.',
      needsVerification: false,
    },
    {
      name: 'Thread the Needle',
      cooldown: 2,
      shortSummary:
        'Targeted strike on a specific HP die — avoid breaking the closest die or whittle a die for your ally to finish. +3 Damage on the right side.',
      needsVerification: false,
    },
    {
      name: 'Child of the Forest',
      cooldown: 3,
      shortSummary:
        'Shoot then disappear into the trees. Not the most altruistic, but saves you in tight spots.',
      needsVerification: false,
    },
    {
      name: 'Multi Shot',
      cooldown: 3,
      shortSummary:
        "Multi-target attack — picks several enemies in range. (PDF prose: \"best described in a picture\". Card title is two words.)",
      needsVerification: false,
    },
  ])],
  unlockedAbilities: {
    level2: buildUnlocked('adendri-ranger', rangerRange, 2, [
      {
        name: 'Amber Daggers',
        shortSummary:
          'Animus-efficient close-range pair attack for when you need breathing room. Remember you wear leaves and bark. (PDF prose only — not in HTML images; name verify.)',
        cardImage: null,
      },
      {
        name: 'Disarming Shot',
        shortSummary:
          'Remove an enemy Might card anywhere in bow range — keeps your fragile teammates alive. (PDF prose only.)',
        cardImage: null,
      },
    ]),
    level5: buildUnlocked('adendri-ranger', rangerRange, 5, [
      {
        name: 'Bait and Switch',
        shortSummary:
          'Change the top card of the enemy stage deck or rotate the enemy to face any direction — sets up positional attacks for the team.',
        needsVerification: false,
      },
      {
        name: 'Piercing Arrow',
        shortSummary:
          'Line enemies up in a row for a high draw-damage potential — one of the strongest positional attacks at this tier.',
        needsVerification: false,
      },
    ]),
    level10: buildUnlocked('adendri-ranger', rangerRange, 10, [
      {
        name: 'Flensing Round',
        shortSummary:
          'Guaranteed HP loss arrowhead that becomes more efficient with repeated use — bleed-out heavy targets.',
        needsVerification: false,
      },
      {
        name: 'Bodkin',
        shortSummary:
          'Armour-piercing close-range shot vs heavily armoured enemies; even better when the enemy walks to you.',
        needsVerification: false,
      },
    ]),
    level15: buildUnlocked('adendri-ranger', rangerRange, 15, [
      {
        name: 'Hail of Arrows',
        shortSummary:
          'Three identical-damage attacks: kill multiple minions, or push for 2 HP on a single target to break a location instantly. (PDF prose only.)',
        cardImage: null,
      },
      {
        name: 'Poison Tipped Arrow',
        shortSummary:
          'Tanking finesse for when allies are low: keeps the Ranger upright while she absorbs the big nasty. (PDF prose only.)',
        cardImage: null,
      },
    ]),
  },
};

// =====================================================================
//                     THE SCAR TRIBE EXILE
// HTML images cover 4 of 5+ L1 cards (Death from Above missing from HTML
// images, named in prose; cooldown-3 "headbutt" card has no readable name).
// All L2/L5/L10/L15 visually confirmed.
// =====================================================================
const exileRange: [number, number] = [35, 39];
const exile: OathswornCharacter = {
  id: 'scar-tribe-exile',
  slug: 'scar-tribe-exile',
  name: 'The Scar Tribe Exile',
  displayName: 'Scar Tribe Exile',
  role: 'Melee Damage / Push-Your-Luck',
  playstyle:
    'Fast aggressive damage dealer; chains attacks by fishing for crits, riding the line between control and ferocity.',
  art: 'characters/scar-tribe-exile/art.jpg',
  specialAbility: [
    {
      title: 'Open Wound',
      text:
        'Once per encounter, at any time, you may rotate all cards on cooldown twice and lose one HP.',
    },
    {
      title: 'Unbound Rage',
      text:
        'Whenever you draw a critical during an attack that hits, gain 1 animus (Max 1 per attack).',
    },
  ],
  canEquip:
    'Cloth and Leather Armor. All 1-Hand and 2-Hand weapons except Daggers, Staffs, and Bows.',
  level1Abilities: [
    buildCd0Placeholder('scar-tribe-exile', exileRange),
    ...buildLevel1('scar-tribe-exile', exileRange, [
    {
      name: 'Weapon Throw',
      cooldown: 1,
      shortSummary:
        'Big single-target ranged attack — chuck your weapon at a far-off enemy or to trigger reactions. Remember to pick it up.',
      needsVerification: false,
    },
    {
      name: 'Leap Attack',
      cooldown: 1,
      shortSummary:
        'Fan-favourite jumping attack: vault over an enemy slicing them mid-air, land on a second, kick them into a third.',
      needsVerification: false,
    },
    {
      name: 'Reap',
      cooldown: 2,
      shortSummary: 'Multi-target attack that further enrages the Exile.',
      needsVerification: false,
    },
    {
      name: 'Roaring Charge',
      cooldown: 2,
      shortSummary:
        'Great opening move: closes distance for the Exile and the Free Company simultaneously.',
      needsVerification: false,
    },
    {
      name: 'Death from Above',
      cooldown: 3,
      shortSummary:
        'Hypermobile heavy hitter using treetop skill — disappear into the canopy and dive out, teeth bared and blades glinting. (PDF prose; no card image in HTML.)',
      cardImage: null,
    },
  ])],
  unlockedAbilities: {
    level2: buildUnlocked('scar-tribe-exile', exileRange, 2, [
      {
        name: 'Rake',
        shortSummary:
          'Positional attack that lets you grab a fistful of dice; gains a free redraw against the right targets.',
        needsVerification: false,
      },
      {
        name: 'Line Breaker',
        shortSummary:
          'Big mobility move that powers through enemies, attacking each in turn. Line them up and watch them fall.',
        needsVerification: false,
      },
    ]),
    level5: buildUnlocked('scar-tribe-exile', exileRange, 5, [
      {
        name: 'Hurl',
        shortSummary:
          'Pick enemies up and throw them at each other; aim for 3 kills via collision HP loss. Cornerstone of mob clearing.',
        needsVerification: false,
      },
      {
        name: 'Swiftness',
        shortSummary:
          'Cheap cooldown-2 movement card — boosts battleflow and gives you Animus left over for attacks.',
        needsVerification: false,
      },
    ]),
    level10: buildUnlocked('scar-tribe-exile', exileRange, 10, [
      {
        name: 'Berserk',
        shortSummary:
          'Wombo-combo damage: lose 1 HP, take their head. One of the biggest damage triggers on record.',
        needsVerification: false,
      },
      {
        name: 'Feral Charge',
        shortSummary:
          'Early chain attack with multi-target reach — strongest in the game when used right after Open Wound.',
        needsVerification: false,
      },
    ]),
    level15: buildUnlocked('scar-tribe-exile', exileRange, 15, [
      {
        name: 'Reave',
        shortSummary:
          'Mad charge across the battlefield, gaining strength with each hex covered before a single great attack.',
        needsVerification: false,
      },
      {
        name: 'Devastate',
        shortSummary:
          'Three escalating attacks; ramps with each hit. Leverages the determination rule on missed attacks.',
        needsVerification: false,
      },
    ]),
  },
};

// =====================================================================
//                              THE CUR
// HTML images cover only 2 of 6 L1 cards (Low Blow, Throwing Daggers) +
// L5 + L10. L1 Concealment/Backstab/Smoke Bomb/Nightshade, L2, and L15
// are prose-only.
// =====================================================================
const curRange: [number, number] = [40, 45];
const cur: OathswornCharacter = {
  id: 'cur',
  slug: 'cur',
  name: 'The Cur',
  displayName: 'Cur',
  role: 'Rogue / Builder-Spender / Burst Damage',
  playstyle:
    'Lightly armoured rogue who builds Lethality tokens, manipulates positioning, layers poison/interrupts, and unloads into burst finishers.',
  art: 'characters/cur/art.png',
  specialAbility: [
    {
      title: 'Lethality',
      text:
        'You gain lethality tokens (skull) from abilities. Before using an ability, you may expend up to 5 of these to empower it. 1 / 2 / 3 / 4 / 5 skulls = +1 / +2 / +4 / +7 / +10 Empowered.',
    },
  ],
  canEquip: 'Cloth and Leather Armor, All 1-Handed weapons.',
  level1Abilities: [
    buildCd0Placeholder('cur', curRange),
    ...buildLevel1('cur', curRange, [
    {
      name: 'Concealment',
      cooldown: 1,
      shortSummary:
        "Synergistic with Backstab from the rear; alternate effect makes the Cur untargetable when in an enemy's rear. (PDF prose only.)",
      cardImage: null,
    },
    {
      name: 'Backstab',
      cooldown: 1,
      shortSummary:
        'Rear attack combo with Concealment — +5 damage redrawable strike that nets 2 lethality tokens. (PDF prose only.)',
      cardImage: null,
    },
    {
      name: 'Low Blow',
      cooldown: 2,
      shortSummary:
        'Survivability when you or a friend get whacked by a big hit, especially on enemy 1-2 big-card draws.',
      needsVerification: false,
      positionInLevel: 1,
    },
    {
      name: 'Throwing Daggers',
      cooldown: 2,
      shortSummary:
        'Minion-clearing unarmed multi-attack; uses extra red rather than weapon might. Solid Lethality builder.',
      needsVerification: false,
      positionInLevel: 2,
    },
    {
      name: 'Smoke Bomb',
      cooldown: 3,
      shortSummary:
        'Lifeline for any Free Company member within range 3 — pricey because the 3-defense buff is huge while ready. (PDF prose only.)',
      cardImage: null,
    },
    {
      name: 'Nightshade',
      cooldown: 3,
      shortSummary:
        'First poison effect: saps the enemy so you can break locations without taking the reaction damage. (PDF prose only.)',
      cardImage: null,
    },
  ])],
  unlockedAbilities: {
    level2: buildUnlocked('cur', curRange, 2, [
      {
        name: 'Blind',
        shortSummary:
          'Turn the enemy to present the side you need; the crit reduces defense for a damage boost. (PDF prose only.)',
        cardImage: null,
      },
      {
        name: 'Dodge',
        shortSummary:
          'Calculated guess with a fine window: ignore all the damage. Less random than it looks once you know breakpoints. (PDF prose only.)',
        cardImage: null,
      },
    ]),
    level5: buildUnlocked('cur', curRange, 5, [
      {
        name: 'Swiftness',
        shortSummary:
          'Cheap cooldown-2 movement card; battleflows your other 2-cooldown cards back into hand quickly.',
        needsVerification: false,
      },
      {
        name: 'Bloodthorn',
        shortSummary:
          'Second poison: stacking bleed token that loses additional HP on each future trigger. Strong vs high-defense or low-HP humanoids.',
        needsVerification: false,
      },
    ]),
    level10: buildUnlocked('cur', curRange, 10, [
      {
        name: 'Bullseye',
        shortSummary:
          "Rare ranged effect that affects the enemy's damage at range — your team will thank you for the redirected hits.",
        needsVerification: false,
      },
      {
        name: 'Death of a Thousand Cuts',
        shortSummary:
          'Big finisher: fully loaded you can draw half a dozen blacks, each with a high chance of HP loss regardless of defense.',
        needsVerification: false,
      },
    ]),
    level15: buildUnlocked('cur', curRange, 15, [
      {
        name: 'Shadowrun',
        shortSummary:
          'Multi-target opener that builds Lethality while culling minions — perfect setup for a finisher. (PDF prose only.)',
        cardImage: null,
      },
      {
        name: 'Amber Bomb',
        shortSummary:
          'Maximum carnage explosive — keep your fingers crossed and stay clear of friendlies. (PDF prose only.)',
        cardImage: null,
      },
    ]),
  },
};

// =====================================================================
//                          THE PENITENT
// HTML images confirm all 6 L1 cards INCLUDING two new ones not in PDF
// prose: REVENGE (cooldown 1, paired with Guard) and INTERCESSION
// (cooldown 2, paired with Sweep). L2 confirmed; L5/L10/L15 prose-only.
// =====================================================================
const penitentRange: [number, number] = [46, 50];
const penitent: OathswornCharacter = {
  id: 'penitent',
  slug: 'penitent',
  name: 'The Penitent',
  displayName: 'Penitent',
  role: 'Tank / Self-Sacrifice / Damage',
  playstyle:
    'Armoured self-sacrifice frontliner. Turns lost HP into Empower tokens; protects allies, lays down heavy blows.',
  art: 'characters/penitent/art.jpg',
  specialAbility: [
    { title: 'Penance', text: 'For each 1 HP you lose, gain a 3x Empower token.' },
  ],
  canEquip:
    'All Armor, Shields. All 1-Hand and 2-Hand weapons except Daggers, Staffs, and Bows.',
  level1Abilities: [
    buildCd0Placeholder('penitent', penitentRange),
    ...buildLevel1('penitent', penitentRange, [
    {
      name: 'Guard',
      cooldown: 1,
      shortSummary:
        '0-Animus interrupt that defends an ally — also gives free movement for both 2-handed and sword-and-board Penitent builds.',
      needsVerification: false,
    },
    {
      name: 'Revenge',
      cooldown: 1,
      shortSummary:
        'Counter-attack triggered after the Penitent loses HP from an enemy — confirmed via card image (paired with Guard at cooldown 1).',
      needsVerification: false,
    },
    {
      name: 'Sweep',
      cooldown: 2,
      shortSummary:
        'Multi-target attack with free movement — chain with Guard to net 4 free Animus of movement in the right setup.',
      needsVerification: false,
    },
    {
      name: 'Intercession',
      cooldown: 2,
      shortSummary:
        "Healing/intercession: select an adjacent friendly character and transfer HP — confirmed via card image. The PDF prose's 'On the intercession side…' paragraph refers to this card.",
      needsVerification: false,
    },
    {
      name: 'Shield Bash',
      cooldown: 3,
      shortSummary:
        'Knockback attack — collide enemies into other things to deal extra damage and control the field.',
      needsVerification: false,
    },
    {
      name: 'Taunt',
      cooldown: 3,
      shortSummary:
        "Tank staple: forces an enemy to target the Penitent; one of the best ways to save a teammate's life.",
      needsVerification: false,
    },
  ])],
  unlockedAbilities: {
    level2: buildUnlocked('penitent', penitentRange, 2, [
      {
        name: 'Repel',
        shortSummary:
          "Cheap, low-cooldown knockback (no attack) that scales with how low the Penitent's HP is.",
        needsVerification: false,
      },
      {
        name: 'Judgement',
        shortSummary:
          'Throw your melee weapon/shield as a projectile for huge damage — the weapon falls in an adjacent hex, so plan your retrieval.',
        needsVerification: false,
      },
    ]),
    level5: buildUnlocked('penitent', penitentRange, 5, [
      {
        name: 'Death Wish',
        shortSummary:
          "One of the most damaging attacks in the game — but you're asking for it if anyone survives. (PDF prose only.)",
        cardImage: null,
      },
      {
        name: 'Blessing',
        shortSummary:
          'Large Free Company bonus that becomes cheaper depending on how much HP you have already lost. (PDF prose only.)',
        cardImage: null,
      },
    ]),
    level10: buildUnlocked('penitent', penitentRange, 10, [
      {
        name: 'Zeal',
        shortSummary:
          'High-damage single-target hit that scales when the Penitent is on low health — favoured by 2-handed builds. (PDF prose only.)',
        cardImage: null,
      },
      {
        name: 'Intervention',
        shortSummary:
          'Save someone\'s life and gain anger doing it — Witch and Ranger players will owe you. (PDF prose only.)',
        cardImage: null,
      },
    ]),
    level15: buildUnlocked('penitent', penitentRange, 15, [
      {
        name: 'Reflection',
        shortSummary:
          "Use the enemy's might against them — especially helpful when they are several tons of muscle and spikes. (PDF prose only.)",
        cardImage: null,
      },
      {
        name: 'Righteous Strike',
        shortSummary:
          "Holy-warrior style: any redraw lets you dig deeper into the Might Deck. Gets cheap when you're low on HP. (PDF prose only.)",
        cardImage: null,
      },
    ]),
  },
};

// =====================================================================
//                       THE AVI HARBINGER
// HTML images cover 2 of 6 L1 (Deadeye Shot, One Soul) + L5 + L10 + L15.
// Backstab/Prophetic Fulfilment/Foreshadowing/Prescient Strike + L2 are
// prose-only.
// =====================================================================
const harbingerRange: [number, number] = [51, 55];
const harbinger: OathswornCharacter = {
  id: 'avi-harbinger',
  slug: 'avi-harbinger',
  name: 'The Avi Harbinger',
  displayName: 'Avi Harbinger',
  role: 'Support / Prediction / Ranged Utility',
  playstyle:
    'Predictive support/damage character; manipulates enemy decks, hands out tokens, executes ranged interrupts and damage redirection.',
  art: 'characters/avi-harbinger/art.jpeg',
  specialAbility: [
    {
      title: 'Preternatural Swiftness',
      text:
        'Once per game during your turn, you may move any distance for free without moving through the intervening hexes.',
    },
  ],
  canEquip: 'Cloth Armor, Daggers, Staffs, and 2-Hand Polearms.',
  level1Abilities: [
    buildCd0Placeholder('avi-harbinger', harbingerRange),
    ...buildLevel1('avi-harbinger', harbingerRange, [
    {
      name: 'Backstab',
      cooldown: 1,
      shortSummary:
        'Hard-hitting positional melee strike; offset the positional requirement with Preternatural Swiftness and Avi Animus regen. (PDF prose only.)',
      cardImage: null,
    },
    {
      name: 'Prophetic Fulfilment',
      cooldown: 1,
      shortSummary:
        'Predict who will be hurt soon. If you guess right, the next time you use this card the target gains 1 HP — precious in Oathsworn. (PDF prose only.)',
      cardImage: null,
    },
    {
      name: 'Foreshadowing',
      cooldown: 2,
      shortSummary:
        'Hand out a combat token and twist the enemy Stage Deck toward Stage Cards that favour your board state. (PDF prose only.)',
      cardImage: null,
    },
    {
      name: 'Prescient Strike',
      cooldown: 2,
      shortSummary:
        'Bet on accuracy for bonus damage, or trust the deck and redraw on a miss — either way, getting it right pays out. (PDF prose only.)',
      cardImage: null,
    },
    {
      name: 'Deadeye Shot',
      cooldown: 3,
      shortSummary:
        'One of the strongest ranged interrupts in the game — saves friends at range, rarely yourself.',
      needsVerification: false,
      positionInLevel: 1,
    },
    {
      name: 'One Soul',
      cooldown: 3,
      shortSummary:
        'Spike-mitigation: redistribute HP loss across the team to keep everyone above unconsciousness.',
      needsVerification: false,
      positionInLevel: 2,
    },
  ])],
  unlockedAbilities: {
    level2: buildUnlocked('avi-harbinger', harbingerRange, 2, [
      {
        name: 'Quill Throw',
        shortSummary:
          'Avi feathers as projectiles: helpful crowd damage at range when minions threaten the Free Company. (PDF prose only.)',
        cardImage: null,
      },
      {
        name: 'Wingslam',
        shortSummary:
          'Knockback utility that triggers collision HP loss; combos with Preternatural Swiftness for big plays. (PDF prose only.)',
        cardImage: null,
      },
    ]),
    level5: buildUnlocked('avi-harbinger', harbingerRange, 5, [
      {
        name: 'Quickening',
        shortSummary:
          'Extra movement and battleflow for comrades — gets their abilities back into hand faster.',
        needsVerification: false,
      },
      {
        name: 'Syphon Spirit',
        shortSummary:
          'Predict damage on one ally and grant a HP to another. More potent than One Soul, but only on a correct guess.',
        needsVerification: false,
      },
    ]),
    level10: buildUnlocked('avi-harbinger', harbingerRange, 10, [
      {
        name: 'Soul Tie',
        shortSummary:
          "Karmic damage: turn your party's HP loss into damage on the enemy who caused it. (Card title bar renders very tightly as 'SOULTIE'.)",
        needsVerification: false,
      },
      {
        name: 'Dodge',
        shortSummary:
          'Calculated guess to ignore damage — helps the cloth-wearing Harbinger survive melee scrums.',
        needsVerification: false,
      },
    ]),
    level15: buildUnlocked('avi-harbinger', harbingerRange, 15, [
      {
        name: 'Windwalk',
        shortSummary:
          "Largest range of any chain attack with the most targets — dive across the board on death's wings.",
        needsVerification: false,
      },
      {
        name: 'Fateweaver',
        shortSummary:
          'Possibly the strongest protective ability in the game: negate ALL HP loss on a character within range 4 if you guess the amount correctly.',
        needsVerification: false,
      },
    ]),
  },
};

// =====================================================================
//                            THE BLADE
//                    (asset name: Thracian Blade)
// HUGE upgrade from the previous pass. HTML images give us:
//   L1 (6 cards confirmed): Charging Boar, Roll, Winnowing Strike,
//        Somersault, Mules Regard, Cleaving Slide
//   L2 (2): Master Parry (the previously-unnamed defensive card),
//        Weapon Throw
//   L5 (2): Rising Tusk, Cross Cut
//   L15 (2): Perfect Form, Blade Call (previously empty)
// L10 (Nightfall, Blade Dance) is still prose-only.
// =====================================================================
const bladeRange: [number, number] = [56, 61];
const blade: OathswornCharacter = {
  id: 'thracian-blade',
  slug: 'thracian-blade',
  name: 'The Blade',
  displayName: 'Thracian Blade',
  role: 'Stance-Based Melee Damage',
  playstyle:
    'Arena-trained melee combatant whose abilities depend on current stance: Any, Boar, Viper, or Ox.',
  art: 'characters/thracian-blade/art.png',
  specialAbility: [
    {
      title: 'Blade Stances',
      text:
        'You are always in one of three stances that correlate to your cooldown positions: Any, Boar, Viper, or Ox. Which stance you are in depends on which cooldown position has the most cards. If two or more tie for the most cards, you may choose between them. Stances are determined just before the ability is played.',
    },
  ],
  canEquip:
    'All Armor. All 1-Hand and 2-Hand weapons except Daggers, Staffs, and Bows.',
  level1Abilities: [
    buildCd0Placeholder('thracian-blade', bladeRange),
    ...buildLevel1('thracian-blade', bladeRange, [
    {
      name: 'Charging Boar',
      cooldown: 1,
      shortSummary:
        'Move 3 in a straight line and attack. The PDF intro explicitly cites this card as the example starring a star icon ("starting card for that class").',
      needsVerification: false,
    },
    {
      name: 'Roll',
      cooldown: 1,
      shortSummary:
        'Cheap mobility on a 1-cooldown slot — keeps your battleflow going and repositions out of trouble or into setup.',
      needsVerification: false,
    },
    {
      name: 'Winnowing Strike',
      cooldown: 2,
      shortSummary:
        'Area-of-Effect attack from the Blade — paired with Somersault at cooldown 2. (Confirmed via HTML card image.)',
      needsVerification: false,
    },
    {
      name: 'Somersault',
      cooldown: 2,
      shortSummary:
        '360-degree attack: vault over a target enemy to kick a secondary into a third — potentially killing both — then strike the original target.',
      needsVerification: false,
    },
    {
      name: 'Mules Regard',
      cooldown: 3,
      shortSummary:
        "Defensive interrupt — turn an enemy's blow back on them after they draw damage. (Card title bar renders without an apostrophe.)",
      needsVerification: false,
    },
    {
      name: 'Cleaving Slide',
      cooldown: 3,
      shortSummary:
        'Big lining-up attack: charge through a line of minions into the boss, perfect setup for a follow-up Somersault.',
      needsVerification: false,
    },
  ])],
  unlockedAbilities: {
    level2: buildUnlocked('thracian-blade', bladeRange, 2, [
      {
        name: 'Master Parry',
        shortSummary:
          'Use instead of playing a defence — the previously-unnamed L2 "circumvent damage" card. (Confirmed via HTML card image.)',
        needsVerification: false,
      },
      {
        name: 'Weapon Throw',
        shortSummary:
          'Throw your weapon for big damage — in Viper stance, throw it while running, impale a foe, and retrieve it before it hits the ground.',
        needsVerification: false,
      },
    ]),
    level5: buildUnlocked('thracian-blade', bladeRange, 5, [
      {
        name: 'Rising Tusk',
        shortSummary:
          'Cheap and very powerful in the right position — 1 defense reduction can double your HP loss vs the target.',
        needsVerification: false,
      },
      {
        name: 'Cross Cut',
        shortSummary:
          "Two empowered attacks; high Animus cost slows your battleflow but the damage ruins the enemy's day.",
        needsVerification: false,
      },
    ]),
    level10: buildUnlocked('thracian-blade', bladeRange, 10, [
      {
        name: 'Nightfall',
        shortSummary:
          'Coup de grâce that takes perfect timing for the best result. (PDF prose only.)',
        cardImage: null,
      },
      {
        name: 'Blade Dance',
        shortSummary:
          'Devastating chain attack — full damage on the first target, then drops the lowest card per successive enemy. Go big or go home. (PDF prose only.)',
        cardImage: null,
      },
    ]),
    level15: buildUnlocked('thracian-blade', bladeRange, 15, [
      {
        name: 'Perfect Form',
        shortSummary:
          'Use instead of playing a defence — the L15 defensive masterstroke previously left empty. (Confirmed via HTML card image.)',
        needsVerification: false,
      },
      {
        name: 'Blade Call',
        shortSummary:
          'You and an adjacent enemy attack each — the L15 stance-empowered duel previously left empty. (Confirmed via HTML card image.)',
        needsVerification: false,
      },
    ]),
  },
};

// =====================================================================
//                       THE GROVE MAIDEN
//                (asset name: A'Dendri Grove Maiden)
// HTML images cover only L2/L5/L10. L1 (Raise Sentinel etc.) and L15
// (Grove Song, Needle Storm) are prose-only. Card title rendered as
// "EXPLODING SPORE" (singular) — corrected from "Exploding Spores".
// =====================================================================
const groveRange: [number, number] = [62, 69];
const grove: OathswornCharacter = {
  id: 'adendri-grove-maiden',
  slug: 'adendri-grove-maiden',
  name: 'The Grove Maiden',
  displayName: "A'Dendri Grove Maiden",
  role: 'Summoner / Area Damage / Sentinel Control',
  playstyle:
    'Bioform summoner using Sentinel turrets and an Ancient Guardian. Glass-cannon controller who scales by stacking Sentinels in range.',
  art: 'characters/adendri-grove-maiden/art.jpg',
  specialAbility: [
    {
      title: 'Sentinels & Ancient Guardian',
      text:
        'You create Sentinel turrets and may have an Ancient Guardian to protect you. You may move through your Sentinels, but may not stop on them. You cannot use weapons; instead you may carry two gear cards. Your might is based on your level: 1=0, 2-8=Yellow, 9-14=Red, 15+=Black.',
    },
  ],
  canEquip: 'Cloth Armor. No weapons.',
  level1Abilities: [
    buildCd0Placeholder('adendri-grove-maiden', groveRange),
    ...buildLevel1('adendri-grove-maiden', groveRange, [
    {
      name: 'Raise Sentinel',
      cooldown: 1,
      shortSummary:
        "Cheap Sentinel summon — the engine of the Grove Maiden's build. Reminder rules are printed on the card. (PDF prose only.)",
      cardImage: null,
    },
    {
      name: 'Volley',
      cooldown: 1,
      shortSummary:
        'Mob killer using all your Sentinels at close range. +1 Damage per target up to ~+6 vs a group of 6 mobs. (PDF prose only.)',
      cardImage: null,
    },
    {
      name: 'Thundering Giant',
      cooldown: 2,
      shortSummary:
        'Ancient Guardian charges in a straight line, smashing through anything in its path — repositions the Guardian for free. (PDF prose only.)',
      cardImage: null,
    },
    {
      name: 'Life Bloom',
      cooldown: 2,
      shortSummary:
        "Significant Animus transfer to the Free Company at a cost; particularly efficient when the Guardian is already on death's door. (PDF prose only.)",
      cardImage: null,
    },
    {
      name: "Nature's Fury",
      cooldown: 3,
      shortSummary:
        'Scales with your Sentinels — full field of 8 turrets nets +8 Damage at range 4, attack cannot miss. (PDF prose only.)',
      cardImage: null,
    },
    {
      name: 'Thorns',
      cooldown: 3,
      shortSummary:
        '"Take you down with me" retaliation — particularly deadly when the Ancient Guardian eats a big hit for you. (PDF prose only.)',
      cardImage: null,
    },
  ])],
  unlockedAbilities: {
    level2: buildUnlocked('adendri-grove-maiden', groveRange, 2, [
      {
        name: 'Grasping Roots',
        shortSummary:
          'Drag an enemy in front of your Sentinels for point-blank fire — also rams things into trees or other enemies.',
        needsVerification: false,
      },
      {
        name: 'Uproot',
        shortSummary:
          "Reposition Sentinels when they're in the wrong place — useful, but limits how many can attack that round.",
        needsVerification: false,
      },
    ]),
    level5: buildUnlocked('adendri-grove-maiden', groveRange, 5, [
      {
        name: 'Bioform Protector',
        shortSummary:
          'Temporarily makes the Guardian a tank — step in to save a dying ally. Free Battleflow alternative on the card.',
        needsVerification: false,
      },
      {
        name: 'Exploding Spore',
        shortSummary:
          'Huge range, big damage potential, and a chance the spore drifts over allies. Use redraws to mitigate the risk. (Card title is singular "Spore".)',
        needsVerification: false,
      },
    ]),
    level10: buildUnlocked('adendri-grove-maiden', groveRange, 10, [
      {
        name: 'Verdant Explosion',
        shortSummary:
          'Targeted explosion at the cost of range and a summon. Detonate the Ancient Guardian next to the boss for maximum mayhem.',
        needsVerification: false,
      },
      {
        name: 'Essence Infusion',
        shortSummary:
          'Spend Sentinels to empower the Ancient Guardian — get late-game value out of out-of-position turrets.',
        needsVerification: false,
      },
    ]),
    level15: buildUnlocked('adendri-grove-maiden', groveRange, 15, [
      {
        name: 'Grove Song',
        shortSummary:
          '6 Animus: place 3 additional turrets, move the Ancient Guardian, and full attack with all Sentinels close to the Guardian. (PDF prose only.)',
        cardImage: null,
      },
      {
        name: 'Needle Storm',
        shortSummary:
          'Cone attack from the Grove Maiden; with 5-6 Sentinels in range it scales to a Range 7-8 cone covering the whole board. (PDF prose only.)',
        cardImage: null,
      },
    ]),
  },
};

// =====================================================================
//                           THE HUNTRESS
// HTML images cover all 6 L1 cards + 2 of 4 L5 (Flank Attack, Eagle Eye
// Shot) + 2 of 3 L10 (Lunge, Piercing Arrow). L2 (Leap Attack, Whistling
// Arrow, Spike Trap), L5 Under the Wing/Amber Satchel Charge, L10 Eye
// Gouge, and L15 are prose-only.
// =====================================================================
const huntressRange: [number, number] = [70, 77];
const huntress: OathswornCharacter = {
  id: 'huntress',
  slug: 'huntress',
  name: 'The Huntress',
  displayName: 'Huntress',
  role: 'Damage / Support / Falconry',
  playstyle:
    'Versatile bow/blade noblewoman; commands two great falcons for ranged support, hindering, guaranteed damage, traps, and movement buffs. 20-card expanded deck.',
  art: 'characters/huntress/art.jpeg',
  specialAbility: [
    {
      title: 'Falconer',
      text:
        'You have 2 great falcon miniatures that begin each encounter on your Player Board. Abilities allow you to move them to other targets. If your falcons are on the correct target, they trigger effects on your Ability Cards. See Appendix III in the Encounter Rule Book for full rules.',
    },
  ],
  canEquip: 'Cloth and Leather Armor. Bows, Spears, and Polearms.',
  level1Abilities: [
    buildCd0Placeholder('huntress', huntressRange),
    ...buildLevel1('huntress', huntressRange, [
    {
      name: 'Rile and Rake',
      cooldown: 1,
      shortSummary:
        'Bleed-and-distract opener that sets up bigger abilities later. Works with bow or blade builds.',
      needsVerification: false,
    },
    {
      name: "Hunter's Call",
      cooldown: 1,
      shortSummary:
        'Animus-efficient attack and movement buff that helps you and your team close distance to the enemy.',
      needsVerification: false,
    },
    {
      name: 'Swoop',
      cooldown: 2,
      shortSummary:
        "Guaranteed ranged falcon attack at low Animus cost — the falcon does the work, can't miss, target anyone on the board.",
      needsVerification: false,
    },
    {
      name: 'Clamp On',
      cooldown: 2,
      shortSummary:
        'Versatile movement buff or Knockback to close distance or open it. Knockback collisions trigger HP loss on everyone involved.',
      needsVerification: false,
    },
    {
      name: 'Hinder',
      cooldown: 3,
      shortSummary:
        "Falcons dive into the enemy's face to defend a friend at range — strong life-saver.",
      needsVerification: false,
    },
    {
      name: 'Flight of Feathers',
      cooldown: 3,
      shortSummary:
        'Offensive falcon damage tool with guaranteed damage on the target. Strong vs dispersed packs.',
      needsVerification: false,
    },
  ])],
  unlockedAbilities: {
    level2: buildUnlocked('huntress', huntressRange, 2, [
      {
        name: 'Leap Attack',
        shortSummary:
          'Recall a falcon for free while attacking — begins the casting/recalling rhythm central to the falconry build. (PDF prose only.)',
        cardImage: null,
      },
      {
        name: 'Whistling Arrow',
        shortSummary:
          'Bow attack that recalls a falcon for free — keeps the falcons in rotation. (PDF prose only.)',
        cardImage: null,
      },
      {
        name: 'Spike Trap',
        shortSummary:
          "Trap whose damage scales with the target's movement; lure a monster over it (e.g. by breaking a HP die) for huge output. (PDF prose only.)",
        cardImage: null,
      },
    ]),
    level5: buildUnlocked('huntress', huntressRange, 5, [
      {
        name: 'Flank Attack',
        shortSummary:
          'Huge attack if positioned correctly at the start of your charge.',
        needsVerification: false,
      },
      {
        name: 'Eagle Eye Shot',
        shortSummary:
          'Very long-range attack that can also bring back a falcon at the same time.',
        needsVerification: false,
      },
      {
        name: 'Under the Wing',
        shortSummary:
          'Defensive buff usable without a falcon already on target; strong alternative effects help battleflow other cards. (PDF prose only.)',
        cardImage: null,
      },
      {
        name: 'Amber Satchel Charge',
        shortSummary:
          "Place-and-detonate explosive (think Cur's Amber Bomb) — requires two plays of the card. Warn your team before lighting it. (PDF prose only.)",
        cardImage: null,
      },
    ]),
    level10: buildUnlocked('huntress', huntressRange, 10, [
      {
        name: 'Lunge',
        shortSummary:
          'Double attack for a blade-wielding Huntress — great for skewering large targets.',
        needsVerification: false,
      },
      {
        name: 'Piercing Arrow',
        shortSummary:
          'Bow equivalent of Lunge: line enemies up to take out multiple targets at once.',
        needsVerification: false,
      },
      {
        name: 'Eye Gouge',
        shortSummary:
          'Falcon ability: -1 Defense + Battleflow for 0 Animus. Damage divided by reduced defense ≈ 50% damage increase. (PDF prose only.)',
        cardImage: null,
      },
    ]),
    level15: buildUnlocked('huntress', huntressRange, 15, [
      {
        name: 'Falcon Strike',
        shortSummary:
          'Big chain attack — can take down up to 6 enemies if the situation lines up. (PDF prose only.)',
        cardImage: null,
      },
      {
        name: 'Tandem Strike',
        shortSummary:
          '2 redraws and a recall — push from a 5-card draw to a 10-card draw, perfect for stacked empowers vs big HP pools. (PDF prose only.)',
        cardImage: null,
      },
      {
        name: 'Death Dive',
        shortSummary:
          'Both falcons hurtle at a single target as twin comets: an 8-card attack that cannot miss. (PDF prose only.)',
        cardImage: null,
      },
    ]),
  },
};

// =====================================================================
//                           Final export
// =====================================================================
export const oathswornDb: OathswornCharacter[] = [
  warden,
  ursus,
  witch,
  priest,
  ranger,
  exile,
  cur,
  penitent,
  harbinger,
  blade,
  grove,
  huntress,
];

export const findOathswornCharacter = (
  slug: string,
): OathswornCharacter | undefined => oathswornDb.find((c) => c.slug === slug);

// ---------------------------------------------------------------------
//                       Validation report
// ---------------------------------------------------------------------

export type ValidationReport = {
  totals: {
    characters: number;
    abilities: number;
    needsVerification: number;
    confirmed: number;
    duplicateNames: number;
  };
  perCharacter: {
    name: string;
    slug: string;
    level1Count: number;
    level1Names: string[];
    level2Count: number;
    level5Count: number;
    level10Count: number;
    level15Count: number;
    confirmedCount: number;
    needsVerificationCount: number;
    warnings: string[];
  }[];
  globalWarnings: string[];
  duplicateAbilityIds: string[];
  duplicateAbilityNamesAcrossCharacters: { name: string; slugs: string[] }[];
};

// Expected Level-1 ability count per character (after the cooldown-0
// placeholder is included). 7 = 1 cd0 + 2 cd1 + 2 cd2 + 2 cd3.
const EXPECTED_LEVEL_COUNTS: Record<string, number> = {
  default: 7,
  witch: 11,
  // The Ursus and Scar Tribe Exile L1 prose names only one cooldown-3
  // card each; the second cooldown-3 slot has no readable name and is
  // intentionally omitted (per rule 8 — no guessing).
  'ursus-warbear': 6,
  'scar-tribe-exile': 6,
};

export function buildValidationReport(): ValidationReport {
  const allAbilities: OathswornAbility[] = oathswornDb.flatMap((c) => [
    ...c.level1Abilities,
    ...c.unlockedAbilities.level2,
    ...c.unlockedAbilities.level5,
    ...c.unlockedAbilities.level10,
    ...c.unlockedAbilities.level15,
  ]);

  const idCounts = new Map<string, number>();
  for (const a of allAbilities) idCounts.set(a.id, (idCounts.get(a.id) ?? 0) + 1);
  const duplicateAbilityIds = [...idCounts.entries()]
    .filter(([, n]) => n > 1)
    .map(([id]) => id);

  const namesBySlug = new Map<string, Set<string>>();
  for (const a of allAbilities) {
    const set = namesBySlug.get(a.name) ?? new Set<string>();
    set.add(a.characterSlug);
    namesBySlug.set(a.name, set);
  }
  const duplicateAbilityNamesAcrossCharacters = [...namesBySlug.entries()]
    .filter(([, slugs]) => slugs.size > 1)
    .map(([name, slugs]) => ({ name, slugs: [...slugs].sort() }));

  const perCharacter = oathswornDb.map((c) => {
    const warnings: string[] = [];
    const expected = EXPECTED_LEVEL_COUNTS[c.slug] ?? EXPECTED_LEVEL_COUNTS.default;
    if (c.level1Abilities.length < expected) {
      warnings.push(
        `Level 1 has ${c.level1Abilities.length} abilities (expected ~${expected}; cooldown-0 starter is omitted everywhere).`,
      );
    }
    const allChar = [
      ...c.level1Abilities,
      ...c.unlockedAbilities.level2,
      ...c.unlockedAbilities.level5,
      ...c.unlockedAbilities.level10,
      ...c.unlockedAbilities.level15,
    ];
    const verificationCount = allChar.filter((a) => a.needsVerification).length;
    const confirmedCount = allChar.filter((a) => !a.needsVerification).length;
    if (verificationCount > 0) {
      warnings.push(
        `${verificationCount} ability/abilities still need verification (no card image yet, name from PDF prose only).`,
      );
    }
    return {
      name: c.name,
      slug: c.slug,
      level1Count: c.level1Abilities.length,
      level1Names: c.level1Abilities.map((a) => a.name),
      level2Count: c.unlockedAbilities.level2.length,
      level5Count: c.unlockedAbilities.level5.length,
      level10Count: c.unlockedAbilities.level10.length,
      level15Count: c.unlockedAbilities.level15.length,
      confirmedCount,
      needsVerificationCount: verificationCount,
      warnings,
    };
  });

  const globalWarnings: string[] = [];
  if (duplicateAbilityIds.length > 0) {
    globalWarnings.push(
      `Duplicate ability ids detected (must be unique): ${duplicateAbilityIds.join(', ')}`,
    );
  }
  if (duplicateAbilityNamesAcrossCharacters.length > 0) {
    globalWarnings.push(
      `Cross-character ability name duplicates (intentional — preserved as separate entries per user rules): ${duplicateAbilityNamesAcrossCharacters
        .map((d) => `${d.name} → ${d.slugs.join(' / ')}`)
        .join('; ')}`,
    );
  }

  const needsVerificationCount = allAbilities.filter((a) => a.needsVerification).length;
  const confirmedCount = allAbilities.length - needsVerificationCount;

  return {
    totals: {
      characters: oathswornDb.length,
      abilities: allAbilities.length,
      needsVerification: needsVerificationCount,
      confirmed: confirmedCount,
      duplicateNames: duplicateAbilityNamesAcrossCharacters.length,
    },
    perCharacter,
    globalWarnings,
    duplicateAbilityIds,
    duplicateAbilityNamesAcrossCharacters,
  };
}

export function formatValidationReport(report: ValidationReport): string {
  const lines: string[] = [];
  lines.push('Oathsworn canonical DB validation report');
  lines.push('========================================');
  lines.push(
    `Characters: ${report.totals.characters} | Abilities: ${report.totals.abilities} | Confirmed: ${report.totals.confirmed} | Needs verification: ${report.totals.needsVerification} | Duplicate names across characters: ${report.totals.duplicateNames}`,
  );
  lines.push('');
  for (const c of report.perCharacter) {
    lines.push(`• ${c.name} [${c.slug}]`);
    lines.push(
      `    L1=${c.level1Count}  L2=${c.level2Count}  L5=${c.level5Count}  L10=${c.level10Count}  L15=${c.level15Count}  | confirmed=${c.confirmedCount}  needsVerification=${c.needsVerificationCount}`,
    );
    lines.push(`    L1 names: ${c.level1Names.join(', ') || '(none)'}`);
    for (const w of c.warnings) lines.push(`    ⚠ ${w}`);
  }
  lines.push('');
  lines.push('Global notes:');
  for (const w of report.globalWarnings) lines.push(`  - ${w}`);
  if (report.globalWarnings.length === 0) lines.push('  - none');
  return lines.join('\n');
}

// Run validation once on module load in dev mode and surface in console.
// In production builds this branch is dead-code-eliminated by Vite.
if (import.meta.env.DEV) {
  const report = buildValidationReport();
  // eslint-disable-next-line no-console
  console.info(formatValidationReport(report));
}
