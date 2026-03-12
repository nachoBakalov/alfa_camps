import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createRankCategory,
  createRankDefinition,
  deleteRankCategory,
  deleteRankDefinition,
  type RankCategoryInput,
  type RankDefinitionInput,
  updateRankCategory,
  updateRankDefinition,
  type UpdateRankDefinitionInput,
} from '../../api/ranks.api';
import { rankCategoriesQueryKey, rankDefinitionsQueryKey } from './use-ranks-query';

export function useRankMutations() {
  const queryClient = useQueryClient();

  const invalidateRankQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: rankCategoriesQueryKey }),
      queryClient.invalidateQueries({ queryKey: rankDefinitionsQueryKey }),
    ]);
  };

  const createCategoryMutation = useMutation({
    mutationFn: (payload: RankCategoryInput) => createRankCategory(payload),
    onSuccess: invalidateRankQueries,
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RankCategoryInput }) =>
      updateRankCategory(id, payload),
    onSuccess: invalidateRankQueries,
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteRankCategory(id),
    onSuccess: invalidateRankQueries,
  });

  const createDefinitionMutation = useMutation({
    mutationFn: (payload: RankDefinitionInput) => createRankDefinition(payload),
    onSuccess: invalidateRankQueries,
  });

  const updateDefinitionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRankDefinitionInput }) =>
      updateRankDefinition(id, payload),
    onSuccess: invalidateRankQueries,
  });

  const deleteDefinitionMutation = useMutation({
    mutationFn: (id: string) => deleteRankDefinition(id),
    onSuccess: invalidateRankQueries,
  });

  return {
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
    createDefinitionMutation,
    updateDefinitionMutation,
    deleteDefinitionMutation,
  };
}
