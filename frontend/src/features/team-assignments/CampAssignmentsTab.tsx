import { useQueries } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { Player } from '../../api/players.api';
import {
  getCurrentTeamAssignmentByParticipation,
  getTeamAssignmentsByParticipation,
} from '../../api/team-assignments.api';
import { SectionCard } from '../../components/cards/SectionCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ModalDrawer } from '../../components/ui/ModalDrawer';
import { Badge } from '../../components/ui/Badge';
import { ApiClientError } from '../../lib/errors';
import { useCampTeamsByCampQuery } from '../camp-teams/use-camp-teams-query';
import { usePlayersQuery } from '../players/use-players-query';
import { useParticipationsByCampQuery } from '../participations/use-participations-query';
import { useTeamAssignmentMutations } from './use-team-assignment-mutations';
import {
  getCurrentTeamAssignmentQueryKey,
  getTeamAssignmentsByParticipationQueryKey,
} from './use-team-assignments-query';

function getPlayerDisplayName(player: Player | undefined): string {
  if (!player) {
    return 'Неизвестен играч';
  }

  const fullName = `${player.firstName} ${player.lastName ?? ''}`.trim();
  if (fullName) {
    return fullName;
  }

  return player.nickname?.trim() || player.id;
}

function formatDateTime(dateValue: string): string {
  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }

  return parsed.toLocaleString();
}

function toDatetimeLocalValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getMutationErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return fallback;
}

export function CampAssignmentsTab({ campId }: { campId: string }) {
  const [expandedParticipationIds, setExpandedParticipationIds] = useState<string[]>([]);
  const [assignModalParticipationId, setAssignModalParticipationId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [assignedAt, setAssignedAt] = useState(toDatetimeLocalValue(new Date()));
  const [note, setNote] = useState('');
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const participationsQuery = useParticipationsByCampQuery(campId);
  const playersQuery = usePlayersQuery();
  const campTeamsQuery = useCampTeamsByCampQuery(campId);
  const { createMutation } = useTeamAssignmentMutations();

  const playersById = useMemo(() => {
    const map = new Map<string, Player>();

    for (const player of playersQuery.data ?? []) {
      map.set(player.id, player);
    }

    return map;
  }, [playersQuery.data]);

  const teamsById = useMemo(() => {
    const map = new Map<string, { name: string; color: string | null }>();

    for (const team of campTeamsQuery.data ?? []) {
      map.set(team.id, { name: team.name, color: team.color });
    }

    return map;
  }, [campTeamsQuery.data]);

  const currentTeamQueries = useQueries({
    queries: (participationsQuery.data ?? []).map((participation) => ({
      queryKey: getCurrentTeamAssignmentQueryKey(participation.id),
      queryFn: () => getCurrentTeamAssignmentByParticipation(participation.id),
      enabled: participationsQuery.isSuccess,
    })),
  });

  const historyQueries = useQueries({
    queries: (participationsQuery.data ?? []).map((participation) => {
      const isExpanded = expandedParticipationIds.includes(participation.id);

      return {
        queryKey: getTeamAssignmentsByParticipationQueryKey(participation.id),
        queryFn: () => getTeamAssignmentsByParticipation(participation.id),
        enabled: participationsQuery.isSuccess && isExpanded,
      };
    }),
  });

  const currentTeamByParticipationId = useMemo(() => {
    const map = new Map<string, { teamId: string | null; state: 'loading' | 'ready' | 'error' }>();

    (participationsQuery.data ?? []).forEach((participation, index) => {
      const query = currentTeamQueries[index];

      if (!query || query.isLoading) {
        map.set(participation.id, { teamId: null, state: 'loading' });
        return;
      }

      if (query.isError) {
        map.set(participation.id, { teamId: null, state: 'error' });
        return;
      }

      map.set(participation.id, {
        teamId: query.data?.teamId ?? null,
        state: 'ready',
      });
    });

    return map;
  }, [participationsQuery.data, currentTeamQueries]);

  const historyByParticipationId = useMemo(() => {
    const map = new Map<string, { state: 'loading' | 'ready' | 'error'; items: ReturnType<typeof getTeamAssignmentsByParticipation> extends Promise<infer R> ? R : never }>();

    (participationsQuery.data ?? []).forEach((participation, index) => {
      const query = historyQueries[index];
      const isExpanded = expandedParticipationIds.includes(participation.id);

      if (!isExpanded) {
        return;
      }

      if (!query || query.isLoading) {
        map.set(participation.id, { state: 'loading', items: [] });
        return;
      }

      if (query.isError) {
        map.set(participation.id, { state: 'error', items: [] });
        return;
      }

      map.set(participation.id, { state: 'ready', items: query.data ?? [] });
    });

    return map;
  }, [participationsQuery.data, historyQueries, expandedParticipationIds]);

  function toggleHistory(participationId: string) {
    setExpandedParticipationIds((current) =>
      current.includes(participationId)
        ? current.filter((id) => id !== participationId)
        : [...current, participationId],
    );
  }

  function openAssignModal(participationId: string) {
    setFeedback(null);
    setAssignModalParticipationId(participationId);
    setSelectedTeamId('');
    setAssignedAt(toDatetimeLocalValue(new Date()));
    setNote('');
  }

  async function handleAssignTeam() {
    if (!assignModalParticipationId) {
      return;
    }

    if (!selectedTeamId) {
      setFeedback({ kind: 'error', message: 'Избери отбор.' });
      return;
    }

    try {
      await createMutation.mutateAsync({
        participationId: assignModalParticipationId,
        teamId: selectedTeamId,
        assignedAt: assignedAt ? new Date(assignedAt).toISOString() : undefined,
        note: note.trim() || undefined,
      });

      setFeedback({ kind: 'success', message: 'Разпределението към отбор е създадено успешно.' });
      setAssignModalParticipationId(null);
      setExpandedParticipationIds((current) =>
        current.includes(assignModalParticipationId) ? current : [...current, assignModalParticipationId],
      );
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Неуспешно създаване на разпределение към отбор.'),
      });
    }
  }

  const isBaseLoading = participationsQuery.isLoading || playersQuery.isLoading || campTeamsQuery.isLoading;
  const isBaseError = participationsQuery.isError || playersQuery.isError || campTeamsQuery.isError;

  return (
    <div className="space-y-4">
      <SectionCard>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-900">Разпределения по отбори</h3>
          <p className="text-sm text-slate-600">Разпределяй участниците по отбори и преглеждай историята.</p>
        </div>
      </SectionCard>

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

      <ModalDrawer
        open={Boolean(assignModalParticipationId)}
        title="Разпредели към отбор"
        onClose={() => {
          setAssignModalParticipationId(null);
        }}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="teamId" className="mb-1 block text-sm font-medium text-slate-700">
              Отбор
            </label>
            <select
              id="teamId"
              value={selectedTeamId}
              onChange={(event) => {
                setSelectedTeamId(event.target.value);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            >
              <option value="">Избери отбор</option>
              {(campTeamsQuery.data ?? []).map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="assignedAt" className="mb-1 block text-sm font-medium text-slate-700">
              Разпределен на
            </label>
            <input
              id="assignedAt"
              type="datetime-local"
              value={assignedAt}
              onChange={(event) => {
                setAssignedAt(event.target.value);
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="assignmentNote" className="mb-1 block text-sm font-medium text-slate-700">
              Бележка (по избор)
            </label>
            <textarea
              id="assignmentNote"
              rows={3}
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            />
          </div>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setAssignModalParticipationId(null);
              }}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Отказ
            </button>
            <button
              type="button"
              onClick={() => {
                void handleAssignTeam();
              }}
              disabled={createMutation.isPending}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createMutation.isPending ? 'Разпределяне...' : 'Разпредели'}
            </button>
          </div>
        </div>
      </ModalDrawer>

      {isBaseLoading ? <LoadingState label="Зареждане на данни за разпределения..." /> : null}

      {isBaseError ? (
        <ErrorState
          message="Неуспешно зареждане на данни за разпределения."
          onRetry={() => {
            void participationsQuery.refetch();
            void playersQuery.refetch();
            void campTeamsQuery.refetch();
          }}
        />
      ) : null}

      {!isBaseLoading && !isBaseError && (participationsQuery.data ?? []).length === 0 ? (
        <EmptyState
          title="Няма налични участия"
          description="Първо създай участия, за да управляваш разпределенията по отбори."
        />
      ) : null}

      {!isBaseLoading && !isBaseError && (participationsQuery.data ?? []).length > 0 ? (
        <section className="grid gap-3 sm:grid-cols-2">
          {(participationsQuery.data ?? []).map((participation) => {
            const isExpanded = expandedParticipationIds.includes(participation.id);
            const player = playersById.get(participation.playerId);
            const currentTeamState = currentTeamByParticipationId.get(participation.id);
            const currentTeamName =
              currentTeamState?.teamId ? teamsById.get(currentTeamState.teamId)?.name ?? currentTeamState.teamId : null;
            const historyState = historyByParticipationId.get(participation.id);

            return (
              <SectionCard key={participation.id}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-semibold text-slate-900">{getPlayerDisplayName(player)}</h4>
                      <p className="text-xs text-slate-600">ID участие: {participation.id}</p>
                    </div>
                    <Badge tone="neutral">Участник</Badge>
                  </div>

                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <span className="font-medium text-slate-800">Текущ отбор: </span>
                    {currentTeamState?.state === 'loading'
                      ? 'Зареждане...'
                      : currentTeamState?.state === 'error'
                        ? 'Няма данни'
                        : currentTeamName || 'Неразпределен'}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        toggleHistory(participation.id);
                      }}
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      {isExpanded ? 'Скрий история' : 'Покажи история'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        openAssignModal(participation.id);
                      }}
                      className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      Ново разпределение
                    </button>
                  </div>

                  {isExpanded ? (
                    <div className="rounded-md border border-slate-200 p-3">
                      <p className="text-sm font-medium text-slate-800">История на разпределенията</p>

                      {historyState?.state === 'loading' ? (
                        <p className="mt-2 text-sm text-slate-600">Зареждане на историята...</p>
                      ) : null}

                      {historyState?.state === 'error' ? (
                        <p className="mt-2 text-sm text-red-700">Неуспешно зареждане на историята на разпределенията.</p>
                      ) : null}

                      {historyState?.state === 'ready' && historyState.items.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-600">Все още няма разпределения.</p>
                      ) : null}

                      {historyState?.state === 'ready' && historyState.items.length > 0 ? (
                        <div className="mt-2 space-y-2">
                          {historyState.items.map((item) => {
                            const team = teamsById.get(item.teamId);

                            return (
                              <div key={item.id} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                                <p className="font-medium text-slate-900">{team?.name ?? item.teamId}</p>
                                <p className="text-xs text-slate-600">Разпределен на: {formatDateTime(item.assignedAt)}</p>
                                <p className="text-xs text-slate-600">Разпределен от: {item.assignedBy || 'Система/Неизвестен'}</p>
                                <p className="text-xs text-slate-600">Бележка: {item.note || 'Няма'}</p>
                                <p className="text-xs text-slate-600">Цвят на отбора: {team?.color || 'Не е зададен'}</p>
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </SectionCard>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}
