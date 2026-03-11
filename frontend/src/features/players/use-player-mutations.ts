import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPlayer, deletePlayer, type PlayerInput, updatePlayer } from '../../api/players.api';
import { getPlayerQueryKey, playersQueryKey } from './use-players-query';

export function usePlayerMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: PlayerInput) => createPlayer(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: playersQueryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PlayerInput }) => updatePlayer(id, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: playersQueryKey });
      await queryClient.invalidateQueries({ queryKey: getPlayerQueryKey(variables.id) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePlayer(id),
    onSuccess: async (_, id) => {
      await queryClient.invalidateQueries({ queryKey: playersQueryKey });
      await queryClient.invalidateQueries({ queryKey: getPlayerQueryKey(id) });
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
