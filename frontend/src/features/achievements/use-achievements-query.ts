import { useQuery } from '@tanstack/react-query';
import { getAchievementDefinitions } from '../../api/achievements.api';

export const achievementDefinitionsQueryKey = ['achievement-definitions'] as const;

export function useAchievementDefinitionsQuery() {
  return useQuery({
    queryKey: achievementDefinitionsQueryKey,
    queryFn: getAchievementDefinitions,
  });
}
