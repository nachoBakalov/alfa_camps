import { useState } from 'react';
import {
  CircularTokenFilter,
  DarkSectionBlock,
  ExpandablePlayersSection,
  PublicHero,
  PublicStatusBadge,
  RankingList,
  RankingTabs,
  SectionTitle,
} from '../../components/public';

const CAMP_TYPE_ITEMS = [
  { id: 'survival', label: 'Survival', imageUrl: '/assets/team_token/dragon.png' },
  { id: 'tribes', label: 'Tribes', imageUrl: '/assets/team_token/lion.png' },
  { id: 'mythic', label: 'Mythic', imageUrl: '/assets/team_token/griffon.png' },
  { id: 'challenge', label: 'Challenge', imageUrl: '/assets/team_token/bull.png' },
];

const MAIN_PLAYERS = [
  { id: 'p1', displayName: 'Вихър', secondaryText: 'Никола Стоянов', avatarUrl: '/assets/avatars/12.png' },
  { id: 'p2', displayName: 'Гръм', secondaryText: 'Даниел Петров', avatarUrl: '/assets/avatars/24.png' },
  { id: 'p3', displayName: 'Сокол', secondaryText: 'Алекс Иванов', avatarUrl: '/assets/avatars/31.png' },
  { id: 'p4', displayName: 'Титан', secondaryText: 'Петър Димитров', avatarUrl: '/assets/avatars/42.png' },
  { id: 'p5', displayName: 'Пламък', secondaryText: 'Иван Георгиев', avatarUrl: '/assets/avatars/53.png' },
  { id: 'p6', displayName: 'Буря', secondaryText: 'Мария Донева', avatarUrl: '/assets/avatars/64.png' },
  { id: 'p7', displayName: 'Щит', secondaryText: 'Кристиян Илиев', avatarUrl: '/assets/avatars/75.png' },
  { id: 'p8', displayName: 'Лисицата', secondaryText: 'Елица Михайлова', avatarUrl: '/assets/avatars/88.png' },
];

function getGlobalRanking(tab: 'points' | 'kills' | 'survivals') {
  if (tab === 'kills') {
    return [
      { id: 'k1', displayName: 'Вихър', scoreLabel: '41', avatarUrl: '/assets/avatars/12.png' },
      { id: 'k2', displayName: 'Титан', scoreLabel: '36', avatarUrl: '/assets/avatars/42.png' },
      { id: 'k3', displayName: 'Сокол', scoreLabel: '29', avatarUrl: '/assets/avatars/31.png' },
      { id: 'k4', displayName: 'Буря', scoreLabel: '24', avatarUrl: '/assets/avatars/64.png' },
    ];
  }

  if (tab === 'survivals') {
    return [
      { id: 's1', displayName: 'Лисицата', scoreLabel: '18', avatarUrl: '/assets/avatars/88.png' },
      { id: 's2', displayName: 'Щит', scoreLabel: '16', avatarUrl: '/assets/avatars/75.png' },
      { id: 's3', displayName: 'Пламък', scoreLabel: '14', avatarUrl: '/assets/avatars/53.png' },
      { id: 's4', displayName: 'Гръм', scoreLabel: '12', avatarUrl: '/assets/avatars/24.png' },
    ];
  }

  return [
    { id: 't1', displayName: 'Вихър', scoreLabel: '1540', avatarUrl: '/assets/avatars/12.png' },
    { id: 't2', displayName: 'Титан', scoreLabel: '1495', avatarUrl: '/assets/avatars/42.png' },
    { id: 't3', displayName: 'Сокол', scoreLabel: '1400', avatarUrl: '/assets/avatars/31.png' },
    { id: 't4', displayName: 'Буря', scoreLabel: '1330', avatarUrl: '/assets/avatars/64.png' },
  ];
}

export function MainPage() {
  const [activeTypeId, setActiveTypeId] = useState('survival');
  const [playersQuery, setPlayersQuery] = useState('');
  const [rankingTab, setRankingTab] = useState<'points' | 'kills' | 'survivals'>('points');

  return (
    <div className="space-y-8 sm:space-y-10">
      <PublicHero
        status="active"
        title="ALFA CAMP"
        location="България"
        dateLabel="Лято 2026"
        backgroundImageUrl="/assets/team_token/dragon.png"
        primaryAction={{ label: 'Виж лагерите', href: '/public/camps/active' }}
        secondaryAction={{ label: 'Класиране', href: '#global-rankings' }}
      />

      <section className="space-y-4">
        <SectionTitle title="Типове лагери" subtitle="Избери режим" />
        <CircularTokenFilter items={CAMP_TYPE_ITEMS} activeId={activeTypeId} onChange={setActiveTypeId} />
      </section>

      <section className="space-y-3">
        <SectionTitle title="Лагери" subtitle="Текущи, предстоящи и минали" />
        <DarkSectionBlock>
          <div className="space-y-3">
            <article className="rounded-lg border border-[color-mix(in_srgb,var(--public-border)_18%,transparent)] bg-[color-mix(in_srgb,var(--public-bg-900)_84%,#000_16%)] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.06em]">Войната на митичните</p>
                <PublicStatusBadge status="active" />
              </div>
            </article>
            <article className="rounded-lg border border-[color-mix(in_srgb,var(--public-border)_18%,transparent)] bg-[color-mix(in_srgb,var(--public-bg-900)_84%,#000_16%)] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.06em]">Игри на кланове</p>
                <PublicStatusBadge status="upcoming" />
              </div>
            </article>
            <article className="rounded-lg border border-[color-mix(in_srgb,var(--public-border)_18%,transparent)] bg-[color-mix(in_srgb,var(--public-bg-900)_84%,#000_16%)] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.06em]">Четник</p>
                <PublicStatusBadge status="finished" />
              </div>
            </article>
          </div>
        </DarkSectionBlock>
      </section>

      <section className="space-y-4">
        <SectionTitle title="Играчи" subtitle="Открий профил" />
        <ExpandablePlayersSection
          items={MAIN_PLAYERS}
          searchValue={playersQuery}
          onSearchChange={setPlayersQuery}
          initialVisibleCount={4}
          loadMoreStep={4}
        />
      </section>

      <section id="global-rankings" className="space-y-4">
        <SectionTitle title="Глобално класиране" subtitle="Топ играчи" />
        <DarkSectionBlock>
          <div className="space-y-3">
            <RankingTabs activeTab={rankingTab} onChange={setRankingTab} />
            <RankingList items={getGlobalRanking(rankingTab)} />
          </div>
        </DarkSectionBlock>
      </section>
    </div>
  );
}
