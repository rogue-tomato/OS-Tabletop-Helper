import { useEffect, useState } from 'react';
import { assetUrl } from '../lib/assets';

type Props = {
  src: string;
  /** Optional secondary src tried after the primary fails. Lets the
   *  caller chain e.g. cover → art before showing the text fallback. */
  fallbackSrc?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  loading?: 'eager' | 'lazy';
  decoding?: 'sync' | 'async' | 'auto';
};

export function PlaceholderImage({
  src,
  fallbackSrc,
  alt,
  className,
  fallbackLabel,
  loading = 'lazy',
  decoding = 'async',
}: Props) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // If the parent passes a different `src` (e.g. swapping characters),
  // reset the chain.
  useEffect(() => {
    setCurrentSrc(src);
    setErrored(false);
    setLoaded(false);
  }, [src, fallbackSrc]);

  if (errored) {
    return (
      <div
        className={`flex items-center justify-center bg-ink-800/60 text-ember-400/60 text-sm font-display tracking-widest uppercase min-h-[160px] min-w-[120px] ${className ?? ''}`}
        aria-label={alt}
      >
        <span className="px-3 text-center text-balance leading-tight">
          {fallbackLabel ?? alt ?? 'Image missing'}
        </span>
      </div>
    );
  }
  // Render <img> always (so the browser starts fetching it) but hide
  // it via `visibility: hidden` until `onLoad` fires. Stack a "Loading"
  // overlay underneath at the same className → callers don't have to
  // know about the placeholder, it just appears in the same slot.
  return (
    <>
      <img
        src={assetUrl(currentSrc)}
        alt={alt}
        loading={loading}
        decoding={decoding}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (fallbackSrc && currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
            setLoaded(false);
          } else {
            setErrored(true);
          }
        }}
        className={className}
        style={{ visibility: loaded ? 'visible' : 'hidden' }}
      />
      {!loaded ? (
        <span
          aria-hidden="true"
          className={`${
            className ?? ''
          } flex items-center justify-center bg-ink-800/60 text-ember-400/70 text-[11px] font-display tracking-[0.25em] uppercase`}
        >
          Loading
        </span>
      ) : null}
    </>
  );
}
