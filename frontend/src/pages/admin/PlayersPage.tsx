import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import type { Player, PlayerInput } from '../../api/players.api';
import { Badge } from '../../components/ui/Badge';
import { AssetPicker } from '../../components/ui/AssetPicker';
import { ModalDrawer } from '../../components/ui/ModalDrawer';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionCard } from '../../components/cards/SectionCard';
import { playerFormSchema, type PlayerFormValues } from '../../features/players/player-form.schema';
import { usePlayerMutations } from '../../features/players/use-player-mutations';
import { usePlayersQuery } from '../../features/players/use-players-query';
import { ApiClientError } from '../../lib/errors';

type FormMode =
  | {
      kind: 'create';
      player: null;
    }
  | {
      kind: 'edit';
      player: Player;
    }
  | null;

function emptyToUndefined(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function toPayload(values: PlayerFormValues): PlayerInput {
  return {
    firstName: values.firstName.trim(),
    lastName: emptyToUndefined(values.lastName),
    nickname: emptyToUndefined(values.nickname),
    avatarUrl: emptyToUndefined(values.avatarUrl),
    isActive: values.isActive,
  };
}

function getMutationErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return fallback;
}

function PlayerAvatar({ src, fullName }: { src: string | null; fullName: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={`${fullName} avatar`}
        className="h-14 w-14 rounded-full border border-slate-200 object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-500">
      {fullName.charAt(0).toUpperCase()}
    </div>
  );
}

function PlayerForm({
  mode,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  mode: Exclude<FormMode, null>;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: PlayerInput) => Promise<void>;
}) {
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerFormSchema),
    defaultValues: {
      firstName: mode.player?.firstName ?? '',
      lastName: mode.player?.lastName ?? '',
      nickname: mode.player?.nickname ?? '',
      avatarUrl: mode.player?.avatarUrl ?? '',
      isActive: mode.player?.isActive ?? true,
    },
  });

  useEffect(() => {
    form.reset({
      firstName: mode.player?.firstName ?? '',
      lastName: mode.player?.lastName ?? '',
      nickname: mode.player?.nickname ?? '',
      avatarUrl: mode.player?.avatarUrl ?? '',
      isActive: mode.player?.isActive ?? true,
    });
  }, [form, mode]);

  const submitLabel = mode.kind === 'create' ? 'Създай играч' : 'Запази промените';

  return (
    <>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          await onSubmit(toPayload(values));
        })}
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-slate-700">
              First Name
            </label>
            <input
              id="firstName"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              {...form.register('firstName')}
            />
            {form.formState.errors.firstName ? (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.firstName.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-slate-700">
              Last Name
            </label>
            <input
              id="lastName"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              {...form.register('lastName')}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nickname" className="mb-1 block text-sm font-medium text-slate-700">
              Nickname
            </label>
            <input
              id="nickname"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              {...form.register('nickname')}
            />
          </div>

          <div>
            <label htmlFor="avatarUrl" className="mb-1 block text-sm font-medium text-slate-700">
              Avatar URL
            </label>
            <input
              id="avatarUrl"
              placeholder="https://..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              {...form.register('avatarUrl')}
            />
            {form.formState.errors.avatarUrl ? (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.avatarUrl.message}</p>
            ) : null}

            <div className="mt-3 flex items-center gap-3">
              <PlayerAvatar src={form.watch('avatarUrl') || null} fullName={form.watch('firstName') || 'Играч'} />
              <button
                type="button"
                onClick={() => {
                  setAvatarPickerOpen(true);
                }}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Choose Avatar
              </button>
            </div>
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

      <ModalDrawer
        open={avatarPickerOpen}
        title="Choose Avatar"
        onClose={() => {
          setAvatarPickerOpen(false);
        }}
      >
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <AssetPicker
            manifest="avatars"
            selectedUrl={form.watch('avatarUrl') ?? ''}
            onSelect={(url) => {
              form.setValue('avatarUrl', url, { shouldValidate: true, shouldDirty: true });
              setAvatarPickerOpen(false);
            }}
            title="Select one avatar"
          />
        </div>
      </ModalDrawer>
    </>
  );
}

export function PlayersPage() {
  const [draftSearch, setDraftSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(
    null,
  );
  const playersQuery = usePlayersQuery(appliedSearch);
  const { createMutation, updateMutation, deleteMutation } = usePlayerMutations();

  const appliedSearchLabel = useMemo(() => appliedSearch.trim(), [appliedSearch]);
  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  async function handleCreate(payload: PlayerInput): Promise<void> {
    try {
      await createMutation.mutateAsync(payload);
      setFeedback({ kind: 'success', message: 'Player created successfully.' });
      setFormMode(null);
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to create player.'),
      });
    }
  }

  async function handleEdit(id: string, payload: PlayerInput): Promise<void> {
    try {
      await updateMutation.mutateAsync({ id, payload });
      setFeedback({ kind: 'success', message: 'Player updated successfully.' });
      setFormMode(null);
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to update player.'),
      });
    }
  }

  async function handleDelete(id: string): Promise<void> {
    const shouldDelete = window.confirm('Delete this player? This action cannot be undone.');

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      setFeedback({ kind: 'success', message: 'Player deleted successfully.' });

      if (formMode?.kind === 'edit' && formMode.player.id === id) {
        setFormMode(null);
      }
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to delete player.'),
      });
    }
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearch(draftSearch.trim());
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Players"
        description="Browse players and quickly search by name or nickname."
        actions={
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setFormMode({ kind: 'create', player: null });
            }}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Add Player
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
        title={formMode?.kind === 'create' ? 'Създай играч' : `Edit: ${formMode?.player.firstName ?? ''}`}
        onClose={() => {
          setFormMode(null);
        }}
      >
        {formMode ? (
          <PlayerForm
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

              await handleEdit(formMode.player.id, payload);
            }}
          />
        ) : null}
      </ModalDrawer>

      <SectionCard title="Search" description="Use q search to filter players.">
        <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleSearchSubmit}>
          <input
            value={draftSearch}
            onChange={(event) => {
              setDraftSearch(event.target.value);
            }}
            placeholder="Search players..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2 sm:max-w-md"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftSearch('');
                setAppliedSearch('');
              }}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </form>
      </SectionCard>

      {playersQuery.isLoading ? <LoadingState label="Loading players..." /> : null}

      {playersQuery.isError ? (
        <ErrorState
          message="Unable to load players right now."
          onRetry={() => {
            void playersQuery.refetch();
          }}
        />
      ) : null}

      {playersQuery.isSuccess && playersQuery.data.length === 0 ? (
        <EmptyState
          title="No players found"
          description={
            appliedSearchLabel
              ? `No players match "${appliedSearchLabel}".`
              : 'Players will appear here once they are created.'
          }
          action={
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setFormMode({ kind: 'create', player: null });
              }}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Create Player
            </button>
          }
        />
      ) : null}

      {playersQuery.isSuccess && playersQuery.data.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2">
          {playersQuery.data.map((player) => {
            const fullName = [player.firstName, player.lastName ?? ''].join(' ').trim();

            return (
              <SectionCard key={player.id}>
                <div className="flex items-start gap-4">
                  <PlayerAvatar src={player.avatarUrl} fullName={fullName || player.firstName} />

                  <div className="min-w-0 flex-1 space-y-1">
                    <h2 className="truncate text-lg font-semibold text-slate-900">{fullName || player.firstName}</h2>
                    <p className="text-sm text-slate-600">Nickname: {player.nickname || 'N/A'}</p>
                    <div>
                      <Badge tone={player.isActive ? 'success' : 'danger'}>
                        {player.isActive ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </div>
                    <div className="pt-1">
                      <Link
                        to={`/players/${player.id}`}
                        className="text-sm font-medium text-sky-700 hover:text-sky-800"
                      >
                        Open Public Profile
                      </Link>
                    </div>
                    <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => {
                          setFeedback(null);
                          setFormMode({ kind: 'edit', player });
                        }}
                        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void handleDelete(player.id);
                        }}
                        disabled={deleteMutation.isPending}
                        className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
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
