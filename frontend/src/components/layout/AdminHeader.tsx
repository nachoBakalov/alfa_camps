import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function AdminHeader() {
  const navigate = useNavigate();
  const { email, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div>
          <p className="text-sm font-semibold text-slate-900">Админ</p>
          <p className="text-xs text-slate-500">{email ?? 'Вписан'}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Изход
        </button>
      </div>
    </header>
  );
}
