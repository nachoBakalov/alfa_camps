import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPhoto, deletePhoto, type PhotoInput } from '../../api/photos.api';
import { photosQueryKey } from './use-photos-query';

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

  return {
    createMutation,
    deleteMutation,
  };
}
