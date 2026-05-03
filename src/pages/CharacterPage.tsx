import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Tabs } from '../components/Tabs';
import { SummaryTab } from '../components/SummaryTab';
import { CardsTab } from '../components/CardsTab';
import { LoreTab } from '../components/LoreTab';
import { ArtLightbox } from '../components/ArtLightbox';
import { ComplexityStars } from '../components/ComplexityStars';
import { SearchInput } from '../components/SearchInput';
import { SearchResults } from '../components/SearchResults';
import { findCharacter } from '../data/characters';
import { assetUrl, mediumUrl, thumbUrl } from '../lib/assets';
import { prefetchImageOnce, scheduleIdle } from '../lib/prefetch';
import { getLevelGate, type CardLevel } from '../data/levelGates';

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
  const [searchQuery, setSearchQuery] = useState('');
  const trimmedQuery = searchQuery.trim();
  const isSearching = trimmedQuery.length > 0;

  // Anchor element for measuring the visual position of the tabs row.
  const tabsRef = useRef<HTMLDivElement>(null);

  // Bug 2 fix: when the URL slug changes (i.e. the user opens a
  // different character), reset the page scroll so the new hero art
  // is visible. Switching tabs does NOT change `slug`, so this effect
  // does not run on tab change.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  // Hero image: preload the viewport-correct preview variant
  // (mobile/desktop) immediately so React commits with the right
  // resource already in flight. After idle, prefetch the
  // full-resolution lightbox source for the CURRENT character only
  // (not all 12) plus revealed-level card thumbs. All calls go through
  // prefetchImageOnce, so re-mounts via Back→Forward never accumulate
  // duplicate <link> tags.
  useEffect(() => {
    if (!character) return;

    // Recompute the hero variant chain inline so this effect is safe
    // to declare before the early-return guard below (TS hoisting
    // rules don't let us reuse the JSX-side const declarations here).
    const desktop = character.heroArtDesktop ?? mediumUrl(character.art);
    const mobile = character.heroArtMobile ?? desktop;
    const full =
      character.heroArtFull ?? character.heroArtDesktop ?? character.art;

    const isDesktop =
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 640px)').matches;
    const previewSrc = isDesktop ? desktop : mobile;
    prefetchImageOnce(assetUrl(previewSrc), 'preload');

    const handle = scheduleIdle(() => {
      // Warm the OTHER viewport's variant too, so resizing the
      // browser window across the 768px breakpoint doesn't trigger a
      // fresh cold-cache fetch when <picture> swaps sources. Cheap if
      // mobile===desktop (no overrides) — prefetchImageOnce dedups.
      const otherSrc = isDesktop ? mobile : desktop;
      if (otherSrc !== previewSrc) {
        prefetchImageOnce(assetUrl(otherSrc));
      }

      // Full art for the lightbox — only the current character's full
      // variant, not all 12. Browser still treats this as low-priority
      // because rel=prefetch.
      prefetchImageOnce(assetUrl(full));

      const allCards = [
        ...character.abilities,
        ...(character.unlockedAbilities ?? []),
      ];
      for (const a of allCards) {
        const lvl = a.level as CardLevel;
        const known = ([1, 2, 5, 10, 15] as CardLevel[]).includes(lvl);
        if (known && !getLevelGate(character.slug, lvl).revealed) continue;
        const thumb = a.cardImageThumb ?? thumbUrl(a.cardImage);
        prefetchImageOnce(assetUrl(thumb));
      }
    });

    return () => handle.cancel();
  }, [character]);

  // Bug 1 fix: switching from a long tab (Cards) to a short one
  // (Lore) makes the document shorter, which forces the browser to
  // clamp `scrollY` and visibly jump the page. We compensate:
  //
  //   1. Capture the tabs row's `getBoundingClientRect().top` BEFORE
  //      the React state change.
  //   2. Update the active tab.
  //   3. After the new tab content has been laid out (two rAF ticks),
  //      measure the tabs row again and `scrollBy` the difference, so
  //      the tabs row stays at the same visual Y on screen.
  //
  // If the new document is genuinely shorter than the old scroll
  // position can support, the browser still clamps — but the tabs row
  // ends up as close as possible to its prior visual position, which
  // is what the user perceives as "stable".
  const handleTabChange = useCallback((next: TabId) => {
    const oldTop = tabsRef.current?.getBoundingClientRect().top ?? null;
    setActive(next);
    if (oldTop === null) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const newTop =
          tabsRef.current?.getBoundingClientRect().top ?? oldTop;
        const delta = newTop - oldTop;
        if (Math.abs(delta) > 1) {
          window.scrollBy({ top: delta, behavior: 'auto' });
        }
      });
    });
  }, []);

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

  // Hero variant resolution. The mobile/desktop split is rendered via a
  // <picture> element so the browser picks the right source itself; if
  // a variant isn't configured we fall back to the medium-resolution
  // crop of the legacy `art` field. The fullscreen lightbox uses the
  // full-resolution variant when available, otherwise the desktop
  // variant, otherwise the original `art`.
  const desktopHeroSrc = character.heroArtDesktop ?? mediumUrl(character.art);
  const mobileHeroSrc = character.heroArtMobile ?? desktopHeroSrc;
  const fullHeroSrc =
    character.heroArtFull ?? character.heroArtDesktop ?? character.art;

  return (
    <Layout title="Back" showBack>
      <div className="space-y-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search this sheet — name, cooldown, ability, lore…"
        />

        <section className="relative overflow-hidden border border-ember-700/30 bg-ink-900">
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
              <picture>
                <source
                  media="(min-width: 640px)"
                  srcSet={assetUrl(desktopHeroSrc)}
                />
                <img
                  src={assetUrl(mobileHeroSrc)}
                  alt={character.name}
                  loading="eager"
                  decoding="sync"
                  className="hero-art absolute inset-0 h-full w-full object-cover"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-none">
                <h2 className="font-display text-2xl sm:text-3xl text-accent tracking-wide leading-tight text-balance">
                  {character.name}
                </h2>
                <p className="text-bone/85 text-[15px] mt-1 leading-snug flex items-center gap-2 flex-wrap">
                  <span>{character.role}</span>
                  {character.complexity ? (
                    <ComplexityStars rating={character.complexity} size="hero" />
                  ) : null}
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

        {isSearching ? (
          <div role="region" aria-label="Search results" className="min-h-[80vh]">
            <SearchResults character={character} query={trimmedQuery} />
          </div>
        ) : (
          <>
            <div ref={tabsRef}>
              <Tabs tabs={TAB_DEFS} active={active} onChange={handleTabChange} />
            </div>

            {/* The tab panel reserves at least most of a viewport so a short
                tab (e.g. Lore) doesn't collapse the document. Combined with
                the scroll-pin logic above, this keeps tab switching stable
                on both mobile and desktop. */}
            <div role="tabpanel" className="min-h-[80vh]">
              {active === 'summary' ? <SummaryTab character={character} /> : null}
              {active === 'cards' ? <CardsTab character={character} /> : null}
              {active === 'lore' ? <LoreTab character={character} /> : null}
            </div>
          </>
        )}
      </div>

      {artOpen ? (
        <ArtLightbox
          src={fullHeroSrc}
          alt={character.name}
          onClose={() => setArtOpen(false)}
        />
      ) : null}
    </Layout>
  );
}
