import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { applyBattleScore, finalizeCampScore, getBattleScorePreview } from '../../api/scoring.api';
import { getBattleQueryKey, getBattlesByCampQueryKey, battlesQueryKey } from '../battles/use-battles-query';
import { campsQueryKey, getCampQueryKey } from '../camps/use-camps-query';
import {
  getParticipationsByCampQueryKey,
  participationsQueryKey,
} from '../participations/use-participations-query';
import { rankingsQueryKey } from '../rankings/use-rankings-query';

export const scoringQueryKey = ['scoring'] as const;
export const playerProfilesQueryKey = ['player-profiles'] as const;

export function getBattleScorePreviewQueryKey(battleId: string) {
  return [...scoringQueryKey, 'battle-preview', battleId] as const;
}

export function useBattleScorePreviewQuery(battleId?: string) {
  return useQuery({
    queryKey: battleId
      ? getBattleScorePreviewQueryKey(battleId)
      : [...scoringQueryKey, 'battle-preview', 'missing-id'],
    queryFn: () => getBattleScorePreview(battleId as string),
    enabled: Boolean(battleId),
  });
}

export function useApplyBattleScoreMutation(params: { battleId?: string; campId?: string }) {
  const { battleId, campId } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => applyBattleScore(battleId as string),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: scoringQueryKey });
      await queryClient.invalidateQueries({ queryKey: battlesQueryKey });
      await queryClient.invalidateQueries({ queryKey: campsQueryKey });
      await queryClient.invalidateQueries({ queryKey: participationsQueryKey });
      await queryClient.invalidateQueries({ queryKey: rankingsQueryKey });
      await queryClient.invalidateQueries({ queryKey: playerProfilesQueryKey });

      if (battleId) {
        await queryClient.invalidateQueries({ queryKey: getBattleQueryKey(battleId) });
      }

      if (campId) {
        await queryClient.invalidateQueries({ queryKey: getBattlesByCampQueryKey(campId) });
        await queryClient.invalidateQueries({ queryKey: getCampQueryKey(campId) });
        await queryClient.invalidateQueries({ queryKey: getParticipationsByCampQueryKey(campId) });
      }
    },
  });
}

export function useFinalizeCampScoreMutation(campId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => finalizeCampScore(campId as string),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: campsQueryKey });
      await queryClient.invalidateQueries({ queryKey: participationsQueryKey });
      await queryClient.invalidateQueries({ queryKey: rankingsQueryKey });
      await queryClient.invalidateQueries({ queryKey: playerProfilesQueryKey });

      if (campId) {
        await queryClient.invalidateQueries({ queryKey: getCampQueryKey(campId) });
        await queryClient.invalidateQueries({ queryKey: getBattlesByCampQueryKey(campId) });
        await queryClient.invalidateQueries({ queryKey: getParticipationsByCampQueryKey(campId) });
      }
    },
  });
}
