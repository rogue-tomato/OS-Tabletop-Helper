import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { SearchInput } from '../components/SearchInput';
import { CharacterList } from '../components/CharacterList';
import { EmptyState } from '../components/EmptyState';
import { characters } from '../data/characters';
import { assetUrl, mediumUrl } from '../lib/assets';
import { prefetchImageOnce, scheduleIdle } from '../lib/prefetch';
import type { Character } from '../types';

const SCROLL_KEY = 'home-scroll-y';

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return characters;
    return characters.filter((c) => haystackBySlug[c.slug].includes(q));
  }, [query]);

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

  // Warm the cache for every character's PREVIEW hero variant after
  // idle. We pick mobile vs desktop variant once at idle time based on
  // the current viewport — so a phone never burns bandwidth on
  // landscape desktop crops, and vice versa. Falls back through
  // heroArtDesktop → mediumUrl(art) when explicit variants aren't
  // configured. Full-resolution lightbox sources are NOT prefetched
  // here (would be wasteful for 12 characters); CharacterPage
  // prefetches the full variant for its own character on mount.
  useEffect(() => {
    const handle = scheduleIdle(() => {
      const isDesktop =
        typeof window !== 'undefined' &&
        window.matchMedia('(min-width: 640px)').matches;
      for (const c of characters) {
        const desktopSrc = c.heroArtDesktop ?? mediumUrl(c.art);
        const mobileSrc = c.heroArtMobile ?? desktopSrc;
        const primary = isDesktop ? desktopSrc : mobileSrc;
        prefetchImageOnce(assetUrl(primary));
        // Warm the other viewport variant too so a resize across the
        // 768px breakpoint never hits a cold fetch. dedups if same URL.
        const secondary = isDesktop ? mobileSrc : desktopSrc;
        if (secondary !== primary) {
          prefetchImageOnce(assetUrl(secondary));
        }
      }
    });
    return () => handle.cancel();
  }, []);

  return (
    <Layout title="Free Company Recruits">
      <div className="space-y-4">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by name, role, ability, or weapon…"
        />
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
