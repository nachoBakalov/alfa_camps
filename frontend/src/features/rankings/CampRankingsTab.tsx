import { useState } from 'react';
import type { PlayerRankingItem, TeamStandingItem } from '../../api/rankings.api';
import { SectionCard } from '../../components/cards/SectionCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Badge } from '../../components/ui/Badge';
import {
  useCampKillsRankingQuery,
  useCampPointsRankingQuery,
  useCampSurvivalsRankingQuery,
  useCampTeamStandingsQuery,
} from './use-rankings-query';

type RankingTabKey = 'points' | 'kills' | 'survivals' | 'teams';

const RANKING_TABS: Array<{ key: RankingTabKey; label: string }> = [
  { key: 'points', label: 'Points' },
  { key: 'kills', label: 'Kills' },
  { key: 'survivals', label: 'Survivals' },
  { key: 'teams', label: 'Teams' },
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
    return <EmptyState title="No ranking rows yet" description="Ranking will appear after score data is available." />;
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
                    <span className="text-slate-500">Points: </span>
                    <span className="font-semibold text-slate-900">{item.points}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Kills: </span>
                    <span className="font-semibold text-slate-900">{item.kills}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Survivals: </span>
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
    return <EmptyState title="No team standings yet" description="Standings will appear after teams and scores are available." />;
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
                  <span className="text-slate-500">Team Points: </span>
                  <span className="font-semibold text-slate-900">{item.teamPoints}</span>
                </p>
                <p>
                  <span className="text-slate-500">Final Position: </span>
                  <span className="font-semibold text-slate-900">{item.finalPosition ?? 'N/A'}</span>
                </p>
                <p>
                  <span className="text-slate-500">Status: </span>
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

  const pointsQuery = useCampPointsRankingQuery(campId, undefined, activeTab === 'points');
  const killsQuery = useCampKillsRankingQuery(campId, undefined, activeTab === 'kills');
  const survivalsQuery = useCampSurvivalsRankingQuery(campId, undefined, activeTab === 'survivals');
  const teamsQuery = useCampTeamStandingsQuery(campId, activeTab === 'teams');

  const activeQuery =
    activeTab === 'points'
      ? pointsQuery
      : activeTab === 'kills'
        ? killsQuery
        : activeTab === 'survivals'
          ? survivalsQuery
          : teamsQuery;

  return (
    <div className="space-y-4">
      <SectionCard>
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Camp Rankings</h3>
            <p className="text-sm text-slate-600">Track player and team standings for the selected camp.</p>
          </div>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Rankings tabs">
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
        </div>
      </SectionCard>

      {activeQuery.isLoading ? <LoadingState label="Loading rankings..." /> : null}

      {activeQuery.isError ? (
        <ErrorState
          message="Unable to load rankings right now."
          onRetry={() => {
            void activeQuery.refetch();
          }}
        />
      ) : null}

      {activeQuery.isSuccess ? (
        activeTab === 'points' ? (
          <PlayerRankingList items={pointsQuery.data ?? []} statLabel="Points" getStatValue={(item) => item.points} />
        ) : activeTab === 'kills' ? (
          <PlayerRankingList items={killsQuery.data ?? []} statLabel="Kills" getStatValue={(item) => item.kills} />
        ) : activeTab === 'survivals' ? (
          <PlayerRankingList
            items={survivalsQuery.data ?? []}
            statLabel="Survivals"
            getStatValue={(item) => item.survivals}
          />
        ) : (
          <TeamStandingsList items={teamsQuery.data ?? []} />
        )
      ) : null}
    </div>
  );
}
