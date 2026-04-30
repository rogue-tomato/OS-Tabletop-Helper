import type { Ability, Character } from '../types';

type Props = {
  character: Character;
};

function AbilityCard({ ability }: { ability: Ability }) {
  const isPlaceholder = ability.manualPlaceholder === true;
  return (
    <article
      className={
        isPlaceholder
          ? 'rounded-2xl border-2 border-dashed border-ember-700/50 bg-ink-900/40 p-4'
          : 'panel p-4'
      }
    >
      <header className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h3 className="text-bone font-semibold text-lg leading-snug">
            {ability.name}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="text-[12px] font-display tracking-wide uppercase text-ember-400/90 bg-ember-700/15 border border-ember-700/30 rounded-md px-2 py-0.5">
              Level {ability.level}
            </span>
            {ability.cost ? (
              <span className="text-[12px] font-display tracking-wide uppercase text-ember-400/90 bg-ember-700/15 border border-ember-700/30 rounded-md px-2 py-0.5">
                {ability.cost}
              </span>
            ) : null}
            {isPlaceholder ? (
              <span className="text-[12px] font-display tracking-wide uppercase text-amber-300/95 bg-amber-700/15 border border-amber-500/40 rounded-md px-2 py-0.5">
                Manual placeholder
              </span>
            ) : ability.needsVerification ? (
              <span className="text-[12px] font-display tracking-wide uppercase text-amber-300/90 bg-amber-700/10 border border-amber-500/30 rounded-md px-2 py-0.5">
                TBD
              </span>
            ) : null}
          </div>
        </div>
      </header>
      {isPlaceholder ? (
        <>
          <p className="text-amber-300/85 text-[15px] leading-relaxed italic">
            Needs source — no verified card name, cost, defense, or rules text yet.
          </p>
          {ability.cardImage ? (
            <p className="mt-2 text-[12px] text-bone/55 break-all font-mono leading-snug">
              Drop card image at: {ability.cardImage}
            </p>
          ) : null}
        </>
      ) : (
        <>
          <p className="text-bone/85 text-[15px] leading-relaxed">{ability.summary}</p>
          {ability.fullText ? (
            <>
              <div className="gold-divider my-3" />
              <p className="text-bone/80 text-[15px] leading-relaxed whitespace-pre-line">
                {ability.fullText}
              </p>
            </>
          ) : null}
        </>
      )}
    </article>
  );
}

export function AbilitiesTab({ character }: Props) {
  const unlocked = character.unlockedAbilities ?? [];
  return (
    <div className="space-y-4">
      <section>
        <h3 className="font-display text-ember-400 tracking-wider uppercase text-sm mb-2 px-1">
          Level 1
        </h3>
        <div className="space-y-3">
          {character.abilities.map((a) => (
            <AbilityCard key={a.id} ability={a} />
          ))}
        </div>
      </section>
      {unlocked.length > 0 ? (
        <section>
          <h3 className="font-display text-ember-400 tracking-wider uppercase text-sm mb-2 px-1 mt-2">
            Unlockable
          </h3>
          <div className="space-y-3">
            {unlocked.map((a) => (
              <AbilityCard key={a.id} ability={a} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
