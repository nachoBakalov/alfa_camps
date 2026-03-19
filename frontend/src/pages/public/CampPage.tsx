import { useQueries } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Camp } from '../../api/camps.api';
import { getCurrentTeamAssignmentByParticipation } from '../../api/team-assignments.api';
import {
  CircularTokenCard,
  DarkSectionBlock,
  ExpandablePlayersSection,
  LoadMoreButton,
  PhotoGalleryGrid,
  PublicHero,
  RankingList,
  RankingTabs,
  type RankingTabKey,
  SectionTitle,
} from '../../components/public';
import { useCampTeamsByCampQuery } from '../../features/camp-teams/use-camp-teams-query';
import { useCampTypesQuery } from '../../features/camp-types/use-camp-types-query';
import { useCampQuery } from '../../features/camps/use-camps-query';
import { useParticipationsByCampQuery } from '../../features/participations/use-participations-query';
import { usePlayersQuery } from '../../features/players/use-players-query';
import { usePhotosQuery } from '../../features/photos/use-photos-query';
import {
  useCampKillsRankingQuery,
  useCampPointsRankingQuery,
  useCampSurvivalsRankingQuery,
} from '../../features/rankings/use-rankings-query';
import { resolveBackendAssetUrl } from '../../lib/asset-url';

const TOP_PLAYERS_FILTER_ID = '__top-players__';
const ALL_PHOTOS_FILTER_ID = '__all-photos__';
const CAMP_SECTION_CLASS = 'scroll-mt-24 space-y-4';
const TOKEN_ROW_CLASS = 'flex flex-wrap items-start justify-center gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-7';

function toTimestamp(value: string): number {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getStartOfTodayTimestamp(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

function isUpcomingCamp(camp: Camp): boolean {
  if (camp.status === 'ACTIVE' || camp.status === 'FINISHED') {
    return false;
  }

  return toTimestamp(camp.startDate) >= getStartOfTodayTimestamp();
}

function getCampHeroStatus(camp: Camp): { status: 'active' | 'upcoming' | 'finished'; statusLabel: string } {
  if (camp.status === 'ACTIVE') {
    return { status: 'active', statusLabel: 'Активен' };
  }

  if (isUpcomingCamp(camp)) {
    return { status: 'upcoming', statusLabel: 'Предстоящ' };
  }

  return { status: 'finished', statusLabel: 'Изминал' };
}

function getCampDateRange(startDate: string, endDate: string): string {
  const formatter = new Intl.DateTimeFormat('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`;
}

function getPlayerDisplayName(firstName: string, lastName: string | null, nickname: string | null): string {
  const normalizedNickname = nickname?.trim();
  if (normalizedNickname) {
    return normalizedNickname;
  }

  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  return fullName || firstName;
}

function getPlayerFullName(firstName: string, lastName: string | null): string {
  return [firstName, lastName].filter(Boolean).join(' ').trim();
}

function getRankingValueLabel(
  rankingTab: RankingTabKey,
  item: { points: number; kills: number; survivals: number },
): string {
  if (rankingTab === 'kills') {
    return String(item.kills);
  }

  if (rankingTab === 'survivals') {
    return String(item.survivals);
  }

  return String(item.points);
}

export function CampPage() {
  const navigate = useNavigate();
  const { campId } = useParams();
  const [playersQuery, setPlayersQuery] = useState('');
  const [rankingTab, setRankingTab] = useState<RankingTabKey>('points');
  const [activeRankingFilter, setActiveRankingFilter] = useState<string>(TOP_PLAYERS_FILTER_ID);
  const [activePhotoFilter, setActivePhotoFilter] = useState<string>(ALL_PHOTOS_FILTER_ID);
  const [visiblePhotoCount, setVisiblePhotoCount] = useState(20);
  const campQuery = useCampQuery(campId);
  const campTypesQuery = useCampTypesQuery();
  const campTeamsQuery = useCampTeamsByCampQuery(campId);
  const campParticipationsQuery = useParticipationsByCampQuery(campId);
  const playersQueryResult = usePlayersQuery();
  const campPhotosQuery = usePhotosQuery('camp', campId);
  const pointsRankingQuery = useCampPointsRankingQuery(campId, undefined, rankingTab === 'points');
  const killsRankingQuery = useCampKillsRankingQuery(campId, undefined, rankingTab === 'kills');
  const survivalsRankingQuery = useCampSurvivalsRankingQuery(campId, undefined, rankingTab === 'survivals');

  const heroViewModel = useMemo(() => {
    const camp = campQuery.data;

    if (!camp) {
      return {
        status: 'finished' as const,
        statusLabel: 'Изминал',
        title: 'ALFA CAMP',
        location: 'България',
        dateLabel: 'Лагер',
        backgroundImageUrl: '/assets/team_token/lion.png',
      };
    }

    const statusModel = getCampHeroStatus(camp);
    const campType = (campTypesQuery.data ?? []).find((item) => item.id === camp.campTypeId);

    return {
      status: statusModel.status,
      statusLabel: statusModel.statusLabel,
      title: camp.title,
      location: camp.location ?? 'България',
      dateLabel: getCampDateRange(camp.startDate, camp.endDate),
      backgroundImageUrl: camp.coverImageUrl ?? campType?.coverImageUrl ?? '/assets/team_token/lion.png',
      primaryAction:
        statusModel.status === 'upcoming'
          ? {
              label: 'Запиши се',
              href: '#camp-registration',
            }
          : undefined,
    };
  }, [campQuery.data, campTypesQuery.data]);

  const participatingTeams = useMemo(() => {
    const teams = campTeamsQuery.data ?? [];
    const activeTeams = teams.filter((team) => team.isActive);

    return (activeTeams.length > 0 ? activeTeams : teams).slice().sort((a, b) => a.name.localeCompare(b.name, 'bg'));
  }, [campTeamsQuery.data]);

  const normalizedPlayersQuery = playersQuery.trim().toLowerCase();
  const campPlayers = useMemo(() => {
    const participations = campParticipationsQuery.data ?? [];
    const players = playersQueryResult.data ?? [];

    if (participations.length === 0 || players.length === 0) {
      return [];
    }

    const playerIds = new Set(participations.map((item) => item.playerId));

    const filteredPlayers = players
      .filter((player) => playerIds.has(player.id))
      .filter((player) => {
        if (!normalizedPlayersQuery) {
          return true;
        }

        const firstName = player.firstName.toLowerCase();
        const lastName = player.lastName?.toLowerCase() ?? '';
        const nickname = player.nickname?.toLowerCase() ?? '';

        return (
          firstName.includes(normalizedPlayersQuery) ||
          lastName.includes(normalizedPlayersQuery) ||
          nickname.includes(normalizedPlayersQuery)
        );
      });

    return filteredPlayers
      .map((player) => {
        const displayName = getPlayerDisplayName(player.firstName, player.lastName, player.nickname);
        const fullName = getPlayerFullName(player.firstName, player.lastName);

        return {
          id: player.id,
          displayName,
          secondaryText: fullName && fullName !== displayName ? fullName : undefined,
          avatarUrl: player.avatarUrl ?? undefined,
          avatarFallback: displayName.slice(0, 2).toUpperCase(),
        };
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'bg'));
  }, [campParticipationsQuery.data, normalizedPlayersQuery, playersQueryResult.data]);

  const activeRankingItems = useMemo(() => {
    if (rankingTab === 'kills') {
      return killsRankingQuery.data ?? [];
    }

    if (rankingTab === 'survivals') {
      return survivalsRankingQuery.data ?? [];
    }

    return pointsRankingQuery.data ?? [];
  }, [killsRankingQuery.data, pointsRankingQuery.data, rankingTab, survivalsRankingQuery.data]);

  const teamAssignmentQueries = useQueries({
    queries: activeRankingItems.map((item) => ({
      queryKey: ['team-assignments', 'current', item.participationId],
      queryFn: () => getCurrentTeamAssignmentByParticipation(item.participationId),
      enabled: activeRankingFilter !== TOP_PLAYERS_FILTER_ID,
    })),
  });

  const teamByParticipationId = useMemo(() => {
    const map = new Map<string, string | null>();

    activeRankingItems.forEach((item, index) => {
      map.set(item.participationId, teamAssignmentQueries[index]?.data?.teamId ?? null);
    });

    return map;
  }, [activeRankingItems, teamAssignmentQueries]);

  const filteredRankingItems = useMemo(() => {
    if (activeRankingFilter === TOP_PLAYERS_FILTER_ID) {
      return activeRankingItems;
    }

    return activeRankingItems.filter((item) => teamByParticipationId.get(item.participationId) === activeRankingFilter);
  }, [activeRankingFilter, activeRankingItems, teamByParticipationId]);

  const rankingListItems = useMemo(() => {
    return filteredRankingItems.map((item) => {
      const displayName = getPlayerDisplayName(item.firstName, item.lastName, item.nickname);

      return {
        id: item.participationId,
        displayName,
        scoreLabel: getRankingValueLabel(rankingTab, item),
        avatarUrl: item.avatarUrl ?? undefined,
        avatarFallback: displayName.slice(0, 2).toUpperCase(),
      };
    });
  }, [filteredRankingItems, rankingTab]);

  const isRankingLoading = pointsRankingQuery.isLoading || killsRankingQuery.isLoading || survivalsRankingQuery.isLoading;

  const filteredCampPhotos = useMemo(() => {
    const photos = campPhotosQuery.data ?? [];

    if (activePhotoFilter === ALL_PHOTOS_FILTER_ID) {
      return photos;
    }

    return photos.filter((photo) => photo.teamId === activePhotoFilter);
  }, [activePhotoFilter, campPhotosQuery.data]);

  const visibleCampPhotos = useMemo(() => {
    return filteredCampPhotos.slice(0, visiblePhotoCount).map((photo) => ({
      id: photo.id,
      imageUrl: resolveBackendAssetUrl(photo.imageUrl),
      alt: 'Снимка от лагер',
    }));
  }, [filteredCampPhotos, visiblePhotoCount]);

  const canLoadMorePhotos = visiblePhotoCount < filteredCampPhotos.length;

  return (
    <div className="space-y-8 sm:space-y-10">
      <PublicHero
        status={heroViewModel.status}
        statusLabel={heroViewModel.statusLabel}
        statusPlacement="top-left"
        title={heroViewModel.title}
        location={heroViewModel.location}
        dateLabel={heroViewModel.dateLabel}
        backgroundImageUrl={heroViewModel.backgroundImageUrl}
        primaryAction={heroViewModel.primaryAction}
      />

      <section id="camp-teams" className={CAMP_SECTION_CLASS}>
        {/* <SectionTitle title="Отбори" /> */}
        <DarkSectionBlock>
          <SectionTitle title="Отбори" className='mb-5' />
          <div className={TOKEN_ROW_CLASS}>
            {participatingTeams.map((team) => (
              <CircularTokenCard
                key={team.id}
                label={team.name}
                imageUrl={team.logoUrl ?? undefined}
                onClick={() => navigate(`/teams/${team.id}${campId ? `?campId=${campId}` : ''}`)}
                size="lg"
              />
            ))}
          </div>

          {participatingTeams.length === 0 ? (
            <p className="public-text-muted mt-5 text-center text-sm">Няма отбори за този лагер.</p>
          ) : null}
        </DarkSectionBlock>
      </section>

      

      <section id="camp-rankings" className={CAMP_SECTION_CLASS}>
        {/* <SectionTitle title="Класиране" /> */}
        <DarkSectionBlock>
          <SectionTitle title="Класиране" />
          <div className="space-y-4 mt-6">
            <div className={TOKEN_ROW_CLASS}>
              <div className="w-[7.8rem]">
                <CircularTokenCard
                  label="Топ играчи"
                  tokenText="TOP"
                  isActive={activeRankingFilter === TOP_PLAYERS_FILTER_ID}
                  onClick={() => setActiveRankingFilter(TOP_PLAYERS_FILTER_ID)}
                  size="lg"
                />
                <p className="public-text-muted mt-2 text-center text-xs uppercase tracking-[0.08em]">Общо</p>
              </div>

              {participatingTeams.map((team) => (
                <div key={team.id} className="w-[7.8rem]">
                  <CircularTokenCard
                    label={team.name}
                    imageUrl={team.logoUrl ?? undefined}
                    isActive={activeRankingFilter === team.id}
                    onClick={() => setActiveRankingFilter(team.id)}
                    size="lg"
                  />
                  <p className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.08em] text-[var(--public-text)]">
                    {team.teamPoints} т.
                  </p>
                </div>
              ))}
            </div>

            <RankingTabs activeTab={rankingTab} onChange={setRankingTab} />

            <RankingList
              items={rankingListItems}
              limit={activeRankingFilter === TOP_PLAYERS_FILTER_ID ? 10 : undefined}
              emptyText={
                isRankingLoading
                  ? 'Зареждане на класиране...'
                  : activeRankingFilter === TOP_PLAYERS_FILTER_ID
                    ? 'Няма класиране за този лагер.'
                    : 'Няма класиране за избрания отбор.'
              }
            />
          </div>
        </DarkSectionBlock>
      </section>
<section id="camp-players" className={CAMP_SECTION_CLASS}>
        {/* <SectionTitle title="Играчи" /> */}
        <DarkSectionBlock>
          <SectionTitle title="Играчи" className='mb-5' />
          <ExpandablePlayersSection
            mode="plain"
            items={campPlayers}
            searchValue={playersQuery}
            onSearchChange={setPlayersQuery}
            searchPlaceholder="Име или никнейм"
            initialVisibleCount={20}
            loadMoreStep={20}
            onItemClick={(item) => navigate(`/players/${item.id}`)}
            emptyText={
              campParticipationsQuery.isLoading || playersQueryResult.isLoading
                ? 'Зареждане на играчи...'
                : 'Няма играчи в този лагер.'
            }
          />
        </DarkSectionBlock>
      </section>

      <section id="camp-photos" className={CAMP_SECTION_CLASS}>
        {/* <SectionTitle title="Снимки" /> */}
        <DarkSectionBlock>
          <SectionTitle title="Снимки" />
          <div className="space-y-4 mt-6">
            <div className={TOKEN_ROW_CLASS}>
              <CircularTokenCard
                label="Всички"
                tokenText="ALL"
                isActive={activePhotoFilter === ALL_PHOTOS_FILTER_ID}
                onClick={() => {
                  setActivePhotoFilter(ALL_PHOTOS_FILTER_ID);
                  setVisiblePhotoCount(20);
                }}
                size="lg"
              />

              {participatingTeams.map((team) => (
                <CircularTokenCard
                  key={team.id}
                  label={team.name}
                  imageUrl={team.logoUrl ?? undefined}
                  isActive={activePhotoFilter === team.id}
                  onClick={() => {
                    setActivePhotoFilter(team.id);
                    setVisiblePhotoCount(20);
                  }}
                  size="lg"
                />
              ))}
            </div>

            <PhotoGalleryGrid
              className="!rounded-none !border-0 !bg-transparent !p-0"
              items={visibleCampPhotos}
              emptyText={campPhotosQuery.isLoading ? 'Зареждане на снимки...' : 'Няма снимки за избрания филтър.'}
            />

            {canLoadMorePhotos ? (
              <div className="flex justify-center">
                <LoadMoreButton onClick={() => setVisiblePhotoCount((count) => count + 20)} />
              </div>
            ) : null}
          </div>
        </DarkSectionBlock>
      </section>
    </div>
  );
}
