import { RankingRow } from './RankingRow';

type RankingListItem = {
  id: string;
  displayName: string;
  scoreLabel: string;
  avatarUrl?: string;
  avatarFallback?: string;
};

type RankingListProps = {
  items: RankingListItem[];
  emptyText?: string;
  limit?: number;
  className?: string;
};

export function RankingList({ items, emptyText, limit, className }: RankingListProps) {
  const visibleItems = typeof limit === 'number' && limit > 0 ? items.slice(0, limit) : items;

  if (visibleItems.length === 0) {
    return <p className={['public-text-muted text-sm', className].filter(Boolean).join(' ')}>{emptyText ?? 'Няма класиране.'}</p>;
  }

  return (
    <ol
      className={[
        'rounded-xl border border-[color-mix(in_srgb,var(--public-border)_22%,transparent)] bg-[color-mix(in_srgb,var(--public-bg-900)_88%,#000_12%)] px-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {visibleItems.map((item, index) => (
        <RankingRow
          key={item.id}
          rank={index + 1}
          displayName={item.displayName}
          scoreLabel={item.scoreLabel}
          avatarUrl={item.avatarUrl}
          avatarFallback={item.avatarFallback}
          showDivider={index < visibleItems.length - 1}
        />
      ))}
    </ol>
  );
}

export type { RankingListItem };
