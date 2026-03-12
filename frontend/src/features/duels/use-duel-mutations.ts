import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createDuel,
  deleteDuel,
  type CreateDuelInput,
  type UpdateDuelInput,
  updateDuel,
} from '../../api/duels.api';
import { getDuelQueryKey, getDuelsByBattleQueryKey, duelsQueryKey } from './use-duels-query';

export function useDuelMutations(battleId?: string) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateDuelInput) => createDuel(payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: duelsQueryKey });
      await queryClient.invalidateQueries({ queryKey: getDuelsByBattleQueryKey(variables.battleId) });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDuelInput }) => updateDuel(id, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: duelsQueryKey });
      await queryClient.invalidateQueries({ queryKey: getDuelQueryKey(variables.id) });
      if (battleId) {
        await queryClient.invalidateQueries({ queryKey: getDuelsByBattleQueryKey(battleId) });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDuel(id),
    onSuccess: async (_, id) => {
      await queryClient.invalidateQueries({ queryKey: duelsQueryKey });
      await queryClient.invalidateQueries({ queryKey: getDuelQueryKey(id) });
      if (battleId) {
        await queryClient.invalidateQueries({ queryKey: getDuelsByBattleQueryKey(battleId) });
      }
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
