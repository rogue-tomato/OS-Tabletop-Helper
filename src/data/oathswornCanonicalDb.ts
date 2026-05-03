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
  /** Free-form cost override. When set, used directly as the
   *  display string. Leave undefined and let the adapter compose
   *  "Cooldown N, Animus cost M" from `cooldown` + `animusCost`. */
  cost?: string;
  /** Orange Animus number in the top-left of the card. */
  animusCost?: number;
  defense?: string;
  cardImage?: string;
  /** Optional explicit thumbnail for the grid; CardTile derives one
   *  from `cardImage` if absent. */
  cardImageThumb?: string;
  /** Optional explicit full-resolution master for the lightbox. */
  cardImageFull?: string;
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
  /** Optional dedicated cover/thumb for the character list. Drop a file
   *  at `public/characters/<slug>/cover.webp` and set this field. Falls
   *  back to `art` automatically if the file is missing. */
  listImage?: string;
  /** CSS `object-position` value for the hero image on narrow screens.
   *  Default applied at adapter time is "25% center" (bias toward the
   *  left of the artwork). Set this per-character only when that
   *  default crops badly. */
  heroObjectPositionMobile?: string;
  /** CSS `object-position` for the hero image on wide screens. Default
   *  "center center". */
  heroObjectPositionDesktop?: string;
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
  /** Hidden tags consumed by the home-page search. The user never sees
   *  them — they only widen which queries match (e.g. "tank", "shield",
   *  "bow", "summon"). Free-form lowercase strings. */
  searchTags?: string[];
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
  /** Orange Animus number in the top-left of the card. */
  animusCost?: number;
  /** Free-form cost-string override. Used for cards that show "?"
   *  (variable Animus) instead of a single number on the printed card.
   *  When set, the adapter uses this string verbatim instead of
   *  composing "Cooldown N, Anima cost M" from `cooldown` + `animusCost`. */
  cost?: string;
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
  const filename = `${String(pos).padStart(2, '0')}_${fileSlug(input.name)}.webp`;
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
    animusCost: input.animusCost,
    cost: input.cost,
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

// Note: 1st-edition cooldown-0 placeholder helper was removed in the
// 2nd-edition pass — every character now has a real cooldown-0 starter
// (Measured Blow, Feral Blow, Lash Out, Heavy Blow, Loose Arrow, Primal
// Strike, Shank, Penitent Strike, Talon Strike, Cut, Nature's Call,
// Wind Strike). The manual-fill workflow stays in place for future
// missing cards but is now a no-op for the cd0 starters.

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
  role: 'Tank / Control / Melee DPS',
  playstyle: `On the field the Warden is a master of battle, inspiring and commanding others whilst holding ground and utilising his chains to drag enemies across the board.

Sword and board with a twist anyone? The Warden is the backbone of any Free Company he is in. Bedecked in the heaviest plate and one of only two Oathsworn proficient in the use of a shield, he takes the hits then returns them with interest. Between trading blows, he bellows commands to his companions, keeping others straight-backed as they face the unthinkable. All the while he disciplines his own body allowing him to Battleflow cards at will (moving them around the board one space closer to his hand) and protect himself and others with the Mantle. When the time is right, the chains come out and enemies find themselves dragged across the battlefield or bound in place to let others land the killing blow.

The Warden is perfect choice for those who like defending others and is more than capable tank. If things require a more offensive touch though, you can spec the Warden as a 2 handed soldier who measures his enemies weaknesses and goes in for the kill with abilities like heartseeker and final verdict.`,
  lore: `Deep beneath Verum's infamous Black Rock prison, dark chambers house humanity's most disciplined soldiers. Endlessly training, endlessly testing their resolve. They fortify their wills to stand on the edge of madness and face mankind's most hated foe...magic.

The Wardens are the jailors of madmen, mystics and witches. They wear thick armor and a 'Mantle' that wards against the manipulations of witches. Through great exertion they can even lock down reality around them, securing others against malific intent.

Once the playing field is leveled, a Warden will bring to bear the full might of their years of training. With measured blows and impenetrable defences they will wear the foe down until they finally break against an iron will.`,
  art: 'characters/warden/art.webp',
  specialAbility: [
    { title: 'Discipline', text: 'Once per round, Battleflow one card once.' },
    {
      title: 'The Mantle',
      text: "You may make yourself and any amount of adjacent characters immune to any of your Witch's abilities.",
    },
  ],
  canEquip:
    'All Armor, Shields. All 1-Hand and 2-Hand weapons except Daggers, Staffs, and Bows.',
  level1Abilities: buildLevel1('warden', wardenRange, [
    {
      name: 'Measured Blow',
      cooldown: 0,
      animusCost: 2,
      shortSummary:
        'Mandatory cooldown-0 starter. Attack option, Battleflow one card, Refresh your might decks. You must take this card each encounter.',
      needsVerification: false,
    },
    {
      name: 'Claimed Ground',
      cooldown: 1,
      animusCost: 2,
      shortSummary:
        'Mob-clearing defensive/control card; rewards standing near enemies and holding ground. Combos with the defense token from Arcing Strike.',
      needsVerification: false,
    },
    {
      name: 'Guard',
      cooldown: 1,
      animusCost: 2,
      shortSummary:
        'Interrupt/lifesaver: close distance to a threatened ally for free and protect them with plate and shield.',
      needsVerification: false,
    },
    {
      name: 'Arcing Strike',
      cooldown: 2,
      animusCost: 4,
      shortSummary:
        'Multi-target attack that puts out crowd damage; combos with Claimed Ground via the defense token it generates.',
      needsVerification: false,
    },
    {
      name: 'Chain Drag',
      cooldown: 2,
      animusCost: 2,
      shortSummary:
        'Drag an enemy into range, into obstacles, or into other enemies; strong battlefield-control utility.',
      needsVerification: false,
    },
    {
      name: 'Shield Bash',
      cooldown: 3,
      animusCost: 3,
      shortSummary:
        'Shield attack with guaranteed Knockback 3; useful for collisions, halved-knockback large monsters, and space control.',
      needsVerification: false,
    },
    {
      name: 'Taunt',
      cooldown: 3,
      animusCost: 0,
      shortSummary:
        'Forces an enemy/Stage Card to target the Warden instead of another character. Core tank tool with a cheap attack option.',
      needsVerification: false,
    },
  ]),
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
  role: 'Tank / Melee DPS',
  playstyle: `The Ursus is a hybrid tank/ damage dealer. She is more than capable of taking a blow not because of any man made shield but because of her tough hide and incredible resilience. This is represented by her 'Endurance' special ability that means all of her ability cards have more defense than can be found on the other classes. She may not have the utility and top tier defenses of the Penitent or the Warden but she makes up for it in being able to carve a bloody path across the battlefield. Her many advantages are kept in check by her sheer size. She can hold great reserves of Animus with 9 max but with only 5 animus regen at level 1 she must be careful to plan her movements carefully making best use of her status as the 'Apex Predator'.

Overall the Ursus Warbear is unstoppable wall of teeth, fur and iron that revels in the thick of the fighting. If you can offset her limited Animus regeneration in the early campaign with tokens and items she becomes truly scary as she grows into her full potential. Whether she is primarily taking the pain for the Free Company as a tank or barreling at the enemy full bore, one thing is certain, that white fur won't stay white for long.`,
  lore: `Once in many moons a solitary giant will appear at the gates of a town or city. 8 feet tall and clad in dark armor, an Ursus Warbear is a terrifying sight to behold. Feral potency exudes from these creatures and the promise of violence lurk behind predatory eyes.

The people of the settlements welcome these beings however, as it is known that all that power is directed towards one purpose...the hunt. Ursus live long lives and spend it gaining tales of glory to add to their armor. An Ursus may not wear a piece of armor until they have earned glory enough to etch it in the iron. The more heavily clad a Warbear is, the more hunts they have survived.

Moving from one hunt to the next, Warbears offer themselves freely to Free Companies. Caring not for the humans struggle, they seek only the glory of a new kill to be immortalised in metal.`,
  art: 'characters/ursus-warbear/art.webp',
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
  level1Abilities: buildLevel1('ursus-warbear', ursusRange, [
    {
      name: 'Feral Blow',
      cooldown: 0,
      cost: 'Cooldown 0, Animus cost ?',
      shortSummary:
        'Mandatory cooldown-0 starter. Attack option, Battleflow one card, Refresh your might decks. You must take this card each encounter.',
      needsVerification: false,
    },
    {
      name: 'Feral Roar',
      cooldown: 1,
      animusCost: 3,
      shortSummary:
        'Movement / inspiration opener: move yourself 4 for 3 Animus with a friend, or distribute Empowered x3 tokens to allies.',
      needsVerification: false,
    },
    {
      name: 'Swipe',
      cooldown: 1,
      animusCost: 4,
      shortSummary:
        'Cleave-style melee attack — hits multiple enemies, gaining +1 damage per additional target. Excellent in council fights.',
      needsVerification: false,
    },
    {
      name: 'Iron Hide',
      cooldown: 2,
      animusCost: 1,
      shortSummary:
        'Cheap 1-Animus engine card on cooldown 2: defense token or 2 movement, plus battleflow on cooldown 2 to cycle big 3s.',
      needsVerification: false,
    },
    {
      name: 'Toss',
      cooldown: 2,
      animusCost: 4,
      shortSummary:
        'Pick an enemy up and throw them into a second who stumbles into a third — strong mob/council clear if positioned well.',
      needsVerification: false,
    },
    {
      name: 'Bite',
      cooldown: 3,
      animusCost: 0,
      shortSummary:
        "After an adjacent enemy draws damage, ignore one of the enemy's might cards (your choice). Costs +Animus.",
      needsVerification: false,
    },
    {
      name: 'Challenge',
      cooldown: 3,
      animusCost: 0,
      shortSummary:
        'Tanking tool: deliberately take a blow for an ally / claim enemy attention. Saves lives in high-difficulty play.',
      needsVerification: false,
    },
  ]),
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
  role: 'Range DPS / AoE / Control',
  playstyle: `On the battlefield, Witches have a vast array of extremely powerful abilities beyond the potency of mundane iron. Witchcraft requires the elements though. A witch cannot conjure fire and water from thin air, she must draw it forth from her surroundings. The witch has a special ability to use her water skin and flaming torch to begin placing elemental hexes.

The Witch brings a new mechanism to your Free Company in the form of the elements. To power her unparalleled abilities the Witch must first have the necessary elements present to warp and magnify. To do this all elemental Witches carry two items into combat, a flaming torch and a waterskin. Once per round she may set a fire or spill some water to create a fire or water tile. Once the seed of the element is sown she may then spread the element to surrounding hexes drawing on the osmotic or thermal potential of the tile. Then, when the time's right, she may consume the element, transforming it into incinerating waves or the raw power of lightning.

Unique ability deck: The Witch has an expanded ability set compared to most other classes and has 22 rather 15 cards to play with. This allows you pick a hard fire or ice Witch, a telekinetic hybrid or a dual element Witch how get the best of all worlds at the price of a more careful juggling act with her elements.

Unchained, the Witch is an elemental force to be reckoned with. She is a 4 star complexity character and has some extra things to get to grips with but if you do, she's got unmatched AoE (Area of Effect) capabilities. Watch out for friendly fire and your supply of elements and you'll be OK. Then all you have to worry about is whether to Blast 'em, Blister 'em, Bounce 'em, or Burn 'em.`,
  lore: `In every generation there are a few cursed individuals who are doomed to be hunted and hated by their own kind...the witches. Few survive the manifestation of their powers and tradegy often follows as they struggle to control their wild abilities. Those that do survive wield fantastic powers, able to warp reality and bend the laws of nature to their will.

It is this power that attracts the Wardens, who shackle any they find. Once collared, the witches find themselves on the front line of mankind's fight for survival, their Warden dragging them into the Deepwood to fight nightmares.

Not all witches fall prey to this fate though. People whisper of witches hiding in plain sight, even hiding amongst the Free Companies. There they unleash their ruinous powers under the Deepwood's shadow, beyond the sight of the Wardens and Watchers.`,
  art: 'characters/witch/art.webp',
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
      name: 'Lash Out',
      cooldown: 0,
      cost: 'Cooldown 0, Animus cost ?',
      shortSummary:
        'Basic non-element starter (★). Range-3 attack option, Battleflow one card, Refresh your might decks, plus place an Ice or Fire tile in an empty adjacent hex. You must take this card each encounter.',
      needsVerification: false,
    },
    {
      name: 'Elemental Suffusion',
      cooldown: 1,
      animusCost: 2,
      shortSummary:
        'Basic non-element starter (★). Bolsters your supply of elemental tiles; enables high-cost hybrid builds in late game.',
      needsVerification: false,
    },
    {
      name: 'Chain Lightning',
      cooldown: 2,
      animusCost: 3,
      shortSummary:
        "Ice spell. Decimates single and multi-target situations; the Warden's mantle lets the chain bounce back even with one enemy.",
      needsVerification: false,
    },
    {
      name: 'Fireflies',
      cooldown: 2,
      animusCost: 3,
      shortSummary:
        'Starting Fire card. All-round multi/single-target damage that ignores enemy defense and benefits from blank draws.',
      needsVerification: false,
    },
    {
      name: 'Ice Spike',
      cooldown: 2,
      animusCost: 3,
      shortSummary:
        'Starting Ice card. Big damage if you close distance and line it up across multiple hexes; staff-extended range helps.',
      needsVerification: false,
    },
    {
      name: 'Incineration Wave',
      cooldown: 2,
      animusCost: 4,
      shortSummary:
        'Starting Fire card. Cone Range 2; with extra Fire tiles you can cover the map in cleansing flame — watch your teammates.',
      needsVerification: false,
    },
    {
      name: 'Kinetic Reflection',
      cooldown: 2,
      animusCost: 0,
      shortSummary:
        'Basic non-element starter (★). Make space and punish enemies that try to push you around — knock them into minions.',
      needsVerification: false,
    },
    {
      name: 'Comet',
      cooldown: 3,
      animusCost: 2,
      shortSummary:
        'Ice spell. Predictive single-target damage that scales with surrounding Water tiles; aim for breakpoints.',
      needsVerification: false,
    },
    {
      name: 'Encapsulate',
      cooldown: 3,
      animusCost: 2,
      shortSummary:
        'Starting Ice card. Has a skill curve; if you bait enemies into your trap, one of the most Animus-efficient abilities in the game.',
      needsVerification: false,
    },
    {
      name: 'Fireball',
      cooldown: 3,
      animusCost: 4,
      shortSummary:
        'Big-3 Fire card. +1 Damage per additional hex covered after the first; great on large monsters with side-minions.',
      needsVerification: false,
    },
    {
      name: 'Flaming Whip',
      cooldown: 3,
      animusCost: 4,
      shortSummary:
        'Big-3 Fire card. High efficiency; pulls fleeing enemies back to your melee allies, saving up to 6 movement Animus.',
      needsVerification: false,
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
  role: 'Support / Melee DPS / Off-tank',
  playstyle: `The priest is a hybrid of damage dealing and healing support who constantly asks the question - do you want to slay your foes or keep your companions alive? The blows of the priest are empowered by his faith and fortune favors his hammer. The priest naturally sees a lot of re-rolls in combat and finds room to take leaps of faith with abilities like Pillar and Path.

When you think of a more traditional RPG Priest you might be thinking of a cloth-wearing character dispensing white light out of every orifice. Bathing the party in copious amounts of health. This is not our Priest. Decked in plate with the scriptures chained to his chest, he hefts a brick on a stick and charges in with a prayer on his lips.

The Priest is the closest character we have to a 'healer', yet he still retains some heavy damage output and front line tankiness that gives him the time to finish those prayers. Everything comes at a price in this world and healing is no different. The Priest gains several ways to protect and heal his Free Company yet there is something in the rites that drains the Priest each time he attempts it. Healing costs the Priest his own HP pool yet the Priest's own awesome vitality sees him gaining HP when he himself gets low. You will need careful HP management to get the most out of the Priest's miraculous potential. Give away too much of yourself for the party and you might end up unconscious and of no use to anyone but hold back and it may be your companions who end up in the dirt. The power of life and death is in your hands.`,
  lore: `Miracles have ceased, or so the church says. The Ecclesiarch proclaim that the 'pillar and path' is all the righteous need. Right body and right action. However, meeting in upper rooms and hidden places, followers still practice the old ways.

Manifestations in these meetings are rare but words like 'healing' are occasionally attached to miraculous tales of sickness being cast out and wounds disappearing.

Adherents to 'the Way' can be found in all echelons of life. Those with a strength of arms and a burden for humanity often find themselves drawn to the Free Companies. Beyond the grip of the Church they can practise their faith and live out their convictions in the bluntest sense possible...in the swing of a hammer.`,
  art: 'characters/priest/art.webp',
  specialAbility: [
    {
      title: "The Faithful's Vitality",
      text: 'If you have 3 HP or less, gain 1 HP at the start of each refresh phase.',
    },
  ],
  canEquip: 'All Armor. All 1-Hand and 2-Hand Maces, Staffs, and Polearms.',
  level1Abilities: buildLevel1('priest', priestRange, [
    {
      name: 'Heavy Blow',
      cooldown: 0,
      cost: 'Cooldown 0, Animus cost ?',
      shortSummary:
        'Mandatory cooldown-0 starter. Attack option, Battleflow one card, Refresh your might decks. You must take this card each encounter.',
      needsVerification: false,
    },
    {
      name: 'Pillar and Path',
      cooldown: 1,
      animusCost: 4,
      shortSummary:
        'Self-buff: press for damage with a Redraw token, or bank future defense via a Defense token.',
      needsVerification: false,
    },
    {
      name: 'Righteous Advance',
      cooldown: 1,
      cost: 'Cooldown 1, Animus cost ?',
      shortSummary:
        'Mobility opener that keeps movement cost low and sets up bigger plays across the field.',
      needsVerification: false,
    },
    {
      name: 'Desperate Prayer',
      cooldown: 2,
      animusCost: 2,
      shortSummary:
        'Ranged heal with a difficulty check (white cards) scaled by target HP. Costs 1 of your HP; can move up to 2-3 HP onto a near-dead ally.',
      needsVerification: false,
    },
    {
      name: 'Prayer of Protection',
      cooldown: 2,
      animusCost: 0,
      shortSummary:
        'Preventative defense buff for an ally; effectively halves incoming damage when they have nothing left to defend with.',
      needsVerification: false,
    },
    {
      name: 'Fend',
      cooldown: 3,
      animusCost: 0,
      shortSummary:
        'Life-saving defense for an adjacent ally — no HP cost. Buddy up to use it on friends.',
      needsVerification: false,
    },
    {
      name: 'Weight of Glory',
      cooldown: 3,
      animusCost: 4,
      shortSummary:
        'Knockback attack: deals extra damage by colliding the target, repositions enemies, and grants a Defense token.',
      needsVerification: false,
    },
  ]),
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
  role: 'Range DPS / Glass Cannon',
  playstyle: `Of all her kin, the the A'Dendri Ranger is one of the most lethal. Grown to stalk the borders of her land she has been perfectly adapted to the hunt. Her marksmanship makes her excellent at inflicting heavy damage on specific targets and her special ability 'Tree Run' allows her to always find just the right position to take the shot. She is equipped with a quiver of custom tipped arrows which are used with abilities like Flensing Rounds and Bodkins as she has trained her whole life to draw them faster than a blade can swing.

The ranger's goal is simple, she is your Free Company's scalpel. More than any other Oathsworn the Ranger has the ability to pick a target, get into range and execute them with precision. Her abilities all work to that goal and give you a toolkit to maximize your damage output across a range of situations. Although her abilities are not as complex as some of the other Oathsworn her field of influence is often much wider causing her to be face the tough decision of who to kill first?

Overall the Ranger has a clean focus but a lot to think about in terms of positioning, targeting and execution. Like the Witch, you are somewhat of a glass cannon where staying at range is key to survival. Walk the knife edge between maximising damage and staying clear of the enemies and you'll be rewarded with a serious kill count and surprised looks from your companions as they eye your bow.`,
  lore: `Humanity has encountered several races but few are as mysterious as the fay A'Dendri. Once members of an ancient woodland, many now travel to Verum to seek refuge amongst the human settlements. Inspiring curiosity and fear in equal measure they settled what became known as the Green Streets. There they ply their trades using a non-verbal merchant language called 'The Knock'. As such, little is known of this people beyond their skill with herbs and hunting.

The A'Dendri find themselves in high demand amongst the Free Companies. Rangers in particular are sought after, their prolific speed and agility saving many lives in the field. It is not uncommon for a beast's blow to be turned aside by a well-placed arrow or it's charge halted by invisible snares.

It is said the Rangers grow their arrows within their own body's, ensuring their craftmanship and deadly accuracy.`,
  art: 'characters/adendri-ranger/art.webp',
  specialAbility: [
    {
      title: 'Tree Running',
      text:
        'If you are adjacent to an obstacle, you may spend 3 animus to move up to 7 to another hex that is adjacent to an obstacle. Obstacles and other characters do not block this movement and you do not count as moving through intervening hexes.',
    },
  ],
  canEquip: 'Cloth and Leather Armor, Bows.',
  level1Abilities: buildLevel1('adendri-ranger', rangerRange, [
    {
      name: 'Loose Arrow',
      cooldown: 0,
      cost: 'Cooldown 0, Animus cost ?',
      shortSummary:
        'Mandatory cooldown-0 starter. Attack option, Battleflow one card, Refresh your might decks. You must take this card each encounter.',
      needsVerification: false,
    },
    {
      name: 'Longshot',
      cooldown: 1,
      animusCost: 4,
      shortSummary:
        'Big-damage opener for round 1; combos with Tree Running and bow range-extension Animus to shoot from perfect positions.',
      needsVerification: false,
    },
    {
      name: 'Ricochet',
      cooldown: 1,
      animusCost: 4,
      shortSummary:
        'Two modes: hard single-target attack, or push-your-luck multi-target. Animus-efficient when the draw lands right.',
      needsVerification: false,
    },
    {
      name: 'Quickshot',
      cooldown: 2,
      animusCost: 1,
      shortSummary:
        'Cheap Move 2 + Battleflow on cooldown 2; cycles your big 3-cooldown cards back into hand quickly.',
      needsVerification: false,
    },
    {
      name: 'Thread the Needle',
      cooldown: 2,
      animusCost: 3,
      shortSummary:
        'Targeted strike on a specific HP die — avoid breaking the closest die or whittle a die for your ally to finish. +3 Damage on the right side.',
      needsVerification: false,
    },
    {
      name: 'Child of the Forest',
      cooldown: 3,
      animusCost: 0,
      shortSummary:
        'Shoot then disappear into the trees. Not the most altruistic, but saves you in tight spots.',
      needsVerification: false,
    },
    {
      name: 'Multi Shot',
      cooldown: 3,
      animusCost: 4,
      shortSummary:
        'Multi-target attack — picks several enemies in range. Card title is two words on the printed card.',
      needsVerification: false,
    },
  ]),
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
  role: 'Melee DPS / Mobility',
  playstyle: `The Scar Tribe Exile is a balls to the wall damage-dealing badass. Anyone who wears more spikes than clothes is to be watched carefully and the Exile is no exception. Always riding the edge between recklessness and martial prowess, the Exile likes nothing more than being in the thick of it. Always trying to push his luck with big attacks hoping to trigger his special ability 'Unbound Rage'. When he runs out of cards, the temptation to 'Open Wounds' rises that will glean him a new influx of cards, allowing the cycle of death to continue.

When the Exile is wearing anything at all, its leather armor. Being so fast and wearing so little comes with advantages and he has increased mobility compared with most of his companions. On the down side though, his leather armor leaves much to be desired in terms of defense. This doesn't matter to the Exile though as he knows the most important lesson of the Deepwood; 'they can't eat you if they're dead'.

The Exile has as many ways to kill his foes as he has scars on his chest. If you choose to field an Exile you will be attacking again and again and again, reaping your foes under a hail of blows. You can go hypermobile, single target focused, Multi Target, balanced or highly reckless. All the options lead to the same thing though...carnage!`,
  lore: `There is only one people group that has successfully survived life in the Deepwood itself...the Scar Tribes. Living off the very creatures that hunt them, the tribes gain their name from the self-mutilation they perform to lure beasts from the woods. Drawn by the scent of blood the beasts find a warrior bloodied and alone. Then the pack falls on the beast, slaying it with brutal weapons and unbridled ferocity.

Death is God to the tribes and bone their currency. Nowhere is life more fickle than in the treetop dwellings of these bands. The slightest misstep can see the pack turn on it's own.

Occasionally one of their number will survive such a death sentence and manage to escape. Those that do usually perish under the canopy of the Deepwood. Very rarely, however, one may live long enough to find other humans and even find a distant kinship.`,
  art: 'characters/scar-tribe-exile/art.webp',
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
  level1Abilities: buildLevel1('scar-tribe-exile', exileRange, [
    {
      name: 'Primal Strike',
      cooldown: 0,
      cost: 'Cooldown 0, Animus cost ?',
      shortSummary:
        'Mandatory cooldown-0 starter. Attack option, Battleflow one card, Refresh your might decks. You must take this card each encounter.',
      needsVerification: false,
    },
    {
      name: 'Leap Attack',
      cooldown: 1,
      animusCost: 4,
      shortSummary:
        'Fan-favourite jumping attack: vault over an enemy slicing them mid-air, land on a second, kick them into a third.',
      needsVerification: false,
    },
    {
      name: 'Weapon Throw',
      cooldown: 1,
      animusCost: 3,
      shortSummary:
        'Big single-target ranged attack — chuck your weapon at a far-off enemy or to trigger reactions. Remember to pick it up.',
      needsVerification: false,
    },
    {
      name: 'Reap',
      cooldown: 2,
      animusCost: 3,
      shortSummary: 'Multi-target attack that further enrages the Exile.',
      needsVerification: false,
    },
    {
      name: 'Roaring Charge',
      cooldown: 2,
      animusCost: 2,
      shortSummary:
        'Great opening move: closes distance for the Exile and the Free Company simultaneously.',
      needsVerification: false,
    },
    {
      name: 'Death from Above',
      cooldown: 3,
      animusCost: 3,
      shortSummary:
        'Hypermobile heavy hitter using treetop skill — disappear into the canopy and dive out, teeth bared and blades glinting.',
      needsVerification: false,
    },
    {
      name: 'Headbutt',
      cooldown: 3,
      animusCost: 0,
      shortSummary:
        "After an adjacent enemy draws damage, ignore one of the enemy's might cards (your choice). Costs +Animus.",
      needsVerification: false,
    },
  ]),
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
  role: 'Melee DPS / Burst / Control',
  playstyle: `Each of the Cur's deadly abilities may allow you to generate combo points that come in the form of a class-specific token that can be accumulated. When the Cur wishes, he may spend these tokens in a burst of lethality that can either super charge an ability or reduce its animus cost considerably. The more combo points that are spent, the larger the bonus available.

So it is up to you, do you prepare a devastating blow or quickly trade them for small advantages again and again when the time is right? The Cur can put out an incredible amount of damage but is lightly armored. Therefore, he relies on his array of interrupts and Battleflow manipulations to make sure he is not caught flat-footed when the enemy attacks.

The Cur has a builder/spender mechanic that lets you execute a number of abilities to gain the lethality tokens and then, just when the time is right, unload them into a big attack. Empowered attacks let you upgrade a might card/dice to the next level for each empower, white to yellow, yellow to red, red to black, increasing your damage significantly. When combined with the Cur's other damaging effects he often becomes the one to set records for high damage and breaking enemy locations in a single knife thrust. Beware though, he has a high skill requirement to go along with that high damage and he must survive on trickery and careful positioning more than the armor plates of his allies.`,
  lore: `Life is a gamble. Most people live for the long game, hoping to mitigate risk at every turn. There are some, though, who seek it out. They leave the well-worn path because they know whatever happens, in the end, life is a game you don't win.

These individuals often end up in the underbelly of society, living in the highly dangerous yet highly profitable city shadows. Assassins, cut purses, fixers, enforcers, collectors and cutters can be found in all cities. Collectively known as Curs, they are synonymous with underhand tactics, lethal intent and lack of morals. In reality these men and women are a spectrum, with a range of motivations as varied as the weapons and poisons they wield. One thing is certain though, in the eyes of the law, their life is equally forfeit. There is one path and one path only out of that death sentence; The Oath.`,
  art: 'characters/cur/art.webp',
  specialAbility: [
    {
      title: 'Lethality',
      text:
        'You gain lethality tokens (skull) from abilities. Before using an ability, you may expend up to 5 of these to empower it. 1 / 2 / 3 / 4 / 5 skulls = +1 / +2 / +4 / +7 / +10 Empowered.',
    },
  ],
  canEquip: 'Cloth and Leather Armor, All 1-Handed weapons.',
  level1Abilities: buildLevel1('cur', curRange, [
    {
      name: 'Shank',
      cooldown: 0,
      cost: 'Cooldown 0, Animus cost ?',
      shortSummary:
        'Mandatory cooldown-0 starter. Attack option, Battleflow one card, Refresh your might decks. You must take this card each encounter.',
      needsVerification: false,
    },
    {
      name: 'Backstab',
      cooldown: 1,
      animusCost: 4,
      shortSummary:
        'Rear attack combo with Concealment — +5 damage redrawable strike that nets 2 lethality tokens.',
      needsVerification: false,
    },
    {
      name: 'Concealment',
      cooldown: 1,
      animusCost: 0,
      shortSummary:
        "Synergistic with Backstab from the rear; alternate effect makes the Cur untargetable when in an enemy's rear.",
      needsVerification: false,
    },
    {
      name: 'Low Blow',
      cooldown: 2,
      animusCost: 0,
      shortSummary:
        'Survivability when you or a friend get whacked by a big hit, especially on enemy 1-2 big-card draws.',
      needsVerification: false,
    },
    {
      name: 'Throwing Daggers',
      cooldown: 2,
      animusCost: 2,
      shortSummary:
        'Minion-clearing unarmed multi-attack; uses extra red rather than weapon might. Solid Lethality builder.',
      needsVerification: false,
    },
    {
      name: 'Nightshade',
      cooldown: 3,
      animusCost: 3,
      shortSummary:
        'First poison effect: saps the enemy so you can break locations without taking the reaction damage.',
      needsVerification: false,
    },
    {
      name: 'Smoke Bomb',
      cooldown: 3,
      animusCost: 0,
      shortSummary:
        'Lifeline for any Free Company member within range 3 — pricey because the 3-defense buff is huge while ready.',
      needsVerification: false,
    },
  ]),
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
  role: 'Tank / Support / Melee DPS',
  playstyle: `Amongst mankind's kin, none will charge head-long into overwhelming odds as willingly as the Penitent. His blows are strengthened by righteous indignation. The more wounds he suffers the harder he fights, sure in the knowledge that each drop of blood he sheds carries away with it the shame of past deeds.

Suffering such wounds has made the Penitents apothecaries of sorts for they cannot simply allow themselves to succumb to death's embrace, but must wrestle him to the last. They are no stranger to applying curatives and field medicines to keep others alive and when coupled with the Penitent's thick armor plates and defensive abilities, he makes an excellent tank and defender of the Free Company. When monsters need killing, the Penitent draws deeply from his suffering, gaining a +2 Empower token for every HP lost. Gathering his strength, he lays blow after blow upon them with weapon and shield alike. Free Companies hold Penitents in high esteem, especially when they finally complete their penance.

Your Free Company is going to get hurt a lot in the Deepwood. Why not use that to your advantage? The Penitent comes out swinging and goes down hard. Taking hits for the team whether he is tanking or damage dealing. He revels at being in the thick of it, taking one on the chin to only batter his assailant twice as hard in return. Each blow is another chance to atone for one of the sins on the scrolls of his armor, the inscription washed away by a coating of shed blood.`,
  lore: `The Pillar and Path rule the lives of the faithful; nowhere is this more apparent than in the aspirants of the knightly orders. Living lives of self-denial and discipline, aspirants suffer extreme trials to prove themselves worthy. Those few that pass the trials go onto become fully-fledged knights, those that fail become Penitents.

A Penitent has failed and fallen from the Path, their only way back is to seek martial redemption. Given tattered armour, a Penitent will adorn their apparel with scrolls containing the sins they have committed. They may be expunged, but only in a good death. Each wound recieved, each fiend slain is another step closer to the Path. In the end however, it will be his last breath the sees his penance complete.

It is no surprise Penitents often seek out the The Oath. To join a Free Company is a sure way of recieving the purifying punishment they seek.`,
  art: 'characters/penitent/art.webp',
  specialAbility: [
    { title: 'Penance', text: 'For each 1 HP you lose, gain a 3x Empower token.' },
  ],
  canEquip:
    'All Armor, Shields. All 1-Hand and 2-Hand weapons except Daggers, Staffs, and Bows.',
  level1Abilities: buildLevel1('penitent', penitentRange, [
    {
      name: 'Penitent Strike',
      cooldown: 0,
      cost: 'Cooldown 0, Animus cost ?',
      shortSummary:
        'Mandatory cooldown-0 starter. Attack option, Battleflow one card, Refresh your might decks. You must take this card each encounter.',
      needsVerification: false,
    },
    {
      name: 'Guard',
      cooldown: 1,
      animusCost: 0,
      shortSummary:
        '0-Animus interrupt that defends an ally — also gives free movement for both 2-handed and sword-and-board Penitent builds.',
      needsVerification: false,
    },
    {
      name: 'Revenge',
      cooldown: 1,
      animusCost: 0,
      shortSummary:
        'Counter-attack triggered after the Penitent loses HP from an enemy.',
      needsVerification: false,
    },
    {
      name: 'Intercession',
      cooldown: 2,
      animusCost: 2,
      shortSummary:
        'Healing/intercession: select an adjacent friendly character and transfer HP.',
      needsVerification: false,
    },
    {
      name: 'Sweep',
      cooldown: 2,
      animusCost: 4,
      shortSummary:
        'Multi-target attack with free movement — chain with Guard to net 4 free Animus of movement in the right setup.',
      needsVerification: false,
    },
    {
      name: 'Shield Bash',
      cooldown: 3,
      animusCost: 3,
      shortSummary:
        'Knockback attack — collide enemies into other things to deal extra damage and control the field.',
      needsVerification: false,
    },
    {
      name: 'Taunt',
      cooldown: 3,
      animusCost: 0,
      shortSummary:
        "Tank staple: forces an enemy to target the Penitent; one of the best ways to save a teammate's life.",
      needsVerification: false,
    },
  ]),
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
  role: 'Support / Melee DPS',
  playstyle: `Playing an Avi involves your ability to read the pattern of the encounter and intuit how things are about to play out. If your correct you will be rewarded by seeing your allies avoid danger. Not only a support character the Harbingers are also viciously fast and capable of deadly bursts of speed that can deal heavy damage to his enemies by blade, staff, talon and even at range with his own quill. The Avi can even bend time but for the briefest moment and dart across the board to any hex he wishes for free once per encounter.

These bursts of speed and prescient alterations comes at a price though, the Avi is one of the lightest armored members of the Free Company and will only be able to wear cloth armor. What can plate and chain offer you though when you are armored in knowledge of the future?

More than any other character the Avi Harbinger relies on your ability to read the game state. Harbinger's are analytical thinkers and you'll need to be one too to get the most out of them. If you can pull it off though you'll find a class with one of the highest skill caps and potentials of any Oathsworn. That is so long as you are happy to run the knife edge of prediction that keeps you and your Free Company alive. Others might call you lucky but you know you make your own luck.`,
  lore: `Of all the races that strive to survive in the shadow of the Deepwood none are as rare nor confound comprehension as the Avi. Foremost amongst the reasons for this obscurity is that they seem to be highly intelligent yet equally inconsistent beings. Cloaked in mystery, in one moment they may strike a man only to lend them aid the next. They may talk, but in riddles or answering questions not yet asked.

Without understanding, fear and hatred follow the Avi wherever they appear. It is only those few that find themselves shoulder-to-shoulder with one in battle that understand the truth. The Avi can see the future.

With a word or gesture the Avi can help others skirt the perils of fate. When combined with their preternatural speed and agility, Oathsworn quickly learn to listen to the Avi even if they don't fully understand them.`,
  art: 'characters/avi-harbinger/art.webp',
  specialAbility: [
    {
      title: 'Preternatural Swiftness',
      text:
        'Once per game during your turn, you may move any distance for free without moving through the intervening hexes.',
    },
  ],
  canEquip: 'Cloth Armor, Daggers, Staffs, and 2-Hand Polearms.',
  level1Abilities: buildLevel1('avi-harbinger', harbingerRange, [
    {
      name: 'Talon Strike',
      cooldown: 0,
      cost: 'Cooldown 0, Animus cost ?',
      shortSummary:
        'Mandatory cooldown-0 starter. Attack option, Battleflow one card, Refresh your might decks. You must take this card each encounter.',
      needsVerification: false,
    },
    {
      name: 'Backstab',
      cooldown: 1,
      animusCost: 3,
      shortSummary:
        'Hard-hitting positional melee strike; offset the positional requirement with Preternatural Swiftness and Avi Animus regen.',
      needsVerification: false,
    },
    {
      name: 'Wingslam',
      cooldown: 1,
      animusCost: 2,
      shortSummary:
        'Knockback utility that triggers collision HP loss; combos with Preternatural Swiftness for big plays. (Moved from L2 in 2nd edition.)',
      needsVerification: false,
    },
    {
      name: 'One Soul',
      cooldown: 2,
      animusCost: 1,
      shortSummary:
        'Spike-mitigation: redistribute HP loss across the team to keep everyone above unconsciousness.',
      needsVerification: false,
    },
    {
      name: 'Prescient Strike',
      cooldown: 2,
      animusCost: 3,
      shortSummary:
        'Bet on accuracy for bonus damage, or trust the deck and redraw on a miss — either way, getting it right pays out.',
      needsVerification: false,
    },
    {
      name: 'Prophetic Fulfilment',
      cooldown: 2,
      animusCost: 2,
      shortSummary:
        'Predict who will be hurt soon. If you guess right, the next time you use this card the target gains 1 HP — precious in Oathsworn.',
      needsVerification: false,
    },
    {
      name: 'Deadeye Shot',
      cooldown: 3,
      animusCost: 0,
      shortSummary:
        'One of the strongest ranged interrupts in the game — saves friends at range, rarely yourself.',
      needsVerification: false,
    },
  ]),
  unlockedAbilities: {
    level2: buildUnlocked('avi-harbinger', harbingerRange, 2, [
      {
        name: 'Quill Throw',
        shortSummary:
          'Avi feathers as projectiles: helpful crowd damage at range when minions threaten the Free Company. (PDF prose only.)',
        cardImage: null,
      },
      // Wingslam was an L2 unlock in 1st edition; in 2nd edition it
      // ships as an L1 starter (see level1Abilities above).
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
  role: 'Melee DPS / Versatile',
  playstyle: `The Blade's special ability is the Blade stances. A separate card that allows him to, once per turn, swap between stances and empower his abilities. Each stance has its place at the right time. When it comes to abilities, the Blade is a highly mobile killer. Often his abilities involve an element of movement and it is not uncommon to see a Blade slide into combat lunging at an enemy only to pivot away and charge through another. When the enemy tries to land a blow on the Blade, abilities like Master Parry, Mule's Regard and Perfect Form see the blow caught, turned and even redirected back at the attacker.

Sharpened to a keen edge by adversity, a Blade will pivot, roll, dodge and dive through enemy blows only to then flow through the blade forms with deadly grace. Their Viper, Boar and Ox stances all have their place in the dance of death. The Viper stance allows quick striking and nimble positioning. The Boar stance provides bursts of power and lunging precision. The Ox stance is for turning blades back on their wielders and making a mockery of an enemy's attacks. All are open to the Blade in battle and each must be woven into the blade dance for maximum efficacy. When to flow between the stances, however, is what separates the Blade from the dead.`,
  lore: `The Masked City is a perilous place where life is bought and sold on a whim. Nowhere epitomizes this disregard for life like the Colesseum. Thousands have bled and died under the cheers of the populace. Each competitor strives to survive their next bout and to one day ascend up the Path of Blades, for it's only at the summit that they can hope to find freedom.

The Blades are the greatest of competitors, whose every step through life leaves bloody footprints and broken masks. Blades draw great attention from the nobility, and patronage often follows. It is here the Blade begins to find opportunity and perhaps a way out, for a price.

Only some have the strength to pay that price. Those that do, emerge from the Colesseum peerless swordsmen. It is no surprise the Free Companies seek them out. Finding them is one thing, getting them to bind themselves to The Oath is quite another.`,
  art: 'characters/thracian-blade/art.webp',
  specialAbility: [
    {
      title: 'Blade Stances',
      text:
        'You are always in one of three stances that correlate to your cooldown positions: Any, Boar, Viper, or Ox. Which stance you are in depends on which cooldown position has the most cards. If two or more tie for the most cards, you may choose between them. Stances are determined just before the ability is played.',
    },
  ],
  canEquip:
    'All Armor. All 1-Hand and 2-Hand weapons except Daggers, Staffs, and Bows.',
  level1Abilities: buildLevel1('thracian-blade', bladeRange, [
    {
      name: 'Cut',
      cooldown: 0,
      cost: 'Cooldown 0, Animus cost ?',
      shortSummary:
        'Mandatory cooldown-0 starter. Attack option, Battleflow one card, Refresh your might decks. You must take this card each encounter.',
      needsVerification: false,
    },
    {
      name: 'Charging Boar',
      cooldown: 1,
      animusCost: 4,
      shortSummary:
        'Move 3 in a straight line and attack. The PDF intro explicitly cites this card as the example with a star icon (starting card for the class).',
      needsVerification: false,
    },
    {
      name: 'Roll',
      cooldown: 1,
      animusCost: 1,
      shortSummary:
        'Cheap mobility on a 1-cooldown slot — keeps your battleflow going and repositions out of trouble or into setup.',
      needsVerification: false,
    },
    {
      name: "Mule's Regard",
      cooldown: 2,
      animusCost: 0,
      shortSummary:
        "Defensive interrupt — turn an enemy's blow back on them after they draw damage. (Moved from cd3 in 1st edition to cd2 in 2nd edition.)",
      needsVerification: false,
    },
    {
      name: 'Winnowing Strike',
      cooldown: 2,
      animusCost: 4,
      shortSummary:
        'Area-of-Effect attack from the Blade.',
      needsVerification: false,
    },
    {
      name: 'Cleaving Slide',
      cooldown: 3,
      animusCost: 3,
      shortSummary:
        'Big lining-up attack: charge through a line of minions into the boss.',
      needsVerification: false,
    },
    {
      name: 'Master Parry',
      cooldown: 3,
      animusCost: 1,
      shortSummary:
        'Use instead of playing a defence — circumvents damage at the cost of a redraw / prediction. (Moved from L2 in 1st edition to L1 cd3 in 2nd edition.)',
      needsVerification: false,
    },
  ]),
  unlockedAbilities: {
    level2: buildUnlocked('thracian-blade', bladeRange, 2, [
      // Master Parry was an L2 unlock in 1st edition; in 2nd edition
      // it ships as an L1 starter (see level1Abilities above).
      // Somersault was an L1 starter in 1st edition; in 2nd edition it
      // is no longer in the L1 hand. Its current placement is unknown.
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
  role: 'Summoner / AoE / Glass Cannon',
  playstyle: `The Grove Maiden works differently from all other classes. Not just because she can summon an army to do her bidding but also because she is an encounter as well as a playable character. Having her be part of your Free Company from Chapter 1 is optional but the intended design is that she is actually unlocked later in the game.

Once you have unlocked the Grove Maiden she is a force to be reckoned with. With the ability to summon up to 8 Sentinel turrets to the battlefield along with the control of her Ancient Guardian she has a lot of ways to get the job done. The Grove Maiden is a glass cannon of sorts who relies primarily on being protected by her guardian whilst keeping just the right distance to juggle all her abilities. She has no weapons (as she makes her own) and wears only the thinnest of armor. She does however have the ability to hold 2 gear items rather than the usual 1 and also has an innate might that increases as she levels. This might is used by her and all her summons as extensions of her will. Usually this might is applied per Sentinel so that attacking with 4 turrets will give you 4 times the Grove Maiden's might in damage. These attacks cannot miss so you can imagine what you can do with all 8 turrets out and in range. This means the Grove Maiden has a unique gameplay style where she is trying to field as many of her Sentinels as possible and keep them in range of the enemy whilst having enough Animus left over to perform abilities with those Sentinels. Along with her own abilities, the Ancient Guardian also has its own animus and works the same as an ally controlled by the Maiden. So whilst you are building a bioform wall of death disgorging a storm of needle on your enemies the ancient is stomping across the field pounding anything that would threaten its creator.

Coming with her own mini game of Sentinel placement and positioning the Grove Maiden takes some mastering but once you do she is very rewarding. The Grove Maiden has a lot of sources of damage and can compete with the Cur and the Witch for highest damage output in a single attack. Slap dash placement of turrets and not taking the enemy's movement into consideration will see her output heavily hampered but with the right choices and positioning she is a devastating scourge on the enemy.`,
  lore: `Humanity has encountered several races but few are as mysterious as the fay A'Dendri. Once members of an ancient woodland, many now travel to Verum to seek refuge amongst the human settlements. Inspiring curiosity and fear in equal measure they settled what became known as the Green Streets. There they ply their trades using a non-verbal merchant language called 'The Knock'. As such, little is known of this people beyond their skill with herbs and hunting.

One of the rarest A'Dendri are the Grove Maidens. Each is an ancient being who has tended the nursing groves of their ancestral home for hundreds of seasons. They use the magnificent potency of their spores to encourage growth in sapling A'Dendri and even direct their transformation. At times of need the Grovemaiden can create great beasts of war and sentinels to combat anything that would threaten her woods. For one to leave her grove is almost unheard of and only the greatest calamity would see one joining a Free Company.`,
  art: 'characters/adendri-grove-maiden/art.webp',
  specialAbility: [
    {
      title: 'Sentinels & Ancient Guardian',
      text:
        'You create Sentinel turrets and may have an Ancient Guardian to protect you. You may move through your Sentinels, but may not stop on them. You cannot use weapons; instead you may carry two gear cards. Your might is based on your level: 1=0, 2-8=Yellow, 9-14=Red, 15+=Black.',
    },
  ],
  canEquip: 'Cloth Armor. No weapons.',
  level1Abilities: buildLevel1('adendri-grove-maiden', groveRange, [
    {
      name: "Nature's Call",
      cooldown: 0,
      cost: 'Cooldown 0, Animus cost ?',
      shortSummary:
        'Mandatory cooldown-0 starter. Attack option, Battleflow one card, Refresh your might decks, plus Sentinel placement/attack option. You must take this card each encounter.',
      needsVerification: false,
    },
    {
      name: 'Raise Sentinel',
      cooldown: 1,
      cost: 'Cooldown 1, Animus cost ?',
      shortSummary:
        "Cheap Sentinel summon — the engine of the Grove Maiden's build. Reminder rules are printed on the card.",
      needsVerification: false,
    },
    {
      name: 'Volley',
      cooldown: 1,
      animusCost: 4,
      shortSummary:
        'Mob killer using all your Sentinels at close range. +1 Damage per target up to ~+6 vs a group of 6 mobs.',
      needsVerification: false,
    },
    {
      name: 'Life Bloom',
      cooldown: 2,
      animusCost: 0,
      shortSummary:
        "Significant Animus transfer to the Free Company at a cost; particularly efficient when the Guardian is already on death's door.",
      needsVerification: false,
    },
    {
      name: 'Thundering Giant',
      cooldown: 2,
      animusCost: 4,
      shortSummary:
        'Ancient Guardian charges in a straight line, smashing through anything in its path — repositions the Guardian for free.',
      needsVerification: false,
    },
    {
      name: "Nature's Fury",
      cooldown: 3,
      animusCost: 4,
      shortSummary:
        'Scales with your Sentinels — full field of 8 turrets nets +8 Damage at range 4, attack cannot miss.',
      needsVerification: false,
    },
    {
      name: 'Thorns',
      cooldown: 3,
      animusCost: 2,
      shortSummary:
        '"Take you down with me" retaliation — particularly deadly when the Ancient Guardian eats a big hit for you.',
      needsVerification: false,
    },
  ]),
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
  role: 'Hybrid DPS / Support',
  playstyle: `To gain the most benefits out of the Huntress abilities you will want to get your head around her main mechanism, the falcons. The Huntress starts with 2 great falcon miniatures that begin each encounter 'on her'. They do not act like other characters, they cannot be attacked and do not take up space on the battlefield. Instead they will move between character boards/ encounter boards to trigger their effects. Ability Cards will let you move the falcons to new targets (both friendly or enemy). When you play an Ability Card you will then gain bonuses based on whether your target has falcons 'on' them or not. Many abilities require you to ha, you're never short of interesting choices to make with the Huntress.

On top of her many falconry abilities that can buff or hamper others, she also has a set of abilities centered around bow and melee weapon proficiency. Spear and polearm attacks focus on killing blows and combination attacks with her falcons. Whilst the bow gives her a range supremacy that gives her even more ability to control her falcons. Oh and she has traps that can be laid in the path of her prey and even one that can be triggered to explode when shot from range. The huntress embodies versatility in combat and no matter which path she chooses one thing is sure...she will become the master of it.

Overall, the Huntress is one of the most versatile characters in Oathsworn:ItD. With enough abilities to play a highly supportive role or challenge the best DPS for damage output, you can be where you are needed when you are needed. Propelling your team with movement buffs and guarding them with your great falcons you can then send your birds of prey ahead of you with rending claws and beaks. Whether you want to be skewering your enemies as a highly mobile blade wielder or you prefer to command your minions from the back whilst raining flighted death on your enemies, the Huntress is the one for you.`,
  lore: `The art of rearing great falcons has been a carefully guarded secret and was only ever known to but a few noble families. Passed from mother to daughter, the knowledge to raise and tame these giant birds of prey has seen many women rise to power under the watchful eyes of these feathered protectors.

When the deepwood came, many great families crumbled along with thier cities but the knowledge remained, as did the great falcons.

Fatalities when attempting to raise great falcons are not uncommon and they are famously capricous creatures. However, when one does finally bond with a master they will never again leave thier side. The great falcons are incredibly astute and a master huntress can direct them to attack thier enemies or defend allies with but a whistle or a gesture. All the while the huntress performs feats of marital prowess with bow and spear as her falcons swoop in for the kill.`,
  art: 'characters/huntress/art.webp',
  specialAbility: [
    {
      title: 'Falconer',
      text:
        'You have 2 great falcon miniatures that begin each encounter on your Player Board. Abilities allow you to move them to other targets. If your falcons are on the correct target, they trigger effects on your Ability Cards. See Appendix III in the Encounter Rule Book for full rules.',
    },
  ],
  canEquip: 'Cloth and Leather Armor. Bows, Spears, and Polearms.',
  level1Abilities: buildLevel1('huntress', huntressRange, [
    {
      name: 'Wind Strike',
      cooldown: 0,
      cost: 'Cooldown 0, Animus cost ?',
      shortSummary:
        'Mandatory cooldown-0 starter. Attack with a melee weapon, Battleflow one card, send a falcon to a new target, Refresh your might decks. You must take this card each encounter.',
      needsVerification: false,
    },
    {
      name: "Hunter's Call",
      cooldown: 1,
      animusCost: 4,
      shortSummary:
        'Animus-efficient attack and movement buff that helps you and your team close distance to the enemy.',
      needsVerification: false,
    },
    {
      name: 'Rile and Rake',
      cooldown: 1,
      animusCost: 3,
      shortSummary:
        'Bleed-and-distract opener that sets up bigger abilities later. Works with bow or blade builds.',
      needsVerification: false,
    },
    {
      name: 'Clamp On',
      cooldown: 2,
      animusCost: 2,
      shortSummary:
        'Versatile movement buff or Knockback to close distance or open it. Knockback collisions trigger HP loss on everyone involved.',
      needsVerification: false,
    },
    {
      name: 'Swoop',
      cooldown: 2,
      animusCost: 2,
      shortSummary:
        "Guaranteed ranged falcon attack at low Animus cost — the falcon does the work, can't miss, target anyone on the board.",
      needsVerification: false,
    },
    {
      name: 'Flight of Feathers',
      cooldown: 3,
      animusCost: 4,
      shortSummary:
        'Offensive falcon damage tool with guaranteed damage on the target. Strong vs dispersed packs.',
      needsVerification: false,
    },
    {
      name: 'Hinder',
      cooldown: 3,
      animusCost: 0,
      shortSummary:
        "Falcons dive into the enemy's face to defend a friend at range — strong life-saver.",
      needsVerification: false,
    },
  ]),
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
// Ordered alphabetically by `displayName` so the home-page list reads
// A → Z (A'Dendri Grove Maiden, A'Dendri Ranger, Avi Harbinger, Cur,
// Huntress, Penitent, Priest, Scar Tribe Exile, Thracian Blade,
// Ursus Warbear, Warden, Witch).
export const oathswornDb: OathswornCharacter[] = [
  grove,
  ranger,
  harbinger,
  cur,
  huntress,
  penitent,
  priest,
  exile,
  blade,
  ursus,
  warden,
  witch,
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
