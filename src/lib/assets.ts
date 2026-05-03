// Resolves a public asset path so it works under any Vite base.
// Pass paths WITHOUT a leading slash (e.g. "characters/warden/art.webp").
export const assetUrl = (path: string): string => {
  const base = import.meta.env.BASE_URL || '/';
  const normalised = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${normalised}`;
};

// Converts "foo/bar.webp" → "foo/bar.thumb.webp". Used for list tiles
// where a 400-pixel-wide image is plenty; the lightbox loads the full
// resolution version on demand. Non-webp paths pass through unchanged.
export const thumbUrl = (path: string): string => {
  if (!path.endsWith('.webp')) return path;
  if (path.endsWith('.thumb.webp') || path.endsWith('.medium.webp')) return path;
  return path.slice(0, -'.webp'.length) + '.thumb.webp';
};

// Converts "foo/art.webp" → "foo/art.medium.webp". Used by the hero
// panel on a character page (1500w is plenty without retina blow-up).
// The lightbox keeps using the full-resolution original.
export const mediumUrl = (path: string): string => {
  if (!path.endsWith('.webp')) return path;
  if (path.endsWith('.medium.webp') || path.endsWith('.thumb.webp')) return path;
  return path.slice(0, -'.webp'.length) + '.medium.webp';
};
