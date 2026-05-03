import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { SearchInput } from '../components/SearchInput';
import { CharacterList } from '../components/CharacterList';
import { EmptyState } from '../components/EmptyState';
import { SortMenu, type SortMode } from '../components/SortMenu';
import { characters } from '../data/characters';
import { assetUrl, mediumUrl, thumbUrl } from '../lib/assets';
import { preloadImageEager } from '../lib/prefetch';
import type { Character } from '../types';

const SCROLL_KEY = 'home-scroll-y';
const SORT_KEY = 'home-sort-mode';

function loadSavedSort(): SortMode {
  // Default is "complexity ascending" — easiest characters first, so a
  // new player lands on Ranger / Exile rather than Witch on first
  // visit. Choices persist in localStorage once the user picks one.
  if (typeof window === 'undefined') return 'complexity-asc';
  const saved = window.localStorage.getItem(SORT_KEY);
  if (
    saved === 'complexity-desc' ||
    saved === 'complexity-asc' ||
    saved === 'alpha-asc' ||
    saved === 'alpha-desc'
  ) {
    return saved;
  }
  return 'complexity-asc';
}

function listLabel(c: Character): string {
  return c.listName ?? c.name;
}

function applySort(list: Character[], mode: SortMode): Character[] {
  const sorted = [...list];
  switch (mode) {
    case 'complexity-desc':
      sorted.sort(
        (a, b) =>
          (b.complexity ?? 0) - (a.complexity ?? 0) ||
          listLabel(a).localeCompare(listLabel(b)),
      );
      break;
    case 'complexity-asc':
      sorted.sort(
        (a, b) =>
          (a.complexity ?? 0) - (b.complexity ?? 0) ||
          listLabel(a).localeCompare(listLabel(b)),
      );
      break;
    case 'alpha-desc':
      sorted.sort((a, b) => listLabel(b).localeCompare(listLabel(a)));
      break;
    case 'alpha-asc':
    default:
      sorted.sort((a, b) => listLabel(a).localeCompare(listLabel(b)));
      break;
  }
  return sorted;
}

// Builds a single lowercase haystack per character that the search box
// queries against. New strings added here are searchable immediately —
// e.g. ability names mean "Taunt" finds the Warden, canEquip means
// "bow" finds the Ranger and Huntress, searchTags means "summoner"
// finds the Grove Maiden.
function buildHaystack(c: Character): string {
  const parts: string[] = [c.name, c.role, c.playstyle, c.canEquip];
  if (c.searchTags) parts.push(c.searchTags.join(' '));
  for (const a of c.abilities) parts.push(a.name);
  if (c.unlockedAbilities) {
    for (const a of c.unlockedAbilities) parts.push(a.name);
  }
  for (const sa of c.specialAbility) parts.push(sa.title);
  return parts.join(' ').toLowerCase();
}

const haystackBySlug: Record<string, string> = Object.fromEntries(
  characters.map((c) => [c.slug, buildHaystack(c)]),
);

export function HomePage() {
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>(() => loadSavedSort());

  const onSortChange = (next: SortMode) => {
    setSortMode(next);
    try {
      window.localStorage.setItem(SORT_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? characters.filter((c) => haystackBySlug[c.slug].includes(q))
      : characters;
    return applySort(base, sortMode);
  }, [query, sortMode]);

  // Restore the previous list-scroll position on mount (e.g. when the
  // user hits Back from a character page). useLayoutEffect runs before
  // the browser paints, so the list never visibly jumps.
  useLayoutEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved !== null) {
      const y = parseInt(saved, 10);
      if (!Number.isNaN(y)) window.scrollTo(0, y);
    }
  }, []);

  // Persist scroll position so the next mount can restore it. We save
  // on every scroll (cheap — sessionStorage write of a small string)
  // plus once on unmount, so a fast Back navigation still has the
  // latest value.
  useEffect(() => {
    const save = () => {
      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    };
    window.addEventListener('scroll', save, { passive: true });
    return () => {
      save();
      window.removeEventListener('scroll', save);
    };
  }, []);

  // Aggressive cache warm: on first home mount, force-fetch every
  // character's hero variants (both viewport sizes) + every cover
  // thumb + every revealed card thumb via real <Image> instantiation.
  // Unlike <link rel="prefetch">, this runs at normal image priority
  // so the browser doesn't defer it behind the main bundle. The
  // Service Worker (sw.js) catches each response and stores it in a
  // long-lived cache, so subsequent character / lightbox openings
  // paint instantly from cache.
  useEffect(() => {
    for (const c of characters) {
      const desktopSrc = c.heroArtDesktop ?? mediumUrl(c.art);
      const mobileSrc = c.heroArtMobile ?? desktopSrc;
      preloadImageEager(assetUrl(desktopSrc));
      if (mobileSrc !== desktopSrc) {
        preloadImageEager(assetUrl(mobileSrc));
      }
      const cover = c.listImage ?? c.art;
      preloadImageEager(assetUrl(thumbUrl(cover)));

      // Card thumbs for the current character (revealed levels only —
      // hidden levels like Level 2 are skipped automatically because
      // their abilities are still in `unlockedAbilities`, but we don't
      // gate by `levelGates` here on purpose so all transcribed cards
      // get into the SW cache).
      const allCards = [...c.abilities, ...(c.unlockedAbilities ?? [])];
      for (const a of allCards) {
        const thumb = a.cardImageThumb ?? thumbUrl(a.cardImage);
        preloadImageEager(assetUrl(thumb));
      }
    }
  }, []);

  return (
    <Layout title="Free Company Recruits">
      <div className="space-y-4">
        <div className="flex items-stretch gap-2">
          <SortMenu value={sortMode} onChange={onSortChange} />
          <div className="flex-1 min-w-0">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search by name, role, ability, or weapon…"
            />
          </div>
        </div>
        {filtered.length > 0 ? (
          <CharacterList characters={filtered} />
        ) : (
          <EmptyState
            title="No characters found"
            description="Try a different search term."
          />
        )}
      </div>
    </Layout>
  );
}
