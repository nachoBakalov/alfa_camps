import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionCard } from '../../components/cards/SectionCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { AssetPicker } from '../../components/ui/AssetPicker';
import { Badge } from '../../components/ui/Badge';
import { ModalDrawer } from '../../components/ui/ModalDrawer';
import type { TeamTemplate, TeamTemplateInput } from '../../api/team-templates.api';
import { ApiClientError } from '../../lib/errors';
import { useCampTypesQuery } from '../../features/camp-types/use-camp-types-query';
import {
  teamTemplateFormSchema,
  type TeamTemplateFormValues,
} from '../../features/team-templates/team-template-form.schema';
import { useTeamTemplateMutations } from '../../features/team-templates/use-team-template-mutations';
import { useTeamTemplatesQuery } from '../../features/team-templates/use-team-templates-query';

type FormMode =
  | {
      kind: 'create';
      teamTemplate: null;
    }
  | {
      kind: 'edit';
      teamTemplate: TeamTemplate;
    }
  | null;

function emptyToUndefined(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function toPayload(values: TeamTemplateFormValues): TeamTemplateInput {
  const sortOrderValue = values.sortOrder.trim();

  return {
    campTypeId: values.campTypeId,
    name: values.name.trim(),
    color: emptyToUndefined(values.color),
    logoUrl: emptyToUndefined(values.logoUrl),
    sortOrder: sortOrderValue ? Number(sortOrderValue) : undefined,
  };
}

function getMutationErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return fallback;
}

function LogoPreview({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="h-24 w-full rounded-md border border-slate-200 object-cover sm:h-28"
      loading="lazy"
    />
  );
}

function TeamTemplateForm({
  mode,
  campTypeOptions,
  isCampTypesLoading,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  mode: Exclude<FormMode, null>;
  campTypeOptions: Array<{ id: string; name: string }>;
  isCampTypesLoading: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: TeamTemplateInput) => Promise<void>;
}) {
  const form = useForm<TeamTemplateFormValues>({
    resolver: zodResolver(teamTemplateFormSchema),
    defaultValues: {
      campTypeId: mode.teamTemplate?.campTypeId ?? '',
      name: mode.teamTemplate?.name ?? '',
      color: mode.teamTemplate?.color ?? '',
      logoUrl: mode.teamTemplate?.logoUrl ?? '',
      sortOrder: mode.teamTemplate?.sortOrder?.toString() ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      campTypeId: mode.teamTemplate?.campTypeId ?? '',
      name: mode.teamTemplate?.name ?? '',
      color: mode.teamTemplate?.color ?? '',
      logoUrl: mode.teamTemplate?.logoUrl ?? '',
      sortOrder: mode.teamTemplate?.sortOrder?.toString() ?? '',
    });
  }, [form, mode]);

  const submitLabel = mode.kind === 'create' ? 'Create Team Template' : 'Save Changes';
  const selectedColor = form.watch('color')?.trim() || '#1E293B';

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(toPayload(values));
      })}
      noValidate
    >
        <div>
          <label htmlFor="campTypeId" className="mb-1 block text-sm font-medium text-slate-700">
            Camp Type
          </label>
          <select
            id="campTypeId"
            disabled={isCampTypesLoading}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            {...form.register('campTypeId')}
          >
            <option value="">Select camp type</option>
            {campTypeOptions.map((campType) => (
              <option key={campType.id} value={campType.id}>
                {campType.name}
              </option>
            ))}
          </select>
          {form.formState.errors.campTypeId ? (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.campTypeId.message}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="name"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              {...form.register('name')}
            />
            {form.formState.errors.name ? (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="sortOrder" className="mb-1 block text-sm font-medium text-slate-700">
              Sort Order
            </label>
            <input
              id="sortOrder"
              inputMode="numeric"
              placeholder="0"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              {...form.register('sortOrder')}
            />
            {form.formState.errors.sortOrder ? (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.sortOrder.message}</p>
            ) : null}
          </div>
        </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="colorHex" className="mb-1 block text-sm font-medium text-slate-700">
            Color
          </label>
          <div className="flex items-center gap-2">
            <input
              id="colorPicker"
              type="color"
              value={/^#[0-9A-Fa-f]{6}$/.test(selectedColor) ? selectedColor : '#1E293B'}
              onChange={(event) => {
                form.setValue('color', event.target.value.toUpperCase(), {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              className="h-10 w-12 cursor-pointer rounded border border-slate-300 bg-white p-1"
            />
            <input
              id="colorHex"
              placeholder="#1E293B"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              {...form.register('color')}
            />
          </div>
          {form.formState.errors.color ? (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.color.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="logoUrl" className="mb-1 block text-sm font-medium text-slate-700">
            Logo URL
          </label>
          <input
            id="logoUrl"
            placeholder="https://..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            {...form.register('logoUrl')}
          />
          {form.formState.errors.logoUrl ? (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.logoUrl.message}</p>
          ) : null}

          <div className="mt-3">
            <AssetPicker
              manifest="team-tokens"
              title="Or choose from team tokens"
              selectedUrl={form.watch('logoUrl') ?? ''}
              onSelect={(url) => {
                form.setValue('logoUrl', url, { shouldValidate: true, shouldDirty: true });
              }}
            />
          </div>
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

export function TeamTemplatesPage() {
  const [selectedCampTypeId, setSelectedCampTypeId] = useState<string>('');
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(
    null,
  );
  const campTypesQuery = useCampTypesQuery();
  const teamTemplatesQuery = useTeamTemplatesQuery(selectedCampTypeId || undefined);
  const { createMutation, updateMutation, deleteMutation } = useTeamTemplateMutations();

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const campTypeNameById = useMemo(() => {
    const entries = (campTypesQuery.data ?? []).map((campType) => [campType.id, campType.name] as const);
    return new Map(entries);
  }, [campTypesQuery.data]);

  async function handleCreate(payload: TeamTemplateInput): Promise<void> {
    try {
      await createMutation.mutateAsync(payload);
      setFeedback({ kind: 'success', message: 'Team template created successfully.' });
      setFormMode(null);
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to create team template.'),
      });
    }
  }

  async function handleEdit(id: string, payload: TeamTemplateInput): Promise<void> {
    try {
      await updateMutation.mutateAsync({ id, payload });
      setFeedback({ kind: 'success', message: 'Team template updated successfully.' });
      setFormMode(null);
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to update team template.'),
      });
    }
  }

  async function handleDelete(id: string): Promise<void> {
    const shouldDelete = window.confirm('Delete this team template? This action cannot be undone.');

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      setFeedback({ kind: 'success', message: 'Team template deleted successfully.' });

      if (formMode?.kind === 'edit' && formMode.teamTemplate.id === id) {
        setFormMode(null);
      }
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to delete team template.'),
      });
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Team Templates"
        description="Browse team templates and optionally filter them by camp type."
        actions={
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setFormMode({ kind: 'create', teamTemplate: null });
            }}
            disabled={campTypesQuery.isLoading || campTypesQuery.isError}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add Team Template
          </button>
        }
      />

      <div className="flex items-center gap-2">
        <Badge tone="neutral">List</Badge>
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
            ? 'Create Team Template'
            : `Edit: ${formMode?.teamTemplate.name ?? ''}`
        }
        onClose={() => {
          setFormMode(null);
        }}
      >
        {formMode ? (
          <TeamTemplateForm
            mode={formMode}
            campTypeOptions={(campTypesQuery.data ?? []).map((campType) => ({
              id: campType.id,
              name: campType.name,
            }))}
            isCampTypesLoading={campTypesQuery.isLoading}
            isSubmitting={isMutating}
            onCancel={() => {
              setFormMode(null);
            }}
            onSubmit={async (payload) => {
              if (formMode.kind === 'create') {
                await handleCreate(payload);
                return;
              }

              await handleEdit(formMode.teamTemplate.id, payload);
            }}
          />
        ) : null}
      </ModalDrawer>

      <SectionCard title="Filter" description="Narrow templates by camp type.">
        <label htmlFor="campTypeFilter" className="mb-1 block text-sm font-medium text-slate-700">
          Camp Type
        </label>
        <select
          id="campTypeFilter"
          value={selectedCampTypeId}
          onChange={(event) => {
            setSelectedCampTypeId(event.target.value);
          }}
          disabled={campTypesQuery.isLoading || campTypesQuery.isError}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2 sm:max-w-sm"
        >
          <option value="">All camp types</option>
          {(campTypesQuery.data ?? []).map((campType) => (
            <option key={campType.id} value={campType.id}>
              {campType.name}
            </option>
          ))}
        </select>
      </SectionCard>

      {teamTemplatesQuery.isLoading ? <LoadingState label="Loading team templates..." /> : null}

      {teamTemplatesQuery.isError ? (
        <ErrorState
          message="Unable to load team templates right now."
          onRetry={() => {
            void teamTemplatesQuery.refetch();
          }}
        />
      ) : null}

      {teamTemplatesQuery.isSuccess && teamTemplatesQuery.data.length === 0 ? (
        <EmptyState
          title="No team templates found"
          description={
            selectedCampTypeId
              ? 'No templates are available for the selected camp type.'
              : 'Team templates will appear here once they are created.'
          }
          action={
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setFormMode({ kind: 'create', teamTemplate: null });
              }}
              disabled={campTypesQuery.isLoading || campTypesQuery.isError}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Create Team Template
            </button>
          }
        />
      ) : null}

      {teamTemplatesQuery.isSuccess && teamTemplatesQuery.data.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2">
          {teamTemplatesQuery.data.map((template) => (
            <SectionCard key={template.id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{template.name}</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Camp type: {campTypeNameById.get(template.campTypeId) ?? template.campTypeId}
                    </p>
                  </div>
                  <Badge tone="neutral">Sort: {template.sortOrder ?? '-'}</Badge>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setFeedback(null);
                      setFormMode({ kind: 'edit', teamTemplate: template });
                    }}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleDelete(template.id);
                    }}
                    disabled={deleteMutation.isPending}
                    className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500">Color</p>
                    {template.color ? (
                      <div className="rounded-md border border-slate-200 bg-white p-2">
                        <div className="h-10 rounded" style={{ backgroundColor: template.color }} />
                        <p className="mt-2 text-xs text-slate-600">{template.color}</p>
                      </div>
                    ) : (
                      <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-center text-xs text-slate-500">
                        No color
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500">Logo</p>
                    {template.logoUrl ? (
                      <LogoPreview src={template.logoUrl} alt={`${template.name} logo`} />
                    ) : (
                      <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-center text-xs text-slate-500">
                        No logo
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>
          ))}
        </section>
      ) : null}
    </div>
  );
}
