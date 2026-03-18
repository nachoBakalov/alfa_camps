import { apiGet, apiPost } from './client';

export type CampTeamPointAdjustment = {
  id: string;
  campTeamId: string;
  delta: number;
  reason: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCampTeamPointAdjustmentInput = {
  campTeamId: string;
  delta: number;
  reason?: string;
};

export function createCampTeamPointAdjustment(
  payload: CreateCampTeamPointAdjustmentInput,
): Promise<CampTeamPointAdjustment> {
  return apiPost<CampTeamPointAdjustment, CreateCampTeamPointAdjustmentInput>(
    '/camp-team-point-adjustments',
    payload,
  );
}

export function getCampTeamPointAdjustmentsByTeam(
  teamId: string,
): Promise<CampTeamPointAdjustment[]> {
  return apiGet<CampTeamPointAdjustment[]>(`/camp-teams/${teamId}/point-adjustments`);
}
