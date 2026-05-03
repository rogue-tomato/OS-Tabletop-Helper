import { Link } from 'react-router-dom';
import type { Character } from '../types';
import { PlaceholderImage } from './PlaceholderImage';
import { thumbUrl } from '../lib/assets';

type Props = {
  character: Character;
  /** When true, the cover image is fetched eagerly (first viewport).
   *  When false, the browser handles it lazily on scroll. */
  eager?: boolean;
};

export function CharacterCard({ character, eager = false }: Props) {
  // Use the 400w thumbnail for tile rendering. If a thumb is missing
  // (e.g. a freshly added character that hasn't been processed yet),
  // PlaceholderImage falls back to the full-size `art` and then to a
  // text panel.
  const cover = character.listImage ?? character.art;
  const primarySrc = thumbUrl(cover);
  const fallbackSrc = character.art;

  return (
    <Link
      to={`/character/${character.slug}`}
      role="listitem"
      className="group ornate-card overflow-hidden flex flex-col active:scale-[0.99]"
      aria-label={`Open ${character.name}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-ink-800">
        <PlaceholderImage
          src={primarySrc}
          fallbackSrc={fallbackSrc}
          alt={character.name}
          loading={eager ? 'eager' : 'lazy'}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.2]"
          fallbackLabel={character.name}
        />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink-950 via-ink-950/85 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <h2 className="font-display text-base sm:text-lg text-accent tracking-wide leading-tight text-balance">
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
