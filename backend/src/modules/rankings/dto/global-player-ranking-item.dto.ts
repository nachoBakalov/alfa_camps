export class GlobalPlayerRankingItemDto {
  playerId!: string;
  firstName!: string;
  lastName!: string | null;
  nickname!: string | null;
  avatarUrl!: string | null;
  points!: number;
  kills!: number;
  survivals!: number;
}
