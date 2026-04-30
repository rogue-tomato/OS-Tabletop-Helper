import { useEffect, useRef, useState } from 'react';
import type { Ability } from '../types';
import { PlaceholderImage } from './PlaceholderImage';

type Props = {
  abilities: Ability[];
  startIndex: number;
  onClose: () => void;
};

const SWIPE_THRESHOLD = 50;

export function CardLightbox({ abilities, startIndex, onClose }: Props) {
  const [index, setIndex] = useState(startIndex);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const total = abilities.length;
  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    if (touchStartX.current === null) return;
    if (touchDeltaX.current > SWIPE_THRESHOLD) goPrev();
    else if (touchDeltaX.current < -SWIPE_THRESHOLD) goNext();
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  const ability = abilities[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${ability.name} card view`}
      className="fixed inset-0 z-50 bg-ink-950/95 backdrop-blur-sm flex flex-col"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex items-center justify-between px-3 pt-3 sm:pt-5 pb-2 text-bone">
        <div className="font-display text-ember-400 tracking-widest uppercase text-sm">
          {index + 1} / {total}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="tap-target inline-flex items-center justify-center rounded-full bg-ink-800/80 border border-ember-700/30 px-3 text-ember-400 active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <div
        className="flex-1 flex items-center justify-center px-3"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <PlaceholderImage
          key={ability.id}
          src={ability.cardImage}
          alt={ability.name}
          loading="eager"
          className="max-h-[78vh] max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl"
          fallbackLabel={`${ability.name} — card image not provided`}
        />
      </div>

      <div className="flex items-center justify-between gap-3 px-4 pb-5 sm:pb-6 safe-bottom">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous card"
          className="tap-target inline-flex items-center justify-center rounded-full bg-ink-800/80 border border-ember-700/30 h-12 w-12 text-ember-400 active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="text-center min-w-0 flex-1">
          <p className="text-bone font-display text-base sm:text-lg tracking-wide truncate">
            {ability.name}
          </p>
          <p className="text-bone/60 text-sm truncate">{ability.cost ?? `Level ${ability.level}`}</p>
        </div>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next card"
          className="tap-target inline-flex items-center justify-center rounded-full bg-ink-800/80 border border-ember-700/30 h-12 w-12 text-ember-400 active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
