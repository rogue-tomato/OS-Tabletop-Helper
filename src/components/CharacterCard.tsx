import { Link } from 'react-router-dom';
import type { Character } from '../types';
import { PlaceholderImage } from './PlaceholderImage';

type Props = {
  character: Character;
};

export function CharacterCard({ character }: Props) {
  return (
    <Link
      to={`/character/${character.slug}`}
      className="group panel overflow-hidden flex flex-col active:scale-[0.99] transition-transform"
      aria-label={`Open ${character.name}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-ink-800">
        <PlaceholderImage
          src={character.art}
          alt={character.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          fallbackLabel={character.name}
        />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink-950 via-ink-950/85 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <h2 className="font-display text-base sm:text-lg text-ember-400 tracking-wide leading-tight text-balance">
            {character.name}
          </h2>
          <p className="text-[13px] text-bone/80 mt-0.5 line-clamp-2 leading-snug">
            {character.role}
          </p>
        </div>
      </div>
    </Link>
  );
}
