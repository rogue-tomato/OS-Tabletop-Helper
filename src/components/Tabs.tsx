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
      className="flex gap-1 p-1 rounded-md bg-ink-800/70 border border-ember-700/35 overflow-x-auto scrollbar-hidden"
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
            className={`tap-target flex-1 min-w-[88px] px-3 py-2 rounded-sm text-[15px] font-display tracking-[0.18em] uppercase transition-colors ${
              isActive
                ? 'bg-gradient-to-b from-ember-600 to-ember-700 text-ink-950 shadow-ember'
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
