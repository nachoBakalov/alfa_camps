import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBattle,
  deleteBattle,
  type CreateBattleInput,
  type UpdateBattleInput,
  updateBattle,
} from '../../api/battles.api';
import { getBattleQueryKey, getBattlesByCampQueryKey, battlesQueryKey } from './use-battles-query';

export function useBattleMutations(campId?: string) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateBattleInput) => createBattle(payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: battlesQueryKey });
      await queryClient.invalidateQueries({ queryKey: getBattlesByCampQueryKey(variables.campId) });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBattleInput }) => updateBattle(id, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: battlesQueryKey });
      await queryClient.invalidateQueries({ queryKey: getBattleQueryKey(variables.id) });

      if (campId) {
        await queryClient.invalidateQueries({ queryKey: getBattlesByCampQueryKey(campId) });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBattle(id),
    onSuccess: async (_, id) => {
      await queryClient.invalidateQueries({ queryKey: battlesQueryKey });
      await queryClient.invalidateQueries({ queryKey: getBattleQueryKey(id) });

      if (campId) {
        await queryClient.invalidateQueries({ queryKey: getBattlesByCampQueryKey(campId) });
      }
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
