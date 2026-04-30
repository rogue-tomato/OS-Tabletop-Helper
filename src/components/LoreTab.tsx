import type { Character } from '../types';

type Props = {
  character: Character;
};

export function LoreTab({ character }: Props) {
  if (!character.lore) {
    return (
      <div className="panel-soft p-6 text-center">
        <p className="text-bone/70 text-[15px]">No lore added yet.</p>
      </div>
    );
  }
  return (
    <article className="panel p-4">
      <p className="text-bone/90 text-[16px] leading-relaxed whitespace-pre-line">
        {character.lore}
      </p>
    </article>
  );
}
