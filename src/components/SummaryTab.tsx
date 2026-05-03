import type { Character } from '../types';
import { ComplexityStars } from './ComplexityStars';

type Props = {
  character: Character;
};

export function SummaryTab({ character }: Props) {
  return (
    <div className="space-y-4">
      {character.complexity ? (
        <section className="panel p-4 flex items-center gap-3 flex-wrap">
          <span className="font-display text-accent tracking-wider uppercase text-[17px]">
            Difficulty:
          </span>
          <ComplexityStars rating={character.complexity} size="hero" />
        </section>
      ) : null}

      <section className="panel p-4">
        <h3 className="section-header font-display text-accent tracking-wider uppercase text-[17px]">
          Available Equipment
        </h3>
        <p className="text-bone/85 text-[15px] leading-relaxed">
          {character.canEquip}
        </p>
      </section>

      <section className="panel p-4">
        <h3 className="section-header font-display text-accent tracking-wider uppercase text-[17px]">
          Special Ability
        </h3>
        <ul className="space-y-3">
          {character.specialAbility.map((sa) => (
            <li key={sa.title}>
              <p className="text-accent font-semibold">{sa.title}</p>
              <p className="text-bone/85 text-[15px] mt-1 leading-relaxed">
                {sa.text}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel p-4">
        <h3 className="section-header font-display text-accent tracking-wider uppercase text-[17px]">
          Playstyle
        </h3>
        <p className="text-bone/85 text-[15px] leading-relaxed whitespace-pre-line">
          {character.playstyle}
        </p>
      </section>
    </div>
  );
}
