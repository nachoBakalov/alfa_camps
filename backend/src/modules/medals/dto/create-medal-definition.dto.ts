import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { MedalAutoAwardConditionType } from '../enums/medal-auto-award-condition-type.enum';
import { MedalType } from '../enums/medal-type.enum';

export class CreateMedalDefinitionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsEnum(MedalType)
  type!: MedalType;

  @IsEnum(MedalAutoAwardConditionType)
  @IsOptional()
  conditionType?: MedalAutoAwardConditionType;

  @IsInt()
  @Min(0)
  @IsOptional()
  threshold?: number;
}
