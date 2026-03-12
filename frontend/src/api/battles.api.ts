import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export type BattleType = 'MASS_BATTLE' | 'DUEL_SESSION';
export type BattleSession = 'MORNING' | 'AFTERNOON' | 'EVENING';
export type BattleStatus = 'DRAFT' | 'COMPLETED' | 'CANCELLED';

export type Battle = {
  id: string;
  campId: string;
  title: string;
  battleType: BattleType;
  battleDate: string;
  session: BattleSession | null;
  winningTeamId: string | null;
  status: BattleStatus;
  notes: string | null;
  completedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateBattleInput = {
  campId: string;
  title: string;
  battleType: BattleType;
  battleDate: string;
  session?: BattleSession;
  winningTeamId?: string;
  notes?: string;
};

export type UpdateBattleInput = {
  title?: string;
  battleType?: BattleType;
  battleDate?: string;
  session?: BattleSession;
  winningTeamId?: string;
  status?: BattleStatus;
  notes?: string;
};

export function getBattlesByCamp(campId: string): Promise<Battle[]> {
  return apiGet<Battle[]>(`/camps/${campId}/battles`);
}

export function getBattle(id: string): Promise<Battle> {
  return apiGet<Battle>(`/battles/${id}`);
}

export function createBattle(payload: CreateBattleInput): Promise<Battle> {
  return apiPost<Battle, CreateBattleInput>('/battles', payload);
}

export function updateBattle(id: string, payload: UpdateBattleInput): Promise<Battle> {
  return apiPatch<Battle, UpdateBattleInput>(`/battles/${id}`, payload);
}

export function deleteBattle(id: string): Promise<void> {
  return apiDelete<void>(`/battles/${id}`);
}
