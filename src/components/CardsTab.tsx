import { useMemo, useState } from 'react';
import type { Ability, Character } from '../types';
import { PlaceholderImage } from './PlaceholderImage';
import { CardLightbox } from './CardLightbox';
import {
  getLevelGate,
  type CardLevel,
  type LevelGate,
} from '../data/levelGates';

type Props = {
  character: Character;
};

const LEVELS: CardLevel[] = [1, 2, 5, 10, 15];

const isCoreCard = (a: Ability): boolean => a.cost === 'Cooldown 0';

function groupByLevel(character: Character): Record<CardLevel, Ability[]> {
  const groups: Record<CardLevel, Ability[]> = { 1: [], 2: [], 5: [], 10: [], 15: [] };
  // Level 1 — exclude the core cooldown-0 card (it lives in Summary now).
  for (const a of character.abilities) {
    if (isCoreCard(a)) continue;
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

function PlaceholderTile({ ability }: { ability: Ability }) {
  return (
    <div
      role="figure"
      aria-label={`${ability.name} — manual placeholder`}
      className="rounded-md border-2 border-dashed border-ember-700/50 bg-ink-900/40 overflow-hidden flex flex-col"
    >
      <div className="relative aspect-[3/4] flex items-center justify-center bg-ink-800/40 [background-image:repeating-linear-gradient(45deg,_rgba(245,200,120,0.05)_0,_rgba(245,200,120,0.05)_8px,_transparent_8px,_transparent_16px)]">
        <div className="text-center px-4">
          <p className="font-display tracking-widest uppercase text-ember-400/85 text-[13px] leading-snug">
            {ability.name}
          </p>
          <p className="mt-2 text-bone/70 text-[13px] leading-snug italic">
            Manual placeholder — needs source
          </p>
          {ability.cardImage ? (
            <p className="mt-3 text-[11px] text-bone/50 break-all font-mono leading-snug">
              {ability.cardImage}
            </p>
          ) : null}
        </div>
      </div>
      <div className="p-3 border-t border-ember-700/20">
        <p className="text-bone font-medium text-[15px] leading-snug line-clamp-2">
          {ability.name}
        </p>
        <p className="text-amber-300/80 text-[13px] mt-0.5">
          Manual placeholder · needs source
        </p>
      </div>
    </div>
  );
}

function LockedBanner({ level, gate }: { level: CardLevel; gate: LevelGate }) {
  return (
    <div
      className="rounded-md border-2 border-dashed border-ember-700/40 bg-ink-900/40 p-5 text-center"
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

  return (
    <section>
      <h3 className="section-header font-display text-ember-400 tracking-wider uppercase text-sm mb-3 px-1">
        Level {level} Cards
      </h3>
      {!gate.revealed ? (
        <LockedBanner level={level} gate={gate} />
      ) : abilities.length === 0 ? (
        <EmptyLevelNote />
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {abilities.map((a) => (
            <li key={a.id} className="contents">
              {a.manualPlaceholder ? (
                <PlaceholderTile ability={a} />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const idx = realInLevel.findIndex((x) => x.id === a.id);
                    if (idx !== -1) {
                      onOpenLightbox({
                        abilities: realInLevel,
                        startIndex: idx,
                      });
                    }
                  }}
                  className="rounded-md border border-ember-700/30 bg-ink-900/60 overflow-hidden text-left active:scale-[0.99] transition-transform"
                  aria-label={`Open ${a.name} card full-screen`}
                >
                  <div className="relative aspect-[3/4] bg-ink-800">
                    <PlaceholderImage
                      src={a.cardImage}
                      alt={a.name}
                      className="absolute inset-0 h-full w-full object-contain p-2"
                      fallbackLabel={a.name}
                    />
                  </div>
                  <div className="p-3 border-t border-ember-700/20">
                    <p className="text-bone font-medium text-[15px] leading-snug line-clamp-2">
                      {a.name}
                    </p>
                    <p className="text-bone/60 text-[13px] mt-0.5">
                      {a.cost ?? `Level ${a.level}`}
                    </p>
                  </div>
                </button>
              )}
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

  return (
    <>
      <p className="text-bone/60 text-sm px-1 mb-3">
        Tap any card to view it full-screen. Swipe or use the arrows to browse.
      </p>
      <div className="space-y-6">
        {LEVELS.map((level) => (
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
