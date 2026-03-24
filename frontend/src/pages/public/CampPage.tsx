import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CircularTokenCard,
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
import { usePhotosQuery } from '../../features/photos/use-photos-query';
import {
  useCampKillsRankingQuery,
  useCampPointsRankingQuery,
  useCampSurvivalsRankingQuery,
} from '../../features/rankings/use-rankings-query';
import { usePublicCampsQuery } from '../../features/camps/use-camps-query';
import { getPhotosByCamp } from '../../api/photos.api';
import { resolveBackendAssetUrl } from '../../lib/asset-url';

const TOP_PLAYERS_FILTER_ID = '__top-players__';
const ALL_PHOTOS_FILTER_ID = '__all-photos__';
const CAMP_SECTION_CLASS = 'scroll-mt-24 space-y-4';
const TOKEN_ROW_CLASS = 'flex flex-wrap items-start justify-center gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-7';
const FILTER_TOKEN_SLOT_CLASS = 'w-[7.8rem]';
const REGISTRATION_CONTACT_HREF = 'https://alfasport.bg/contact/';

function isUpcomingCamp(camp: { status: 'DRAFT' | 'ACTIVE' | 'FINISHED'; startDate: string }): boolean {
  return camp.status === 'DRAFT';
}

function getCampHeroStatus(
  camp: { status: 'DRAFT' | 'ACTIVE' | 'FINISHED'; startDate: string },
): { status: 'active' | 'upcoming' | 'finished'; statusLabel: string } {
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
  const campDetailsQuery = useCampPublicDetailsQuery(campId);
  const campTeamsQuery = useCampPublicTeamsQuery(campId);
  const campParticipantsQuery = useCampPublicParticipantsQuery(campId);
  const campPhotosQuery = usePhotosQuery('camp', campId);
  const pointsRankingQuery = useCampPointsRankingQuery(campId, undefined, rankingTab === 'points');
  const killsRankingQuery = useCampKillsRankingQuery(campId, undefined, rankingTab === 'kills');
  const survivalsRankingQuery = useCampSurvivalsRankingQuery(campId, undefined, rankingTab === 'survivals');
  const publicCampsQuery = usePublicCampsQuery();
  const isUpcomingCampPage = campDetailsQuery.data?.status === 'DRAFT';

  const heroViewModel = useMemo(() => {
    const camp = campDetailsQuery.data;

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
    return {
      status: statusModel.status,
      statusLabel: statusModel.statusLabel,
      title: camp.title,
      location: camp.location ?? 'България',
      dateLabel: getCampDateRange(camp.startDate, camp.endDate),
      backgroundImageUrl: camp.coverImageUrl ?? camp.campType.campTypeCoverImageUrl ?? '/assets/team_token/lion.png',
      primaryAction:
        statusModel.status === 'upcoming'
          ? {
              label: 'Запиши се',
              href: REGISTRATION_CONTACT_HREF,
            }
          : undefined,
    };
  }, [campDetailsQuery.data]);

  const upcomingHighlights = useMemo(
    () => [
      {
        title: 'Отборен дух',
        description: 'Работа в екип, доверие и подкрепа в реални игрови ситуации.',
      },
      {
        title: 'Предизвикателства',
        description: 'Динамични мисии, които развиват бърза реакция и стратегическо мислене.',
      },
      {
        title: 'Развитие и дисциплина',
        description: 'Ясни правила, лична отговорност и постоянен напредък стъпка по стъпка.',
      },
    ],
    [],
  );

  const previousSameTypeCampIds = useMemo(() => {
    const currentCamp = campDetailsQuery.data;

    if (!currentCamp) {
      return [];
    }

    const currentStartTimestamp = new Date(currentCamp.startDate).getTime();

    return (publicCampsQuery.data ?? [])
      .filter((camp) => camp.id !== currentCamp.campId)
      .filter((camp) => camp.campTypeId === currentCamp.campType.campTypeId)
      .filter((camp) => camp.status !== 'DRAFT')
      .filter((camp) => {
        const candidateEndTimestamp = new Date(camp.endDate).getTime();
        if (Number.isNaN(currentStartTimestamp) || Number.isNaN(candidateEndTimestamp)) {
          return true;
        }

        return candidateEndTimestamp <= currentStartTimestamp;
      })
      .sort((a, b) => {
        const aTimestamp = new Date(a.endDate).getTime();
        const bTimestamp = new Date(b.endDate).getTime();
        return bTimestamp - aTimestamp;
      })
      .slice(0, 3)
      .map((camp) => camp.id);
  }, [campDetailsQuery.data, publicCampsQuery.data]);

  const previousCampPhotosQueries = useQueries({
    queries: previousSameTypeCampIds.map((previousCampId) => ({
      queryKey: ['photos', 'camp', previousCampId],
      queryFn: () => getPhotosByCamp(previousCampId),
      enabled: isUpcomingCampPage,
    })),
  });

  const previousCampPhotoPreview = useMemo(() => {
    const uniquePhotoById = new Map<string, { id: string; imageUrl: string; createdAt: string }>();

    previousCampPhotosQueries.forEach((query) => {
      (query.data ?? []).forEach((photo) => {
        if (uniquePhotoById.has(photo.id)) {
          return;
        }

        uniquePhotoById.set(photo.id, {
          id: photo.id,
          imageUrl: resolveBackendAssetUrl(photo.imageUrl),
          createdAt: photo.createdAt,
        });
      });
    });

    return Array.from(uniquePhotoById.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
      .map((photo) => ({
        id: photo.id,
        imageUrl: photo.imageUrl,
        alt: 'Снимка от предишен лагер',
      }));
  }, [previousCampPhotosQueries]);

  const isPreviousPhotosLoading = previousCampPhotosQueries.some((query) => query.isLoading);

  const participatingTeams = useMemo(() => {
    const teams = (campTeamsQuery.data ?? []).map((team) => ({
      id: team.teamId,
      name: team.name,
      logoUrl: team.logoUrl,
      teamPoints: team.teamPoints,
      isActive: team.isActive,
    }));

    const activeTeams = teams.filter((team) => team.isActive);
    return (activeTeams.length > 0 ? activeTeams : teams).slice().sort((a, b) => a.name.localeCompare(b.name, 'bg'));
  }, [campTeamsQuery.data]);

  const normalizedPlayersQuery = playersQuery.trim().toLowerCase();
  const campPlayers = useMemo(() => {
    const participants = campParticipantsQuery.data ?? [];

    if (participants.length === 0) {
      return [];
    }

    const filteredPlayers = participants.filter((player) => {
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
          id: player.playerId,
          displayName,
          secondaryText: fullName && fullName !== displayName ? fullName : undefined,
          avatarUrl: player.avatarUrl ?? undefined,
          avatarFallback: displayName.slice(0, 2).toUpperCase(),
        };
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'bg'));
  }, [campParticipantsQuery.data, normalizedPlayersQuery]);

  const activeRankingItems = useMemo(() => {
    if (rankingTab === 'kills') {
      return killsRankingQuery.data ?? [];
    }

    if (rankingTab === 'survivals') {
      return survivalsRankingQuery.data ?? [];
    }

    return pointsRankingQuery.data ?? [];
  }, [killsRankingQuery.data, pointsRankingQuery.data, rankingTab, survivalsRankingQuery.data]);

  const teamByParticipationId = useMemo(() => {
    const map = new Map<string, string | null>();

    (campParticipantsQuery.data ?? []).forEach((participant) => {
      map.set(participant.participationId, participant.currentTeam?.teamId ?? null);
    });

    return map;
  }, [campParticipantsQuery.data]);

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
        playerId: item.playerId,
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

  if (isUpcomingCampPage) {
    return (
      <div className="space-y-8 sm:space-y-10">
        <PublicBackButton fallbackTo="/public" className="mb-2" />

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

        <section id="camp-registration" className={CAMP_SECTION_CLASS}>
          <DarkSectionBlock>
            <SectionTitle title="Информация за лагера" className="mb-4" />

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[color-mix(in_srgb,var(--public-border)_24%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--public-bg-900)_72%,#000_28%)_0%,color-mix(in_srgb,var(--public-bg-950)_86%,#000_14%)_100%)] p-3.5">
                  <p className="public-text-muted text-xs font-semibold uppercase tracking-[0.1em]">Период</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--public-text)]">{heroViewModel.dateLabel}</p>
                </div>

                <div className="rounded-xl border border-[color-mix(in_srgb,var(--public-border)_24%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--public-bg-900)_72%,#000_28%)_0%,color-mix(in_srgb,var(--public-bg-950)_86%,#000_14%)_100%)] p-3.5">
                  <p className="public-text-muted text-xs font-semibold uppercase tracking-[0.1em]">Локация</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--public-text)]">{heroViewModel.location}</p>
                </div>

                <div className="rounded-xl border border-[color-mix(in_srgb,var(--public-border)_24%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--public-bg-900)_72%,#000_28%)_0%,color-mix(in_srgb,var(--public-bg-950)_86%,#000_14%)_100%)] p-3.5">
                  <p className="public-text-muted text-xs font-semibold uppercase tracking-[0.1em]">Тип лагер</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--public-text)]">
                    {campDetailsQuery.data?.campType.campTypeName ?? 'Лагер'}
                  </p>
                </div>

                <div className="rounded-xl border border-[color-mix(in_srgb,var(--public-border)_24%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--public-bg-900)_72%,#000_28%)_0%,color-mix(in_srgb,var(--public-bg-950)_86%,#000_14%)_100%)] p-3.5">
                  <p className="public-text-muted text-xs font-semibold uppercase tracking-[0.1em]">Статус</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--public-text)]">Предстоящ</p>
                </div>
              </div>

              {campDetailsQuery.data?.description ? (
                <div className="rounded-xl border border-[color-mix(in_srgb,var(--public-border)_24%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--public-bg-900)_72%,#000_28%)_0%,color-mix(in_srgb,var(--public-bg-950)_86%,#000_14%)_100%)] p-3.5">
                  <p className="public-text-muted text-xs font-semibold uppercase tracking-[0.1em]">Описание</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--public-text)]">{campDetailsQuery.data.description}</p>
                </div>
              ) : null}

              <div className="flex justify-center pt-2">
                <a
                  href={REGISTRATION_CONTACT_HREF}
                  target="_blank"
                  rel="noreferrer"
                  className="public-primary-action inline-flex items-center justify-center px-6 py-2 text-sm font-semibold uppercase tracking-[0.08em]"
                >
                  Запиши се
                </a>
              </div>
            </div>
          </DarkSectionBlock>
        </section>

        <section id="camp-highlights" className={CAMP_SECTION_CLASS}>
          <DarkSectionBlock>
            <SectionTitle title="Защо този лагер" className="mb-4" />

            <div className="grid gap-3 sm:grid-cols-3">
              {upcomingHighlights.map((highlight) => (
                <article
                  key={highlight.title}
                  className="rounded-xl border border-[color-mix(in_srgb,var(--public-border)_22%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--public-bg-900)_70%,#000_30%)_0%,color-mix(in_srgb,var(--public-bg-950)_88%,#000_12%)_100%)] p-3.5"
                >
                  <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--public-text)]">{highlight.title}</h3>
                  <p className="public-text-muted mt-2 text-sm leading-relaxed">{highlight.description}</p>
                </article>
              ))}
            </div>
          </DarkSectionBlock>
        </section>

        <section id="camp-preview-photos" className={CAMP_SECTION_CLASS}>
          <DarkSectionBlock>
            <SectionTitle
              title="Атмосфера от предишни лагери"
              subtitle="Снимки от сходни издания на този тип лагер"
              className="mb-4"
            />

            <PhotoGalleryGrid
              className="!rounded-none !border-0 !bg-transparent !p-0"
              items={previousCampPhotoPreview}
              emptyText={
                isPreviousPhotosLoading
                  ? 'Зареждане на снимки...'
                  : 'Все още няма налични снимки от предишни лагери.'
              }
            />
          </DarkSectionBlock>
        </section>

        <section id="camp-registration-final-cta" className={CAMP_SECTION_CLASS}>
          <DarkSectionBlock>
            <div className="rounded-2xl border border-[color-mix(in_srgb,var(--public-border)_24%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--public-bg-900)_74%,#000_26%)_0%,color-mix(in_srgb,var(--public-bg-950)_90%,#000_10%)_100%)] px-4 py-5 text-center sm:px-6 sm:py-6">
              <h3 className="text-base font-semibold uppercase tracking-[0.08em] text-[var(--public-text)] sm:text-lg">Готови ли сте за следващото предизвикателство?</h3>
              <p className="public-text-muted mx-auto mt-2 max-w-2xl text-sm leading-relaxed">
                Свържете се с екипа на ALFA CAMP и запазете място за предстоящото издание.
              </p>

              <div className="mt-4 flex justify-center">
                <a
                  href={REGISTRATION_CONTACT_HREF}
                  target="_blank"
                  rel="noreferrer"
                  className="public-primary-action inline-flex items-center justify-center px-7 py-2.5 text-sm font-semibold uppercase tracking-[0.08em]"
                >
                  Запиши се
                </a>
              </div>
            </div>
          </DarkSectionBlock>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <PublicBackButton fallbackTo="/public" className="mb-2" />

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
        <DarkSectionBlock>
          <SectionTitle title="Отбори" className="mb-4" />
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
        <DarkSectionBlock>
          <SectionTitle title="Класиране" className="mb-4" />
          <div className="space-y-4">
            <div className={TOKEN_ROW_CLASS}>
              <div className={FILTER_TOKEN_SLOT_CLASS}>
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
                <div key={team.id} className={FILTER_TOKEN_SLOT_CLASS}>
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
              onItemClick={(item) => {
                if (!item.playerId) {
                  return;
                }

                navigate(`/players/${item.playerId}${campId ? `?campId=${campId}` : ''}`);
              }}
              emptyText={
                isRankingLoading
                  ? 'Зареждане на резултати...'
                  : 'Няма резултати'
              }
            />
          </div>
        </DarkSectionBlock>
      </section>

      <section id="camp-players" className={CAMP_SECTION_CLASS}>
        <DarkSectionBlock>
          <SectionTitle title="Играчи" className="mb-4" />
          <ExpandablePlayersSection
            key={normalizedPlayersQuery || 'all'}
            mode="plain"
            items={campPlayers}
            searchValue={playersQuery}
            onSearchChange={setPlayersQuery}
            searchPlaceholder="Име или никнейм"
            initialVisibleCount={20}
            loadMoreStep={20}
            onItemClick={(item) => navigate(`/players/${item.id}`)}
            emptyText={
              campParticipantsQuery.isLoading
                ? 'Зареждане на играчи...'
                : 'Няма играчи'
            }
          />
        </DarkSectionBlock>
      </section>

      <section id="camp-photos" className={CAMP_SECTION_CLASS}>
        <DarkSectionBlock>
          <SectionTitle title="Снимки" className="mb-4" />
          <div className="space-y-4">
            <div className={TOKEN_ROW_CLASS}>
              <div className={FILTER_TOKEN_SLOT_CLASS}>
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
              </div>

              {participatingTeams.map((team) => (
                <div key={team.id} className={FILTER_TOKEN_SLOT_CLASS}>
                  <CircularTokenCard
                    label={team.name}
                    imageUrl={team.logoUrl ?? undefined}
                    isActive={activePhotoFilter === team.id}
                    onClick={() => {
                      setActivePhotoFilter(team.id);
                      setVisiblePhotoCount(20);
                    }}
                    size="lg"
                  />
                </div>
              ))}
            </div>

            <PhotoGalleryGrid
              className="!rounded-none !border-0 !bg-transparent !p-0"
              items={visibleCampPhotos}
              emptyText={campPhotosQuery.isLoading ? 'Зареждане на снимки...' : 'Няма снимки'}
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
