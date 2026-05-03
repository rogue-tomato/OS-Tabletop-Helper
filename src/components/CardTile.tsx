import type { Ability } from '../types';
import { PlaceholderImage } from './PlaceholderImage';
import { thumbUrl } from '../lib/assets';

function PlaceholderTile({ ability }: { ability: Ability }) {
  return (
    <div
      role="figure"
      aria-label={`${ability.name} — manual placeholder`}
      className="border-2 border-dashed border-ember-700/50 bg-ink-900/40 overflow-hidden flex flex-col h-full"
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
        <p className="text-accent font-medium text-[15px] leading-snug line-clamp-2">
          {ability.name}
        </p>
        <p className="text-amber-300/80 text-[13px] mt-0.5">
          Manual placeholder · needs source
        </p>
      </div>
    </div>
  );
}

export function CardTile({
  ability,
  onClick,
}: {
  ability: Ability;
  onClick: () => void;
}) {
  if (ability.manualPlaceholder) {
    return <PlaceholderTile ability={ability} />;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full h-full border border-ember-700/30 bg-ink-900/60 overflow-hidden text-left active:scale-[0.99] transition-transform"
      aria-label={`Open ${ability.name} card full-screen`}
    >
      <div className="relative aspect-[3/4] bg-ink-800">
        <PlaceholderImage
          src={ability.cardImageThumb ?? thumbUrl(ability.cardImage)}
          fallbackSrc={ability.cardImage}
          alt={ability.name}
          className="absolute inset-0 h-full w-full object-contain p-2"
          fallbackLabel={ability.name}
        />
      </div>
      <div className="p-3 border-t border-ember-700/20">
        <p className="text-accent font-medium text-[15px] leading-snug line-clamp-2">
          {ability.name}
        </p>
        <p className="text-bone/60 text-[13px] mt-0.5">
          {ability.cost ?? `Level ${ability.level}`}
        </p>
      </div>
    </button>
  );
}
