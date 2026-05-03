type Props = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
};

export function SearchInput({ value, onChange, placeholder }: Props) {
  return (
    // Wrapping in a real <form> makes mobile keyboards show a
    // "Search" / "Go" return key instead of "Done" — the input is
    // typed as `search`, but without an enclosing form some platforms
    // (notably iOS Safari) refuse to wire Enter up to anything. We
    // intercept submit so the form never actually navigates.
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="block"
    >
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
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          onKeyDown={(e) => {
            // Dismiss the on-screen keyboard when Search/Go/Enter is
            // pressed. We do this on keydown (not in the form's
            // onSubmit) because on iOS submit-time blur was racing
            // with the Visual Viewport restore animation and ended
            // up looking like a zoom-out. preventDefault stops the
            // implicit form submission that would otherwise fire
            // afterwards.
            if (e.key === 'Enter') {
              e.preventDefault();
              (e.currentTarget as HTMLInputElement).blur();
            }
          }}
          placeholder={placeholder ?? 'Search characters…'}
          className="w-full h-12 rounded-none bg-ink-800/70 border border-ember-700/30 pl-10 pr-4 text-base text-bone placeholder:text-bone/40 focus:outline-none focus:border-ember-500 focus:ring-2 focus:ring-ember-500/30"
        />
        </div>
      </label>
    </form>
  );
}
