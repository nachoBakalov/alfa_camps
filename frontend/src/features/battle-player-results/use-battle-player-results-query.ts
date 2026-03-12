import { useQuery } from '@tanstack/react-query';
import { getBattlePlayerResultsByBattle } from '../../api/battle-player-results.api';

export const battlePlayerResultsQueryKey = ['battle-player-results'] as const;

export function getBattlePlayerResultsByBattleQueryKey(battleId: string) {
  return [...battlePlayerResultsQueryKey, 'battle', battleId] as const;
}

export function useBattlePlayerResultsByBattleQuery(battleId?: string) {
  return useQuery({
    queryKey: battleId
      ? getBattlePlayerResultsByBattleQueryKey(battleId)
      : [...battlePlayerResultsQueryKey, 'missing-battle-id'],
    queryFn: () => getBattlePlayerResultsByBattle(battleId as string),
    enabled: Boolean(battleId),
  });
}
