import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  cloneCampTeamsFromTemplates,
  createCampTeam,
  deleteCampTeam,
  type CreateCampTeamInput,
  type UpdateCampTeamInput,
  updateCampTeam,
} from '../../api/camp-teams.api';
import { campTeamsQueryKey, getCampTeamsByCampQueryKey } from './use-camp-teams-query';

export function useCampTeamMutations(campId?: string) {
  const queryClient = useQueryClient();

  async function invalidateCampTeamQueries(targetCampId: string) {
    await queryClient.invalidateQueries({ queryKey: campTeamsQueryKey });
    await queryClient.invalidateQueries({ queryKey: getCampTeamsByCampQueryKey(targetCampId) });
  }

  const createMutation = useMutation({
    mutationFn: (payload: CreateCampTeamInput) => createCampTeam(payload),
    onSuccess: async (_, variables) => {
      await invalidateCampTeamQueries(variables.campId);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCampTeamInput }) => updateCampTeam(id, payload),
    onSuccess: async () => {
      if (campId) {
        await invalidateCampTeamQueries(campId);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCampTeam(id),
    onSuccess: async () => {
      if (campId) {
        await invalidateCampTeamQueries(campId);
      }
    },
  });

  const cloneFromTemplatesMutation = useMutation({
    mutationFn: (targetCampId: string) => cloneCampTeamsFromTemplates(targetCampId),
    onSuccess: async (_, targetCampId) => {
      await invalidateCampTeamQueries(targetCampId);
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    cloneFromTemplatesMutation,
  };
}
