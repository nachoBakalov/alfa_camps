import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type {
  AchievementConditionType,
  AchievementDefinition,
  AchievementDefinitionInput,
  UpdateAchievementDefinitionInput,
} from '../../api/achievements.api';
import { SectionCard } from '../../components/cards/SectionCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { PageHeader } from '../../components/layout/PageHeader';
import { AssetPicker } from '../../components/ui/AssetPicker';
import { Badge } from '../../components/ui/Badge';
import { ModalDrawer } from '../../components/ui/ModalDrawer';
import {
  achievementDefinitionFormSchema,
  type AchievementDefinitionFormValues,
} from '../../features/achievements/achievement-definition-form.schema';
import { useAchievementMutations } from '../../features/achievements/use-achievement-mutations';
import { useAchievementDefinitionsQuery } from '../../features/achievements/use-achievements-query';
import { ApiClientError } from '../../lib/errors';

type FormMode =
  | {
      kind: 'create';
      definition: null;
      conditionType?: AchievementConditionType;
    }
  | {
      kind: 'edit';
      definition: AchievementDefinition;
    }
  | null;

const CONDITION_TYPES: AchievementConditionType[] = ['KILLS', 'SURVIVALS', 'DUEL_WINS', 'POINTS'];

function getConditionTypeLabel(type: AchievementConditionType): string {
  if (type === 'DUEL_WINS') {
    return 'DUEL WINS';
  }

  return type;
}

function emptyToUndefined(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function getMutationErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return fallback;
}

function getQueryErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return 'Unable to load achievement definitions right now.';
}

function AchievementIconPreview({ iconUrl }: { iconUrl?: string | null }) {
  if (!iconUrl) {
    return <p className="text-xs text-slate-500">No icon selected</p>;
  }

  return (
    <img
      src={iconUrl}
      alt="Achievement icon preview"
      className="h-12 w-12 rounded-md border border-slate-200 object-cover"
      loading="lazy"
    />
  );
}

function toCreatePayload(values: AchievementDefinitionFormValues): AchievementDefinitionInput {
  return {
    name: values.name.trim(),
    description: emptyToUndefined(values.description),
    iconUrl: emptyToUndefined(values.iconUrl),
    conditionType: values.conditionType,
    threshold: Number(values.threshold),
  };
}

function toUpdatePayload(values: AchievementDefinitionFormValues): UpdateAchievementDefinitionInput {
  return {
    name: values.name.trim(),
    description: emptyToUndefined(values.description),
    iconUrl: emptyToUndefined(values.iconUrl),
    conditionType: values.conditionType,
    threshold: Number(values.threshold),
  };
}

function AchievementDefinitionForm({
  mode,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  mode: Exclude<FormMode, null>;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: AchievementDefinitionFormValues) => Promise<void>;
}) {
  const [showIconPicker, setShowIconPicker] = useState(false);

  const form = useForm<AchievementDefinitionFormValues>({
    resolver: zodResolver(achievementDefinitionFormSchema),
    defaultValues: {
      name: mode.kind === 'create' ? '' : mode.definition.name,
      description: mode.kind === 'create' ? '' : mode.definition.description ?? '',
      iconUrl: mode.kind === 'create' ? '' : mode.definition.iconUrl ?? '',
      conditionType: mode.kind === 'create' ? mode.conditionType ?? 'KILLS' : mode.definition.conditionType,
      threshold: mode.kind === 'create' ? '0' : String(mode.definition.threshold),
    },
  });

  useEffect(() => {
    form.reset({
      name: mode.kind === 'create' ? '' : mode.definition.name,
      description: mode.kind === 'create' ? '' : mode.definition.description ?? '',
      iconUrl: mode.kind === 'create' ? '' : mode.definition.iconUrl ?? '',
      conditionType: mode.kind === 'create' ? mode.conditionType ?? 'KILLS' : mode.definition.conditionType,
      threshold: mode.kind === 'create' ? '0' : String(mode.definition.threshold),
    });
  }, [form, mode]);

  const submitLabel = mode.kind === 'create' ? 'Create Achievement' : 'Save Changes';

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
      noValidate
    >
      <div>
        <label htmlFor="achievementName" className="mb-1 block text-sm font-medium text-slate-700">
          Name
        </label>
        <input
          id="achievementName"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
          {...form.register('name')}
        />
        {form.formState.errors.name ? (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="achievementDescription" className="mb-1 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="achievementDescription"
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
          {...form.register('description')}
        />
        {form.formState.errors.description ? (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.description.message}</p>
        ) : null}
      </div>

      <div>
        <p className="mb-1 block text-sm font-medium text-slate-700">Current Icon</p>
        <AchievementIconPreview iconUrl={form.watch('iconUrl')} />
      </div>

      <div>
        <label htmlFor="achievementIconUrl" className="mb-1 block text-sm font-medium text-slate-700">
          Icon URL
        </label>
        <input
          id="achievementIconUrl"
          placeholder="https://..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
          {...form.register('iconUrl')}
        />
        {form.formState.errors.iconUrl ? (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.iconUrl.message}</p>
        ) : null}

        <button
          type="button"
          onClick={() => {
            setShowIconPicker((current) => !current);
          }}
          className="mt-3 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {showIconPicker ? 'Hide Icon Picker' : 'Choose Icon'}
        </button>

        {showIconPicker ? (
          <div className="mt-3">
            <AssetPicker
              manifest="achievements"
              title="Choose Achievement Icon"
              selectedUrl={form.watch('iconUrl') ?? ''}
              onSelect={(url) => {
                form.setValue('iconUrl', url, { shouldValidate: true, shouldDirty: true });
              }}
            />
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="achievementConditionType" className="mb-1 block text-sm font-medium text-slate-700">
            Condition Type
          </label>
          <select
            id="achievementConditionType"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            {...form.register('conditionType')}
          >
            {CONDITION_TYPES.map((type) => (
              <option key={type} value={type}>
                {getConditionTypeLabel(type)}
              </option>
            ))}
          </select>
          {form.formState.errors.conditionType ? (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.conditionType.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="achievementThreshold" className="mb-1 block text-sm font-medium text-slate-700">
            Threshold
          </label>
          <input
            id="achievementThreshold"
            type="number"
            inputMode="numeric"
            min={0}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            {...form.register('threshold')}
          />
          {form.formState.errors.threshold ? (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.threshold.message}</p>
          ) : null}
        </div>
      </div>

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

export function AchievementsPage() {
  const achievementDefinitionsQuery = useAchievementDefinitionsQuery();
  const { createMutation, updateMutation, deleteMutation } = useAchievementMutations();
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const definitions = achievementDefinitionsQuery.data ?? [];

  const definitionsByConditionType = useMemo(() => {
    const groups: Record<AchievementConditionType, AchievementDefinition[]> = {
      KILLS: [],
      SURVIVALS: [],
      DUEL_WINS: [],
      POINTS: [],
    };

    for (const definition of definitions) {
      groups[definition.conditionType].push(definition);
    }

    for (const type of CONDITION_TYPES) {
      groups[type].sort((a, b) => a.threshold - b.threshold || a.name.localeCompare(b.name));
    }

    return groups;
  }, [definitions]);

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  async function handleCreate(values: AchievementDefinitionFormValues): Promise<void> {
    try {
      await createMutation.mutateAsync(toCreatePayload(values));
      setFeedback({ kind: 'success', message: 'Achievement definition created successfully.' });
      setFormMode(null);
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to create achievement definition.'),
      });
    }
  }

  async function handleEdit(id: string, values: AchievementDefinitionFormValues): Promise<void> {
    try {
      await updateMutation.mutateAsync({ id, payload: toUpdatePayload(values) });
      setFeedback({ kind: 'success', message: 'Achievement definition updated successfully.' });
      setFormMode(null);
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to update achievement definition.'),
      });
    }
  }

  async function handleDelete(id: string): Promise<void> {
    const shouldDelete = window.confirm('Delete this achievement definition? This action cannot be undone.');

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      setFeedback({ kind: 'success', message: 'Achievement definition deleted successfully.' });

      if (formMode?.kind === 'edit' && formMode.definition.id === id) {
        setFormMode(null);
      }
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to delete achievement definition.'),
      });
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Achievement Definitions"
        description="Achievement rules are available but are currently secondary to active progression features (ranks and medals)."
        actions={
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setFormMode({ kind: 'create', definition: null });
            }}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Add Achievement
          </button>
        }
      />

      <div className="flex items-center gap-2">
        <Badge tone="neutral">Definitions</Badge>
        <Badge tone="warning">Secondary Feature</Badge>
        <Badge tone="success">CRUD</Badge>
      </div>

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
        title={
          formMode?.kind === 'create'
            ? 'Create Achievement Definition'
            : `Edit Achievement: ${formMode?.definition.name ?? ''}`
        }
        onClose={() => {
          setFormMode(null);
        }}
      >
        {formMode ? (
          <AchievementDefinitionForm
            mode={formMode}
            isSubmitting={isMutating}
            onCancel={() => {
              setFormMode(null);
            }}
            onSubmit={async (values) => {
              if (formMode.kind === 'create') {
                await handleCreate(values);
                return;
              }

              await handleEdit(formMode.definition.id, values);
            }}
          />
        ) : null}
      </ModalDrawer>

      <SectionCard title="Achievement Definitions" description="Grouped by condition type.">
        {achievementDefinitionsQuery.isLoading ? (
          <LoadingState label="Loading achievement definitions..." />
        ) : null}

        {achievementDefinitionsQuery.isError ? (
          <ErrorState
            message={getQueryErrorMessage(achievementDefinitionsQuery.error)}
            onRetry={() => {
              void achievementDefinitionsQuery.refetch();
            }}
          />
        ) : null}

        {achievementDefinitionsQuery.isSuccess && definitions.length === 0 ? (
          <EmptyState
            title="No achievement definitions"
            description="Create achievement definitions to define unlock milestones."
          />
        ) : null}

        {achievementDefinitionsQuery.isSuccess && definitions.length > 0 ? (
          <div className="space-y-4">
            {CONDITION_TYPES.map((conditionType) => {
              const items = definitionsByConditionType[conditionType];

              return (
                <div key={conditionType} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-slate-900">
                      {getConditionTypeLabel(conditionType)}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setFeedback(null);
                        setFormMode({ kind: 'create', definition: null, conditionType });
                      }}
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Add
                    </button>
                  </div>

                  {items.length === 0 ? (
                    <EmptyState title="No items" description="No definitions in this condition group yet." />
                  ) : (
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="rounded-md border border-slate-200 p-3">
                          <div className="space-y-1 text-sm text-slate-700">
                            <p>
                              <span className="font-medium text-slate-900">Name:</span> {item.name}
                            </p>
                            <p>
                              <span className="font-medium text-slate-900">Description:</span>{' '}
                              {item.description || 'Not set'}
                            </p>
                            <p className="break-all">
                              <span className="font-medium text-slate-900">Icon:</span>
                            </p>
                            <div className="flex items-center gap-3 rounded-md border border-slate-200 p-2">
                              <AchievementIconPreview iconUrl={item.iconUrl} />
                              <p className="break-all text-xs text-slate-500">{item.iconUrl || 'Not set'}</p>
                            </div>
                            <p>
                              <span className="font-medium text-slate-900">Condition Type:</span>{' '}
                              {getConditionTypeLabel(item.conditionType)}
                            </p>
                            <p>
                              <span className="font-medium text-slate-900">Threshold:</span> {item.threshold}
                            </p>
                          </div>

                          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setFeedback(null);
                                setFormMode({ kind: 'edit', definition: item });
                              }}
                              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                void handleDelete(item.id);
                              }}
                              disabled={isMutating}
                              className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
}
