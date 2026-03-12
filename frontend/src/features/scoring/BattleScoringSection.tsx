import { useMemo, useState } from 'react';
import type { CampParticipation } from '../../api/participations.api';
import type { Player } from '../../api/players.api';
import type { TeamScoreDelta } from '../../api/scoring.api';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ApiClientError } from '../../lib/errors';
import { useApplyBattleScoreMutation, useBattleScorePreviewQuery } from './use-scoring';

function getPlayerDisplayName(player: Player | undefined): string {
  if (!player) {
    return 'Unknown player';
  }

  const fullName = `${player.firstName} ${player.lastName ?? ''}`.trim();
  return fullName || player.nickname?.trim() || player.id;
}

export function BattleScoringSection({
  battleId,
  campId,
  participations,
  players,
  teams,
}: {
  battleId: string;
  campId: string;
  participations: CampParticipation[];
  players: Player[];
  teams: Array<{ id: string; name: string }>;
}) {
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const previewQuery = useBattleScorePreviewQuery(battleId);
  const applyMutation = useApplyBattleScoreMutation({ battleId, campId });

  const playerByParticipationId = useMemo(() => {
    const playersById = new Map<string, Player>();
    for (const player of players) {
      playersById.set(player.id, player);
    }

    const map = new Map<string, Player | undefined>();
    for (const participation of participations) {
      map.set(participation.id, playersById.get(participation.playerId));
    }

    return map;
  }, [participations, players]);

  const teamNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const team of teams) {
      map.set(team.id, team.name);
    }
    return map;
  }, [teams]);

  async function handleApplyScore() {
    try {
      const result = await applyMutation.mutateAsync();
      setFeedback({ kind: 'success', message: result.message });
      await previewQuery.refetch();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFeedback({ kind: 'error', message: error.message });
        return;
      }

      setFeedback({ kind: 'error', message: 'Unable to apply score right now.' });
    }
  }

  function getTeamDeltaLabel(teamDelta: TeamScoreDelta): string {
    const teamName = teamNameById.get(teamDelta.teamId) || teamDelta.teamId;
    return `${teamName} (${teamDelta.teamPointsDelta >= 0 ? '+' : ''}${teamDelta.teamPointsDelta})`;
  }

  return (
    <div className="space-y-4">
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

      {previewQuery.isLoading ? <LoadingState label="Loading score preview..." /> : null}

      {previewQuery.isError ? (
        <ErrorState
          message="Unable to load score preview right now."
          onRetry={() => {
            void previewQuery.refetch();
          }}
        />
      ) : null}

      {previewQuery.isSuccess ? (
        <div className="space-y-3">
          {previewQuery.data.participationDeltas.length === 0 && previewQuery.data.teamDeltas.length === 0 ? (
            <EmptyState
              title="No score deltas yet"
              description="Complete battle data first, then preview and apply score changes."
            />
          ) : (
            <>
              <div className="space-y-2 rounded-md border border-slate-200 p-3">
                <h4 className="text-sm font-semibold text-slate-900">Participation Deltas</h4>
                {previewQuery.data.participationDeltas.length === 0 ? (
                  <p className="text-sm text-slate-600">No participation deltas.</p>
                ) : (
                  <div className="space-y-2">
                    {previewQuery.data.participationDeltas.map((delta) => {
                      const player = playerByParticipationId.get(delta.participationId);

                      return (
                        <div key={delta.participationId} className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">
                          <p className="font-medium text-slate-900">{getPlayerDisplayName(player)}</p>
                          <p className="text-xs text-slate-600">Participation ID: {delta.participationId}</p>
                          <p>Kills: {delta.killsDelta >= 0 ? '+' : ''}{delta.killsDelta}</p>
                          <p>Knife Kills: {delta.knifeKillsDelta >= 0 ? '+' : ''}{delta.knifeKillsDelta}</p>
                          <p>Survivals: {delta.survivalsDelta >= 0 ? '+' : ''}{delta.survivalsDelta}</p>
                          <p>Duel Wins: {delta.duelWinsDelta >= 0 ? '+' : ''}{delta.duelWinsDelta}</p>
                          <p>Mass Battle Wins: {delta.massBattleWinsDelta >= 0 ? '+' : ''}{delta.massBattleWinsDelta}</p>
                          <p className="font-medium">Points: {delta.pointsDelta >= 0 ? '+' : ''}{delta.pointsDelta}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2 rounded-md border border-slate-200 p-3">
                <h4 className="text-sm font-semibold text-slate-900">Team Deltas</h4>
                {previewQuery.data.teamDeltas.length === 0 ? (
                  <p className="text-sm text-slate-600">No team deltas.</p>
                ) : (
                  <ul className="space-y-1 text-sm text-slate-700">
                    {previewQuery.data.teamDeltas.map((delta) => (
                      <li key={delta.teamId}>{getTeamDeltaLabel(delta)}</li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                void handleApplyScore();
              }}
              disabled={applyMutation.isPending || previewQuery.isLoading}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {applyMutation.isPending ? 'Applying...' : 'Apply Score'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
