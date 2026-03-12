import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createParticipation, type CreateCampParticipationInput } from '../../api/participations.api';
import { getParticipationsByCampQueryKey, participationsQueryKey } from './use-participations-query';

export function useParticipationMutations(campId?: string) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateCampParticipationInput) => createParticipation(payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: participationsQueryKey });
      await queryClient.invalidateQueries({ queryKey: getParticipationsByCampQueryKey(variables.campId) });
    },
  });

  async function refreshCampParticipations() {
    if (!campId) {
      return;
    }

    await queryClient.invalidateQueries({ queryKey: getParticipationsByCampQueryKey(campId) });
  }

  return {
    createMutation,
    refreshCampParticipations,
  };
}
