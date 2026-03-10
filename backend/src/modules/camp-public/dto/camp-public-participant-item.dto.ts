import { CampPublicCurrentTeamDto } from './camp-public-current-team.dto';

export class CampPublicParticipantItemDto {
  participationId!: string;
  playerId!: string;
  firstName!: string;
  lastName!: string | null;
  nickname!: string | null;
  avatarUrl!: string | null;
  points!: number;
  kills!: number;
  knifeKills!: number;
  survivals!: number;
  duelWins!: number;
  massBattleWins!: number;
  currentTeam!: CampPublicCurrentTeamDto | null;
}
