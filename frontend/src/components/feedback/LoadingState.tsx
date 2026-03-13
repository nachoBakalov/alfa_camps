type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Зареждане...' }: LoadingStateProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6" role="status" aria-live="polite">
      <div className="flex items-center gap-3 text-slate-700">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
        <p className="text-sm font-medium">{label}</p>
      </div>
    </section>
  );
}
