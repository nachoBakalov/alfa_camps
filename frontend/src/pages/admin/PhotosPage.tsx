import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Camp } from '../../api/camps.api';
import type { CampTeam } from '../../api/camp-teams.api';
import type { Player } from '../../api/players.api';
import type { PhotoInput } from '../../api/photos.api';
import { SectionCard } from '../../components/cards/SectionCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { ModalDrawer } from '../../components/ui/ModalDrawer';
import { useCampTeamsByCampQuery } from '../../features/camp-teams/use-camp-teams-query';
import { useCampsQuery } from '../../features/camps/use-camps-query';
import { photoFormSchema, type PhotoFormValues } from '../../features/photos/photo-form.schema';
import { usePhotoMutations } from '../../features/photos/use-photo-mutations';
import { usePhotosQuery, type PhotoTargetType } from '../../features/photos/use-photos-query';
import { usePlayersQuery } from '../../features/players/use-players-query';
import { ApiClientError } from '../../lib/errors';

type FormMode =
  | {
      kind: 'create';
    }
  | null;

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

  return 'Unable to load photos right now.';
}

function formatCreatedAt(createdAt: string): string {
  const parsed = new Date(createdAt);

  if (Number.isNaN(parsed.getTime())) {
    return createdAt;
  }

  return parsed.toLocaleString();
}

function getPlayerLabel(player: Player): string {
  const lastName = player.lastName ? ` ${player.lastName}` : '';
  const nickname = player.nickname ? ` (${player.nickname})` : '';
  return `${player.firstName}${lastName}${nickname}`.trim();
}

function getCampLabel(camp: Camp): string {
  return `${camp.title} (${camp.year})`;
}

function getTeamLabel(team: CampTeam): string {
  return team.name;
}

function toCreatePayload(values: PhotoFormValues): PhotoInput {
  const imageUrl = values.imageUrl.trim();

  if (values.targetType === 'camp') {
    return {
      campId: values.campId?.trim(),
      imageUrl,
    };
  }

  if (values.targetType === 'team') {
    return {
      teamId: values.teamId?.trim(),
      imageUrl,
    };
  }

  return {
    playerId: values.playerId?.trim(),
    imageUrl,
  };
}

function PhotoCreateForm({
  isSubmitting,
  camps,
  players,
  selectedCampId,
  teams,
  isTeamsLoading,
  onCancel,
  onSubmit,
}: {
  isSubmitting: boolean;
  camps: Camp[];
  players: Player[];
  selectedCampId: string;
  teams: CampTeam[];
  isTeamsLoading: boolean;
  onCancel: () => void;
  onSubmit: (values: PhotoFormValues) => Promise<void>;
}) {
  const form = useForm<PhotoFormValues>({
    resolver: zodResolver(photoFormSchema),
    defaultValues: {
      targetType: 'camp',
      campId: camps[0]?.id ?? '',
      teamId: '',
      playerId: players[0]?.id ?? '',
      imageUrl: '',
    },
  });

  const targetType = form.watch('targetType');

  useEffect(() => {
    if (targetType === 'camp' && !form.getValues('campId') && camps.length > 0) {
      form.setValue('campId', camps[0].id, { shouldDirty: true, shouldValidate: true });
    }

    if (targetType === 'player' && !form.getValues('playerId') && players.length > 0) {
      form.setValue('playerId', players[0].id, { shouldDirty: true, shouldValidate: true });
    }
  }, [camps, form, players, targetType]);

  useEffect(() => {
    if (targetType !== 'team') {
      return;
    }

    if (!selectedCampId && camps.length > 0) {
      form.setValue('campId', camps[0].id, { shouldDirty: true, shouldValidate: true });
    }
  }, [camps, form, selectedCampId, targetType]);

  useEffect(() => {
    if (targetType !== 'team') {
      return;
    }

    const currentTeamId = form.getValues('teamId');
    const hasCurrentInList = teams.some((team) => team.id === currentTeamId);

    if (!hasCurrentInList) {
      form.setValue('teamId', teams[0]?.id ?? '', { shouldDirty: true, shouldValidate: true });
    }
  }, [form, targetType, teams]);

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
      noValidate
    >
      <div>
        <label htmlFor="targetType" className="mb-1 block text-sm font-medium text-slate-700">
          Target Type
        </label>
        <select
          id="targetType"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
          {...form.register('targetType')}
        >
          <option value="camp">Camp</option>
          <option value="team">Team</option>
          <option value="player">Player</option>
        </select>
        {form.formState.errors.targetType ? (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.targetType.message}</p>
        ) : null}
      </div>

      {targetType === 'camp' ? (
        <div>
          <label htmlFor="campId" className="mb-1 block text-sm font-medium text-slate-700">
            Camp
          </label>
          <select
            id="campId"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            {...form.register('campId')}
          >
            <option value="">Select camp</option>
            {camps.map((camp) => (
              <option key={camp.id} value={camp.id}>
                {getCampLabel(camp)}
              </option>
            ))}
          </select>
          {form.formState.errors.campId ? (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.campId.message}</p>
          ) : null}
        </div>
      ) : null}

      {targetType === 'team' ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="teamCampId" className="mb-1 block text-sm font-medium text-slate-700">
              Camp (for team selection)
            </label>
            <select
              id="teamCampId"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              {...form.register('campId')}
            >
              <option value="">Select camp</option>
              {camps.map((camp) => (
                <option key={camp.id} value={camp.id}>
                  {getCampLabel(camp)}
                </option>
              ))}
            </select>
            {form.formState.errors.campId ? (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.campId.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="teamId" className="mb-1 block text-sm font-medium text-slate-700">
              Team
            </label>
            <select
              id="teamId"
              disabled={!selectedCampId || isTeamsLoading}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
              {...form.register('teamId')}
            >
              <option value="">Select team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {getTeamLabel(team)}
                </option>
              ))}
            </select>
            {form.formState.errors.teamId ? (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.teamId.message}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {targetType === 'player' ? (
        <div>
          <label htmlFor="playerId" className="mb-1 block text-sm font-medium text-slate-700">
            Player
          </label>
          <select
            id="playerId"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            {...form.register('playerId')}
          >
            <option value="">Select player</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {getPlayerLabel(player)}
              </option>
            ))}
          </select>
          {form.formState.errors.playerId ? (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.playerId.message}</p>
          ) : null}
        </div>
      ) : null}

      <div>
        <label htmlFor="imageUrl" className="mb-1 block text-sm font-medium text-slate-700">
          Image URL
        </label>
        <input
          id="imageUrl"
          placeholder="https://..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
          {...form.register('imageUrl')}
        />
        {form.formState.errors.imageUrl ? (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.imageUrl.message}</p>
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
          {isSubmitting ? 'Saving...' : 'Create Photo Metadata'}
        </button>
      </div>
    </form>
  );
}

export function PhotosPage() {
  const campsQuery = useCampsQuery();
  const playersQuery = usePlayersQuery();

  const [selectedTargetType, setSelectedTargetType] = useState<PhotoTargetType>('camp');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [selectedCampIdForTeam, setSelectedCampIdForTeam] = useState<string>('');
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const teamsQuery = useCampTeamsByCampQuery(selectedCampIdForTeam || undefined);
  const photosQuery = usePhotosQuery(selectedTargetType, selectedTargetId || undefined);

  const { createMutation, deleteMutation } = usePhotoMutations();
  const isMutating = createMutation.isPending || deleteMutation.isPending;

  const camps = campsQuery.data ?? [];
  const players = playersQuery.data ?? [];
  const teams = teamsQuery.data ?? [];

  useEffect(() => {
    if (selectedTargetType === 'camp') {
      const firstCampId = camps[0]?.id ?? '';
      if (!selectedTargetId || !camps.some((camp) => camp.id === selectedTargetId)) {
        setSelectedTargetId(firstCampId);
      }
      return;
    }

    if (selectedTargetType === 'player') {
      const firstPlayerId = players[0]?.id ?? '';
      if (!selectedTargetId || !players.some((player) => player.id === selectedTargetId)) {
        setSelectedTargetId(firstPlayerId);
      }
      return;
    }

    if (!selectedCampIdForTeam && camps.length > 0) {
      setSelectedCampIdForTeam(camps[0].id);
    }
  }, [camps, players, selectedCampIdForTeam, selectedTargetId, selectedTargetType]);

  useEffect(() => {
    if (selectedTargetType !== 'team') {
      return;
    }

    const firstTeamId = teams[0]?.id ?? '';
    if (!selectedTargetId || !teams.some((team) => team.id === selectedTargetId)) {
      setSelectedTargetId(firstTeamId);
    }
  }, [selectedTargetId, selectedTargetType, teams]);

  const targetSummaryByPhotoId = useMemo(() => {
    const campMap = new Map(camps.map((camp) => [camp.id, getCampLabel(camp)] as const));
    const teamMap = new Map(teams.map((team) => [team.id, getTeamLabel(team)] as const));
    const playerMap = new Map(players.map((player) => [player.id, getPlayerLabel(player)] as const));

    const summaryMap = new Map<string, string>();

    for (const photo of photosQuery.data ?? []) {
      if (photo.teamId) {
        summaryMap.set(photo.id, `Team: ${teamMap.get(photo.teamId) ?? photo.teamId}`);
        continue;
      }

      if (photo.playerId) {
        summaryMap.set(photo.id, `Player: ${playerMap.get(photo.playerId) ?? photo.playerId}`);
        continue;
      }

      if (photo.campId) {
        summaryMap.set(photo.id, `Camp: ${campMap.get(photo.campId) ?? photo.campId}`);
        continue;
      }

      summaryMap.set(photo.id, 'Unscoped');
    }

    return summaryMap;
  }, [camps, photosQuery.data, players, teams]);

  async function handleCreate(values: PhotoFormValues): Promise<void> {
    try {
      const payload = toCreatePayload(values);
      await createMutation.mutateAsync(payload);
      setFeedback({ kind: 'success', message: 'Photo metadata created successfully.' });
      setFormMode(null);

      if (payload.campId) {
        setSelectedTargetType('camp');
        setSelectedTargetId(payload.campId);
      } else if (payload.teamId) {
        setSelectedTargetType('team');
        setSelectedTargetId(payload.teamId);
      } else if (payload.playerId) {
        setSelectedTargetType('player');
        setSelectedTargetId(payload.playerId);
      }
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to create photo metadata.'),
      });
    }
  }

  async function handleDelete(photoId: string): Promise<void> {
    const shouldDelete = window.confirm('Delete this photo metadata record? This action cannot be undone.');

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(photoId);
      setFeedback({ kind: 'success', message: 'Photo deleted successfully.' });
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Unable to delete photo.'),
      });
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Photos / Gallery"
        description="Create and manage photo metadata linked to camps, teams, or players."
        actions={
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setFormMode({ kind: 'create' });
            }}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Add Photo Metadata
          </button>
        }
      />

      <div className="flex items-center gap-2">
        <Badge tone="neutral">Metadata</Badge>
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
        title="Create Photo Metadata"
        onClose={() => {
          setFormMode(null);
        }}
      >
        {formMode ? (
          <PhotoCreateForm
            isSubmitting={isMutating}
            camps={camps}
            players={players}
            selectedCampId={selectedCampIdForTeam}
            teams={teams}
            isTeamsLoading={teamsQuery.isLoading}
            onCancel={() => {
              setFormMode(null);
            }}
            onSubmit={handleCreate}
          />
        ) : null}
      </ModalDrawer>

      <SectionCard title="Browse Photos" description="Filter records by target and related entity.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="photosTargetType" className="mb-1 block text-sm font-medium text-slate-700">
              Target Type
            </label>
            <select
              id="photosTargetType"
              value={selectedTargetType}
              onChange={(event) => {
                const next = event.target.value as PhotoTargetType;
                setSelectedTargetType(next);
                setSelectedTargetId('');
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            >
              <option value="camp">Camp</option>
              <option value="team">Team</option>
              <option value="player">Player</option>
            </select>
          </div>

          {selectedTargetType === 'camp' ? (
            <div>
              <label htmlFor="photosCamp" className="mb-1 block text-sm font-medium text-slate-700">
                Camp
              </label>
              <select
                id="photosCamp"
                value={selectedTargetId}
                onChange={(event) => {
                  setSelectedTargetId(event.target.value);
                }}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              >
                <option value="">Select camp</option>
                {camps.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {getCampLabel(camp)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {selectedTargetType === 'team' ? (
            <>
              <div>
                <label htmlFor="photosTeamCamp" className="mb-1 block text-sm font-medium text-slate-700">
                  Camp
                </label>
                <select
                  id="photosTeamCamp"
                  value={selectedCampIdForTeam}
                  onChange={(event) => {
                    setSelectedCampIdForTeam(event.target.value);
                    setSelectedTargetId('');
                  }}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
                >
                  <option value="">Select camp</option>
                  {camps.map((camp) => (
                    <option key={camp.id} value={camp.id}>
                      {getCampLabel(camp)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="photosTeam" className="mb-1 block text-sm font-medium text-slate-700">
                  Team
                </label>
                <select
                  id="photosTeam"
                  disabled={!selectedCampIdForTeam || teamsQuery.isLoading}
                  value={selectedTargetId}
                  onChange={(event) => {
                    setSelectedTargetId(event.target.value);
                  }}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Select team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {getTeamLabel(team)}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : null}

          {selectedTargetType === 'player' ? (
            <div>
              <label htmlFor="photosPlayer" className="mb-1 block text-sm font-medium text-slate-700">
                Player
              </label>
              <select
                id="photosPlayer"
                value={selectedTargetId}
                onChange={(event) => {
                  setSelectedTargetId(event.target.value);
                }}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              >
                <option value="">Select player</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {getPlayerLabel(player)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        {photosQuery.isLoading ? <LoadingState label="Loading photos..." /> : null}

        {photosQuery.isError ? (
          <ErrorState
            message={getQueryErrorMessage(photosQuery.error)}
            onRetry={() => {
              void photosQuery.refetch();
            }}
          />
        ) : null}

        {photosQuery.isSuccess && (photosQuery.data ?? []).length === 0 ? (
          <EmptyState
            title="No photo metadata"
            description="No photo records found for the selected target."
          />
        ) : null}

        {photosQuery.isSuccess && (photosQuery.data ?? []).length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(photosQuery.data ?? []).map((photo) => (
              <div key={photo.id} className="rounded-lg border border-slate-200 bg-white p-3">
                <img
                  src={photo.imageUrl}
                  alt="Photo preview"
                  className="h-40 w-full rounded-md border border-slate-200 object-cover"
                  loading="lazy"
                />

                <div className="mt-3 space-y-1 text-sm text-slate-700">
                  <p className="break-all">
                    <span className="font-medium text-slate-900">Image:</span> {photo.imageUrl}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Association:</span>{' '}
                    {targetSummaryByPhotoId.get(photo.id) ?? 'Unknown'}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Created:</span> {formatCreatedAt(photo.createdAt)}
                  </p>
                </div>

                <div className="mt-3 flex">
                  <button
                    type="button"
                    onClick={() => {
                      void handleDelete(photo.id);
                    }}
                    disabled={isMutating}
                    className="w-full rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
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
