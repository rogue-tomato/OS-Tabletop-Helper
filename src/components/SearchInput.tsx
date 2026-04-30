type Props = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
};

export function SearchInput({ value, onChange, placeholder }: Props) {
  return (
    <label className="block">
      <span className="sr-only">Search characters</span>
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ember-400/70"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          inputMode="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          placeholder={placeholder ?? 'Search characters…'}
          className="w-full rounded-xl bg-ink-800/70 border border-ember-700/30 pl-10 pr-4 py-3 text-base text-bone placeholder:text-bone/40 focus:outline-none focus:border-ember-500 focus:ring-2 focus:ring-ember-500/30"
        />
      </div>
    </label>
  );
}
