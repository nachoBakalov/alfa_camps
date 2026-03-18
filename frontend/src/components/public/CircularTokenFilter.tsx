import { CircularTokenCard } from './CircularTokenCard';

type CircularTokenFilterItem = {
  id: string;
  label: string;
  imageUrl?: string;
  tokenText?: string;
};

type CircularTokenFilterProps = {
  items: CircularTokenFilterItem[];
  activeId: string;
  onChange?: (id: string) => void;
  quickItem?: 'all' | 'top-players';
  quickItemLabel?: string;
  cardSize?: 'md' | 'lg';
  className?: string;
};

const QUICK_ITEM_ID = '__quick-item__';

const QUICK_ITEM_LABELS: Record<'all' | 'top-players', string> = {
  all: 'Всички',
  'top-players': 'Топ играчи',
};

export function CircularTokenFilter({
  items,
  activeId,
  onChange,
  quickItem,
  quickItemLabel,
  cardSize = 'md',
  className,
}: CircularTokenFilterProps) {
  return (
    <div className={['overflow-x-auto pb-1', className].filter(Boolean).join(' ')}>
      <div className="flex min-w-max items-start gap-3">
        {quickItem ? (
          <CircularTokenCard
            label={quickItemLabel ?? QUICK_ITEM_LABELS[quickItem]}
            tokenText={quickItem === 'all' ? 'ALL' : 'TOP'}
            isActive={activeId === QUICK_ITEM_ID}
            onClick={onChange ? () => onChange(QUICK_ITEM_ID) : undefined}
            size={cardSize}
          />
        ) : null}

        {items.map((item) => (
          <CircularTokenCard
            key={item.id}
            label={item.label}
            imageUrl={item.imageUrl}
            tokenText={item.tokenText}
            isActive={activeId === item.id}
            onClick={onChange ? () => onChange(item.id) : undefined}
            size={cardSize}
          />
        ))}
      </div>
    </div>
  );
}

export { QUICK_ITEM_ID };
export type { CircularTokenFilterItem };
