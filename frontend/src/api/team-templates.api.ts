import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export type TeamTemplate = {
  id: string;
  campTypeId: string;
  name: string;
  color: string | null;
  logoUrl: string | null;
  sortOrder: number | null;
  createdAt: string;
};

export type TeamTemplateInput = {
  campTypeId: string;
  name: string;
  color?: string;
  logoUrl?: string;
  sortOrder?: number;
};

export function getTeamTemplates(): Promise<TeamTemplate[]> {
  return apiGet<TeamTemplate[]>('/team-templates');
}

export function getTeamTemplatesByCampType(campTypeId: string): Promise<TeamTemplate[]> {
  return apiGet<TeamTemplate[]>(`/camp-types/${campTypeId}/team-templates`);
}

export function createTeamTemplate(payload: TeamTemplateInput): Promise<TeamTemplate> {
  return apiPost<TeamTemplate, TeamTemplateInput>('/team-templates', payload);
}

export function updateTeamTemplate(id: string, payload: TeamTemplateInput): Promise<TeamTemplate> {
  return apiPatch<TeamTemplate, TeamTemplateInput>(`/team-templates/${id}`, payload);
}

export function deleteTeamTemplate(id: string): Promise<void> {
  return apiDelete<void>(`/team-templates/${id}`);
}
