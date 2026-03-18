import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Camp, CampStatus } from '../../api/camps.api';
import type { PlayerRankingItem } from '../../api/rankings.api';
import {
  CampBannerCard,
  CampStatusTabs,
  type CampStatusTabKey,
  CircularTokenCard,
  ExpandablePlayersSection,
  PlayerSearchBar,
  PublicHero,
  RankingList,
  RankingTabs,
  SectionTitle,
} from '../../components/public';
import { useCampTypesQuery } from '../../features/camp-types/use-camp-types-query';
import { useCampsQuery } from '../../features/camps/use-camps-query';
import { usePlayersQuery } from '../../features/players/use-players-query';
import {
  useCampKillsRankingQuery,
  useCampPointsRankingQuery,
  useCampSurvivalsRankingQuery,
} from '../../features/rankings/use-rankings-query';

const MAIN_SECTION_SHELL_CLASS =
  'rounded-2xl border border-[color-mix(in_srgb,var(--public-border)_16%,transparent)] bg-[#333333] px-3 py-5 sm:px-5 sm:py-6';

type HeroCampViewModel = {
  camp: Camp;
  status: 'active' | 'upcoming' | 'finished';
  statusLabel: string;
};

function getStartOfTodayTimestamp(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

function toTimestamp(value: string): number {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getCampDateRange(startDate: string, endDate: string): string {
  const formatter = new Intl.DateTimeFormat('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`;
}

function isUpcomingCamp(camp: Camp, startOfToday: number): boolean {
  if (camp.status === 'ACTIVE' || camp.status === 'FINISHED') {
    return false;
  }

  return toTimestamp(camp.startDate) >= startOfToday;
}

function selectHeroCamp(camps: Camp[]): HeroCampViewModel | null {
  if (camps.length === 0) {
    return null;
  }

  const startOfToday = getStartOfTodayTimestamp();

  const activeCamp = [...camps]
    .filter((camp) => camp.status === 'ACTIVE')
    .sort((a, b) => toTimestamp(b.startDate) - toTimestamp(a.startDate))[0];

  if (activeCamp) {
    return {
      camp: activeCamp,
      status: 'active',
      statusLabel: 'Активен',
    };
  }

  const upcomingCamp = [...camps]
    .filter((camp) => isUpcomingCamp(camp, startOfToday))
    .sort((a, b) => toTimestamp(a.startDate) - toTimestamp(b.startDate))[0];

  if (upcomingCamp) {
    return {
      camp: upcomingCamp,
      status: 'upcoming',
      statusLabel: 'Предстоящ',
    };
  }

  const finishedCamp = [...camps]
    .filter((camp) => camp.status === 'FINISHED')
    .sort((a, b) => toTimestamp(b.endDate) - toTimestamp(a.endDate))[0];

  if (finishedCamp) {
    return {
      camp: finishedCamp,
      status: 'finished',
      statusLabel: 'Изминал',
    };
  }

  const latestCamp = [...camps].sort((a, b) => toTimestamp(b.endDate) - toTimestamp(a.endDate))[0];

  return {
    camp: latestCamp,
    status: 'finished',
    statusLabel: 'Изминал',
  };
}

function getHeroFallback(status: CampStatus | undefined): {
  title: string;
  location: string;
  dateLabel: string;
  backgroundImageUrl: string;
} {
  if (status === 'ACTIVE') {
    return {
      title: 'ALFA CAMP',
      location: 'България',
      dateLabel: 'Активен лагер',
      backgroundImageUrl: '/assets/team_token/dragon.png',
    };
  }

  return {
    title: 'ALFA CAMP',
    location: 'България',
    dateLabel: 'Лагери и класиране',
    backgroundImageUrl: '/assets/team_token/lion.png',
  };
}

function getCampTypeFallbackToken(index: number): string {
  const fallbackTokens = [
    '/assets/team_token/dragon.png',
    '/assets/team_token/lion.png',
    '/assets/team_token/griffon.png',
    '/assets/team_token/bull.png',
  ];

  return fallbackTokens[index % fallbackTokens.length];
}

function getCampLabel(camp: Camp): string {
  return `${camp.title} ${camp.year}`;
}

function getDefaultCampStatusTab(hasActive: boolean, hasUpcoming: boolean): CampStatusTabKey {
  if (hasActive) {
    return 'active';
  }

  if (hasUpcoming) {
    return 'upcoming';
  }

  return 'finished';
}

function getPlayerDisplayName(item: PlayerRankingItem): string {
  const fullName = [item.firstName, item.lastName].filter(Boolean).join(' ').trim();
  return item.nickname?.trim() || fullName || item.firstName;
}

function getRankingValue(item: PlayerRankingItem, tab: 'points' | 'kills' | 'survivals'): number {
  if (tab === 'kills') {
    return item.kills;
  }

  if (tab === 'survivals') {
    return item.survivals;
  }

  return item.points;
}

export function MainPage() {
  const navigate = useNavigate();
  const [activeTypeId, setActiveTypeId] = useState('');
  const [activeCampStatusTab, setActiveCampStatusTab] = useState<CampStatusTabKey>('finished');
  const [playersQuery, setPlayersQuery] = useState('');
  const [rankingTab, setRankingTab] = useState<'points' | 'kills' | 'survivals'>('points');

  const campsQuery = useCampsQuery();
  const campTypesQuery = useCampTypesQuery();
  const playersListQuery = usePlayersQuery();

  const heroCamp = selectHeroCamp(campsQuery.data ?? []);
  const campTypeById = new Map((campTypesQuery.data ?? []).map((campType) => [campType.id, campType] as const));
  const heroCampType = heroCamp ? campTypeById.get(heroCamp.camp.campTypeId) : undefined;
  const heroFallback = getHeroFallback(heroCamp?.camp.status);

  const heroBackgroundImageUrl =
    heroCamp?.camp.coverImageUrl ?? heroCampType?.coverImageUrl ?? heroFallback.backgroundImageUrl;

  const heroPrimaryAction = heroCamp
    ? heroCamp.status === 'upcoming'
      ? { label: 'Запиши се', href: `/camps/${heroCamp.camp.id}` }
      : { label: 'Класиране', href: `/camps/${heroCamp.camp.id}` }
    : { label: 'Класиране', href: '#global-rankings' };

  const rankingCampId = heroCamp?.camp.id;
  const pointsRankingQuery = useCampPointsRankingQuery(rankingCampId, 30, rankingTab === 'points');
  const killsRankingQuery = useCampKillsRankingQuery(rankingCampId, 30, rankingTab === 'kills');
  const survivalsRankingQuery = useCampSurvivalsRankingQuery(rankingCampId, 30, rankingTab === 'survivals');

  const activeRankingItemsRaw =
    rankingTab === 'points'
      ? pointsRankingQuery.data ?? []
      : rankingTab === 'kills'
        ? killsRankingQuery.data ?? []
        : survivalsRankingQuery.data ?? [];

  const activeRankingItems = useMemo(() => {
    return activeRankingItemsRaw.map((item) => {
      const displayName = getPlayerDisplayName(item);

      return {
        id: item.participationId,
        displayName,
        scoreLabel: String(getRankingValue(item, rankingTab)),
        avatarUrl: item.avatarUrl ?? undefined,
        avatarFallback: displayName.slice(0, 2).toUpperCase(),
      };
    });
  }, [activeRankingItemsRaw, rankingTab]);

  const campTypeFilterItems = useMemo(() => {
    return (campTypesQuery.data ?? []).map((campType, index) => ({
      id: campType.id,
      label: campType.name,
      imageUrl: campType.coverImageUrl ?? campType.logoUrl ?? getCampTypeFallbackToken(index),
    }));
  }, [campTypesQuery.data]);

  useEffect(() => {
    if (!activeTypeId && campTypeFilterItems.length > 0) {
      setActiveTypeId(campTypeFilterItems[0].id);
    }
  }, [activeTypeId, campTypeFilterItems]);

  const selectedCampTypeCamps = useMemo(() => {
    if (!activeTypeId) {
      return [];
    }

    return (campsQuery.data ?? [])
      .filter((camp) => camp.campTypeId === activeTypeId)
      .sort((a, b) => {
        if (b.year !== a.year) {
          return b.year - a.year;
        }

        return toTimestamp(b.startDate) - toTimestamp(a.startDate);
      });
  }, [activeTypeId, campsQuery.data]);

  const campStatusBuckets = useMemo(() => {
    const camps = campsQuery.data ?? [];
    const startOfToday = getStartOfTodayTimestamp();

    const active = camps
      .filter((camp) => camp.status === 'ACTIVE')
      .sort((a, b) => toTimestamp(b.startDate) - toTimestamp(a.startDate));

    const upcoming = camps
      .filter((camp) => isUpcomingCamp(camp, startOfToday))
      .sort((a, b) => toTimestamp(a.startDate) - toTimestamp(b.startDate));

    const finished = camps
      .filter((camp) => camp.status === 'FINISHED' || (camp.status !== 'ACTIVE' && !isUpcomingCamp(camp, startOfToday)))
      .sort((a, b) => toTimestamp(b.endDate) - toTimestamp(a.endDate));

    return {
      active,
      upcoming,
      finished,
    };
  }, [campsQuery.data]);

  const campStatusCounts = {
    active: campStatusBuckets.active.length,
    upcoming: campStatusBuckets.upcoming.length,
    finished: campStatusBuckets.finished.length,
  };

  useEffect(() => {
    const defaultTab = getDefaultCampStatusTab(campStatusCounts.active > 0, campStatusCounts.upcoming > 0);

    if (campStatusCounts[activeCampStatusTab] === 0) {
      setActiveCampStatusTab(defaultTab);
    }
  }, [activeCampStatusTab, campStatusCounts]);

  const activeTabCamps = campStatusBuckets[activeCampStatusTab];

  const normalizedPlayersQuery = playersQuery.trim().toLowerCase();
  const mainPlayers = useMemo(() => {
    const rawPlayers = playersListQuery.data ?? [];

    const filteredPlayers = !normalizedPlayersQuery
      ? rawPlayers
      : rawPlayers.filter((player) => {
          const firstName = player.firstName.toLowerCase();
          const lastName = player.lastName?.toLowerCase() ?? '';
          const nickname = player.nickname?.toLowerCase() ?? '';
          return (
            firstName.includes(normalizedPlayersQuery) ||
            lastName.includes(normalizedPlayersQuery) ||
            nickname.includes(normalizedPlayersQuery)
          );
        });

    return filteredPlayers.map((player) => {
      const fullName = [player.firstName, player.lastName].filter(Boolean).join(' ').trim();
      const displayName = player.nickname?.trim() || fullName || player.firstName;
      const secondaryText = player.nickname?.trim() ? fullName : undefined;

      return {
        id: player.id,
        displayName,
        secondaryText,
        avatarUrl: player.avatarUrl ?? undefined,
        avatarFallback: displayName.slice(0, 2).toUpperCase(),
      };
    });
  }, [normalizedPlayersQuery, playersListQuery.data]);

  return (
    <div className="space-y-6 pb-3 sm:space-y-8 sm:pb-4">
      <PublicHero
        status={heroCamp?.status ?? 'finished'}
        statusLabel={heroCamp?.statusLabel ?? 'Изминал'}
        statusPlacement="top-left"
        title={heroCamp?.camp.title ?? heroFallback.title}
        location={heroCamp?.camp.location ?? heroFallback.location}
        dateLabel={heroCamp ? getCampDateRange(heroCamp.camp.startDate, heroCamp.camp.endDate) : heroFallback.dateLabel}
        backgroundImageUrl={heroBackgroundImageUrl}
        primaryAction={heroPrimaryAction}
      />

      <section className="scroll-mt-24 space-y-4">
        <div className={MAIN_SECTION_SHELL_CLASS}>
          <SectionTitle title="Видове лагери" />

          {campTypeFilterItems.length > 0 ? (
            <div className="mt-5 pb-1">
              <div className="flex w-full flex-wrap items-start justify-center gap-2">
                {campTypeFilterItems.map((campTypeItem) => {
                  const isSelected = campTypeItem.id === activeTypeId;
                  const relatedCamps = isSelected ? selectedCampTypeCamps : [];

                  return (
                    <div key={campTypeItem.id} className="mt-5 flex w-[9.6rem] max-w-full flex-col items-center text-center">
                      <CircularTokenCard
                        label={campTypeItem.label}
                        imageUrl={campTypeItem.imageUrl}
                        isActive={isSelected}
                        onClick={() => setActiveTypeId(campTypeItem.id)}
                        size="lg"
                      />

                      {isSelected ? (
                        <div className="mt-4 flex w-full flex-col items-stretch gap-2">
                          <Link
                            to={`/camp-types/${campTypeItem.id}`}
                            className="rounded-md border border-[color-mix(in_srgb,var(--public-border)_34%,transparent)] bg-[color-mix(in_srgb,var(--public-bg-850)_84%,#000_16%)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--public-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--public-bg-850)_68%,#fff_32%)]"
                          >
                            {'Информация'}
                          </Link>

                          {relatedCamps.map((camp) => (
                            <Link
                              key={camp.id}
                              to={`/camps/${camp.id}`}
                              className="rounded-md border border-[color-mix(in_srgb,var(--public-border)_28%,transparent)] bg-[color-mix(in_srgb,var(--public-bg-900)_84%,#000_16%)] px-3 py-2 text-xs font-medium uppercase tracking-[0.08em] text-[var(--public-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--public-bg-850)_70%,#fff_30%)]"
                            >
                              {getCampLabel(camp)}
                            </Link>
                          ))}

                          {relatedCamps.length === 0 ? (
                            <span className="public-text-muted rounded-md border border-[color-mix(in_srgb,var(--public-border)_22%,transparent)] px-3 py-2 text-xs uppercase tracking-[0.08em]">
                              {'Няма лагери'}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="public-text-muted mt-5 text-center text-sm">
              {'Няма налични типове лагери.'}
            </p>
          )}
        </div>
      </section>

      <section className="scroll-mt-24 space-y-4">
        <div className={MAIN_SECTION_SHELL_CLASS}>
          <div className="space-y-4">
            <CampStatusTabs activeTab={activeCampStatusTab} onChange={setActiveCampStatusTab} />

            <div className="space-y-3">
              {activeTabCamps.map((camp) => {
                const campType = campTypeById.get(camp.campTypeId);
                const backgroundImageUrl =
                  camp.coverImageUrl ?? campType?.coverImageUrl ?? getCampTypeFallbackToken(camp.year);

                return (
                  <CampBannerCard
                    key={camp.id}
                    to={`/camps/${camp.id}`}
                    title={camp.title}
                    location={camp.location}
                    dateLabel={getCampDateRange(camp.startDate, camp.endDate)}
                    backgroundImageUrl={backgroundImageUrl}
                  />
                );
              })}

              {activeTabCamps.length === 0 ? (
                <p className="public-text-muted rounded-lg border border-[color-mix(in_srgb,var(--public-border)_16%,transparent)] px-3 py-4 text-center text-sm uppercase tracking-[0.08em]">
                  {'Няма намерени лагери'}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section id="global-rankings" className="scroll-mt-24 space-y-4">
        <div className={MAIN_SECTION_SHELL_CLASS}>
          <SectionTitle
            title="Резултати"
            subtitle="Глобално класиране"
          />
          <div className="mt-6 space-y-3">
            <RankingTabs activeTab={rankingTab} onChange={setRankingTab} />
            <RankingList
              items={activeRankingItems}
              emptyText={
                pointsRankingQuery.isLoading || killsRankingQuery.isLoading || survivalsRankingQuery.isLoading
                  ? 'Зареждане на резултати...'
                  : 'Няма класиране.'
              }
            />
          </div>
        </div>
      </section>

      <section className="scroll-mt-24 space-y-4">
        <div className={MAIN_SECTION_SHELL_CLASS}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex w-fit rounded-lg border border-[color-mix(in_srgb,var(--public-primary)_88%,#fff_12%)] bg-[var(--public-primary)] px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--public-text)]">
              {'Играчи'}
            </div>
            <div className="w-full sm:max-w-xs">
              <PlayerSearchBar value={playersQuery} onChange={setPlayersQuery} placeholder="Име или никнейм" />
            </div>
          </div>

          <ExpandablePlayersSection
            mode="plain"
            className="mt-4"
            items={mainPlayers}
            initialVisibleCount={10}
            loadMoreStep={10}
            onItemClick={(item) => navigate(`/players/${item.id}`)}
            emptyText={
              playersListQuery.isLoading
                ? 'Зареждане на играчи...'
                : 'Няма намерени играчи.'
            }
          />
        </div>
      </section>
    </div>
  );
}
