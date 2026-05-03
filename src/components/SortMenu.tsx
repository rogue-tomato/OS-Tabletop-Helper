import { useEffect, useRef, useState } from 'react';

export type SortMode =
  | 'complexity-desc'
  | 'complexity-asc'
  | 'alpha-asc'
  | 'alpha-desc';

// Order matches the user's spec exactly:
//   1. complexity ascending (default)
//   2. complexity descending
//   3. alphabetical ascending
//   4. alphabetical descending
const OPTIONS: { id: SortMode; label: string }[] = [
  { id: 'complexity-asc', label: 'Complexity ↑' },
  { id: 'complexity-desc', label: 'Complexity ↓' },
  { id: 'alpha-asc', label: 'A → Z' },
  { id: 'alpha-desc', label: 'Z → A' },
];

type Props = {
  value: SortMode;
  onChange: (next: SortMode) => void;
};

export function SortMenu({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Sort characters"
        className="h-12 w-12 inline-flex items-center justify-center bg-ink-800/70 border border-ember-700/30 text-accent active:scale-95 transition"
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
          <path d="M3 6h18" />
          <path d="M6 12h12" />
          <path d="M10 18h4" />
        </svg>
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Sort options"
          className="absolute left-0 top-full mt-1 z-30 min-w-[180px] bg-ink-900/95 backdrop-blur-md border border-ember-700/40 shadow-lg"
        >
          <ul className="py-1">
            {OPTIONS.map((opt) => {
              const isActive = opt.id === value;
              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={isActive}
                    onClick={() => {
                      onChange(opt.id);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[14px] font-display tracking-wider uppercase transition-colors ${
                      isActive
                        ? 'text-accent bg-ember-700/20'
                        : 'text-bone/80 hover:text-accent hover:bg-ember-700/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
