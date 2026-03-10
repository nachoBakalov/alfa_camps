import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { AchievementConditionType } from '../enums/achievement-condition-type.enum';

export class UpdateAchievementDefinitionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsEnum(AchievementConditionType)
  @IsOptional()
  conditionType?: AchievementConditionType;

  @IsInt()
  @Min(0)
  @IsOptional()
  threshold?: number;
}
