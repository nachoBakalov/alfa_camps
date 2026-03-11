import { Link } from 'react-router-dom';
import { SectionCard } from '../../components/cards/SectionCard';
import { StatCard } from '../../components/cards/StatCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';

const QUICK_ACTIONS = [
  { label: 'Camp Types', to: '/admin/camp-types' },
  { label: 'Team Templates', to: '/admin/team-templates' },
  { label: 'Camps', to: '/admin/camps' },
  { label: 'Players', to: '/admin/players' },
] as const;

export function AdminDashboardPage() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Use quick actions to navigate core setup areas and monitor basic camp progress."
        actions={<Badge tone="neutral">Overview</Badge>}
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Camps" value={0} hint="Placeholder" />
        <StatCard label="Players" value={0} hint="No data wired yet" />
        <StatCard label="Battles" value={0} hint="No data wired yet" />
        <StatCard label="Finished Camps" value={0} hint="Placeholder" />
      </section>

      <SectionCard title="Quick Actions" description="Jump to the main admin management areas.">
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

      <SectionCard title="Next Dashboard Modules">
        <EmptyState
          title="Analytics widgets are not connected yet"
          description="Live counters and activity sections will be wired in a later task."
        />
      </SectionCard>
    </div>
  );
}
