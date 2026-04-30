import type { Character } from '../types';
import { CharacterCard } from './CharacterCard';

type Props = {
  characters: Character[];
};

export function CharacterList({ characters }: Props) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
      {characters.map((c) => (
        <li key={c.id} className="contents">
          <CharacterCard character={c} />
        </li>
      ))}
    </ul>
  );
}
