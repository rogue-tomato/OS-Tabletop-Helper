import { useMemo, useState } from 'react';
import type { Ability, Character } from '../types';
import { CardLightbox } from './CardLightbox';
import { CardTile } from './CardTile';
import {
  getLevelGate,
  type CardLevel,
  type LevelGate,
} from '../data/levelGates';

type Props = {
  character: Character;
};

const LEVELS: CardLevel[] = [1, 2, 5, 10, 15];

function groupByLevel(character: Character): Record<CardLevel, Ability[]> {
  const groups: Record<CardLevel, Ability[]> = { 1: [], 2: [], 5: [], 10: [], 15: [] };
  // Level 1 includes the cooldown-0 starter (placeholder for the 11
  // non-Witch characters; Elemental Suffusion and friends for the Witch).
  // Total: 7 cards for normal characters, 11 for the Witch.
  for (const a of character.abilities) {
    if (a.level === 1) groups[1].push(a);
  }
  // Higher levels come from `unlockedAbilities`, which is the flat
  // L2+L5+L10+L15 list. Each entry carries its `level` field.
  for (const a of character.unlockedAbilities ?? []) {
    if (a.level === 2 || a.level === 5 || a.level === 10 || a.level === 15) {
      groups[a.level].push(a);
    }
  }
  return groups;
}

function LockedBanner({ level, gate }: { level: CardLevel; gate: LevelGate }) {
  return (
    <div
      className="border-2 border-dashed border-ember-700/40 bg-ink-900/40 p-5 text-center"
      role="status"
    >
      <p className="font-display tracking-[0.18em] uppercase text-ember-400/80 text-[13px]">
        Level {level} · Sealed
      </p>
      <p className="mt-2 text-bone/75 text-[14px] leading-snug">
        {gate.lockedMessage ?? `Unlock to view Level ${level} cards`}
      </p>
    </div>
  );
}

function EmptyLevelNote() {
  return (
    <p className="text-bone/55 text-[14px] italic px-1">
      No cards available for this level yet.
    </p>
  );
}

type LightboxState = { abilities: Ability[]; startIndex: number } | null;

function LevelSection({
  level,
  abilities,
  gate,
  onOpenLightbox,
}: {
  level: CardLevel;
  abilities: Ability[];
  gate: LevelGate;
  onOpenLightbox: (state: NonNullable<LightboxState>) => void;
}) {
  const realInLevel = useMemo(
    () => abilities.filter((a) => !a.manualPlaceholder),
    [abilities],
  );

  const openLightbox = (a: Ability) => {
    const idx = realInLevel.findIndex((x) => x.id === a.id);
    if (idx !== -1) {
      onOpenLightbox({ abilities: realInLevel, startIndex: idx });
    }
  };

  // For Level 1 we render the very first card on its own row, centered
  // and matched to a single grid-cell width. The remaining cards fall
  // into the normal 2-column grid below it. (For non-Witch this means
  // the cooldown-0 starter sits alone at the top; for the Witch it's
  // the first basic ★ card. The "rest" layout is unchanged from before.)
  const useSoloFirst = level === 1 && abilities.length > 1;
  const first = useSoloFirst ? abilities[0] : null;
  const restAbilities = useSoloFirst ? abilities.slice(1) : abilities;

  return (
    <section>
      <h3 className="section-header font-display text-accent tracking-wider uppercase text-[17px] mb-3 px-1">
        Level {level} Cards
      </h3>
      {!gate.revealed ? (
        <LockedBanner level={level} gate={gate} />
      ) : abilities.length === 0 ? (
        <EmptyLevelNote />
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0 m-0">
          {first ? (
            // sm:col-span-2 makes this list-item take the full grid row.
            // The inner div is sized to one grid cell width
            // (calc(50% - half-of-gap)) and centered with flex.
            <li className="sm:col-span-2 sm:flex sm:justify-center">
              <div className="w-full sm:w-[calc(50%-0.375rem)]">
                <CardTile
                  ability={first}
                  onClick={() => openLightbox(first)}
                />
              </div>
            </li>
          ) : null}
          {restAbilities.map((a) => (
            <li key={a.id}>
              <CardTile ability={a} onClick={() => openLightbox(a)} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function CardsTab({ character }: Props) {
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const byLevel = useMemo(() => groupByLevel(character), [character]);

  // Render every revealed level plus the FIRST sealed one as a "next
  // up" hint. Levels beyond that are hidden so the page doesn't bloat
  // with banners spoiling future progression milestones.
  const visibleLevels = useMemo(() => {
    const out: CardLevel[] = [];
    let nextSealedShown = false;
    for (const lvl of LEVELS) {
      const gate = getLevelGate(character.slug, lvl);
      if (gate.revealed) {
        out.push(lvl);
      } else if (!nextSealedShown) {
        out.push(lvl);
        nextSealedShown = true;
      }
    }
    return out;
  }, [character.slug]);

  return (
    <>
      <p className="text-bone/60 text-sm px-1 mb-3">
        Tap any card to view it full-screen. Swipe or use the arrows to browse.
      </p>
      <div className="space-y-6">
        {visibleLevels.map((level) => (
          <LevelSection
            key={level}
            level={level}
            abilities={byLevel[level]}
            gate={getLevelGate(character.slug, level)}
            onOpenLightbox={setLightbox}
          />
        ))}
      </div>

      {lightbox ? (
        <CardLightbox
          abilities={lightbox.abilities}
          startIndex={lightbox.startIndex}
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </>
  );
}
