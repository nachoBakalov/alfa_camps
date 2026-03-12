import { apiGet, apiPost } from './client';

export type CampParticipation = {
  id: string;
  campId: string;
  playerId: string;
  kills: number;
  knifeKills: number;
  survivals: number;
  duelWins: number;
  massBattleWins: number;
  points: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateCampParticipationInput = {
  campId: string;
  playerId: string;
};

export function getParticipationsByCamp(campId: string): Promise<CampParticipation[]> {
  return apiGet<CampParticipation[]>(`/camps/${campId}/participations`);
}

export function createParticipation(payload: CreateCampParticipationInput): Promise<CampParticipation> {
  return apiPost<CampParticipation, CreateCampParticipationInput>('/camp-participations', payload);
}
