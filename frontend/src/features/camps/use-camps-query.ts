import { useQuery } from '@tanstack/react-query';
import { getCamp, getCamps } from '../../api/camps.api';

export const campsQueryKey = ['camps'] as const;

export function getCampQueryKey(campId: string) {
  return [...campsQueryKey, campId] as const;
}

export function useCampsQuery() {
  return useQuery({
    queryKey: campsQueryKey,
    queryFn: getCamps,
  });
}

export function useCampQuery(campId?: string) {
  return useQuery({
    queryKey: campId ? getCampQueryKey(campId) : [...campsQueryKey, 'missing-id'],
    queryFn: () => getCamp(campId as string),
    enabled: Boolean(campId),
  });
}
