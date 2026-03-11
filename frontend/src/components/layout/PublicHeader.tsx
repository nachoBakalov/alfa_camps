import { Link } from 'react-router-dom';

export function PublicHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link to="/" className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
          Alfa Camp
        </Link>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Public</p>
      </div>
    </header>
  );
}
