import { useMemo, useState } from 'react';
import type { Ability, Character } from '../types';
import { CardTile } from './CardTile';
import { CardLightbox } from './CardLightbox';
import { highlightMatch, textHasMatch } from '../utils/highlight';
import { getLevelGate, type CardLevel } from '../data/levelGates';

const KNOWN_LEVELS: CardLevel[] = [1, 2, 5, 10, 15];

function isKnownLevel(level: number): level is CardLevel {
  return (KNOWN_LEVELS as number[]).includes(level);
}

type Props = {
  character: Character;
  query: string;
};

type LightboxState = { abilities: Ability[]; startIndex: number } | null;

function abilityMatches(a: Ability, q: string): boolean {
  if (textHasMatch(a.name, q)) return true;
  if (textHasMatch(a.cost, q)) return true;
  // `fullText` is the printed rules text from the card face. Most
  // entries don't have it populated yet, so this is a no-op until the
  // card text is transcribed. We deliberately skip `summary` — that's
  // our authoring note, not what the user can read on the card.
  if (textHasMatch(a.fullText, q)) return true;
  return false;
}

export function SearchResults({ character, query }: Props) {
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  const matchingAbilities = useMemo(() => {
    const all = [
      ...character.abilities,
      ...(character.unlockedAbilities ?? []),
    ];
    return all.filter((a) => {
      if (!abilityMatches(a, query)) return false;
      // Don't leak abilities locked behind a sealed level — that would
      // spoil progression. Unknown levels (shouldn't happen) pass through.
      if (!isKnownLevel(a.level)) return true;
      return getLevelGate(character.slug, a.level).revealed;
    });
  }, [character, query]);

  const realMatchingAbilities = useMemo(
    () => matchingAbilities.filter((a) => !a.manualPlaceholder),
    [matchingAbilities],
  );

  const equipmentMatch = textHasMatch(character.canEquip, query);
  const playstyleMatch = textHasMatch(character.playstyle, query);
  const loreMatch = textHasMatch(character.lore, query);
  const matchingSpecial = useMemo(
    () =>
      character.specialAbility.filter(
        (sa) => textHasMatch(sa.title, query) || textHasMatch(sa.text, query),
      ),
    [character.specialAbility, query],
  );

  const hasTextMatch =
    equipmentMatch ||
    playstyleMatch ||
    loreMatch ||
    matchingSpecial.length > 0;

  const hasAnyMatch = matchingAbilities.length > 0 || hasTextMatch;

  const openLightbox = (a: Ability) => {
    const idx = realMatchingAbilities.findIndex((x) => x.id === a.id);
    if (idx !== -1) {
      setLightbox({ abilities: realMatchingAbilities, startIndex: idx });
    }
  };

  if (!hasAnyMatch) {
    return (
      <div className="panel-soft p-6 text-center">
        <p className="text-bone/70 text-[15px]">
          No matches for "{query}" on this sheet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-bone/60 text-sm px-1">
        {matchingAbilities.length} card
        {matchingAbilities.length === 1 ? '' : 's'} ·{' '}
        {(equipmentMatch ? 1 : 0) +
          (playstyleMatch ? 1 : 0) +
          (loreMatch ? 1 : 0) +
          matchingSpecial.length}{' '}
        text match
        {(equipmentMatch ? 1 : 0) +
          (playstyleMatch ? 1 : 0) +
          (loreMatch ? 1 : 0) +
          matchingSpecial.length ===
        1
          ? ''
          : 'es'}
      </p>

      {matchingAbilities.length > 0 ? (
        <section>
          <h3 className="section-header font-display text-accent tracking-wider uppercase text-[17px] mb-3 px-1">
            Matching Cards
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0 m-0">
            {matchingAbilities.map((a) => (
              <li key={a.id}>
                <CardTile ability={a} onClick={() => openLightbox(a)} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {equipmentMatch ? (
        <section className="panel p-4">
          <h3 className="section-header font-display text-accent tracking-wider uppercase text-[17px]">
            Available Equipment
          </h3>
          <p className="text-bone/85 text-[15px] leading-relaxed">
            {highlightMatch(character.canEquip, query)}
          </p>
        </section>
      ) : null}

      {matchingSpecial.length > 0 ? (
        <section className="panel p-4">
          <h3 className="section-header font-display text-accent tracking-wider uppercase text-[17px]">
            Special Ability
          </h3>
          <ul className="space-y-3">
            {matchingSpecial.map((sa) => (
              <li key={sa.title}>
                <p className="text-accent font-semibold">
                  {highlightMatch(sa.title, query)}
                </p>
                <p className="text-bone/85 text-[15px] mt-1 leading-relaxed">
                  {highlightMatch(sa.text, query)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {playstyleMatch ? (
        <section className="panel p-4">
          <h3 className="section-header font-display text-accent tracking-wider uppercase text-[17px]">
            Playstyle
          </h3>
          <p className="text-bone/85 text-[15px] leading-relaxed whitespace-pre-line">
            {highlightMatch(character.playstyle, query)}
          </p>
        </section>
      ) : null}

      {loreMatch && character.lore ? (
        <section className="panel p-4">
          <h3 className="section-header font-display text-accent tracking-wider uppercase text-[17px]">
            Lore
          </h3>
          <p className="text-bone/90 text-[16px] leading-relaxed whitespace-pre-line">
            {highlightMatch(character.lore, query)}
          </p>
        </section>
      ) : null}

      {lightbox ? (
        <CardLightbox
          abilities={lightbox.abilities}
          startIndex={lightbox.startIndex}
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </div>
  );
}
