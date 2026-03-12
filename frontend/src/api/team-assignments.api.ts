import { apiGet, apiPost } from './client';

export type TeamAssignment = {
  id: string;
  participationId: string;
  teamId: string;
  assignedAt: string;
  assignedBy: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTeamAssignmentInput = {
  participationId: string;
  teamId: string;
  assignedAt?: string;
  note?: string;
};

export function getTeamAssignmentsByParticipation(participationId: string): Promise<TeamAssignment[]> {
  return apiGet<TeamAssignment[]>(`/camp-participations/${participationId}/team-assignments`);
}

export function getCurrentTeamAssignmentByParticipation(
  participationId: string,
): Promise<TeamAssignment | null> {
  return apiGet<TeamAssignment | null>(`/camp-participations/${participationId}/current-team-assignment`);
}

export function createTeamAssignment(payload: CreateTeamAssignmentInput): Promise<TeamAssignment> {
  return apiPost<TeamAssignment, CreateTeamAssignmentInput>('/team-assignments', payload);
}
