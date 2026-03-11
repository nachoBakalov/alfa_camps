import { Outlet } from 'react-router-dom';
import { AdminHeader } from './AdminHeader';
import { AdminNav } from './AdminNav';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <AdminHeader />
      <AdminNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
        <Outlet />
      </main>
    </div>
  );
}
