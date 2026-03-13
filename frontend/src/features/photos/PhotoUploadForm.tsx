import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Camp } from '../../api/camps.api';
import type { CampTeam } from '../../api/camp-teams.api';
import type { Player } from '../../api/players.api';
import type { PhotoUploadInput } from '../../api/photos.api';
import { useCampTeamsByCampQuery } from '../camp-teams/use-camp-teams-query';
import { createImagePreviewUrl, optimizeImageForUpload } from '../../lib/image-optimization';
import { photoUploadFormSchema, type PhotoUploadFormValues } from './photo-upload-form.schema';

type PhotoTargetType = 'camp' | 'team' | 'player';

type PreparedUpload = {
  id: string;
  uploadFile: File;
  previewUrl: string;
  originalFileName: string;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
};

export type PhotoUploadSubmitInput = {
  files: File[];
  payload: PhotoUploadInput;
  targetType: PhotoTargetType;
  targetId: string;
};

const TARGET_OPTIONS: Array<{ value: PhotoTargetType; label: string }> = [
  { value: 'camp', label: 'Лагер' },
  { value: 'team', label: 'Отбор' },
  { value: 'player', label: 'Играч' },
];

const ACCEPTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(kb / 1024).toFixed(2)} MB`;
}

function toUploadPayload(values: PhotoUploadFormValues): {
  payload: PhotoUploadInput;
  targetType: PhotoTargetType;
  targetId: string;
} {
  if (values.targetType === 'camp') {
    return {
      payload: {
        campId: values.campId?.trim(),
      },
      targetType: 'camp',
      targetId: values.campId?.trim() ?? '',
    };
  }

  if (values.targetType === 'team') {
    return {
      payload: {
        campId: values.campId?.trim(),
        teamId: values.teamId?.trim(),
      },
      targetType: 'team',
      targetId: values.teamId?.trim() ?? '',
    };
  }

  return {
    payload: {
      playerId: values.playerId?.trim(),
    },
    targetType: 'player',
    targetId: values.playerId?.trim() ?? '',
  };
}

export function PhotoUploadForm({
  camps,
  players,
  isUploading,
  onSubmit,
}: {
  camps: Camp[];
  players: Player[];
  isUploading: boolean;
  onSubmit: (input: PhotoUploadSubmitInput) => Promise<void>;
}) {
  const form = useForm<PhotoUploadFormValues>({
    resolver: zodResolver(photoUploadFormSchema),
    defaultValues: {
      targetType: 'camp',
      campId: camps[0]?.id ?? '',
      teamId: '',
      playerId: players[0]?.id ?? '',
    },
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [preparedUploads, setPreparedUploads] = useState<PreparedUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadsRef = useRef<PreparedUpload[]>([]);

  const targetType = form.watch('targetType');
  const selectedCampId = form.watch('campId') ?? '';

  const teamsQuery = useCampTeamsByCampQuery(selectedCampId || undefined);
  const teams = teamsQuery.data ?? [];

  useEffect(() => {
    uploadsRef.current = preparedUploads;
  }, [preparedUploads]);

  useEffect(() => {
    return () => {
      for (const upload of uploadsRef.current) {
        URL.revokeObjectURL(upload.previewUrl);
      }
    };
  }, []);

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

    if (!form.getValues('campId') && camps.length > 0) {
      form.setValue('campId', camps[0].id, { shouldDirty: true, shouldValidate: true });
    }
  }, [camps, form, targetType]);

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

  const canSubmit = useMemo(() => {
    return preparedUploads.length > 0 && !isUploading && !isOptimizing;
  }, [isOptimizing, isUploading, preparedUploads.length]);

  function buildUploadId(file: File): string {
    return `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`;
  }

  async function handleFilesSelected(files: File[]) {
    setFileError(null);

    if (files.length === 0) {
      return;
    }

    setIsOptimizing(true);
    const nextUploads: PreparedUpload[] = [];
    const rejectedFiles: string[] = [];

    try {
      for (const file of files) {
        if (!ACCEPTED_MIME_TYPES.has(file.type)) {
          rejectedFiles.push(file.name);
          continue;
        }

        const optimized = await optimizeImageForUpload(file);

        nextUploads.push({
          id: buildUploadId(file),
          uploadFile: optimized.file,
          previewUrl: createImagePreviewUrl(optimized.file),
          originalFileName: file.name,
          originalSizeBytes: optimized.originalSizeBytes,
          optimizedSizeBytes: optimized.optimizedSizeBytes,
        });
      }

      if (rejectedFiles.length > 0) {
        setFileError(`Някои файлове са пропуснати (поддържат се JPG, PNG, WEBP): ${rejectedFiles.join(', ')}`);
      }

      setPreparedUploads((current) => [...current, ...nextUploads]);
    } catch {
      setFileError('Оптимизацията на изображенията не успя. Опитай отново.');
    } finally {
      setIsOptimizing(false);
    }
  }

  function removeUpload(uploadId: string) {
    setPreparedUploads((current) => {
      const removed = current.find((item) => item.id === uploadId);
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }

      return current.filter((item) => item.id !== uploadId);
    });
  }

  function clearUploads() {
    setPreparedUploads((current) => {
      for (const upload of current) {
        URL.revokeObjectURL(upload.previewUrl);
      }

      return [];
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        if (preparedUploads.length === 0) {
          setFileError('Добави поне една снимка преди качване.');
          return;
        }

        const mapped = toUploadPayload(values);

        await onSubmit({
          files: preparedUploads.map((upload) => upload.uploadFile),
          payload: mapped.payload,
          targetType: mapped.targetType,
          targetId: mapped.targetId,
        });

        clearUploads();
      })}
      noValidate
    >
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Къде да се свържат снимките?</p>
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1">
          {TARGET_OPTIONS.map((option) => {
            const isActive = targetType === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  form.setValue('targetType', option.value, { shouldDirty: true, shouldValidate: true });
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

      {targetType === 'camp' ? (
        <div>
          <label htmlFor="uploadCampId" className="mb-1 block text-sm font-medium text-slate-700">
            Лагер
          </label>
          <select
            id="uploadCampId"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            {...form.register('campId')}
          >
            <option value="">Избери лагер</option>
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
            <label htmlFor="uploadTeamCampId" className="mb-1 block text-sm font-medium text-slate-700">
              Лагер (за филтриране на отборите)
            </label>
            <select
              id="uploadTeamCampId"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
              {...form.register('campId')}
            >
              <option value="">Избери лагер</option>
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
            <label htmlFor="uploadTeamId" className="mb-1 block text-sm font-medium text-slate-700">
              Отбор
            </label>
            <select
              id="uploadTeamId"
              disabled={!selectedCampId || teamsQuery.isLoading}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
              {...form.register('teamId')}
            >
              <option value="">Избери отбор</option>
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
          <label htmlFor="uploadPlayerId" className="mb-1 block text-sm font-medium text-slate-700">
            Играч
          </label>
          <select
            id="uploadPlayerId"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            {...form.register('playerId')}
          >
            <option value="">Избери играч</option>
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
        <p className="mb-2 text-sm font-medium text-slate-700">Снимки за качване</p>

        <input
          ref={fileInputRef}
          id="photoFiles"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(event) => {
            const selectedFiles = Array.from(event.target.files ?? []);
            void handleFilesSelected(selectedFiles);

            event.target.value = '';
          }}
        />

        <button
          type="button"
          onClick={() => {
            fileInputRef.current?.click();
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);

            const droppedFiles = Array.from(event.dataTransfer.files ?? []);
            void handleFilesSelected(droppedFiles);
          }}
          className={
            isDragging
              ? 'w-full rounded-xl border-2 border-dashed border-slate-500 bg-slate-100 p-5 text-left'
              : 'w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-left hover:bg-slate-100'
          }
        >
          <p className="text-sm font-semibold text-slate-900">Плъзни снимки тук или натисни за избор</p>
          <p className="mt-1 text-xs text-slate-600">Поддържани формати: JPG, PNG, WEBP</p>
        </button>
        {fileError ? <p className="mt-1 text-sm text-red-600">{fileError}</p> : null}
        {isOptimizing ? <p className="mt-1 text-sm text-slate-600">Оптимизиране на изображения...</p> : null}
      </div>

      {preparedUploads.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Подготвени снимки ({preparedUploads.length})</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {preparedUploads.map((upload) => (
              <article key={upload.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <img
                  src={upload.previewUrl}
                  alt={`Преглед на ${upload.originalFileName}`}
                  className="h-36 w-full rounded-lg border border-slate-200 object-cover"
                  loading="lazy"
                />

                <div className="mt-2 text-sm text-slate-700">
                  <p className="truncate font-medium text-slate-900" title={upload.originalFileName}>
                    {upload.originalFileName}
                  </p>
                  <p>
                    Оригинал: {formatFileSize(upload.originalSizeBytes)}
                  </p>
                  <p>
                    Оптимизиран: {formatFileSize(upload.optimizedSizeBytes)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    removeUpload(upload.id);
                  }}
                  className="mt-2 w-full rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Премахни
                </button>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={clearUploads}
          disabled={preparedUploads.length === 0 || isUploading || isOptimizing}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Изчисти
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? 'Качване...' : 'Качи снимките'}
        </button>
      </div>
    </form>
  );
}
