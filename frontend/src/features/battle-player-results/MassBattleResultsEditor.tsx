import { useMutation, useQueries } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { updateBattle } from '../../api/battles.api';
import type { CampParticipation } from '../../api/participations.api';
import type { Player } from '../../api/players.api';
import { getCurrentTeamAssignmentByParticipation } from '../../api/team-assignments.api';
import { SectionCard } from '../../components/cards/SectionCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ApiClientError } from '../../lib/errors';
import { useBattlePlayerResultMutations } from './use-battle-player-result-mutations';
import { useBattlePlayerResultsByBattleQuery } from './use-battle-player-results-query';
import { useApplyBattleScoreMutation } from '../scoring/use-scoring';
import type { BattleStatus } from '../../api/battles.api';

function getPlayerDisplayName(player: Player | undefined): string {
  if (!player) {
    return 'Unknown player';
  }

  const fullName = `${player.firstName} ${player.lastName ?? ''}`.trim();
  return fullName || player.nickname?.trim() || player.id;
}

type DraftMap = Record<string, { kills: string; knifeKills: string; survived: boolean }>;

export function MassBattleResultsEditor({
  battleId,
  campId,
  battleStatus,
  winningTeamId,
  participations,
  players,
  campTeams,
  onRefreshBattle,
}: {
  battleId: string;
  campId: string;
  battleStatus: BattleStatus;
  winningTeamId: string | null;
  participations: CampParticipation[];
  players: Player[];
  campTeams: Array<{ id: string; name: string; color?: string | null; logoUrl?: string | null }>;
  onRefreshBattle: () => Promise<void>;
}) {
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');
  const [selectedWinningTeamId, setSelectedWinningTeamId] = useState(winningTeamId ?? '');
  const [draftByParticipationId, setDraftByParticipationId] = useState<DraftMap>({});
  const [currentBattleStatus, setCurrentBattleStatus] = useState<BattleStatus>(battleStatus);

  useEffect(() => {
    setCurrentBattleStatus(battleStatus);
  }, [battleStatus]);

  const playersById = useMemo(() => {
    const map = new Map<string, Player>();

    for (const player of players) {
      map.set(player.id, player);
    }

    return map;
  }, [players]);

  const resultsQuery = useBattlePlayerResultsByBattleQuery(battleId);
  const { createMutation, updateMutation } = useBattlePlayerResultMutations(battleId);
  const applyScoreMutation = useApplyBattleScoreMutation({ battleId, campId });

  const currentTeamQueries = useQueries({
    queries: participations.map((participation) => ({
      queryKey: ['team-assignments', 'current', participation.id],
      queryFn: () => getCurrentTeamAssignmentByParticipation(participation.id),
      enabled: participations.length > 0,
    })),
  });

  const winningTeamMutation = useMutation({
    mutationFn: (payload: { winningTeamId?: string; status?: 'COMPLETED' }) => updateBattle(battleId, payload),
    onSuccess: async () => {
      await onRefreshBattle();
    },
  });

  function getApiErrorMessage(error: ApiClientError): string {
    if (error.details && error.details.length > 0) {
      return `${error.message}: ${error.details.join(', ')}`;
    }

    return error.message;
  }

  const resultByParticipationId = useMemo(() => {
    const map = new Map<string, { id: string; kills: number; knifeKills: number; survived: boolean; teamId: string }>();

    for (const result of resultsQuery.data ?? []) {
      map.set(result.participationId, {
        id: result.id,
        kills: result.kills,
        knifeKills: result.knifeKills,
        survived: result.survived,
        teamId: result.teamId,
      });
    }

    return map;
  }, [resultsQuery.data]);

  const currentTeamIdByParticipationId = useMemo(() => {
    const map = new Map<string, string | null>();

    participations.forEach((participation, index) => {
      const query = currentTeamQueries[index];

      if (!query || query.isLoading || query.isError) {
        map.set(participation.id, null);
        return;
      }

      map.set(participation.id, query.data?.teamId ?? null);
    });

    return map;
  }, [participations, currentTeamQueries]);

  function getDraft(participationId: string) {
    const existing = draftByParticipationId[participationId];

    if (existing) {
      return existing;
    }

    const result = resultByParticipationId.get(participationId);

    return {
      kills: result ? `${result.kills}` : '0',
      knifeKills: result ? `${result.knifeKills}` : '0',
      survived: result ? result.survived : false,
    };
  }

  function updateDraft(
    participationId: string,
    patch: Partial<{ kills: string; knifeKills: string; survived: boolean }>,
  ) {
    const current = getDraft(participationId);

    setDraftByParticipationId((prev) => ({
      ...prev,
      [participationId]: {
        ...current,
        ...patch,
      },
    }));
  }

  function parseNonNegativeInt(value: string): number {
    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed) || parsed < 0) {
      return 0;
    }

    return parsed;
  }

  function adjustKills(participationId: string, delta: number) {
    const current = getDraft(participationId);
    const nextValue = Math.max(0, parseNonNegativeInt(current.kills) + delta);
    const nextKnifeKills = Math.min(parseNonNegativeInt(current.knifeKills), nextValue);

    updateDraft(participationId, { kills: `${nextValue}`, knifeKills: `${nextKnifeKills}` });
  }

  function adjustKnifeKills(participationId: string, delta: number) {
    const current = getDraft(participationId);
    const maxKills = parseNonNegativeInt(current.kills);
    const nextValue = Math.max(0, Math.min(maxKills, parseNonNegativeInt(current.knifeKills) + delta));
    updateDraft(participationId, { knifeKills: `${nextValue}` });
  }

  function getParticipationTeamId(participationId: string): string | null {
    const resultTeamId = resultByParticipationId.get(participationId)?.teamId;

    if (resultTeamId) {
      return resultTeamId;
    }

    return currentTeamIdByParticipationId.get(participationId) ?? null;
  }

  async function saveAllResults() {
    for (const participation of participations) {
      const draft = getDraft(participation.id);
      const teamId = getParticipationTeamId(participation.id);
      const kills = parseNonNegativeInt(draft.kills);
      const knifeKills = parseNonNegativeInt(draft.knifeKills);

      if (!teamId) {
        throw new Error(`Please select a result team for ${getPlayerDisplayName(playersById.get(participation.playerId))}.`);
      }

      if (knifeKills > kills) {
        throw new Error(`Knife kills cannot be greater than kills for ${getPlayerDisplayName(playersById.get(participation.playerId))}.`);
      }

      const existing = resultByParticipationId.get(participation.id);

      if (existing) {
        await updateMutation.mutateAsync({
          id: existing.id,
          payload: {
            teamId,
            kills,
            knifeKills,
            survived: draft.survived,
          },
        });
      } else {
        await createMutation.mutateAsync({
          battleId,
          participationId: participation.id,
          teamId,
          kills,
          knifeKills,
          survived: draft.survived,
        });
      }
    }
  }

  async function handleUpdateResults() {
    try {
      await winningTeamMutation.mutateAsync({ winningTeamId: selectedWinningTeamId || undefined });
      await saveAllResults();
      await resultsQuery.refetch();
      setFeedback({ kind: 'success', message: 'Battle results updated successfully.' });
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFeedback({ kind: 'error', message: getApiErrorMessage(error) });
        return;
      }

      if (error instanceof Error) {
        setFeedback({ kind: 'error', message: error.message });
        return;
      }

      setFeedback({ kind: 'error', message: 'Unable to update results right now.' });
    }
  }

  async function handleApplyScore() {
    if (currentBattleStatus !== 'COMPLETED') {
      setFeedback({
        kind: 'error',
        message: 'Score can be applied only for COMPLETED battles. Use "Apply Score + Complete Battle" first.',
      });
      return;
    }

    try {
      await saveAllResults();
      const result = await applyScoreMutation.mutateAsync();
      setFeedback({ kind: 'success', message: result.message });
      await resultsQuery.refetch();
      await onRefreshBattle();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFeedback({ kind: 'error', message: getApiErrorMessage(error) });
        return;
      }

      if (error instanceof Error) {
        setFeedback({ kind: 'error', message: error.message });
        return;
      }

      setFeedback({ kind: 'error', message: 'Unable to apply score right now.' });
    }
  }

  async function handleApplyScoreAndCompleteBattle() {
    try {
      await winningTeamMutation.mutateAsync({
        winningTeamId: selectedWinningTeamId || undefined,
        status: 'COMPLETED',
      });
      setCurrentBattleStatus('COMPLETED');
      await saveAllResults();
      const result = await applyScoreMutation.mutateAsync();
      await resultsQuery.refetch();
      await onRefreshBattle();
      setFeedback({ kind: 'success', message: `Battle completed. ${result.message}` });
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFeedback({ kind: 'error', message: getApiErrorMessage(error) });
        return;
      }

      if (error instanceof Error) {
        setFeedback({ kind: 'error', message: error.message });
        return;
      }

      setFeedback({ kind: 'error', message: 'Unable to complete and apply score right now.' });
    }
  }

  const filteredParticipations = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return participations.filter((participation) => {
      const participationTeamId = getParticipationTeamId(participation.id);
      if (selectedTeamFilter !== 'all' && participationTeamId !== selectedTeamFilter) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const player = playersById.get(participation.playerId);
      return getPlayerDisplayName(player).toLowerCase().includes(keyword);
    });
  }, [participations, playersById, search, selectedTeamFilter, draftByParticipationId, resultsQuery.data, currentTeamQueries]);

  const isLoading = resultsQuery.isLoading;
  const isError = resultsQuery.isError;
  const isSavingResults = createMutation.isPending || updateMutation.isPending || winningTeamMutation.isPending;
  const isApplyingScore = applyScoreMutation.isPending;

  return (
    <div className="space-y-4">
      <SectionCard title="Winning Team" description="Select the winning team for this mass battle.">
        <div className="space-y-3">
          <select
            value={selectedWinningTeamId}
            onChange={(event) => {
              setSelectedWinningTeamId(event.target.value);
            }}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2 sm:max-w-sm"
          >
            <option value="">No winning team</option>
            {campTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>

          <div>
            <label htmlFor="participantSearch" className="mb-1 block text-sm font-medium text-slate-700">
              Search participants
            </label>
            <input
              id="participantSearch"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              placeholder="Search by player name"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2 sm:max-w-sm"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Team filter</p>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedTeamFilter('all');
                }}
                className={
                  selectedTeamFilter === 'all'
                    ? 'inline-flex h-12 min-w-[3rem] items-center justify-center rounded-full border-2 border-slate-900 bg-slate-900 px-3 text-xs font-semibold text-white'
                    : 'inline-flex h-12 min-w-[3rem] items-center justify-center rounded-full border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50'
                }
              >
                All
              </button>

              {campTeams.map((team) => {
                const isSelected = selectedTeamFilter === team.id;

                return (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => {
                      setSelectedTeamFilter(team.id);
                    }}
                    className={
                      isSelected
                        ? 'relative inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-900 bg-white text-xs font-semibold text-slate-900'
                        : 'relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50'
                    }
                    style={{ boxShadow: team.color ? `inset 0 0 0 2px ${team.color}` : undefined }}
                    aria-label={`Filter by ${team.name}`}
                    title={team.name}
                  >
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={team.name} className="h-9 w-9 rounded-full object-cover" loading="lazy" />
                    ) : (
                      <span>{team.name.charAt(0).toUpperCase()}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
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

      {isLoading ? <LoadingState label="Loading player results..." /> : null}

      {isError ? (
        <ErrorState
          message="Unable to load battle player results right now."
          onRetry={() => {
            void resultsQuery.refetch();
          }}
        />
      ) : null}

      {!isLoading && !isError && participations.length === 0 ? (
        <EmptyState
          title="No participations available"
          description="Add participations for this camp before entering mass battle results."
        />
      ) : null}

      {!isLoading && !isError && participations.length > 0 ? (
        <section className="space-y-3 pb-32">
          {filteredParticipations.length === 0 ? (
            <EmptyState title="No participants match filters" description="Try another team filter or search term." />
          ) : (
            filteredParticipations.map((participation) => {
              const player = playersById.get(participation.playerId);
              const draft = getDraft(participation.id);
              const participationTeamId = getParticipationTeamId(participation.id);
              const participationTeamName = participationTeamId
                ? campTeams.find((team) => team.id === participationTeamId)?.name ?? participationTeamId
                : 'Unassigned';

              return (
                <article key={participation.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-base font-semibold text-slate-900">{getPlayerDisplayName(player)}</h4>
                      <p className="text-xs text-slate-600">Participation ID: {participation.id}</p>
                    </div>

                    <p className="text-sm text-slate-700">
                      <span className="font-medium text-slate-800">Team: </span>
                      {participationTeamName}
                    </p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Kills</label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              adjustKills(participation.id, -1);
                            }}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-lg font-semibold text-slate-700 hover:bg-slate-50"
                            aria-label="Decrease kills"
                          >
                            -
                          </button>
                          <input
                            inputMode="numeric"
                            value={draft.kills}
                            onChange={(event) => {
                              updateDraft(participation.id, { kills: event.target.value });
                            }}
                            className="h-10 w-full rounded-md border border-slate-300 px-3 text-center text-slate-900 outline-none ring-sky-500 focus:ring-2"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              adjustKills(participation.id, 1);
                            }}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-lg font-semibold text-slate-700 hover:bg-slate-50"
                            aria-label="Increase kills"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Knife Kills</label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              adjustKnifeKills(participation.id, -1);
                            }}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-lg font-semibold text-slate-700 hover:bg-slate-50"
                            aria-label="Decrease knife kills"
                          >
                            -
                          </button>
                          <input
                            inputMode="numeric"
                            value={draft.knifeKills}
                            onChange={(event) => {
                              updateDraft(participation.id, { knifeKills: event.target.value });
                            }}
                            className="h-10 w-full rounded-md border border-slate-300 px-3 text-center text-slate-900 outline-none ring-sky-500 focus:ring-2"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              adjustKnifeKills(participation.id, 1);
                            }}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-lg font-semibold text-slate-700 hover:bg-slate-50"
                            aria-label="Increase knife kills"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={draft.survived}
                        onChange={(event) => {
                          updateDraft(participation.id, { survived: event.target.checked });
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      Survived
                    </label>
                  </div>
                </article>
              );
            })
          )}
        </section>
      ) : null}

      {!isLoading && !isError && participations.length > 0 ? (
        <div className="sticky bottom-0 z-20 -mx-4 border-t border-slate-200 bg-white/95 p-4 backdrop-blur sm:-mx-6 sm:p-6">
          <div className="grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => {
                void handleUpdateResults();
              }}
              disabled={isSavingResults || isApplyingScore}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingResults ? 'Updating...' : 'Update Results'}
            </button>
            <button
              type="button"
              onClick={() => {
                void handleApplyScore();
              }}
              disabled={isSavingResults || isApplyingScore || currentBattleStatus !== 'COMPLETED'}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isApplyingScore ? 'Applying...' : 'Apply Score'}
            </button>
            <button
              type="button"
              onClick={() => {
                void handleApplyScoreAndCompleteBattle();
              }}
              disabled={isSavingResults || isApplyingScore}
              className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingResults || isApplyingScore ? 'Processing...' : 'Apply Score + Complete Battle'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
