import { Link } from 'react-router-dom';

export function AdminNav() {
  return (
    <nav className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto flex w-full max-w-6xl gap-3 px-4 py-2 sm:px-6">
        <Link to="/admin" className="rounded-md bg-white px-3 py-1.5 text-sm text-slate-700">
          Dashboard
        </Link>
        <Link to="/admin/ranks" className="rounded-md bg-white px-3 py-1.5 text-sm text-slate-700">
          Ranks
        </Link>
        <Link to="/admin/medals" className="rounded-md bg-white px-3 py-1.5 text-sm text-slate-700">
          Medals
        </Link>
        <Link to="/admin/photos" className="rounded-md bg-white px-3 py-1.5 text-sm text-slate-700">
          Photos
        </Link>
      </div>
    </nav>
  );
}
