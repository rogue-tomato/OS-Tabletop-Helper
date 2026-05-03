import type { Character } from '../types';
import { CharacterCard } from './CharacterCard';

type Props = {
  characters: Character[];
};

// First N tiles get loading="eager" so they paint immediately on a
// cold cache; the rest are lazy and the browser handles them on
// scroll. Six covers ≈ first viewport on a 3-col desktop grid and
// roughly the first three rows of a 2-col mobile grid.
const EAGER_COUNT = 6;

export function CharacterList({ characters }: Props) {
  return (
    <div
      role="list"
      className="character-list grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3"
    >
      {characters.map((c, i) => (
        <CharacterCard
          key={c.id}
          character={c}
          eager={i < EAGER_COUNT}
        />
      ))}
    </div>
  );
}
