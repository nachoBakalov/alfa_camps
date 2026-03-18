import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCampTeamPointAdjustment,
  type CreateCampTeamPointAdjustmentInput,
  getCampTeamPointAdjustmentsByTeam,
} from '../../api/camp-team-point-adjustments.api';
import { campTeamsQueryKey, getCampTeamsByCampQueryKey } from './use-camp-teams-query';

export const campTeamPointAdjustmentsQueryKey = ['camp-team-point-adjustments'] as const;

export function getCampTeamPointAdjustmentsByTeamQueryKey(teamId: string) {
  return [...campTeamPointAdjustmentsQueryKey, 'team', teamId] as const;
}

export function useCampTeamPointAdjustmentsByTeamQuery(teamId?: string, enabled = true) {
  return useQuery({
    queryKey: teamId
      ? getCampTeamPointAdjustmentsByTeamQueryKey(teamId)
      : [...campTeamPointAdjustmentsQueryKey, 'missing-team-id'],
    queryFn: () => getCampTeamPointAdjustmentsByTeam(teamId as string),
    enabled: Boolean(teamId) && enabled,
  });
}

export function useCreateCampTeamPointAdjustmentMutation(campId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCampTeamPointAdjustmentInput) => createCampTeamPointAdjustment(payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: campTeamsQueryKey });
      await queryClient.invalidateQueries({
        queryKey: getCampTeamPointAdjustmentsByTeamQueryKey(variables.campTeamId),
      });

      if (campId) {
        await queryClient.invalidateQueries({ queryKey: getCampTeamsByCampQueryKey(campId) });
      }
    },
  });
}
