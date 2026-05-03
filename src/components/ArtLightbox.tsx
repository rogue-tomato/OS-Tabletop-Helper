import { useEffect, useRef, useState } from 'react';
import { assetUrl } from '../lib/assets';

type Props = {
  src: string;
  alt: string;
  onClose: () => void;
};

// True when the current viewport is a narrow portrait phone AND the
// loaded image is landscape — i.e. rotating 90° will let the figure
// fill the screen instead of leaving big black bars top/bottom.
function shouldAutoRotate(img: HTMLImageElement): boolean {
  if (typeof window === 'undefined') return false;
  const portraitPhone =
    window.innerWidth < 768 && window.innerHeight > window.innerWidth;
  const landscapeImage = img.naturalWidth > img.naturalHeight;
  return portraitPhone && landscapeImage;
}

export function ArtLightbox({ src, alt, onClose }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [rotated, setRotated] = useState(false);

  // Re-evaluate the rotation decision when the image loads, when the
  // window resizes, and when the device orientation changes — so a
  // user spinning their phone into landscape correctly drops back to
  // the un-rotated layout. Both `orientationchange` and the
  // `(orientation: portrait)` media query fire here because iOS
  // historically reports `orientationchange` BEFORE the viewport
  // dimensions update; we also re-run on a short delay to catch up.
  useEffect(() => {
    const recalc = () => {
      const img = imgRef.current;
      if (!img || !img.complete) return;
      setRotated(shouldAutoRotate(img));
    };
    const recalcSoon = () => {
      recalc();
      window.setTimeout(recalc, 200);
      window.setTimeout(recalc, 500);
    };
    const mq = window.matchMedia('(orientation: portrait)');
    window.addEventListener('resize', recalcSoon);
    window.addEventListener('orientationchange', recalcSoon);
    mq.addEventListener?.('change', recalcSoon);
    return () => {
      window.removeEventListener('resize', recalcSoon);
      window.removeEventListener('orientationchange', recalcSoon);
      mq.removeEventListener?.('change', recalcSoon);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const handleLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    setRotated(shouldAutoRotate(img));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} — full art`}
      className="fixed inset-0 z-50 bg-ink-950/95 backdrop-blur-sm flex flex-col"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex items-center justify-end px-3 pt-3 sm:pt-5 pb-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="tap-target inline-flex items-center justify-center rounded-full bg-ink-800/80 border border-ember-700/40 px-3 text-ember-400 active:scale-95"
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
        className="flex-1 flex items-center justify-center px-3 pb-5 sm:pb-6 safe-bottom"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <img
          ref={imgRef}
          src={assetUrl(src)}
          alt={alt}
          onLoad={handleLoad}
          className={
            rotated
              ? 'art-lightbox-image art-lightbox-image--rotated rounded-md shadow-2xl border border-ember-700/30'
              : 'art-lightbox-image max-h-[88vh] max-w-full w-auto h-auto object-contain rounded-md shadow-2xl border border-ember-700/30'
          }
        />
      </div>
    </div>
  );
}
