import type { Complexity } from '../types';

type Props = {
  /** Complexity rating, 1–5. When undefined, the component renders
   *  nothing — characters without a rating just don't show stars. */
  rating?: Complexity;
  /** Tile (small, used as overlay on a list card) or hero
   *  (slightly larger, sits inline with the role line). */
  size?: 'tile' | 'hero';
  /** Extra classes applied to the wrapping span. */
  className?: string;
};

// Four-pointed glyphs (BLACK / WHITE FOUR POINTED STAR, U+2726 / U+2727).
// Always render all 5 slots — filled for the rating, empty for the rest.
const FILLED = '✦';
const EMPTY = '✧';

export function ComplexityStars({
  rating,
  size = 'tile',
  className = '',
}: Props) {
  if (!rating) return null;
  const sizeClass = size === 'hero' ? 'text-[20px]' : 'text-[18px]';
  return (
    <span
      role="img"
      aria-label={`Complexity ${rating} out of 5`}
      className={`${sizeClass} tracking-[0.05em] leading-none whitespace-nowrap ${className}`}
      style={{ textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.7)' }}
    >
      <span className="text-accent">{FILLED.repeat(rating)}</span>
      <span className="text-accent/40">{EMPTY.repeat(5 - rating)}</span>
    </span>
  );
}
