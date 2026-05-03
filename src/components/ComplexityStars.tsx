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

// Classic five-pointed glyph (BLACK STAR, U+2605). Only the filled
// stars render — empty slots are intentionally omitted so the rating
// reads at a glance, like the reference reel from the rulebook.
const FILLED = '★';

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
      className={`${sizeClass} tracking-[0.04em] leading-none whitespace-nowrap text-accent ${className}`}
      style={{ textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.7)' }}
    >
      {FILLED.repeat(rating)}
    </span>
  );
}
