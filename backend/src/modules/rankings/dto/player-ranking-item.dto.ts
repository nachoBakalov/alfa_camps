export class PlayerRankingItemDto {
  participationId!: string;
  playerId!: string;
  firstName!: string;
  lastName!: string | null;
  nickname!: string | null;
  avatarUrl!: string | null;
  campId!: string;
  points!: number;
  kills!: number;
  knifeKills!: number;
  survivals!: number;
  duelWins!: number;
  massBattleWins!: number;
}
