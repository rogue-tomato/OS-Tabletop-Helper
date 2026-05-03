import { useEffect } from 'react';
import { assetUrl } from '../lib/assets';

type Props = {
  src: string;
  alt: string;
  onClose: () => void;
};

export function ArtLightbox({ src, alt, onClose }: Props) {
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
      {/* Image is rendered at its natural orientation, fitted to the
          viewport with object-contain. We deliberately do NOT rotate
          on portrait phones — the device's own auto-rotate handles
          orientation, and any extra CSS rotation on top fights it
          (causing the double-rotation bug). */}
      <div
        className="flex-1 flex items-center justify-center px-3 pb-5 sm:pb-6 safe-bottom"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <img
          src={assetUrl(src)}
          alt={alt}
          className="max-h-[88vh] max-w-full w-auto h-auto object-contain rounded-md shadow-2xl border border-ember-700/30"
        />
      </div>
    </div>
  );
}
