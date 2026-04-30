import { useMemo, useState } from 'react';
import type { Ability, Character } from '../types';
import { PlaceholderImage } from './PlaceholderImage';
import { CardLightbox } from './CardLightbox';

type Props = {
  character: Character;
};

function PlaceholderTile({ ability }: { ability: Ability }) {
  return (
    <div
      role="figure"
      aria-label={`${ability.name} — manual placeholder`}
      className="rounded-2xl border-2 border-dashed border-ember-700/50 bg-ink-900/40 overflow-hidden flex flex-col"
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

export function CardsTab({ character }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Lightbox only navigates real cards — feed it just the non-placeholder
  // abilities, mapped from grid index to lightbox index.
  const realAbilities = useMemo(
    () => character.abilities.filter((a) => !a.manualPlaceholder),
    [character.abilities],
  );
  const realIndexById = useMemo(() => {
    const m = new Map<string, number>();
    realAbilities.forEach((a, i) => m.set(a.id, i));
    return m;
  }, [realAbilities]);

  return (
    <>
      <p className="text-bone/60 text-sm px-1 mb-3">
        Tap any card to view it full-screen. Swipe or use the arrows to browse.
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {character.abilities.map((a) => (
          <li key={a.id} className="contents">
            {a.manualPlaceholder ? (
              <PlaceholderTile ability={a} />
            ) : (
              <button
                type="button"
                onClick={() => {
                  const idx = realIndexById.get(a.id);
                  if (idx !== undefined) setLightboxIndex(idx);
                }}
                className="panel overflow-hidden text-left active:scale-[0.99] transition-transform group"
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
                <div className="p-3 border-t border-ember-700/15">
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

      {lightboxIndex !== null ? (
        <CardLightbox
          abilities={realAbilities}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </>
  );
}
