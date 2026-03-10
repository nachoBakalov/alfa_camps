import { CampStatus } from '../../camps/enums/camp-status.enum';
import { PlayerProfileAchievementItemDto } from './player-profile-achievement-item.dto';
import { PlayerProfileCurrentTeamDto } from './player-profile-current-team.dto';
import { PlayerProfileMedalItemDto } from './player-profile-medal-item.dto';
import { PlayerProfileRankItemDto } from './player-profile-rank-item.dto';

export class PlayerProfileParticipationStatsDto {
  points!: number;
  kills!: number;
  knifeKills!: number;
  survivals!: number;
  duelWins!: number;
  massBattleWins!: number;
}

export class PlayerProfileParticipationItemDto {
  participationId!: string;
  campId!: string;
  campTitle!: string;
  campYear!: number;
  campStatus!: CampStatus;
  campTypeId!: string;
  campTypeName!: string;
  stats!: PlayerProfileParticipationStatsDto;
  currentTeam!: PlayerProfileCurrentTeamDto | null;
  ranks!: PlayerProfileRankItemDto[];
  achievements!: PlayerProfileAchievementItemDto[];
  medals!: PlayerProfileMedalItemDto[];
}
