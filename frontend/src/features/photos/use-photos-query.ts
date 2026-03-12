import { useQuery } from '@tanstack/react-query';
import { getPhotosByCamp, getPhotosByPlayer, getPhotosByTeam } from '../../api/photos.api';

export type PhotoTargetType = 'camp' | 'team' | 'player';

export const photosQueryKey = ['photos'] as const;

export function getPhotosByCampQueryKey(campId: string) {
  return [...photosQueryKey, 'camp', campId] as const;
}

export function getPhotosByTeamQueryKey(teamId: string) {
  return [...photosQueryKey, 'team', teamId] as const;
}

export function getPhotosByPlayerQueryKey(playerId: string) {
  return [...photosQueryKey, 'player', playerId] as const;
}

export function usePhotosQuery(targetType?: PhotoTargetType, targetId?: string) {
  return useQuery({
    queryKey: [
      ...photosQueryKey,
      targetType ?? 'none',
      targetId ?? 'missing-id',
    ],
    queryFn: async () => {
      if (!targetType || !targetId) {
        return [];
      }

      if (targetType === 'camp') {
        return getPhotosByCamp(targetId);
      }

      if (targetType === 'team') {
        return getPhotosByTeam(targetId);
      }

      return getPhotosByPlayer(targetId);
    },
    enabled: Boolean(targetType && targetId),
  });
}
