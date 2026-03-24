import { CampPublicCurrentTeamDto } from './camp-public-current-team.dto';
import { CampPublicParticipantMedalItemDto } from './camp-public-participant-medal-item.dto';

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
  medals!: CampPublicParticipantMedalItemDto[];
}
