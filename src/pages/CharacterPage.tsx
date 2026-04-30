import { useState, type CSSProperties } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Tabs } from '../components/Tabs';
import { SummaryTab } from '../components/SummaryTab';
import { CardsTab } from '../components/CardsTab';
import { LoreTab } from '../components/LoreTab';
import { PlaceholderImage } from '../components/PlaceholderImage';
import { ArtLightbox } from '../components/ArtLightbox';
import { findCharacter } from '../data/characters';

type TabId = 'summary' | 'cards' | 'lore';

const TAB_DEFS: { id: TabId; label: string }[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'cards', label: 'Cards' },
  { id: 'lore', label: 'Lore' },
];

export function CharacterPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const character = findCharacter(slug);
  const [active, setActive] = useState<TabId>('summary');
  const [artOpen, setArtOpen] = useState(false);

  if (!character) {
    return <Navigate to="/" replace />;
  }

  // Per-character focal points — fed in via CSS variables and consumed
  // by `.hero-art` rules in index.css.
  const heroVarsStyle = {
    '--hero-pos-mobile': character.heroObjectPositionMobile ?? '25% center',
    '--hero-pos-desktop':
      character.heroObjectPositionDesktop ?? 'center center',
  } as CSSProperties;

  return (
    <Layout title={character.name} showBack>
      <div className="space-y-4">
        <section className="relative -mx-4 sm:mx-0 sm:rounded-md overflow-hidden border-y sm:border border-ember-700/30 bg-ink-900">
          <button
            type="button"
            onClick={() => setArtOpen(true)}
            aria-label={`Open ${character.name} full art`}
            className="block w-full text-left active:opacity-95"
          >
            <div
              className="relative aspect-[4/5] sm:aspect-[16/9]"
              style={heroVarsStyle}
            >
              <PlaceholderImage
                src={character.art}
                alt={character.name}
                loading="eager"
                className="hero-art absolute inset-0 h-full w-full object-cover"
                fallbackLabel={character.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-none">
                <h2 className="font-display text-2xl sm:text-3xl text-ember-400 tracking-wide leading-tight text-balance">
                  {character.name}
                </h2>
                <p className="text-bone/85 text-[15px] mt-1 leading-snug">
                  {character.role}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-full bg-ink-800/80 border border-ember-700/40 text-ember-400 backdrop-blur-sm pointer-events-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M15 3h6v6" />
                  <path d="M9 21H3v-6" />
                  <path d="m21 3-7 7" />
                  <path d="m3 21 7-7" />
                </svg>
              </span>
            </div>
          </button>
        </section>

        <Tabs tabs={TAB_DEFS} active={active} onChange={setActive} />

        <div role="tabpanel">
          {active === 'summary' ? <SummaryTab character={character} /> : null}
          {active === 'cards' ? <CardsTab character={character} /> : null}
          {active === 'lore' ? <LoreTab character={character} /> : null}
        </div>
      </div>

      {artOpen ? (
        <ArtLightbox
          src={character.art}
          alt={character.name}
          onClose={() => setArtOpen(false)}
        />
      ) : null}
    </Layout>
  );
}
