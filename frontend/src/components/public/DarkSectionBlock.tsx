import type { PropsWithChildren, ReactNode } from 'react';

type DarkSectionBlockProps = PropsWithChildren<{
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}>;

export function DarkSectionBlock({ title, description, className, children }: DarkSectionBlockProps) {
  return (
    <section className={['public-section', className].filter(Boolean).join(' ')}>
      {title ? <h3 className="text-lg font-semibold uppercase tracking-[0.06em] text-[var(--public-text)]">{title}</h3> : null}
      {description ? <p className="public-text-muted mt-1 text-sm">{description}</p> : null}
      <div className={title || description ? 'mt-4' : undefined}>{children}</div>
    </section>
  );
}
