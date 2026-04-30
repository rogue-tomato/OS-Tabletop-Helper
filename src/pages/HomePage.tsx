import { useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { SearchInput } from '../components/SearchInput';
import { CharacterList } from '../components/CharacterList';
import { EmptyState } from '../components/EmptyState';
import { characters } from '../data/characters';

export function HomePage() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return characters;
    return characters.filter((c) => {
      const haystack = `${c.name} ${c.role} ${c.playstyle}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  return (
    <Layout title="Oathsworn Character Sheets">
      <div className="space-y-4">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by name or role…" />
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
