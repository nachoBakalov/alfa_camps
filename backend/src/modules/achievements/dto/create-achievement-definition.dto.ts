import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { AchievementConditionType } from '../enums/achievement-condition-type.enum';

export class CreateAchievementDefinitionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsEnum(AchievementConditionType)
  conditionType!: AchievementConditionType;

  @IsInt()
  @Min(0)
  threshold!: number;
}
