import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type {
  MedalDefinition,
  MedalDefinitionInput,
  MedalType,
  UpdateMedalDefinitionInput,
} from '../../api/medals.api';
import { SectionCard } from '../../components/cards/SectionCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { PageHeader } from '../../components/layout/PageHeader';
import { AssetPicker } from '../../components/ui/AssetPicker';
import { Badge } from '../../components/ui/Badge';
import { ModalDrawer } from '../../components/ui/ModalDrawer';
import {
  medalDefinitionFormSchema,
  type MedalDefinitionFormValues,
} from '../../features/medals/medal-definition-form.schema';
import { useMedalMutations } from '../../features/medals/use-medal-mutations';
import { useMedalDefinitionsQuery } from '../../features/medals/use-medals-query';
import { ApiClientError } from '../../lib/errors';

type FormMode =
  | {
      kind: 'create';
      medal: null;
    }
  | {
      kind: 'edit';
      medal: MedalDefinition;
    }
  | null;

const MEDAL_TYPES: MedalType[] = ['MANUAL', 'AUTO'];

function getTypeLabel(type: MedalType): string {
  return type === 'AUTO' ? 'AUTO' : 'MANUAL';
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

  return 'Unable to load medal definitions right now.';
}

function MedalIconPreview({ iconUrl }: { iconUrl?: string | null }) {
  if (!iconUrl) {
    return <p className="text-xs text-slate-500">No icon selected</p>;
  }

  return (
    <img
      src={iconUrl}
      alt="Medal icon preview"
      className="h-12 w-12 rounded-md border border-slate-200 object-cover"
      loading="lazy"
    />
  );
}

function toCreatePayload(values: MedalDefinitionFormValues): MedalDefinitionInput {
  return {
    name: values.name.trim(),
    description: emptyToUndefined(values.description),
    iconUrl: emptyToUndefined(values.iconUrl),
    type: values.type,
  };
}

function toUpdatePayload(values: MedalDefinitionFormValues): UpdateMedalDefinitionInput {
  return {
    name: values.name.trim(),
    description: emptyToUndefined(values.description),
    iconUrl: emptyToUndefined(values.iconUrl),
    type: values.type,
  };
}

function MedalDefinitionForm({
  mode,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  mode: Exclude<FormMode, null>;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: MedalDefinitionFormValues) => Promise<void>;
}) {
  const [showIconPicker, setShowIconPicker] = useState(false);

  const form = useForm<MedalDefinitionFormValues>({
    resolver: zodResolver(medalDefinitionFormSchema),
    defaultValues: {
      name: mode.kind === 'create' ? '' : mode.medal.name,
      description: mode.kind === 'create' ? '' : mode.medal.description ?? '',
      iconUrl: mode.kind === 'create' ? '' : mode.medal.iconUrl ?? '',
      type: mode.kind === 'create' ? 'MANUAL' : mode.medal.type,
    },
  });

  useEffect(() => {
    form.reset({
      name: mode.kind === 'create' ? '' : mode.medal.name,
      description: mode.kind === 'create' ? '' : mode.medal.description ?? '',
      iconUrl: mode.kind === 'create' ? '' : mode.medal.iconUrl ?? '',
      type: mode.kind === 'create' ? 'MANUAL' : mode.medal.type,
    });
  }, [form, mode]);

  const submitLabel = mode.kind === 'create' ? 'Create Medal' : 'Save Changes';

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
      noValidate
    >
      <div>
        <label htmlFor="medalName" className="mb-1 block text-sm font-medium text-slate-700">
          Name
        </label>
        <input
          id="medalName"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
          {...form.register('name')}
        />
        {form.formState.errors.name ? (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="medalDescription" className="mb-1 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="medalDescription"
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
        <MedalIconPreview iconUrl={form.watch('iconUrl')} />
      </div>

      <div>
        <label htmlFor="medalIconUrl" className="mb-1 block text-sm font-medium text-slate-700">
          Icon URL
        </label>
        <input
          id="medalIconUrl"
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
              manifest="medals"
              title="Choose Medal Icon"
              selectedUrl={form.watch('iconUrl') ?? ''}
              onSelect={(url) => {
                form.setValue('iconUrl', url, { shouldValidate: true, shouldDirty: true });
              }}
            />
          </div>
        ) : null}
      </div>

      <div>
        <label htmlFor="medalType" className="mb-1 block text-sm font-medium text-slate-700">
          Type
        </label>
        <select
          id="medalType"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
          {...form.register('type')}
        >
          {MEDAL_TYPES.map((type) => (
            <option key={type} value={type}>
              {getTypeLabel(type)}
            </option>
          ))}
        </select>
        {form.formState.errors.type ? (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.type.message}</p>
        ) : null}
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

export function MedalsPage() {
  const medalsQuery = useMedalDefinitionsQuery();
  const { createMutation, updateMutation, deleteMutation } = useMedalMutations();
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const medals = medalsQuery.data ?? [];

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  async function handleCreate(values: MedalDefinitionFormValues): Promise<void> {
    try {
      await createMutation.mutateAsync(toCreatePayload(values));
      setFeedback({ kind: 'success', message: 'Medal definition created successfully.' });
      setFormMode(null);
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to create medal definition.'),
      });
    }
  }

  async function handleEdit(id: string, values: MedalDefinitionFormValues): Promise<void> {
    try {
      await updateMutation.mutateAsync({ id, payload: toUpdatePayload(values) });
      setFeedback({ kind: 'success', message: 'Medal definition updated successfully.' });
      setFormMode(null);
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to update medal definition.'),
      });
    }
  }

  async function handleDelete(id: string): Promise<void> {
    const shouldDelete = window.confirm('Delete this medal definition? This action cannot be undone.');

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      setFeedback({ kind: 'success', message: 'Medal definition deleted successfully.' });

      if (formMode?.kind === 'edit' && formMode.medal.id === id) {
        setFormMode(null);
      }
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to delete medal definition.'),
      });
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Medal Definitions"
        description="Manage medal definitions used in the player medal award flow."
        actions={
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setFormMode({ kind: 'create', medal: null });
            }}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Add Medal
          </button>
        }
      />

      <div className="flex items-center gap-2">
        <Badge tone="neutral">Definitions</Badge>
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
            ? 'Create Medal Definition'
            : `Edit Medal: ${formMode?.medal.name ?? ''}`
        }
        onClose={() => {
          setFormMode(null);
        }}
      >
        {formMode ? (
          <MedalDefinitionForm
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

              await handleEdit(formMode.medal.id, values);
            }}
          />
        ) : null}
      </ModalDrawer>

      <SectionCard title="Medal Definitions" description="Existing medal definitions list.">
        {medalsQuery.isLoading ? <LoadingState label="Loading medal definitions..." /> : null}

        {medalsQuery.isError ? (
          <ErrorState
            message={getQueryErrorMessage(medalsQuery.error)}
            onRetry={() => {
              void medalsQuery.refetch();
            }}
          />
        ) : null}

        {medalsQuery.isSuccess && medals.length === 0 ? (
          <EmptyState
            title="No medal definitions"
            description="Create medal definitions to make award flow available."
          />
        ) : null}

        {medalsQuery.isSuccess && medals.length > 0 ? (
          <div className="space-y-3">
            {medals.map((medal) => (
              <div key={medal.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="space-y-1 text-sm text-slate-700">
                  <p>
                    <span className="font-medium text-slate-900">Name:</span> {medal.name}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Description:</span> {medal.description || 'Not set'}
                  </p>
                  <p className="break-all">
                    <span className="font-medium text-slate-900">Icon:</span>
                  </p>
                  <div className="flex items-center gap-3 rounded-md border border-slate-200 p-2">
                    <MedalIconPreview iconUrl={medal.iconUrl} />
                    <p className="break-all text-xs text-slate-500">{medal.iconUrl || 'Not set'}</p>
                  </div>
                  <p>
                    <span className="font-medium text-slate-900">Type:</span> {getTypeLabel(medal.type)}
                  </p>
                </div>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setFeedback(null);
                      setFormMode({ kind: 'edit', medal });
                    }}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleDelete(medal.id);
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
        ) : null}
      </SectionCard>
    </div>
  );
}
