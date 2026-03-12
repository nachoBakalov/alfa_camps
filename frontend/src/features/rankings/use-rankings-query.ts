import { useQuery } from '@tanstack/react-query';
import {
  getCampKillsRanking,
  getCampPointsRanking,
  getCampSurvivalsRanking,
  getCampTeamStandings,
} from '../../api/rankings.api';

export const rankingsQueryKey = ['rankings'] as const;

export function getCampPointsRankingQueryKey(campId: string, limit?: number) {
  return [...rankingsQueryKey, 'camp', campId, 'points', limit ?? 'all'] as const;
}

export function getCampKillsRankingQueryKey(campId: string, limit?: number) {
  return [...rankingsQueryKey, 'camp', campId, 'kills', limit ?? 'all'] as const;
}

export function getCampSurvivalsRankingQueryKey(campId: string, limit?: number) {
  return [...rankingsQueryKey, 'camp', campId, 'survivals', limit ?? 'all'] as const;
}

export function getCampTeamStandingsQueryKey(campId: string) {
  return [...rankingsQueryKey, 'camp', campId, 'teams'] as const;
}

export function useCampPointsRankingQuery(campId?: string, limit?: number, enabled = true) {
  return useQuery({
    queryKey: campId
      ? getCampPointsRankingQueryKey(campId, limit)
      : [...rankingsQueryKey, 'camp', 'missing-camp-id', 'points'],
    queryFn: () => getCampPointsRanking(campId as string, limit),
    enabled: Boolean(campId) && enabled,
  });
}

export function useCampKillsRankingQuery(campId?: string, limit?: number, enabled = true) {
  return useQuery({
    queryKey: campId
      ? getCampKillsRankingQueryKey(campId, limit)
      : [...rankingsQueryKey, 'camp', 'missing-camp-id', 'kills'],
    queryFn: () => getCampKillsRanking(campId as string, limit),
    enabled: Boolean(campId) && enabled,
  });
}

export function useCampSurvivalsRankingQuery(campId?: string, limit?: number, enabled = true) {
  return useQuery({
    queryKey: campId
      ? getCampSurvivalsRankingQueryKey(campId, limit)
      : [...rankingsQueryKey, 'camp', 'missing-camp-id', 'survivals'],
    queryFn: () => getCampSurvivalsRanking(campId as string, limit),
    enabled: Boolean(campId) && enabled,
  });
}

export function useCampTeamStandingsQuery(campId?: string, enabled = true) {
  return useQuery({
    queryKey: campId
      ? getCampTeamStandingsQueryKey(campId)
      : [...rankingsQueryKey, 'camp', 'missing-camp-id', 'teams'],
    queryFn: () => getCampTeamStandings(campId as string),
    enabled: Boolean(campId) && enabled,
  });
}
