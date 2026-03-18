import type { ReactNode } from 'react';
import { PublicHeroActions, type PublicHeroAction } from './PublicHeroActions';
import { PublicStatusBadge, type PublicStatus } from './PublicStatusBadge';

type PublicHeroProps = {
  title: string;
  location?: string;
  dateLabel?: string;
  status: PublicStatus;
  statusLabel?: string;
  backgroundImageUrl: string;
  primaryAction?: PublicHeroAction;
  secondaryAction?: PublicHeroAction;
  statusPlacement?: 'center' | 'top-left';
  className?: string;
  topContent?: ReactNode;
};

export function PublicHero({
  title,
  location,
  dateLabel,
  status,
  statusLabel,
  backgroundImageUrl,
  primaryAction,
  secondaryAction,
  statusPlacement = 'center',
  className,
  topContent,
}: PublicHeroProps) {
  return (
    <section
      className={[
        'relative isolate overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--public-border)_25%,transparent)]',
        'min-h-[19.5rem] sm:min-h-[24rem]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,17,21,0.22)_0%,rgba(15,17,21,0.74)_58%,rgba(15,17,21,0.92)_100%)]"
        aria-hidden
      />

      <div className="relative z-[1] flex min-h-[19.5rem] flex-col items-center justify-center px-4 py-7 text-center sm:min-h-[24rem] sm:px-8 sm:py-10">
        {statusPlacement === 'top-left' ? (
          <PublicStatusBadge status={status} label={statusLabel} className="absolute left-4 top-4 sm:left-5 sm:top-5" />
        ) : (
          <PublicStatusBadge status={status} label={statusLabel} />
        )}
        {topContent ? <div className="mt-3">{topContent}</div> : null}

        <h1 className="mt-4 text-[clamp(1.8rem,7vw,3.4rem)] font-semibold uppercase leading-[1.03] tracking-[0.05em] text-[var(--public-text)]">
          {title}
        </h1>

        {(location || dateLabel) ? (
          <p className="public-text-muted mt-3 text-sm uppercase tracking-[0.1em] sm:text-base">
            {location ? <span>{location}</span> : null}
            {location && dateLabel ? <span className="mx-2 opacity-70">•</span> : null}
            {dateLabel ? <span>{dateLabel}</span> : null}
          </p>
        ) : null}

        <PublicHeroActions primaryAction={primaryAction} secondaryAction={secondaryAction} className="mt-5" />
      </div>
    </section>
  );
}
