import { useMemo, useState } from 'react';
import type { CreateUserInput } from '../../api/users.api';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { SectionCard } from '../../components/cards/SectionCard';
import { PageHeader } from '../../components/layout/PageHeader';
import { ModalDrawer } from '../../components/ui/ModalDrawer';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { ApiClientError } from '../../lib/errors';
import { useUserMutations } from '../../features/users/use-user-mutations';
import { useUsersQuery } from '../../features/users/use-users-query';

function getMutationErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return fallback;
}

export function AdminUsersPage() {
  const { role } = useAuth();
  const usersQuery = useUsersQuery();
  const { createMutation } = useUserMutations();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const isSuperAdmin = role === 'SUPER_ADMIN';

  const sortedUsers = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);

  function resetCreateForm() {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
  }

  async function handleCreateCoach() {
    const payload: CreateUserInput = {
      email: email.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: 'COACH',
    };

    if (!payload.email || !payload.password || !payload.firstName || !payload.lastName) {
      setFeedback({ kind: 'error', message: 'Попълни всички задължителни полета.' });
      return;
    }

    try {
      await createMutation.mutateAsync(payload);
      setFeedback({ kind: 'success', message: 'Треньорът е създаден успешно.' });
      resetCreateForm();
      setIsCreateOpen(false);
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Неуспешно създаване на треньор.'),
      });
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Потребители"
        description="Управлявай администраторските потребители и създавай треньори."
        actions={
          isSuperAdmin ? (
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setIsCreateOpen(true);
              }}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Създай треньор
            </button>
          ) : null
        }
      />

      {!isSuperAdmin ? (
        <ErrorState message="Достъпът е разрешен само за Super Admin." />
      ) : null}

      {feedback ? (
        <div
          className={
            feedback.kind === 'success'
              ? 'rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800'
              : 'rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'
          }
        >
          {feedback.message}
        </div>
      ) : null}

      {isSuperAdmin && usersQuery.isLoading ? <LoadingState label="Зареждане на потребителите..." /> : null}

      {isSuperAdmin && usersQuery.isError ? (
        <ErrorState
          message="Неуспешно зареждане на потребителите."
          onRetry={() => {
            void usersQuery.refetch();
          }}
        />
      ) : null}

      {isSuperAdmin && usersQuery.isSuccess && sortedUsers.length === 0 ? (
        <EmptyState title="Няма потребители" description="Създай първия треньор от бутона по-горе." />
      ) : null}

      {isSuperAdmin && usersQuery.isSuccess && sortedUsers.length > 0 ? (
        <section className="grid gap-3 sm:grid-cols-2">
          {sortedUsers.map((user) => (
            <SectionCard key={user.id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 break-all">{user.email}</h3>
                    <p className="text-sm text-slate-600">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                  <Badge tone={user.isActive ? 'success' : 'neutral'}>{user.isActive ? 'Активен' : 'Неактивен'}</Badge>
                </div>

                <dl className="grid grid-cols-1 gap-2 text-sm text-slate-700">
                  <div>
                    <dt className="text-xs text-slate-500">Роля</dt>
                    <dd className="mt-1 font-medium text-slate-900">{user.role}</dd>
                  </div>
                </dl>
              </div>
            </SectionCard>
          ))}
        </section>
      ) : null}

      <ModalDrawer
        open={isCreateOpen}
        title="Създай треньор"
        onClose={() => {
          setIsCreateOpen(false);
        }}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="coachEmail" className="mb-1 block text-sm font-medium text-slate-700">
              Имейл
            </label>
            <input
              id="coachEmail"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              placeholder="coach@example.com"
            />
          </div>

          <div>
            <label htmlFor="coachPassword" className="mb-1 block text-sm font-medium text-slate-700">
              Парола
            </label>
            <input
              id="coachPassword"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              placeholder="Минимум 8 символа"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="coachFirstName" className="mb-1 block text-sm font-medium text-slate-700">
                Име
              </label>
              <input
                id="coachFirstName"
                value={firstName}
                onChange={(event) => {
                  setFirstName(event.target.value);
                }}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="coachLastName" className="mb-1 block text-sm font-medium text-slate-700">
                Фамилия
              </label>
              <input
                id="coachLastName"
                value={lastName}
                onChange={(event) => {
                  setLastName(event.target.value);
                }}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              />
            </div>
          </div>

          <div>
            <label htmlFor="coachRole" className="mb-1 block text-sm font-medium text-slate-700">
              Роля
            </label>
            <select
              id="coachRole"
              value="COACH"
              disabled
              className="w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-slate-700"
            >
              <option value="COACH">COACH</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
              }}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Отказ
            </button>
            <button
              type="button"
              onClick={() => {
                void handleCreateCoach();
              }}
              disabled={createMutation.isPending}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createMutation.isPending ? 'Създаване...' : 'Създай'}
            </button>
          </div>
        </div>
      </ModalDrawer>
    </div>
  );
}
