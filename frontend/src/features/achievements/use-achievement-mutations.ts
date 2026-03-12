import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAchievementDefinition,
  deleteAchievementDefinition,
  type AchievementDefinitionInput,
  updateAchievementDefinition,
  type UpdateAchievementDefinitionInput,
} from '../../api/achievements.api';
import { achievementDefinitionsQueryKey } from './use-achievements-query';

export function useAchievementMutations() {
  const queryClient = useQueryClient();

  const invalidateAchievementDefinitions = async () => {
    await queryClient.invalidateQueries({ queryKey: achievementDefinitionsQueryKey });
  };

  const createMutation = useMutation({
    mutationFn: (payload: AchievementDefinitionInput) => createAchievementDefinition(payload),
    onSuccess: invalidateAchievementDefinitions,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAchievementDefinitionInput }) =>
      updateAchievementDefinition(id, payload),
    onSuccess: invalidateAchievementDefinitions,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAchievementDefinition(id),
    onSuccess: invalidateAchievementDefinitions,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
