import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCamp, deleteCamp, type CampInput, updateCamp } from '../../api/camps.api';
import { campsQueryKey, getCampQueryKey } from './use-camps-query';

export function useCampMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CampInput) => createCamp(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: campsQueryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CampInput }) => updateCamp(id, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: campsQueryKey });
      await queryClient.invalidateQueries({ queryKey: getCampQueryKey(variables.id) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCamp(id),
    onSuccess: async (_, id) => {
      await queryClient.invalidateQueries({ queryKey: campsQueryKey });
      await queryClient.invalidateQueries({ queryKey: getCampQueryKey(id) });
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
