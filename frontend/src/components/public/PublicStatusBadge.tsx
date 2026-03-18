type PublicStatus = 'active' | 'upcoming' | 'finished';

type PublicStatusBadgeProps = {
  status: PublicStatus;
  label?: string;
  className?: string;
};

const STATUS_LABELS: Record<PublicStatus, string> = {
  active: 'Активен',
  upcoming: 'Предстоящ',
  finished: 'Приключил',
};

const STATUS_CLASSES: Record<PublicStatus, string> = {
  active: 'border-emerald-300/45 bg-emerald-300/15 text-emerald-100',
  upcoming: 'border-amber-300/45 bg-amber-300/15 text-amber-100',
  finished: 'border-rose-300/45 bg-rose-400/15 text-rose-100',
};

export function PublicStatusBadge({ status, label, className }: PublicStatusBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.12em]',
        STATUS_CLASSES[status],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label ?? STATUS_LABELS[status]}
    </span>
  );
}

export type { PublicStatus };
