type PlayerGridCardProps = {
  displayName: string;
  secondaryText?: string;
  avatarUrl?: string;
  avatarFallback?: string;
  onClick?: () => void;
  className?: string;
};

export function PlayerGridCard({
  displayName,
  secondaryText,
  avatarUrl,
  avatarFallback,
  onClick,
  className,
}: PlayerGridCardProps) {
  const Container = onClick ? 'button' : 'div';

  return (
    <Container
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={[
        'flex w-full items-center gap-3 rounded-xl border border-[color-mix(in_srgb,var(--public-border)_24%,transparent)]',
        'bg-[color-mix(in_srgb,var(--public-bg-900)_88%,#000_12%)] px-3 py-2.5 text-left',
        onClick
          ? 'transition-colors hover:bg-[color-mix(in_srgb,var(--public-bg-850)_85%,#fff_15%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--public-border)_60%,#fff_40%)]'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="public-token-ring grid h-12 w-12 shrink-0 place-items-center overflow-hidden text-sm font-semibold uppercase tracking-[0.06em]">
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
        ) : (
          <span>{avatarFallback ?? displayName.slice(0, 2)}</span>
        )}
      </span>

      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold uppercase tracking-[0.06em] text-[var(--public-text)]">{displayName}</span>
        {secondaryText ? <span className="public-text-muted block truncate text-xs">{secondaryText}</span> : null}
      </span>
    </Container>
  );
}
