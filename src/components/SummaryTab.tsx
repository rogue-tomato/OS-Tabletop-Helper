import { useMemo } from 'react';
import type { Ability, Character } from '../types';
import { PlaceholderImage } from './PlaceholderImage';

type Props = {
  character: Character;
};

function findCoreCard(character: Character): Ability | undefined {
  // Cooldown 0 starter card. We rely on the cost string the adapter
  // synthesises from the cooldown number ("Cooldown 0").
  return character.abilities.find(
    (a) => a.cost === 'Cooldown 0' || a.manualPlaceholder === true,
  );
}

export function SummaryTab({ character }: Props) {
  const coreCard = useMemo(() => findCoreCard(character), [character]);

  return (
    <div className="space-y-4">
      <section className="panel p-4">
        <h3 className="section-header font-display text-ember-400 tracking-wider uppercase text-sm">
          Special Ability
        </h3>
        <ul className="space-y-3">
          {character.specialAbility.map((sa) => (
            <li key={sa.title}>
              <p className="text-bone font-semibold">{sa.title}</p>
              <p className="text-bone/85 text-[15px] mt-1 leading-relaxed">
                {sa.text}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel p-4">
        <h3 className="section-header font-display text-ember-400 tracking-wider uppercase text-sm">
          Can Equip
        </h3>
        <p className="text-bone/85 text-[15px] leading-relaxed">
          {character.canEquip}
        </p>
      </section>

      <section className="panel p-4">
        <h3 className="section-header font-display text-ember-400 tracking-wider uppercase text-sm">
          Playstyle
        </h3>
        <p className="text-bone/85 text-[15px] leading-relaxed">
          {character.playstyle}
        </p>
      </section>

      <section className="panel p-4">
        <h3 className="section-header font-display text-ember-400 tracking-wider uppercase text-sm">
          CD 0 Core Card
        </h3>
        {coreCard ? <CoreCardTile ability={coreCard} /> : <NoCoreCardNote />}
      </section>
    </div>
  );
}

function CoreCardTile({ ability }: { ability: Ability }) {
  if (ability.manualPlaceholder) {
    return (
      <div className="rounded-md border-2 border-dashed border-ember-700/50 bg-ink-900/40 overflow-hidden flex flex-col sm:flex-row">
        <div className="relative aspect-[3/4] sm:w-48 sm:flex-shrink-0 flex items-center justify-center bg-ink-800/40 [background-image:repeating-linear-gradient(45deg,_rgba(245,200,120,0.05)_0,_rgba(245,200,120,0.05)_8px,_transparent_8px,_transparent_16px)]">
          <div className="text-center px-4">
            <p className="font-display tracking-widest uppercase text-ember-400/85 text-[13px] leading-snug">
              {ability.name}
            </p>
            <p className="mt-2 text-bone/70 text-[13px] leading-snug italic">
              Manual placeholder — needs source
            </p>
          </div>
        </div>
        <div className="p-3 sm:p-4 border-t sm:border-t-0 sm:border-l border-ember-700/20 flex-1">
          <p className="text-bone font-medium text-[15px] leading-snug">
            {ability.name}
          </p>
          <p className="text-amber-300/80 text-[13px] mt-0.5 italic">
            Manual placeholder · needs source
          </p>
          {ability.cardImage ? (
            <p className="mt-3 text-[11px] text-bone/55 break-all font-mono leading-snug">
              Drop image at: {ability.cardImage}
            </p>
          ) : null}
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-md border border-ember-700/30 bg-ink-900/60 overflow-hidden flex flex-col sm:flex-row">
      <div className="relative aspect-[3/4] sm:w-48 sm:flex-shrink-0 bg-ink-800">
        <PlaceholderImage
          src={ability.cardImage}
          alt={ability.name}
          className="absolute inset-0 h-full w-full object-contain p-2"
          fallbackLabel={ability.name}
        />
      </div>
      <div className="p-3 sm:p-4 border-t sm:border-t-0 sm:border-l border-ember-700/20 flex-1">
        <p className="text-bone font-medium text-[16px] leading-snug">
          {ability.name}
        </p>
        {ability.cost ? (
          <p className="text-bone/60 text-[13px] mt-0.5">{ability.cost}</p>
        ) : null}
        <p className="text-bone/85 text-[14px] mt-2 leading-relaxed">
          {ability.summary}
        </p>
      </div>
    </div>
  );
}

function NoCoreCardNote() {
  return (
    <p className="text-bone/70 text-[15px] italic leading-relaxed">
      This character has no single cooldown-0 starter card — see the Cards tab
      for the starting pool.
    </p>
  );
}
