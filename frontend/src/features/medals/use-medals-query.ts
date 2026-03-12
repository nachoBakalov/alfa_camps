import { useQuery } from '@tanstack/react-query';
import { getMedalDefinitions } from '../../api/medals.api';

export const medalDefinitionsQueryKey = ['medal-definitions'] as const;

export function useMedalDefinitionsQuery() {
  return useQuery({
    queryKey: medalDefinitionsQueryKey,
    queryFn: getMedalDefinitions,
  });
}
