import type { PropsWithChildren } from 'react';

type PublicContainerProps = PropsWithChildren<{
  className?: string;
}>;

export function PublicContainer({ children, className }: PublicContainerProps) {
  return <div className={`public-container ${className ?? ''}`.trim()}>{children}</div>;
}
