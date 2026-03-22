import { TopRankIcon } from './TopRankIcon';

type RankingRowProps = {
  rank: number;
  rankLabel?: string;
  displayName: string;
  scoreLabel: string;
  avatarUrl?: string;
  avatarFallback?: string;
  showDivider?: boolean;
  onClick?: () => void;
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
  onClick,
  className,
}: RankingRowProps) {
  const isTopThree = rank <= 3;

  return (
    <li
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={[
        'flex items-center gap-3 py-3',
        onClick
          ? 'cursor-pointer rounded-md px-1 transition-colors hover:bg-[color-mix(in_srgb,var(--public-bg-850)_74%,#fff_26%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--public-border)_60%,#fff_40%)]'
          : '',
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
