export class PlayerProfileRankItemDto {
  categoryId!: string;
  categoryCode!: string;
  categoryName!: string;
  rankDefinitionId!: string;
  rankName!: string | null;
  iconUrl!: string | null;
  threshold!: number;
  rankOrder!: number;
  unlockedAt!: Date;
}
