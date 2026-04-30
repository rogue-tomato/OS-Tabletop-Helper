import { useState } from 'react';
import { assetUrl } from '../lib/assets';

type Props = {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  loading?: 'eager' | 'lazy';
};

export function PlaceholderImage({
  src,
  alt,
  className,
  fallbackLabel,
  loading = 'lazy',
}: Props) {
  const [errored, setErrored] = useState(false);
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
      src={assetUrl(src)}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setErrored(true)}
      className={className}
    />
  );
}
