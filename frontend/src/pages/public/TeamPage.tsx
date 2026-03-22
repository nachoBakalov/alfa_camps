import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  DarkSectionBlock,
  ExpandablePlayersSection,
  LoadMoreButton,
  PhotoGalleryGrid,
  PublicBackButton,
  PublicHero,
  RankingList,
  RankingTabs,
  type RankingTabKey,
  SectionTitle,
} from '../../components/public';
import {
  useCampPublicDetailsQuery,
  useCampPublicParticipantsQuery,
  useCampPublicTeamsQuery,
} from '../../features/camp-public/use-camp-public-query';
import {
  useCampKillsRankingQuery,
  useCampPointsRankingQuery,
  useCampSurvivalsRankingQuery,
} from '../../features/rankings/use-rankings-query';
import { usePhotosQuery } from '../../features/photos/use-photos-query';
import { resolveBackendAssetUrl } from '../../lib/asset-url';

const TEAM_SECTION_CLASS = 'scroll-mt-24 space-y-4';

function resolveOptionalAssetUrl(url: string | null | undefined): string | undefined {
  if (!url) {
    return undefined;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  // Team token assets are served by the frontend from /public/assets.
  if (url.startsWith('/assets/') || url.startsWith('assets/')) {
    return url.startsWith('/') ? url : `/${url}`;
  }

  return resolveBackendAssetUrl(url);
}

function getCampDateLabel(startDate: string | undefined, endDate: string | undefined, year: number | undefined): string {
  if (!startDate || !endDate) {
    return year ? String(year) : 'Лагер';
  }

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

  return [firstName, lastName].filter(Boolean).join(' ').trim() || firstName;
}

function getPlayerSecondaryText(firstName: string, lastName: string | null, nickname: string | null): string | undefined {
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  if (!fullName) {
    return undefined;
  }

  const normalizedNickname = nickname?.trim();
  return normalizedNickname ? fullName : undefined;
}

export function TeamPage() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const [searchParams] = useSearchParams();
  const [playersQuery, setPlayersQuery] = useState('');
  const [rankingTab, setRankingTab] = useState<RankingTabKey>('points');
  const [visiblePhotoCount, setVisiblePhotoCount] = useState(20);
  const campId = searchParams.get('campId') ?? undefined;

  const campDetailsQuery = useCampPublicDetailsQuery(campId);
  const campTeamsQuery = useCampPublicTeamsQuery(campId);
  const campParticipantsQuery = useCampPublicParticipantsQuery(campId);
  const pointsRankingQuery = useCampPointsRankingQuery(campId, undefined, rankingTab === 'points');
  const killsRankingQuery = useCampKillsRankingQuery(campId, undefined, rankingTab === 'kills');
  const survivalsRankingQuery = useCampSurvivalsRankingQuery(campId, undefined, rankingTab === 'survivals');
  const teamPhotosQuery = usePhotosQuery('team', teamId);

  const selectedTeam = useMemo(() => {
    if (!teamId) {
      return null;
    }

    return (campTeamsQuery.data ?? []).find((team) => team.teamId === teamId) ?? null;
  }, [campTeamsQuery.data, teamId]);

  const teamPlayersCount = useMemo(() => {
    if (!teamId) {
      return 0;
    }

    return (campParticipantsQuery.data ?? []).filter((participant) => participant.currentTeam?.teamId === teamId).length;
  }, [campParticipantsQuery.data, teamId]);

  const teamPlayers = useMemo(() => {
    if (!teamId) {
      return [];
    }

    return (campParticipantsQuery.data ?? [])
      .filter((participant) => participant.currentTeam?.teamId === teamId)
      .map((participant) => {
        const displayName = getPlayerDisplayName(participant.firstName, participant.lastName, participant.nickname);

        return {
          id: participant.playerId,
          displayName,
          secondaryText: getPlayerSecondaryText(participant.firstName, participant.lastName, participant.nickname),
          avatarUrl: resolveOptionalAssetUrl(participant.avatarUrl),
          avatarFallback: displayName.slice(0, 2).toUpperCase(),
        };
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'bg'));
  }, [campParticipantsQuery.data, teamId]);

  const normalizedPlayersQuery = playersQuery.trim().toLowerCase();

  const teamIdByParticipationId = useMemo(() => {
    const map = new Map<string, string | null>();

    (campParticipantsQuery.data ?? []).forEach((participant) => {
      map.set(participant.participationId, participant.currentTeam?.teamId ?? null);
    });

    return map;
  }, [campParticipantsQuery.data]);

  const activeRankingItems = useMemo(() => {
    if (rankingTab === 'kills') {
      return killsRankingQuery.data ?? [];
    }

    if (rankingTab === 'survivals') {
      return survivalsRankingQuery.data ?? [];
    }

    return pointsRankingQuery.data ?? [];
  }, [killsRankingQuery.data, pointsRankingQuery.data, rankingTab, survivalsRankingQuery.data]);

  const teamRankingItems = useMemo(() => {
    if (!teamId) {
      return [];
    }

    return activeRankingItems
      .filter((item) => teamIdByParticipationId.get(item.participationId) === teamId)
      .map((item) => {
        const displayName = getPlayerDisplayName(item.firstName, item.lastName, item.nickname);

        return {
          id: item.participationId,
          playerId: item.playerId,
          displayName,
          scoreLabel: rankingTab === 'kills' ? String(item.kills) : rankingTab === 'survivals' ? String(item.survivals) : String(item.points),
          avatarUrl: resolveOptionalAssetUrl(item.avatarUrl),
          avatarFallback: displayName.slice(0, 2).toUpperCase(),
        };
      });
  }, [activeRankingItems, rankingTab, teamId, teamIdByParticipationId]);

  const isRankingLoading = pointsRankingQuery.isLoading || killsRankingQuery.isLoading || survivalsRankingQuery.isLoading;

  const filteredTeamPhotos = useMemo(() => {
    const photos = teamPhotosQuery.data ?? [];

    return photos.filter((photo) => {
      const matchesTeam = !teamId || photo.teamId === teamId;
      const matchesCamp = !campId || photo.campId === campId;
      return matchesTeam && matchesCamp;
    });
  }, [campId, teamId, teamPhotosQuery.data]);

  const visibleTeamPhotos = useMemo(() => {
    return filteredTeamPhotos.slice(0, visiblePhotoCount).map((photo) => ({
      id: photo.id,
      imageUrl: resolveBackendAssetUrl(photo.imageUrl),
      alt: 'Снимка на отбора',
    }));
  }, [filteredTeamPhotos, visiblePhotoCount]);

  const canLoadMorePhotos = visiblePhotoCount < filteredTeamPhotos.length;

  useEffect(() => {
    setPlayersQuery('');
    setRankingTab('points');
    setVisiblePhotoCount(20);
  }, [campId, teamId]);

  const isLoading = campDetailsQuery.isLoading || campTeamsQuery.isLoading || campParticipantsQuery.isLoading;
  const hasError = campDetailsQuery.isError || campTeamsQuery.isError || campParticipantsQuery.isError;

  const heroTitle = selectedTeam?.name ?? 'Отбор';
  const heroLocation = campDetailsQuery.data?.location ?? 'България';
  const heroDateLabel = getCampDateLabel(campDetailsQuery.data?.startDate, campDetailsQuery.data?.endDate, campDetailsQuery.data?.year);
  const heroBackground = resolveOptionalAssetUrl(selectedTeam?.logoUrl) ?? '/assets/team_token/lion.png';
  const backToCampHref = campId ? `/camps/${campId}` : '/';

  return (
    <div className="space-y-8 sm:space-y-10">
      <PublicBackButton fallbackTo={backToCampHref} className="mb-2" />

      <PublicHero
        status="active"
        title={heroTitle}
        location={heroLocation}
        dateLabel={heroDateLabel}
        backgroundImageUrl={heroBackground}
        primaryAction={campId ? { label: 'Към лагера', href: backToCampHref } : undefined}
        className="[&>div.relative>span]:hidden"
      />

      <section id="team-players" className={TEAM_SECTION_CLASS}>
        <DarkSectionBlock>
          <SectionTitle title="Играчи" className="mb-4" />
          <ExpandablePlayersSection
            key={normalizedPlayersQuery || 'all'}
            mode="plain"
            items={teamPlayers}
            initialVisibleCount={20}
            loadMoreStep={20}
            searchValue={playersQuery}
            onSearchChange={setPlayersQuery}
            searchPlaceholder="Име или никнейм"
            emptyText={isLoading ? 'Зареждане на играчи...' : 'Няма играчи'}
            onItemClick={(item) => navigate(`/players/${item.id}${campId ? `?campId=${campId}` : ''}`)}
          />
          <p className="public-text-muted mt-3 text-sm">Открити играчи в отбора: {teamPlayersCount}</p>
          {isLoading ? <p className="public-text-muted mt-2 text-sm">Зареждане на данни...</p> : null}
          {hasError ? <p className="mt-2 text-sm text-red-300">Възникна проблем при зареждането на данните за отбора.</p> : null}
        </DarkSectionBlock>
      </section>

      <section id="team-results" className={TEAM_SECTION_CLASS}>
        <DarkSectionBlock>
          <SectionTitle title="Резултати" className="mb-4" />
          <div className="space-y-4">
            <RankingTabs activeTab={rankingTab} onChange={setRankingTab} />
            <RankingList
              items={teamRankingItems}
              onItemClick={(item) => {
                if (!item.playerId) {
                  return;
                }

                navigate(`/players/${item.playerId}${campId ? `?campId=${campId}` : ''}`);
              }}
              emptyText={isRankingLoading ? 'Зареждане на резултати...' : 'Няма резултати'}
              rankLabelBuilder={(rank) => (rank <= 3 ? String(rank) : `#${rank}`)}
            />
          </div>
        </DarkSectionBlock>
      </section>

      <section id="team-photos" className={TEAM_SECTION_CLASS}>
        <DarkSectionBlock>
          <SectionTitle title="Снимки" className="mb-4" />
          <PhotoGalleryGrid
            className="!rounded-none !border-0 !bg-transparent !p-0"
            items={visibleTeamPhotos}
            emptyText={teamPhotosQuery.isLoading ? 'Зареждане на снимки...' : 'Няма снимки'}
          />

          {canLoadMorePhotos ? (
            <div className="mt-4 flex justify-center">
              <LoadMoreButton onClick={() => setVisiblePhotoCount((current) => current + 20)} />
            </div>
          ) : null}
        </DarkSectionBlock>
      </section>
    </div>
  );
}
