import { Link, useParams } from 'react-router-dom';
import { MassBattleResultsEditor } from '../../features/battle-player-results/MassBattleResultsEditor';
import { useCampTeamsByCampQuery } from '../../features/camp-teams/use-camp-teams-query';
import { DuelSessionEditor } from '../../features/duels/DuelSessionEditor';
import { useParticipationsByCampQuery } from '../../features/participations/use-participations-query';
import { usePlayersQuery } from '../../features/players/use-players-query';
import { BattleScoringSection } from '../../features/scoring/BattleScoringSection';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionCard } from '../../components/cards/SectionCard';
import { useBattleQuery } from '../../features/battles/use-battles-query';
import { ApiClientError } from '../../lib/errors';

function formatDate(dateValue: string): string {
  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }

  return parsed.toLocaleDateString();
}

function getBattleErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.statusCode === 404) {
      return 'Battle was not found.';
    }

    return error.message;
  }

  return 'Unable to load battle details right now.';
}

export function BattleDetailPage() {
  const { battleId } = useParams();
  const battleQuery = useBattleQuery(battleId);
  const campTeamsQuery = useCampTeamsByCampQuery(battleQuery.data?.campId);
  const participationsQuery = useParticipationsByCampQuery(battleQuery.data?.campId);
  const playersQuery = usePlayersQuery();

  if (!battleId) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <PageHeader title="Battle detail" description="Battle identifier is required." />
        <EmptyState
          title="Missing battle identifier"
          description="Please open this page from a battle card link."
          action={
            <Link
              to="/admin"
              className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Back to admin
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Battle detail"
        description="Minimal battle detail screen for direct navigation from camp battles tab."
        actions={
          <Link
            to="/admin/camps"
            className="inline-flex rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to camps
          </Link>
        }
      />

      {battleQuery.isLoading ? <LoadingState label="Loading battle details..." /> : null}

      {battleQuery.isError ? (
        <ErrorState
          message={getBattleErrorMessage(battleQuery.error)}
          onRetry={() => {
            void battleQuery.refetch();
          }}
        />
      ) : null}

      {battleQuery.isSuccess && !battleQuery.data ? (
        <EmptyState title="Battle data is unavailable" description="No details returned for this battle." />
      ) : null}

      {battleQuery.isSuccess && battleQuery.data ? (
        <>
          <SectionCard>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">{battleQuery.data.title}</h2>

              <dl className="grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Type</dt>
                  <dd className="mt-1">{battleQuery.data.battleType}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Date</dt>
                  <dd className="mt-1">{formatDate(battleQuery.data.battleDate)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Session</dt>
                  <dd className="mt-1">{battleQuery.data.session || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
                  <dd className="mt-1">{battleQuery.data.status}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Winning Team</dt>
                  <dd className="mt-1">
                    {battleQuery.data.winningTeamId
                      ? campTeamsQuery.data?.find((team) => team.id === battleQuery.data.winningTeamId)?.name ||
                        battleQuery.data.winningTeamId
                      : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Battle ID</dt>
                  <dd className="mt-1 break-all text-xs">{battleQuery.data.id}</dd>
                </div>
              </dl>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Notes</p>
                <p className="mt-1 text-sm text-slate-700">{battleQuery.data.notes || 'No notes added.'}</p>
              </div>
            </div>
          </SectionCard>

          {battleQuery.data.battleType === 'MASS_BATTLE' ? (
            <SectionCard title="Results" description="Mass battle results editor.">
              {campTeamsQuery.isLoading || participationsQuery.isLoading || playersQuery.isLoading ? (
                <LoadingState label="Loading result editor data..." />
              ) : null}

              {campTeamsQuery.isError || participationsQuery.isError || playersQuery.isError ? (
                <ErrorState
                  message="Unable to load data for mass battle results editor."
                  onRetry={() => {
                    void campTeamsQuery.refetch();
                    void participationsQuery.refetch();
                    void playersQuery.refetch();
                  }}
                />
              ) : null}

              {campTeamsQuery.isSuccess && participationsQuery.isSuccess && playersQuery.isSuccess ? (
                <MassBattleResultsEditor
                  battleId={battleQuery.data.id}
                  campId={battleQuery.data.campId}
                  battleStatus={battleQuery.data.status}
                  winningTeamId={battleQuery.data.winningTeamId}
                  participations={participationsQuery.data}
                  players={playersQuery.data}
                  campTeams={campTeamsQuery.data.map((team) => ({
                    id: team.id,
                    name: team.name,
                    color: team.color,
                    logoUrl: team.logoUrl,
                  }))}
                  onRefreshBattle={async () => {
                    await battleQuery.refetch();
                  }}
                />
              ) : null}
            </SectionCard>
          ) : null}

          {battleQuery.data.battleType === 'DUEL_SESSION' ? (
            <SectionCard title="Duels" description="Duel session editor.">
              {participationsQuery.isLoading || playersQuery.isLoading ? (
                <LoadingState label="Loading duel editor data..." />
              ) : null}

              {participationsQuery.isError || playersQuery.isError ? (
                <ErrorState
                  message="Unable to load data for duel editor."
                  onRetry={() => {
                    void participationsQuery.refetch();
                    void playersQuery.refetch();
                  }}
                />
              ) : null}

              {participationsQuery.isSuccess && playersQuery.isSuccess ? (
                <DuelSessionEditor
                  battleId={battleQuery.data.id}
                  participations={participationsQuery.data}
                  players={playersQuery.data}
                />
              ) : null}
            </SectionCard>
          ) : null}

          {battleQuery.data.battleType !== 'MASS_BATTLE' ? (
            <SectionCard title="Scoring" description="Score preview and apply score area.">
              <BattleScoringSection
                battleId={battleQuery.data.id}
                campId={battleQuery.data.campId}
                participations={participationsQuery.data ?? []}
                players={playersQuery.data ?? []}
                teams={(campTeamsQuery.data ?? []).map((team) => ({ id: team.id, name: team.name }))}
              />
            </SectionCard>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
