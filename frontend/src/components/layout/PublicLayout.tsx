import { Outlet } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-white">
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
