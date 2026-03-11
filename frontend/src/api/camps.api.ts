import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export type CampStatus = 'DRAFT' | 'ACTIVE' | 'FINISHED';

export type Camp = {
  id: string;
  campTypeId: string;
  title: string;
  year: number;
  startDate: string;
  endDate: string;
  location: string | null;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  status: CampStatus;
  createdBy: string | null;
  finalizedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CampInput = {
  campTypeId: string;
  title: string;
  year: number;
  startDate: string;
  endDate: string;
  location?: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  status?: CampStatus;
};

export function getCamps(): Promise<Camp[]> {
  return apiGet<Camp[]>('/camps');
}

export function getCamp(id: string): Promise<Camp> {
  return apiGet<Camp>(`/camps/${id}`);
}

export function createCamp(payload: CampInput): Promise<Camp> {
  return apiPost<Camp, CampInput>('/camps', payload);
}

export function updateCamp(id: string, payload: CampInput): Promise<Camp> {
  return apiPatch<Camp, CampInput>(`/camps/${id}`, payload);
}

export function deleteCamp(id: string): Promise<void> {
  return apiDelete<void>(`/camps/${id}`);
}
