import { useMemo } from 'react';
import type { Character } from '../types';

type Props = {
  character: Character;
};

export function SummaryTab({ character }: Props) {
  const { confirmed, placeholders } = useMemo(() => {
    const c = [];
    const p = [];
    for (const a of character.abilities) {
      if (a.manualPlaceholder) p.push(a);
      else c.push(a);
    }
    return { confirmed: c, placeholders: p };
  }, [character.abilities]);

  return (
    <div className="space-y-4">
      <section className="panel p-4">
        <h3 className="font-display text-ember-400 tracking-wider uppercase text-sm mb-2">
          Special Ability
        </h3>
        <ul className="space-y-3">
          {character.specialAbility.map((sa) => (
            <li key={sa.title}>
              <p className="text-bone font-semibold">{sa.title}</p>
              <p className="text-bone/85 text-[15px] mt-1 leading-relaxed">{sa.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel p-4">
        <h3 className="font-display text-ember-400 tracking-wider uppercase text-sm mb-2">
          Can Equip
        </h3>
        <p className="text-bone/85 text-[15px] leading-relaxed">{character.canEquip}</p>
      </section>

      <section className="panel p-4">
        <h3 className="font-display text-ember-400 tracking-wider uppercase text-sm mb-2">
          Playstyle
        </h3>
        <p className="text-bone/85 text-[15px] leading-relaxed">{character.playstyle}</p>
      </section>

      {character.uniqueMechanics && character.uniqueMechanics.length > 0 ? (
        <section className="panel p-4">
          <h3 className="font-display text-ember-400 tracking-wider uppercase text-sm mb-2">
            Unique Mechanics
          </h3>
          <ul className="list-disc pl-5 space-y-1.5 text-bone/85 text-[15px] leading-relaxed">
            {character.uniqueMechanics.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="panel p-4">
        <h3 className="font-display text-ember-400 tracking-wider uppercase text-sm mb-3">
          Level 1 Abilities
        </h3>
        {confirmed.length > 0 ? (
          <ul className="space-y-2.5">
            {confirmed.map((a) => (
              <li
                key={a.id}
                className="flex items-start justify-between gap-3 border-b border-ember-700/10 last:border-b-0 pb-2.5 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-bone font-medium leading-snug">{a.name}</p>
                  <p className="text-bone/70 text-sm mt-0.5 leading-relaxed">{a.summary}</p>
                </div>
                {a.cost ? (
                  <span className="shrink-0 text-[12px] font-display tracking-wide uppercase text-ember-400/90 bg-ember-700/15 border border-ember-700/30 rounded-md px-2 py-1">
                    {a.cost}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-bone/70 text-[15px] italic">
            No verified Level 1 cards yet.
          </p>
        )}
      </section>

      {placeholders.length > 0 ? (
        <section className="rounded-2xl border-2 border-dashed border-ember-700/50 bg-ink-900/40 p-4">
          <h3 className="font-display text-amber-300/90 tracking-wider uppercase text-sm mb-1">
            Missing Cards
          </h3>
          <p className="text-bone/70 text-[14px] leading-relaxed mb-3">
            These slots are known to exist in the printed game but are not
            transcribed in any of the captured sources yet. Fill them via
            <code className="mx-1 px-1 py-0.5 rounded bg-ink-800/70 text-bone/80 text-[12px]">
              src/data/manualAbilityFillTemplate.ts
            </code>
            and reload.
          </p>
          <ul className="space-y-2.5">
            {placeholders.map((a) => (
              <li
                key={a.id}
                className="flex items-start justify-between gap-3 border-t border-ember-700/15 first:border-t-0 pt-2.5 first:pt-0"
              >
                <div className="min-w-0">
                  <p className="text-bone font-medium leading-snug">{a.name}</p>
                  <p className="text-amber-300/80 text-sm mt-0.5 italic leading-relaxed">
                    Manual placeholder — needs source
                  </p>
                </div>
                {a.cost ? (
                  <span className="shrink-0 text-[12px] font-display tracking-wide uppercase text-amber-300/90 bg-amber-700/10 border border-amber-500/30 rounded-md px-2 py-1">
                    {a.cost}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
