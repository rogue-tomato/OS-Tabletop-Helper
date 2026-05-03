type Tab<T extends string> = {
  id: T;
  label: string;
};

type Props<T extends string> = {
  tabs: Tab<T>[];
  active: T;
  onChange: (next: T) => void;
};

export function Tabs<T extends string>({ tabs, active, onChange }: Props<T>) {
  return (
    <div
      role="tablist"
      aria-label="Character sections"
      className="flex w-full gap-1 p-1 bg-ink-800/70 border border-ember-700/35"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex-1 basis-0 min-w-0 min-h-[44px] px-2 sm:px-3 py-2 text-center whitespace-nowrap text-[12px] sm:text-[15px] font-display tracking-[0.08em] sm:tracking-[0.18em] uppercase transition-colors ${
              isActive
                ? 'bg-gradient-to-b from-tab-active-400 to-tab-active-500 text-ink-950 shadow-ember'
                : 'text-bone/70 hover:text-ember-400'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
