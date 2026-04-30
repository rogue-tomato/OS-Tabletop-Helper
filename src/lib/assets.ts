// Resolves a public asset path so it works under any Vite base.
// Pass paths WITHOUT a leading slash (e.g. "characters/warden/art.jpg").
export const assetUrl = (path: string): string => {
  const base = import.meta.env.BASE_URL || '/';
  const normalised = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${normalised}`;
};
