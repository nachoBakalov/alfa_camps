import { Link } from 'react-router-dom';
import type { Camp, CampStatus } from '../../api/camps.api';
import { SectionCard } from '../../components/cards/SectionCard';
import { StatCard } from '../../components/cards/StatCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { useCampsQuery } from '../../features/camps/use-camps-query';
import { ApiClientError } from '../../lib/errors';

const QUICK_ACTIONS = [
  { label: 'Видове лагери', to: '/admin/camp-types' },
  { label: 'Шаблони на отбори', to: '/admin/team-templates' },
  { label: 'Лагери', to: '/admin/camps' },
  { label: 'Играчи', to: '/admin/players' },
] as const;

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${startDate} - ${endDate}`;
  }

  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
}

function getStatusTone(status: CampStatus): 'success' | 'warning' | 'neutral' {
  if (status === 'ACTIVE') {
    return 'success';
  }

  if (status === 'FINISHED') {
    return 'warning';
  }

  return 'neutral';
}

function getCampErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return 'Неуспешно зареждане на лагери в момента.';
}

function ActiveCampActions({ campId }: { campId: string }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <Link
        to={`/admin/camps/${campId}`}
        className="rounded-md bg-slate-900 px-3 py-2 text-center text-sm font-medium text-white hover:bg-slate-800"
      >
        Open Camp
      </Link>
      <Link
        to={`/admin/camps/${campId}?tab=participations`}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Participations
      </Link>
      <Link
        to={`/admin/camps/${campId}?tab=battles`}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Battles
      </Link>
      <Link
        to={`/admin/camps/${campId}?tab=rankings`}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Rankings
      </Link>
    </div>
  );
}

function ActiveCampDetails({ camp }: { camp: Camp }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{camp.title}</h3>
          <p className="text-sm text-slate-600">Year: {camp.year}</p>
        </div>
        <Badge tone={getStatusTone(camp.status)}>{camp.status}</Badge>
      </div>

      <dl className="grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Location</dt>
          <dd className="mt-1 font-medium text-slate-900">{camp.location || 'Not specified'}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Date Range</dt>
          <dd className="mt-1 font-medium text-slate-900">{formatDateRange(camp.startDate, camp.endDate)}</dd>
        </div>
      </dl>

      <ActiveCampActions campId={camp.id} />
    </div>
  );
}

export function AdminDashboardPage() {
  const campsQuery = useCampsQuery();
  const activeCamps = (campsQuery.data ?? []).filter((camp) => camp.status === 'ACTIVE');

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Главно Табло"
        description="Използвайте бързи действия за навигация в основните настройки и наблюдение на основния прогрес на лагерите."
        actions={<Badge tone="neutral">Обобщение</Badge>}
      />

      <SectionCard title="Активни лагери" description="Текуща видимост на активните лагери за бързи операции.">
        {campsQuery.isLoading ? <LoadingState label="Зареждане на активни лагери..." /> : null}

        {campsQuery.isError ? (
          <ErrorState
            message={getCampErrorMessage(campsQuery.error)}
            onRetry={() => {
              void campsQuery.refetch();
            }}
          />
        ) : null}

        {campsQuery.isSuccess && activeCamps.length === 0 ? (
          <EmptyState
            title="Няма активни лагери"
            description="Активирайте лагер от секцията Лагери, за да го направите видим тук."
            action={
              <Link
                to="/admin/camps"
                className="inline-flex rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Отвори Лагери
              </Link>
            }
          />
        ) : null}

        {campsQuery.isSuccess && activeCamps.length === 1 ? (
          <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50/40 p-4">
            <ActiveCampDetails camp={activeCamps[0]} />
          </div>
        ) : null}

        {campsQuery.isSuccess && activeCamps.length > 1 ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">В момента има няколко активни лагера.</p>
            <div className="space-y-3">
              {activeCamps.map((camp) => (
                <div key={camp.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <ActiveCampDetails camp={camp} />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </SectionCard>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Лагери" value={campsQuery.data?.length ?? 0} hint="От текущите данни за лагерите" />
        <StatCard label="Играчите" value={0} hint="Все още няма данни" />
        <StatCard label="Битки" value={0} hint="Все още няма данни" />
        <StatCard
          label="Завършени лагери"
          value={(campsQuery.data ?? []).filter((camp) => camp.status === 'FINISHED').length}
          hint="От текущите данни за лагерите"
        />
      </section>

      <SectionCard title="Бързи действия" description="Навигирайте до основните административни секции.">
        <div className="grid gap-2 sm:grid-cols-2">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Следващи модули на таблото">
        <EmptyState
          title="Analytics widgets are not connected yet"
          description="Live counters and activity sections will be wired in a later task."
        />
      </SectionCard>
    </div>
  );
}
