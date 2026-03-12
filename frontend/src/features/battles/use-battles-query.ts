import { useQuery } from '@tanstack/react-query';
import { getBattle, getBattlesByCamp } from '../../api/battles.api';

export const battlesQueryKey = ['battles'] as const;

export function getBattlesByCampQueryKey(campId: string) {
  return [...battlesQueryKey, 'camp', campId] as const;
}

export function getBattleQueryKey(battleId: string) {
  return [...battlesQueryKey, battleId] as const;
}

export function useBattlesByCampQuery(campId?: string) {
  return useQuery({
    queryKey: campId ? getBattlesByCampQueryKey(campId) : [...battlesQueryKey, 'missing-camp-id'],
    queryFn: () => getBattlesByCamp(campId as string),
    enabled: Boolean(campId),
  });
}

export function useBattleQuery(battleId?: string) {
  return useQuery({
    queryKey: battleId ? getBattleQueryKey(battleId) : [...battlesQueryKey, 'missing-battle-id'],
    queryFn: () => getBattle(battleId as string),
    enabled: Boolean(battleId),
  });
}
