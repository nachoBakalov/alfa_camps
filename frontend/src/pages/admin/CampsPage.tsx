import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Camp, CampInput, CampStatus } from '../../api/camps.api';
import { Badge } from '../../components/ui/Badge';
import { SectionCard } from '../../components/cards/SectionCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { PageHeader } from '../../components/layout/PageHeader';
import { useCampTypesQuery } from '../../features/camp-types/use-camp-types-query';
import { campFormSchema, type CampFormValues } from '../../features/camps/camp-form.schema';
import { useCampMutations } from '../../features/camps/use-camp-mutations';
import { useCampsQuery } from '../../features/camps/use-camps-query';
import { ApiClientError } from '../../lib/errors';

const STATUS_OPTIONS: Array<{ value: '' | CampStatus; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'FINISHED', label: 'Finished' },
];

type FormMode =
  | {
      kind: 'create';
      camp: null;
    }
  | {
      kind: 'edit';
      camp: Camp;
    }
  | null;

const CAMP_STATUS_OPTIONS: CampStatus[] = ['DRAFT', 'ACTIVE', 'FINISHED'];

function emptyToUndefined(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function toPayload(values: CampFormValues, mode: Exclude<FormMode, null>): CampInput {
  return {
    campTypeId: values.campTypeId,
    title: values.title.trim(),
    year: Number(values.year),
    startDate: values.startDate,
    endDate: values.endDate,
    location: emptyToUndefined(values.location),
    description: emptyToUndefined(values.description),
    logoUrl: emptyToUndefined(values.logoUrl),
    coverImageUrl: emptyToUndefined(values.coverImageUrl),
    status: mode.kind === 'edit' ? values.status : undefined,
  };
}

function getMutationErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return fallback;
}

function CampImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="h-28 w-full rounded-md border border-slate-200 object-cover"
      loading="lazy"
    />
  );
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${startDate} - ${endDate}`;
  }

  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
}

function CampForm({
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
  onSubmit: (payload: CampInput) => Promise<void>;
}) {
  const form = useForm<CampFormValues>({
    resolver: zodResolver(campFormSchema),
    defaultValues: {
      campTypeId: mode.camp?.campTypeId ?? '',
      title: mode.camp?.title ?? '',
      year: mode.camp?.year?.toString() ?? `${new Date().getFullYear()}`,
      startDate: mode.camp?.startDate ?? '',
      endDate: mode.camp?.endDate ?? '',
      location: mode.camp?.location ?? '',
      description: mode.camp?.description ?? '',
      logoUrl: mode.camp?.logoUrl ?? '',
      coverImageUrl: mode.camp?.coverImageUrl ?? '',
      status: mode.camp?.status,
    },
  });

  useEffect(() => {
    form.reset({
      campTypeId: mode.camp?.campTypeId ?? '',
      title: mode.camp?.title ?? '',
      year: mode.camp?.year?.toString() ?? `${new Date().getFullYear()}`,
      startDate: mode.camp?.startDate ?? '',
      endDate: mode.camp?.endDate ?? '',
      location: mode.camp?.location ?? '',
      description: mode.camp?.description ?? '',
      logoUrl: mode.camp?.logoUrl ?? '',
      coverImageUrl: mode.camp?.coverImageUrl ?? '',
      status: mode.camp?.status,
    });
  }, [form, mode]);

  const submitLabel = mode.kind === 'create' ? 'Create Camp' : 'Save Changes';

  return (
    <SectionCard
      title={mode.kind === 'create' ? 'Create Camp' : `Edit: ${mode.camp.title}`}
      description="Fill in the core camp information."
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          await onSubmit(toPayload(values, mode));
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

          <div>
            <label htmlFor="year" className="mb-1 block text-sm font-medium text-slate-700">
              Year
            </label>
            <input
              id="year"
              inputMode="numeric"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              {...form.register('year')}
            />
            {form.formState.errors.year ? (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.year.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="mb-1 block text-sm font-medium text-slate-700">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              {...form.register('startDate')}
            />
            {form.formState.errors.startDate ? (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.startDate.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="endDate" className="mb-1 block text-sm font-medium text-slate-700">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              {...form.register('endDate')}
            />
            {form.formState.errors.endDate ? (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.endDate.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="location" className="mb-1 block text-sm font-medium text-slate-700">
              Location
            </label>
            <input
              id="location"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              {...form.register('location')}
            />
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
              {CAMP_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
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
    </SectionCard>
  );
}

export function CampsPage() {
  const [selectedStatus, setSelectedStatus] = useState<'' | CampStatus>('');
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(
    null,
  );
  const campsQuery = useCampsQuery();
  const campTypesQuery = useCampTypesQuery();
  const { createMutation, updateMutation, deleteMutation } = useCampMutations();

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const campTypeNameById = useMemo(() => {
    const map = new Map<string, string>();

    for (const campType of campTypesQuery.data ?? []) {
      map.set(campType.id, campType.name);
    }

    return map;
  }, [campTypesQuery.data]);

  const filteredCamps = useMemo(() => {
    const camps = campsQuery.data ?? [];

    if (!selectedStatus) {
      return camps;
    }

    return camps.filter((camp) => camp.status === selectedStatus);
  }, [campsQuery.data, selectedStatus]);

  async function handleCreate(payload: CampInput): Promise<void> {
    try {
      await createMutation.mutateAsync(payload);
      setFeedback({ kind: 'success', message: 'Camp created successfully.' });
      setFormMode(null);
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to create camp.'),
      });
    }
  }

  async function handleEdit(id: string, payload: CampInput): Promise<void> {
    try {
      await updateMutation.mutateAsync({ id, payload });
      setFeedback({ kind: 'success', message: 'Camp updated successfully.' });
      setFormMode(null);
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to update camp.'),
      });
    }
  }

  async function handleDelete(id: string): Promise<void> {
    const shouldDelete = window.confirm('Delete this camp? This action cannot be undone.');

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      setFeedback({ kind: 'success', message: 'Camp deleted successfully.' });

      if (formMode?.kind === 'edit' && formMode.camp.id === id) {
        setFormMode(null);
      }
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to delete camp.'),
      });
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Camps"
        description="Browse camps and monitor their current status."
        actions={
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setFormMode({ kind: 'create', camp: null });
            }}
            disabled={campTypesQuery.isLoading || campTypesQuery.isError}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add Camp
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
        <CampForm
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

            await handleEdit(formMode.camp.id, payload);
          }}
        />
      ) : null}

      <SectionCard title="Filter" description="Optionally filter camps by status.">
        <label htmlFor="statusFilter" className="mb-1 block text-sm font-medium text-slate-700">
          Status
        </label>
        <select
          id="statusFilter"
          value={selectedStatus}
          onChange={(event) => {
            setSelectedStatus(event.target.value as '' | CampStatus);
          }}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2 sm:max-w-sm"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </SectionCard>

      {campsQuery.isLoading ? <LoadingState label="Loading camps..." /> : null}

      {campsQuery.isError ? (
        <ErrorState
          message="Unable to load camps right now."
          onRetry={() => {
            void campsQuery.refetch();
          }}
        />
      ) : null}

      {campsQuery.isSuccess && filteredCamps.length === 0 ? (
        <EmptyState
          title="No camps found"
          description={
            selectedStatus
              ? 'No camps match the selected status.'
              : 'Camps will appear here once they are created.'
          }
          action={
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setFormMode({ kind: 'create', camp: null });
              }}
              disabled={campTypesQuery.isLoading || campTypesQuery.isError}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Create Camp
            </button>
          }
        />
      ) : null}

      {campsQuery.isSuccess && filteredCamps.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2">
          {filteredCamps.map((camp) => {
            const previewImage = camp.coverImageUrl || camp.logoUrl;

            return (
              <SectionCard key={camp.id}>
                <div className="space-y-3">
                  {previewImage ? <CampImage src={previewImage} alt={`${camp.title} preview`} /> : null}

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{camp.title}</h2>
                      <p className="mt-1 text-sm text-slate-600">Year: {camp.year}</p>
                    </div>
                    <Badge tone={camp.status === 'ACTIVE' ? 'success' : camp.status === 'FINISHED' ? 'warning' : 'neutral'}>
                      {camp.status}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setFeedback(null);
                        setFormMode({ kind: 'edit', camp });
                      }}
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void handleDelete(camp.id);
                      }}
                      disabled={deleteMutation.isPending}
                      className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="space-y-1 text-sm text-slate-600">
                    <p>Camp type: {campTypeNameById.get(camp.campTypeId) ?? camp.campTypeId}</p>
                    <p>Location: {camp.location || 'Not specified'}</p>
                    <p>Date range: {formatDateRange(camp.startDate, camp.endDate)}</p>
                  </div>
                </div>
              </SectionCard>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}
