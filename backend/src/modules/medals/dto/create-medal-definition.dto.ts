import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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
}
