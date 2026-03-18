type CircularTokenCardProps = {
  label: string;
  imageUrl?: string;
  tokenText?: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
};

export function CircularTokenCard({
  label,
  imageUrl,
  tokenText,
  isActive = false,
  onClick,
  className,
}: CircularTokenCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={onClick ? isActive : undefined}
      className={[
        'group flex w-[5.8rem] shrink-0 flex-col items-center text-center',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--public-border)_65%,#fff_35%)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--public-bg-950)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={[
          'public-token-ring grid h-16 w-16 place-items-center overflow-hidden text-base font-semibold text-[var(--public-text)] transition-all',
          isActive
            ? 'border-[color-mix(in_srgb,var(--public-border)_95%,transparent)] bg-[color-mix(in_srgb,var(--public-bg-850)_60%,#fff_40%)] shadow-[0_0_0_2px_color-mix(in_srgb,var(--public-border)_18%,transparent)]'
            : 'group-hover:bg-[color-mix(in_srgb,var(--public-bg-850)_70%,#fff_30%)]',
        ].join(' ')}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="uppercase tracking-[0.06em]">{tokenText ?? label.slice(0, 2)}</span>
        )}
      </span>
      <span className={['mt-2 text-xs uppercase tracking-[0.08em]', isActive ? 'text-[var(--public-text)]' : 'public-text-muted'].join(' ')}>
        {label}
      </span>
    </button>
  );
}
