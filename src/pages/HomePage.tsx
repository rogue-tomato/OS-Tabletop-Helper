import { useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { SearchInput } from '../components/SearchInput';
import { CharacterList } from '../components/CharacterList';
import { EmptyState } from '../components/EmptyState';
import { characters } from '../data/characters';
import type { Character } from '../types';

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

  return (
    <Layout title="Oathsworn Character Sheets">
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
