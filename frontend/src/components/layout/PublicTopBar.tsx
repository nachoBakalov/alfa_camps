import { Link } from 'react-router-dom';
import { PublicContainer } from './PublicContainer';

export function PublicTopBar() {
  return (
    <header className="public-topbar sticky top-0 z-20">
      <PublicContainer className="flex items-center justify-between py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="public-token-ring grid h-10 w-10 shrink-0 place-items-center text-base font-semibold">A</span>
          <Link to="/" className="truncate text-base font-semibold uppercase tracking-[0.08em] text-[var(--public-text)]">
            Alfa Camp
          </Link>
        </div>

        <button
          type="button"
          aria-label="Отвори меню"
          className="public-token-ring grid h-10 w-10 shrink-0 place-items-center transition-colors hover:bg-[color-mix(in_srgb,var(--public-bg-850)_70%,#fff_30%)]"
        >
          <span className="sr-only">Отвори меню</span>
          <span className="block h-0.5 w-4 rounded-full bg-[var(--public-text)]" />
          <span className="-mt-2 block h-0.5 w-4 rounded-full bg-[var(--public-text)]" />
          <span className="-mt-2 block h-0.5 w-4 rounded-full bg-[var(--public-text)]" />
        </button>
      </PublicContainer>
    </header>
  );
}
