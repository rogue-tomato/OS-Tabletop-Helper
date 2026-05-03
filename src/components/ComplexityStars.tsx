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

const FILLED = '★';
const EMPTY = '☆';

export function ComplexityStars({
  rating,
  size = 'tile',
  className = '',
}: Props) {
  if (!rating) return null;
  const sizeClass = size === 'hero' ? 'text-[15px]' : 'text-[12px]';
  return (
    <span
      role="img"
      aria-label={`Complexity ${rating} out of 5`}
      className={`${sizeClass} font-display tracking-[0.05em] text-accent leading-none whitespace-nowrap ${className}`}
    >
      <span className="text-accent">{FILLED.repeat(rating)}</span>
      <span className="text-accent/30">{EMPTY.repeat(5 - rating)}</span>
    </span>
  );
}
