import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import type { Camp } from '../../api/camps.api';
import { SectionCard } from '../../components/cards/SectionCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { PageHeader } from '../../components/layout/PageHeader';
import { useCampQuery } from '../../features/camps/use-camps-query';
import { CampTeamsTab } from '../../features/camp-teams/CampTeamsTab';
import { CampParticipationsTab } from '../../features/participations/CampParticipationsTab';
import { CampAssignmentsTab } from '../../features/team-assignments/CampAssignmentsTab';
import { CampBattlesTab } from '../../features/battles/CampBattlesTab';
import { CampRankingsTab } from '../../features/rankings/CampRankingsTab';
import { useFinalizeCampScoreMutation } from '../../features/scoring/use-scoring';
import { ApiClientError } from '../../lib/errors';

type CampDetailTabKey =
  | 'overview'
  | 'teams'
  | 'participations'
  | 'assignments'
  | 'battles'
  | 'rankings'
  | 'photos'
  | 'settings';

type CampDetailTab = {
  key: CampDetailTabKey;
  label: string;
};

const CAMP_DETAIL_TABS: CampDetailTab[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'teams', label: 'Teams' },
  { key: 'participations', label: 'Participations' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'battles', label: 'Battles' },
  { key: 'rankings', label: 'Rankings' },
  { key: 'photos', label: 'Photos' },
  { key: 'settings', label: 'Settings' },
];

function getSafeTab(rawTab: string | null): CampDetailTabKey {
  const fallback: CampDetailTabKey = 'overview';

  if (!rawTab) {
    return fallback;
  }

  const isValid = CAMP_DETAIL_TABS.some((tab) => tab.key === rawTab);
  return isValid ? (rawTab as CampDetailTabKey) : fallback;
}

function formatDate(dateValue: string): string {
  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }

  return parsed.toLocaleDateString();
}

function getCampErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.statusCode === 404) {
      return 'Camp was not found.';
    }

    return error.message;
  }

  return 'Unable to load camp details right now.';
}

function CampMetadataSummary({ camp }: { camp: Camp }) {
  return (
    <SectionCard title="Camp summary" description="Basic camp metadata for quick context.">
      <dl className="grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
          <dd className="mt-1 font-medium text-slate-900">{camp.status}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Year</dt>
          <dd className="mt-1 font-medium text-slate-900">{camp.year}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Start Date</dt>
          <dd className="mt-1">{formatDate(camp.startDate)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">End Date</dt>
          <dd className="mt-1">{formatDate(camp.endDate)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Location</dt>
          <dd className="mt-1">{camp.location || 'Not specified'}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Camp Type ID</dt>
          <dd className="mt-1 break-all">{camp.campTypeId}</dd>
        </div>
      </dl>
    </SectionCard>
  );
}

function CampTabNavigation({
  activeTab,
  campId,
}: {
  activeTab: CampDetailTabKey;
  campId: string;
}) {
  return (
    <SectionCard>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Camp detail sections">
        {CAMP_DETAIL_TABS.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <Link
              key={tab.key}
              to={`/admin/camps/${campId}?tab=${tab.key}`}
              role="tab"
              aria-selected={isActive}
              className={
                isActive
                  ? 'whitespace-nowrap rounded-md border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-medium text-white'
                  : 'whitespace-nowrap rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </SectionCard>
  );
}

function CampTabPlaceholder({ tab }: { tab: CampDetailTabKey }) {
  const tabLabel = CAMP_DETAIL_TABS.find((item) => item.key === tab)?.label ?? 'Section';

  return (
    <SectionCard title={tabLabel} description="This section is intentionally minimal in Phase 3.">
      <p className="text-sm text-slate-600">
        Placeholder content for {tabLabel.toLowerCase()}. Full functionality will be implemented in the next
        frontend tasks.
      </p>
    </SectionCard>
  );
}

function CampTabContent({ tab, campId }: { tab: CampDetailTabKey; campId: string }) {
  if (tab === 'teams') {
    return <CampTeamsTab campId={campId} />;
  }

  if (tab === 'participations') {
    return <CampParticipationsTab campId={campId} />;
  }

  if (tab === 'assignments') {
    return <CampAssignmentsTab campId={campId} />;
  }

  if (tab === 'battles') {
    return <CampBattlesTab campId={campId} />;
  }

  if (tab === 'rankings') {
    return <CampRankingsTab campId={campId} />;
  }

  return <CampTabPlaceholder tab={tab} />;
}

export function AdminCampDetailPage() {
  const { campId } = useParams();
  const [searchParams] = useSearchParams();
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const activeTab = getSafeTab(searchParams.get('tab'));
  const campQuery = useCampQuery(campId);
  const finalizeCampMutation = useFinalizeCampScoreMutation(campId);

  async function handleFinalizeCampScore() {
    const shouldFinalize = window.confirm(
      'Finalize camp score now? This action applies final position bonuses and marks camp as finished.',
    );

    if (!shouldFinalize) {
      return;
    }

    try {
      const result = await finalizeCampMutation.mutateAsync();
      setFeedback({ kind: 'success', message: result.message });
      await campQuery.refetch();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFeedback({ kind: 'error', message: error.message });
        return;
      }

      setFeedback({ kind: 'error', message: 'Unable to finalize camp score right now.' });
    }
  }

  if (!campId) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <PageHeader title="Camp detail" description="Camp identifier is required." />
        <EmptyState
          title="Missing camp identifier"
          description="Please open this page from the camps list using a valid camp link."
          action={
            <Link
              to="/admin/camps"
              className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Back to camps
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Camp detail"
        description="Detail shell with internal navigation for camp management modules."
        actions={
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                void handleFinalizeCampScore();
              }}
              disabled={finalizeCampMutation.isPending || !campQuery.data}
              className="inline-flex rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {finalizeCampMutation.isPending ? 'Finalizing...' : 'Finalize Score'}
            </button>
            <Link
              to="/admin/camps"
              className="inline-flex rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back to camps
            </Link>
          </div>
        }
      />

      {feedback ? (
        <div
          className={
            feedback.kind === 'success'
              ? 'rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800'
              : 'rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'
          }
        >
          {feedback.message}
        </div>
      ) : null}

      {campQuery.isLoading ? <LoadingState label="Loading camp details..." /> : null}

      {campQuery.isError ? (
        <ErrorState
          message={getCampErrorMessage(campQuery.error)}
          onRetry={() => {
            void campQuery.refetch();
          }}
        />
      ) : null}

      {campQuery.isSuccess && !campQuery.data ? (
        <EmptyState
          title="Camp data is unavailable"
          description="Camp details could not be loaded for this identifier."
        />
      ) : null}

      {campQuery.isSuccess && campQuery.data ? (
        <>
          <SectionCard>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-slate-900">{campQuery.data.title}</h2>
              <p className="text-sm text-slate-600">
                Camp ID: <span className="font-mono text-xs text-slate-500">{campQuery.data.id}</span>
              </p>
            </div>
          </SectionCard>

          <CampMetadataSummary camp={campQuery.data} />

          <CampTabNavigation activeTab={activeTab} campId={campId} />

          <CampTabContent tab={activeTab} campId={campId} />
        </>
      ) : null}
    </div>
  );
}
