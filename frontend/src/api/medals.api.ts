import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export type MedalType = 'MANUAL' | 'AUTO';

export type MedalDefinition = {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  type: MedalType;
  createdAt: string;
  updatedAt: string;
};

export type MedalDefinitionInput = {
  name: string;
  description?: string;
  iconUrl?: string;
  type: MedalType;
};

export type UpdateMedalDefinitionInput = {
  name?: string;
  description?: string;
  iconUrl?: string;
  type?: MedalType;
};

export function getMedalDefinitions(): Promise<MedalDefinition[]> {
  return apiGet<MedalDefinition[]>('/medal-definitions');
}

export function createMedalDefinition(payload: MedalDefinitionInput): Promise<MedalDefinition> {
  return apiPost<MedalDefinition, MedalDefinitionInput>('/medal-definitions', payload);
}

export function updateMedalDefinition(
  id: string,
  payload: UpdateMedalDefinitionInput,
): Promise<MedalDefinition> {
  return apiPatch<MedalDefinition, UpdateMedalDefinitionInput>(`/medal-definitions/${id}`, payload);
}

export function deleteMedalDefinition(id: string): Promise<void> {
  return apiDelete<void>(`/medal-definitions/${id}`);
}
