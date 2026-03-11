import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTeamTemplate,
  deleteTeamTemplate,
  type TeamTemplateInput,
  updateTeamTemplate,
} from '../../api/team-templates.api';
import { teamTemplatesQueryKey } from './use-team-templates-query';

export function useTeamTemplateMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: TeamTemplateInput) => createTeamTemplate(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: teamTemplatesQueryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TeamTemplateInput }) =>
      updateTeamTemplate(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: teamTemplatesQueryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTeamTemplate(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: teamTemplatesQueryKey });
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
