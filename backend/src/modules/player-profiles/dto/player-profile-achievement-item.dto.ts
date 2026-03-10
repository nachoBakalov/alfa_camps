import { AchievementConditionType } from '../../achievements/enums/achievement-condition-type.enum';

export class PlayerProfileAchievementItemDto {
  achievementId!: string;
  name!: string;
  description!: string | null;
  iconUrl!: string | null;
  conditionType!: AchievementConditionType;
  threshold!: number;
  unlockedAt!: Date;
}
