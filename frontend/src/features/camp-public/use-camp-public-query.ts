import { useQuery } from '@tanstack/react-query';
import {
  getCampPublicDetails,
  getCampPublicParticipants,
  getCampPublicTeams,
} from '../../api/camp-public.api';

export const campPublicQueryKey = ['camp-public'] as const;

export function useCampPublicDetailsQuery(campId?: string) {
  return useQuery({
    queryKey: campId
      ? [...campPublicQueryKey, campId, 'details']
      : [...campPublicQueryKey, 'missing-camp-id', 'details'],
    queryFn: () => getCampPublicDetails(campId as string),
    enabled: Boolean(campId),
  });
}

export function useCampPublicTeamsQuery(campId?: string) {
  return useQuery({
    queryKey: campId
      ? [...campPublicQueryKey, campId, 'teams']
      : [...campPublicQueryKey, 'missing-camp-id', 'teams'],
    queryFn: () => getCampPublicTeams(campId as string),
    enabled: Boolean(campId),
  });
}

export function useCampPublicParticipantsQuery(campId?: string) {
  return useQuery({
    queryKey: campId
      ? [...campPublicQueryKey, campId, 'participants']
      : [...campPublicQueryKey, 'missing-camp-id', 'participants'],
    queryFn: () => getCampPublicParticipants(campId as string),
    enabled: Boolean(campId),
  });
}
