import { useParams } from 'react-router-dom';
import { CircularTokenCard, DarkSectionBlock, PublicHero, SectionTitle } from '../../components/public';

const PLAYER_PROGRESS_ITEMS = [
  { id: 'rank', label: 'Ранг', imageUrl: '/assets/ranks/kills/10_kills.png' },
  { id: 'medal-1', label: 'Медал', imageUrl: '/assets/ranks/medals/survivor.png' },
  { id: 'medal-2', label: 'Командо', imageUrl: '/assets/ranks/medals/comando.png' },
  { id: 'achievement', label: 'Трофей', imageUrl: '/assets/ranks/medals/lionheart.png' },
];

export function PlayerPage() {
  const { playerId } = useParams();

  return (
    <div className="space-y-8 sm:space-y-10">
      <PublicHero
        status="active"
        title="Player Shell"
        location={`Играч ${playerId ?? 'demo'}`}
        dateLabel="Профил"
        backgroundImageUrl="/assets/avatars/119.png"
        primaryAction={{ label: 'Прогрес', href: '#player-progress' }}
      />

      <section id="player-progress" className="space-y-4">
        <SectionTitle title="Прогрес и постижения" subtitle="Ранг, медали, статистика" />
        <DarkSectionBlock description="Shell структура за бъдещи детайли по ранг, постижения и история на играча.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PLAYER_PROGRESS_ITEMS.map((item) => (
              <div key={item.id} className="flex justify-center">
                <CircularTokenCard label={item.label} imageUrl={item.imageUrl} />
              </div>
            ))}
          </div>
        </DarkSectionBlock>
      </section>
    </div>
  );
}
