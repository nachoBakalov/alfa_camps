import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export type AchievementConditionType = 'KILLS' | 'SURVIVALS' | 'DUEL_WINS' | 'POINTS';

export type AchievementDefinition = {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  conditionType: AchievementConditionType;
  threshold: number;
  createdAt: string;
  updatedAt: string;
};

export type AchievementDefinitionInput = {
  name: string;
  description?: string;
  iconUrl?: string;
  conditionType: AchievementConditionType;
  threshold: number;
};

export type UpdateAchievementDefinitionInput = {
  name?: string;
  description?: string;
  iconUrl?: string;
  conditionType?: AchievementConditionType;
  threshold?: number;
};

export function getAchievementDefinitions(): Promise<AchievementDefinition[]> {
  return apiGet<AchievementDefinition[]>('/achievement-definitions');
}

export function createAchievementDefinition(
  payload: AchievementDefinitionInput,
): Promise<AchievementDefinition> {
  return apiPost<AchievementDefinition, AchievementDefinitionInput>('/achievement-definitions', payload);
}

export function updateAchievementDefinition(
  id: string,
  payload: UpdateAchievementDefinitionInput,
): Promise<AchievementDefinition> {
  return apiPatch<AchievementDefinition, UpdateAchievementDefinitionInput>(`/achievement-definitions/${id}`, payload);
}

export function deleteAchievementDefinition(id: string): Promise<void> {
  return apiDelete<void>(`/achievement-definitions/${id}`);
}
