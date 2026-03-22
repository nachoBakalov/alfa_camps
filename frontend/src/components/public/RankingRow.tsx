import { TopRankIcon } from './TopRankIcon';

type RankingRowProps = {
  rank: number;
  rankLabel?: string;
  displayName: string;
  scoreLabel: string;
  avatarUrl?: string;
  avatarFallback?: string;
  showDivider?: boolean;
  className?: string;
};

export function RankingRow({
  rank,
  rankLabel,
  displayName,
  scoreLabel,
  avatarUrl,
  avatarFallback,
  showDivider = true,
  className,
}: RankingRowProps) {
  const isTopThree = rank <= 3;

  return (
    <li
      className={[
        'flex items-center gap-3 py-3',
        showDivider ? 'border-b border-[color-mix(in_srgb,var(--public-border)_20%,transparent)]' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="w-8 shrink-0 text-center">
        {isTopThree ? (
          <TopRankIcon rank={rank} size={26} />
        ) : (
          <span className="text-sm font-semibold text-[var(--public-text)]">{rankLabel ?? rank}</span>
        )}
      </div>

      <span className="public-token-ring grid h-11 w-11 shrink-0 place-items-center overflow-hidden text-xs font-semibold uppercase tracking-[0.06em]">
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
        ) : (
          <span>{avatarFallback ?? displayName.slice(0, 2)}</span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold uppercase tracking-[0.06em] text-[var(--public-text)]">{displayName}</span>
      </span>

      <span className="shrink-0 text-sm font-semibold uppercase tracking-[0.05em] text-[var(--public-text)]">{scoreLabel}</span>
    </li>
  );
}
