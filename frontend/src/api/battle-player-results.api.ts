import { apiGet, apiPatch, apiPost } from './client';

export type BattlePlayerResult = {
  id: string;
  battleId: string;
  participationId: string;
  teamId: string;
  kills: number;
  knifeKills: number;
  survived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateBattlePlayerResultInput = {
  battleId: string;
  participationId: string;
  teamId: string;
  kills?: number;
  knifeKills?: number;
  survived?: boolean;
};

export type UpdateBattlePlayerResultInput = {
  teamId?: string;
  kills?: number;
  knifeKills?: number;
  survived?: boolean;
};

export function getBattlePlayerResultsByBattle(battleId: string): Promise<BattlePlayerResult[]> {
  return apiGet<BattlePlayerResult[]>(`/battles/${battleId}/player-results`);
}

export function createBattlePlayerResult(
  payload: CreateBattlePlayerResultInput,
): Promise<BattlePlayerResult> {
  return apiPost<BattlePlayerResult, CreateBattlePlayerResultInput>('/battle-player-results', payload);
}

export function updateBattlePlayerResult(
  id: string,
  payload: UpdateBattlePlayerResultInput,
): Promise<BattlePlayerResult> {
  return apiPatch<BattlePlayerResult, UpdateBattlePlayerResultInput>(`/battle-player-results/${id}`, payload);
}
