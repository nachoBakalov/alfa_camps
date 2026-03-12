import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTeamAssignment, type CreateTeamAssignmentInput } from '../../api/team-assignments.api';
import {
  getCurrentTeamAssignmentQueryKey,
  getTeamAssignmentsByParticipationQueryKey,
  teamAssignmentsQueryKey,
} from './use-team-assignments-query';

export function useTeamAssignmentMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateTeamAssignmentInput) => createTeamAssignment(payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: teamAssignmentsQueryKey });
      await queryClient.invalidateQueries({
        queryKey: getTeamAssignmentsByParticipationQueryKey(variables.participationId),
      });
      await queryClient.invalidateQueries({
        queryKey: getCurrentTeamAssignmentQueryKey(variables.participationId),
      });
    },
  });

  return {
    createMutation,
  };
}
