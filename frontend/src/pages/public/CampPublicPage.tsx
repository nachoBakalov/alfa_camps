import { useParams } from 'react-router-dom';

export function CampPublicPage() {
  const { campId } = useParams();

  return (
    <section className="public-section">
      <div className="public-token-ring mb-4 grid h-16 w-16 place-items-center text-xl font-semibold">C</div>
      <h1 className="text-2xl font-semibold uppercase tracking-[0.05em] text-[var(--public-text)]">Camp Public Page</h1>
      <p className="public-text-muted mt-2">Placeholder camp screen for campId: {campId}</p>
      <button type="button" className="public-primary-action mt-5 px-5 py-2 text-sm uppercase tracking-[0.08em]">
        Виж отбора
      </button>
    </section>
  );
}
