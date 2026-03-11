import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCampType,
  deleteCampType,
  type CampTypeInput,
  updateCampType,
} from '../../api/camp-types.api';
import { campTypesQueryKey } from './use-camp-types-query';

export function useCampTypeMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CampTypeInput) => createCampType(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: campTypesQueryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CampTypeInput }) => updateCampType(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: campTypesQueryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCampType(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: campTypesQueryKey });
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
