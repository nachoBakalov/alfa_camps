import { useMemo, useState } from 'react';
import { DarkSectionBlock } from './DarkSectionBlock';
import { LoadMoreButton } from './LoadMoreButton';
import { PlayerGridCard } from './PlayerGridCard';
import { PlayerSearchBar } from './PlayerSearchBar';

type ExpandablePlayersSectionItem = {
  id: string;
  displayName: string;
  secondaryText?: string;
  avatarUrl?: string;
  avatarFallback?: string;
};

type ExpandablePlayersSectionProps = {
  title?: string;
  description?: string;
  items: ExpandablePlayersSectionItem[];
  initialVisibleCount?: number;
  loadMoreStep?: number;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  emptyText?: string;
  className?: string;
};

export function ExpandablePlayersSection({
  title,
  description,
  items,
  initialVisibleCount = 6,
  loadMoreStep = 6,
  searchValue,
  onSearchChange,
  emptyText,
  className,
}: ExpandablePlayersSectionProps) {
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const [isExpanded, setIsExpanded] = useState(false);

  const normalizedQuery = (searchValue ?? '').trim().toLowerCase();

  const filteredItems = useMemo(() => {
    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => {
      const name = item.displayName.toLowerCase();
      const secondary = item.secondaryText?.toLowerCase() ?? '';
      return name.includes(normalizedQuery) || secondary.includes(normalizedQuery);
    });
  }, [items, normalizedQuery]);

  const hasSearch = typeof searchValue === 'string' && typeof onSearchChange === 'function';
  const visibleItems = isExpanded ? filteredItems.slice(0, visibleCount) : filteredItems.slice(0, initialVisibleCount);
  const canLoadMore = isExpanded && visibleItems.length < filteredItems.length;
  const canExpand = !isExpanded && filteredItems.length > initialVisibleCount;

  const handleLoadMore = () => {
    setVisibleCount((current) => Math.min(current + loadMoreStep, filteredItems.length));
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setVisibleCount(initialVisibleCount + loadMoreStep);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setVisibleCount(initialVisibleCount);
  };

  return (
    <DarkSectionBlock title={title} description={description} className={className}>
      {hasSearch ? (
        <PlayerSearchBar value={searchValue} onChange={onSearchChange} className="mb-4" />
      ) : null}

      {visibleItems.length === 0 ? <p className="public-text-muted text-sm">{emptyText ?? 'Няма намерени играчи.'}</p> : null}

      {visibleItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-2">
          {visibleItems.map((item) => (
            <PlayerGridCard
              key={item.id}
              displayName={item.displayName}
              secondaryText={item.secondaryText}
              avatarUrl={item.avatarUrl}
              avatarFallback={item.avatarFallback}
            />
          ))}
        </div>
      ) : null}

      {canExpand ? (
        <div className="mt-4 flex justify-center">
          <LoadMoreButton onClick={handleExpand} label="Покажи още" />
        </div>
      ) : null}

      {canLoadMore ? (
        <div className="mt-4 flex justify-center">
          <LoadMoreButton onClick={handleLoadMore} />
        </div>
      ) : null}

      {isExpanded ? (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={handleCollapse}
            className="public-text-muted text-sm uppercase tracking-[0.08em] transition-colors hover:text-[var(--public-text)]"
          >
            Скрий
          </button>
        </div>
      ) : null}
    </DarkSectionBlock>
  );
}

export type { ExpandablePlayersSectionItem };
