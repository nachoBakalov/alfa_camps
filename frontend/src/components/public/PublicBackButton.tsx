import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

type PublicBackButtonProps = {
  fallbackTo: string;
  label?: string;
  className?: string;
};

function canUseHistoryBack(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  if (window.history.length <= 1) {
    return false;
  }

  const referrer = document.referrer;
  if (!referrer) {
    return false;
  }

  try {
    return new URL(referrer).origin === window.location.origin;
  } catch {
    return false;
  }
}

export function PublicBackButton({ fallbackTo, label = 'Назад', className }: PublicBackButtonProps) {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    if (canUseHistoryBack()) {
      navigate(-1);
      return;
    }

    navigate(fallbackTo);
  }, [fallbackTo, navigate]);

  return (
    <button
      type="button"
      onClick={handleBack}
      className={[
        'inline-flex min-h-10 items-center rounded-lg border border-[color-mix(in_srgb,var(--public-border)_30%,transparent)] bg-[color-mix(in_srgb,var(--public-bg-900)_84%,#000_16%)] px-4 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--public-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--public-bg-850)_70%,#fff_30%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--public-border)_65%,#fff_35%)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--public-bg-950)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={label}
    >
      {'< '}
      {label}
    </button>
  );
}
