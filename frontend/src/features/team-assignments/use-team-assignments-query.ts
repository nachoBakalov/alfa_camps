export const teamAssignmentsQueryKey = ['team-assignments'] as const;

export function getTeamAssignmentsByParticipationQueryKey(participationId: string) {
  return [...teamAssignmentsQueryKey, 'history', participationId] as const;
}

export function getCurrentTeamAssignmentQueryKey(participationId: string) {
  return [...teamAssignmentsQueryKey, 'current', participationId] as const;
}
