type LoadMoreButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  label?: string;
  className?: string;
};

export function LoadMoreButton({ onClick, disabled = false, isLoading = false, label, className }: LoadMoreButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={[
        'public-primary-action inline-flex min-h-10 items-center justify-center px-5 py-2 text-sm uppercase tracking-[0.08em]',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isLoading ? 'Зареждане...' : label ?? 'Зареди още'}
    </button>
  );
}
