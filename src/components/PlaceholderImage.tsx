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
};

export function PlaceholderImage({
  src,
  fallbackSrc,
  alt,
  className,
  fallbackLabel,
  loading = 'lazy',
}: Props) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [errored, setErrored] = useState(false);

  // If the parent passes a different `src` (e.g. swapping characters),
  // reset the chain.
  useEffect(() => {
    setCurrentSrc(src);
    setErrored(false);
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
  return (
    <img
      src={assetUrl(currentSrc)}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => {
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        } else {
          setErrored(true);
        }
      }}
      className={className}
    />
  );
}
