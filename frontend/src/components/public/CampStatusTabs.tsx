export type CampStatusTabKey = 'active' | 'upcoming' | 'finished';

type CampStatusTabsProps = {
  activeTab: CampStatusTabKey;
  onChange: (tab: CampStatusTabKey) => void;
  counts?: Partial<Record<CampStatusTabKey, number>>;
  className?: string;
};

const STATUS_TABS: Array<{ key: CampStatusTabKey; label: string }> = [
  { key: 'active', label: 'Текущи' },
  { key: 'upcoming', label: 'Предстоящи' },
  { key: 'finished', label: 'Минали' },
];

export function CampStatusTabs({ activeTab, onChange, counts, className }: CampStatusTabsProps) {
  return (
    <div
      className={[
        'inline-flex w-full rounded-xl border border-[color-mix(in_srgb,var(--public-border)_22%,transparent)] bg-[color-mix(in_srgb,var(--public-bg-900)_88%,#000_12%)] p-1',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {STATUS_TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        const count = counts?.[tab.key];

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={[
              'min-h-10 flex-1 rounded-lg px-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors sm:text-sm',
              isActive
                ? 'bg-[var(--public-primary)] text-[var(--public-text)]'
                : 'public-text-muted hover:bg-[color-mix(in_srgb,var(--public-bg-850)_82%,#fff_18%)]',
            ].join(' ')}
            aria-pressed={isActive}
          >
            {tab.label}
            {count !== undefined ? <span className="sr-only">{count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
