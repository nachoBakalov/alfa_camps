import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export type CampTeam = {
  id: string;
  campId: string;
  name: string;
  color: string | null;
  logoUrl: string | null;
  teamPoints: number;
  finalPosition: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCampTeamInput = {
  campId: string;
  name: string;
  color?: string;
  logoUrl?: string;
  finalPosition?: number;
  isActive?: boolean;
};

export type UpdateCampTeamInput = {
  name?: string;
  color?: string;
  logoUrl?: string;
  finalPosition?: number;
  isActive?: boolean;
};

export function getCampTeamsByCamp(campId: string): Promise<CampTeam[]> {
  return apiGet<CampTeam[]>(`/camps/${campId}/camp-teams`);
}

export function createCampTeam(payload: CreateCampTeamInput): Promise<CampTeam> {
  return apiPost<CampTeam, CreateCampTeamInput>('/camp-teams', payload);
}

export function updateCampTeam(id: string, payload: UpdateCampTeamInput): Promise<CampTeam> {
  return apiPatch<CampTeam, UpdateCampTeamInput>(`/camp-teams/${id}`, payload);
}

export function deleteCampTeam(id: string): Promise<void> {
  return apiDelete<void>(`/camp-teams/${id}`);
}

export function cloneCampTeamsFromTemplates(campId: string): Promise<CampTeam[]> {
  return apiPost<CampTeam[], Record<string, never>>(`/camps/${campId}/camp-teams/clone-from-templates`, {});
}
