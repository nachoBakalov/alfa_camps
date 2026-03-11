import { useParams } from 'react-router-dom';

export function CampPublicPage() {
  const { campId } = useParams();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Camp Public Page</h1>
      <p className="mt-2 text-slate-600">Placeholder camp screen for campId: {campId}</p>
    </section>
  );
}
