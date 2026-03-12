import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createMedalDefinition,
  deleteMedalDefinition,
  type MedalDefinitionInput,
  updateMedalDefinition,
  type UpdateMedalDefinitionInput,
} from '../../api/medals.api';
import { medalDefinitionsQueryKey } from './use-medals-query';

export function useMedalMutations() {
  const queryClient = useQueryClient();

  const invalidateMedalDefinitions = async () => {
    await queryClient.invalidateQueries({ queryKey: medalDefinitionsQueryKey });
  };

  const createMutation = useMutation({
    mutationFn: (payload: MedalDefinitionInput) => createMedalDefinition(payload),
    onSuccess: invalidateMedalDefinitions,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMedalDefinitionInput }) =>
      updateMedalDefinition(id, payload),
    onSuccess: invalidateMedalDefinitions,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMedalDefinition(id),
    onSuccess: invalidateMedalDefinitions,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
