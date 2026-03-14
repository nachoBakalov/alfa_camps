import { useMemo, useState } from 'react';
import { SectionCard } from '../../components/cards/SectionCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { ApiClientError } from '../../lib/errors';
import { PhotoUploadForm, type PhotoUploadSubmitInput } from './PhotoUploadForm';
import { usePhotoMutations } from './use-photo-mutations';
import { usePhotosQuery, type PhotoTargetType } from './use-photos-query';

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

function formatCreatedAt(createdAt: string): string {
  const parsed = new Date(createdAt);

  if (Number.isNaN(parsed.getTime())) {
    return createdAt;
  }

  return parsed.toLocaleString('bg-BG');
}

function buildUploadPayload(scopeType: PhotoTargetType, scopeId: string, relatedCampId?: string) {
  if (scopeType === 'camp') {
    return { campId: scopeId };
  }

  if (scopeType === 'team') {
    return {
      campId: relatedCampId,
      teamId: scopeId,
    };
  }

  return { playerId: scopeId };
}

function getAssociationLabel(scopeType: PhotoTargetType): string {
  if (scopeType === 'camp') {
    return 'Лагер';
  }

  if (scopeType === 'team') {
    return 'Отбор';
  }

  return 'Играч';
}

export function ScopedPhotosSection({
  scopeType,
  scopeId,
  relatedCampId,
  title,
  description,
  galleryTitle,
  galleryDescription,
}: {
  scopeType: PhotoTargetType;
  scopeId: string;
  relatedCampId?: string;
  title: string;
  description: string;
  galleryTitle: string;
  galleryDescription: string;
}) {
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const photosQuery = usePhotosQuery(scopeType, scopeId);
  const { deleteMutation, uploadManyMutation } = usePhotoMutations();

  const isMutating = deleteMutation.isPending || uploadManyMutation.isPending;

  const sortedPhotos = useMemo(() => {
    return [...(photosQuery.data ?? [])].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [photosQuery.data]);

  async function handleUpload(input: PhotoUploadSubmitInput): Promise<void> {
    try {
      const result = await uploadManyMutation.mutateAsync({
        files: input.files,
        payload: buildUploadPayload(scopeType, scopeId, relatedCampId),
      });

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
    <div className="space-y-4 sm:space-y-5">
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

      <SectionCard title={title} description={description}>
        <PhotoUploadForm
          isUploading={uploadManyMutation.isPending}
          onSubmit={handleUpload}
          fixedTarget={{
            targetType: scopeType,
            targetId: scopeId,
            payload: buildUploadPayload(scopeType, scopeId, relatedCampId),
          }}
        />
      </SectionCard>

      <SectionCard title={galleryTitle} description={galleryDescription}>
        {photosQuery.isLoading ? <LoadingState label="Зареждане на снимките..." /> : null}

        {photosQuery.isError ? (
          <ErrorState
            message={getQueryErrorMessage(photosQuery.error)}
            onRetry={() => {
              void photosQuery.refetch();
            }}
          />
        ) : null}

        {photosQuery.isSuccess && sortedPhotos.length === 0 ? (
          <EmptyState
            title="Няма снимки"
            description="Все още няма качени снимки за тази секция."
          />
        ) : null}

        {photosQuery.isSuccess && sortedPhotos.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedPhotos.map((photo) => (
              <article key={photo.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <img
                  src={resolvePhotoImageUrl(photo.imageUrl)}
                  alt="Снимка"
                  className="h-44 w-full rounded-lg border border-slate-200 object-cover"
                  loading="lazy"
                />

                <div className="mt-3 space-y-1 text-sm text-slate-700">
                  <p>
                    <span className="font-medium text-slate-900">Асоциация:</span> {getAssociationLabel(scopeType)}
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
