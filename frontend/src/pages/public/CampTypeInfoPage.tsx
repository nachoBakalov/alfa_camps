import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  DarkSectionBlock,
  LoadMoreButton,
  PhotoGalleryGrid,
  PublicHero,
  PublicStatusBadge,
  SectionTitle,
} from '../../components/public';

const CAMP_TYPE_PHOTOS = [
  { id: 'ctp1', imageUrl: '/assets/avatars/111.png' },
  { id: 'ctp2', imageUrl: '/assets/avatars/112.png' },
  { id: 'ctp3', imageUrl: '/assets/avatars/113.png' },
  { id: 'ctp4', imageUrl: '/assets/avatars/114.png' },
  { id: 'ctp5', imageUrl: '/assets/avatars/115.png' },
  { id: 'ctp6', imageUrl: '/assets/avatars/116.png' },
];

export function CampTypeInfoPage() {
  const { campTypeId } = useParams();
  const [statusFilter, setStatusFilter] = useState<'active' | 'upcoming' | 'finished'>('active');

  return (
    <div className="space-y-8 sm:space-y-10">
      <PublicHero
        status="upcoming"
        title="Camp Type Shell"
        location={`Тип ${campTypeId ?? 'demo'}`}
        dateLabel="Информация"
        backgroundImageUrl="/assets/team_token/chimera.png"
        primaryAction={{ label: 'Лагери', href: '#camp-type-camps' }}
        secondaryAction={{ label: 'Снимки', href: '#camp-type-photos' }}
      />

      <section className="space-y-4">
        <SectionTitle title="Инфо" subtitle="Описание и акценти" />
        <DarkSectionBlock description="Shell блок за детайли на типа лагер: правила, трудност, подходяща възраст и динамика.">
          <p className="public-text-muted text-sm">
            Тук ще се добави кратко публично описание за конкретния тип лагер и ключовите му характеристики.
          </p>
        </DarkSectionBlock>
      </section>

      <section id="camp-type-camps" className="space-y-4">
        <SectionTitle title="Лагери по статус" subtitle="Активни, предстоящи, минали" />
        <DarkSectionBlock>
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={statusFilter === 'active' ? 'public-primary-action px-4 py-2 text-xs uppercase tracking-[0.08em]' : 'public-token-ring px-4 py-2 text-xs uppercase tracking-[0.08em] text-[var(--public-text)]'}
            >
              Активни
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('upcoming')}
              className={statusFilter === 'upcoming' ? 'public-primary-action px-4 py-2 text-xs uppercase tracking-[0.08em]' : 'public-token-ring px-4 py-2 text-xs uppercase tracking-[0.08em] text-[var(--public-text)]'}
            >
              Предстоящи
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('finished')}
              className={statusFilter === 'finished' ? 'public-primary-action px-4 py-2 text-xs uppercase tracking-[0.08em]' : 'public-token-ring px-4 py-2 text-xs uppercase tracking-[0.08em] text-[var(--public-text)]'}
            >
              Минали
            </button>
          </div>

          <div className="space-y-3">
            <article className="rounded-lg border border-[color-mix(in_srgb,var(--public-border)_20%,transparent)] bg-[color-mix(in_srgb,var(--public-bg-900)_84%,#000_16%)] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.06em]">Лагер Alpha</p>
                <PublicStatusBadge status={statusFilter} />
              </div>
            </article>
            <article className="rounded-lg border border-[color-mix(in_srgb,var(--public-border)_20%,transparent)] bg-[color-mix(in_srgb,var(--public-bg-900)_84%,#000_16%)] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.06em]">Лагер Beta</p>
                <PublicStatusBadge status={statusFilter} />
              </div>
            </article>
          </div>
        </DarkSectionBlock>
      </section>

      <section id="camp-type-photos" className="space-y-4">
        <SectionTitle title="Снимки" subtitle="Галерия по тип лагер" />
        <PhotoGalleryGrid items={CAMP_TYPE_PHOTOS} />
        <div className="flex justify-center">
          <LoadMoreButton />
        </div>
      </section>
    </div>
  );
}
