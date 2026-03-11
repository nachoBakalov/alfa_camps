import { useQuery } from '@tanstack/react-query';
import { getPlayer, getPlayers } from '../../api/players.api';

export const playersQueryKey = ['players'] as const;

export function getPlayerQueryKey(playerId: string) {
  return [...playersQueryKey, playerId] as const;
}

export function usePlayersQuery(search?: string) {
  const normalizedSearch = search?.trim() ?? '';

  return useQuery({
    queryKey: [...playersQueryKey, normalizedSearch || 'all'],
    queryFn: () => getPlayers({ q: normalizedSearch || undefined }),
  });
}

export function usePlayerQuery(playerId?: string) {
  return useQuery({
    queryKey: playerId ? getPlayerQueryKey(playerId) : [...playersQueryKey, 'missing-id'],
    queryFn: () => getPlayer(playerId as string),
    enabled: Boolean(playerId),
  });
}
