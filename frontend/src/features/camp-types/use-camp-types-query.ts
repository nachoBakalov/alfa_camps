import { useQuery } from '@tanstack/react-query';
import { getCampTypes } from '../../api/camp-types.api';

export const campTypesQueryKey = ['camp-types'] as const;

export function useCampTypesQuery() {
  return useQuery({
    queryKey: campTypesQueryKey,
    queryFn: getCampTypes,
  });
}
