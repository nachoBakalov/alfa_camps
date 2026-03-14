import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { CampTeam, CreateCampTeamInput, UpdateCampTeamInput } from '../../api/camp-teams.api';
import { SectionCard } from '../../components/cards/SectionCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { AssetPicker } from '../../components/ui/AssetPicker';
import { Badge } from '../../components/ui/Badge';
import { ModalDrawer } from '../../components/ui/ModalDrawer';
import { ScopedPhotosSection } from '../photos/ScopedPhotosSection';
import { campTeamFormSchema, type CampTeamFormValues } from './camp-team-form.schema';
import { useCampTeamMutations } from './use-camp-team-mutations';
import { useCampTeamsByCampQuery } from './use-camp-teams-query';
import { ApiClientError } from '../../lib/errors';

type FormMode =
  | {
      kind: 'create';
      team: null;
    }
  | {
      kind: 'edit';
      team: CampTeam;
    }
  | null;

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

function toCreatePayload(values: CampTeamFormValues, campId: string): CreateCampTeamInput {
  return {
    campId,
    name: values.name.trim(),
    color: emptyToUndefined(values.color),
    logoUrl: emptyToUndefined(values.logoUrl),
    finalPosition: values.finalPosition ? Number(values.finalPosition) : undefined,
    isActive: values.isActive,
  };
}

function toUpdatePayload(values: CampTeamFormValues): UpdateCampTeamInput {
  return {
    name: values.name.trim(),
    color: emptyToUndefined(values.color),
    logoUrl: emptyToUndefined(values.logoUrl),
    finalPosition: values.finalPosition ? Number(values.finalPosition) : undefined,
    isActive: values.isActive,
  };
}

function TeamLogo({ src, alt }: { src: string | null; alt: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className="h-12 w-12 rounded-md border border-slate-200 object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-xs font-medium text-slate-500">
      N/A
    </div>
  );
}

function TeamForm({
  mode,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  mode: Exclude<FormMode, null>;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: CampTeamFormValues) => Promise<void>;
}) {
  const [isLogoPickerOpen, setIsLogoPickerOpen] = useState(false);
  const form = useForm<CampTeamFormValues>({
    resolver: zodResolver(campTeamFormSchema),
    defaultValues: {
      name: mode.team?.name ?? '',
      color: mode.team?.color ?? '',
      logoUrl: mode.team?.logoUrl ?? '',
      finalPosition:
        mode.team?.finalPosition !== null && mode.team?.finalPosition !== undefined
          ? `${mode.team.finalPosition}`
          : '',
      isActive: mode.team?.isActive ?? true,
    },
  });

  useEffect(() => {
    form.reset({
      name: mode.team?.name ?? '',
      color: mode.team?.color ?? '',
      logoUrl: mode.team?.logoUrl ?? '',
      finalPosition:
        mode.team?.finalPosition !== null && mode.team?.finalPosition !== undefined
          ? `${mode.team.finalPosition}`
          : '',
      isActive: mode.team?.isActive ?? true,
    });
  }, [form, mode]);

  const submitLabel = mode.kind === 'create' ? 'Създай отбор' : 'Запази промените';

  return (
    <>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          await onSubmit(values);
        })}
        noValidate
      >
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="color" className="mb-1 block text-sm font-medium text-slate-700">
              Color
            </label>
            <div className="flex items-center gap-2">
              <input
                id="colorPicker"
                type="color"
                value={form.watch('color') || '#0f172a'}
                onChange={(event) => {
                  form.setValue('color', event.target.value, { shouldValidate: true, shouldDirty: true });
                }}
                className="h-10 w-14 cursor-pointer rounded-md border border-slate-300 bg-white p-1"
                aria-label="Select team color"
              />
              <input
                id="color"
                placeholder="#0F172A"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
                {...form.register('color')}
              />
            </div>
            {form.formState.errors.color ? (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.color.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="finalPosition" className="mb-1 block text-sm font-medium text-slate-700">
              Final Position
            </label>
            <input
              id="finalPosition"
              inputMode="numeric"
              placeholder="1"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              {...form.register('finalPosition')}
            />
            {form.formState.errors.finalPosition ? (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.finalPosition.message}</p>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor="logoUrl" className="mb-1 block text-sm font-medium text-slate-700">
            Logo URL
          </label>
          <input
            id="logoUrl"
            placeholder="https://... or /assets/..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            {...form.register('logoUrl')}
          />
          {form.formState.errors.logoUrl ? (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.logoUrl.message}</p>
          ) : null}

          <div className="mt-3">
            <button
              type="button"
              onClick={() => {
                setIsLogoPickerOpen(true);
              }}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Choose Team Token
            </button>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            {...form.register('isActive')}
          />
          Active
        </label>

        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Отказ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Запазване...' : submitLabel}
          </button>
        </div>
      </form>

      <ModalDrawer
        open={isLogoPickerOpen}
        title="Choose Team Token"
        onClose={() => {
          setIsLogoPickerOpen(false);
        }}
      >
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <AssetPicker
            manifest="team-tokens"
            title="Select a team token"
            selectedUrl={form.watch('logoUrl') ?? ''}
            onSelect={(url) => {
              form.setValue('logoUrl', url, { shouldValidate: true, shouldDirty: true });
              setIsLogoPickerOpen(false);
            }}
          />
        </div>
      </ModalDrawer>
    </>
  );
}

export function CampTeamsTab({ campId }: { campId: string }) {
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [photosTeam, setPhotosTeam] = useState<CampTeam | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(
    null,
  );

  const teamsQuery = useCampTeamsByCampQuery(campId);
  const { createMutation, updateMutation, deleteMutation, cloneFromTemplatesMutation } =
    useCampTeamMutations(campId);

  const isMutating = useMemo(
    () =>
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      cloneFromTemplatesMutation.isPending,
    [
      createMutation.isPending,
      updateMutation.isPending,
      deleteMutation.isPending,
      cloneFromTemplatesMutation.isPending,
    ],
  );

  async function handleCreate(values: CampTeamFormValues): Promise<void> {
    try {
      await createMutation.mutateAsync(toCreatePayload(values, campId));
      setFeedback({ kind: 'success', message: 'Camp team created successfully.' });
      setFormMode(null);
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to create camp team.'),
      });
    }
  }

  async function handleUpdate(id: string, values: CampTeamFormValues): Promise<void> {
    try {
      await updateMutation.mutateAsync({ id, payload: toUpdatePayload(values) });
      setFeedback({ kind: 'success', message: 'Camp team updated successfully.' });
      setFormMode(null);
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to update camp team.'),
      });
    }
  }

  async function handleDelete(id: string): Promise<void> {
    const shouldDelete = window.confirm('Delete this team? This action cannot be undone.');

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      setFeedback({ kind: 'success', message: 'Camp team deleted successfully.' });

      if (formMode?.kind === 'edit' && formMode.team.id === id) {
        setFormMode(null);
      }
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to delete camp team.'),
      });
    }
  }

  async function handleCloneFromTemplates(): Promise<void> {
    try {
      const result = await cloneFromTemplatesMutation.mutateAsync(campId);
      setFeedback({
        kind: 'success',
        message:
          result.length > 0
            ? `Cloned ${result.length} team template${result.length > 1 ? 's' : ''}.`
            : 'No new teams were cloned from templates.',
      });
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to clone teams from templates.'),
      });
    }
  }

  return (
    <div className="space-y-4">
      <SectionCard>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Отбори в лагера</h3>
            <p className="text-sm text-slate-600">Manage teams for this camp and clone from camp type templates.</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                void handleCloneFromTemplates();
              }}
              disabled={isMutating}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cloneFromTemplatesMutation.isPending ? 'Копиране...' : 'Копирай от шаблон'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setFormMode({ kind: 'create', team: null });
              }}
              disabled={isMutating}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Добави отбор
            </button>
          </div>
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
        title={formMode?.kind === 'create' ? 'Създай отбор в лагера' : `Редактирай: ${formMode?.team.name ?? ''}`}
        onClose={() => {
          setFormMode(null);
        }}
      >
        {formMode ? (
          <TeamForm
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

              await handleUpdate(formMode.team.id, values);
            }}
          />
        ) : null}
      </ModalDrawer>

      <ModalDrawer
        open={Boolean(photosTeam)}
        title={photosTeam ? `Снимки: ${photosTeam.name}` : 'Снимки'}
        onClose={() => {
          setPhotosTeam(null);
        }}
      >
        {photosTeam ? (
          <ScopedPhotosSection
            scopeType="team"
            scopeId={photosTeam.id}
            relatedCampId={campId}
            title="Качване на снимки"
            description="Добави снимки към този отбор. Изображенията се оптимизират автоматично преди качване."
            galleryTitle="Галерия на отбора"
            galleryDescription="Всички качени снимки за избрания отбор."
          />
        ) : null}
      </ModalDrawer>

      {teamsQuery.isLoading ? <LoadingState label="Loading camp teams..." /> : null}

      {teamsQuery.isError ? (
        <ErrorState
          message="Unable to load camp teams right now."
          onRetry={() => {
            void teamsQuery.refetch();
          }}
        />
      ) : null}

      {teamsQuery.isSuccess && teamsQuery.data.length === 0 ? (
        <EmptyState
          title="No camp teams yet"
          description="Add a team manually or clone from templates to get started."
        />
      ) : null}

      {teamsQuery.isSuccess && teamsQuery.data.length > 0 ? (
        <section className="grid gap-3 sm:grid-cols-2">
          {teamsQuery.data.map((team) => (
            <SectionCard key={team.id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <TeamLogo src={team.logoUrl} alt={`${team.name} logo`} />
                    <div>
                      <h4 className="text-base font-semibold text-slate-900">{team.name}</h4>
                      <p className="text-xs text-slate-600">ID: {team.id}</p>
                    </div>
                  </div>
                  <Badge tone={team.isActive ? 'success' : 'danger'}>
                    {team.isActive ? 'Активен' : 'Неактивен'}
                  </Badge>
                </div>

                <dl className="grid grid-cols-2 gap-2 text-sm text-slate-700">
                  <div>
                    <dt className="text-xs text-slate-500">Color</dt>
                    <dd className="mt-1 flex items-center gap-2">
                      <span
                        className="inline-block h-4 w-4 rounded border border-slate-300"
                        style={{ backgroundColor: team.color || '#ffffff' }}
                        aria-hidden="true"
                      />
                      {team.color || 'Not set'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Точки</dt>
                    <dd className="mt-1">{team.teamPoints}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Final Position</dt>
                    <dd className="mt-1">{team.finalPosition ?? 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Logo</dt>
                    <dd className="mt-1 truncate">{team.logoUrl || 'Not set'}</dd>
                  </div>
                </dl>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setPhotosTeam(team);
                    }}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Снимки
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFeedback(null);
                      setFormMode({ kind: 'edit', team });
                    }}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Редактирай
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleDelete(team.id);
                    }}
                    disabled={isMutating}
                    className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Изтрий
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
