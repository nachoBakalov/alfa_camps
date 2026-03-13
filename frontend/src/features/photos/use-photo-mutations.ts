import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createPhoto,
  deletePhoto,
  uploadPhoto,
  type PhotoInput,
  type PhotoUploadInput,
} from '../../api/photos.api';
import { ApiClientError } from '../../lib/errors';
import { photosQueryKey } from './use-photos-query';

type UploadPhotoMutationInput = {
  file: File;
  payload: PhotoUploadInput;
};

type UploadManyPhotosMutationInput = {
  files: File[];
  payload: PhotoUploadInput;
};

type UploadManyPhotosMutationResult = {
  successCount: number;
  failed: Array<{
    fileName: string;
    message: string;
  }>;
};

export function usePhotoMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: PhotoInput) => createPhoto(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: photosQueryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePhoto(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: photosQueryKey });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, payload }: UploadPhotoMutationInput) => uploadPhoto(file, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: photosQueryKey });
    },
  });

  const uploadManyMutation = useMutation({
    mutationFn: async ({ files, payload }: UploadManyPhotosMutationInput): Promise<UploadManyPhotosMutationResult> => {
      let successCount = 0;
      const failed: UploadManyPhotosMutationResult['failed'] = [];

      for (const file of files) {
        try {
          await uploadPhoto(file, payload);
          successCount += 1;
        } catch (error) {
          if (error instanceof ApiClientError) {
            failed.push({ fileName: file.name, message: error.message });
            continue;
          }

          failed.push({ fileName: file.name, message: 'Неуспешно качване на файла.' });
        }
      }

      return {
        successCount,
        failed,
      };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: photosQueryKey });
    },
  });

  return {
    createMutation,
    deleteMutation,
    uploadMutation,
    uploadManyMutation,
  };
}
