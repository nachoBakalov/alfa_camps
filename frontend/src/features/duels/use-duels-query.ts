import { useQuery } from '@tanstack/react-query';
import { getDuel, getDuelsByBattle } from '../../api/duels.api';

export const duelsQueryKey = ['duels'] as const;

export function getDuelsByBattleQueryKey(battleId: string) {
  return [...duelsQueryKey, 'battle', battleId] as const;
}

export function getDuelQueryKey(duelId: string) {
  return [...duelsQueryKey, duelId] as const;
}

export function useDuelsByBattleQuery(battleId?: string) {
  return useQuery({
    queryKey: battleId ? getDuelsByBattleQueryKey(battleId) : [...duelsQueryKey, 'missing-battle-id'],
    queryFn: () => getDuelsByBattle(battleId as string),
    enabled: Boolean(battleId),
  });
}

export function useDuelQuery(duelId?: string) {
  return useQuery({
    queryKey: duelId ? getDuelQueryKey(duelId) : [...duelsQueryKey, 'missing-duel-id'],
    queryFn: () => getDuel(duelId as string),
    enabled: Boolean(duelId),
  });
}
