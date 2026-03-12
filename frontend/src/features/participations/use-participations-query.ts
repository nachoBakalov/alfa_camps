import { useQuery } from '@tanstack/react-query';
import { getParticipationsByCamp } from '../../api/participations.api';

export const participationsQueryKey = ['participations'] as const;

export function getParticipationsByCampQueryKey(campId: string) {
  return [...participationsQueryKey, 'camp', campId] as const;
}

export function useParticipationsByCampQuery(campId?: string) {
  return useQuery({
    queryKey: campId
      ? getParticipationsByCampQueryKey(campId)
      : [...participationsQueryKey, 'missing-camp-id'],
    queryFn: () => getParticipationsByCamp(campId as string),
    enabled: Boolean(campId),
  });
}
