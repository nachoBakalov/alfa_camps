type CircularTokenCardProps = {
  label: string;
  imageUrl?: string;
  tokenText?: string;
  isActive?: boolean;
  onClick?: () => void;
  size?: 'md' | 'lg';
  className?: string;
};

export function CircularTokenCard({
  label,
  imageUrl,
  tokenText,
  isActive = false,
  onClick,
  size = 'md',
  className,
}: CircularTokenCardProps) {
  const sizeClasses =
    size === 'lg'
      ? {
          card: 'w-[7.8rem]',
          token: 'h-[5.5rem] w-[5.5rem] text-lg',
          label: 'text-sm',
        }
      : {
          card: 'w-[5.8rem]',
          token: 'h-16 w-16 text-base',
          label: 'text-xs',
        };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={onClick ? isActive : undefined}
      className={[
        'group flex shrink-0 flex-col items-center text-center transition-transform duration-200',
        sizeClasses.card,
        isActive ? 'scale-[1.2]' : '',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--public-border)_65%,#fff_35%)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--public-bg-950)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={[
          'public-token-ring grid place-items-center overflow-hidden font-semibold text-[var(--public-text)] transition-all',
          sizeClasses.token,
          isActive
            ? 'border-[color-mix(in_srgb,var(--public-border)_95%,transparent)] bg-[color-mix(in_srgb,var(--public-bg-850)_60%,#fff_40%)] shadow-[0_10px_18px_rgba(0,0,0,0.32)]'
            : 'group-hover:bg-[color-mix(in_srgb,var(--public-bg-850)_70%,#fff_30%)]',
        ].join(' ')}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="uppercase tracking-[0.06em]">{tokenText ?? label.slice(0, 2)}</span>
        )}
      </span>
      <span
        className={[
          'mt-2 uppercase tracking-[0.08em]',
          sizeClasses.label,
          isActive ? 'text-[var(--public-text)]' : 'public-text-muted',
        ].join(' ')}
      >
        {label}
      </span>
    </button>
  );
}
