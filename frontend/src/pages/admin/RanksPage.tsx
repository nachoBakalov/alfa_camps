import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type {
  RankCategory,
  RankCategoryInput,
  RankDefinition,
  RankDefinitionInput,
  UpdateRankDefinitionInput,
} from '../../api/ranks.api';
import { SectionCard } from '../../components/cards/SectionCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { PageHeader } from '../../components/layout/PageHeader';
import { AssetPicker } from '../../components/ui/AssetPicker';
import { Badge } from '../../components/ui/Badge';
import { ModalDrawer } from '../../components/ui/ModalDrawer';
import { rankCategoryFormSchema, type RankCategoryFormValues } from '../../features/ranks/rank-category-form.schema';
import {
  rankDefinitionFormSchema,
  type RankDefinitionFormValues,
} from '../../features/ranks/rank-definition-form.schema';
import { useRankMutations } from '../../features/ranks/use-rank-mutations';
import { useRankCategoriesQuery, useRankDefinitionsQuery } from '../../features/ranks/use-ranks-query';
import { ApiClientError } from '../../lib/errors';

type CategoryFormMode =
  | {
      kind: 'create';
      category: null;
    }
  | {
      kind: 'edit';
      category: RankCategory;
    }
  | null;

type DefinitionFormMode =
  | {
      kind: 'create';
      definition: null;
      categoryId?: string;
    }
  | {
      kind: 'edit';
      definition: RankDefinition;
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

function getQueryErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return 'Unable to load rank data right now.';
}

function RankIconPreview({ iconUrl }: { iconUrl?: string | null }) {
  if (!iconUrl) {
    return <p className="text-xs text-slate-500">No icon selected</p>;
  }

  return (
    <img
      src={iconUrl}
      alt="Rank icon preview"
      className="h-12 w-12 rounded-md border border-slate-200 object-cover"
      loading="lazy"
    />
  );
}

function toRankManifestCategory(categoryCode?: string): string | undefined {
  if (!categoryCode) {
    return undefined;
  }

  const normalized = categoryCode.trim().toUpperCase();

  if (normalized === 'KILLS_RANK') {
    return 'kills';
  }

  if (normalized === 'MASS_BATTLE_WINS_RANK') {
    return 'mass_battles';
  }

  if (normalized === 'CHALLENGE_WINS_RANK') {
    return 'challenges';
  }

  if (normalized === 'SURVIVALS_RANK') {
    return 'survive';
  }

  if (normalized.includes('KILL')) {
    return 'kills';
  }

  if (normalized.includes('MASS_BATTLE')) {
    return 'mass_battles';
  }

  if (normalized.includes('CHALLENGE') || normalized.includes('DUEL')) {
    return 'challenges';
  }

  if (normalized.includes('SURVIV')) {
    return 'survive';
  }

  return undefined;
}

function toCategoryPayload(values: RankCategoryFormValues): RankCategoryInput {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
  };
}

function toCreateDefinitionPayload(values: RankDefinitionFormValues): RankDefinitionInput {
  return {
    categoryId: values.categoryId,
    name: emptyToUndefined(values.name),
    iconUrl: emptyToUndefined(values.iconUrl),
    threshold: Number(values.threshold),
    rankOrder: Number(values.rankOrder),
  };
}

function toUpdateDefinitionPayload(values: RankDefinitionFormValues): UpdateRankDefinitionInput {
  return {
    name: emptyToUndefined(values.name),
    iconUrl: emptyToUndefined(values.iconUrl),
    threshold: Number(values.threshold),
    rankOrder: Number(values.rankOrder),
  };
}

function RankCategoryForm({
  mode,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  mode: Exclude<CategoryFormMode, null>;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: RankCategoryInput) => Promise<void>;
}) {
  const form = useForm<RankCategoryFormValues>({
    resolver: zodResolver(rankCategoryFormSchema),
    defaultValues: {
      code: mode.category?.code ?? '',
      name: mode.category?.name ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      code: mode.category?.code ?? '',
      name: mode.category?.name ?? '',
    });
  }, [form, mode]);

  const submitLabel = mode.kind === 'create' ? 'Create Category' : 'Запази промените';

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(toCategoryPayload(values));
      })}
      noValidate
    >
      <div>
        <label htmlFor="categoryCode" className="mb-1 block text-sm font-medium text-slate-700">
          Code
        </label>
        <input
          id="categoryCode"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
          {...form.register('code')}
        />
        {form.formState.errors.code ? (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.code.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="categoryName" className="mb-1 block text-sm font-medium text-slate-700">
          Name
        </label>
        <input
          id="categoryName"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
          {...form.register('name')}
        />
        {form.formState.errors.name ? (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
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
          {isSubmitting ? 'Запазване...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function RankDefinitionForm({
  mode,
  categories,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  mode: Exclude<DefinitionFormMode, null>;
  categories: RankCategory[];
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: RankDefinitionFormValues) => Promise<void>;
}) {
  const [showIconPicker, setShowIconPicker] = useState(false);

  const form = useForm<RankDefinitionFormValues>({
    resolver: zodResolver(rankDefinitionFormSchema),
    defaultValues: {
      categoryId: mode.kind === 'create' ? mode.categoryId ?? '' : mode.definition.categoryId,
      name: mode.kind === 'create' ? '' : mode.definition.name ?? '',
      iconUrl: mode.kind === 'create' ? '' : mode.definition.iconUrl ?? '',
      threshold: mode.kind === 'create' ? '0' : String(mode.definition.threshold),
      rankOrder: mode.kind === 'create' ? '0' : String(mode.definition.rankOrder),
    },
  });

  useEffect(() => {
    form.reset({
      categoryId: mode.kind === 'create' ? mode.categoryId ?? '' : mode.definition.categoryId,
      name: mode.kind === 'create' ? '' : mode.definition.name ?? '',
      iconUrl: mode.kind === 'create' ? '' : mode.definition.iconUrl ?? '',
      threshold: mode.kind === 'create' ? '0' : String(mode.definition.threshold),
      rankOrder: mode.kind === 'create' ? '0' : String(mode.definition.rankOrder),
    });
  }, [form, mode]);

  const selectedCategoryId = form.watch('categoryId');
  const selectedCategoryCode = categories.find((category) => category.id === selectedCategoryId)?.code;
  const pickerCategory = toRankManifestCategory(selectedCategoryCode);

  const submitLabel = mode.kind === 'create' ? 'Create Definition' : 'Запази промените';

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
      noValidate
    >
      <div>
        <label htmlFor="definitionCategory" className="mb-1 block text-sm font-medium text-slate-700">
          Category
        </label>
        <select
          id="definitionCategory"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
          {...form.register('categoryId')}
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name} ({category.code})
            </option>
          ))}
        </select>
        {form.formState.errors.categoryId ? (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.categoryId.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="definitionName" className="mb-1 block text-sm font-medium text-slate-700">
          Name
        </label>
        <input
          id="definitionName"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
          {...form.register('name')}
        />
        {form.formState.errors.name ? (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

      <div>
        <p className="mb-1 block text-sm font-medium text-slate-700">Текуща икона</p>
        <RankIconPreview iconUrl={form.watch('iconUrl')} />
      </div>

      <div>
        <label htmlFor="definitionIconUrl" className="mb-1 block text-sm font-medium text-slate-700">
          Icon URL
        </label>
        <input
          id="definitionIconUrl"
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
          {showIconPicker ? 'Скрий избор на икона' : 'Избери икона'}
        </button>

        {showIconPicker ? (
          <div className="mt-3">
            <AssetPicker
              manifest="ranks"
              title="Choose Rank Icon"
              filterCategory={pickerCategory}
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
          <label htmlFor="definitionThreshold" className="mb-1 block text-sm font-medium text-slate-700">
            Threshold
          </label>
          <input
            id="definitionThreshold"
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

        <div>
          <label htmlFor="definitionRankOrder" className="mb-1 block text-sm font-medium text-slate-700">
            Rank Order
          </label>
          <input
            id="definitionRankOrder"
            type="number"
            inputMode="numeric"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            {...form.register('rankOrder')}
          />
          {form.formState.errors.rankOrder ? (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.rankOrder.message}</p>
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
          {isSubmitting ? 'Запазване...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export function RanksPage() {
  const categoriesQuery = useRankCategoriesQuery();
  const definitionsQuery = useRankDefinitionsQuery();
  const {
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
    createDefinitionMutation,
    updateDefinitionMutation,
    deleteDefinitionMutation,
  } = useRankMutations();

  const [categoryFormMode, setCategoryFormMode] = useState<CategoryFormMode>(null);
  const [definitionFormMode, setDefinitionFormMode] = useState<DefinitionFormMode>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const categories = categoriesQuery.data ?? [];
  const definitions = definitionsQuery.data ?? [];

  const groupedDefinitions = useMemo(() => {
    const groups = new Map<string, RankDefinition[]>();

    for (const category of categories) {
      groups.set(category.id, []);
    }

    for (const definition of definitions) {
      const existing = groups.get(definition.categoryId) ?? [];
      existing.push(definition);
      groups.set(definition.categoryId, existing);
    }

    for (const list of groups.values()) {
      list.sort((a, b) => a.rankOrder - b.rankOrder || a.threshold - b.threshold);
    }

    return groups;
  }, [categories, definitions]);

  const isMutating =
    createCategoryMutation.isPending ||
    updateCategoryMutation.isPending ||
    deleteCategoryMutation.isPending ||
    createDefinitionMutation.isPending ||
    updateDefinitionMutation.isPending ||
    deleteDefinitionMutation.isPending;

  async function handleCreateCategory(payload: RankCategoryInput): Promise<void> {
    try {
      await createCategoryMutation.mutateAsync(payload);
      setFeedback({ kind: 'success', message: 'Rank category created successfully.' });
      setCategoryFormMode(null);
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to create rank category.'),
      });
    }
  }

  async function handleUpdateCategory(id: string, payload: RankCategoryInput): Promise<void> {
    try {
      await updateCategoryMutation.mutateAsync({ id, payload });
      setFeedback({ kind: 'success', message: 'Rank category updated successfully.' });
      setCategoryFormMode(null);
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to update rank category.'),
      });
    }
  }

  async function handleDeleteCategory(id: string): Promise<void> {
    const shouldDelete = window.confirm('Delete this rank category? This action cannot be undone.');

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteCategoryMutation.mutateAsync(id);
      setFeedback({ kind: 'success', message: 'Rank category deleted successfully.' });

      if (categoryFormMode?.kind === 'edit' && categoryFormMode.category.id === id) {
        setCategoryFormMode(null);
      }
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to delete rank category.'),
      });
    }
  }

  async function handleCreateDefinition(values: RankDefinitionFormValues): Promise<void> {
    try {
      await createDefinitionMutation.mutateAsync(toCreateDefinitionPayload(values));
      setFeedback({ kind: 'success', message: 'Rank definition created successfully.' });
      setDefinitionFormMode(null);
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to create rank definition.'),
      });
    }
  }

  async function handleUpdateDefinition(id: string, values: RankDefinitionFormValues): Promise<void> {
    try {
      await updateDefinitionMutation.mutateAsync({ id, payload: toUpdateDefinitionPayload(values) });
      setFeedback({ kind: 'success', message: 'Rank definition updated successfully.' });
      setDefinitionFormMode(null);
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to update rank definition.'),
      });
    }
  }

  async function handleDeleteDefinition(id: string): Promise<void> {
    const shouldDelete = window.confirm('Delete this rank definition? This action cannot be undone.');

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteDefinitionMutation.mutateAsync(id);
      setFeedback({ kind: 'success', message: 'Rank definition deleted successfully.' });

      if (definitionFormMode?.kind === 'edit' && definitionFormMode.definition.id === id) {
        setDefinitionFormMode(null);
      }
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to delete rank definition.'),
      });
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Ranks"
        description="Manage rank categories and rank definitions used for progression."
        actions={
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setCategoryFormMode({ kind: 'create', category: null });
              }}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Add Category
            </button>
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setDefinitionFormMode({ kind: 'create', definition: null });
              }}
              disabled={categories.length === 0}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add Definition
            </button>
          </div>
        }
      />

      <div className="flex items-center gap-2">
        <Badge tone="neutral">Progression</Badge>
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
        open={Boolean(categoryFormMode)}
        title={
          categoryFormMode?.kind === 'create'
            ? 'Създай категория ранг'
            : `Edit Category: ${categoryFormMode?.category.name ?? ''}`
        }
        onClose={() => {
          setCategoryFormMode(null);
        }}
      >
        {categoryFormMode ? (
          <RankCategoryForm
            mode={categoryFormMode}
            isSubmitting={isMutating}
            onCancel={() => {
              setCategoryFormMode(null);
            }}
            onSubmit={async (payload) => {
              if (categoryFormMode.kind === 'create') {
                await handleCreateCategory(payload);
                return;
              }

              await handleUpdateCategory(categoryFormMode.category.id, payload);
            }}
          />
        ) : null}
      </ModalDrawer>

      <ModalDrawer
        open={Boolean(definitionFormMode)}
        title={
          definitionFormMode?.kind === 'create'
            ? 'Създай дефиниция на ранг'
            : `Edit Definition: ${definitionFormMode?.definition.name ?? 'Unnamed'}`
        }
        onClose={() => {
          setDefinitionFormMode(null);
        }}
      >
        {definitionFormMode ? (
          <RankDefinitionForm
            mode={definitionFormMode}
            categories={categories}
            isSubmitting={isMutating}
            onCancel={() => {
              setDefinitionFormMode(null);
            }}
            onSubmit={async (values) => {
              if (definitionFormMode.kind === 'create') {
                await handleCreateDefinition(values);
                return;
              }

              await handleUpdateDefinition(definitionFormMode.definition.id, values);
            }}
          />
        ) : null}
      </ModalDrawer>

      <SectionCard title="Rank Categories" description="Define category code and display name.">
        {categoriesQuery.isLoading ? <LoadingState label="Loading rank categories..." /> : null}

        {categoriesQuery.isError ? (
          <ErrorState
            message={getQueryErrorMessage(categoriesQuery.error)}
            onRetry={() => {
              void categoriesQuery.refetch();
            }}
          />
        ) : null}

        {categoriesQuery.isSuccess && categories.length === 0 ? (
          <EmptyState
            title="No rank categories"
            description="Create the first category to start defining progression ranks."
          />
        ) : null}

        {categoriesQuery.isSuccess && categories.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <div key={category.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Code</p>
                  <p className="text-sm font-semibold text-slate-900">{category.code}</p>
                  <p className="pt-1 text-xs uppercase tracking-wide text-slate-500">Име</p>
                  <p className="text-sm text-slate-800">{category.name}</p>
                </div>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setFeedback(null);
                      setCategoryFormMode({ kind: 'edit', category });
                    }}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleDeleteCategory(category.id);
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

      <SectionCard title="Rank Definitions" description="Definitions grouped by category.">
        {definitionsQuery.isLoading ? <LoadingState label="Loading rank definitions..." /> : null}

        {definitionsQuery.isError ? (
          <ErrorState
            message={getQueryErrorMessage(definitionsQuery.error)}
            onRetry={() => {
              void definitionsQuery.refetch();
            }}
          />
        ) : null}

        {definitionsQuery.isSuccess && categories.length === 0 ? (
          <EmptyState
            title="No categories available"
            description="Create at least one rank category before adding definitions."
          />
        ) : null}

        {definitionsQuery.isSuccess && categories.length > 0 ? (
          <div className="space-y-4">
            {categories.map((category) => {
              const categoryDefinitions = groupedDefinitions.get(category.id) ?? [];

              return (
                <div key={category.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{category.name}</h3>
                      <p className="text-xs uppercase tracking-wide text-slate-500">{category.code}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFeedback(null);
                        setDefinitionFormMode({ kind: 'create', definition: null, categoryId: category.id });
                      }}
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Add Definition
                    </button>
                  </div>

                  {categoryDefinitions.length === 0 ? (
                    <EmptyState
                      title="No definitions"
                      description="Add definitions for this category to define thresholds."
                    />
                  ) : (
                    <div className="space-y-3">
                      {categoryDefinitions.map((definition) => (
                        <div key={definition.id} className="rounded-md border border-slate-200 p-3">
                          <div className="space-y-1 text-sm text-slate-700">
                            <p>
                              <span className="font-medium text-slate-900">Category:</span> {category.name}
                            </p>
                            <p>
                              <span className="font-medium text-slate-900">Name:</span>{' '}
                              {definition.name || 'Not set'}
                            </p>
                            <p className="break-all">
                              <span className="font-medium text-slate-900">Icon:</span>
                            </p>
                            <div className="flex items-center gap-3 rounded-md border border-slate-200 p-2">
                              <RankIconPreview iconUrl={definition.iconUrl} />
                              <p className="break-all text-xs text-slate-500">{definition.iconUrl || 'Not set'}</p>
                            </div>
                            <p>
                              <span className="font-medium text-slate-900">Threshold:</span>{' '}
                              {definition.threshold}
                            </p>
                            <p>
                              <span className="font-medium text-slate-900">Rank Order:</span>{' '}
                              {definition.rankOrder}
                            </p>
                          </div>

                          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setFeedback(null);
                                setDefinitionFormMode({ kind: 'edit', definition });
                              }}
                              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                void handleDeleteDefinition(definition.id);
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
