import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ExpandablePlayersSection,
  LoadMoreButton,
  PhotoGalleryGrid,
  PublicHero,
  RankingList,
  RankingTabs,
  SectionTitle,
  TopRankIcon,
} from '../../components/public';

const TEAM_PLAYERS = [
  { id: 'tp1', displayName: 'Гръм', secondaryText: 'Капитан', avatarUrl: '/assets/avatars/24.png' },
  { id: 'tp2', displayName: 'Вихър', secondaryText: 'Щурмовак', avatarUrl: '/assets/avatars/12.png' },
  { id: 'tp3', displayName: 'Титан', secondaryText: 'Защита', avatarUrl: '/assets/avatars/42.png' },
  { id: 'tp4', displayName: 'Лисицата', secondaryText: 'Скаут', avatarUrl: '/assets/avatars/88.png' },
];

const TEAM_PHOTOS = [
  { id: 'tph1', imageUrl: '/assets/avatars/107.png' },
  { id: 'tph2', imageUrl: '/assets/avatars/108.png' },
  { id: 'tph3', imageUrl: '/assets/avatars/109.png' },
  { id: 'tph4', imageUrl: '/assets/avatars/110.png' },
];

function getTeamRanking(tab: 'points' | 'kills' | 'survivals') {
  if (tab === 'kills') {
    return [
      { id: 'tk1', displayName: 'Вихър', scoreLabel: '12', avatarUrl: '/assets/avatars/12.png' },
      { id: 'tk2', displayName: 'Гръм', scoreLabel: '10', avatarUrl: '/assets/avatars/24.png' },
      { id: 'tk3', displayName: 'Лисицата', scoreLabel: '8', avatarUrl: '/assets/avatars/88.png' },
    ];
  }

  if (tab === 'survivals') {
    return [
      { id: 'ts1', displayName: 'Титан', scoreLabel: '9', avatarUrl: '/assets/avatars/42.png' },
      { id: 'ts2', displayName: 'Лисицата', scoreLabel: '8', avatarUrl: '/assets/avatars/88.png' },
      { id: 'ts3', displayName: 'Гръм', scoreLabel: '7', avatarUrl: '/assets/avatars/24.png' },
    ];
  }

  return [
    { id: 'tt1', displayName: 'Вихър', scoreLabel: '380', avatarUrl: '/assets/avatars/12.png' },
    { id: 'tt2', displayName: 'Титан', scoreLabel: '352', avatarUrl: '/assets/avatars/42.png' },
    { id: 'tt3', displayName: 'Гръм', scoreLabel: '340', avatarUrl: '/assets/avatars/24.png' },
  ];
}

export function TeamPage() {
  const { teamId } = useParams();
  const [playersQuery, setPlayersQuery] = useState('');
  const [rankingTab, setRankingTab] = useState<'points' | 'kills' | 'survivals'>('points');

  return (
    <div className="space-y-8 sm:space-y-10">
      <PublicHero
        status="active"
        title="Team Shell"
        location={`Team ${teamId ?? 'demo'}`}
        dateLabel="Сезон 2026"
        backgroundImageUrl="/assets/team_token/griffon.png"
        topContent={<TopRankIcon rank={1} size={32} />}
        primaryAction={{ label: 'Играчите', href: '#team-players' }}
        secondaryAction={{ label: 'Класиране', href: '#team-ranking' }}
      />

      <section id="team-players" className="space-y-4">
        <SectionTitle title="Играчите на отбора" subtitle="Компактен изглед" />
        <ExpandablePlayersSection
          items={TEAM_PLAYERS}
          searchValue={playersQuery}
          onSearchChange={setPlayersQuery}
          initialVisibleCount={3}
          loadMoreStep={2}
        />
      </section>

      <section id="team-ranking" className="space-y-4">
        <SectionTitle title="Отборно класиране" subtitle="Вътрешна подредба" />
        <div className="public-section space-y-3">
          <RankingTabs activeTab={rankingTab} onChange={setRankingTab} />
          <RankingList items={getTeamRanking(rankingTab)} />
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle title="Снимки" subtitle="Отборна галерия" />
        <PhotoGalleryGrid items={TEAM_PHOTOS} />
        <div className="flex justify-center">
          <LoadMoreButton />
        </div>
      </section>
    </div>
  );
}
