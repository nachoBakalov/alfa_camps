import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MedalType } from '../enums/medal-type.enum';

export class UpdateMedalDefinitionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsEnum(MedalType)
  @IsOptional()
  type?: MedalType;
}
