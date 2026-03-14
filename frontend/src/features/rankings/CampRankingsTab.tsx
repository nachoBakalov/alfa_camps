import { useQueries } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { PlayerRankingItem, TeamStandingItem } from '../../api/rankings.api';
import { getCurrentTeamAssignmentByParticipation } from '../../api/team-assignments.api';
import { SectionCard } from '../../components/cards/SectionCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Badge } from '../../components/ui/Badge';
import { useCampTeamsByCampQuery } from '../camp-teams/use-camp-teams-query';
import {
  useCampKillsRankingQuery,
  useCampPointsRankingQuery,
  useCampSurvivalsRankingQuery,
  useCampTeamStandingsQuery,
} from './use-rankings-query';

type RankingTabKey = 'points' | 'kills' | 'survivals' | 'teams';

const RANKING_TABS: Array<{ key: RankingTabKey; label: string }> = [
  { key: 'points', label: 'Точки' },
  { key: 'kills', label: 'Убийства' },
  { key: 'survivals', label: 'Оцеляване' },
  { key: 'teams', label: 'Отбори' },
];

function getPlayerDisplayName(item: PlayerRankingItem): string {
  const fullName = `${item.firstName} ${item.lastName ?? ''}`.trim();
  return fullName || item.nickname?.trim() || item.playerId;
}

function getInitials(name: string): string {
  const parts = name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

function RankBadge({ position }: { position: number }) {
  const tone = position <= 3 ? 'success' : 'neutral';
  return <Badge tone={tone}>#{position}</Badge>;
}

function PlayerAvatar({ item }: { item: PlayerRankingItem }) {
  const displayName = getPlayerDisplayName(item);

  if (item.avatarUrl) {
    return (
      <img
        src={item.avatarUrl}
        alt={`${displayName} avatar`}
        className="h-12 w-12 rounded-full border border-slate-200 object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600">
      {getInitials(displayName)}
    </div>
  );
}

function TeamLogo({ item }: { item: TeamStandingItem }) {
  if (item.logoUrl) {
    return (
      <img
        src={item.logoUrl}
        alt={`${item.name} logo`}
        className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <div
      className="h-12 w-12 rounded-lg border border-slate-200"
      style={{ backgroundColor: item.color || '#e2e8f0' }}
      aria-label={`${item.name} color`}
    />
  );
}

function TeamScopeLogo({
  name,
  color,
  logoUrl,
}: {
  name: string;
  color?: string | null;
  logoUrl?: string | null;
}) {
  if (logoUrl) {
    return <img src={logoUrl} alt={name} className="h-9 w-9 rounded-full object-cover" loading="lazy" />;
  }

  return (
    <span
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-700"
      style={{ backgroundColor: color || '#f1f5f9' }}
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function PlayerRankingList({
  items,
  statLabel,
  getStatValue,
}: {
  items: PlayerRankingItem[];
  statLabel: string;
  getStatValue: (item: PlayerRankingItem) => number;
}) {
  if (items.length === 0) {
    return <EmptyState title="Все още няма редове в класирането" description="Класирането ще се появи след натрупване на резултати." />;
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const displayName = getPlayerDisplayName(item);

        return (
          <article key={item.participationId} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-start gap-3">
              <PlayerAvatar item={item} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                  <RankBadge position={index + 1} />
                </div>
                <p className="text-xs text-slate-500">{item.nickname ? `@${item.nickname}` : item.playerId}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700">
                  <p>
                    <span className="text-slate-500">{statLabel}: </span>
                    <span className="font-semibold text-slate-900">{getStatValue(item)}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Точки: </span>
                    <span className="font-semibold text-slate-900">{item.points}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Убийства: </span>
                    <span className="font-semibold text-slate-900">{item.kills}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Оцеляване: </span>
                    <span className="font-semibold text-slate-900">{item.survivals}</span>
                  </p>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function TeamStandingsList({ items }: { items: TeamStandingItem[] }) {
  if (items.length === 0) {
    return <EmptyState title="Все още няма класиране на отборите" description="Класирането ще се появи след наличие на отбори и резултати." />;
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <article key={item.teamId} className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex items-start gap-3">
            <TeamLogo item={item} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                <RankBadge position={index + 1} />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700">
                <p>
                  <span className="text-slate-500">Точки отбор: </span>
                  <span className="font-semibold text-slate-900">{item.teamPoints}</span>
                </p>
                <p>
                  <span className="text-slate-500">Крайна позиция: </span>
                  <span className="font-semibold text-slate-900">{item.finalPosition ?? 'Няма'}</span>
                </p>
                <p>
                  <span className="text-slate-500">Статус: </span>
                  <span className="font-semibold text-slate-900">{item.isActive ? 'Активен' : 'Неактивен'}</span>
                </p>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function CampRankingsTab({ campId }: { campId: string }) {
  const [activeTab, setActiveTab] = useState<RankingTabKey>('points');
  const [selectedTeamScope, setSelectedTeamScope] = useState<string>('all');

  const pointsQuery = useCampPointsRankingQuery(campId, undefined, activeTab === 'points');
  const killsQuery = useCampKillsRankingQuery(campId, undefined, activeTab === 'kills');
  const survivalsQuery = useCampSurvivalsRankingQuery(campId, undefined, activeTab === 'survivals');
  const teamsQuery = useCampTeamStandingsQuery(campId, activeTab === 'teams');
  const campTeamsQuery = useCampTeamsByCampQuery(campId);

  const activeQuery =
    activeTab === 'points'
      ? pointsQuery
      : activeTab === 'kills'
        ? killsQuery
        : activeTab === 'survivals'
          ? survivalsQuery
          : teamsQuery;

  const activePlayerItems = useMemo(() => {
    if (activeTab === 'points') {
      return pointsQuery.data ?? [];
    }

    if (activeTab === 'kills') {
      return killsQuery.data ?? [];
    }

    if (activeTab === 'survivals') {
      return survivalsQuery.data ?? [];
    }

    return [];
  }, [activeTab, killsQuery.data, pointsQuery.data, survivalsQuery.data]);

  const isPlayerRankingTab = activeTab === 'points' || activeTab === 'kills' || activeTab === 'survivals';

  const currentTeamQueries = useQueries({
    queries: activePlayerItems.map((item) => ({
      queryKey: ['team-assignments', 'current', item.participationId],
      queryFn: () => getCurrentTeamAssignmentByParticipation(item.participationId),
      enabled: isPlayerRankingTab && selectedTeamScope !== 'all' && activePlayerItems.length > 0,
    })),
  });

  const currentTeamByParticipationId = useMemo(() => {
    const map = new Map<string, string | null>();

    activePlayerItems.forEach((item, index) => {
      const query = currentTeamQueries[index];
      map.set(item.participationId, query?.data?.teamId ?? null);
    });

    return map;
  }, [activePlayerItems, currentTeamQueries]);

  const filteredPlayerItems = useMemo(() => {
    if (selectedTeamScope === 'all') {
      return activePlayerItems;
    }

    return activePlayerItems.filter((item) => currentTeamByParticipationId.get(item.participationId) === selectedTeamScope);
  }, [activePlayerItems, currentTeamByParticipationId, selectedTeamScope]);

  const isFilteringByTeam = isPlayerRankingTab && selectedTeamScope !== 'all';
  const isTeamFilterLoading = isFilteringByTeam && currentTeamQueries.some((query) => query.isLoading);
  const isTeamFilterError = isFilteringByTeam && currentTeamQueries.some((query) => query.isError);

  return (
    <div className="space-y-4">
      <SectionCard>
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Класиране</h3>
            <p className="text-sm text-slate-600">Проследявай класирането на играчи и отбори за избрания лагер.</p>
          </div>

          <div className="-mx-1 flex flex-wrap gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Раздели за класиране">
            {RANKING_TABS.map((tab) => {
              const isActive = tab.key === activeTab;

              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSelectedTeamScope('all');
                  }}
                  className={
                    isActive
                      ? 'whitespace-nowrap rounded-md border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-medium text-white'
                      : 'whitespace-nowrap rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
                  }
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {isPlayerRankingTab ? (
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Отбор</p>
              <div className="-mx-1 flex flex-wrap gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Филтър по отбор">
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedTeamScope === 'all'}
                  onClick={() => {
                    setSelectedTeamScope('all');
                  }}
                  className={
                    selectedTeamScope === 'all'
                      ? 'whitespace-nowrap rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white'
                      : 'whitespace-nowrap rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
                  }
                >
                  Общи
                </button>

                {(campTeamsQuery.data ?? []).map((team) => {
                  const isSelected = selectedTeamScope === team.id;

                  return (
                    <button
                      key={team.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => {
                        setSelectedTeamScope(team.id);
                      }}
                      className={
                        isSelected
                          ? 'inline-flex h-11 min-w-[2.75rem] items-center justify-center rounded-full border-2 border-slate-900 bg-white px-1'
                          : 'inline-flex h-11 min-w-[2.75rem] items-center justify-center rounded-full border border-slate-300 bg-white px-1 hover:bg-slate-50'
                      }
                      title={team.name}
                      aria-label={team.name}
                    >
                      <TeamScopeLogo name={team.name} color={team.color} logoUrl={team.logoUrl} />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </SectionCard>

      {activeQuery.isLoading ? <LoadingState label="Зареждане на класирането..." /> : null}

      {activeQuery.isError ? (
        <ErrorState
          message="Неуспешно зареждане на класирането в момента."
          onRetry={() => {
            void activeQuery.refetch();
          }}
        />
      ) : null}

      {isTeamFilterLoading ? <LoadingState label="Зареждане на филтъра по отбор..." /> : null}

      {isTeamFilterError ? (
        <ErrorState
          message="Неуспешно зареждане на текущите отбори за филтъра."
          onRetry={() => {
            currentTeamQueries.forEach((query) => {
              void query.refetch();
            });
          }}
        />
      ) : null}

      {activeQuery.isSuccess && !isTeamFilterLoading && !isTeamFilterError ? (
        activeTab === 'points' ? (
          <PlayerRankingList items={filteredPlayerItems} statLabel="Точки" getStatValue={(item) => item.points} />
        ) : activeTab === 'kills' ? (
          <PlayerRankingList items={filteredPlayerItems} statLabel="Убийства" getStatValue={(item) => item.kills} />
        ) : activeTab === 'survivals' ? (
          <PlayerRankingList
            items={filteredPlayerItems}
            statLabel="Оцеляване"
            getStatValue={(item) => item.survivals}
          />
        ) : (
          <TeamStandingsList items={teamsQuery.data ?? []} />
        )
      ) : null}
    </div>
  );
}
