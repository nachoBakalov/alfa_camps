import { useParams } from 'react-router-dom';

export function PlayerProfilePage() {
  const { playerId } = useParams();

  return (
    <section className="public-section">
      <div className="public-token-ring mb-4 grid h-16 w-16 place-items-center text-xl font-semibold">P</div>
      <h1 className="text-2xl font-semibold uppercase tracking-[0.05em] text-[var(--public-text)]">Player Profile Page</h1>
      <p className="public-text-muted mt-2">Placeholder player screen for playerId: {playerId}</p>
      <p className="public-text-muted mt-2 text-sm">
        Progression presentation prioritizes ranks and medals. Achievements remain available but are currently
        de-emphasized.
      </p>
    </section>
  );
}
