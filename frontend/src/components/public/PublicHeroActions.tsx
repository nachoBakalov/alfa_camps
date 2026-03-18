export type PublicHeroAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
  variant?: 'primary' | 'secondary';
};

type PublicHeroActionsProps = {
  primaryAction?: PublicHeroAction;
  secondaryAction?: PublicHeroAction;
  className?: string;
};

function HeroActionButton({ action, fallbackVariant }: { action: PublicHeroAction; fallbackVariant: 'primary' | 'secondary' }) {
  const variant = action.variant ?? fallbackVariant;
  const commonClassName =
    'inline-flex min-h-10 items-center justify-center rounded-full px-5 text-sm font-medium uppercase tracking-[0.08em] transition-colors';
  const variantClassName =
    variant === 'primary'
      ? 'public-primary-action'
      : 'border border-[color-mix(in_srgb,var(--public-border)_45%,transparent)] bg-[color-mix(in_srgb,var(--public-bg-900)_72%,transparent)] text-[var(--public-text)] hover:bg-[color-mix(in_srgb,var(--public-bg-850)_80%,#fff_20%)]';

  if (action.href) {
    return (
      <a
        href={action.href}
        aria-label={action.ariaLabel ?? action.label}
        className={[commonClassName, variantClassName].join(' ')}
      >
        {action.label}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={action.onClick}
      aria-label={action.ariaLabel ?? action.label}
      className={[commonClassName, variantClassName].join(' ')}
    >
      {action.label}
    </button>
  );
}

export function PublicHeroActions({ primaryAction, secondaryAction, className }: PublicHeroActionsProps) {
  if (!primaryAction && !secondaryAction) {
    return null;
  }

  return (
    <div className={['mt-2 flex w-full flex-col items-center gap-3 sm:mt-3 sm:w-auto sm:flex-row', className].filter(Boolean).join(' ')}>
      {primaryAction ? <HeroActionButton action={primaryAction} fallbackVariant="primary" /> : null}
      {secondaryAction ? <HeroActionButton action={secondaryAction} fallbackVariant="secondary" /> : null}
    </div>
  );
}
