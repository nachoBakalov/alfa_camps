import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionCard } from '../../components/cards/SectionCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Badge } from '../../components/ui/Badge';
import type { CampType, CampTypeInput } from '../../api/camp-types.api';
import { ApiClientError } from '../../lib/errors';
import {
  campTypeFormSchema,
  type CampTypeFormValues,
} from '../../features/camp-types/camp-type-form.schema';
import { useCampTypeMutations } from '../../features/camp-types/use-camp-type-mutations';
import { useCampTypesQuery } from '../../features/camp-types/use-camp-types-query';

type FormMode =
  | {
      kind: 'create';
      campType: null;
    }
  | {
      kind: 'edit';
      campType: CampType;
    }
  | null;

function emptyToUndefined(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function toPayload(values: CampTypeFormValues): CampTypeInput {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: emptyToUndefined(values.description),
    logoUrl: emptyToUndefined(values.logoUrl),
    coverImageUrl: emptyToUndefined(values.coverImageUrl),
  };
}

function getMutationErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return fallback;
}

function PreviewImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="h-24 w-full rounded-md border border-slate-200 object-cover sm:h-28"
      loading="lazy"
    />
  );
}

function CampTypeForm({
  mode,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  mode: Exclude<FormMode, null>;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: CampTypeInput) => Promise<void>;
}) {
  const form = useForm<CampTypeFormValues>({
    resolver: zodResolver(campTypeFormSchema),
    defaultValues: {
      name: mode.campType?.name ?? '',
      slug: mode.campType?.slug ?? '',
      description: mode.campType?.description ?? '',
      logoUrl: mode.campType?.logoUrl ?? '',
      coverImageUrl: mode.campType?.coverImageUrl ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      name: mode.campType?.name ?? '',
      slug: mode.campType?.slug ?? '',
      description: mode.campType?.description ?? '',
      logoUrl: mode.campType?.logoUrl ?? '',
      coverImageUrl: mode.campType?.coverImageUrl ?? '',
    });
  }, [form, mode]);

  const submitLabel = mode.kind === 'create' ? 'Create Camp Type' : 'Save Changes';

  return (
    <SectionCard
      title={mode.kind === 'create' ? 'Create Camp Type' : `Edit: ${mode.campType.name}`}
      description="Fill in basic camp type details."
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          await onSubmit(toPayload(values));
        })}
        noValidate
      >
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
            <label htmlFor="slug" className="mb-1 block text-sm font-medium text-slate-700">
              Slug
            </label>
            <input
              id="slug"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              {...form.register('slug')}
            />
            {form.formState.errors.slug ? (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.slug.message}</p>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            {...form.register('description')}
          />
          {form.formState.errors.description ? (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.description.message}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
          </div>

          <div>
            <label htmlFor="coverImageUrl" className="mb-1 block text-sm font-medium text-slate-700">
              Cover URL
            </label>
            <input
              id="coverImageUrl"
              placeholder="https://..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              {...form.register('coverImageUrl')}
            />
            {form.formState.errors.coverImageUrl ? (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.coverImageUrl.message}</p>
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
    </SectionCard>
  );
}

export function CampTypesPage() {
  const campTypesQuery = useCampTypesQuery();
  const { createMutation, updateMutation, deleteMutation } = useCampTypeMutations();
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(
    null,
  );

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  async function handleCreate(payload: CampTypeInput): Promise<void> {
    try {
      await createMutation.mutateAsync(payload);
      setFeedback({ kind: 'success', message: 'Camp type created successfully.' });
      setFormMode(null);
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to create camp type.'),
      });
    }
  }

  async function handleEdit(id: string, payload: CampTypeInput): Promise<void> {
    try {
      await updateMutation.mutateAsync({ id, payload });
      setFeedback({ kind: 'success', message: 'Camp type updated successfully.' });
      setFormMode(null);
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to update camp type.'),
      });
    }
  }

  async function handleDelete(id: string): Promise<void> {
    const shouldDelete = window.confirm('Delete this camp type? This action cannot be undone.');

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      setFeedback({ kind: 'success', message: 'Camp type deleted successfully.' });

      if (formMode?.kind === 'edit' && formMode.campType.id === id) {
        setFormMode(null);
      }
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to delete camp type.'),
      });
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Camp Types"
        description="Browse the available camp type configurations."
        actions={
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setFormMode({ kind: 'create', campType: null });
            }}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Add Camp Type
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

      {formMode ? (
        <CampTypeForm
          mode={formMode}
          isSubmitting={isMutating}
          onCancel={() => {
            setFormMode(null);
          }}
          onSubmit={async (payload) => {
            if (formMode.kind === 'create') {
              await handleCreate(payload);
              return;
            }

            await handleEdit(formMode.campType.id, payload);
          }}
        />
      ) : null}

      {campTypesQuery.isLoading ? <LoadingState label="Loading camp types..." /> : null}

      {campTypesQuery.isError ? (
        <ErrorState
          message="Unable to load camp types right now."
          onRetry={() => {
            void campTypesQuery.refetch();
          }}
        />
      ) : null}

      {campTypesQuery.isSuccess && campTypesQuery.data.length === 0 ? (
        <EmptyState
          title="No camp types found"
          description="Camp types will appear here once they are created."
          action={
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setFormMode({ kind: 'create', campType: null });
              }}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Create Camp Type
            </button>
          }
        />
      ) : null}

      {campTypesQuery.isSuccess && campTypesQuery.data.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2">
          {campTypesQuery.data.map((campType) => (
            <SectionCard key={campType.id}>
              <div className="space-y-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{campType.name}</h2>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                    {campType.slug}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setFeedback(null);
                      setFormMode({ kind: 'edit', campType });
                    }}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleDelete(campType.id);
                    }}
                    disabled={deleteMutation.isPending}
                    className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>

                <p className="text-sm text-slate-600">{campType.description || 'No description provided.'}</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500">Logo</p>
                    {campType.logoUrl ? (
                      <PreviewImage src={campType.logoUrl} alt={`${campType.name} logo`} />
                    ) : (
                      <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-center text-xs text-slate-500">
                        No logo
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500">Cover</p>
                    {campType.coverImageUrl ? (
                      <PreviewImage src={campType.coverImageUrl} alt={`${campType.name} cover`} />
                    ) : (
                      <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-center text-xs text-slate-500">
                        No cover
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
