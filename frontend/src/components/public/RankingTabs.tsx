export type RankingTabKey = 'points' | 'kills' | 'survivals';

type RankingTabsProps = {
  activeTab: RankingTabKey;
  onChange: (tab: RankingTabKey) => void;
  className?: string;
};

const RANKING_TABS: Array<{ key: RankingTabKey; label: string }> = [
  { key: 'points', label: 'Точки' },
  { key: 'kills', label: 'Убийства' },
  { key: 'survivals', label: 'Оцеляване' },
];

export function RankingTabs({ activeTab, onChange, className }: RankingTabsProps) {
  return (
    <div
      className={[
        'inline-flex w-full rounded-xl border border-[color-mix(in_srgb,var(--public-border)_22%,transparent)] bg-[color-mix(in_srgb,var(--public-bg-900)_88%,#000_12%)] p-1',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {RANKING_TABS.map((tab) => {
        const isActive = tab.key === activeTab;

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
          </button>
        );
      })}
    </div>
  );
}
