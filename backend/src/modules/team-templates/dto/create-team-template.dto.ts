import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTeamTemplateDto {
  @IsUUID()
  campTypeId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
