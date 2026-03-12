import { apiGet } from './client';

export type PlayerRankingItem = {
  participationId: string;
  playerId: string;
  firstName: string;
  lastName: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  campId: string;
  points: number;
  kills: number;
  knifeKills: number;
  survivals: number;
  duelWins: number;
  massBattleWins: number;
};

export type TeamStandingItem = {
  teamId: string;
  name: string;
  color: string | null;
  logoUrl: string | null;
  teamPoints: number;
  finalPosition: number | null;
  isActive: boolean;
};

function toLimitQuery(limit?: number): string {
  if (limit === undefined) {
    return '';
  }

  return `?limit=${encodeURIComponent(limit)}`;
}

export function getCampPointsRanking(campId: string, limit?: number): Promise<PlayerRankingItem[]> {
  return apiGet<PlayerRankingItem[]>(`/camps/${campId}/rankings/points${toLimitQuery(limit)}`);
}

export function getCampKillsRanking(campId: string, limit?: number): Promise<PlayerRankingItem[]> {
  return apiGet<PlayerRankingItem[]>(`/camps/${campId}/rankings/kills${toLimitQuery(limit)}`);
}

export function getCampSurvivalsRanking(campId: string, limit?: number): Promise<PlayerRankingItem[]> {
  return apiGet<PlayerRankingItem[]>(`/camps/${campId}/rankings/survivals${toLimitQuery(limit)}`);
}

export function getCampTeamStandings(campId: string): Promise<TeamStandingItem[]> {
  return apiGet<TeamStandingItem[]>(`/camps/${campId}/team-standings`);
}
