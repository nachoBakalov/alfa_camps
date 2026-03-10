import { PlayerProfileParticipationItemDto } from './player-profile-participation-item.dto';

export class PlayerProfileResponseDto {
  playerId!: string;
  firstName!: string;
  lastName!: string | null;
  nickname!: string | null;
  avatarUrl!: string | null;
  isActive!: boolean;
  totalPoints!: number;
  totalKills!: number;
  totalKnifeKills!: number;
  totalSurvivals!: number;
  totalDuelWins!: number;
  totalMassBattleWins!: number;
  totalParticipations!: number;
  participations!: PlayerProfileParticipationItemDto[];
}
