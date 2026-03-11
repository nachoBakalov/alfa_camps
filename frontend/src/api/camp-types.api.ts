import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export type CampType = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CampTypeInput = {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
};

export function getCampTypes(): Promise<CampType[]> {
  return apiGet<CampType[]>('/camp-types');
}

export function createCampType(payload: CampTypeInput): Promise<CampType> {
  return apiPost<CampType, CampTypeInput>('/camp-types', payload);
}

export function updateCampType(id: string, payload: CampTypeInput): Promise<CampType> {
  return apiPatch<CampType, CampTypeInput>(`/camp-types/${id}`, payload);
}

export function deleteCampType(id: string): Promise<void> {
  return apiDelete<void>(`/camp-types/${id}`);
}
