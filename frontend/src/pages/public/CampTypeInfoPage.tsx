import { useEffect, useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
  CampBannerCard,
  CampStatusTabs,
  type CampStatusTabKey,
  DarkSectionBlock,
  LoadMoreButton,
  PhotoGalleryGrid,
  PublicHero,
  SectionTitle,
} from '../../components/public';
import { getPhotosByCamp } from '../../api/photos.api';
import { usePublicCampTypesQuery } from '../../features/camp-types/use-camp-types-query';
import { usePublicCampsQuery } from '../../features/camps/use-camps-query';
import { resolveBackendAssetUrl } from '../../lib/asset-url';

const CAMP_TYPE_SECTION_CLASS = 'scroll-mt-24 space-y-4';

function toTimestamp(value: string): number {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getStartOfTodayTimestamp(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

function isUpcomingCamp(camp: { status: 'DRAFT' | 'ACTIVE' | 'FINISHED'; startDate: string }): boolean {
  if (camp.status === 'ACTIVE' || camp.status === 'FINISHED') {
    return false;
  }

  return toTimestamp(camp.startDate) >= getStartOfTodayTimestamp();
}

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

function getCampDateLabel(startDate: string, endDate: string): string {
  const formatter = new Intl.DateTimeFormat('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`;
}

export function CampTypeInfoPage() {
  const { campTypeId } = useParams();
  const [activeStatusTab, setActiveStatusTab] = useState<CampStatusTabKey>('finished');
  const [visiblePhotoCount, setVisiblePhotoCount] = useState(20);
  const publicCampTypesQuery = usePublicCampTypesQuery();
  const publicCampsQuery = usePublicCampsQuery();

  const selectedCampType = useMemo(() => {
    if (!campTypeId) {
      return null;
    }

    return (publicCampTypesQuery.data ?? []).find((campType) => campType.id === campTypeId) ?? null;
  }, [campTypeId, publicCampTypesQuery.data]);

  const relatedCamps = useMemo(() => {
    if (!selectedCampType) {
      return [];
    }

    return (publicCampsQuery.data ?? []).filter((camp) => camp.campTypeId === selectedCampType.id);
  }, [publicCampsQuery.data, selectedCampType]);

  const campPhotoQueries = useQueries({
    queries: relatedCamps.map((camp) => ({
      queryKey: ['photos', 'camp', camp.id] as const,
      queryFn: () => getPhotosByCamp(camp.id),
      enabled: Boolean(camp.id),
    })),
  });

  const activeCampsCount = useMemo(
    () => relatedCamps.filter((camp) => camp.status === 'ACTIVE').length,
    [relatedCamps],
  );
  const upcomingCampsCount = useMemo(
    () => relatedCamps.filter((camp) => isUpcomingCamp(camp)).length,
    [relatedCamps],
  );
  const finishedCampsCount = useMemo(
    () => relatedCamps.filter((camp) => camp.status === 'FINISHED').length,
    [relatedCamps],
  );

  const defaultStatusTab = useMemo<CampStatusTabKey>(() => {
    if (activeCampsCount > 0) {
      return 'active';
    }

    if (upcomingCampsCount > 0) {
      return 'upcoming';
    }

    return 'finished';
  }, [activeCampsCount, upcomingCampsCount]);

  useEffect(() => {
    setActiveStatusTab(defaultStatusTab);
  }, [campTypeId, defaultStatusTab]);

  useEffect(() => {
    setVisiblePhotoCount(20);
  }, [campTypeId]);

  const statusFilteredCamps = useMemo(() => {
    const filtered = relatedCamps.filter((camp) => {
      if (activeStatusTab === 'active') {
        return camp.status === 'ACTIVE';
      }

      if (activeStatusTab === 'upcoming') {
        return isUpcomingCamp(camp);
      }

      return camp.status === 'FINISHED';
    });

    return filtered.sort((a, b) => toTimestamp(b.startDate) - toTimestamp(a.startDate));
  }, [activeStatusTab, relatedCamps]);

  const isLoading = publicCampTypesQuery.isLoading || publicCampsQuery.isLoading;
  const hasError = publicCampTypesQuery.isError || publicCampsQuery.isError;

  const relatedCampPhotos = useMemo(() => {
    const byId = new Map<string, { id: string; imageUrl: string; createdAt: string }>();

    campPhotoQueries.forEach((query) => {
      (query.data ?? []).forEach((photo) => {
        if (!byId.has(photo.id)) {
          byId.set(photo.id, {
            id: photo.id,
            imageUrl: resolveBackendAssetUrl(photo.imageUrl),
            createdAt: photo.createdAt,
          });
        }
      });
    });

    return Array.from(byId.values()).sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt));
  }, [campPhotoQueries]);

  const visiblePhotos = useMemo(() => {
    return relatedCampPhotos.slice(0, visiblePhotoCount).map((photo) => ({
      id: photo.id,
      imageUrl: photo.imageUrl,
      alt: 'Снимка от тип лагер',
    }));
  }, [relatedCampPhotos, visiblePhotoCount]);

  const canLoadMorePhotos = visiblePhotoCount < relatedCampPhotos.length;
  const isPhotosLoading = campPhotoQueries.some((query) => query.isLoading);
  const hasPhotosError = campPhotoQueries.some((query) => query.isError);

  const heroTitle = selectedCampType?.name ?? 'Тип лагер';
  const heroBackground =
    resolveOptionalAssetUrl(selectedCampType?.coverImageUrl) ??
    resolveOptionalAssetUrl(selectedCampType?.logoUrl) ??
    '/assets/team_token/chimera.png';

  return (
    <div className="space-y-8 sm:space-y-10">
      <PublicHero
        status="active"
        title={heroTitle}
        backgroundImageUrl={heroBackground}
        className="[&>div.relative>span]:hidden"
      />

      <section className={CAMP_TYPE_SECTION_CLASS}>
        <SectionTitle title="Информация за лагера" />
        <DarkSectionBlock>
          <div className="space-y-3">
            <p className="text-base font-semibold uppercase tracking-[0.06em] text-[var(--public-text)]">
              {selectedCampType?.name ?? 'Няма избран тип лагер'}
            </p>

            <p className="public-text-muted text-sm leading-relaxed">
              {selectedCampType?.description?.trim() || 'Няма въведено публично описание за този тип лагер.'}
            </p>

            {isLoading ? <p className="public-text-muted text-sm">Зареждане на данни...</p> : null}
            {!isLoading && !selectedCampType ? <p className="public-text-muted text-sm">Типът лагер не е намерен.</p> : null}
            {hasError ? <p className="text-sm text-red-300">Възникна проблем при зареждането на данните.</p> : null}
          </div>
        </DarkSectionBlock>
      </section>

      <section id="camp-type-camps" className={CAMP_TYPE_SECTION_CLASS}>
        <DarkSectionBlock >
          <div className="space-y-4">
            <CampStatusTabs
              activeTab={activeStatusTab}
              onChange={setActiveStatusTab}
              counts={{
                active: activeCampsCount,
                upcoming: upcomingCampsCount,
                finished: finishedCampsCount,
              }}
            />

            {statusFilteredCamps.length === 0 ? (
              <p className="public-text-muted text-sm">Няма лагери</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {statusFilteredCamps.map((camp) => (
                  <CampBannerCard
                    key={camp.id}
                    to={`/camps/${camp.id}`}
                    title={camp.title}
                    location={camp.location}
                    dateLabel={getCampDateLabel(camp.startDate, camp.endDate)}
                    backgroundImageUrl={
                      resolveOptionalAssetUrl(camp.coverImageUrl) ??
                      resolveOptionalAssetUrl(selectedCampType?.coverImageUrl) ??
                      '/assets/team_token/chimera.png'
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </DarkSectionBlock>
      </section>

      <section id="camp-type-photos" className={CAMP_TYPE_SECTION_CLASS}>
        
        <DarkSectionBlock >
          <SectionTitle title="Снимки" className='mb-4'/>
          <PhotoGalleryGrid
          className="!rounded-none !border-0 !bg-transparent !p-0"
            items={visiblePhotos}
            emptyText={isPhotosLoading ? 'Зареждане на снимки...' : 'Няма снимки'}
          />

          {canLoadMorePhotos ? (
            <div className="mt-4 flex justify-center">
              <LoadMoreButton onClick={() => setVisiblePhotoCount((current) => current + 20)} />
            </div>
          ) : null}

          {hasPhotosError ? <p className="mt-2 text-sm text-red-300">Възникна проблем при зареждането на снимките.</p> : null}

          {!isPhotosLoading && relatedCampPhotos.length > 0 ? (
            <p className="public-text-muted mt-2 text-xs uppercase tracking-[0.08em]">Общо снимки: {relatedCampPhotos.length}</p>
          ) : null}
        </DarkSectionBlock>
      </section>
    </div>
  );
}
