import { useQuery } from '@tanstack/react-query';
import {
  getRankCategories,
  getRankDefinitions,
  getRankDefinitionsByCategory,
} from '../../api/ranks.api';

export const rankCategoriesQueryKey = ['rank-categories'] as const;
export const rankDefinitionsQueryKey = ['rank-definitions'] as const;

export function getRankDefinitionsByCategoryQueryKey(categoryId: string) {
  return [...rankDefinitionsQueryKey, 'category', categoryId] as const;
}

export function useRankCategoriesQuery() {
  return useQuery({
    queryKey: rankCategoriesQueryKey,
    queryFn: getRankCategories,
  });
}

export function useRankDefinitionsQuery() {
  return useQuery({
    queryKey: rankDefinitionsQueryKey,
    queryFn: getRankDefinitions,
  });
}

export function useRankDefinitionsByCategoryQuery(categoryId?: string) {
  return useQuery({
    queryKey: categoryId
      ? getRankDefinitionsByCategoryQueryKey(categoryId)
      : [...rankDefinitionsQueryKey, 'category', 'missing-id'],
    queryFn: () => getRankDefinitionsByCategory(categoryId as string),
    enabled: Boolean(categoryId),
  });
}
