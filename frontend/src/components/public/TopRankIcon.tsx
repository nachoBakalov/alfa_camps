import { useMemo, useState } from 'react';

type TopRankIconProps = {
  rank: number;
  size?: number;
  className?: string;
};

const TOP_RANK_IMAGE_BY_RANK: Record<number, string> = {
  1: '/assets/top_ranked/1.png',
  2: '/assets/top_ranked/2.png',
  3: '/assets/top_ranked/3.png',
};

export function TopRankIcon({ rank, size = 28, className }: TopRankIconProps) {
  const [hasAssetError, setHasAssetError] = useState(false);
  const imageUrl = useMemo(() => TOP_RANK_IMAGE_BY_RANK[rank], [rank]);

  if (!imageUrl || hasAssetError) {
    return (
      <span
        className={[
          'inline-flex items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--public-border)_50%,transparent)] px-2 py-1 text-xs font-semibold text-[var(--public-text)]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        #{rank}
      </span>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`Top ${rank}`}
      width={size}
      height={size}
      className={['shrink-0 object-contain', className].filter(Boolean).join(' ')}
      onError={() => setHasAssetError(true)}
    />
  );
}
