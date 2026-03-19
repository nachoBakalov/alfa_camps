import { apiGet } from './client';

export type CampPublicDetailsCampType = {
  campTypeId: string;
  campTypeName: string;
  campTypeSlug: string;
  campTypeLogoUrl: string | null;
  campTypeCoverImageUrl: string | null;
};

export type CampPublicDetails = {
  campId: string;
  title: string;
  year: number;
  startDate: string;
  endDate: string;
  location: string | null;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'FINISHED';
  finalizedAt: string | null;
  campType: CampPublicDetailsCampType;
};

export type CampPublicTeamItem = {
  teamId: string;
  name: string;
  color: string | null;
  logoUrl: string | null;
  teamPoints: number;
  finalPosition: number | null;
  isActive: boolean;
};

export type CampPublicParticipantCurrentTeam = {
  teamId: string;
  name: string;
  color: string | null;
  logoUrl: string | null;
};

export type CampPublicParticipantItem = {
  participationId: string;
  playerId: string;
  firstName: string;
  lastName: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  points: number;
  kills: number;
  knifeKills: number;
  survivals: number;
  duelWins: number;
  massBattleWins: number;
  currentTeam: CampPublicParticipantCurrentTeam | null;
};

export function getCampPublicDetails(campId: string): Promise<CampPublicDetails> {
  return apiGet<CampPublicDetails>(`/camps/${campId}/public`);
}

export function getCampPublicTeams(campId: string): Promise<CampPublicTeamItem[]> {
  return apiGet<CampPublicTeamItem[]>(`/camps/${campId}/public/teams`);
}

export function getCampPublicParticipants(campId: string): Promise<CampPublicParticipantItem[]> {
  return apiGet<CampPublicParticipantItem[]>(`/camps/${campId}/public/participants`);
}
