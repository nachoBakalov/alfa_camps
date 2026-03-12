import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBattlePlayerResult,
  type CreateBattlePlayerResultInput,
  updateBattlePlayerResult,
  type UpdateBattlePlayerResultInput,
} from '../../api/battle-player-results.api';
import { getBattleQueryKey } from '../battles/use-battles-query';
import {
  battlePlayerResultsQueryKey,
  getBattlePlayerResultsByBattleQueryKey,
} from './use-battle-player-results-query';

export function useBattlePlayerResultMutations(battleId?: string) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateBattlePlayerResultInput) => createBattlePlayerResult(payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: battlePlayerResultsQueryKey });
      await queryClient.invalidateQueries({
        queryKey: getBattlePlayerResultsByBattleQueryKey(variables.battleId),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBattlePlayerResultInput }) =>
      updateBattlePlayerResult(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: battlePlayerResultsQueryKey });

      if (battleId) {
        await queryClient.invalidateQueries({ queryKey: getBattlePlayerResultsByBattleQueryKey(battleId) });
        await queryClient.invalidateQueries({ queryKey: getBattleQueryKey(battleId) });
      }
    },
  });

  return {
    createMutation,
    updateMutation,
  };
}
