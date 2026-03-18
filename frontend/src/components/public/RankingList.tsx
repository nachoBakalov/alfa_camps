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
  className?: string;
};

export function RankingList({ items, emptyText, className }: RankingListProps) {
  if (items.length === 0) {
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
      {items.map((item, index) => (
        <RankingRow
          key={item.id}
          rank={index + 1}
          displayName={item.displayName}
          scoreLabel={item.scoreLabel}
          avatarUrl={item.avatarUrl}
          avatarFallback={item.avatarFallback}
          showDivider={index < items.length - 1}
        />
      ))}
    </ol>
  );
}

export type { RankingListItem };
