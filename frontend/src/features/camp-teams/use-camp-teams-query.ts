import { useQuery } from '@tanstack/react-query';
import { getCampTeamsByCamp } from '../../api/camp-teams.api';

export const campTeamsQueryKey = ['camp-teams'] as const;

export function getCampTeamsByCampQueryKey(campId: string) {
  return [...campTeamsQueryKey, 'camp', campId] as const;
}

export function useCampTeamsByCampQuery(campId?: string) {
  return useQuery({
    queryKey: campId ? getCampTeamsByCampQueryKey(campId) : [...campTeamsQueryKey, 'missing-camp-id'],
    queryFn: () => getCampTeamsByCamp(campId as string),
    enabled: Boolean(campId),
  });
}
