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
      return 'Битката не беше намерена.';
    }

    return error.message;
  }

  return 'Неуспешно зареждане на детайлите за битката.';
}

export function BattleDetailPage() {
  const { battleId } = useParams();
  const battleQuery = useBattleQuery(battleId);
  const campTeamsQuery = useCampTeamsByCampQuery(battleQuery.data?.campId);
  const participationsQuery = useParticipationsByCampQuery(battleQuery.data?.campId);
  const playersQuery = usePlayersQuery();
  const backToCampPath = battleQuery.data?.campId ? `/admin/camps/${battleQuery.data.campId}` : '/admin/camps';

  if (!battleId) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <PageHeader title="Детайли за битката" description="Нужен е идентификатор на битка." />
        <EmptyState
          title="Липсва идентификатор на битка"
          description="Отвори тази страница от карта за битка."
          action={
            <Link
              to="/admin"
              className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Назад към таблото
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Детайли за битката"
        description="Работен екран за управление на резултати и точки в текущата битка."
        actions={
          <Link
            to={backToCampPath}
            className="inline-flex rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Назад към лагера
          </Link>
        }
      />

      {battleQuery.isLoading ? <LoadingState label="Зареждане на детайлите за битката..." /> : null}

      {battleQuery.isError ? (
        <ErrorState
          message={getBattleErrorMessage(battleQuery.error)}
          onRetry={() => {
            void battleQuery.refetch();
          }}
        />
      ) : null}

      {battleQuery.isSuccess && !battleQuery.data ? (
        <EmptyState title="Няма данни за битката" description="Не бяха върнати детайли за тази битка." />
      ) : null}

      {battleQuery.isSuccess && battleQuery.data ? (
        <>
          <SectionCard>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">{battleQuery.data.title}</h2>

              <dl className="grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Тип</dt>
                  <dd className="mt-1">{battleQuery.data.battleType}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Дата</dt>
                  <dd className="mt-1">{formatDate(battleQuery.data.battleDate)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Сесия</dt>
                  <dd className="mt-1">{battleQuery.data.session || 'Няма'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Статус</dt>
                  <dd className="mt-1">{battleQuery.data.status}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Победил отбор</dt>
                  <dd className="mt-1">
                    {battleQuery.data.winningTeamId
                      ? campTeamsQuery.data?.find((team) => team.id === battleQuery.data.winningTeamId)?.name ||
                        battleQuery.data.winningTeamId
                      : 'Няма'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">ID на битка</dt>
                  <dd className="mt-1 break-all text-xs">{battleQuery.data.id}</dd>
                </div>
              </dl>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Бележки</p>
                <p className="mt-1 text-sm text-slate-700">{battleQuery.data.notes || 'Няма добавени бележки.'}</p>
              </div>
            </div>
          </SectionCard>

          {battleQuery.data.battleType === 'MASS_BATTLE' ? (
            <SectionCard title="Резултати" description="Резултати от масова битка.">
              {campTeamsQuery.isLoading || participationsQuery.isLoading || playersQuery.isLoading ? (
                <LoadingState label="Зареждане на данни за редактора на резултати..." />
              ) : null}

              {campTeamsQuery.isError || participationsQuery.isError || playersQuery.isError ? (
                <ErrorState
                  message="Неуспешно зареждане на данни за редактора на масова битка."
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
            <SectionCard title="Сесия с дуели" description="Редактор за сесия с дуели.">
              {participationsQuery.isLoading || playersQuery.isLoading ? (
                <LoadingState label="Зареждане на данни за редактора на дуели..." />
              ) : null}

              {participationsQuery.isError || playersQuery.isError ? (
                <ErrorState
                  message="Неуспешно зареждане на данни за редактора на дуели."
                  onRetry={() => {
                    void participationsQuery.refetch();
                    void playersQuery.refetch();
                  }}
                />
              ) : null}

              {participationsQuery.isSuccess && playersQuery.isSuccess ? (
                <DuelSessionEditor
                  battleId={battleQuery.data.id}
                  campId={battleQuery.data.campId}
                  battleStatus={battleQuery.data.status}
                  participations={participationsQuery.data}
                  players={playersQuery.data}
                  onRefreshBattle={async () => {
                    await battleQuery.refetch();
                  }}
                />
              ) : null}
            </SectionCard>
          ) : null}

          {battleQuery.data.battleType !== 'MASS_BATTLE' && battleQuery.data.battleType !== 'DUEL_SESSION' ? (
            <SectionCard title="Точки" description="Преглед и прилагане на точки за текущата битка.">
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
