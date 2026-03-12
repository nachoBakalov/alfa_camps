import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export type RankCategory = {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type RankCategoryInput = {
  code: string;
  name: string;
};

export type RankDefinition = {
  id: string;
  categoryId: string;
  name: string | null;
  iconUrl: string | null;
  threshold: number;
  rankOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type RankDefinitionInput = {
  categoryId: string;
  name?: string;
  iconUrl?: string;
  threshold: number;
  rankOrder: number;
};

export type UpdateRankDefinitionInput = {
  name?: string;
  iconUrl?: string;
  threshold?: number;
  rankOrder?: number;
};

export function getRankCategories(): Promise<RankCategory[]> {
  return apiGet<RankCategory[]>('/rank-categories');
}

export function createRankCategory(payload: RankCategoryInput): Promise<RankCategory> {
  return apiPost<RankCategory, RankCategoryInput>('/rank-categories', payload);
}

export function updateRankCategory(id: string, payload: RankCategoryInput): Promise<RankCategory> {
  return apiPatch<RankCategory, RankCategoryInput>(`/rank-categories/${id}`, payload);
}

export function deleteRankCategory(id: string): Promise<void> {
  return apiDelete<void>(`/rank-categories/${id}`);
}

export function getRankDefinitions(): Promise<RankDefinition[]> {
  return apiGet<RankDefinition[]>('/rank-definitions');
}

export function getRankDefinitionsByCategory(categoryId: string): Promise<RankDefinition[]> {
  return apiGet<RankDefinition[]>(`/rank-categories/${categoryId}/rank-definitions`);
}

export function createRankDefinition(payload: RankDefinitionInput): Promise<RankDefinition> {
  return apiPost<RankDefinition, RankDefinitionInput>('/rank-definitions', payload);
}

export function updateRankDefinition(
  id: string,
  payload: UpdateRankDefinitionInput,
): Promise<RankDefinition> {
  return apiPatch<RankDefinition, UpdateRankDefinitionInput>(`/rank-definitions/${id}`, payload);
}

export function deleteRankDefinition(id: string): Promise<void> {
  return apiDelete<void>(`/rank-definitions/${id}`);
}
