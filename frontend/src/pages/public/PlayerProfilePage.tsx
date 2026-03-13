import { useParams } from 'react-router-dom';

export function PlayerProfilePage() {
  const { playerId } = useParams();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Player Profile Page</h1>
      <p className="mt-2 text-slate-600">Placeholder player screen for playerId: {playerId}</p>
      <p className="mt-2 text-sm text-slate-500">
        Progression presentation prioritizes ranks and medals. Achievements remain available but are currently
        de-emphasized.
      </p>
    </section>
  );
}
