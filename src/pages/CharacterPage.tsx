import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Tabs } from '../components/Tabs';
import { SummaryTab } from '../components/SummaryTab';
import { AbilitiesTab } from '../components/AbilitiesTab';
import { CardsTab } from '../components/CardsTab';
import { LoreTab } from '../components/LoreTab';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { findCharacter } from '../data/characters';

type TabId = 'summary' | 'abilities' | 'cards' | 'lore';

const TAB_DEFS: { id: TabId; label: string }[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'abilities', label: 'Abilities' },
  { id: 'cards', label: 'Cards' },
  { id: 'lore', label: 'Lore' },
];

export function CharacterPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const character = findCharacter(slug);
  const [active, setActive] = useState<TabId>('summary');

  if (!character) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout title={character.name} showBack>
      <div className="space-y-4">
        <section className="relative -mx-4 sm:mx-0 sm:rounded-2xl overflow-hidden border-y sm:border border-ember-700/20 bg-ink-900">
          <div className="relative aspect-[4/5] sm:aspect-[16/9]">
            <PlaceholderImage
              src={character.art}
              alt={character.name}
              loading="eager"
              className="absolute inset-0 h-full w-full object-cover"
              fallbackLabel={character.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h2 className="font-display text-2xl sm:text-3xl text-ember-400 tracking-wide leading-tight text-balance">
                {character.name}
              </h2>
              <p className="text-bone/85 text-[15px] mt-1 leading-snug">
                {character.role}
              </p>
            </div>
          </div>
          <div className="p-4 border-t border-ember-700/15">
            <p className="text-bone/85 text-[15px] leading-relaxed">
              {character.playstyle}
            </p>
          </div>
        </section>

        <Tabs tabs={TAB_DEFS} active={active} onChange={setActive} />

        <div role="tabpanel">
          {active === 'summary' ? <SummaryTab character={character} /> : null}
          {active === 'abilities' ? <AbilitiesTab character={character} /> : null}
          {active === 'cards' ? <CardsTab character={character} /> : null}
          {active === 'lore' ? <LoreTab character={character} /> : null}
        </div>
      </div>
    </Layout>
  );
}
