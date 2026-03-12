import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import type { Battle, CreateBattleInput, UpdateBattleInput } from '../../api/battles.api';
import { SectionCard } from '../../components/cards/SectionCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Badge } from '../../components/ui/Badge';
import { ModalDrawer } from '../../components/ui/ModalDrawer';
import { ApiClientError } from '../../lib/errors';
import { useCampTeamsByCampQuery } from '../camp-teams/use-camp-teams-query';
import {
  battleFormSchema,
  battleSessionOptions,
  battleStatusOptions,
  battleTypeOptions,
  type BattleFormValues,
} from './battle-form.schema';
import { useBattleMutations } from './use-battle-mutations';
import { useBattlesByCampQuery } from './use-battles-query';

type FormMode =
  | {
      kind: 'create';
      battle: null;
    }
  | {
      kind: 'edit';
      battle: Battle;
    }
  | null;

function emptyToUndefined(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function formatDate(dateValue: string): string {
  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }

  return parsed.toLocaleDateString();
}

function getMutationErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return fallback;
}

function toCreatePayload(values: BattleFormValues, campId: string): CreateBattleInput {
  return {
    campId,
    title: values.title.trim(),
    battleType: values.battleType,
    battleDate: values.battleDate,
    session: values.session || undefined,
    winningTeamId: emptyToUndefined(values.winningTeamId),
    notes: emptyToUndefined(values.notes),
  };
}

function toUpdatePayload(values: BattleFormValues, mode: Exclude<FormMode, null>): UpdateBattleInput {
  const payload: UpdateBattleInput = {
    title: values.title.trim(),
    battleType: values.battleType,
    battleDate: values.battleDate,
    session: values.session || undefined,
    notes: emptyToUndefined(values.notes),
  };

  if (mode.kind === 'edit') {
    payload.status = values.status || undefined;
  }

  const winningTeamId = emptyToUndefined(values.winningTeamId);
  payload.winningTeamId = winningTeamId;

  return payload;
}

function BattleForm({
  mode,
  teamOptions,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  mode: Exclude<FormMode, null>;
  teamOptions: Array<{ id: string; name: string }>;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: BattleFormValues) => Promise<void>;
}) {
  const form = useForm<BattleFormValues>({
    resolver: zodResolver(battleFormSchema),
    defaultValues: {
      title: mode.battle?.title ?? '',
      battleType: mode.battle?.battleType ?? 'MASS_BATTLE',
      battleDate: mode.battle?.battleDate ?? '',
      session: mode.battle?.session ?? '',
      winningTeamId: mode.battle?.winningTeamId ?? '',
      notes: mode.battle?.notes ?? '',
      status: mode.battle?.status ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      title: mode.battle?.title ?? '',
      battleType: mode.battle?.battleType ?? 'MASS_BATTLE',
      battleDate: mode.battle?.battleDate ?? '',
      session: mode.battle?.session ?? '',
      winningTeamId: mode.battle?.winningTeamId ?? '',
      notes: mode.battle?.notes ?? '',
      status: mode.battle?.status ?? '',
    });
  }, [form, mode]);

  const submitLabel = mode.kind === 'create' ? 'Create Battle' : 'Save Changes';

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
      noValidate
    >
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
          Title
        </label>
        <input
          id="title"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
          {...form.register('title')}
        />
        {form.formState.errors.title ? (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.title.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="battleType" className="mb-1 block text-sm font-medium text-slate-700">
            Battle Type
          </label>
          <select
            id="battleType"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            {...form.register('battleType')}
          >
            {battleTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="battleDate" className="mb-1 block text-sm font-medium text-slate-700">
            Battle Date
          </label>
          <input
            id="battleDate"
            type="date"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            {...form.register('battleDate')}
          />
          {form.formState.errors.battleDate ? (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.battleDate.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="session" className="mb-1 block text-sm font-medium text-slate-700">
            Session
          </label>
          <select
            id="session"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            {...form.register('session')}
          >
            <option value="">No session</option>
            {battleSessionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="winningTeamId" className="mb-1 block text-sm font-medium text-slate-700">
            Winning Team
          </label>
          <select
            id="winningTeamId"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            {...form.register('winningTeamId')}
          >
            <option value="">No winning team</option>
            {teamOptions.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium text-slate-700">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
          {...form.register('notes')}
        />
      </div>

      {mode.kind === 'edit' ? (
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            {...form.register('status')}
          >
            <option value="">Keep current</option>
            {battleStatusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export function CampBattlesTab({ campId }: { campId: string }) {
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const battlesQuery = useBattlesByCampQuery(campId);
  const teamsQuery = useCampTeamsByCampQuery(campId);
  const { createMutation, updateMutation, deleteMutation } = useBattleMutations(campId);

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const teamNameById = useMemo(() => {
    const map = new Map<string, string>();

    for (const team of teamsQuery.data ?? []) {
      map.set(team.id, team.name);
    }

    return map;
  }, [teamsQuery.data]);

  async function handleCreate(values: BattleFormValues): Promise<void> {
    try {
      await createMutation.mutateAsync(toCreatePayload(values, campId));
      setFeedback({ kind: 'success', message: 'Battle created successfully.' });
      setFormMode(null);
    } catch (error) {
      setFeedback({ kind: 'error', message: getMutationErrorMessage(error, 'Unable to create battle.') });
    }
  }

  async function handleUpdate(id: string, values: BattleFormValues): Promise<void> {
    try {
      const payload = toUpdatePayload(values, formMode as Exclude<FormMode, null>);
      await updateMutation.mutateAsync({ id, payload });
      setFeedback({ kind: 'success', message: 'Battle updated successfully.' });
      setFormMode(null);
    } catch (error) {
      setFeedback({ kind: 'error', message: getMutationErrorMessage(error, 'Unable to update battle.') });
    }
  }

  async function handleDelete(id: string): Promise<void> {
    const shouldDelete = window.confirm('Delete this battle? This action cannot be undone.');

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      setFeedback({ kind: 'success', message: 'Battle deleted successfully.' });

      if (formMode?.kind === 'edit' && formMode.battle.id === id) {
        setFormMode(null);
      }
    } catch (error) {
      setFeedback({ kind: 'error', message: getMutationErrorMessage(error, 'Unable to delete battle.') });
    }
  }

  return (
    <div className="space-y-4">
      <SectionCard>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Battles</h3>
            <p className="text-sm text-slate-600">Manage battles for this camp and open battle details.</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setFormMode({ kind: 'create', battle: null });
            }}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Add Battle
          </button>
        </div>
      </SectionCard>

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

      <ModalDrawer
        open={Boolean(formMode)}
        title={formMode?.kind === 'create' ? 'Create Battle' : `Edit: ${formMode?.battle.title ?? ''}`}
        onClose={() => {
          setFormMode(null);
        }}
      >
        {formMode ? (
          <BattleForm
            mode={formMode}
            teamOptions={(teamsQuery.data ?? []).map((team) => ({ id: team.id, name: team.name }))}
            isSubmitting={isMutating}
            onCancel={() => {
              setFormMode(null);
            }}
            onSubmit={async (values) => {
              if (formMode.kind === 'create') {
                await handleCreate(values);
                return;
              }

              await handleUpdate(formMode.battle.id, values);
            }}
          />
        ) : null}
      </ModalDrawer>

      {battlesQuery.isLoading ? <LoadingState label="Loading battles..." /> : null}

      {battlesQuery.isError ? (
        <ErrorState
          message="Unable to load battles right now."
          onRetry={() => {
            void battlesQuery.refetch();
          }}
        />
      ) : null}

      {battlesQuery.isSuccess && battlesQuery.data.length === 0 ? (
        <EmptyState title="No battles yet" description="Create your first battle for this camp." />
      ) : null}

      {battlesQuery.isSuccess && battlesQuery.data.length > 0 ? (
        <section className="grid gap-3 sm:grid-cols-2">
          {battlesQuery.data.map((battle) => (
            <SectionCard key={battle.id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">{battle.title}</h4>
                    <p className="text-xs text-slate-600">{battle.id}</p>
                  </div>
                  <Badge tone={battle.status === 'COMPLETED' ? 'success' : battle.status === 'CANCELLED' ? 'danger' : 'neutral'}>
                    {battle.status}
                  </Badge>
                </div>

                <dl className="grid grid-cols-2 gap-2 text-sm text-slate-700">
                  <div>
                    <dt className="text-xs text-slate-500">Type</dt>
                    <dd className="mt-1">{battle.battleType}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Date</dt>
                    <dd className="mt-1">{formatDate(battle.battleDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Session</dt>
                    <dd className="mt-1">{battle.session || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Winning Team</dt>
                    <dd className="mt-1">{battle.winningTeamId ? (teamNameById.get(battle.winningTeamId) ?? battle.winningTeamId) : 'N/A'}</dd>
                  </div>
                </dl>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Link
                    to={`/admin/battles/${battle.id}`}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Open Detail
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setFeedback(null);
                      setFormMode({ kind: 'edit', battle });
                    }}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleDelete(battle.id);
                    }}
                    disabled={deleteMutation.isPending}
                    className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </SectionCard>
          ))}
        </section>
      ) : null}
    </div>
  );
}
