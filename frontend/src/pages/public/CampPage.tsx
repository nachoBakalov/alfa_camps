import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CircularTokenFilter,
  DarkSectionBlock,
  ExpandablePlayersSection,
  LoadMoreButton,
  PhotoGalleryGrid,
  PublicHero,
  RankingList,
  RankingTabs,
  SectionTitle,
} from '../../components/public';

const TEAM_FILTER_ITEMS = [
  { id: 'dragons', label: 'Dragons', imageUrl: '/assets/team_token/dragon.png' },
  { id: 'lions', label: 'Lions', imageUrl: '/assets/team_token/lion.png' },
  { id: 'griffons', label: 'Griffons', imageUrl: '/assets/team_token/griffon.png' },
  { id: 'bulls', label: 'Bulls', imageUrl: '/assets/team_token/bull.png' },
];

const CAMP_PLAYERS = [
  { id: 'cp1', displayName: 'Вихър', secondaryText: 'Dragons', avatarUrl: '/assets/avatars/12.png' },
  { id: 'cp2', displayName: 'Сокол', secondaryText: 'Griffons', avatarUrl: '/assets/avatars/31.png' },
  { id: 'cp3', displayName: 'Титан', secondaryText: 'Lions', avatarUrl: '/assets/avatars/42.png' },
  { id: 'cp4', displayName: 'Буря', secondaryText: 'Bulls', avatarUrl: '/assets/avatars/64.png' },
  { id: 'cp5', displayName: 'Щит', secondaryText: 'Dragons', avatarUrl: '/assets/avatars/75.png' },
  { id: 'cp6', displayName: 'Лисицата', secondaryText: 'Lions', avatarUrl: '/assets/avatars/88.png' },
];

const CAMP_PHOTOS = [
  { id: 'ph1', imageUrl: '/assets/avatars/101.png' },
  { id: 'ph2', imageUrl: '/assets/avatars/102.png' },
  { id: 'ph3', imageUrl: '/assets/avatars/103.png' },
  { id: 'ph4', imageUrl: '/assets/avatars/104.png' },
  { id: 'ph5', imageUrl: '/assets/avatars/105.png' },
  { id: 'ph6', imageUrl: '/assets/avatars/106.png' },
];

function getCampRanking(tab: 'points' | 'kills' | 'survivals') {
  if (tab === 'kills') {
    return [
      { id: 'ck1', displayName: 'Вихър', scoreLabel: '21', avatarUrl: '/assets/avatars/12.png' },
      { id: 'ck2', displayName: 'Титан', scoreLabel: '19', avatarUrl: '/assets/avatars/42.png' },
      { id: 'ck3', displayName: 'Буря', scoreLabel: '15', avatarUrl: '/assets/avatars/64.png' },
    ];
  }

  if (tab === 'survivals') {
    return [
      { id: 'cs1', displayName: 'Лисицата', scoreLabel: '10', avatarUrl: '/assets/avatars/88.png' },
      { id: 'cs2', displayName: 'Щит', scoreLabel: '9', avatarUrl: '/assets/avatars/75.png' },
      { id: 'cs3', displayName: 'Сокол', scoreLabel: '8', avatarUrl: '/assets/avatars/31.png' },
    ];
  }

  return [
    { id: 'cp1', displayName: 'Вихър', scoreLabel: '680', avatarUrl: '/assets/avatars/12.png' },
    { id: 'cp2', displayName: 'Титан', scoreLabel: '640', avatarUrl: '/assets/avatars/42.png' },
    { id: 'cp3', displayName: 'Сокол', scoreLabel: '602', avatarUrl: '/assets/avatars/31.png' },
  ];
}

export function CampPage() {
  const { campId } = useParams();
  const [teamId, setTeamId] = useState('dragons');
  const [playersQuery, setPlayersQuery] = useState('');
  const [rankingTab, setRankingTab] = useState<'points' | 'kills' | 'survivals'>('points');

  return (
    <div className="space-y-8 sm:space-y-10">
      <PublicHero
        status="active"
        title="Camp Shell"
        location={`Camp ${campId ?? 'demo'}`}
        dateLabel="12.07 - 18.07"
        backgroundImageUrl="/assets/team_token/lion.png"
        primaryAction={{ label: 'Отбори', href: '#camp-teams' }}
        secondaryAction={{ label: 'Снимки', href: '#camp-photos' }}
      />

      <section id="camp-teams" className="space-y-4">
        <SectionTitle title="Отбори" subtitle="Състав и токени" />
        <DarkSectionBlock>
          <CircularTokenFilter items={TEAM_FILTER_ITEMS} activeId={teamId} onChange={setTeamId} />
        </DarkSectionBlock>
      </section>

      <section className="space-y-4">
        <SectionTitle title="Играчи" subtitle="Всички в лагера" />
        <ExpandablePlayersSection
          items={CAMP_PLAYERS}
          searchValue={playersQuery}
          onSearchChange={setPlayersQuery}
          initialVisibleCount={4}
        />
      </section>

      <section className="space-y-4">
        <SectionTitle title="Класиране" subtitle="По текущата селекция" />
        <DarkSectionBlock>
          <div className="space-y-3">
            <RankingTabs activeTab={rankingTab} onChange={setRankingTab} />
            <RankingList items={getCampRanking(rankingTab)} />
          </div>
        </DarkSectionBlock>
      </section>

      <section id="camp-photos" className="space-y-4">
        <SectionTitle title="Снимки" subtitle="Последни кадри" />
        <PhotoGalleryGrid items={CAMP_PHOTOS} />
        <div className="flex justify-center">
          <LoadMoreButton />
        </div>
      </section>
    </div>
  );
}
