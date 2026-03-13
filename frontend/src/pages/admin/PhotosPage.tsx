import { useEffect, useMemo, useState } from 'react';
import type { Camp } from '../../api/camps.api';
import type { CampTeam } from '../../api/camp-teams.api';
import type { Player } from '../../api/players.api';
import { SectionCard } from '../../components/cards/SectionCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { PageHeader } from '../../components/layout/PageHeader';
import { useCampTeamsByCampQuery } from '../../features/camp-teams/use-camp-teams-query';
import { PhotoUploadForm, type PhotoUploadSubmitInput } from '../../features/photos/PhotoUploadForm';
import { useCampsQuery } from '../../features/camps/use-camps-query';
import { usePhotoMutations } from '../../features/photos/use-photo-mutations';
import { usePhotosQuery, type PhotoTargetType } from '../../features/photos/use-photos-query';
import { usePlayersQuery } from '../../features/players/use-players-query';
import { ApiClientError } from '../../lib/errors';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '';

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

  return 'Не успяхме да заредим снимките.';
}

function formatCreatedAt(createdAt: string): string {
  const parsed = new Date(createdAt);

  if (Number.isNaN(parsed.getTime())) {
    return createdAt;
  }

  return parsed.toLocaleString('bg-BG');
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

function resolvePhotoImageUrl(imageUrl: string): string {
  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  if (!imageUrl.startsWith('/')) {
    return imageUrl;
  }

  if (!API_BASE_URL) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl}`;
}

const TARGET_OPTIONS: Array<{ value: PhotoTargetType; label: string }> = [
  { value: 'camp', label: 'Лагер' },
  { value: 'team', label: 'Отбор' },
  { value: 'player', label: 'Играч' },
];

export function PhotosPage() {
  const campsQuery = useCampsQuery();
  const playersQuery = usePlayersQuery();

  const [selectedTargetType, setSelectedTargetType] = useState<PhotoTargetType>('camp');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [selectedCampIdForTeam, setSelectedCampIdForTeam] = useState<string>('');
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const teamsQuery = useCampTeamsByCampQuery(selectedCampIdForTeam || undefined);
  const photosQuery = usePhotosQuery(selectedTargetType, selectedTargetId || undefined);
  const { deleteMutation, uploadManyMutation } = usePhotoMutations();

  const camps = campsQuery.data ?? [];
  const players = playersQuery.data ?? [];
  const teams = teamsQuery.data ?? [];

  const isMutating = deleteMutation.isPending || uploadManyMutation.isPending;

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
        summaryMap.set(photo.id, `Отбор: ${teamMap.get(photo.teamId) ?? photo.teamId}`);
        continue;
      }

      if (photo.playerId) {
        summaryMap.set(photo.id, `Играч: ${playerMap.get(photo.playerId) ?? photo.playerId}`);
        continue;
      }

      if (photo.campId) {
        summaryMap.set(photo.id, `Лагер: ${campMap.get(photo.campId) ?? photo.campId}`);
        continue;
      }

      summaryMap.set(photo.id, 'Без асоциация');
    }

    return summaryMap;
  }, [camps, photosQuery.data, players, teams]);

  async function handleUpload(input: PhotoUploadSubmitInput): Promise<void> {
    try {
      const result = await uploadManyMutation.mutateAsync({
        files: input.files,
        payload: input.payload,
      });

      setSelectedTargetType(input.targetType);
      setSelectedTargetId(input.targetId);

      if (input.targetType === 'team' && input.payload.campId) {
        setSelectedCampIdForTeam(input.payload.campId);
      }

      if (result.failed.length === 0) {
        setFeedback({ kind: 'success', message: `Успешно качени снимки: ${result.successCount}.` });
        return;
      }

      if (result.successCount > 0) {
        setFeedback({
          kind: 'error',
          message: `Качени: ${result.successCount}. Някои файлове не бяха качени: ${result.failed[0].fileName} (${result.failed[0].message})`,
        });
        return;
      }

      setFeedback({
        kind: 'error',
        message: `Качването не успя: ${result.failed[0].fileName} (${result.failed[0].message})`,
      });
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Неуспешно качване на снимките.'),
      });
    }
  }

  async function handleDelete(photoId: string): Promise<void> {
    const shouldDelete = window.confirm('Сигурни ли сте, че искате да изтриете тази снимка?');

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(photoId);
      setFeedback({ kind: 'success', message: 'Снимката е изтрита.' });
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: getMutationErrorMessage(error, 'Неуспешно изтриване на снимката.'),
      });
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Снимки"
        description="Качвай снимки, свързвай ги с лагер, отбор или играч и управлявай галерията от едно място."
      />

      {feedback ? (
        <div
          className={
            feedback.kind === 'success'
              ? 'rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800'
              : 'rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'
          }
        >
          {feedback.message}
        </div>
      ) : null}

      <SectionCard
        title="Качване на снимки"
        description="Избери цел, добави снимки, прегледай оптимизацията и качи с един бутон."
      >
        <PhotoUploadForm
          camps={camps}
          players={players}
          isUploading={uploadManyMutation.isPending}
          onSubmit={handleUpload}
        />
      </SectionCard>

      <SectionCard
        title="Галерия"
        description="Преглеждай и изтривай снимките за избраната цел."
      >
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Филтър по цел</p>
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1">
              {TARGET_OPTIONS.map((option) => {
                const isActive = selectedTargetType === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSelectedTargetType(option.value);
                      setSelectedTargetId('');
                    }}
                    className={
                      isActive
                        ? 'rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm'
                        : 'rounded-lg px-3 py-2 text-sm font-medium text-slate-600'
                    }
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedTargetType === 'camp' ? (
            <div>
              <label htmlFor="photosCamp" className="mb-1 block text-sm font-medium text-slate-700">
                Лагер
              </label>
              <select
                id="photosCamp"
                value={selectedTargetId}
                onChange={(event) => {
                  setSelectedTargetId(event.target.value);
                }}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              >
                <option value="">Избери лагер</option>
                {camps.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {getCampLabel(camp)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {selectedTargetType === 'team' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="photosTeamCamp" className="mb-1 block text-sm font-medium text-slate-700">
                  Лагер
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
                  <option value="">Избери лагер</option>
                  {camps.map((camp) => (
                    <option key={camp.id} value={camp.id}>
                      {getCampLabel(camp)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="photosTeam" className="mb-1 block text-sm font-medium text-slate-700">
                  Отбор
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
                  <option value="">Избери отбор</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {getTeamLabel(team)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}

          {selectedTargetType === 'player' ? (
            <div>
              <label htmlFor="photosPlayer" className="mb-1 block text-sm font-medium text-slate-700">
                Играч
              </label>
              <select
                id="photosPlayer"
                value={selectedTargetId}
                onChange={(event) => {
                  setSelectedTargetId(event.target.value);
                }}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              >
                <option value="">Избери играч</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {getPlayerLabel(player)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        {!selectedTargetId ? (
          <EmptyState
            title="Избери цел"
            description="За да заредим галерията, избери лагер, отбор или играч."
          />
        ) : null}

        {selectedTargetId && photosQuery.isLoading ? <LoadingState label="Зареждане на снимките..." /> : null}

        {selectedTargetId && photosQuery.isError ? (
          <ErrorState
            message={getQueryErrorMessage(photosQuery.error)}
            onRetry={() => {
              void photosQuery.refetch();
            }}
          />
        ) : null}

        {selectedTargetId && photosQuery.isSuccess && (photosQuery.data ?? []).length === 0 ? (
          <EmptyState
            title="Няма снимки"
            description="Все още няма качени снимки за избраната цел."
          />
        ) : null}

        {selectedTargetId && photosQuery.isSuccess && (photosQuery.data ?? []).length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(photosQuery.data ?? []).map((photo) => (
              <article key={photo.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <img
                  src={resolvePhotoImageUrl(photo.imageUrl)}
                  alt="Снимка от галерията"
                  className="h-44 w-full rounded-lg border border-slate-200 object-cover"
                  loading="lazy"
                />

                <div className="mt-3 space-y-1 text-sm text-slate-700">
                  <p>
                    <span className="font-medium text-slate-900">Връзка:</span>{' '}
                    {targetSummaryByPhotoId.get(photo.id) ?? 'Неизвестна'}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Създадена:</span> {formatCreatedAt(photo.createdAt)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    void handleDelete(photo.id);
                  }}
                  disabled={isMutating}
                  className="mt-3 w-full rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Изтрий
                </button>
              </article>
            ))}
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
}
