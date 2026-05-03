import { Fragment, type ReactNode } from 'react';

// Splits `text` around every case-insensitive occurrence of `query`
// and wraps each match in a styled <mark>. Returns plain text when
// the query is empty or has no matches, so callers can drop it in
// anywhere a string would normally render.
export function highlightMatch(text: string, query: string): ReactNode {
  if (!query) return text;
  const lower = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  if (!lower.includes(lowerQuery)) return text;
  const parts: ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < text.length) {
    const idx = lower.indexOf(lowerQuery, i);
    if (idx === -1) {
      parts.push(<Fragment key={key++}>{text.slice(i)}</Fragment>);
      break;
    }
    if (idx > i) {
      parts.push(<Fragment key={key++}>{text.slice(i, idx)}</Fragment>);
    }
    parts.push(
      <mark
        key={key++}
        className="bg-accent/30 text-bone rounded-sm px-0.5"
      >
        {text.slice(idx, idx + query.length)}
      </mark>,
    );
    i = idx + query.length;
  }
  return <>{parts}</>;
}

export function textHasMatch(text: string | undefined, query: string): boolean {
  if (!text || !query) return false;
  return text.toLowerCase().includes(query.toLowerCase());
}
