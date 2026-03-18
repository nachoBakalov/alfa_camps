import type { ReactNode } from 'react';

type SectionTitleProps = {
  title: string;
  subtitle?: ReactNode;
  className?: string;
};

export function SectionTitle({ title, subtitle, className }: SectionTitleProps) {
  return (
    <div className={['text-center', className].filter(Boolean).join(' ')}>
      <div className="mx-auto flex w-full max-w-xl items-center gap-3">
        <span className="h-px flex-1 bg-[color-mix(in_srgb,var(--public-border)_40%,transparent)]" aria-hidden />
        <h2 className="shrink-0 text-xl font-semibold uppercase tracking-[0.08em] text-[var(--public-text)] sm:text-2xl">{title}</h2>
        <span className="h-px flex-1 bg-[color-mix(in_srgb,var(--public-border)_40%,transparent)]" aria-hidden />
      </div>
      {subtitle ? <p className="public-text-muted mt-2 text-sm uppercase tracking-[0.08em]">{subtitle}</p> : null}
    </div>
  );
}
