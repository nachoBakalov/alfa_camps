import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser, type CreateUserInput } from '../../api/users.api';
import { usersQueryKey } from './use-users-query';

export function useUserMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserInput) => createUser(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });

  return {
    createMutation,
  };
}
