import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export type Duel = {
  id: string;
  battleId: string;
  playerAParticipationId: string;
  playerBParticipationId: string;
  winnerParticipationId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateDuelInput = {
  battleId: string;
  playerAParticipationId: string;
  playerBParticipationId: string;
  winnerParticipationId?: string;
};

export type UpdateDuelInput = {
  winnerParticipationId?: string;
};

export function getDuelsByBattle(battleId: string): Promise<Duel[]> {
  return apiGet<Duel[]>(`/battles/${battleId}/duels`);
}

export function getDuel(id: string): Promise<Duel> {
  return apiGet<Duel>(`/duels/${id}`);
}

export function createDuel(payload: CreateDuelInput): Promise<Duel> {
  return apiPost<Duel, CreateDuelInput>('/duels', payload);
}

export function updateDuel(id: string, payload: UpdateDuelInput): Promise<Duel> {
  return apiPatch<Duel, UpdateDuelInput>(`/duels/${id}`, payload);
}

export function deleteDuel(id: string): Promise<void> {
  return apiDelete<void>(`/duels/${id}`);
}
