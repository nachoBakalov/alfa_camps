import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import { DarkSectionBlock, PublicBackButton, PublicHero, SectionTitle } from '../../components/public';
import { getCampPublicParticipants } from '../../api/camp-public.api';
import { useCampPublicDetailsQuery, useCampPublicParticipantsQuery } from '../../features/camp-public/use-camp-public-query';
import { usePublicCampTypesQuery } from '../../features/camp-types/use-camp-types-query';
import { usePublicCampsQuery } from '../../features/camps/use-camps-query';
import { usePublicPlayersQuery } from '../../features/players/use-players-query';
import { resolveBackendAssetUrl } from '../../lib/asset-url';

function resolveOptionalAssetUrl(url: string | null | undefined): string | undefined {
  if (!url) {
    return undefined;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith('/assets/') || url.startsWith('assets/')) {
    return url.startsWith('/') ? url : `/${url}`;
  }

  return resolveBackendAssetUrl(url);
}

function getPlayerDisplayName(firstName: string, lastName: string | null, nickname: string | null): string {
  const normalizedNickname = nickname?.trim();
  if (normalizedNickname) {
    return normalizedNickname;
  }

  return [firstName, lastName].filter(Boolean).join(' ').trim() || firstName;
}

function getCampDateLabel(startDate: string, endDate: string): string {
  const formatter = new Intl.DateTimeFormat('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`;
}

function toTimestamp(value: string): number {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getKillsRankImage(kills: number): string {
  const thresholds = [1, 5, 10, 15, 20, 25, 30, 35, 40];
  const value = thresholds.reduce((acc, current) => (kills >= current ? current : acc), 1);
  return `/assets/ranks/kills/${value}_kills.png`;
}

function getSurvivalsRankImage(survivals: number): string {
  const level = Math.min(Math.max(survivals, 1), 9);
  return `/assets/ranks/survive/${level}_survive.png`;
}

function getMedalImages(duelWins: number, massBattleWins: number, kills: number): string[] {
  const medals: string[] = [];

  if (duelWins > 0) {
    medals.push('/assets/ranks/medals/comando.png');
  }

  if (massBattleWins > 0) {
    medals.push('/assets/ranks/medals/lionheart.png');
  }

  if (kills >= 20) {
    medals.push('/assets/ranks/medals/ironcrest.png');
  }

  if (medals.length === 0) {
    medals.push('/assets/ranks/medals/survivor.png');
  }

  return medals.slice(0, 2);
}

export function PlayerPage() {
  const { playerId } = useParams();
  const [searchParams] = useSearchParams();
  const campId = searchParams.get('campId') ?? undefined;
  const playerFallbackBackHref = campId ? `/camps/${campId}` : '/public';

  const publicPlayersQuery = usePublicPlayersQuery();
  const publicCampsQuery = usePublicCampsQuery();
  const publicCampTypesQuery = usePublicCampTypesQuery();
  const campDetailsQuery = useCampPublicDetailsQuery(campId);
  const campParticipantsQuery = useCampPublicParticipantsQuery(campId);

  const campParticipantQueries = useQueries({
    queries: (publicCampsQuery.data ?? []).map((camp) => ({
      queryKey: ['camp-public', camp.id, 'participants'] as const,
      queryFn: () => getCampPublicParticipants(camp.id),
      enabled: Boolean(camp.id) && Boolean(playerId),
    })),
  });

  const player = useMemo(() => {
    if (!playerId) {
      return null;
    }

    return (publicPlayersQuery.data ?? []).find((item) => item.id === playerId) ?? null;
  }, [playerId, publicPlayersQuery.data]);

  const displayName = player
    ? getPlayerDisplayName(player.firstName, player.lastName, player.nickname)
    : 'Играч';

  const heroLocation = campDetailsQuery.data?.location ?? (campId ? 'Лагер' : 'Публичен профил');
  const heroDateLabel = campDetailsQuery.data
    ? String(campDetailsQuery.data.year)
    : campId
      ? `Лагер ${campId}`
      : 'Профил';
  const heroAvatarUrl = resolveOptionalAssetUrl(player?.avatarUrl) ?? '/assets/avatars/119.png';

  const isLoading = publicPlayersQuery.isLoading || (Boolean(campId) && campParticipantsQuery.isLoading);
  const hasError = publicPlayersQuery.isError || campDetailsQuery.isError || campParticipantsQuery.isError;

  const campTypeById = useMemo(() => {
    const map = new Map<string, { coverImageUrl: string | null }>();

    (publicCampTypesQuery.data ?? []).forEach((campType) => {
      map.set(campType.id, { coverImageUrl: campType.coverImageUrl });
    });

    return map;
  }, [publicCampTypesQuery.data]);

  const playerParticipationCards = useMemo(() => {
    const camps = publicCampsQuery.data ?? [];
    if (!playerId || camps.length === 0) {
      return [];
    }

    return camps
      .map((camp, index) => {
        const participants = campParticipantQueries[index]?.data ?? [];
        const participation = participants.find((item) => item.playerId === playerId);
        if (!participation) {
          return null;
        }

        const campTypeCover = campTypeById.get(camp.campTypeId)?.coverImageUrl ?? null;
        const backgroundImageUrl =
          resolveOptionalAssetUrl(camp.coverImageUrl) ??
          resolveOptionalAssetUrl(campTypeCover) ??
          '/assets/team_token/black.png';

        return {
          id: `${camp.id}-${participation.participationId}`,
          title: camp.title,
          location: camp.location ?? 'България',
          dateLabel: getCampDateLabel(camp.startDate, camp.endDate),
          sortTimestamp: toTimestamp(camp.endDate || camp.startDate),
          backgroundImageUrl,
          kills: participation.kills,
          survivals: participation.survivals,
          points: participation.points,
          killsRankImage: getKillsRankImage(participation.kills),
          survivalsRankImage: getSurvivalsRankImage(participation.survivals),
          medalImages: getMedalImages(participation.duelWins, participation.massBattleWins, participation.kills),
          teamName: participation.currentTeam?.name ?? null,
          teamLogoUrl: resolveOptionalAssetUrl(participation.currentTeam?.logoUrl),
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .sort((a, b) => b.sortTimestamp - a.sortTimestamp);
  }, [campParticipantQueries, campTypeById, playerId, publicCampsQuery.data]);

  const isProgressLoading =
    publicCampsQuery.isLoading ||
    publicCampTypesQuery.isLoading ||
    campParticipantQueries.some((query) => query.isLoading);

  const hasProgressError =
    publicCampsQuery.isError ||
    publicCampTypesQuery.isError ||
    campParticipantQueries.some((query) => query.isError);

  return (
    <div className="space-y-8 sm:space-y-10">
      <PublicBackButton fallbackTo={playerFallbackBackHref} className="mb-2" />

      <PublicHero
        status="active"
        title={displayName}
        location={heroLocation}
        dateLabel={heroDateLabel}
        backgroundImageUrl={heroAvatarUrl}
        topContent={
          <span className="inline-flex h-24 w-24 overflow-hidden rounded-full border-2 border-[color-mix(in_srgb,var(--public-border)_78%,#fff_22%)] bg-[color-mix(in_srgb,var(--public-bg-900)_88%,#000_12%)] shadow-[0_10px_24px_rgba(0,0,0,0.38)] sm:h-28 sm:w-28">
            <img src={heroAvatarUrl} alt={displayName} className="h-full w-full object-cover" />
          </span>
        }
        className="[&>div.relative>span]:hidden"
      />

      <section id="player-achievements" className="space-y-5">
        <SectionTitle title="Постижения" />
        <DarkSectionBlock>
          <div className="space-y-5">
            {playerParticipationCards.map((item) => (
              <article
                key={item.id}
                className="relative isolate overflow-hidden rounded-3xl border border-[color-mix(in_srgb,var(--public-border)_28%,transparent)]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.backgroundImageUrl})` }}
                  aria-hidden
                />
                <div
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,16,20,0.34)_0%,rgba(12,14,18,0.83)_52%,rgba(9,11,14,0.94)_100%)]"
                  aria-hidden
                />

                <div className="relative z-[1] grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:gap-6 sm:p-5">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold uppercase tracking-[0.06em] text-[var(--public-text)] sm:text-xl">{item.title}</h3>
                      <p className="public-text-muted mt-1 text-xs uppercase tracking-[0.08em] sm:text-sm">
                        {item.location} • {item.dateLabel}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--public-text-muted)_92%,#fff_8%)]">
                        Рангове
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="public-token-ring grid h-12 w-12 place-items-center overflow-hidden border-[color-mix(in_srgb,var(--public-border)_64%,transparent)] bg-[color-mix(in_srgb,var(--public-bg-900)_74%,#000_26%)]">
                          <img src={item.killsRankImage} alt="Ранг убийства" className="h-full w-full object-cover" loading="lazy" />
                        </span>
                        <span className="public-token-ring grid h-12 w-12 place-items-center overflow-hidden border-[color-mix(in_srgb,var(--public-border)_64%,transparent)] bg-[color-mix(in_srgb,var(--public-bg-900)_74%,#000_26%)]">
                          <img src={item.survivalsRankImage} alt="Ранг оцеляване" className="h-full w-full object-cover" loading="lazy" />
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--public-text-muted)_92%,#fff_8%)]">
                        Медали
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.medalImages.map((medalImage, index) => (
                          <span
                            key={`${item.id}-medal-${index}`}
                            className="public-token-ring grid h-12 w-12 place-items-center overflow-hidden border-[color-mix(in_srgb,var(--public-border)_64%,transparent)] bg-[color-mix(in_srgb,var(--public-bg-900)_74%,#000_26%)]"
                          >
                            <img src={medalImage} alt="Медал" className="h-full w-full object-cover" loading="lazy" />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[color-mix(in_srgb,var(--public-border)_22%,transparent)] bg-[color-mix(in_srgb,var(--public-bg-900)_74%,#000_26%)] p-3 sm:min-w-[10rem]">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--public-text-muted)_92%,#fff_8%)]">
                      Статистика
                    </p>
                    <dl className="mt-2 space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <dt className="public-text-muted">Убийства</dt>
                        <dd className="min-w-[2.5rem] text-right font-semibold tabular-nums text-[var(--public-text)]">{item.kills}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt className="public-text-muted">Оцеляване</dt>
                        <dd className="min-w-[2.5rem] text-right font-semibold tabular-nums text-[var(--public-text)]">{item.survivals}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt className="public-text-muted">Точки</dt>
                        <dd className="min-w-[2.5rem] text-right font-semibold tabular-nums text-[var(--public-text)]">{item.points}</dd>
                      </div>
                    </dl>
                  </div>

                  {item.teamLogoUrl || item.teamName ? (
                    <div className="absolute top-0 right-0">
                      <span className="public-token-ring grid h-12 w-12 place-items-center overflow-hidden border-[color-mix(in_srgb,var(--public-border)_72%,transparent)] bg-[color-mix(in_srgb,var(--public-bg-900)_72%,#000_28%)]">
                        {item.teamLogoUrl ? (
                          <img src={item.teamLogoUrl} alt={item.teamName ?? 'Отбор'} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <span className="text-xs font-semibold uppercase text-[var(--public-text)]">
                            {(item.teamName ?? 'О').slice(0, 1)}
                          </span>
                        )}
                      </span>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}

            {isProgressLoading ? <p className="public-text-muted text-sm">Зареждане на участията...</p> : null}
            {!isProgressLoading && playerParticipationCards.length === 0 ? (
              <p className="public-text-muted text-sm">Няма участия на играча в публичните лагери.</p>
            ) : null}
            {hasProgressError ? <p className="text-sm text-red-300">Възникна проблем при зареждането на участията.</p> : null}
            {isLoading ? <p className="public-text-muted text-sm">Зареждане на профил...</p> : null}
            {!isLoading && !player ? <p className="public-text-muted text-sm">Играчът не е намерен в публичния списък.</p> : null}
            {hasError ? <p className="text-sm text-red-300">Възникна проблем при зареждането на профила.</p> : null}
          </div>
        </DarkSectionBlock>
      </section>
    </div>
  );
}
