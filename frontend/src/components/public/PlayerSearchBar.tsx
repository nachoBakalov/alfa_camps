type PlayerSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function PlayerSearchBar({ value, onChange, placeholder, className }: PlayerSearchBarProps) {
  return (
    <label className={['relative block', className].filter(Boolean).join(' ')}>
      <span className="sr-only">Търсене на играч</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? 'Търси по име или прякор'}
        className={[
          'w-full rounded-xl border border-[color-mix(in_srgb,var(--public-border)_30%,transparent)]',
          'bg-[color-mix(in_srgb,var(--public-bg-900)_82%,#000_18%)] px-4 py-2.5 text-sm text-[var(--public-text)]',
          'placeholder:text-[color-mix(in_srgb,var(--public-text-muted)_92%,#000_8%)]',
          'outline-none transition-colors focus:border-[color-mix(in_srgb,var(--public-border)_55%,#fff_45%)]',
        ].join(' ')}
      />
    </label>
  );
}
